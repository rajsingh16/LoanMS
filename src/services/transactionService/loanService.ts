import { apiFetch } from '../../lib/api';
import { LoanAccountListItem, loanAccountService } from './loanApplicationService';

export interface LoanDetail {
  id: string;
  /** Primary key of the backing `loan_accounts` record. */
  loanAccountId: string;
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
const LOAN_ACCOUNT_PAGE_SIZE = 100;

function asNumber(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function asText(value: string | null | undefined) {
  return String(value ?? '').trim();
}

function mapAccountToLoanDetail(account: LoanAccountListItem): LoanDetail {
  const disbursedAmount = asNumber(account.total_disbursed);
  return {
    id: account.id,
    loanAccountId: account.id,
    loanCode: asText(account.loan_account_number),
    clientCode: asText(account.client_code),
    customerName: [account.client_first_name, account.client_last_name].filter(Boolean).join(' ').trim(),
    customerDOB: '',
    idProofName: '',
    idProofNumber: '',
    addressProofName: '',
    addressProofNumber: '',
    coApplicantName: '',
    coApplicantDOB: '',
    coApplicantIdType1: '',
    coApplicantIdNumber1: '',
    coApplicantIdType2: '',
    coApplicantIdNumber2: '',
    guarantorName: '',
    guarantorDOB: '',
    guarantorIdType1: '',
    guarantorIdNumber1: '',
    guarantorIdType2: '',
    guarantorIdNumber2: '',
    branch: asText(account.branch_name),
    center: asText(account.center_name),
    bcPartner: '',
    disbursementDate: '',
    coApplicantName2: '',
    nomineeName: '',
    spouseName: '',
    status: asText(account.loan_status),
    productGroup: asText(account.product_group_name),
    productCode: '',
    productName: asText(account.product_name),
    healthcareOpted: false,
    isNetOffEligible: false,
    interestAmount: 0,
    disbursedAmount,
    insuranceAmount: 0,
    interestOutstanding: 0,
    principalOutstanding: disbursedAmount,
    installmentsOutstanding: 0,
    principalArrear: 0,
    interestArrear: 0,
    installmentsArrear: 0,
    lender: '',
    funder: '',
    loanCycle: 0,
    isUtilized: false,
    utilCheckLatitude: 0,
    utilCheckLongitude: 0,
    repaymentFrequency: asText(account.repayment_frequency),
    policyId: '',
    preclosingAmount: 0,
    preclosingReason: '',
    maturityDate: '',
    closureDate: '',
    state: '',
    zone: '',
    division: '',
    postDisbVerified: false,
    verificationDate: '',
    verificationRemarks: '',
    extLoanId: '',
    extLANNo: '',
    extCustId: '',
    netPayableAmount: asNumber(account.remaining_amount),
    netOffLoanId: '',
    netOffCollSequence: 0,
    siApproveDate: '',
    siRejectionReason: '',
    siRequestDate: '',
    siStatus: '',
    siVendor: '',
    insuranceId: '',
    nextDisbursementDate: '',
    neftDate: '',
    isFullyDisbursed: account.disbursement_status === 'fully_disbursed',
    totalInstallments: 0,
    processingFee: 0,
    tenureInMonths: asNumber(account.tenure),
    interestRate: asNumber(account.interest_rate),
    subPurposeId: '',
    subPurposeName: '',
    purposeId: '',
    purposeName: '',
    utilizationCheckDate: '',
    hospiCashName: '',
    hospiCashAmount: 0,
    emiStartDate: '',
    paymentMode: '',
    paymentDoneFrom: '',
    fo: '',
    bankAccountType: '',
    bankAccountNumber: '',
    ifscCode: '',
    bankName: '',
    bankBranch: '',
    healthCareAmount: 0,
    sanctionStatus: '',
    neftTransactionNumber: '',
    disbursedBy: '',
  };
}

function matchesLoanFilters(loan: LoanDetail, filters?: Partial<LoanFilterOptions>) {
  if (!filters) return true;
  if (filters.branch && !loan.branch.toLowerCase().includes(filters.branch.toLowerCase())) return false;
  if (filters.center && !loan.center.toLowerCase().includes(filters.center.toLowerCase())) return false;
  if (filters.productGroup && !loan.productGroup.toLowerCase().includes(filters.productGroup.toLowerCase())) return false;
  if (filters.product && !loan.productName.toLowerCase().includes(filters.product.toLowerCase())) return false;
  if (filters.businessPartner && !loan.bcPartner.toLowerCase().includes(filters.businessPartner.toLowerCase())) return false;
  if (filters.clientCode && !loan.clientCode.toLowerCase().includes(filters.clientCode.toLowerCase())) return false;
  if (filters.loanCode && !loan.loanCode.toLowerCase().includes(filters.loanCode.toLowerCase())) return false;
  if (filters.status && loan.status !== filters.status) return false;
  if (filters.sanctionStatus && loan.sanctionStatus !== filters.sanctionStatus) return false;
  if (filters.externalLoanId && !loan.extLoanId.toLowerCase().includes(filters.externalLoanId.toLowerCase())) return false;
  if (filters.closureDateFrom && filters.closureDateTo && !(loan.closureDate && loan.closureDate >= filters.closureDateFrom && loan.closureDate <= filters.closureDateTo)) return false;
  if (filters.disbursementDateFrom && filters.disbursementDateTo && !(loan.disbursementDate && loan.disbursementDate >= filters.disbursementDateFrom && loan.disbursementDate <= filters.disbursementDateTo)) return false;
  if (filters.neftDateFrom && filters.neftDateTo && !(loan.neftDate && loan.neftDate >= filters.neftDateFrom && loan.neftDate <= filters.neftDateTo)) return false;
  return true;
}

export const loanService = {
  getAllLoans: async (filters?: Partial<LoanFilterOptions>): Promise<LoanDetail[]> => {
    const accounts: LoanAccountListItem[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const result = await loanAccountService.getAccounts({ page, limit: LOAN_ACCOUNT_PAGE_SIZE });
      accounts.push(...result.data);
      totalPages = result.pagination.totalPages || 1;
      page += 1;
    } while (page <= totalPages);

    return accounts.map(mapAccountToLoanDetail).filter(loan => matchesLoanFilters(loan, filters));
  },

  getLoanById: async (id: string): Promise<LoanDetail> => {
    return mapAccountToLoanDetail(await loanAccountService.getAccount(id));
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
