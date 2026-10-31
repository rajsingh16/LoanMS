-- Phase 8 contractual terms are immutable snapshots on loan accounts. Product
-- JSONB remains the configurable default; no historical product/application is
-- backfilled because absent terms are contractually unknown.
ALTER TABLE loan_applications
  ADD COLUMN IF NOT EXISTS contractual_first_installment_date DATE;

ALTER TABLE loan_accounts
  ADD COLUMN IF NOT EXISTS contractual_repayment_terms JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS contractual_terms_captured_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS contractual_terms_captured_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_loan_accounts_contractual_terms_incomplete
  ON loan_accounts(id)
  WHERE contractual_repayment_terms = '{}'::jsonb;
