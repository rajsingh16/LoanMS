-- Run once against your PostgreSQL database (same schema you used with Supabase).
-- Maps login email/password to existing user_profiles.id rows.

CREATE TABLE IF NOT EXISTS user_credentials (
  user_id UUID PRIMARY KEY REFERENCES user_profiles (id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_credentials_email ON user_credentials (email);
