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

