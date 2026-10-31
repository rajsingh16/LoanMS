-- Phase 10: named workflow permissions use the existing per-user permission
-- assignment table.  This migration deliberately creates no user grants: a
-- privilege becomes effective only after an administrator assigns it.
ALTER TABLE user_permissions DROP CONSTRAINT IF EXISTS user_permissions_permission_check;

CREATE TABLE IF NOT EXISTS permission_catalog (
  module TEXT NOT NULL,
  permission TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (module, permission)
);

INSERT INTO permission_catalog (module, permission, description) VALUES
  ('loan', 'application.view', 'View loan applications and non-document details'),
  ('loan', 'application.create', 'Create draft loan applications and calculate terms'),
  ('loan', 'application.draft.edit', 'Edit a draft loan application'),
  ('loan', 'application.draft.delete', 'Delete a draft loan application'),
  ('loan', 'application.submit', 'Submit a draft loan application'),
  ('loan', 'application.review', 'Move a submitted application to review'),
  ('loan', 'application.documents.view', 'View application documents'),
  ('loan', 'application.documents.manage', 'Upload documents to a draft application'),
  ('loan', 'application.documents.verify', 'Verify or reject application documents'),
  ('loan', 'application.field_verification.record', 'Record a field verification'),
  ('loan', 'application.credit_review.view', 'View applicant credit assessments'),
  ('loan', 'application.credit_review.record', 'Record an applicant credit assessment'),
  ('loan', 'application.terms.confirm', 'Confirm approved loan terms'),
  ('loan', 'application.decision.record', 'Approve or reject an application'),
  ('loan', 'application.account.create', 'Create a loan account from an approved application'),
  ('loan', 'application.disburse', 'Create or finalize loan disbursements'),
  ('loan', 'application.history.view', 'View application audit history')
ON CONFLICT (module, permission) DO UPDATE SET description = EXCLUDED.description;

-- Permission validation is intentionally catalog-backed without a database
-- foreign key so historic non-loan modules remain deployable.  The loan route
-- accepts only exact names above; obsolete loan:write/read grants do not imply
-- any Phase 10 workflow grant.
