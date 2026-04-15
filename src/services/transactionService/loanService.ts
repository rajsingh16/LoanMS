import { apiFetch } from '../../lib/api';

export interface LoanDetail {
  id: string;
  loanCode: string;
  clientCode: string;
  customerName: string;
  customerDOB: string;
  idProofName: string;
  idProofNumber: string;
  addressProofName: string;
  addressProofNumber: string;
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
  branch: string;
  center: string;
  bcPartner: string;
  disbursementDate: string;
  coApplicantName2: string;
  nomineeName: string;
  spouseName: string;
  status: string;
  productGroup: string;
  productCode: string;
  productName: string;
  healthcareOpted: boolean;
  isNetOffEligible: boolean;
  interestAmount: number;
  disbursedAmount: number;
  insuranceAmount: number;
  interestOutstanding: number;
  principalOutstanding: number;
  installmentsOutstanding: number;
  principalArrear: number;
  interestArrear: number;
  installmentsArrear: number;
  lender: string;
  funder: string;
  loanCycle: number;
  isUtilized: boolean;
  utilCheckLatitude: number;
  utilCheckLongitude: number;
  repaymentFrequency: string;
  policyId: string;
  preclosingAmount: number;
  preclosingReason: string;
  maturityDate: string;
  closureDate: string;
  state: string;
  zone: string;
  division: string;
  postDisbVerified: boolean;
  verificationDate: string;
  verificationRemarks: string;
  extLoanId: string;
  extLANNo: string;
  extCustId: string;
  netPayableAmount: number;
  netOffLoanId: string;
  netOffCollSequence: number;
  siApproveDate: string;
  siRejectionReason: string;
  siRequestDate: string;
  siStatus: string;
  siVendor: string;
  insuranceId: string;
  nextDisbursementDate: string;
  neftDate: string;
  isFullyDisbursed: boolean;
  totalInstallments: number;
  processingFee: number;
  tenureInMonths: number;
  interestRate: number;
  subPurposeId: string;
  subPurposeName: string;
  purposeId: string;
  purposeName: string;
  utilizationCheckDate: string;
  hospiCashName: string;
  hospiCashAmount: number;
  emiStartDate: string;
  paymentMode: string;
  paymentDoneFrom: string;
  fo: string;
  bankAccountType: string;
  bankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  bankBranch: string;
  healthCareAmount: number;
  sanctionStatus: string;
  neftTransactionNumber: string;
  disbursedBy: string;
}

export interface LoanFilterOptions {
  branch?: string;
  center?: string;
  productGroup?: string;
  product?: string;
  businessPartner: string;
  clientCode?: string;
  loanCode?: string;
  status?: string;
  sanctionStatus?: string;
  externalLoanId?: string;
  closureDateFrom: string;
  closureDateTo: string;
  disbursementDateFrom: string;
  disbursementDateTo: string;
  neftDateFrom: string;
  neftDateTo: string;
}

const BASE_URL = '/api/loans';

export const loanService = {
  getAllLoans: async (filters?: Partial<LoanFilterOptions>): Promise<LoanDetail[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }
    const url = params.toString() ? `${BASE_URL}?${params.toString()}` : BASE_URL;
    const res = await apiFetch(url);
    const json = await res.json();
    return json.data ?? json;
  },

  getLoanById: async (id: string): Promise<LoanDetail> => {
    const res = await apiFetch(`${BASE_URL}/${id}`);
    const json = await res.json();
    return json.data ?? json;
  },

  updateLoan: async (id: string, formData: Partial<LoanDetail>): Promise<LoanDetail> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update loan');
    return json.data ?? json;
  },

  deleteLoan: async (id: string): Promise<void> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Failed to delete loan');
    }
  },

  uploadMasterPolicy: async (file: File): Promise<{ success: boolean; message?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiFetch(`${BASE_URL}/upload-master-policy`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Master policy upload failed');
    return json;
  },

  cashAdjust: async (loanId: string, amount: number, reason: string): Promise<{ success: boolean; message?: string }> => {
    const res = await apiFetch(`${BASE_URL}/${loanId}/cash-adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, reason }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Cash adjust failed');
    return json;
  },

  tagFunder: async (loanIds: string[], funderId: string): Promise<{ success: boolean; message?: string }> => {
    const res = await apiFetch(`${BASE_URL}/tag-funder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loanIds, funderId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Tag funder failed');
    return json;
  },

  exportLoansCSV: async (loans: LoanDetail[]): Promise<void> => {
    const headers = [
      'Loan Code', 'Client Code', 'Customer Name', 'Customer DOB', 'ID Proof Name',
      'ID Proof Number', 'Address Proof Name', 'Address Proof Number', 'Co-Applicant Name',
      'Co-Applicant DOB', 'Branch', 'Center', 'BC Partner', 'Disbursement Date',
      'Nominee Name', 'Spouse Name', 'Status', 'Product Group', 'Product Code', 'Product Name',
      'Healthcare Opted', 'Is Net Off Eligible', 'Interest Amount', 'Disbursed Amount',
      'Insurance Amount', 'Interest Outstanding', 'Principal Outstanding',
      'Installments Outstanding', 'Principal Arrear', 'Interest Arrear', 'Installments Arrear',
      'Lender', 'Funder', 'Loan Cycle', 'Is Utilized', 'Repayment Frequency', 'Policy Id',
      'Preclosing Amount', 'Preclosing Reason', 'Maturity Date', 'Closure Date',
      'State', 'Zone', 'Division', 'Post Disb Verified', 'Verification Date',
      'Verification Remarks', 'Ext Loan Id', 'Ext LAN No', 'Ext Cust Id',
      'Net Payable Amount', 'SI Status', 'SI Vendor', 'Insurance Id',
      'NEFT Date', 'Is Fully Disbursed', 'Total Installments', 'Processing Fee',
      'Tenure In Months', 'Interest Rate', 'Sub Purpose Name', 'Purpose Name',
      'EMI Start Date', 'Payment Mode', 'FO', 'Bank Account Type', 'Bank Account Number',
      'IFSC Code', 'Bank Name', 'Bank Branch', 'Health Care Amount', 'Sanction Status',
      'NEFT Transaction Number', 'Disbursed By',
    ];

    const csvContent = [
      headers.join(','),
      ...loans.map(l => [
        l.loanCode, l.clientCode, l.customerName, l.customerDOB, l.idProofName,
        l.idProofNumber, l.addressProofName, l.addressProofNumber, l.coApplicantName,
        l.coApplicantDOB, l.branch, l.center, l.bcPartner, l.disbursementDate,
        l.nomineeName, l.spouseName, l.status, l.productGroup, l.productCode, l.productName,
        l.healthcareOpted ? 'Yes' : 'No', l.isNetOffEligible ? 'Yes' : 'No',
        l.interestAmount, l.disbursedAmount, l.insuranceAmount, l.interestOutstanding,
        l.principalOutstanding, l.installmentsOutstanding, l.principalArrear,
        l.interestArrear, l.installmentsArrear, l.lender, l.funder, l.loanCycle,
        l.isUtilized ? 'Yes' : 'No', l.repaymentFrequency, l.policyId,
        l.preclosingAmount, l.preclosingReason, l.maturityDate, l.closureDate,
        l.state, l.zone, l.division, l.postDisbVerified ? 'Yes' : 'No',
        l.verificationDate, l.verificationRemarks, l.extLoanId, l.extLANNo, l.extCustId,
        l.netPayableAmount, l.siStatus, l.siVendor, l.insuranceId,
        l.neftDate, l.isFullyDisbursed ? 'Yes' : 'No', l.totalInstallments,
        l.processingFee, l.tenureInMonths, l.interestRate, l.subPurposeName, l.purposeName,
        l.emiStartDate, l.paymentMode, l.fo, l.bankAccountType, l.bankAccountNumber,
        l.ifscCode, l.bankName, l.bankBranch, l.healthCareAmount, l.sanctionStatus,
        l.neftTransactionNumber, l.disbursedBy,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loans_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};