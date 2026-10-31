// Terms live in the existing product `data` JSON and are copied in canonical
// form to application and account snapshots. There are no defaults here: an
// omitted value must remain a visible schedule-generation blocker.
const values = {
  trancheTreatment: new Set(['sanctioned_amount', 'disbursed_to_date']),
  subsequentDisbursementTreatment: new Set(['prohibit_after_schedule', 'require_authorized_reschedule']),
  businessDayConvention: new Set(['none', 'next_business_day']),
  firstInstallmentRule: new Set(['one_period_after_first_completed_disbursement']),
  roundingPolicy: new Set(['half_up_2dp', 'half_even_2dp']),
  interestCalculationMethod: new Set(['reducing_balance', 'flat_rate']),
  interestRateBasis: new Set(['annual_nominal']),
  repaymentFrequency: new Set(['weekly', 'fortnightly', 'monthly', 'quarterly']),
  feesTreatment: new Set(['scheduled', 'excluded']),
  feeAllocationOrder: new Set(['fees_interest_principal']),
  penaltyTreatment: new Set(['assessed_separately', 'excluded']),
};

const aliases = { 'reducing balance': 'reducing_balance', 'flat rate': 'flat_rate' };
function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function canonical(value) {
  const raw = text(value).toLowerCase().replace(/\s+/g, ' ');
  return aliases[raw] ?? raw.replace(/[ -]+/g, '_');
}
function nonNegative(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}
function positiveInteger(value) {
  const number = nonNegative(value);
  return number !== null && Number.isInteger(number) && number > 0 ? number : null;
}
function nonNegativeInteger(value) {
  const number = nonNegative(value);
  return number !== null && Number.isInteger(number) ? number : null;
}
function optionalBoolean(value) { return typeof value === 'boolean' ? value : null; }

export function productContractualTerms(config = {}) {
  return {
    trancheTreatment: canonical(config.trancheTreatment),
    subsequentDisbursementTreatment: canonical(config.subsequentDisbursementTreatment),
    businessDayConvention: canonical(config.businessDayConvention),
    businessCalendar: text(config.businessCalendar),
    firstInstallmentRule: canonical(config.firstInstallmentRule),
    firstInstallmentOverrideAllowed: optionalBoolean(config.firstInstallmentOverrideAllowed),
    roundingPolicy: canonical(config.roundingPolicy),
    moratoriumPeriod: nonNegativeInteger(config.moratoriumPeriod),
    interestCalculationMethod: canonical(config.interestCalculationMethod || config.interestCalculationOn),
    interestRateBasis: canonical(config.interestRateBasis),
    interestRate: nonNegative(config.interestRate),
    repaymentFrequency: canonical(config.repaymentFrequency || config.principalRepaymentFrequency),
    tenure: positiveInteger(config.tenure ?? config.tenureInMonths),
    installmentCount: positiveInteger(config.installmentCount || config.totalInstallment),
    feesTreatment: canonical(config.feesTreatment),
    feeAllocationOrder: canonical(config.feeAllocationOrder),
    penaltyTreatment: canonical(config.penaltyTreatment),
  };
}

export function validateProductContractualTerms(config = {}) {
  const terms = productContractualTerms(config);
  const supplied = Object.values(terms).some(value => value !== '' && value !== null);
  if (!supplied) return { terms, complete: false, missing: Object.keys(terms) };
  const invalid = [];
  for (const [field, allowed] of Object.entries(values)) {
    const value = terms[field];
    if (value !== '' && value !== null && !allowed.has(value)) invalid.push(field);
  }
  for (const field of ['moratoriumPeriod', 'tenure']) {
    if (config[field] !== undefined && config[field] !== '' && terms[field] === null) invalid.push(field);
  }
  if (config.interestRate !== undefined && config.interestRate !== '' && terms.interestRate === null) invalid.push('interestRate');
  if (config.firstInstallmentOverrideAllowed !== undefined && config.firstInstallmentOverrideAllowed !== null && terms.firstInstallmentOverrideAllowed === null) invalid.push('firstInstallmentOverrideAllowed');
  if (terms.businessDayConvention === 'next_business_day' && !terms.businessCalendar) invalid.push('businessCalendar');
  if (terms.businessDayConvention === 'none' && terms.businessCalendar) invalid.push('businessCalendar');
  if (invalid.length) throw new Error(`Invalid or incompatible contractual repayment term: ${[...new Set(invalid)].join(', ')}`);
  return { terms, complete: scheduleEligibility(terms).eligible, missing: scheduleEligibility(terms).missing };
}

export function scheduleEligibility(terms) {
  const normalized = productContractualTerms(terms || {});
  const required = ['trancheTreatment', 'subsequentDisbursementTreatment', 'businessDayConvention', 'firstInstallmentRule', 'firstInstallmentOverrideAllowed', 'roundingPolicy', 'moratoriumPeriod', 'interestCalculationMethod', 'interestRateBasis', 'interestRate', 'repaymentFrequency', 'tenure', 'installmentCount', 'feesTreatment', 'feeAllocationOrder', 'penaltyTreatment'];
  const missing = required.filter(field => normalized[field] === undefined || normalized[field] === null || normalized[field] === '');
  for (const [field, allowed] of Object.entries(values)) {
    if (normalized[field] !== '' && normalized[field] !== null && !allowed.has(normalized[field])) missing.push(`invalid ${field}`);
  }
  if (normalized.businessDayConvention === 'next_business_day' && !normalized.businessCalendar) missing.push('businessCalendar');
  if (normalized.businessDayConvention === 'none' && normalized.businessCalendar) missing.push('businessCalendar must be blank when contractual dates are retained');
  return { eligible: missing.length === 0, missing: [...new Set(missing)] };
}

// The first implementation intentionally supports only the subset whose
// calculation and calendar semantics are fully represented in a snapshot.
// Other valid contracts are retained and reported as unsupported, never
// approximated with a generic EMI or calendar fallback.
export function scheduleGenerationEligibility(terms) {
  const base = scheduleEligibility(terms);
  const normalized = productContractualTerms(terms || {});
  const blockers = [];
  if (normalized.interestCalculationMethod && normalized.interestCalculationMethod !== 'flat_rate') blockers.push('interestCalculationMethod: only flat_rate is implemented');
  if (normalized.interestRateBasis && normalized.interestRateBasis !== 'annual_nominal') blockers.push('interestRateBasis: only annual_nominal is implemented');
  if (normalized.businessDayConvention && normalized.businessDayConvention !== 'none') blockers.push('businessDayConvention: an authoritative calendar resolver is not implemented');
  if (normalized.moratoriumPeriod !== null && normalized.moratoriumPeriod !== 0) blockers.push('moratoriumPeriod: non-zero moratorium requires an approved accrual rule');
  if (normalized.trancheTreatment && normalized.trancheTreatment !== 'disbursed_to_date') blockers.push('trancheTreatment: sanctioned_amount requires an approved undisbursed-tranche policy');
  if (normalized.subsequentDisbursementTreatment && normalized.subsequentDisbursementTreatment !== 'prohibit_after_schedule') blockers.push('subsequentDisbursementTreatment: authorized rescheduling is not implemented');
  if (normalized.feesTreatment && normalized.feesTreatment !== 'excluded') blockers.push('feesTreatment: scheduled fee amount and assessment timing are not configured');
  return { ...base, blockers, eligible: base.eligible && blockers.length === 0, terms: normalized };
}
