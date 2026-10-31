CREATE TABLE IF NOT EXISTS center_transfer_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE RESTRICT,
  source_branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  target_branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  source_field_officer_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  target_field_officer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  transfer_status TEXT NOT NULL DEFAULT 'completed' CHECK (transfer_status IN ('completed', 'rejected')),
  transfer_reason TEXT NOT NULL,
  requested_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  approved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  transferred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_center_transfer_history_center_time
  ON center_transfer_history(center_id, transferred_at DESC);

INSERT INTO permission_catalog (module, permission, description) VALUES
  ('loan', 'center_transfer.view', 'View centers available for transfer'),
  ('loan', 'center_transfer.execute', 'Transfer centers between authorized branches')
ON CONFLICT (module, permission) DO UPDATE SET description = EXCLUDED.description;
