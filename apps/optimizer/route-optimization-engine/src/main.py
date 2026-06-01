import argparse
import json
import os
from dataclasses import dataclass
from typing import Any

import psycopg
from ortools.constraint_solver import pywrapcp, routing_enums_pb2
from route_time import ROUTE_END, ROUTE_START, format_route_time, route_horizon_seconds, seconds_from_route_start


WEEKDAYS = {"monday", "tuesday", "wednesday", "thursday", "friday", "saturday"}
FIRST_SOLUTION_STRATEGIES = {
    "AUTOMATIC": routing_enums_pb2.FirstSolutionStrategy.AUTOMATIC,
    "PATH_CHEAPEST_ARC": routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC,
    "PATH_MOST_CONSTRAINED_ARC": routing_enums_pb2.FirstSolutionStrategy.PATH_MOST_CONSTRAINED_ARC,
    "SAVINGS": routing_enums_pb2.FirstSolutionStrategy.SAVINGS,
    "PARALLEL_SAVINGS": routing_enums_pb2.FirstSolutionStrategy.PARALLEL_SAVINGS,
    "PARALLEL_CHEAPEST_INSERTION": routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION,
    "LOCAL_CHEAPEST_INSERTION": routing_enums_pb2.FirstSolutionStrategy.LOCAL_CHEAPEST_INSERTION,
    "GLOBAL_CHEAPEST_ARC": routing_enums_pb2.FirstSolutionStrategy.GLOBAL_CHEAPEST_ARC,
}
LOCAL_SEARCH_METAHEURISTICS = {
    "AUTOMATIC": routing_enums_pb2.LocalSearchMetaheuristic.AUTOMATIC,
    "GREEDY_DESCENT": routing_enums_pb2.LocalSearchMetaheuristic.GREEDY_DESCENT,
    "GUIDED_LOCAL_SEARCH": routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH,
    "SIMULATED_ANNEALING": routing_enums_pb2.LocalSearchMetaheuristic.SIMULATED_ANNEALING,
    "TABU_SEARCH": routing_enums_pb2.LocalSearchMetaheuristic.TABU_SEARCH,
}


@dataclass(frozen=True)
class Stop:
    node: int
    location_id: str
    customer_id: str | None
    company_index: str | None
    name: str
    address: str | None
    address_note: str | None
    latitude: float
    longitude: float
    delivery_demand_units: int
    pickup_demand_units: int
    capacity_demand_units: int
    service_time_seconds: int
    time_window: tuple[int, int]


@dataclass(frozen=True)
class Vehicle:
    name: str
    capacity_units: int


@dataclass(frozen=True)
class OptimizerInput:
    matrix_run_id: str
    weekday: str
    stops: list[Stop]
    vehicles: list[Vehicle]
    duration_matrix: list[list[int]]
    distance_matrix: list[list[int]]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Solve Bio-Beck CVRPTW routes from persisted matrix data.")
    parser.add_argument("--weekday", required=True, choices=sorted(WEEKDAYS))
    parser.add_argument("--matrix-run-id", required=True)
    parser.add_argument(
        "--database-url",
        default=os.getenv("DATABASE_URL", "postgresql://fp2:fp2_dev_password@localhost:5432/FocusProject2"),
    )
    parser.add_argument("--time-limit-seconds", type=int, default=30)
    parser.add_argument("--dropped-stop-penalty", type=int, default=100_000)
    parser.add_argument("--allow-waiting", action="store_true")
    parser.add_argument("--first-solution-strategy", default="SAVINGS", choices=sorted(FIRST_SOLUTION_STRATEGIES))
    parser.add_argument("--local-search-metaheuristic", default="GUIDED_LOCAL_SEARCH", choices=sorted(LOCAL_SEARCH_METAHEURISTICS))
    parser.add_argument("--random-seed", type=int)
    return parser.parse_args()


def load_optimizer_input(conn: psycopg.Connection, weekday: str, matrix_run_id: str) -> OptimizerInput:
    stops = load_stops(conn, weekday)
    vehicles = load_vehicles(conn)
    duration_matrix, distance_matrix = load_route_matrices(conn, matrix_run_id, stops)

    return OptimizerInput(
        matrix_run_id=matrix_run_id,
        weekday=weekday,
        stops=stops,
        vehicles=vehicles,
        duration_matrix=duration_matrix,
        distance_matrix=distance_matrix,
    )


def load_stops(conn: psycopg.Connection, weekday: str) -> list[Stop]:
    day_column = psycopg.sql.Identifier(weekday)
    delivery_demand_column = psycopg.sql.Identifier(f"{weekday}_delivery_demand_units")
    pickup_demand_column = psycopg.sql.Identifier(f"{weekday}_pickup_demand_units")
    query = psycopg.sql.SQL(
        """
        SELECT rl.id::text AS location_id,
               NULL::text AS customer_id,
               NULL::text AS company_index,
               rl.name AS name,
               NULL::text AS address,
               NULL::text AS address_note,
               rl.latitude,
               rl.longitude,
               0 AS delivery_demand_units,
               0 AS pickup_demand_units,
               0 AS service_time_minutes,
               %s::time AS time_window_start,
               %s::time AS time_window_end,
               0 AS sort_group
        FROM route_locations rl
        WHERE rl.location_type = 'DEPOT'

        UNION ALL

        SELECT rl.id::text AS location_id,
               c.id::text AS customer_id,
               c.company_index AS company_index,
               c.name AS name,
               COALESCE(
                   NULLIF(a.full_address_raw, ''),
                   concat_ws(' ', NULLIF(a.street, ''), NULLIF(a.building_no, ''), NULLIF(a.postal_code, ''), NULLIF(a.city, ''))
               ) AS address,
               NULLIF(a.delivery_note, '') AS address_note,
               rl.latitude,
               rl.longitude,
               COALESCE(dp.{delivery_demand_column}, crm.demand_units, 1) AS delivery_demand_units,
               COALESCE(dp.{pickup_demand_column}, 0) AS pickup_demand_units,
               COALESCE(dp.service_time_minutes, 5) AS service_time_minutes,
               dp.time_window_start,
               dp.time_window_end,
               1 AS sort_group
        FROM customers c
        JOIN route_locations rl ON rl.customer_id = c.id
            AND rl.location_type = 'CUSTOMER'
        JOIN customer_addresses a ON a.customer_id = c.id
            AND a.address_type = 'DELIVERY'
            AND a.is_primary_delivery = TRUE
        JOIN customer_delivery_profiles dp ON dp.customer_id = c.id
        LEFT JOIN customer_routing_metadata crm ON crm.customer_id = c.id
        WHERE c.is_active = TRUE
          AND dp.{day_column} = TRUE

        ORDER BY sort_group, company_index NULLS FIRST, name
        """
    ).format(
        day_column=day_column,
        delivery_demand_column=delivery_demand_column,
        pickup_demand_column=pickup_demand_column,
    )

    with conn.cursor() as cur:
        cur.execute(query, (ROUTE_START, ROUTE_END))
        rows = cur.fetchall()

    if not rows:
        raise ValueError(f"No route locations found for weekday {weekday}")
    if rows[0][13] != 0:
        raise ValueError("Expected depot to be the first stop")

    stops: list[Stop] = []
    for node, row in enumerate(rows):
        (
            location_id,
            customer_id,
            company_index,
            name,
            address,
            address_note,
            latitude,
            longitude,
            delivery_demand_units,
            pickup_demand_units,
            service_time_minutes,
            time_window_start,
            time_window_end,
            _sort_group,
        ) = row

        start_seconds = max(0, seconds_from_route_start(time_window_start))
        end_seconds = min(route_horizon_seconds(), seconds_from_route_start(time_window_end))
        if start_seconds > end_seconds:
            raise ValueError(f"Invalid normalized time window for {name}: {time_window_start}-{time_window_end}")

        stops.append(
            Stop(
                node=node,
                location_id=location_id,
                customer_id=customer_id,
                company_index=company_index,
                name=name,
                address=address,
                address_note=address_note,
                latitude=float(latitude),
                longitude=float(longitude),
                delivery_demand_units=int(delivery_demand_units),
                pickup_demand_units=int(pickup_demand_units),
                capacity_demand_units=int(delivery_demand_units) + int(pickup_demand_units),
                service_time_seconds=int(service_time_minutes) * 60,
                time_window=(start_seconds, end_seconds),
            )
        )

    return stops


def load_vehicles(conn: psycopg.Connection) -> list[Vehicle]:
    query = """
        SELECT name, capacity_units
        FROM vehicles
        WHERE is_active = TRUE
        ORDER BY name
    """
    with conn.cursor() as cur:
        cur.execute(query)
        rows = cur.fetchall()

    vehicles = [Vehicle(name=row[0], capacity_units=int(row[1])) for row in rows]
    if not vehicles:
        raise ValueError("No active vehicles found")
    return vehicles


def load_route_matrices(conn: psycopg.Connection, matrix_run_id: str, stops: list[Stop]) -> tuple[list[list[int]], list[list[int]]]:
    location_ids = [stop.location_id for stop in stops]
    location_index = {location_id: idx for idx, location_id in enumerate(location_ids)}
    duration_matrix = [[0 for _ in stops] for _ in stops]
    distance_matrix = [[0 for _ in stops] for _ in stops]

    query = """
        SELECT origin_location_id::text,
               destination_location_id::text,
               duration_seconds,
               distance_meters
        FROM travel_matrix_entries
        WHERE matrix_run_id = %s
          AND origin_location_id = ANY(%s::uuid[])
          AND destination_location_id = ANY(%s::uuid[])
    """
    with conn.cursor() as cur:
        cur.execute(query, (matrix_run_id, location_ids, location_ids))
        rows = cur.fetchall()

    expected_entries = len(stops) * len(stops)
    if len(rows) != expected_entries:
        raise ValueError(f"Matrix subset incomplete: expected {expected_entries}, found {len(rows)}")

    for origin_id, destination_id, duration_seconds, distance_meters in rows:
        if duration_seconds is None:
            raise ValueError(f"Missing duration for {origin_id} -> {destination_id}")
        origin_index = location_index[origin_id]
        destination_index = location_index[destination_id]
        duration_matrix[origin_index][destination_index] = int(duration_seconds)
        distance_matrix[origin_index][destination_index] = 0 if distance_meters is None else int(distance_meters)

    return duration_matrix, distance_matrix


def solve(
    data: OptimizerInput,
    time_limit_seconds: int,
    dropped_stop_penalty: int,
    allow_waiting: bool,
    first_solution_strategy: str,
    local_search_metaheuristic: str,
    random_seed: int | None,
) -> dict[str, Any]:
    manager = pywrapcp.RoutingIndexManager(len(data.stops), len(data.vehicles), 0)
    routing = pywrapcp.RoutingModel(manager)

    def time_callback(from_index: int, to_index: int) -> int:
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data.duration_matrix[from_node][to_node] + data.stops[from_node].service_time_seconds

    transit_callback_index = routing.RegisterTransitCallback(time_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    horizon = route_horizon_seconds()
    slack_max = horizon if allow_waiting else 0
    routing.AddDimension(
        transit_callback_index,
        slack_max,
        horizon,
        False,
        "Time",
    )
    time_dimension = routing.GetDimensionOrDie("Time")

    for stop in data.stops:
        index = manager.NodeToIndex(stop.node)
        time_dimension.CumulVar(index).SetRange(stop.time_window[0], stop.time_window[1])

    for vehicle_id in range(len(data.vehicles)):
        start_index = routing.Start(vehicle_id)
        end_index = routing.End(vehicle_id)
        time_dimension.CumulVar(start_index).SetRange(0, horizon)
        time_dimension.CumulVar(end_index).SetRange(0, horizon)
        routing.AddVariableMinimizedByFinalizer(time_dimension.CumulVar(start_index))
        routing.AddVariableMinimizedByFinalizer(time_dimension.CumulVar(end_index))

    def demand_callback(from_index: int) -> int:
        from_node = manager.IndexToNode(from_index)
        return data.stops[from_node].capacity_demand_units

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,
        [vehicle.capacity_units for vehicle in data.vehicles],
        True,
        "Capacity",
    )

    for node in range(1, len(data.stops)):
        routing.AddDisjunction([manager.NodeToIndex(node)], dropped_stop_penalty)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = FIRST_SOLUTION_STRATEGIES[first_solution_strategy]
    search_parameters.local_search_metaheuristic = LOCAL_SEARCH_METAHEURISTICS[local_search_metaheuristic]
    search_parameters.time_limit.seconds = time_limit_seconds
    if random_seed is not None:
        search_parameters.sat_parameters.random_seed = random_seed

    solution = routing.SolveWithParameters(search_parameters)
    if solution is None:
        return {
            "status": "NO_SOLUTION",
            "weekday": data.weekday,
            "matrixRunId": data.matrix_run_id,
            "allowWaiting": allow_waiting,
            "heuristics": {
                "firstSolutionStrategy": first_solution_strategy,
                "localSearchMetaheuristic": local_search_metaheuristic,
                "randomSeed": random_seed,
            },
            "routes": [],
            "droppedStops": [],
        }

    return build_result(
        data,
        manager,
        routing,
        solution,
        allow_waiting,
        first_solution_strategy,
        local_search_metaheuristic,
        random_seed,
    )


def build_result(
    data: OptimizerInput,
    manager: pywrapcp.RoutingIndexManager,
    routing: pywrapcp.RoutingModel,
    solution: pywrapcp.Assignment,
    allow_waiting: bool,
    first_solution_strategy: str,
    local_search_metaheuristic: str,
    random_seed: int | None,
) -> dict[str, Any]:
    time_dimension = routing.GetDimensionOrDie("Time")
    capacity_dimension = routing.GetDimensionOrDie("Capacity")

    routes = []
    served_nodes: set[int] = set()
    total_duration_seconds = 0
    total_route_duration_seconds = 0
    total_distance_meters = 0

    for vehicle_id, vehicle in enumerate(data.vehicles):
        index = routing.Start(vehicle_id)
        route_stops = []
        previous_departure_seconds = None
        previous_travel_seconds = 0

        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            stop = data.stops[node]
            served_nodes.add(node)
            cumul = time_dimension.CumulVar(index)
            capacity = capacity_dimension.CumulVar(index)
            next_index = solution.Value(routing.NextVar(index))
            next_node = manager.IndexToNode(next_index)
            service_start_seconds = solution.Min(cumul)
            arrival_seconds = service_start_seconds
            if previous_departure_seconds is not None:
                arrival_seconds = previous_departure_seconds + previous_travel_seconds
            waiting_at_arrival_seconds = max(0, service_start_seconds - arrival_seconds)
            service_end_seconds = service_start_seconds + stop.service_time_seconds
            travel_to_next_seconds = data.duration_matrix[node][next_node]
            travel_to_next_distance_meters = data.distance_matrix[node][next_node]
            departure_seconds = service_end_seconds
            route_stops.append(
                {
                    "node": node,
                    "locationId": stop.location_id,
                    "customerId": stop.customer_id,
                    "companyIndex": stop.company_index,
                    "name": stop.name,
                    "address": stop.address,
                    "addressNote": stop.address_note,
                    "latitude": stop.latitude,
                    "longitude": stop.longitude,
                    "arrivalSeconds": arrival_seconds,
                    "arrivalTime": format_route_time(arrival_seconds),
                    "serviceStartSeconds": service_start_seconds,
                    "serviceStartTime": format_route_time(service_start_seconds),
                    "serviceTimeSeconds": stop.service_time_seconds,
                    "serviceEndSeconds": service_end_seconds,
                    "serviceEndTime": format_route_time(service_end_seconds),
                    "waitingAtArrivalSeconds": waiting_at_arrival_seconds,
                    "waitingBeforeNextSeconds": 0,
                    "departureSeconds": departure_seconds,
                    "departureTime": format_route_time(departure_seconds),
                    "travelToNextSeconds": travel_to_next_seconds,
                    "travelToNextDistanceMeters": travel_to_next_distance_meters,
                    "loadBeforeService": solution.Value(capacity),
                    "loadAfterService": solution.Value(capacity) + stop.capacity_demand_units,
                    "demandUnits": stop.capacity_demand_units,
                    "deliveryDemandUnits": stop.delivery_demand_units,
                    "pickupDemandUnits": stop.pickup_demand_units,
                    "timeWindow": list(stop.time_window),
                    "timeWindowStart": format_route_time(stop.time_window[0]),
                    "timeWindowEnd": format_route_time(stop.time_window[1]),
                }
            )
            previous_departure_seconds = departure_seconds
            previous_travel_seconds = travel_to_next_seconds
            index = next_index

        end_node = manager.IndexToNode(index)
        end_stop = data.stops[end_node]
        end_cumul = time_dimension.CumulVar(index)
        end_service_start_seconds = solution.Min(end_cumul)
        end_arrival_seconds = end_service_start_seconds
        if previous_departure_seconds is not None:
            end_arrival_seconds = previous_departure_seconds + previous_travel_seconds
        end_waiting_at_arrival_seconds = max(0, end_service_start_seconds - end_arrival_seconds)
        total_duration_seconds += end_service_start_seconds
        route_stops.append(
            {
                "node": end_node,
                "locationId": end_stop.location_id,
                "customerId": end_stop.customer_id,
                "companyIndex": end_stop.company_index,
                "name": end_stop.name,
                "address": end_stop.address,
                "addressNote": end_stop.address_note,
                "latitude": end_stop.latitude,
                "longitude": end_stop.longitude,
                "arrivalSeconds": end_arrival_seconds,
                "arrivalTime": format_route_time(end_arrival_seconds),
                "serviceStartSeconds": end_service_start_seconds,
                "serviceStartTime": format_route_time(end_service_start_seconds),
                "serviceTimeSeconds": end_stop.service_time_seconds,
                "serviceEndSeconds": end_service_start_seconds + end_stop.service_time_seconds,
                "serviceEndTime": format_route_time(end_service_start_seconds + end_stop.service_time_seconds),
                "waitingAtArrivalSeconds": end_waiting_at_arrival_seconds,
                "waitingBeforeNextSeconds": 0,
                "departureSeconds": end_service_start_seconds + end_stop.service_time_seconds,
                "departureTime": format_route_time(end_service_start_seconds + end_stop.service_time_seconds),
                "travelToNextSeconds": 0,
                "travelToNextDistanceMeters": 0,
                "loadBeforeService": solution.Value(capacity_dimension.CumulVar(index)),
                "loadAfterService": solution.Value(capacity_dimension.CumulVar(index)) + end_stop.capacity_demand_units,
                "demandUnits": end_stop.capacity_demand_units,
                "deliveryDemandUnits": end_stop.delivery_demand_units,
                "pickupDemandUnits": end_stop.pickup_demand_units,
                "timeWindow": list(end_stop.time_window),
                "timeWindowStart": format_route_time(end_stop.time_window[0]),
                "timeWindowEnd": format_route_time(end_stop.time_window[1]),
            }
        )

        route_start_seconds = route_stops[0]["departureSeconds"] if route_stops else 0
        route_total_seconds = max(0, end_service_start_seconds - route_start_seconds)
        route_total_distance_meters = sum(stop["travelToNextDistanceMeters"] for stop in route_stops)
        total_route_duration_seconds += route_total_seconds
        total_distance_meters += route_total_distance_meters

        customer_stop_count = sum(1 for route_stop in route_stops if route_stop["customerId"] is not None)
        routes.append(
            {
                "vehicle": vehicle.name,
                "capacityUnits": vehicle.capacity_units,
                "stops": route_stops,
                "customerStopCount": customer_stop_count,
                "returnSeconds": end_service_start_seconds,
                "returnTime": format_route_time(end_service_start_seconds),
                "routeStartSeconds": route_start_seconds,
                "routeStartTime": format_route_time(route_start_seconds),
                "totalRouteSeconds": route_total_seconds,
                "totalDistanceMeters": route_total_distance_meters,
            }
        )

    dropped = []
    for node in range(1, len(data.stops)):
        if routing.IsStart(manager.NodeToIndex(node)) or routing.IsEnd(manager.NodeToIndex(node)):
            continue
        if solution.Value(routing.NextVar(manager.NodeToIndex(node))) == manager.NodeToIndex(node):
            stop = data.stops[node]
            dropped.append(
                {
                    "node": node,
                    "locationId": stop.location_id,
                    "customerId": stop.customer_id,
                    "companyIndex": stop.company_index,
                    "name": stop.name,
                    "address": stop.address,
                    "addressNote": stop.address_note,
                    "latitude": stop.latitude,
                    "longitude": stop.longitude,
                    "demandUnits": stop.capacity_demand_units,
                    "deliveryDemandUnits": stop.delivery_demand_units,
                    "pickupDemandUnits": stop.pickup_demand_units,
                    "serviceTimeSeconds": stop.service_time_seconds,
                    "timeWindow": list(stop.time_window),
                    "timeWindowStart": format_route_time(stop.time_window[0]),
                    "timeWindowEnd": format_route_time(stop.time_window[1]),
                }
            )

    return {
        "status": "OPTIMAL_OR_FEASIBLE",
        "weekday": data.weekday,
        "matrixRunId": data.matrix_run_id,
        "heuristics": {
            "firstSolutionStrategy": first_solution_strategy,
            "localSearchMetaheuristic": local_search_metaheuristic,
            "randomSeed": random_seed,
        },
        "allowWaiting": allow_waiting,
        "objectiveValue": solution.ObjectiveValue(),
        "totalReturnDurationSeconds": total_duration_seconds,
        "totalRouteDurationSeconds": total_route_duration_seconds,
        "totalDistanceMeters": total_distance_meters,
        "eligibleCustomerCount": len(data.stops) - 1,
        "servedCustomerCount": len(data.stops) - 1 - len(dropped),
        "droppedCustomerCount": len(dropped),
        "droppedStops": dropped,
        "routes": routes,
    }


def main() -> None:
    args = parse_args()
    with psycopg.connect(args.database_url) as conn:
        data = load_optimizer_input(conn, args.weekday, args.matrix_run_id)
    result = solve(
        data=data,
        time_limit_seconds=args.time_limit_seconds,
        dropped_stop_penalty=args.dropped_stop_penalty,
        allow_waiting=args.allow_waiting,
        first_solution_strategy=args.first_solution_strategy,
        local_search_metaheuristic=args.local_search_metaheuristic,
        random_seed=args.random_seed,
    )
    print(json.dumps(result, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
