ALTER TABLE loan_applications
  ADD COLUMN IF NOT EXISTS sanction_authority UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sanction_remarks TEXT,
  ADD COLUMN IF NOT EXISTS rejection_remarks TEXT,
  ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejection_date TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS loan_application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  reason TEXT,
  changed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loan_application_status_history_application
  ON loan_application_status_history(loan_application_id, changed_at DESC);

CREATE TABLE IF NOT EXISTS loan_application_field_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
  field_officer_id UUID NOT NULL REFERENCES user_profiles(id),
  visit_date DATE NOT NULL,
  visit_location TEXT,
  applicant_met BOOLEAN NOT NULL DEFAULT FALSE,
  business_verified BOOLEAN NOT NULL DEFAULT FALSE,
  residence_verified BOOLEAN NOT NULL DEFAULT FALSE,
  findings TEXT,
  remarks TEXT,
  verification_result TEXT NOT NULL CHECK (verification_result IN ('positive', 'negative', 'inconclusive')),
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loan_application_field_verifications_application
  ON loan_application_field_verifications(loan_application_id, visit_date DESC);

CREATE TABLE IF NOT EXISTS loan_application_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
  monthly_income NUMERIC(14, 2),
  monthly_expenses NUMERIC(14, 2),
  existing_obligations NUMERIC(14, 2),
  household_income NUMERIC(14, 2),
  household_expenses NUMERIC(14, 2),
  net_monthly_income NUMERIC(14, 2),
  repayment_capacity NUMERIC(14, 2),
  recommended_loan_amount NUMERIC(14, 2),
  recommended_emi NUMERIC(14, 2),
  assessment_result TEXT NOT NULL CHECK (assessment_result IN ('positive', 'negative', 'inconclusive')),
  assessment_remarks TEXT,
  assessed_by UUID NOT NULL REFERENCES user_profiles(id),
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loan_application_assessments_application
  ON loan_application_assessments(loan_application_id, assessed_at DESC);
