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
