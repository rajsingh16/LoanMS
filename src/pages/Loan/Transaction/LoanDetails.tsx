import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from '../../../components/Common/DataTable';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { loanService, LoanDetail, LoanFilterOptions } from '../../../services/transactionService/loanService';
import { repaymentService, RepaymentPayment, RepaymentSchedule, ScheduleEligibility } from '../../../services/transactionService/repaymentService';
import {
  Search, Download, Upload, Tag, DollarSign, Calendar, User,
   Building, CheckCircle, XCircle, Edit, Trash2,
  Filter, ChevronDown, AlertCircle,
} from 'lucide-react';

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
}

// ─── Filter Dropdown ──────────────────────────────────────────────────────────
const FilterDropdown: React.FC<{
  onFilter: (filters: LoanFilterOptions) => void;
}> = ({ onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<LoanFilterOptions>({
    businessPartner: '',
    closureDateFrom: '',
    closureDateTo: '',
    disbursementDateFrom: '',
    disbursementDateTo: '',
    neftDateFrom: '',
    neftDateTo: '',
  });

  const change = (key: keyof LoanFilterOptions, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const apply = () => { onFilter(filters); setIsOpen(false); };

  const clear = () => {
    const empty: LoanFilterOptions = {
      businessPartner: '',
      closureDateFrom: '',
      closureDateTo: '',
      disbursementDateFrom: '',
      disbursementDateTo: '',
      neftDateFrom: '',
      neftDateTo: '',
    };
    setFilters(empty);
    onFilter(empty);
  };

  const textField = (key: keyof LoanFilterOptions, label: string, placeholder: string, required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={(filters[key] as string) || ''}
        onChange={e => change(key, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder={placeholder}
      />
    </div>
  );

  const dateField = (key: keyof LoanFilterOptions, label: string, required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="date"
        value={(filters[key] as string) || ''}
        onChange={e => change(key, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      />
    </div>
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
      >
        <Filter className="w-4 h-4" />
        <span>Search Filter</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[600px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Filters</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {textField('branch', 'Branch', 'Enter branch')}
              {textField('center', 'Center', 'Enter center')}
              {textField('productGroup', 'Product Group', 'Enter product group')}
              {textField('product', 'Product', 'Enter product')}
              {textField('businessPartner', 'Business Partner', 'Enter business partner', true)}
              {textField('clientCode', 'Client Code', 'Enter client code')}
              {textField('loanCode', 'Loan Code', 'Enter loan code')}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select value={filters.status || ''} onChange={e => change('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="written-off">Written Off</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sanction Status</label>
                <select value={filters.sanctionStatus || ''} onChange={e => change('sanctionStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="">All Status</option>
                  <option value="sanctioned">Sanctioned</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {textField('externalLoanId', 'External Loan ID', 'Enter external loan ID')}

              {dateField('closureDateFrom', 'Closure Date From', true)}
              {dateField('closureDateTo', 'Closure Date To', true)}
              {dateField('disbursementDateFrom', 'Disbursement Date From', true)}
              {dateField('disbursementDateTo', 'Disbursement Date To', true)}
              {dateField('neftDateFrom', 'NEFT Date From', true)}
              {dateField('neftDateTo', 'NEFT Date To', true)}
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
              <button onClick={clear} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                Clear All
              </button>
              <button onClick={apply} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const LoanDetailsPage: React.FC = () => {
  const [loans, setLoans] = useState<LoanDetail[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<LoanDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRepaymentLoan, setSelectedRepaymentLoan] = useState<LoanDetail | null>(null);
  const [scheduleEligibility, setScheduleEligibility] = useState<ScheduleEligibility | null>(null);
  const [repaymentSchedule, setRepaymentSchedule] = useState<RepaymentSchedule | null>(null);
  const [repaymentLoading, setRepaymentLoading] = useState(false);
  const [repaymentError, setRepaymentError] = useState('');
  const [payments, setPayments] = useState<RepaymentPayment[]>([]);
  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentDate: new Date().toISOString().slice(0, 10), paymentMethod: 'cash', referenceNumber: '', remarks: '' });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const masterPolicyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadLoans(); }, []);

  const loadLoans = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await loanService.getAllLoans();
      setLoans(data);
      setFilteredLoans(data);
    } catch (reason) {
      setLoans([]);
      setFilteredLoans([]);
      setError(reason instanceof Error ? reason.message : 'Failed to load loan details');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters: LoanFilterOptions) => {
    let filtered = loans;

    if (filters.branch) filtered = filtered.filter(l => l.branch.toLowerCase().includes(filters.branch!.toLowerCase()));
    if (filters.center) filtered = filtered.filter(l => l.center.toLowerCase().includes(filters.center!.toLowerCase()));
    if (filters.productGroup) filtered = filtered.filter(l => l.productGroup.toLowerCase().includes(filters.productGroup!.toLowerCase()));
    if (filters.product) filtered = filtered.filter(l => l.productName.toLowerCase().includes(filters.product!.toLowerCase()));
    if (filters.businessPartner) filtered = filtered.filter(l => l.bcPartner.toLowerCase().includes(filters.businessPartner.toLowerCase()));
    if (filters.clientCode) filtered = filtered.filter(l => l.clientCode.toLowerCase().includes(filters.clientCode!.toLowerCase()));
    if (filters.loanCode) filtered = filtered.filter(l => l.loanCode.toLowerCase().includes(filters.loanCode!.toLowerCase()));
    if (filters.status) filtered = filtered.filter(l => l.status === filters.status);
    if (filters.sanctionStatus) filtered = filtered.filter(l => l.sanctionStatus === filters.sanctionStatus);
    if (filters.externalLoanId) filtered = filtered.filter(l => l.extLoanId.toLowerCase().includes(filters.externalLoanId!.toLowerCase()));
    if (filters.closureDateFrom && filters.closureDateTo) filtered = filtered.filter(l => l.closureDate && l.closureDate >= filters.closureDateFrom && l.closureDate <= filters.closureDateTo);
    if (filters.disbursementDateFrom && filters.disbursementDateTo) filtered = filtered.filter(l => l.disbursementDate >= filters.disbursementDateFrom && l.disbursementDate <= filters.disbursementDateTo);
    if (filters.neftDateFrom && filters.neftDateTo) filtered = filtered.filter(l => l.neftDate >= filters.neftDateFrom && l.neftDate <= filters.neftDateTo);

    setFilteredLoans(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this loan?')) return;
    try {
      await loanService.deleteLoan(id);
      setLoans(prev => prev.filter(l => l.id !== id));
      setFilteredLoans(prev => prev.filter(l => l.id !== id));
      setSuccess('Loan deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to delete loan');
    }
  };

  const handleMasterPolicyUpload = () => {
    masterPolicyInputRef.current?.click();
  };

  const handleMasterPolicyFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await loanService.uploadMasterPolicy(file);
      setSuccess(result.message || 'Master policy uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to upload master policy');
    }
    e.target.value = '';
  };

  const handleCashAdjust = () => {
    setSuccess('Cash Adjust: select a loan to adjust.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDownload = async () => {
    try {
      await loanService.exportLoansCSV(filteredLoans);
      setSuccess('CSV exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to export CSV');
    }
  };

  const handleTagFunder = () => {
    setSuccess('Tag Funder: select loans to tag.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const viewRepayment = async (loan: LoanDetail) => {
    setSelectedRepaymentLoan(loan);
    setRepaymentLoading(true);
    setRepaymentError('');
    setScheduleEligibility(null);
    setRepaymentSchedule(null);
    try {
      const [eligibility, schedule, history] = await Promise.all([
        repaymentService.eligibility(loan.loanAccountId),
        repaymentService.schedule(loan.loanAccountId),
        repaymentService.payments(loan.loanAccountId),
      ]);
      setScheduleEligibility(eligibility);
      setRepaymentSchedule(schedule);
      setPayments(history);
    } catch (reason) {
      setRepaymentError(reason instanceof Error ? reason.message : 'Failed to load repayment details');
    } finally {
      setRepaymentLoading(false);
    }
  };

  const postPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedRepaymentLoan || !repaymentSchedule?.installments.length || !scheduleEligibility?.eligible) return;
    setPaymentSubmitting(true); setRepaymentError('');
    try {
      await repaymentService.postPayment(selectedRepaymentLoan.loanAccountId, { ...paymentForm, idempotencyKey: crypto.randomUUID() });
      setPaymentForm(current => ({ ...current, amount: '', referenceNumber: '', remarks: '' }));
      await viewRepayment(selectedRepaymentLoan);
    } catch (reason) { setRepaymentError(reason instanceof Error ? reason.message : 'Failed to post payment'); }
    finally { setPaymentSubmitting(false); }
  };

  const reversePayment = async (payment: RepaymentPayment) => {
    const reason = window.prompt('Reason for reversal');
    if (!reason?.trim() || !selectedRepaymentLoan) return;
    setRepaymentLoading(true); setRepaymentError('');
    try { await repaymentService.reversePayment(payment.id, reason.trim()); await viewRepayment(selectedRepaymentLoan); }
    catch (reason) { setRepaymentError(reason instanceof Error ? reason.message : 'Failed to reverse payment'); setRepaymentLoading(false); }
  };

  const generateSchedule = async () => {
    if (!selectedRepaymentLoan) return;
    setRepaymentLoading(true);
    setRepaymentError('');
    try {
      await repaymentService.generate(selectedRepaymentLoan.loanAccountId);
      await viewRepayment(selectedRepaymentLoan);
    } catch (reason) {
      setRepaymentError(reason instanceof Error ? reason.message : 'Failed to generate repayment schedule');
      setRepaymentLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'closed': return <XCircle className="w-4 h-4 text-blue-600" />;
      case 'written-off': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'closed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'written-off': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getBooleanIcon = (value: boolean) => value
    ? <CheckCircle className="w-4 h-4 text-green-600" />
    : <XCircle className="w-4 h-4 text-gray-400" />;

  const columns = [
    {
      key: 'actions', label: 'Action',
      render: (_: unknown, row: LoanDetail) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard module="loan" permission="write">
            <button onClick={() => console.log('Edit loan:', row.id)} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded" title="Edit">
              <Edit className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard module="loan" permission="delete">
            <button onClick={() => handleDelete(row.id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard module="loan" permission="read" fallback={null}>
            <button onClick={() => void viewRepayment(row)} className="p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded" title="Repayment schedule">
              <Calendar className="w-4 h-4" />
            </button>
          </PermissionGuard>
        </div>
      ),
    },
    { key: 'loanCode', label: 'Loan Code', sortable: true, render: (v: string) => <span className="font-mono font-medium">{v}</span> },
    { key: 'clientCode', label: 'Client Code', sortable: true, render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'customerName', label: 'Customer Name', sortable: true, render: (v: string) => <div className="flex items-center space-x-2"><User className="w-4 h-4 text-gray-400" /><span className="font-medium">{v}</span></div> },
    { key: 'customerDOB', label: 'Customer DOB', render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{formatDate(v)}</span></div> },
    { key: 'idProofName', label: 'ID Proof Name', sortable: true },
    { key: 'idProofNumber', label: 'ID Proof Number', render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'addressProofName', label: 'Address Proof Name', sortable: true },
    { key: 'addressProofNumber', label: 'Address Proof Number', render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'coApplicantName', label: 'Co-Applicant Name', sortable: true },
    { key: 'coApplicantDOB', label: 'Co-Applicant DOB', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'coApplicantIdType1', label: 'Co-Applicant ID Type 1' },
    { key: 'coApplicantIdNumber1', label: 'Co-Applicant ID Number 1' },
    { key: 'coApplicantIdType2', label: 'Co-Applicant ID Type 2' },
    { key: 'coApplicantIdNumber2', label: 'Co-Applicant ID Number 2' },
    { key: 'guarantorName', label: 'Guarantor Name' },
    { key: 'guarantorDOB', label: 'Guarantor DOB', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'guarantorIdType1', label: 'Guarantor ID Type 1' },
    { key: 'guarantorIdNumber1', label: 'Guarantor ID Number 1' },
    { key: 'guarantorIdType2', label: 'Guarantor ID Type 2' },
    { key: 'guarantorIdNumber2', label: 'Guarantor ID Number 2' },
    { key: 'branch', label: 'Branch', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Building className="w-4 h-4 text-gray-400" /><span>{v}</span></div> },
    { key: 'center', label: 'Center', sortable: true },
    { key: 'bcPartner', label: 'BC Partner', sortable: true },
    { key: 'disbursementDate', label: 'Disbursement Date', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> },
    { key: 'coApplicantName2', label: 'Co Applicant Name 2' },
    { key: 'nomineeName', label: 'Nominee Name' },
    { key: 'spouseName', label: 'Spouse Name' },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (v: string) => <div className="flex items-center space-x-2">{getStatusIcon(v)}<span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(v)}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span></div>,
    },
    { key: 'productGroup', label: 'Product Group', sortable: true },
    { key: 'productCode', label: 'Product Code', sortable: true, render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'productName', label: 'Product Name', sortable: true },
    { key: 'healthcareOpted', label: 'Healthcare Opted', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'isNetOffEligible', label: 'Is Net Off Eligible', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'interestAmount', label: 'Interest Amount', sortable: true, render: (v: number) => <div className="flex items-center space-x-1"><DollarSign className="w-4 h-4 text-gray-400" /><span>₹{v.toLocaleString()}</span></div> },
    { key: 'disbursedAmount', label: 'Disbursed Amount', sortable: true, render: (v: number) => <div className="flex items-center space-x-1"><DollarSign className="w-4 h-4 text-green-500" /><span className="font-medium">₹{v.toLocaleString()}</span></div> },
    { key: 'insuranceAmount', label: 'Insurance Amount', render: (v: number) => `₹${v.toLocaleString()}` },
    { key: 'interestOutstanding', label: 'Interest Outstanding', render: (v: number) => `₹${v.toLocaleString()}` },
    { key: 'principalOutstanding', label: 'Principal Outstanding', render: (v: number) => `₹${v.toLocaleString()}` },
    { key: 'installmentsOutstanding', label: 'Installments Outstanding' },
    { key: 'principalArrear', label: 'Principal Arrear', render: (v: number) => `₹${v.toLocaleString()}` },
    { key: 'interestArrear', label: 'Interest Arrear', render: (v: number) => `₹${v.toLocaleString()}` },
    { key: 'installmentsArrear', label: 'Installments Arrear' },
    { key: 'lender', label: 'Lender', sortable: true },
    { key: 'funder', label: 'Funder', sortable: true },
    { key: 'loanCycle', label: 'Loan Cycle', sortable: true, render: (v: number) => <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">Cycle {v}</span> },
    { key: 'isUtilized', label: 'Is Utilized', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'utilCheckLatitude', label: 'Util Check Latitude', render: (v: number) => v?.toFixed(6) ?? '-' },
    { key: 'utilCheckLongitude', label: 'Util Check Longitude', render: (v: number) => v?.toFixed(6) ?? '-' },
    { key: 'repaymentFrequency', label: 'Repayment Frequency', sortable: true },
    { key: 'policyId', label: 'Policy Id' },
    { key: 'preclosingAmount', label: 'Preclosing Amount', render: (v: number) => `₹${v.toLocaleString()}` },
    { key: 'preclosingReason', label: 'Preclosing Reason' },
    { key: 'maturityDate', label: 'Maturity Date', render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> },
    { key: 'closureDate', label: 'Closure Date', render: (v: string) => v ? <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> : '-' },
    { key: 'state', label: 'State', sortable: true },
    { key: 'zone', label: 'Zone', sortable: true },
    { key: 'division', label: 'Division', sortable: true },
    { key: 'postDisbVerified', label: 'Post Disb Verified', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'verificationDate', label: 'Verification Date', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'verificationRemarks', label: 'Verification Remarks' },
    { key: 'extLoanId', label: 'Ext Loan Id' },
    { key: 'extLANNo', label: 'Ext LAN No' },
    { key: 'extCustId', label: 'Ext Cust Id' },
    { key: 'netPayableAmount', label: 'Net Payable Amount', render: (v: number) => `₹${v.toLocaleString()}` },
    { key: 'netOffLoanId', label: 'Net Off Loan Id' },
    { key: 'netOffCollSequence', label: 'Net Off Coll Sequence' },
    { key: 'siApproveDate', label: 'SI Approve Date', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'siRejectionReason', label: 'SI Rejection Reason' },
    { key: 'siRequestDate', label: 'SI Request Date', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'siStatus', label: 'SI Status' },
    { key: 'siVendor', label: 'SI Vendor' },
    { key: 'insuranceId', label: 'Insurance Id' },
    { key: 'nextDisbursementDate', label: 'Next Disbursement Date', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'neftDate', label: 'NEFT Date', render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> },
    { key: 'isFullyDisbursed', label: 'Is Fully Disbursed', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'totalInstallments', label: 'Total Installments' },
    { key: 'processingFee', label: 'Processing Fee', render: (v: number) => `₹${v.toLocaleString()}` },
    { key: 'tenureInMonths', label: 'Tenure In Months', render: (v: number) => `${v} months` },
    { key: 'interestRate', label: 'Interest Rate', render: (v: number) => `${v}%` },
    { key: 'subPurposeId', label: 'Sub Purpose Id' },
    { key: 'subPurposeName', label: 'Sub Purpose Name' },
    { key: 'purposeId', label: 'Purpose Id' },
    { key: 'purposeName', label: 'Purpose Name' },
    { key: 'utilizationCheckDate', label: 'Utilization Check Date', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'hospiCashName', label: 'Hospi Cash Name' },
    { key: 'hospiCashAmount', label: 'Hospi Cash Amount', render: (v: number) => v > 0 ? `₹${v.toLocaleString()}` : '-' },
    { key: 'emiStartDate', label: 'EMI Start Date', render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> },
    { key: 'paymentMode', label: 'Payment Mode' },
    { key: 'paymentDoneFrom', label: 'Payment Done From' },
    { key: 'fo', label: 'FO' },
    { key: 'bankAccountType', label: 'Bank Account Type' },
    { key: 'bankAccountNumber', label: 'Bank Account Number', render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'ifscCode', label: 'IFSC Code', render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'bankName', label: 'Bank Name' },
    { key: 'bankBranch', label: 'Bank Branch' },
    { key: 'healthCareAmount', label: 'Health Care Amount', render: (v: number) => v > 0 ? `₹${v.toLocaleString()}` : '-' },
    {
      key: 'sanctionStatus', label: 'Sanction Status',
      render: (v: string) => (
        <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
          v === 'sanctioned' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
          : v === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
        }`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span>
      ),
    },
    { key: 'neftTransactionNumber', label: 'NEFT Transaction Number' },
    { key: 'disbursedBy', label: 'Disbursed By' },
  ];

  // The table and cards must describe the same result set.  Repayments do not
  // exist yet, so principal outstanding is the completed-disbursement amount
  // exposed by the Phase 7 account API; arrears are consequently not available
  // until the Phase 8 schedule/collection ledger is introduced.
  const activeLoans = filteredLoans.filter(l => l.status === 'active').length;
  const totalDisbursed = filteredLoans.reduce((s, l) => s + l.disbursedAmount, 0);
  const totalOutstanding = filteredLoans.reduce((s, l) => s + l.principalOutstanding, 0);
  const totalArrears = filteredLoans.reduce((s, l) => s + l.principalArrear + l.interestArrear, 0);
  const hasLoadError = Boolean(error);
  const arrearsAvailable = false;

  return (
    <div className="space-y-6">
      {/* Hidden file input for master policy upload */}
      <input ref={masterPolicyInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleMasterPolicyFileChange} />

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loan Details</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage loan information</p>
      </div>

      {/* Notifications */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Loans', value: activeLoans, icon: CheckCircle, iconColor: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', display: hasLoadError ? '—' : String(activeLoans) },
          { label: 'Total Disbursed', value: totalDisbursed, icon: DollarSign, iconColor: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', display: hasLoadError ? '—' : `₹${totalDisbursed.toLocaleString()}` },
          { label: 'Total Outstanding', value: totalOutstanding, icon: DollarSign, iconColor: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', display: hasLoadError ? '—' : `₹${totalOutstanding.toLocaleString()}` },
          { label: 'Total Arrears', value: totalArrears, icon: XCircle, iconColor: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', display: hasLoadError || !arrearsAvailable ? '—' : `₹${totalArrears.toLocaleString()}` },
        ].map(({ label, icon: Icon, iconColor, bg, display }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 ${bg} rounded-lg`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{display}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Data Table */}
      {selectedRepaymentLoan && (
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Repayment details — {selectedRepaymentLoan.loanCode}</h2><p className="text-sm text-gray-600 dark:text-gray-400">Contractual eligibility and authoritative schedule ledger.</p></div>
            <button onClick={() => setSelectedRepaymentLoan(null)} className="text-sm text-gray-600 dark:text-gray-300">Close</button>
          </div>
          {repaymentLoading && <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">Loading repayment details…</p>}
          {repaymentError && <div className="mt-4 text-sm text-red-700 dark:text-red-300"><p>{repaymentError}</p><button onClick={() => void viewRepayment(selectedRepaymentLoan)} className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">Retry</button></div>}
          {!repaymentLoading && !repaymentError && scheduleEligibility && (
            <div className="mt-4">
              {!scheduleEligibility.eligible ? <div className="rounded border border-amber-200 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-900 dark:text-amber-200"><p className="font-medium">Schedule generation is blocked by contractual terms or unsupported policy treatment.</p>{scheduleEligibility.missing.length > 0 && <p className="mt-1">Missing: {scheduleEligibility.missing.join(', ')}</p>}{scheduleEligibility.blockers?.length ? <p className="mt-1">Blocked: {scheduleEligibility.blockers.join(', ')}</p> : null}</div> : <PermissionGuard module="loan" permission="write" fallback={null}><button onClick={() => void generateSchedule()} className="mb-3 px-3 py-2 bg-blue-600 text-white rounded">Generate schedule</button></PermissionGuard>}
              {!repaymentSchedule?.installments.length ? <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">No repayment schedule has been generated.</p> : <div className="mt-3 overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b text-left text-gray-600 dark:text-gray-300"><th className="p-2">#</th><th className="p-2">Contractual due</th><th className="p-2">Collection due</th><th className="p-2">Principal</th><th className="p-2">Interest</th><th className="p-2">Fees</th><th className="p-2">Paid</th><th className="p-2">Outstanding</th><th className="p-2">Status</th></tr></thead><tbody>{repaymentSchedule.installments.map(item => { const paid = Number(item.principal_paid) + Number(item.interest_paid) + Number(item.fees_paid); const outstanding = Number(item.scheduled_amount) - paid; return <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700"><td className="p-2">{item.installment_number}</td><td className="p-2">{formatDate(item.contractual_due_date)}</td><td className="p-2">{formatDate(item.collection_due_date)}</td><td className="p-2">₹{Number(item.scheduled_principal).toLocaleString()}</td><td className="p-2">₹{Number(item.scheduled_interest).toLocaleString()}</td><td className="p-2">₹{Number(item.scheduled_fees).toLocaleString()}</td><td className="p-2">₹{paid.toLocaleString()}</td><td className="p-2">₹{outstanding.toLocaleString()}</td><td className="p-2">{item.payment_status}</td></tr>; })}</tbody></table></div>}
              {repaymentSchedule?.installments.length ? <>
                <PermissionGuard module="loan" permission="write" fallback={null}><form onSubmit={postPayment} className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-2 rounded border border-gray-200 dark:border-gray-700 p-3"><input required type="number" min="0.01" step="0.01" value={paymentForm.amount} onChange={e => setPaymentForm(current => ({ ...current, amount: e.target.value }))} placeholder="Amount" className="rounded border px-2 py-1 dark:bg-gray-700" /><input required type="date" value={paymentForm.paymentDate} onChange={e => setPaymentForm(current => ({ ...current, paymentDate: e.target.value }))} className="rounded border px-2 py-1 dark:bg-gray-700" /><select value={paymentForm.paymentMethod} onChange={e => setPaymentForm(current => ({ ...current, paymentMethod: e.target.value }))} className="rounded border px-2 py-1 dark:bg-gray-700"><option value="cash">Cash</option><option value="upi">UPI</option><option value="neft">NEFT</option><option value="bank_transfer">Bank transfer</option><option value="cheque">Cheque</option><option value="other">Other</option></select><input value={paymentForm.referenceNumber} onChange={e => setPaymentForm(current => ({ ...current, referenceNumber: e.target.value }))} placeholder="Reference" className="rounded border px-2 py-1 dark:bg-gray-700" /><button disabled={paymentSubmitting} className="rounded bg-green-600 px-3 py-1 text-white disabled:opacity-50">{paymentSubmitting ? 'Posting…' : 'Post payment'}</button></form></PermissionGuard>
                <div className="mt-4"><h3 className="font-medium text-gray-900 dark:text-white">Payment history</h3>{payments.length === 0 ? <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">No payments posted.</p> : <div className="mt-2 space-y-2">{payments.map(payment => <div key={payment.id} className="flex flex-wrap items-center gap-3 border rounded p-2 text-sm"><span>{formatDate(payment.payment_date)}</span><span>₹{Number(payment.amount).toLocaleString()}</span><span className="capitalize">{payment.payment_method}</span><span>{payment.status}</span><span>Allocations: {payment.allocations.map(a => `P ₹${a.principal_amount}, I ₹${a.interest_amount}, F ₹${a.fees_amount}`).join(' · ')}</span>{payment.status === 'posted' && <PermissionGuard module="loan" permission="delete" fallback={null}><button onClick={() => void reversePayment(payment)} className="text-red-600">Reverse</button></PermissionGuard>}</div>)}</div>}</div>
              </> : null}
            </div>
          )}
        </section>
      )}
      {hasLoadError && !loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-900 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loan Management</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loan data could not be loaded. No empty result has been inferred from this failure.</p>
          <button onClick={() => void loadLoans()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
        </div>
      ) : (
      <DataTable
        columns={columns}
        data={filteredLoans}
        title="Loan Management"
        loading={loading}
        filterComponent={
          <div className="flex items-center space-x-3">
            <FilterDropdown onFilter={handleFilter} />

            <PermissionGuard module="loan" permission="write">
              <button onClick={handleMasterPolicyUpload} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white">
                <Upload className="w-4 h-4" /><span>Master Policy Uploader</span>
              </button>
            </PermissionGuard>

            <PermissionGuard module="loan" permission="write">
              <button onClick={handleCashAdjust} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white">
                <DollarSign className="w-4 h-4" /><span>Cash Adjust</span>
              </button>
            </PermissionGuard>

            <PermissionGuard module="loan" permission="read">
              <button onClick={handleDownload} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white">
                <Download className="w-4 h-4" /><span>Download</span>
              </button>
            </PermissionGuard>

            <PermissionGuard module="loan" permission="write">
              <button onClick={handleTagFunder} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white">
                <Tag className="w-4 h-4" /><span>Tag Funder</span>
              </button>
            </PermissionGuard>
          </div>
        }
      />
      )}
    </div>
  );
};
