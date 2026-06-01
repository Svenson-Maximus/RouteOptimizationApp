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
                       COALESCE(a.delivery_note, '')              AS delivery_address_note,
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
                       COALESCE(dp.monday_delivery_demand_units, 1)
                                                                  AS monday_delivery_demand_units,
                       COALESCE(dp.monday_pickup_demand_units, 0)
                                                                  AS monday_pickup_demand_units,
                       COALESCE(dp.tuesday_delivery_demand_units, 1)
                                                                  AS tuesday_delivery_demand_units,
                       COALESCE(dp.tuesday_pickup_demand_units, 0)
                                                                  AS tuesday_pickup_demand_units,
                       COALESCE(dp.wednesday_delivery_demand_units, 1)
                                                                  AS wednesday_delivery_demand_units,
                       COALESCE(dp.wednesday_pickup_demand_units, 0)
                                                                  AS wednesday_pickup_demand_units,
                       COALESCE(dp.thursday_delivery_demand_units, 1)
                                                                  AS thursday_delivery_demand_units,
                       COALESCE(dp.thursday_pickup_demand_units, 0)
                                                                  AS thursday_pickup_demand_units,
                       COALESCE(dp.friday_delivery_demand_units, 1)
                                                                  AS friday_delivery_demand_units,
                       COALESCE(dp.friday_pickup_demand_units, 0)
                                                                  AS friday_pickup_demand_units,
                       COALESCE(dp.saturday_delivery_demand_units, 1)
                                                                  AS saturday_delivery_demand_units,
                       COALESCE(dp.saturday_pickup_demand_units, 0)
                                                                  AS saturday_pickup_demand_units,
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
                blankToNull(rs.getString("delivery_address_note")),
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
                rs.getObject("monday_delivery_demand_units", Integer.class),
                rs.getObject("monday_pickup_demand_units", Integer.class),
                rs.getObject("tuesday_delivery_demand_units", Integer.class),
                rs.getObject("tuesday_pickup_demand_units", Integer.class),
                rs.getObject("wednesday_delivery_demand_units", Integer.class),
                rs.getObject("wednesday_pickup_demand_units", Integer.class),
                rs.getObject("thursday_delivery_demand_units", Integer.class),
                rs.getObject("thursday_pickup_demand_units", Integer.class),
                rs.getObject("friday_delivery_demand_units", Integer.class),
                rs.getObject("friday_pickup_demand_units", Integer.class),
                rs.getObject("saturday_delivery_demand_units", Integer.class),
                rs.getObject("saturday_pickup_demand_units", Integer.class),
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
                    needs_delivery_address_review = CASE
                        WHEN :reviewFlagProvided THEN :needsDeliveryAddressReview
                        ELSE needs_delivery_address_review
                    END,
                    delivery_address_review_reason = CASE
                        WHEN NOT :reviewFlagProvided THEN delivery_address_review_reason
                        WHEN :needsDeliveryAddressReview THEN :deliveryAddressReviewReason
                        ELSE NULL
                    END,
                    delivery_note = :deliveryAddressNote,
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
                .addValue("reviewFlagProvided", request.needsDeliveryAddressReview() != null)
                .addValue("needsDeliveryAddressReview", Boolean.TRUE.equals(request.needsDeliveryAddressReview()))
                .addValue("deliveryAddressReviewReason", nullableTrim(request.deliveryAddressReviewReason()))
                .addValue("deliveryAddressNote", nullableTrim(request.deliveryAddressNote()))
                .addValue("updatedAt", nowTimestamp());

        jdbc.update(sql, params);
        updateDeliveryProfile(customerId, request);

        return findAllCustomers().stream()
                .filter(c -> customerId.toString().equals(c.id()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Customer not found after address update: " + customerId));
    }

    private void updateDeliveryProfile(UUID customerId, UpdateCustomerAddressRequest request) {
        if (!hasDeliveryProfileUpdate(request)) {
            return;
        }

        String sql = """
                UPDATE customer_delivery_profiles
                SET tour_type = :tourType,
                    time_window_start = CAST(:timeWindowStart AS time),
                    time_window_end = CAST(:timeWindowEnd AS time),
                    service_time_minutes = :serviceTimeMinutes,
                    monday = :monday,
                    tuesday = :tuesday,
                    wednesday = :wednesday,
                    thursday = :thursday,
                    friday = :friday,
                    saturday = :saturday,
                    monday_delivery_demand_units = :mondayDeliveryDemandUnits,
                    monday_pickup_demand_units = :mondayPickupDemandUnits,
                    tuesday_delivery_demand_units = :tuesdayDeliveryDemandUnits,
                    tuesday_pickup_demand_units = :tuesdayPickupDemandUnits,
                    wednesday_delivery_demand_units = :wednesdayDeliveryDemandUnits,
                    wednesday_pickup_demand_units = :wednesdayPickupDemandUnits,
                    thursday_delivery_demand_units = :thursdayDeliveryDemandUnits,
                    thursday_pickup_demand_units = :thursdayPickupDemandUnits,
                    friday_delivery_demand_units = :fridayDeliveryDemandUnits,
                    friday_pickup_demand_units = :fridayPickupDemandUnits,
                    saturday_delivery_demand_units = :saturdayDeliveryDemandUnits,
                    saturday_pickup_demand_units = :saturdayPickupDemandUnits,
                    delivery_notes = :deliveryNotes,
                    updated_at = :updatedAt
                WHERE customer_id = :customerId
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("customerId", customerId)
                .addValue("tourType", nullableTrim(request.tourType()))
                .addValue("timeWindowStart", nullableTrim(request.timeWindowStart()))
                .addValue("timeWindowEnd", nullableTrim(request.timeWindowEnd()))
                .addValue("serviceTimeMinutes", nonNegative(request.serviceTimeMinutes(), 5))
                .addValue("monday", Boolean.TRUE.equals(request.monday()))
                .addValue("tuesday", Boolean.TRUE.equals(request.tuesday()))
                .addValue("wednesday", Boolean.TRUE.equals(request.wednesday()))
                .addValue("thursday", Boolean.TRUE.equals(request.thursday()))
                .addValue("friday", Boolean.TRUE.equals(request.friday()))
                .addValue("saturday", Boolean.TRUE.equals(request.saturday()))
                .addValue("mondayDeliveryDemandUnits", nonNegative(request.mondayDeliveryDemandUnits(), 1))
                .addValue("mondayPickupDemandUnits", nonNegative(request.mondayPickupDemandUnits(), 0))
                .addValue("tuesdayDeliveryDemandUnits", nonNegative(request.tuesdayDeliveryDemandUnits(), 1))
                .addValue("tuesdayPickupDemandUnits", nonNegative(request.tuesdayPickupDemandUnits(), 0))
                .addValue("wednesdayDeliveryDemandUnits", nonNegative(request.wednesdayDeliveryDemandUnits(), 1))
                .addValue("wednesdayPickupDemandUnits", nonNegative(request.wednesdayPickupDemandUnits(), 0))
                .addValue("thursdayDeliveryDemandUnits", nonNegative(request.thursdayDeliveryDemandUnits(), 1))
                .addValue("thursdayPickupDemandUnits", nonNegative(request.thursdayPickupDemandUnits(), 0))
                .addValue("fridayDeliveryDemandUnits", nonNegative(request.fridayDeliveryDemandUnits(), 1))
                .addValue("fridayPickupDemandUnits", nonNegative(request.fridayPickupDemandUnits(), 0))
                .addValue("saturdayDeliveryDemandUnits", nonNegative(request.saturdayDeliveryDemandUnits(), 1))
                .addValue("saturdayPickupDemandUnits", nonNegative(request.saturdayPickupDemandUnits(), 0))
                .addValue("deliveryNotes", nullableTrim(request.deliveryNotes()))
                .addValue("updatedAt", nowTimestamp());

        jdbc.update(sql, params);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private static String nullableTrim(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static int nonNegative(Integer value, int defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        return Math.max(0, value);
    }

    private static boolean hasDeliveryProfileUpdate(UpdateCustomerAddressRequest request) {
        return request.tourType() != null
                || request.timeWindowStart() != null
                || request.timeWindowEnd() != null
                || request.serviceTimeMinutes() != null
                || request.monday() != null
                || request.tuesday() != null
                || request.wednesday() != null
                || request.thursday() != null
                || request.friday() != null
                || request.saturday() != null
                || request.mondayDeliveryDemandUnits() != null
                || request.mondayPickupDemandUnits() != null
                || request.tuesdayDeliveryDemandUnits() != null
                || request.tuesdayPickupDemandUnits() != null
                || request.wednesdayDeliveryDemandUnits() != null
                || request.wednesdayPickupDemandUnits() != null
                || request.thursdayDeliveryDemandUnits() != null
                || request.thursdayPickupDemandUnits() != null
                || request.fridayDeliveryDemandUnits() != null
                || request.fridayPickupDemandUnits() != null
                || request.saturdayDeliveryDemandUnits() != null
                || request.saturdayPickupDemandUnits() != null
                || request.deliveryNotes() != null;
    }

    private static Timestamp nowTimestamp() {
        return Timestamp.from(Instant.now());
    }
}
