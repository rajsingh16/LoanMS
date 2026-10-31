-- Append-only, reusable application audit trail. Retention is managed operationally;
-- this migration deliberately does not purge historical events.
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  actor_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  previous_status TEXT,
  new_status TEXT,
  previous_values JSONB,
  new_values JSONB,
  remarks TEXT,
  outcome TEXT NOT NULL DEFAULT 'success' CHECK (outcome IN ('success', 'failure')),
  correlation_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT audit_events_actor_required_for_success CHECK (outcome = 'failure' OR actor_user_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_audit_events_entity_time
  ON audit_events(entity_type, entity_id, occurred_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor_time
  ON audit_events(actor_user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_correlation
  ON audit_events(correlation_id) WHERE correlation_id IS NOT NULL;

-- Application roles only receive SELECT through the API; no UPDATE/DELETE route exists.
-- Database owners should grant INSERT to the application role and withhold UPDATE/DELETE.
