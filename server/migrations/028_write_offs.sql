-- Write-offs are separate, append-only financial events.  They do not mutate
-- repayment history or schedules; balances are derived net of posted entries.
CREATE TABLE IF NOT EXISTS loan_write_off_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loan_accounts(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  requested_principal NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (requested_principal >= 0),
  requested_interest NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (requested_interest >= 0),
  requested_fees NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (requested_fees >= 0),
  reason TEXT NOT NULL CHECK (length(trim(reason)) > 0),
  remarks TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','posted','reversed')),
  requested_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_by UUID REFERENCES user_profiles(id) ON DELETE RESTRICT,
  decided_at TIMESTAMPTZ,
  decision_remarks TEXT,
  CHECK (requested_principal + requested_interest + requested_fees > 0),
  CHECK ((status = 'pending' AND decided_by IS NULL AND decided_at IS NULL) OR status <> 'pending')
);
CREATE INDEX IF NOT EXISTS idx_write_off_requests_branch_status ON loan_write_off_requests(branch_id,status,requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_write_off_requests_loan ON loan_write_off_requests(loan_id,requested_at DESC);

CREATE TABLE IF NOT EXISTS loan_write_off_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL UNIQUE REFERENCES loan_write_off_requests(id) ON DELETE RESTRICT,
  loan_id UUID NOT NULL REFERENCES loan_accounts(id) ON DELETE RESTRICT,
  principal_written_off NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (principal_written_off >= 0),
  interest_written_off NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (interest_written_off >= 0),
  fees_written_off NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (fees_written_off >= 0),
  total_written_off NUMERIC(14,2) GENERATED ALWAYS AS (principal_written_off + interest_written_off + fees_written_off) STORED,
  posting_date DATE NOT NULL,
  ledger_reference TEXT NOT NULL UNIQUE,
  posted_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reversed_by UUID REFERENCES user_profiles(id) ON DELETE RESTRICT,
  reversed_at TIMESTAMPTZ,
  reversal_reason TEXT,
  CHECK (principal_written_off + interest_written_off + fees_written_off > 0),
  CHECK ((reversed_at IS NULL AND reversed_by IS NULL AND reversal_reason IS NULL) OR (reversed_at IS NOT NULL AND reversed_by IS NOT NULL AND length(trim(reversal_reason)) > 0))
);
CREATE INDEX IF NOT EXISTS idx_write_off_postings_loan_active ON loan_write_off_postings(loan_id,posting_date) WHERE reversed_at IS NULL;

INSERT INTO permission_catalog(module, permission, description) VALUES
 ('loan','write_off.view','View write-off requests'),
 ('loan','write_off.create','Create write-off requests'),
 ('loan','write_off.approve','Approve or reject write-off requests'),
 ('loan','write_off.post','Post approved write-offs'),
 ('loan','write_off.reverse','Reverse posted write-offs')
ON CONFLICT (module, permission) DO UPDATE SET description=EXCLUDED.description;
