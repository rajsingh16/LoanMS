import { apiFetch } from '../../lib/api';

export type LoanApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected';

export type ApplicationDashboard = {
  summary: Record<'total' | 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'pending_document_verification', number> & Record<'requested_amount' | 'submitted_amount' | 'under_review_amount' | 'approved_amount' | 'rejected_amount', string>;
  distributions: { branches: DashboardGroupRow[]; products: DashboardGroupRow[]; officers: DashboardGroupRow[] };
  trends: { created: DashboardTrendRow[]; approved: DashboardTrendRow[]; rejected: DashboardTrendRow[] };
};
export type DashboardGroupRow = { id?: string | null; label: string; application_count: number; requested_amount: string };
export type DashboardTrendRow = { month: string; count: number };

export type FieldVerificationResult =
  | 'positive'
  | 'negative'
  | 'inconclusive';
export type ApplicantAssessmentResult =
  | 'positive'
  | 'negative'
  | 'inconclusive';
export type LoanDisbursementStatus =
  | 'completed'
  | 'failed'
  | 'cancelled';

export type LoanTermsRequest = {
  interestRate: number;
  tenure: number;
  repaymentFrequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly';
  emiAmount: number;
};

  export type CreateLoanDisbursementRequest = {
    disbursementDate: string;
    disbursementAmount: number;
    disbursementMode:
      | 'bank_transfer'
      | 'neft'
      | 'rtgs'
      | 'imps'
      | 'cheque'
      | 'other';
    bankAccountId?: string | null;
    referenceNumber?: string;
    remarks?: string;
  };

  export type LoanAccountListItem = {
    id: string;
    loan_account_number: string;
    loan_application_id: string;
    application_number: string;
    client_id: string;
    client_code: string;
    client_first_name: string;
    client_last_name?: string | null;
    branch_id: string;
    branch_code: string;
    branch_name: string;
    center_id: string;
    center_code: string;
    center_name: string;
    product_group_id: string;
    product_group_name: string;
    product_id: string;
    product_name: string;
    sanction_amount: number | string;
    loan_amount: number | string;
    sanction_date: string;
    interest_rate: number | string;
    tenure: number;
    repayment_frequency: string;
    emi_amount: number | string;
    loan_status: string;
    disbursement_status: string;
    total_disbursed: number | string;
    remaining_amount: number | string;
    created_at: string;
    updated_at: string;
  };
  
  export type LoanAccountDisbursement = {
    id: string;
    loan_id: string;
    disbursement_date: string;
    disbursement_amount: number | string;
    disbursement_mode: string;
    bank_account_id?: string | null;
    reference_number?: string | null;
    remarks?: string | null;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    created_by: string;
    updated_by?: string | null;
    created_at: string;
    updated_at: string;
  };
  
  export type LoanAccountDetail = LoanAccountListItem & {
    application_date: string;
    application_status: string;
    sanction_status: string;
    remarks?: string | null;
    created_by: string;
    updated_by?: string | null;
    disbursements: LoanAccountDisbursement[];
    eligible_bank_accounts: Array<{
      id: string;
      account_type: string;
      account_number: string;
      customer_name?: string | null;
    }>;
  };
  
  export type LoanAccountListParams = {
    search?: string;
    loanStatus?: string;
    disbursementStatus?: string;
    page?: number;
    limit?: number;
  };
  
  export type LoanAccountListResponse = {
    data: LoanAccountListItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };

export type LoanAccountReference = {
  id: string;
  loan_account_number: string;
};

const LOAN_ACCOUNT_BASE = '/api/loan-applications/accounts';
export interface LoanApplicationStatusUpdate {
  sanctionAmount?: number;
  sanctionDate?: string;
  sanctionRemarks?: string;
  //interestRate?: number;
  //tenure?: number;
  //emiAmount?: number;
  repaymentFrequency?: string;
  rejectionReason?: string;
  rejectionRemarks?: string;
}
export interface LoanApplicationAuditEvent {
  id: string;
  event_type: string;
  occurred_at: string;
  actor_name: string;
  previous_status?: string | null;
  new_status?: string | null;
  previous_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  remarks?: string | null;
  outcome: 'success' | 'failure';
  metadata?: Record<string, unknown>;
}
export interface LoanApplicationHistoryResponse { data: LoanApplicationAuditEvent[]; pagination: { page: number; limit: number; total: number; totalPages: number; }; }
export interface LoanApplicationChildAddress { id?: string; addressType?: string; address1: string; address2?: string; mohalla?: string; postOffice?: string; nearestPoliceStation?: string; pincode?: string; villageId?: string; districtId?: string; districtName?: string; state?: string; residenceType?: string; }
export interface LoanApplicationFamilyMember { id?: string; relation: string; firstName: string; lastName?: string; mobileNumber?: string; dateOfBirth?: string; idType?: string; idNumber?: string; additionalIdType?: string; additionalIdNumber?: string; maritalStatus?: string; employmentStatus?: string; qualification?: string; occupation?: string; occupationType?: string; considerForAssessment?: boolean; isNominee?: boolean; isCoApplicant?: boolean; isGuarantor?: boolean; }
export interface LoanApplicationBankAccount { id?: string; accountType: string; accountNumber: string; confirmAccountNumber?: string; ifscId?: string; ifscCode?: string; customerName?: string; bankName?: string; bankBranch?: string; forDisbursement?: boolean; forCollection?: boolean; nameMatchPercentage?: number; pennyDropDone?: boolean; }
export interface LoanApplicationDocument { id?: string; documentType: string; fileName?: string; storageKey?: string; mimeType?: string; fileSizeBytes?: number; verificationStatus?: string; rejectionReason?: string; uploadedAt?: string; }
export interface LoanApplicationUploadedDocument { id: string; loan_application_id: string; document_type: string; file_name: string; mime_type: string; file_size_bytes: number; verification_status: string; uploaded_at: string; }
export interface LoanApplicationRequest { branchId: string; centerId: string; clientId: string; clientMode?: 'existing' | 'new'; newClient?: import('../../clientService').ClientFormData; productGroupId: string; productId: string; purposeId?: string; subPurposeId?: string; isTopUp?: boolean; loanAmount: number; emiAmount?: number; interestRate?: number; tenure?: number; repaymentFrequency?: string; contractualFirstInstallmentDate?: string; fieldOfficerId?: string; remarks?: string; addresses?: LoanApplicationChildAddress[]; familyMembers?: LoanApplicationFamilyMember[]; bankAccounts?: LoanApplicationBankAccount[]; documents?: LoanApplicationDocument[]; deletedChildIds?: { addresses?: string[]; familyMembers?: string[]; bankAccounts?: string[] }; }
export interface ProductLoanTerms { minAmount: number; maxAmount?: number | null; minTenure?: number | null; maxTenure?: number | null; defaultTenure?: number | null; interestRate: number; interestCalculationMethod: string; repaymentFrequency: string; emiAmount: number; processingFee: number; insuranceCharge: number; otherCharges: number; totalInterest: number; totalPayableAmount: number; schedule: Array<{ installmentNumber: number; dueDate: string; openingPrincipal: number; principalComponent: number; interestComponent: number; installmentAmount: number; closingPrincipal: number }>; }
export interface LoanApplicationListItem { id: string; application_number: string; application_date: string; application_status: string; document_verification_status: string; sanction_status: string; loan_amount: number; emi_amount?: number; interest_rate?: number; tenure?: number; repayment_frequency?: string; client_id: string; first_name: string; last_name: string; branch_code: string; branch_name: string; center_code: string; center_name: string; product_group_name: string; product_name: string; purpose_name?: string; }
export interface LoanApplicationDetail {
  id: string; applicationNumber: string; applicationDate: string;
  applicationStatus: string; documentVerificationStatus: string; sanctionStatus: string;
  sanctionAmount?: number; sanctionDate?: string; sanctionAuthority?: string; sanctionRemarks?: string;
  rejectionReason?: string; rejectionRemarks?: string; rejectedBy?: string; rejectionDate?: string;
  branchId: string; centerId: string; clientId: string; productGroupId: string; productId: string; purposeId?: string; subPurposeId?: string;
  isTopUp: boolean; loanAmount: number; emiAmount?: number; interestRate?: number; tenure?: number; repaymentFrequency?: string; contractualFirstInstallmentDate?: string; totalInterest?: number; totalPayableAmount?: number; processingFee?: number; insuranceCharge?: number; otherCharges?: number; productTermsSnapshot?: Record<string, unknown>; repaymentSchedule?: ProductLoanTerms['schedule']; fieldOfficerId?: string; remarks?: string;
  clientCode: string; firstName: string; lastName: string; aadhaarNumber?: string; voterId?: string; kycType?: string; kycId?: string; dateOfBirth?: string; age?: number; gender?: string; fatherName?: string; motherName?: string; mobileNumber?: string; maritalStatus?: string; qualification?: string; preferredLanguage?: string; caste?: string; religion?: string; occupation?: string; agriculturalLand?: string; annualIncome?: number; monthlyIncome?: number; monthlyExpense?: number; monthlyObligation?: number; householdIncome?: number; branchCode: string; branchName: string; centerCode: string; centerName: string;
  productGroupName: string; productName: string; purposeName?: string; subPurposeName?: string; officerFirstName?: string; officerLastName?: string;
  addresses: Array<LoanApplicationChildAddress & { districtName?: string; villageName?: string }>;
  familyMembers: LoanApplicationFamilyMember[];
  bankAccounts: Array<LoanApplicationBankAccount & { ifscCode?: string }>;
  documents: Array<LoanApplicationDocument & { uploadedBy?: string; uploadedAt?: string }>;
  creditBureauChecks: Array<{ bureauProvider: string; checkStatus: string; bureauResult?: string | null; creditScore?: number | null; isTest: boolean; checkedAt?: string | null; createdAt: string }>;
}
export interface LoanApplicationDocument {
  id?: string;
  documentType: string;
  fileName?: string;
  storageKey?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  verificationStatus?: string;
  rejectionReason?: string;
  uploadedAt?: string;
}
export interface LoanApplicationFieldVerification {
  id: string;
  loan_application_id: string;
  field_officer_id: string;
  officer_first_name?: string;
  officer_last_name?: string;
  officer_employee_id?: string;
  visit_date: string;
  visit_location?: string | null;
  applicant_met: boolean;
  business_verified: boolean;
  residence_verified: boolean;
  findings?: string | null;
  remarks?: string | null;
  verification_result: FieldVerificationResult;
  created_by: string;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoanApplicationFieldVerificationRequest {
  fieldOfficerId: string;
  visitDate: string;
  visitLocation?: string;
  applicantMet: boolean;
  businessVerified: boolean;
  residenceVerified: boolean;
  findings?: string;
  remarks?: string;
  verificationResult: FieldVerificationResult;
}

export interface LoanApplicationAssessment {
  id: string;
  loan_application_id: string;

  monthly_income?: number | null;
  monthly_expenses?: number | null;
  existing_obligations?: number | null;

  household_income?: number | null;
  household_expenses?: number | null;

  net_monthly_income?: number | null;
  repayment_capacity?: number | null;

  recommended_loan_amount?: number | null;
  recommended_emi?: number | null;

  assessment_result: ApplicantAssessmentResult;
  assessment_remarks?: string | null;

  assessed_by: string;
  assessor_first_name?: string;
  assessor_last_name?: string;

  assessed_at: string;
  created_at: string;
  updated_at: string;
}

export interface LoanApplicationAssessmentRequest {
  monthlyIncome?: number | null;
  monthlyExpenses?: number | null;
  existingObligations?: number | null;

  householdIncome?: number | null;
  householdExpenses?: number | null;

  recommendedLoanAmount?: number | null;
  recommendedEmi?: number | null;

  assessmentResult: ApplicantAssessmentResult;
  assessmentRemarks?: string;
}

interface LoanApplicationDetailResponse {
  id: string; application_number: string; application_date: string; application_status: string; document_verification_status: string; sanction_status: string;
  sanction_amount?: number | string | null; sanction_date?: string | null; sanction_authority?: string | null; sanction_remarks?: string | null;
  rejection_reason?: string | null; rejection_remarks?: string | null; rejected_by?: string | null; rejection_date?: string | null;
  branch_id: string; center_id: string; client_id: string; product_group_id: string; product_id: string; purpose_id?: string | null; sub_purpose_id?: string | null;
  is_top_up: boolean; loan_amount: number | string; emi_amount?: number | string | null; interest_rate?: number | string | null; tenure?: number | null; repayment_frequency?: string | null; contractual_first_installment_date?: string | null; total_interest?: number | string | null; total_payable_amount?: number | string | null; processing_fee?: number | string | null; insurance_charge?: number | string | null; other_charges?: number | string | null; product_terms_snapshot?: Record<string, unknown>; repayment_schedule?: ProductLoanTerms['schedule']; field_officer_id?: string | null; remarks?: string | null;
  client_code: string; first_name: string; last_name: string; aadhaar_number?: string; voter_card_number?: string; kyc_type?: string; kyc_id?: string; date_of_birth?: string; age?: number; gender?: string; father_name?: string; mother_name?: string; mobile_number?: string; marital_status?: string; qualification?: string; language?: string; caste?: string; religion?: string; occupation?: string; land_holding?: string; annual_income?: number | string; monthly_income?: number | string; monthly_expense?: number | string; monthly_obligation?: number | string; household_income?: number | string; branch_code: string; branch_name: string; center_code: string; center_name: string;
  product_group_name: string; product_name: string; purpose_name?: string | null; sub_purpose_name?: string | null; officer_first_name?: string | null; officer_last_name?: string | null;
  addresses: Array<{ id: string; address_type: string; address1: string; address2?: string | null; mohalla?: string | null; post_office?: string | null; nearest_police_station?: string | null; pincode?: string | null; village_id?: string | null; village_name?: string | null; district_id?: string | null; district_name?: string | null; state?: string | null; residence_type?: string | null }>;
  familyMembers: Array<{ id: string; relation: string; first_name: string; last_name?: string | null; mobile_number?: string | null; date_of_birth?: string | null; id_type?: string | null; id_number?: string | null; additional_id_type?: string | null; additional_id_number?: string | null; marital_status?: string | null; employment_status?: string | null; qualification?: string | null; occupation?: string | null; occupation_type?: string | null; consider_for_assessment: boolean; is_nominee: boolean; is_co_applicant: boolean; is_guarantor: boolean }>;
  bankAccounts: Array<{ id: string; account_type: string; account_number: string; ifsc_id?: string | null; ifsc_code?: string | null; bank_name?: string | null; bank_branch?: string | null; customer_name?: string | null; for_disbursement: boolean; for_collection: boolean; name_match_percentage?: number | string | null; penny_drop_done: boolean }>;
  documents: Array<{ id: string; document_type: string; file_name?: string | null; storage_key?: string | null; mime_type?: string | null; file_size_bytes?: number | string | null; verification_status: string; rejection_reason?: string | null; uploaded_at?: string }>;
  creditBureauChecks?: Array<{ bureau_provider: string; check_status: string; bureau_result?: string | null; credit_score?: number | null; is_test: boolean; checked_at?: string | null; created_at: string }>;
}

const APP_BASE = '/api/loan-applications';
async function read<T>(res: Response): Promise<T> { const json = await res.json(); if (!res.ok) throw new Error(json.error?.message || json.message || 'Loan application request failed'); return json.data ?? json; }
function mapDetail(row: LoanApplicationDetailResponse): LoanApplicationDetail {
  return {
    id: row.id, applicationNumber: row.application_number, applicationDate: row.application_date, applicationStatus: row.application_status,
    documentVerificationStatus: row.document_verification_status, sanctionStatus: row.sanction_status,
    sanctionAmount: row.sanction_amount == null ? undefined : Number(row.sanction_amount), sanctionDate: row.sanction_date?.slice(0, 10), sanctionAuthority: row.sanction_authority || undefined, sanctionRemarks: row.sanction_remarks || undefined,
    rejectionReason: row.rejection_reason || undefined, rejectionRemarks: row.rejection_remarks || undefined, rejectedBy: row.rejected_by || undefined, rejectionDate: row.rejection_date || undefined,
    branchId: row.branch_id, centerId: row.center_id, clientId: row.client_id, productGroupId: row.product_group_id, productId: row.product_id,
    purposeId: row.purpose_id || undefined, subPurposeId: row.sub_purpose_id || undefined, isTopUp: row.is_top_up, loanAmount: Number(row.loan_amount),
    emiAmount: row.emi_amount == null ? undefined : Number(row.emi_amount), interestRate: row.interest_rate == null ? undefined : Number(row.interest_rate),
    tenure: row.tenure == null ? undefined : Number(row.tenure), repaymentFrequency: row.repayment_frequency || undefined, contractualFirstInstallmentDate: row.contractual_first_installment_date?.slice(0, 10) || undefined, totalInterest: row.total_interest == null ? undefined : Number(row.total_interest), totalPayableAmount: row.total_payable_amount == null ? undefined : Number(row.total_payable_amount), processingFee: row.processing_fee == null ? undefined : Number(row.processing_fee), insuranceCharge: row.insurance_charge == null ? undefined : Number(row.insurance_charge), otherCharges: row.other_charges == null ? undefined : Number(row.other_charges), productTermsSnapshot: row.product_terms_snapshot, repaymentSchedule: row.repayment_schedule, fieldOfficerId: row.field_officer_id || undefined, remarks: row.remarks || undefined,
    clientCode: row.client_code, firstName: row.first_name, lastName: row.last_name, aadhaarNumber: row.aadhaar_number, voterId: row.voter_card_number, kycType: row.kyc_type, kycId: row.kyc_id,
    dateOfBirth: row.date_of_birth ? row.date_of_birth.slice(0, 10) : undefined, age: row.age, gender: row.gender, fatherName: row.father_name, motherName: row.mother_name, mobileNumber: row.mobile_number,
    maritalStatus: row.marital_status, qualification: row.qualification, preferredLanguage: row.language, caste: row.caste, religion: row.religion, occupation: row.occupation, agriculturalLand: row.land_holding,
    annualIncome: row.annual_income == null ? undefined : Number(row.annual_income), monthlyIncome: row.monthly_income == null ? undefined : Number(row.monthly_income), monthlyExpense: row.monthly_expense == null ? undefined : Number(row.monthly_expense), monthlyObligation: row.monthly_obligation == null ? undefined : Number(row.monthly_obligation), householdIncome: row.household_income == null ? undefined : Number(row.household_income),
    branchCode: row.branch_code, branchName: row.branch_name, centerCode: row.center_code, centerName: row.center_name,
    productGroupName: row.product_group_name, productName: row.product_name, purposeName: row.purpose_name || undefined, subPurposeName: row.sub_purpose_name || undefined,
    officerFirstName: row.officer_first_name || undefined, officerLastName: row.officer_last_name || undefined,
    addresses: row.addresses.map(a => ({ id: a.id, addressType: a.address_type, address1: a.address1, address2: a.address2 || undefined, mohalla: a.mohalla || undefined, postOffice: a.post_office || undefined, nearestPoliceStation: a.nearest_police_station || undefined, pincode: a.pincode || undefined, villageId: a.village_id || undefined, villageName: a.village_name || undefined, districtId: a.district_id || undefined, districtName: a.district_name || undefined, state: a.state || undefined, residenceType: a.residence_type || undefined })),
    familyMembers: row.familyMembers.map(m => ({ id: m.id, relation: m.relation, firstName: m.first_name, lastName: m.last_name || undefined, mobileNumber: m.mobile_number || undefined, dateOfBirth: m.date_of_birth ? m.date_of_birth.slice(0, 10) : undefined, idType: m.id_type || undefined, idNumber: m.id_number || undefined, additionalIdType: m.additional_id_type || undefined, additionalIdNumber: m.additional_id_number || undefined, maritalStatus: m.marital_status || undefined, employmentStatus: m.employment_status || undefined, qualification: m.qualification || undefined, occupation: m.occupation || undefined, occupationType: m.occupation_type || undefined, considerForAssessment: m.consider_for_assessment, isNominee: m.is_nominee, isCoApplicant: m.is_co_applicant, isGuarantor: m.is_guarantor })),
    bankAccounts: row.bankAccounts.map(b => ({ id: b.id, accountType: b.account_type, accountNumber: b.account_number, confirmAccountNumber: b.account_number, ifscId: b.ifsc_id || undefined, ifscCode: b.ifsc_code || undefined, bankName: b.bank_name || undefined, bankBranch: b.bank_branch || undefined, customerName: b.customer_name || undefined, forDisbursement: b.for_disbursement, forCollection: b.for_collection, nameMatchPercentage: b.name_match_percentage == null ? undefined : Number(b.name_match_percentage), pennyDropDone: b.penny_drop_done })),
    documents: row.documents.map(d => ({ id: d.id, documentType: d.document_type, fileName: d.file_name || undefined, storageKey: d.storage_key || undefined, mimeType: d.mime_type || undefined, fileSizeBytes: d.file_size_bytes == null ? undefined : Number(d.file_size_bytes), verificationStatus: d.verification_status, rejectionReason: d.rejection_reason || undefined, uploadedAt: d.uploaded_at })),
    creditBureauChecks: (row.creditBureauChecks || []).map(check => ({ bureauProvider: check.bureau_provider, checkStatus: check.check_status, bureauResult: check.bureau_result, creditScore: check.credit_score == null ? null : Number(check.credit_score), isTest: check.is_test, checkedAt: check.checked_at, createdAt: check.created_at })),
  };
}

export const loanApplicationService = {
  getDashboard: async (params: { startDate?: string; endDate?: string; branchId?: string; productId?: string; officerId?: string } = {}): Promise<ApplicationDashboard> => {
    const query = new URLSearchParams();
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.branchId) query.set('branchId', params.branchId);
    if (params.productId) query.set('productId', params.productId);
    if (params.officerId) query.set('officerId', params.officerId);
    return read(await apiFetch(`${APP_BASE}/dashboard${query.size ? `?${query}` : ''}`));
  },
  getAllApplications: async (params?: { search?: string; status?: string }): Promise<LoanApplicationListItem[]> => { const query = new URLSearchParams(params as Record<string, string> | undefined).toString(); return read(await apiFetch(`${APP_BASE}${query ? `?${query}` : ''}`)); },
  getApplication: async (id: string): Promise<LoanApplicationDetail> => {
    return mapDetail(await read<LoanApplicationDetailResponse>(await apiFetch(`${APP_BASE}/${id}`)));
  },
  getLoanAccountForApplication: async (id: string): Promise<LoanAccountReference | null> => {
    const response = await apiFetch(
      `${APP_BASE}/${encodeURIComponent(id)}/loan-account`,
    );
    const json = await response.json();

    if (!response.ok) {
      throw new Error(
        json.error?.message ||
          json.message ||
          'Failed to load the loan account for this application',
      );
    }

    // Unlike most API calls, this endpoint intentionally returns null when
    // the application has not generated an account yet. Do not use `read()`
    // here: its nullish fallback is useful for legacy responses but turns
    // `{ data: null }` into the response wrapper, which looks truthy to UI.
    return json.data ?? null;
  },
  getFieldOfficers: async (): Promise<Array<{ id: string; first_name: string; last_name: string; employee_id?: string }>> => read(await apiFetch(`${APP_BASE}/field-officers`)),
  calculateTerms: async (payload: Pick<LoanApplicationRequest, 'productGroupId' | 'productId' | 'loanAmount' | 'tenure'>): Promise<ProductLoanTerms> => read(await apiFetch(`${APP_BASE}/calculate-terms`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })),
  uploadDocument: async (applicationId: string, file: File, documentType: string): Promise<LoanApplicationUploadedDocument> => {
    const body = new FormData(); body.append('documentType', documentType); body.append('file', file);
    return read(await apiFetch(`${APP_BASE}/${applicationId}/documents`, { method: 'POST', body }));
  },
  downloadDocument: async (applicationId: string, documentId: string): Promise<Blob> => {
    const response = await apiFetch(`${APP_BASE}/${applicationId}/documents/${documentId}`);
    if (!response.ok) {
      const json = await response.json().catch(() => null);
      throw new Error(json?.error?.message || json?.message || 'Unable to open document');
    }
    return response.blob();
  },
  verifyDocument: async (
    applicationId: string,
    documentId: string,
    status: 'verified' | 'rejected',
    reason?: string,
  ): Promise<LoanApplicationDetail> => {
    return mapDetail(
      await read<LoanApplicationDetailResponse>(
        await apiFetch(
          `${APP_BASE}/${applicationId}/documents/${documentId}/verification`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status,
              reason,
            }),
          },
        ),
      ),
    );
  },
  createApplication: async (data: LoanApplicationRequest): Promise<LoanApplicationDetail> => mapDetail(await read<LoanApplicationDetailResponse>(await apiFetch(APP_BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }))),
  createLoanAccount: async (applicationId: string) => {
    const response = await apiFetch(
      `${APP_BASE}/${encodeURIComponent(applicationId)}/create-loan`,
      {
        method: 'POST',
      },
    );
  
    return read(response);
  },
  updateLoanTerms: async (
    applicationId: string,
    terms: LoanTermsRequest,
  ): Promise<LoanApplicationDetail> => {
    return mapDetail(
      await read<LoanApplicationDetailResponse>(
        await apiFetch(`${APP_BASE}/${encodeURIComponent(applicationId)}/loan-terms`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(terms),
        }),
      ),
    );
  },

  updateApplication: async (id: string, data: LoanApplicationRequest): Promise<LoanApplicationDetail> => mapDetail(await read<LoanApplicationDetailResponse>(await apiFetch(`${APP_BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }))),
  updateApplicationStatus: async (
    id: string,
    status: LoanApplicationStatus,
    payload: LoanApplicationStatusUpdate = {},
  ): Promise<LoanApplicationDetail> => {
    return mapDetail(
      await read<LoanApplicationDetailResponse>(
        await apiFetch(`${APP_BASE}/${id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
            ...payload,
          }),
        })
      )
    );
  },
  getHistory: async (id: string, page = 1, limit = 25): Promise<LoanApplicationHistoryResponse> => {
    const response = await apiFetch(`${APP_BASE}/${encodeURIComponent(id)}/history?page=${page}&limit=${limit}`);
    const json = await response.json();
    if (!response.ok) throw new Error(json?.error?.message || 'Unable to load application history');
    return json;
  },
  getFieldVerifications: async(applicationId: string
  ) : Promise<LoanApplicationFieldVerification[]> => {
    return read(
      await apiFetch(
        `${APP_BASE}/${applicationId}/field-verifications`,
      ),
    );
  },
  createFieldVerification: async(
    applicationId: string,
    payload: LoanApplicationFieldVerificationRequest
  ): Promise<LoanApplicationFieldVerification> =>{
    return read(
      await apiFetch(
        `${APP_BASE}/${applicationId}/field-verifications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      ),
    );
  },
  getAssessments : async(
    applicationId: string
  ): Promise<LoanApplicationAssessment[]> =>{
    return read(
      await apiFetch(
        `${APP_BASE}/${applicationId}/assessments`,
      ),
    );
  },
  createAssessment: async(
    applicationId: string,
  payload: LoanApplicationAssessmentRequest
  ): Promise<LoanApplicationAssessment> =>{
    return read(
      await apiFetch(
        `${APP_BASE}/${applicationId}/assessments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      ),
    );
  },
  deleteApplication: async (id: string): Promise<void> => { await read(await apiFetch(`${APP_BASE}/${id}`, { method: 'DELETE' })); },

};

export const loanAccountService = {
  getAccounts: async (
    filters: LoanAccountListParams = {},
  ): Promise<LoanAccountListResponse> => {
    const query = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        query.set(key, String(value));
      }
    });

    const response = await apiFetch(
      `${LOAN_ACCOUNT_BASE}${query.size ? `?${query.toString()}` : ''}`,
    );

    const json = await response.json();

    if (!response.ok) {
      throw new Error(
        json.error?.message ||
          json.message ||
          'Failed to load loan accounts',
      );
    }

    return {
      data: json.data ?? [],
      pagination: json.pagination ?? {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  },

  getAccount: async (id: string): Promise<LoanAccountDetail> => {
    const response = await apiFetch(
      `${LOAN_ACCOUNT_BASE}/${encodeURIComponent(id)}`,
    );

    const json = await response.json();

    if (!response.ok) {
      throw new Error(
        json.error?.message ||
          json.message ||
          'Failed to load loan account',
      );
    }

    return json.data;
  },
  
  createDisbursement: async (
    loanId: string,
    payload: CreateLoanDisbursementRequest,
  ): Promise<LoanAccountDisbursement> => {
    const response = await apiFetch(
      `${LOAN_ACCOUNT_BASE}/${encodeURIComponent(loanId)}/disbursements`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );

    const json = await response.json();

    if (!response.ok) {
      throw new Error(
        json.error?.message ||
          json.message ||
          'Failed to record disbursement',
      );
    }

    return json.data ?? json;
  },

  updateDisbursementStatus: async (
    loanId: string,
    disbursementId: string,
    status: LoanDisbursementStatus,
  ): Promise<LoanAccountDisbursement> => {
    const response = await apiFetch(
      `${LOAN_ACCOUNT_BASE}/${encodeURIComponent(loanId)}/disbursements/${encodeURIComponent(disbursementId)}/status`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      },
    );

    const json = await response.json();

    if (!response.ok) {
      throw new Error(
        json.error?.message ||
          json.message ||
          'Failed to update disbursement status',
      );
    }

    return json.data ?? json;
  },

};
