-- Preserve the product terms used to create each application.  The JSON
-- snapshot is intentionally additive so historic applications remain intact.
ALTER TABLE loan_applications
  ADD COLUMN IF NOT EXISTS product_terms_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS total_interest NUMERIC(14, 2),
  ADD COLUMN IF NOT EXISTS total_payable_amount NUMERIC(14, 2),
  ADD COLUMN IF NOT EXISTS processing_fee NUMERIC(14, 2),
  ADD COLUMN IF NOT EXISTS insurance_charge NUMERIC(14, 2),
  ADD COLUMN IF NOT EXISTS other_charges NUMERIC(14, 2),
  ADD COLUMN IF NOT EXISTS repayment_schedule JSONB NOT NULL DEFAULT '[]'::jsonb;
