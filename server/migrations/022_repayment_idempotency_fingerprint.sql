-- Reconcile databases where migration 020 was applied before request
-- fingerprints were added to the idempotent payment API. This is additive and
-- does not alter existing payment amounts, allocations, or statuses.
ALTER TABLE loan_payments
  ADD COLUMN IF NOT EXISTS request_fingerprint TEXT;

-- Existing rows cannot be assigned a trustworthy fingerprint retroactively.
-- They remain readable, while newly posted payments require one at the API and
-- database level after this migration is applied.
ALTER TABLE loan_payments
  ADD CONSTRAINT loan_payments_request_fingerprint_format_check
  CHECK (request_fingerprint IS NULL OR request_fingerprint ~ '^[0-9a-f]{64}$') NOT VALID;
