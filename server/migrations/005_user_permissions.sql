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

