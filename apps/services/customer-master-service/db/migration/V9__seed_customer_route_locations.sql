CREATE UNIQUE INDEX IF NOT EXISTS uq_route_locations_customer
    ON route_locations(customer_id)
    WHERE location_type = 'CUSTOMER';

CREATE UNIQUE INDEX IF NOT EXISTS uq_route_locations_depot
    ON route_locations(depot_id)
    WHERE location_type = 'DEPOT';

WITH latest_customer_geocodes AS (
    SELECT DISTINCT ON (a.customer_id)
           a.customer_id,
           c.name,
           g.latitude,
           g.longitude
    FROM customers c
    JOIN customer_addresses a ON a.customer_id = c.id
        AND a.address_type = 'DELIVERY'
        AND a.is_primary_delivery = TRUE
        AND a.validation_status = 'VALIDATED'
    JOIN customer_geocodes g ON g.address_id = a.id
        AND g.geocode_status = 'OK'
        AND g.latitude IS NOT NULL
        AND g.longitude IS NOT NULL
    WHERE c.is_active = TRUE
    ORDER BY a.customer_id, g.created_at DESC
)
UPDATE route_locations rl
SET name = latest_customer_geocodes.name,
    latitude = latest_customer_geocodes.latitude,
    longitude = latest_customer_geocodes.longitude,
    updated_at = NOW()
FROM latest_customer_geocodes
WHERE rl.location_type = 'CUSTOMER'
  AND rl.customer_id = latest_customer_geocodes.customer_id;

WITH latest_customer_geocodes AS (
    SELECT DISTINCT ON (a.customer_id)
           a.customer_id,
           c.name,
           g.latitude,
           g.longitude
    FROM customers c
    JOIN customer_addresses a ON a.customer_id = c.id
        AND a.address_type = 'DELIVERY'
        AND a.is_primary_delivery = TRUE
        AND a.validation_status = 'VALIDATED'
    JOIN customer_geocodes g ON g.address_id = a.id
        AND g.geocode_status = 'OK'
        AND g.latitude IS NOT NULL
        AND g.longitude IS NOT NULL
    WHERE c.is_active = TRUE
    ORDER BY a.customer_id, g.created_at DESC
)
INSERT INTO route_locations (location_type, customer_id, name, latitude, longitude)
SELECT 'CUSTOMER',
       latest_customer_geocodes.customer_id,
       latest_customer_geocodes.name,
       latest_customer_geocodes.latitude,
       latest_customer_geocodes.longitude
FROM latest_customer_geocodes
WHERE NOT EXISTS (
    SELECT 1
    FROM route_locations rl
    WHERE rl.location_type = 'CUSTOMER'
      AND rl.customer_id = latest_customer_geocodes.customer_id
);
