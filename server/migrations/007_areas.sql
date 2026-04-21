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

