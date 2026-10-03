-- Backfill branch master records from Area records that represent branches.
INSERT INTO branches (branch_code, branch_name, location, status)
SELECT
  a.area_code,
  a.area_name,
  concat_ws(', ', nullif(a.address1, ''), nullif(a.district, ''), nullif(a.state, '')),
  'active'
FROM areas a
WHERE lower(a.area_type) = 'branch'
ON CONFLICT (branch_code) DO UPDATE
SET branch_name = EXCLUDED.branch_name,
    location = EXCLUDED.location,
    status = 'active',
    updated_at = now();

-- Centers must point at a real branch once data has been cleaned up.
-- If this fails, update or remove legacy center rows with null branch_id first.
ALTER TABLE centers
ALTER COLUMN branch_id SET NOT NULL;
