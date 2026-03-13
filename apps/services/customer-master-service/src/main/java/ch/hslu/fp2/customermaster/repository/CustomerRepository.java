package ch.hslu.fp2.customermaster.repository;

import ch.hslu.fp2.customermaster.api.dto.CustomerRowDto;
import ch.hslu.fp2.customermaster.api.dto.GeocodeCandidateDto;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class CustomerRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public CustomerRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<CustomerRowDto> findAllCustomers() {
        String sql = """
                SELECT c.id::text                               AS id,
                       c.company_index                          AS company_index,
                       c.name                                   AS name,
                       COALESCE(a.full_address_raw, '')         AS full_address_raw,
                       COALESCE(a.city, '')                     AS city,
                       COALESCE(a.postal_code, '')              AS postal_code,
                       COALESCE(a.validation_status, 'PENDING') AS validation_status,
                       COALESCE(dp.tour_type, '')               AS tour_type,
                       COALESCE(dp.route_group, '')             AS route_group
                FROM customers c
                JOIN customer_addresses a ON a.customer_id = c.id
                LEFT JOIN customer_delivery_profiles dp ON dp.customer_id = c.id
                ORDER BY c.company_index
                """;

        return jdbc.query(sql, (rs, __) -> new CustomerRowDto(
                rs.getString("id"),
                rs.getString("company_index"),
                rs.getString("name"),
                rs.getString("full_address_raw"),
                rs.getString("city"),
                rs.getString("postal_code"),
                rs.getString("validation_status"),
                blankToNull(rs.getString("tour_type")),
                blankToNull(rs.getString("route_group"))
        ));
    }

    public List<CustomerRowDto> findValidationQueue() {
        return findAllCustomers().stream()
                .filter(c -> !"VALIDATED".equalsIgnoreCase(c.validationStatus()))
                .toList();
    }

    public List<GeocodeCandidateDto> suggestGeocodes(UUID customerId) {
        String sql = """
                SELECT c.company_index,
                       c.name,
                       COALESCE(a.full_address_raw, '') AS full_address_raw,
                       COALESCE(a.city, '')             AS city,
                       COALESCE(a.postal_code, '')      AS postal_code
                FROM customers c
                JOIN customer_addresses a ON a.customer_id = c.id
                WHERE c.id = :customerId
                """;

        Optional<GeocodeCandidateDto> candidate = jdbc.query(sql,
                        new MapSqlParameterSource("customerId", customerId),
                        (rs, __) -> {
                            String fullAddress = rs.getString("full_address_raw");
                            if (fullAddress == null || fullAddress.isBlank()) {
                                fullAddress = String.format("%s, %s %s",
                                        rs.getString("name"),
                                        rs.getString("postal_code"),
                                        rs.getString("city")).trim();
                            }
                            String placeId = "mock-" + shortHash(fullAddress + rs.getString("company_index"));
                            return new GeocodeCandidateDto(placeId, fullAddress, 47.3769, 8.5417, "GOOGLE_MOCK");
                        })
                .stream()
                .findFirst();

        return candidate.map(List::of).orElse(List.of());
    }

    public void confirmGeocode(UUID customerId, GeocodeCandidateDto candidate) {
        String addressIdSql = """
                SELECT id
                FROM customer_addresses
                WHERE customer_id = :customerId
                LIMIT 1
                """;

        UUID addressId = jdbc.queryForObject(addressIdSql,
                new MapSqlParameterSource("customerId", customerId),
                UUID.class);

        if (addressId == null) {
            throw new IllegalStateException("No address found for customer " + customerId);
        }

        String insertGeocodeSql = """
                INSERT INTO customer_geocodes
                    (id, address_id, provider, place_id, formatted_address, latitude, longitude, geocode_status, result_count, raw_response_json, created_at)
                VALUES
                    (gen_random_uuid(), :addressId, :provider, :placeId, :formattedAddress, :latitude, :longitude, 'OK', 1, '{}'::jsonb, :createdAt)
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("addressId", addressId)
                .addValue("provider", candidate.provider())
                .addValue("placeId", candidate.placeId())
                .addValue("formattedAddress", candidate.formattedAddress())
                .addValue("latitude", candidate.latitude())
                .addValue("longitude", candidate.longitude())
                .addValue("createdAt", Instant.now());

        jdbc.update(insertGeocodeSql, params);

        String updateAddressSql = """
                UPDATE customer_addresses
                SET validation_status = 'VALIDATED',
                    validation_source = 'UI_MANUAL_CONFIRM',
                    validated_at = :validatedAt,
                    updated_at = :updatedAt
                WHERE customer_id = :customerId
                """;

        MapSqlParameterSource updateParams = new MapSqlParameterSource()
                .addValue("customerId", customerId)
                .addValue("validatedAt", Instant.now())
                .addValue("updatedAt", Instant.now());

        jdbc.update(updateAddressSql, updateParams);
    }

    private static String shortHash(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest).substring(0, 12);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
