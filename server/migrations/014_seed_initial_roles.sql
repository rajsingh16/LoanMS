-- Initial LoanMS role catalogue.
-- Safe to run repeatedly: existing role rows are preserved.
INSERT INTO roles (role_name, role_code, description, is_active)
VALUES
  ('Administrator', 'administrator', 'Full system administration, including users, roles, permissions, and settings.', true),
  ('External Sanction', 'external_sanction', 'Review loan and case information and perform external sanction operations.', true),
  ('MIS', 'mis', 'Reports, dashboards, operational analysis, and report exports.', true),
  ('Receipt Payment', 'receipt_payment', 'Receipt, payment, and collection transaction processing.', true),
  ('Branch Manager', 'branch_manager', 'Branch operations, field officer supervision, customers, centers, and branch reports.', true),
  ('Field Officer', 'field_officer', 'Assigned center, village, customer, loan application, and collection operations.', true),
  ('Accountant', 'accountant', 'Accounting, payment, receipt, disbursement, and financial reporting operations.', true),
  ('Auditor', 'auditor', 'Read-only operational and financial review, audit, and compliance functions.', true),
  ('Human Resources', 'human_resources', 'Employee and user information, status, branch assignment, and HR records.', true),
  ('Tele Caller', 'tele_caller', 'Customer contact, loan and repayment follow-up, and communication operations.', true)
ON CONFLICT (role_code) DO NOTHING;
