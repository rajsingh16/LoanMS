-- Death claims are intentionally separate from repayment/write-off posting.
CREATE TABLE IF NOT EXISTS death_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  death_id TEXT NOT NULL UNIQUE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  loan_account_id UUID NOT NULL REFERENCES loan_accounts(id) ON DELETE RESTRICT,
  insurance_reference TEXT,
  date_of_death DATE,
  date_reported DATE NOT NULL,
  case_process_date DATE,
  client_spouse_flag BOOLEAN NOT NULL DEFAULT FALSE,
  deceased_person_type TEXT,
  beneficiary_name TEXT,
  beneficiary_phone_number TEXT,
  claim_amount NUMERIC(14,2) CHECK (claim_amount IS NULL OR claim_amount >= 0),
  approved_claim_amount NUMERIC(14,2) CHECK (approved_claim_amount IS NULL OR approved_claim_amount >= 0),
  settled_amount NUMERIC(14,2) CHECK (settled_amount IS NULL OR settled_amount >= 0),
  settlement_date DATE,
  settlement_reference TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported','verified','settled','rejected')),
  remarks TEXT,
  rejection_reason TEXT,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (loan_account_id, date_of_death, client_spouse_flag, deceased_person_type)
);
CREATE INDEX IF NOT EXISTS idx_death_cases_branch ON death_cases(branch_id);
CREATE INDEX IF NOT EXISTS idx_death_cases_center ON death_cases(center_id);
CREATE INDEX IF NOT EXISTS idx_death_cases_client ON death_cases(client_id);
CREATE INDEX IF NOT EXISTS idx_death_cases_loan ON death_cases(loan_account_id);
CREATE INDEX IF NOT EXISTS idx_death_cases_status_reported ON death_cases(status, date_reported DESC);

CREATE TABLE IF NOT EXISTS death_case_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  death_case_id UUID NOT NULL REFERENCES death_cases(id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL CHECK (event_type IN ('created','updated','verified','rejected','settled','cancelled')),
  previous_status TEXT,
  new_status TEXT,
  settlement_reference TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  performed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_death_case_history_case_time ON death_case_history(death_case_id, created_at DESC);
