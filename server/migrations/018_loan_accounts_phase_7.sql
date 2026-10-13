-- Phase 7: accounts are deliberately separate from approved applications.
-- Do not change historical application migrations: this migration can be applied
-- after Phase 5/6 without rewriting existing application records.
CREATE SEQUENCE IF NOT EXISTS loan_account_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS loan_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_account_number TEXT NOT NULL UNIQUE DEFAULT ('LN' || lpad(nextval('loan_account_number_seq')::text, 6, '0')),
  loan_application_id UUID NOT NULL UNIQUE REFERENCES loan_applications(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE RESTRICT,
  product_group_id UUID NOT NULL REFERENCES product_groups(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  sanction_amount NUMERIC(14, 2) NOT NULL CHECK (sanction_amount > 0),
  loan_amount NUMERIC(14, 2) NOT NULL CHECK (loan_amount > 0),
  sanction_date DATE NOT NULL,
  interest_rate NUMERIC(8, 4) NOT NULL CHECK (interest_rate >= 0),
  tenure INTEGER NOT NULL CHECK (tenure > 0),
  repayment_frequency TEXT NOT NULL CHECK (repayment_frequency IN ('weekly', 'fortnightly', 'monthly', 'quarterly')),
  emi_amount NUMERIC(14, 2) NOT NULL CHECK (emi_amount > 0),
  loan_status TEXT NOT NULL DEFAULT 'pending_disbursement' CHECK (loan_status IN ('pending_disbursement', 'active', 'closed', 'cancelled')),
  disbursement_status TEXT NOT NULL DEFAULT 'not_disbursed' CHECK (disbursement_status IN ('not_disbursed', 'partially_disbursed', 'fully_disbursed')),
  remarks TEXT,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loan_accounts_client_id ON loan_accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_loan_accounts_branch_id ON loan_accounts(branch_id);
CREATE INDEX IF NOT EXISTS idx_loan_accounts_status ON loan_accounts(loan_status, disbursement_status);

CREATE TABLE IF NOT EXISTS loan_disbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loan_accounts(id) ON DELETE RESTRICT,
  disbursement_date DATE NOT NULL,
  disbursement_amount NUMERIC(14, 2) NOT NULL CHECK (disbursement_amount > 0),
  disbursement_mode TEXT NOT NULL CHECK (disbursement_mode IN ('bank_transfer', 'neft', 'rtgs', 'imps', 'cheque', 'other')),
  bank_account_id UUID REFERENCES loan_application_bank_accounts(id) ON DELETE RESTRICT,
  reference_number TEXT,
  remarks TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loan_disbursements_loan_status ON loan_disbursements(loan_id, status);
CREATE INDEX IF NOT EXISTS idx_loan_disbursements_loan_date ON loan_disbursements(loan_id, disbursement_date DESC);

-- The development database predates the migration files. Bring those tables up
-- to the same non-destructive integrity rules without changing any records.
-- NOT VALID still enforces new writes while allowing a separate data-cleanup
-- decision if an older database contains a legacy invalid value.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'loan_accounts'::regclass
      AND conname = 'loan_accounts_repayment_frequency_check'
  ) THEN
    ALTER TABLE loan_accounts
      ADD CONSTRAINT loan_accounts_repayment_frequency_check
      CHECK (repayment_frequency IN ('weekly', 'fortnightly', 'monthly', 'quarterly')) NOT VALID;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'loan_disbursements'::regclass
      AND conname = 'loan_disbursements_bank_account_id_fkey'
      AND pg_get_constraintdef(oid) NOT LIKE '%ON DELETE RESTRICT%'
  ) THEN
    ALTER TABLE loan_disbursements
      DROP CONSTRAINT loan_disbursements_bank_account_id_fkey;
    ALTER TABLE loan_disbursements
      ADD CONSTRAINT loan_disbursements_bank_account_id_fkey
      FOREIGN KEY (bank_account_id)
      REFERENCES loan_application_bank_accounts(id) ON DELETE RESTRICT;
  END IF;
END $$;
