package ch.hslu.fp2.customermaster.repository;

import ch.hslu.fp2.customermaster.api.dto.CustomerRowDto;
import ch.hslu.fp2.customermaster.api.dto.GeocodeCandidateDto;
import ch.hslu.fp2.customermaster.api.dto.UpdateCustomerAddressRequest;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
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
                       COALESCE(a.street, '')                   AS street,
                       COALESCE(a.building_no, '')              AS building_no,
                       COALESCE(a.city, '')                     AS city,
                       COALESCE(a.postal_code, '')              AS postal_code,
                       COALESCE(a.address_type, 'DELIVERY')     AS address_type,
                       COALESCE(a.is_primary_delivery, TRUE)    AS is_primary_delivery,
                       COALESCE(a.needs_delivery_address_review, FALSE)
                                                                  AS needs_delivery_address_review,
                       COALESCE(a.delivery_address_review_reason, '')
                                                                  AS delivery_address_review_reason,
                       COALESCE(a.validation_status, 'PENDING') AS validation_status,
                       COALESCE(dp.tour_type, '')               AS tour_type,
                       COALESCE(dp.time_window_start::text, '') AS time_window_start,
                       COALESCE(dp.time_window_end::text, '')   AS time_window_end,
                       COALESCE(dp.raw_time_window_start::text, '')
                                                                  AS raw_time_window_start,
                       COALESCE(dp.raw_time_window_end::text, '')
                                                                  AS raw_time_window_end,
                       COALESCE(dp.time_window_normalization_note, '')
                                                                  AS time_window_normalization_note,
                       dp.service_time_minutes                   AS service_time_minutes,
                       COALESCE(dp.monday, FALSE)                AS monday,
                       COALESCE(dp.tuesday, FALSE)               AS tuesday,
                       COALESCE(dp.wednesday, FALSE)             AS wednesday,
                       COALESCE(dp.thursday, FALSE)              AS thursday,
                       COALESCE(dp.friday, FALSE)                AS friday,
                       COALESCE(dp.saturday, FALSE)              AS saturday,
                       COALESCE(dp.delivery_notes, '')          AS delivery_notes
                FROM customers c
                JOIN customer_addresses a ON a.customer_id = c.id
                    AND a.address_type = 'DELIVERY'
                    AND a.is_primary_delivery = TRUE
                LEFT JOIN customer_delivery_profiles dp ON dp.customer_id = c.id
                ORDER BY c.company_index
                """;

        return jdbc.query(sql, (rs, __) -> new CustomerRowDto(
                rs.getString("id"),
                rs.getString("company_index"),
                rs.getString("name"),
                rs.getString("full_address_raw"),
                blankToNull(rs.getString("street")),
                blankToNull(rs.getString("building_no")),
                rs.getString("city"),
                rs.getString("postal_code"),
                rs.getString("address_type"),
                rs.getBoolean("is_primary_delivery"),
                rs.getBoolean("needs_delivery_address_review"),
                blankToNull(rs.getString("delivery_address_review_reason")),
                rs.getString("validation_status"),
                blankToNull(rs.getString("tour_type")),
                blankToNull(rs.getString("time_window_start")),
                blankToNull(rs.getString("time_window_end")),
                blankToNull(rs.getString("raw_time_window_start")),
                blankToNull(rs.getString("raw_time_window_end")),
                blankToNull(rs.getString("time_window_normalization_note")),
                rs.getObject("service_time_minutes", Integer.class),
                rs.getBoolean("monday"),
                rs.getBoolean("tuesday"),
                rs.getBoolean("wednesday"),
                rs.getBoolean("thursday"),
                rs.getBoolean("friday"),
                rs.getBoolean("saturday"),
                blankToNull(rs.getString("delivery_notes"))
        ));
    }

    public List<CustomerRowDto> findValidationQueue() {
        return findAllCustomers().stream()
                .filter(c -> !"VALIDATED".equalsIgnoreCase(c.validationStatus()))
                .toList();
    }

    public Optional<CustomerGeocodingQuery> findGeocodingQuery(UUID customerId) {
        String sql = """
                SELECT c.company_index,
                       c.name,
                       COALESCE(a.full_address_raw, '') AS full_address_raw,
                       COALESCE(a.street, '')           AS street,
                       COALESCE(a.building_no, '')      AS building_no,
                       COALESCE(a.city, '')             AS city,
                       COALESCE(a.postal_code, '')      AS postal_code,
                       COALESCE(a.country_code, 'CH')   AS country_code
                FROM customers c
                JOIN customer_addresses a ON a.customer_id = c.id
                    AND a.address_type = 'DELIVERY'
                    AND a.is_primary_delivery = TRUE
                WHERE c.id = :customerId
                """;

        return jdbc.query(sql,
                        new MapSqlParameterSource("customerId", customerId),
                        (rs, __) -> new CustomerGeocodingQuery(
                                rs.getString("company_index"),
                                rs.getString("name"),
                                blankToNull(rs.getString("full_address_raw")),
                                blankToNull(rs.getString("street")),
                                blankToNull(rs.getString("building_no")),
                                blankToNull(rs.getString("postal_code")),
                                blankToNull(rs.getString("city")),
                                blankToNull(rs.getString("country_code"))
                        ))
                .stream()
                .findFirst();
    }

    public void confirmGeocode(UUID customerId, GeocodeCandidateDto candidate) {
        String addressIdSql = """
                SELECT id
                FROM customer_addresses
                WHERE customer_id = :customerId
                  AND address_type = 'DELIVERY'
                  AND is_primary_delivery = TRUE
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
                .addValue("createdAt", nowTimestamp());

        jdbc.update(insertGeocodeSql, params);

        String updateAddressSql = """
                UPDATE customer_addresses
                SET validation_status = 'VALIDATED',
                    validation_source = 'UI_MANUAL_CONFIRM',
                    validated_at = :validatedAt,
                    updated_at = :updatedAt
                WHERE customer_id = :customerId
                  AND address_type = 'DELIVERY'
                  AND is_primary_delivery = TRUE
                """;

        MapSqlParameterSource updateParams = new MapSqlParameterSource()
                .addValue("customerId", customerId)
                .addValue("validatedAt", nowTimestamp())
                .addValue("updatedAt", nowTimestamp());

        jdbc.update(updateAddressSql, updateParams);
    }

    public CustomerRowDto updateCustomerAddress(UUID customerId, UpdateCustomerAddressRequest request) {
        String sql = """
                UPDATE customer_addresses
                SET full_address_raw = :fullAddressRaw,
                    street = :street,
                    building_no = :buildingNo,
                    postal_code = :postalCode,
                    city = :city,
                    validation_status = 'PENDING',
                    validation_source = 'UI_ADDRESS_EDIT',
                    validated_at = NULL,
                    updated_at = :updatedAt
                WHERE customer_id = :customerId
                  AND address_type = 'DELIVERY'
                  AND is_primary_delivery = TRUE
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("customerId", customerId)
                .addValue("fullAddressRaw", nullableTrim(request.fullAddressRaw()))
                .addValue("street", nullableTrim(request.street()))
                .addValue("buildingNo", nullableTrim(request.buildingNo()))
                .addValue("postalCode", nullableTrim(request.postalCode()))
                .addValue("city", nullableTrim(request.city()))
                .addValue("updatedAt", nowTimestamp());

        jdbc.update(sql, params);

        return findAllCustomers().stream()
                .filter(c -> customerId.toString().equals(c.id()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Customer not found after address update: " + customerId));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private static String nullableTrim(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static Timestamp nowTimestamp() {
        return Timestamp.from(Instant.now());
    }
}
