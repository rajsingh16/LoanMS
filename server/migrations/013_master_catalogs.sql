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
