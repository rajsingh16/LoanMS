-- Branch day close is deliberately separate from loan balances.  At present the
-- only authoritative cash ledger is posted cash loan repayments.
CREATE TABLE IF NOT EXISTS branch_day_closes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  branch_close_date DATE NOT NULL,
  branch_balance NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (branch_balance >= 0),
  cashbook_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  cash_difference NUMERIC(14,2) GENERATED ALWAYS AS (branch_balance - cashbook_balance) STORED,
  denomination JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','verified','closed','rejected','cancelled')),
  remarks TEXT,
  prepared_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  verified_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(branch_id, branch_close_date)
);
CREATE INDEX IF NOT EXISTS idx_branch_day_closes_branch_date ON branch_day_closes(branch_id, branch_close_date DESC);
CREATE INDEX IF NOT EXISTS idx_branch_day_closes_status ON branch_day_closes(status, branch_close_date DESC);

CREATE TABLE IF NOT EXISTS branch_day_close_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_day_close_id UUID NOT NULL REFERENCES branch_day_closes(id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  before_state JSONB,
  after_state JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_branch_day_close_audit_close ON branch_day_close_audit(branch_day_close_id, created_at DESC);

-- Administrators retain their existing override; all other access is granted
-- explicitly through the existing user/role permission administration screens.
INSERT INTO permission_catalog (module, permission, description) VALUES
  ('loan', 'day_close.view', 'View authorized branch day-close records'),
  ('loan', 'day_close.write', 'Create, amend, submit, verify, reject, or close authorized branch day-close records')
ON CONFLICT (module, permission) DO UPDATE SET description = EXCLUDED.description;
