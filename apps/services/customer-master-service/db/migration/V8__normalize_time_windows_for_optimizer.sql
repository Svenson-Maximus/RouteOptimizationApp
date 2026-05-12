ALTER TABLE customer_delivery_profiles
    ADD COLUMN IF NOT EXISTS raw_time_window_start TIME,
    ADD COLUMN IF NOT EXISTS raw_time_window_end TIME,
    ADD COLUMN IF NOT EXISTS time_window_normalization_note TEXT;

UPDATE customer_delivery_profiles
SET raw_time_window_start = COALESCE(raw_time_window_start, time_window_start),
    raw_time_window_end = COALESCE(raw_time_window_end, time_window_end);

UPDATE customer_delivery_profiles
SET time_window_start = '04:20:00',
    time_window_end = raw_time_window_end,
    time_window_normalization_note = 'Only latest delivery time was available; normalized to route start -> latest delivery time.',
    updated_at = NOW()
WHERE raw_time_window_start IS NULL
  AND raw_time_window_end IS NOT NULL;

UPDATE customer_delivery_profiles
SET time_window_start = '04:20:00',
    time_window_end = raw_time_window_end,
    time_window_normalization_note = 'Zero-length imported time window interpreted as deliver-by time.',
    updated_at = NOW()
WHERE raw_time_window_start IS NOT NULL
  AND raw_time_window_end IS NOT NULL
  AND raw_time_window_start = raw_time_window_end;

UPDATE customer_delivery_profiles
SET time_window_start = '04:20:00',
    time_window_end = raw_time_window_end,
    time_window_normalization_note = 'Invalid imported time window interpreted as deliver-by time.',
    updated_at = NOW()
WHERE raw_time_window_start IS NOT NULL
  AND raw_time_window_end IS NOT NULL
  AND raw_time_window_start > raw_time_window_end;

UPDATE customer_delivery_profiles
SET time_window_start = raw_time_window_start,
    time_window_end = '19:00:00',
    time_window_normalization_note = 'Only earliest delivery time was available; normalized to earliest delivery time -> route horizon.',
    updated_at = NOW()
WHERE raw_time_window_start IS NOT NULL
  AND raw_time_window_end IS NULL;

UPDATE customer_delivery_profiles
SET time_window_start = '04:20:00',
    time_window_end = '19:00:00',
    time_window_normalization_note = 'No explicit time window was available; normalized to full route horizon.',
    updated_at = NOW()
WHERE raw_time_window_start IS NULL
  AND raw_time_window_end IS NULL;

UPDATE customer_delivery_profiles
SET time_window_normalization_note = COALESCE(
        time_window_normalization_note,
        'Explicit imported time window retained.'
    ),
    updated_at = NOW()
WHERE raw_time_window_start IS NOT NULL
  AND raw_time_window_end IS NOT NULL
  AND raw_time_window_start < raw_time_window_end;
