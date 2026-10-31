CREATE TABLE IF NOT EXISTS branch_audit_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_file_name TEXT NOT NULL,
  stored_file_reference TEXT,
  file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 10485760),
  file_hash TEXT NOT NULL UNIQUE,
  uploaded_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_rows INTEGER NOT NULL DEFAULT 0,
  successful_rows INTEGER NOT NULL DEFAULT 0,
  failed_rows INTEGER NOT NULL DEFAULT 0,
  upload_status TEXT NOT NULL DEFAULT 'processing' CHECK (upload_status IN ('processing','successful','failed')),
  error_details JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS branch_audit_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES branch_audit_uploads(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  audit_date DATE NOT NULL,
  audit_reference TEXT,
  audit_status TEXT NOT NULL CHECK (audit_status IN ('compliant','non_compliant','pending_review')),
  findings TEXT,
  observations TEXT,
  corrective_action TEXT,
  action_owner UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  due_date DATE,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (branch_id, audit_date, audit_reference)
);

CREATE INDEX IF NOT EXISTS idx_branch_audit_uploads_uploaded_at ON branch_audit_uploads(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_branch_audit_records_branch_date ON branch_audit_records(branch_id, audit_date DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_branch_audit_records_upload ON branch_audit_records(upload_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_branch_audit_records_business_key
  ON branch_audit_records (branch_id, audit_date, COALESCE(audit_reference, ''));

INSERT INTO permission_catalog (module, permission, description) VALUES
  ('loan', 'branch_audit.view', 'View branch audit records in authorized branches'),
  ('loan', 'branch_audit.write', 'Upload branch audit records for authorized branches')
ON CONFLICT (module, permission) DO UPDATE SET description = EXCLUDED.description;
