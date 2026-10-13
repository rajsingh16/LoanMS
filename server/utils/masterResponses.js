export function masterDuplicateResponse(res, fallback) {
  return res.status(409).json({
    data: null,
    error: { message: fallback },
    message: fallback,
  });
}

export function masterError(res, error, fallback = 'Request failed') {
  console.error(error);
  if (error?.code === '23505') {
    return masterDuplicateResponse(res, 'A record with this code already exists.');
  }
  return res.status(500).json({
    data: null,
    error: { message: fallback },
    message: fallback,
  });
}

export const masterAuditJoin = `
  LEFT JOIN user_profiles cb ON cb.id = t.created_by
  LEFT JOIN user_profiles ub ON ub.id = t.updated_by
`;

export const masterAuditSelect = `
  cb.first_name AS created_first_name,
  cb.last_name AS created_last_name,
  ub.first_name AS updated_first_name,
  ub.last_name AS updated_last_name
`;
