// Shared client creation rules.  Both the Clients master and Loan Application
// workflows use this so their validation, duplicate handling and ID format stay aligned.
export function normalizeClientPayload(body = {}) {
  return {
    first_name: body.first_name ?? body.firstName, last_name: body.last_name ?? body.lastName,
    aadhaar_number: body.aadhaar_number ?? body.aadhaarNumber, voter_card_number: body.voter_card_number ?? body.voterCardNumber,
    kyc_type: body.kyc_type ?? body.kycType, kyc_id: body.kyc_id ?? body.kycId, cycle: body.cycle,
    date_of_birth: body.date_of_birth ?? body.dateOfBirth, father_name: body.father_name ?? body.fatherName,
    mother_name: body.mother_name ?? body.motherName, gender: body.gender, marital_status: body.marital_status ?? body.maritalStatus,
    mobile_number: body.mobile_number ?? body.mobileNumber, status: body.status, qualification: body.qualification,
    language: body.language, caste: body.caste, religion: body.religion, occupation: body.occupation,
    land_holding: body.land_holding ?? body.landHolding, monthly_income: body.monthly_income ?? body.monthlyIncome,
    annual_income: body.annual_income ?? body.annualIncome, household_income: body.household_income ?? body.householdIncome,
    monthly_expense: body.monthly_expense ?? body.monthlyExpense, monthly_obligation: body.monthly_obligation ?? body.monthlyObligation,
  };
}

function parseDateOnly(dateOfBirth) {
  if (typeof dateOfBirth !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth);
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { year, month, day };
}

function ageFor(birth) {
  const today = new Date();
  let age = today.getFullYear() - birth.year;
  if (today.getMonth() + 1 < birth.month || (today.getMonth() + 1 === birth.month && today.getDate() < birth.day)) age -= 1;
  return age;
}

export async function createClientRecord(db, payload, userId) {
  const b = normalizeClientPayload(payload);
  const required = ['first_name','last_name','aadhaar_number','voter_card_number','kyc_type','kyc_id','date_of_birth','father_name','mother_name','gender','marital_status','mobile_number','qualification','language','caste','religion','occupation','land_holding'];
  const missing = required.filter(field => !b[field]);
  if (missing.length) throw new Error(`Missing required client fields: ${missing.join(', ')}`);
  const birthDate = parseDateOnly(b.date_of_birth);
  if (!birthDate) throw new Error('Client date of birth must be a valid YYYY-MM-DD calendar date');
  const today = new Date();
  if (birthDate.year > today.getFullYear() || (birthDate.year === today.getFullYear() && (birthDate.month > today.getMonth() + 1 || (birthDate.month === today.getMonth() + 1 && birthDate.day > today.getDate())))) throw new Error('Client date of birth cannot be in the future');
  const duplicate = await db.query('SELECT id FROM clients WHERE aadhaar_number = $1', [b.aadhaar_number]);
  if (duplicate.rowCount) { const error = new Error('A client with this Aadhaar number already exists.'); error.code = '23505'; throw error; }
  const clientId = `CL${String(Date.now()).slice(-6)}`;
  const { rows } = await db.query(`INSERT INTO clients (client_id,first_name,last_name,aadhaar_number,voter_card_number,kyc_type,kyc_id,cycle,date_of_birth,age,father_name,mother_name,gender,marital_status,mobile_number,status,qualification,language,caste,religion,occupation,land_holding,monthly_income,annual_income,household_income,monthly_expense,monthly_obligation,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28) RETURNING *`, [clientId,b.first_name,b.last_name,b.aadhaar_number,b.voter_card_number,b.kyc_type,b.kyc_id,b.cycle ?? 1,b.date_of_birth,ageFor(birthDate),b.father_name,b.mother_name,b.gender,b.marital_status,b.mobile_number,b.status ?? 'active',b.qualification,b.language,b.caste,b.religion,b.occupation,b.land_holding,b.monthly_income ?? 0,b.annual_income ?? 0,b.household_income ?? 0,b.monthly_expense ?? 0,b.monthly_obligation ?? 0,userId]);
  return rows[0];
}
