ALTER TABLE customer_addresses
    ADD COLUMN IF NOT EXISTS delivery_note TEXT;

ALTER TABLE customer_delivery_profiles
    ADD COLUMN IF NOT EXISTS monday_delivery_demand_units INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS monday_pickup_demand_units INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tuesday_delivery_demand_units INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS tuesday_pickup_demand_units INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS wednesday_delivery_demand_units INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS wednesday_pickup_demand_units INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS thursday_delivery_demand_units INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS thursday_pickup_demand_units INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS friday_delivery_demand_units INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS friday_pickup_demand_units INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS saturday_delivery_demand_units INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS saturday_pickup_demand_units INTEGER NOT NULL DEFAULT 0;

UPDATE customer_addresses a
SET delivery_note = dp.delivery_notes,
    updated_at = NOW()
FROM customer_delivery_profiles dp
WHERE dp.customer_id = a.customer_id
  AND a.address_type = 'DELIVERY'
  AND a.is_primary_delivery = TRUE
  AND a.delivery_note IS NULL
  AND dp.delivery_notes IS NOT NULL;

UPDATE customer_delivery_profiles dp
SET monday_delivery_demand_units = COALESCE(crm.demand_units, monday_delivery_demand_units, 1),
    tuesday_delivery_demand_units = COALESCE(crm.demand_units, tuesday_delivery_demand_units, 1),
    wednesday_delivery_demand_units = COALESCE(crm.demand_units, wednesday_delivery_demand_units, 1),
    thursday_delivery_demand_units = COALESCE(crm.demand_units, thursday_delivery_demand_units, 1),
    friday_delivery_demand_units = COALESCE(crm.demand_units, friday_delivery_demand_units, 1),
    saturday_delivery_demand_units = COALESCE(crm.demand_units, saturday_delivery_demand_units, 1),
    updated_at = NOW()
FROM customer_routing_metadata crm
WHERE crm.customer_id = dp.customer_id
  AND crm.demand_units IS NOT NULL;
