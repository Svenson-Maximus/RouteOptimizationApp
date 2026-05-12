ALTER TABLE customer_addresses
    ADD COLUMN IF NOT EXISTS address_type TEXT NOT NULL DEFAULT 'DELIVERY',
    ADD COLUMN IF NOT EXISTS is_primary_delivery BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS needs_delivery_address_review BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS delivery_address_review_reason TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_customer_addresses_address_type'
    ) THEN
        ALTER TABLE customer_addresses
            ADD CONSTRAINT chk_customer_addresses_address_type
            CHECK (address_type IN ('DELIVERY', 'BILLING'));
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_customer_primary_delivery_address
    ON customer_addresses(customer_id)
    WHERE address_type = 'DELIVERY' AND is_primary_delivery = TRUE;

UPDATE customer_addresses
SET address_type = 'DELIVERY',
    is_primary_delivery = TRUE,
    updated_at = NOW()
WHERE address_type IS NULL
   OR address_type = ''
   OR is_primary_delivery IS NULL;

UPDATE customer_addresses a
SET needs_delivery_address_review = TRUE,
    delivery_address_review_reason = 'Delivery note suggests a different physical delivery location than the structured address.',
    updated_at = NOW()
FROM customers c
WHERE c.id = a.customer_id
  AND c.company_index IN ('414', '428', '469', '479', '479-2', '490', '503', '505', '512');
