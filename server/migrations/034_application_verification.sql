-- A verification decision is deliberately separate from loan approval/sanction.
CREATE TABLE IF NOT EXISTS loan_application_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_application_id UUID NOT NULL UNIQUE REFERENCES loan_applications(id) ON DELETE RESTRICT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  remarks TEXT,
  rejection_reason TEXT,
  verified_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  queue_dismissed_at TIMESTAMPTZ,
  queue_dismissed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loan_application_verification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE RESTRICT,
  verification_id UUID NOT NULL REFERENCES loan_application_verifications(id) ON DELETE RESTRICT,
  previous_status TEXT,
  new_status TEXT NOT NULL CHECK (new_status IN ('pending', 'approved', 'rejected')),
  remarks TEXT,
  rejection_reason TEXT,
  action_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_application_verifications_status ON loan_application_verifications(verification_status, queue_dismissed_at);
CREATE INDEX IF NOT EXISTS idx_application_verification_history_application ON loan_application_verification_history(loan_application_id, created_at DESC);

INSERT INTO permission_catalog (module, permission, description) VALUES
  ('loan', 'application.verification.view', 'View application verification queue'),
  ('loan', 'application.verification.record', 'Approve, reject, or reopen application verification'),
  ('loan', 'application.verification.queue.manage', 'Dismiss completed application verification queue items')
ON CONFLICT (module, permission) DO UPDATE SET description = EXCLUDED.description;
