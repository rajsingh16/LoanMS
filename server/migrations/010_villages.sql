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
