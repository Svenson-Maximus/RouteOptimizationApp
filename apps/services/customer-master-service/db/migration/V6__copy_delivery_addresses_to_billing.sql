INSERT INTO customer_addresses (
    customer_id,
    full_address_raw,
    street,
    building_no,
    postal_code,
    city,
    country_code,
    address_type,
    is_primary_delivery,
    validation_status,
    validation_source,
    created_at,
    updated_at
)
SELECT
    delivery.customer_id,
    delivery.full_address_raw,
    delivery.street,
    delivery.building_no,
    delivery.postal_code,
    delivery.city,
    delivery.country_code,
    'BILLING',
    FALSE,
    'NOT_REQUIRED',
    'COPIED_FROM_DELIVERY_ADDRESS',
    NOW(),
    NOW()
FROM customer_addresses delivery
WHERE delivery.address_type = 'DELIVERY'
  AND delivery.is_primary_delivery = TRUE
  AND NOT EXISTS (
      SELECT 1
      FROM customer_addresses billing
      WHERE billing.customer_id = delivery.customer_id
        AND billing.address_type = 'BILLING'
  );
