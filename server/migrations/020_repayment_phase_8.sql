-- Phase 8 repayment ledger.  These records supplement Phase 7 accounts and
-- disbursements; they deliberately never alter either source table.
CREATE TABLE IF NOT EXISTS loan_repayment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loan_accounts(id) ON DELETE RESTRICT,
  schedule_version INTEGER NOT NULL DEFAULT 1 CHECK (schedule_version > 0),
  installment_number INTEGER NOT NULL CHECK (installment_number > 0),
  contractual_due_date DATE NOT NULL,
  collection_due_date DATE NOT NULL,
  opening_principal NUMERIC(14,2) NOT NULL CHECK (opening_principal >= 0),
  scheduled_principal NUMERIC(14,2) NOT NULL CHECK (scheduled_principal >= 0),
  scheduled_interest NUMERIC(14,2) NOT NULL CHECK (scheduled_interest >= 0),
  scheduled_fees NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (scheduled_fees >= 0),
  scheduled_amount NUMERIC(14,2) NOT NULL CHECK (scheduled_amount >= 0),
  principal_paid NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (principal_paid >= 0),
  interest_paid NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (interest_paid >= 0),
  fees_paid NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (fees_paid >= 0),
  payment_status TEXT NOT NULL DEFAULT 'upcoming' CHECK (payment_status IN ('upcoming','due','partially_paid','paid','overdue')),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (loan_id, schedule_version, installment_number),
  UNIQUE (id, loan_id),
  CHECK (scheduled_amount = scheduled_principal + scheduled_interest + scheduled_fees),
  CHECK (principal_paid <= scheduled_principal),
  CHECK (interest_paid <= scheduled_interest),
  CHECK (fees_paid <= scheduled_fees)
);

CREATE INDEX IF NOT EXISTS idx_repayment_schedules_loan_due
  ON loan_repayment_schedules(loan_id, contractual_due_date);
CREATE INDEX IF NOT EXISTS idx_repayment_schedules_status_due
  ON loan_repayment_schedules(payment_status, collection_due_date);

CREATE TABLE IF NOT EXISTS loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loan_accounts(id) ON DELETE RESTRICT,
  payment_date DATE NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash','neft','rtgs','imps','upi','bank_transfer','cheque','other')),
  reference_number TEXT,
  collection_agent_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  idempotency_key UUID NOT NULL UNIQUE,
  request_fingerprint TEXT NOT NULL CHECK (request_fingerprint ~ '^[0-9a-f]{64}$'),
  status TEXT NOT NULL DEFAULT 'posted' CHECK (status IN ('posted','reversed')),
  remarks TEXT,
  posted_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reversed_by UUID REFERENCES user_profiles(id) ON DELETE RESTRICT,
  reversed_at TIMESTAMPTZ,
  reversal_reason TEXT,
  CHECK ((status = 'posted' AND reversed_by IS NULL AND reversed_at IS NULL AND reversal_reason IS NULL)
    OR (status = 'reversed' AND reversed_by IS NOT NULL AND reversed_at IS NOT NULL AND length(trim(reversal_reason)) > 0)),
  UNIQUE (id, loan_id)
);

CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_date
  ON loan_payments(loan_id, payment_date DESC) WHERE status = 'posted';
CREATE INDEX IF NOT EXISTS idx_loan_payments_collection_date
  ON loan_payments(payment_date DESC) WHERE status = 'posted';

CREATE TABLE IF NOT EXISTS loan_payment_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loan_accounts(id) ON DELETE RESTRICT,
  payment_id UUID NOT NULL,
  schedule_id UUID NOT NULL,
  principal_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (principal_amount >= 0),
  interest_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (interest_amount >= 0),
  fees_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (fees_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(payment_id, schedule_id),
  FOREIGN KEY (payment_id, loan_id) REFERENCES loan_payments(id, loan_id) ON DELETE RESTRICT,
  FOREIGN KEY (schedule_id, loan_id) REFERENCES loan_repayment_schedules(id, loan_id) ON DELETE RESTRICT,
  CHECK (principal_amount + interest_amount + fees_amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_payment_allocations_schedule ON loan_payment_allocations(schedule_id);

CREATE TABLE IF NOT EXISTS loan_repayment_schedule_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loan_accounts(id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL CHECK (event_type IN ('generated','generation_blocked','adjustment_requested')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_repayment_schedule_events_loan ON loan_repayment_schedule_events(loan_id, created_at DESC);
