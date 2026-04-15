import { apiFetch } from '../../lib/api';
export interface LoanApplicationData {
    id: string;
    applicationId: string;
    applicationDate: string;
    clientCode: string;
    branch: string;
    centerCode: string;
    centerName: string;
    centerGroup: string;
    firstName: string;
    middleName: string;
    lastName: string;
    husbandName: string;
    fatherName: string;
    motherName: string;
    coApplicantName: string;
    coApplicantDOB: string;
    coApplicantIdType1: string;
    coApplicantIdNumber1: string;
    coApplicantIdType2: string;
    coApplicantIdNumber2: string;
    guarantorName: string;
    guarantorDOB: string;
    guarantorIdType1: string;
    guarantorIdNumber1: string;
    guarantorIdType2: string;
    guarantorIdNumber2: string;
    docVerifiedStatus: string;
    applicationStatus: string;
    docRejectionReason: string;
    docRejectionRemarks: string;
    appRejectionReason: string;
    remarks: string;
    cycle: number;
    productGroup: string;
    product: string;
    loanAmount: number;
    payableAmount: number;
    processingCharge: number;
    insuranceCharge: number;
    documentationCharge: number;
    healthCareAmount: number;
    sanctionAmount: number;
    sanctionDate: string;
    tenure: number;
    repaymentFrequency: string;
    aadhaarId: string;
    voterId: string;
    gender: string;
    dob: string;
    age: number;
    maritalStatus: string;
    preferredLanguage: string;
    mobileNumber: string;
    alternateMobileNo: string;
    correspondenceAddress: string;
    pincode: string;
    village: string;
    district: string;
    state: string;
    zone: string;
    division: string;
    caste: string;
    religion: string;
    bankName: string;
    ifscCode: string;
    bankAccNo: string;
    customerNameInBank: string;
    nameMatchPercentage: number;
    pennyDropDone: boolean;
    annualIncome: number;
    land: string;
    qualification: string;
    occupation: string;
    externalLanNo: string;
    fo: string;
    kycSource: string;
    docRejectionCount: number;
    docVerificationDate: string;
    docVerifiedBy: string;
    otherKycType: string;
    otherKycId: string;
    insertedBy: string;
    insertedOn: string;
    oldLoanId: string;
    oldCustomerId: string;
    bcPartner: string;
    eKycNumber: string;
    eKycReferenceKey: string;
    sanctionStatus: string;
    lastModifyName: string;
    lastModifyDate: string;
    lastDocumentsVerificationDate: string;
    lastDocumentsUploader: string;
    cgtDoneBy: string;
    cgtDoneDate: string;
    grtDoneBy: string;
    grtDate: string;
    grt2Status: string;
    grt2AssignedTo: string;
    grt2Remarks: string;
    grt2CompletedOn: string;
    totalMonthlyIncome: number;
    totalMonthlyExpenses: number;
    activeMfiAccountByCb: number;
    outstandingAmountByCb: number;
    noOfOverdueAccountsByCb: number;
    overdueAmountByCb: number;
    writeOffAccountByCb: number;
    writeOffAmountByCb: number;
    emiObligation: number;
    proposedEmi: number;
    foirPercentage: number;
  }
   
  export interface LoanApplicationFilterOptions {
    branch?: string;
    center?: string;
    productGroup?: string;
    product?: string;
    businessPartner?: string;
    clientCode?: string;
    aadhaarNumber?: string;
    applicationId?: string;
    applicationStatus?: string;
    grt2Status?: string;
    clmStatus?: string;
    appVerificationStatus?: string;
    bcSanctionStatus?: string;
    externalLanNumber?: string;
    applicationDateFrom?: string;
    applicationDateTo?: string;
    verificationDateFrom?: string;
    verificationDateTo?: string;
  }
   
  const APP_BASE = '/api/loan-applications';
   
  export const loanApplicationService = {
    getAllApplications: async (): Promise<LoanApplicationData[]> => {
      const res = await apiFetch(APP_BASE);
      const json = await res.json();
      return json.data ?? json;
    },
   
    createApplication: async (formData: any): Promise<LoanApplicationData> => {
      const res = await apiFetch(APP_BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create application');
      return json.data ?? json;
    },
   
    updateApplication: async (id: string, formData: any): Promise<LoanApplicationData> => {
      const res = await apiFetch(`${APP_BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update application');
      return json.data ?? json;
    },
   
    deleteApplication: async (id: string): Promise<void> => {
      const res = await apiFetch(`${APP_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) { const json = await res.json(); throw new Error(json.message || 'Failed to delete'); }
    },
   
    searchByKyc: async (aadhaarNumber: string, voterId: string): Promise<Partial<LoanApplicationData> | null> => {
      const res = await apiFetch(`${APP_BASE}/search-kyc?aadhaar=${aadhaarNumber}&voter=${voterId}`);
      const json = await res.json();
      return json.data ?? null;
    },
   
    uploadDocument: async (applicationId: string, docType: string, file: File): Promise<{ success: boolean; url?: string }> => {
      const formData = new FormData(); formData.append('file', file); formData.append('docType', docType);
      const res = await apiFetch(`${APP_BASE}/${applicationId}/documents`, { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Document upload failed');
      return json;
    },
   
    exportCSV: async (applications: LoanApplicationData[]): Promise<void> => {
      const headers = ['Application ID', 'Application Date', 'Client Code', 'Branch', 'Center Code', 'Center Name', 'First Name', 'Last Name', 'Application Status', 'Loan Amount', 'Product', 'Cycle', 'FO', 'Inserted On'];
      const csv = [headers.join(','), ...applications.map(a => [a.applicationId, a.applicationDate, a.clientCode, a.branch, a.centerCode, a.centerName, a.firstName, a.lastName, a.applicationStatus, a.loanAmount, a.product, a.cycle, a.fo, a.insertedOn].join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `loan_applications_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
    },
  };