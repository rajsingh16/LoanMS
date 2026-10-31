-- Phase 10.1: role grants reuse the Phase 10 permission catalog.  No grants
-- are seeded so existing users retain their current effective access until an
-- administrator explicitly configures a role.
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  permission TEXT NOT NULL,
  granted_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (role_id, module, permission),
  FOREIGN KEY (module, permission) REFERENCES permission_catalog(module, permission)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);

INSERT INTO permission_catalog (module, permission, description) VALUES
  ('loan', 'repayment.view', 'View repayment schedules and payment history'),
  ('loan', 'repayment.schedule.generate', 'Generate a contractual repayment schedule'),
  ('loan', 'repayment.payment.post', 'Post a loan repayment'),
  ('loan', 'repayment.payment.reverse', 'Reverse a posted loan repayment'),
  ('loan', 'repayment.report.view', 'View repayment reports and dashboards')
ON CONFLICT (module, permission) DO UPDATE SET description = EXCLUDED.description;
