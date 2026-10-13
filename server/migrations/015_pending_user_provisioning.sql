-- Allow public registrations to remain unassigned until an administrator provisions them.
ALTER TABLE user_profiles ALTER COLUMN role DROP NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'user_profiles'::regclass
      AND conname = 'user_profiles_status_check'
  ) THEN
    ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_status_check;
  END IF;
  ALTER TABLE user_profiles
    ADD CONSTRAINT user_profiles_status_check
    CHECK (status IN ('pending', 'active', 'inactive', 'suspended'));
END $$;

CREATE INDEX IF NOT EXISTS idx_user_profiles_pending_status
  ON user_profiles (status) WHERE status = 'pending';
