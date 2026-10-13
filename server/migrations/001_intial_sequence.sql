-- Run once against your PostgreSQL database (same schema you used with Supabase).
-- Maps login email/password to existing user_profiles.id rows.

CREATE TABLE IF NOT EXISTS user_credentials (
  user_id UUID PRIMARY KEY REFERENCES user_profiles (id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_credentials_email ON user_credentials (email);

-- Roles master table

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT NOT NULL,
  role_code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roles_active_name ON roles (is_active, role_name);

-- Branch master table

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_code TEXT NOT NULL UNIQUE,
  branch_name TEXT NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_branches_status_name ON branches (status, branch_name);

-- User profile records (application users)

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  branch_id UUID REFERENCES branches (id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  phone TEXT,
  employee_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_employee_id
  ON user_profiles (employee_id)
  WHERE employee_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_role_status ON user_profiles (role, status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_branch_id ON user_profiles (branch_id);

-- Per-user module permissions

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles (id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  permission TEXT NOT NULL CHECK (permission IN ('read', 'write', 'delete', 'admin')),
  granted_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_permissions_unique
  ON user_permissions (user_id, module, permission);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions (user_id);

-- Centers table used by center APIs.
-- Server can read from 'centers' (preferred) or fallback compatible table names.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_code TEXT NOT NULL UNIQUE,
  center_name TEXT NOT NULL,
  branch_id UUID REFERENCES branches (id) ON DELETE SET NULL,
  village TEXT,
  assigned_to UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  center_day TEXT,
  center_time TIME,
  contact_person_name TEXT,
  contact_person_number TEXT,
  meeting_place TEXT,
  address1 TEXT,
  address2 TEXT,
  landmark TEXT,
  pincode TEXT,
  city TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  blacklisted BOOLEAN NOT NULL DEFAULT FALSE,
  bc_center_id TEXT,
  parent_center_id UUID REFERENCES centers (id) ON DELETE SET NULL,
  created_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_centers_branch_id ON centers (branch_id);
CREATE INDEX IF NOT EXISTS idx_centers_assigned_to ON centers (assigned_to);
CREATE INDEX IF NOT EXISTS idx_centers_status ON centers (status);
CREATE INDEX IF NOT EXISTS idx_centers_created_at ON centers (created_at DESC);

-- Areas table used by area APIs and CSV bulk upsert.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_type TEXT NOT NULL,
  area_code TEXT NOT NULL UNIQUE,
  area_name TEXT NOT NULL,
  parent_area_code TEXT,
  branch_manager_id UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  address1 TEXT NOT NULL,
  address2 TEXT,
  phone_number TEXT,
  email_id TEXT,
  pincode TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT,
  mandatory_document TEXT,
  branch_rating TEXT,
  min_center_clients INTEGER NOT NULL DEFAULT 0,
  max_center_clients INTEGER NOT NULL DEFAULT 0,
  bc_branch_id TEXT,
  business_partner TEXT NOT NULL,
  cashless_disb_partner TEXT,
  nach_partner TEXT,
  branch_opening_date DATE NOT NULL,
  branch_closing_date DATE,
  last_day_close_date DATE,
  disb_on_meeting_date BOOLEAN NOT NULL DEFAULT FALSE,
  cross_sell_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  is_disb_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_cash_disb_active BOOLEAN NOT NULL DEFAULT FALSE,
  is_sub_product_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  is_client_sourcing_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  is_center_formation_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_areas_status ON areas (status);
CREATE INDEX IF NOT EXISTS idx_areas_created_by ON areas (created_by);
CREATE INDEX IF NOT EXISTS idx_areas_created_at ON areas (created_at DESC);

-- Pincode master table used by pincode APIs and area form autofill.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS pincodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pincode TEXT NOT NULL UNIQUE,
  state TEXT,
  district TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  updated_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pincodes_status ON pincodes (status);
CREATE INDEX IF NOT EXISTS idx_pincodes_district ON pincodes (district);

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS villages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id TEXT NOT NULL UNIQUE,
  village_name TEXT NOT NULL,
  village_code TEXT NOT NULL UNIQUE,
  branch_id UUID REFERENCES branches (id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  village_classification TEXT NOT NULL,
  pincode TEXT NOT NULL,
  city TEXT,
  country_name TEXT NOT NULL DEFAULT 'India',
  district TEXT NOT NULL,
  post_office TEXT NOT NULL,
  mohalla_name TEXT NOT NULL,
  panchayat_name TEXT NOT NULL,
  police_station TEXT NOT NULL,
  contact_person_name TEXT NOT NULL,
  contact_person_number TEXT,
  language TEXT NOT NULL,
  customer_base_expected INTEGER NOT NULL DEFAULT 0,
  distance_from_branch NUMERIC(10, 2) NOT NULL DEFAULT 0,
  bank_distance NUMERIC(10, 2) NOT NULL DEFAULT 0,
  nearest_bank_name TEXT NOT NULL,
  hospital_distance NUMERIC(10, 2) NOT NULL DEFAULT 0,
  nearest_hospital_name TEXT NOT NULL,
  police_station_distance NUMERIC(10, 2) NOT NULL DEFAULT 0,
  population INTEGER NOT NULL DEFAULT 0,
  road_type TEXT NOT NULL,
  school_type TEXT NOT NULL,
  hospital_type TEXT NOT NULL,
  religion_majority TEXT NOT NULL,
  category TEXT NOT NULL,
  is_primary_health_centre BOOLEAN NOT NULL DEFAULT FALSE,
  is_politically_influenced BOOLEAN NOT NULL DEFAULT FALSE,
  number_of_schools INTEGER NOT NULL DEFAULT 0,
  total_clinics INTEGER NOT NULL DEFAULT 0,
  total_kiryana_stores INTEGER NOT NULL DEFAULT 0,
  total_kutcha_houses INTEGER NOT NULL DEFAULT 0,
  total_pakka_houses INTEGER NOT NULL DEFAULT 0,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  created_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_villages_branch_id ON villages (branch_id);
CREATE INDEX IF NOT EXISTS idx_villages_status ON villages (status);
CREATE INDEX IF NOT EXISTS idx_villages_pincode ON villages (pincode);
CREATE INDEX IF NOT EXISTS idx_villages_created_at ON villages (created_at DESC);

-- Backfill branch master records from Area records that represent branches.
INSERT INTO branches (branch_code, branch_name, location, status)
SELECT
  a.area_code,
  a.area_name,
  concat_ws(', ', nullif(a.address1, ''), nullif(a.district, ''), nullif(a.state, '')),
  'active'
FROM areas a
WHERE lower(a.area_type) = 'branch'
ON CONFLICT (branch_code) DO UPDATE
SET branch_name = EXCLUDED.branch_name,
    location = EXCLUDED.location,
    status = 'active',
    updated_at = now();

-- Centers must point at a real branch once data has been cleaned up.
-- If this fails, update or remove legacy center rows with null branch_id first.
ALTER TABLE centers
ALTER COLUMN branch_id SET NOT NULL;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  aadhaar_number TEXT NOT NULL UNIQUE,
  voter_card_number TEXT NOT NULL,
  kyc_type TEXT NOT NULL,
  kyc_id TEXT NOT NULL,
  cycle INTEGER NOT NULL DEFAULT 1,
  date_of_birth DATE NOT NULL,
  age INTEGER NOT NULL DEFAULT 0,
  father_name TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  marital_status TEXT NOT NULL CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widowed')),
  mobile_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  qualification TEXT NOT NULL,
  language TEXT NOT NULL,
  caste TEXT NOT NULL,
  religion TEXT NOT NULL,
  occupation TEXT NOT NULL,
  land_holding TEXT NOT NULL,
  monthly_income NUMERIC(14, 2) NOT NULL DEFAULT 0,
  annual_income NUMERIC(14, 2) NOT NULL DEFAULT 0,
  household_income NUMERIC(14, 2) NOT NULL DEFAULT 0,
  monthly_expense NUMERIC(14, 2) NOT NULL DEFAULT 0,
  monthly_obligation NUMERIC(14, 2) NOT NULL DEFAULT 0,
  created_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_client_id ON clients (client_id);
CREATE INDEX IF NOT EXISTS idx_clients_aadhaar_number ON clients (aadhaar_number);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients (status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients (created_at DESC);

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS product_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_group_code TEXT NOT NULL UNIQUE,
  product_group_name TEXT NOT NULL,
  product_group_segment TEXT,
  product_group_type TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  updated_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL UNIQUE,
  product_code TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  product_group_id TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  updated_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_code TEXT NOT NULL UNIQUE,
  district_name TEXT NOT NULL,
  country_id TEXT NOT NULL,
  state_id TEXT NOT NULL,
  state_name TEXT NOT NULL,
  created_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  updated_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insurance_id TEXT NOT NULL UNIQUE,
  insurance_code TEXT NOT NULL UNIQUE,
  insurance_type TEXT NOT NULL,
  insurance_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  updated_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ifsc_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ifsc_code TEXT NOT NULL UNIQUE,
  bank_name TEXT NOT NULL,
  bank_branch TEXT NOT NULL,
  branch_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  mobile_number TEXT,
  created_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  updated_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purposes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purpose_id TEXT NOT NULL UNIQUE,
  purpose_code TEXT NOT NULL UNIQUE,
  purpose_name TEXT NOT NULL,
  main_purpose_id TEXT,
  is_main_purpose BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Active',
  created_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  updated_by UUID REFERENCES user_profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_groups_name ON product_groups (product_group_name);
CREATE INDEX IF NOT EXISTS idx_product_groups_status ON product_groups (status);
CREATE INDEX IF NOT EXISTS idx_products_name ON products (product_name);
CREATE INDEX IF NOT EXISTS idx_products_group_id ON products (product_group_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products (status);
CREATE INDEX IF NOT EXISTS idx_districts_state_id ON districts (state_id);
CREATE INDEX IF NOT EXISTS idx_insurance_name ON insurance (insurance_name);
CREATE INDEX IF NOT EXISTS idx_ifsc_codes_bank_name ON ifsc_codes (bank_name);
CREATE INDEX IF NOT EXISTS idx_purposes_name ON purposes (purpose_name);
