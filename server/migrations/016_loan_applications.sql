CREATE SEQUENCE IF NOT EXISTS loan_application_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number TEXT NOT NULL UNIQUE DEFAULT ('LA' || lpad(nextval('loan_application_number_seq')::text, 6, '0')),
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,
  client_id UUID NOT NULL REFERENCES clients(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  center_id UUID NOT NULL REFERENCES centers(id),
  product_group_id UUID NOT NULL REFERENCES product_groups(id),
  product_id UUID NOT NULL REFERENCES products(id),
  purpose_id UUID REFERENCES purposes(id),
  sub_purpose_id UUID REFERENCES purposes(id),
  is_top_up BOOLEAN NOT NULL DEFAULT FALSE,
  loan_amount NUMERIC(14, 2) NOT NULL,
  emi_amount NUMERIC(14, 2),
  interest_rate NUMERIC(8, 4),
  tenure INTEGER,
  repayment_frequency TEXT,
  application_status TEXT NOT NULL DEFAULT 'pending',
  document_verification_status TEXT NOT NULL DEFAULT 'pending',
  sanction_status TEXT NOT NULL DEFAULT 'pending',
  remarks TEXT,
  rejection_reason TEXT,
  sanction_amount NUMERIC(14, 2),
  sanction_date DATE,
  field_officer_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loan_applications_client_id ON loan_applications(client_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_branch_date ON loan_applications(branch_id, application_date DESC);
CREATE INDEX IF NOT EXISTS idx_loan_applications_center_date ON loan_applications(center_id, application_date DESC);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_loan_applications_created_at ON loan_applications(created_at DESC);

CREATE TABLE IF NOT EXISTS loan_application_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
  address_type TEXT NOT NULL DEFAULT 'correspondence',
  address1 TEXT NOT NULL,
  address2 TEXT,
  mohalla TEXT,
  post_office TEXT,
  nearest_police_station TEXT,
  pincode TEXT,
  village_id UUID REFERENCES villages(id) ON DELETE SET NULL,
  district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
  state TEXT,
  residence_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_loan_application_addresses_application ON loan_application_addresses(loan_application_id);

CREATE TABLE IF NOT EXISTS loan_application_family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
  relation TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  mobile_number TEXT,
  date_of_birth DATE,
  id_type TEXT,
  id_number TEXT,
  additional_id_type TEXT,
  additional_id_number TEXT,
  marital_status TEXT,
  employment_status TEXT,
  qualification TEXT,
  occupation TEXT,
  occupation_type TEXT,
  consider_for_assessment BOOLEAN NOT NULL DEFAULT FALSE,
  is_nominee BOOLEAN NOT NULL DEFAULT FALSE,
  is_co_applicant BOOLEAN NOT NULL DEFAULT FALSE,
  is_guarantor BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_loan_application_family_application ON loan_application_family_members(loan_application_id);

CREATE TABLE IF NOT EXISTS loan_application_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL,
  account_number TEXT NOT NULL,
  ifsc_id UUID REFERENCES ifsc_codes(id) ON DELETE SET NULL,
  customer_name TEXT,
  for_disbursement BOOLEAN NOT NULL DEFAULT FALSE,
  for_collection BOOLEAN NOT NULL DEFAULT FALSE,
  name_match_percentage NUMERIC(5, 2),
  penny_drop_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_loan_application_bank_application ON loan_application_bank_accounts(loan_application_id);

CREATE TABLE IF NOT EXISTS loan_application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT,
  storage_key TEXT,
  mime_type TEXT,
  file_size_bytes BIGINT,
  uploaded_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_loan_application_documents_application ON loan_application_documents(loan_application_id);
