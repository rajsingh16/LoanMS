const SENSITIVE_KEYS = /password|token|secret|authorization|aadhaar|kyc|account_number|id_number/i;
const EVENT_NAME = /^[a-z][a-z0-9_]{2,79}$/;

function safeText(value, limit = 2000) {
  if (value == null) return null;
  return String(value).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, limit) || null;
}

function sanitize(value, depth = 0) {
  if (value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (depth > 4 || Array.isArray(value) && value.length > 50) return undefined;
  if (Array.isArray(value)) return value.map((item) => sanitize(item, depth + 1)).filter((item) => item !== undefined);
  if (typeof value !== 'object') return undefined;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !SENSITIVE_KEYS.test(key))
    .map(([key, item]) => [key, sanitize(item, depth + 1)])
    .filter(([, item]) => item !== undefined));
}

export function requestCorrelationId(req) {
  const candidate = req?.headers?.['x-request-id'];
  return typeof candidate === 'string' && /^[a-zA-Z0-9._:-]{1,128}$/.test(candidate) ? candidate : null;
}

export async function recordAuditEvent(client, event) {
  if (!event?.actorUserId || !event?.entityId || !['loan_application', 'role', 'credit_bureau_check', 'neft_batch', 'neft_upload', 'branch_audit_upload'].includes(event.entityType) || !EVENT_NAME.test(event.eventType || '')) {
    throw new Error('Invalid audit event');
  }
  const previousValues = sanitize(event.previousValues || null);
  const newValues = sanitize(event.newValues || null);
  const metadata = sanitize(event.metadata || {}) || {};
  await client.query(
    `INSERT INTO audit_events (entity_type, entity_id, event_type, actor_user_id, previous_status, new_status, previous_values, new_values, remarks, outcome, correlation_id, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10,$11,$12::jsonb)`,
    [event.entityType, event.entityId, event.eventType, event.actorUserId, event.previousStatus || null, event.newStatus || null,
      JSON.stringify(previousValues), JSON.stringify(newValues), safeText(event.remarks), event.outcome === 'failure' ? 'failure' : 'success',
      safeText(event.correlationId, 128), JSON.stringify(metadata)],
  );
}
