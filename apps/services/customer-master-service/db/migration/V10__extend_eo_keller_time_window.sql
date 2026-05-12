UPDATE customer_delivery_profiles dp
SET time_window_start = '04:20:00',
    time_window_end = '06:00:00',
    time_window_normalization_note = 'Invalid imported time window manually extended to 06:00 following thesis prototype handling of originally 05:00 windows.',
    updated_at = NOW()
FROM customers c
WHERE dp.customer_id = c.id
  AND c.company_index = '464';
