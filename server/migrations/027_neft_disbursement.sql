-- NEFT is an orchestration layer over the existing pending loan_disbursements
-- ledger.  It never stores another financial amount or loan balance.
CREATE SEQUENCE IF NOT EXISTS neft_batch_number_seq START WITH 1;

CREATE TABLE IF NOT EXISTS neft_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number TEXT NOT NULL UNIQUE DEFAULT ('NEFT' || lpad(nextval('neft_batch_number_seq')::text, 8, '0')),
  bank_format TEXT NOT NULL DEFAULT 'TEST_CSV_V1',
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated','exported','partially_settled','settled','failed')),
  total_transactions INTEGER NOT NULL DEFAULT 0 CHECK (total_transactions >= 0),
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  generated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS neft_batch_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES neft_batches(id) ON DELETE RESTRICT,
  disbursement_id UUID NOT NULL REFERENCES loan_disbursements(id) ON DELETE RESTRICT,
  loan_account_id UUID NOT NULL REFERENCES loan_accounts(id) ON DELETE RESTRICT,
  beneficiary_bank_account_id UUID NOT NULL REFERENCES loan_application_bank_accounts(id) ON DELETE RESTRICT,
  transaction_amount NUMERIC(14,2) NOT NULL CHECK (transaction_amount > 0),
  transaction_reference TEXT NOT NULL UNIQUE,
  bank_status TEXT NOT NULL DEFAULT 'pending' CHECK (bank_status IN ('pending','success','failed','rejected')),
  bank_reference TEXT,
  failure_reason TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (disbursement_id)
);

CREATE TABLE IF NOT EXISTS neft_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES neft_batches(id) ON DELETE RESTRICT,
  original_filename TEXT NOT NULL,
  file_checksum TEXT NOT NULL UNIQUE,
  uploaded_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processing_status TEXT NOT NULL DEFAULT 'validated' CHECK (processing_status IN ('validated','processed','rejected')),
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  validation_errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  response_rows JSONB NOT NULL DEFAULT '[]'::jsonb,
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_neft_batches_branch_time ON neft_batches(branch_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_neft_items_batch ON neft_batch_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_neft_items_loan ON neft_batch_items(loan_account_id);
