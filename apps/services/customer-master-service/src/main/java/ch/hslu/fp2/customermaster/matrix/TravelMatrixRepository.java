package ch.hslu.fp2.customermaster.matrix;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public class TravelMatrixRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public TravelMatrixRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<RouteLocation> findRouteLocationsForFullMatrix() {
        String sql = """
                SELECT id,
                       location_type,
                       name,
                       latitude,
                       longitude
                FROM route_locations
                ORDER BY CASE WHEN location_type = 'DEPOT' THEN 0 ELSE 1 END,
                         name,
                         id
                """;

        return jdbc.query(sql, (rs, __) -> new RouteLocation(
                rs.getObject("id", UUID.class),
                rs.getString("location_type"),
                rs.getString("name"),
                rs.getBigDecimal("latitude"),
                rs.getBigDecimal("longitude")
        ));
    }

    public UUID createRun(
            String provider,
            Instant departureTime,
            String departureTimeZone,
            String referenceWeekday,
            String travelMode,
            String routingPreference,
            int locationCount
    ) {
        String sql = """
                INSERT INTO travel_matrix_runs
                    (provider, departure_time, departure_time_zone, reference_weekday, travel_mode,
                     origin_count, destination_count, notes)
                VALUES
                    (:provider, :departureTime, :departureTimeZone, :referenceWeekday, :travelMode,
                     :originCount, :destinationCount, :notes)
                RETURNING id
                """;

        Timestamp departureTimestamp = departureTime == null ? null : Timestamp.from(departureTime);
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("provider", provider)
                .addValue("departureTime", departureTimestamp)
                .addValue("departureTimeZone", departureTimeZone)
                .addValue("referenceWeekday", referenceWeekday)
                .addValue("travelMode", travelMode)
                .addValue("originCount", locationCount)
                .addValue("destinationCount", locationCount)
                .addValue("notes", "Full fixed depot/customer route matrix calculated in 10x10 chunks. Routing preference: "
                        + routingPreference + ".");

        return jdbc.queryForObject(sql, params, UUID.class);
    }

    public void insertEntries(UUID matrixRunId, List<RouteMatrixElement> elements) {
        String sql = """
                INSERT INTO travel_matrix_entries
                    (matrix_run_id, origin_location_id, destination_location_id, duration_seconds, distance_meters, status)
                VALUES
                    (:matrixRunId, :originLocationId, :destinationLocationId, :durationSeconds, :distanceMeters, :status)
                ON CONFLICT (matrix_run_id, origin_location_id, destination_location_id)
                DO UPDATE SET duration_seconds = EXCLUDED.duration_seconds,
                              distance_meters = EXCLUDED.distance_meters,
                              status = EXCLUDED.status
                """;

        MapSqlParameterSource[] batch = elements.stream()
                .map(element -> new MapSqlParameterSource()
                        .addValue("matrixRunId", matrixRunId)
                        .addValue("originLocationId", element.originLocationId())
                        .addValue("destinationLocationId", element.destinationLocationId())
                        .addValue("durationSeconds", element.durationSeconds())
                        .addValue("distanceMeters", element.distanceMeters())
                        .addValue("status", element.status()))
                .toArray(MapSqlParameterSource[]::new);

        jdbc.batchUpdate(sql, batch);
    }

    public int countEntries(UUID matrixRunId) {
        String sql = """
                SELECT COUNT(*)
                FROM travel_matrix_entries
                WHERE matrix_run_id = :matrixRunId
                """;

        Integer count = jdbc.queryForObject(
                sql,
                new MapSqlParameterSource("matrixRunId", matrixRunId),
                Integer.class
        );
        return count == null ? 0 : count;
    }

    public void deleteRun(UUID matrixRunId) {
        jdbc.update(
                "DELETE FROM travel_matrix_runs WHERE id = :matrixRunId",
                new MapSqlParameterSource("matrixRunId", matrixRunId)
        );
    }
}
