WITH overrides(company_index, source_customer, full_address_raw, street, building_no, postal_code, city) AS (
    VALUES
        ('469', 'Café des Amis', 'Nordstrasse 88, 8037 Zürich', 'Nordstrasse 88', '88', '8037', 'Zürich'),
        ('503', 'PaRadiesLi', 'Lederbachweg 1, 9620 Lichtensteig', 'Lederbachweg 1', '1', '9620', 'Lichtensteig'),
        ('505', 'Ortimo AG', 'obere Bahnhofstrasse 58, Rapperswil', 'obere Bahnhofstrasse 58', '58', '8640', 'Rapperswil'),
        ('512', 'Restaurant Beke', 'Bertastrasse 16, 8003 Zürich', 'Bertastrasse 16', '16', '8003', 'Zürich')
)
UPDATE customer_addresses a
SET full_address_raw = overrides.full_address_raw,
    street = overrides.street,
    building_no = overrides.building_no,
    postal_code = overrides.postal_code,
    city = overrides.city,
    validation_status = 'PENDING',
    validation_source = 'DELIVERY_NOTE_OVERRIDE_FROM_' || overrides.source_customer,
    validated_at = NULL,
    needs_delivery_address_review = FALSE,
    delivery_address_review_reason = NULL,
    updated_at = NOW()
FROM customers c
JOIN overrides ON overrides.company_index = c.company_index
WHERE a.customer_id = c.id
  AND a.address_type = 'DELIVERY'
  AND a.is_primary_delivery = TRUE;
