import argparse
import json
import os
from dataclasses import dataclass
from datetime import time, timedelta
from typing import Any

import psycopg
from ortools.constraint_solver import pywrapcp, routing_enums_pb2


ROUTE_START = time(4, 20)
ROUTE_END = time(19, 0)
WEEKDAYS = {"monday", "tuesday", "wednesday", "thursday", "friday", "saturday"}


@dataclass(frozen=True)
class Stop:
    node: int
    location_id: str
    customer_id: str | None
    company_index: str | None
    name: str
    demand_units: int
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
    return parser.parse_args()


def seconds_from_route_start(value: time) -> int:
    base = timedelta(hours=ROUTE_START.hour, minutes=ROUTE_START.minute, seconds=ROUTE_START.second)
    current = timedelta(hours=value.hour, minutes=value.minute, seconds=value.second)
    return int((current - base).total_seconds())


def route_horizon_seconds() -> int:
    return seconds_from_route_start(ROUTE_END)


def load_optimizer_input(conn: psycopg.Connection, weekday: str, matrix_run_id: str) -> OptimizerInput:
    stops = load_stops(conn, weekday)
    vehicles = load_vehicles(conn)
    duration_matrix = load_duration_matrix(conn, matrix_run_id, stops)

    return OptimizerInput(
        matrix_run_id=matrix_run_id,
        weekday=weekday,
        stops=stops,
        vehicles=vehicles,
        duration_matrix=duration_matrix,
    )


def load_stops(conn: psycopg.Connection, weekday: str) -> list[Stop]:
    day_column = psycopg.sql.Identifier(weekday)
    query = psycopg.sql.SQL(
        """
        SELECT rl.id::text AS location_id,
               NULL::text AS customer_id,
               NULL::text AS company_index,
               rl.name AS name,
               0 AS demand_units,
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
               COALESCE(crm.demand_units, 1) AS demand_units,
               COALESCE(dp.service_time_minutes, 5) AS service_time_minutes,
               dp.time_window_start,
               dp.time_window_end,
               1 AS sort_group
        FROM customers c
        JOIN route_locations rl ON rl.customer_id = c.id
            AND rl.location_type = 'CUSTOMER'
        JOIN customer_delivery_profiles dp ON dp.customer_id = c.id
        LEFT JOIN customer_routing_metadata crm ON crm.customer_id = c.id
        WHERE c.is_active = TRUE
          AND dp.{day_column} = TRUE

        ORDER BY sort_group, company_index NULLS FIRST, name
        """
    ).format(day_column=day_column)

    with conn.cursor() as cur:
        cur.execute(query, (ROUTE_START, ROUTE_END))
        rows = cur.fetchall()

    if not rows:
        raise ValueError(f"No route locations found for weekday {weekday}")
    if rows[0][4] != 0:
        raise ValueError("Expected depot to be the first stop")

    stops: list[Stop] = []
    for node, row in enumerate(rows):
        (
            location_id,
            customer_id,
            company_index,
            name,
            demand_units,
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
                demand_units=int(demand_units),
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


def load_duration_matrix(conn: psycopg.Connection, matrix_run_id: str, stops: list[Stop]) -> list[list[int]]:
    location_ids = [stop.location_id for stop in stops]
    location_index = {location_id: idx for idx, location_id in enumerate(location_ids)}
    matrix = [[0 for _ in stops] for _ in stops]

    query = """
        SELECT origin_location_id::text,
               destination_location_id::text,
               duration_seconds
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

    for origin_id, destination_id, duration_seconds in rows:
        if duration_seconds is None:
            raise ValueError(f"Missing duration for {origin_id} -> {destination_id}")
        matrix[location_index[origin_id]][location_index[destination_id]] = int(duration_seconds)

    return matrix


def solve(data: OptimizerInput, time_limit_seconds: int, dropped_stop_penalty: int, allow_waiting: bool) -> dict[str, Any]:
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
        return data.stops[from_node].demand_units

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
    search_parameters.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    search_parameters.local_search_metaheuristic = routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    search_parameters.time_limit.seconds = time_limit_seconds

    solution = routing.SolveWithParameters(search_parameters)
    if solution is None:
        return {
            "status": "NO_SOLUTION",
            "weekday": data.weekday,
            "matrixRunId": data.matrix_run_id,
            "allowWaiting": allow_waiting,
            "routes": [],
            "droppedStops": [],
        }

    return build_result(data, manager, routing, solution, allow_waiting)


def build_result(
    data: OptimizerInput,
    manager: pywrapcp.RoutingIndexManager,
    routing: pywrapcp.RoutingModel,
    solution: pywrapcp.Assignment,
    allow_waiting: bool,
) -> dict[str, Any]:
    time_dimension = routing.GetDimensionOrDie("Time")
    capacity_dimension = routing.GetDimensionOrDie("Capacity")

    routes = []
    served_nodes: set[int] = set()
    total_duration_seconds = 0

    for vehicle_id, vehicle in enumerate(data.vehicles):
        index = routing.Start(vehicle_id)
        route_stops = []

        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            stop = data.stops[node]
            served_nodes.add(node)
            cumul = time_dimension.CumulVar(index)
            capacity = capacity_dimension.CumulVar(index)
            route_stops.append(
                {
                    "node": node,
                    "locationId": stop.location_id,
                    "customerId": stop.customer_id,
                    "companyIndex": stop.company_index,
                    "name": stop.name,
                    "arrivalSeconds": solution.Min(cumul),
                    "arrivalTime": format_route_time(solution.Min(cumul)),
                    "loadBeforeService": solution.Value(capacity),
                    "demandUnits": stop.demand_units,
                    "timeWindow": list(stop.time_window),
                }
            )
            index = solution.Value(routing.NextVar(index))

        end_node = manager.IndexToNode(index)
        end_stop = data.stops[end_node]
        end_cumul = time_dimension.CumulVar(index)
        end_seconds = solution.Min(end_cumul)
        total_duration_seconds += end_seconds
        route_stops.append(
            {
                "node": end_node,
                "locationId": end_stop.location_id,
                "customerId": end_stop.customer_id,
                "companyIndex": end_stop.company_index,
                "name": end_stop.name,
                "arrivalSeconds": end_seconds,
                "arrivalTime": format_route_time(end_seconds),
                "loadBeforeService": solution.Value(capacity_dimension.CumulVar(index)),
                "demandUnits": end_stop.demand_units,
                "timeWindow": list(end_stop.time_window),
            }
        )

        customer_stop_count = sum(1 for route_stop in route_stops if route_stop["customerId"] is not None)
        routes.append(
            {
                "vehicle": vehicle.name,
                "capacityUnits": vehicle.capacity_units,
                "stops": route_stops,
                "customerStopCount": customer_stop_count,
                "returnSeconds": end_seconds,
                "returnTime": format_route_time(end_seconds),
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
                    "timeWindow": list(stop.time_window),
                }
            )

    return {
        "status": "OPTIMAL_OR_FEASIBLE",
        "weekday": data.weekday,
        "matrixRunId": data.matrix_run_id,
        "heuristics": {
            "firstSolutionStrategy": "PATH_CHEAPEST_ARC",
            "localSearchMetaheuristic": "GUIDED_LOCAL_SEARCH",
        },
        "allowWaiting": allow_waiting,
        "objectiveValue": solution.ObjectiveValue(),
        "totalReturnDurationSeconds": total_duration_seconds,
        "eligibleCustomerCount": len(data.stops) - 1,
        "servedCustomerCount": len(data.stops) - 1 - len(dropped),
        "droppedCustomerCount": len(dropped),
        "droppedStops": dropped,
        "routes": routes,
    }


def format_route_time(seconds_after_start: int) -> str:
    total_minutes = ROUTE_START.hour * 60 + ROUTE_START.minute + seconds_after_start // 60
    hours = (total_minutes // 60) % 24
    minutes = total_minutes % 60
    return f"{hours:02d}:{minutes:02d}"


def main() -> None:
    args = parse_args()
    with psycopg.connect(args.database_url) as conn:
        data = load_optimizer_input(conn, args.weekday, args.matrix_run_id)
    result = solve(
        data=data,
        time_limit_seconds=args.time_limit_seconds,
        dropped_stop_penalty=args.dropped_stop_penalty,
        allow_waiting=args.allow_waiting,
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
