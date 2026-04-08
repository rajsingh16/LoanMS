import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Upload, 
  Tag, 
  DollarSign, 
  Calendar, 
  User, 
  CreditCard, 
  MapPin, 
  Building, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2, 
  Filter, 
  ChevronDown 
} from 'lucide-react';

interface LoanDetail {
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

interface FilterOptions {
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

const FilterDropdown: React.FC<{
  onFilter: (filters: FilterOptions) => void;
}> = ({ onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    businessPartner: '',
    closureDateFrom: '',
    closureDateTo: '',
    disbursementDateFrom: '',
    disbursementDateTo: '',
    neftDateFrom: '',
    neftDateTo: ''
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    onFilter(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      businessPartner: '',
      closureDateFrom: '',
      closureDateTo: '',
      disbursementDateFrom: '',
      disbursementDateTo: '',
      neftDateFrom: '',
      neftDateTo: ''
    });
    onFilter({
      businessPartner: '',
      closureDateFrom: '',
      closureDateTo: '',
      disbursementDateFrom: '',
      disbursementDateTo: '',
      neftDateFrom: '',
      neftDateTo: ''
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      >
        <Filter className="w-4 h-4" />
        <span>Search Filter</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Search Filters</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <input
                  type="text"
                  value={filters.branch || ''}
                  onChange={(e) => handleFilterChange('branch', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter branch"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Center</label>
                <input
                  type="text"
                  value={filters.center || ''}
                  onChange={(e) => handleFilterChange('center', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter center"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Group</label>
                <input
                  type="text"
                  value={filters.productGroup || ''}
                  onChange={(e) => handleFilterChange('productGroup', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product group"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <input
                  type="text"
                  value={filters.product || ''}
                  onChange={(e) => handleFilterChange('product', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Partner <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={filters.businessPartner}
                  onChange={(e) => handleFilterChange('businessPartner', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter business partner"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Code</label>
                <input
                  type="text"
                  value={filters.clientCode || ''}
                  onChange={(e) => handleFilterChange('clientCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter client code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Code</label>
                <input
                  type="text"
                  value={filters.loanCode || ''}
                  onChange={(e) => handleFilterChange('loanCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter loan code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="written-off">Written Off</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sanction Status</label>
                <select
                  value={filters.sanctionStatus || ''}
                  onChange={(e) => handleFilterChange('sanctionStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="sanctioned">Sanctioned</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">External Loan ID</label>
                <input
                  type="text"
                  value={filters.externalLoanId || ''}
                  onChange={(e) => handleFilterChange('externalLoanId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter external loan ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Closure Date From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={filters.closureDateFrom}
                  onChange={(e) => handleFilterChange('closureDateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Closure Date To <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={filters.closureDateTo}
                  onChange={(e) => handleFilterChange('closureDateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disbursement Date From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={filters.disbursementDateFrom}
                  onChange={(e) => handleFilterChange('disbursementDateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disbursement Date To <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={filters.disbursementDateTo}
                  onChange={(e) => handleFilterChange('disbursementDateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NEFT Date From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={filters.neftDateFrom}
                  onChange={(e) => handleFilterChange('neftDateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NEFT Date To <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={filters.neftDateTo}
                  onChange={(e) => handleFilterChange('neftDateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const LoanDetailsPage: React.FC = () => {
  const [loans, setLoans] = useState<LoanDetail[]>([
    {
      id: '1',
      loanCode: 'LN001',
      clientCode: 'CL001',
      customerName: 'Priya Sharma',
      customerDOB: '1985-06-15',
      idProofName: 'Aadhaar',
      idProofNumber: '1234-5678-9012',
      addressProofName: 'Voter ID',
      addressProofNumber: 'ABC1234567',
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
      branch: 'Main Branch',
      center: 'Anand Nagar Center',
      bcPartner: 'Partner A',
      disbursementDate: '2024-01-20',
      coApplicantName2: '',
      nomineeName: 'Rahul Sharma',
      spouseName: 'Rahul Sharma',
      status: 'active',
      productGroup: 'Micro Finance',
      productCode: 'MF001',
      productName: 'Micro Finance Loan',
      healthcareOpted: false,
      isNetOffEligible: false,
      interestAmount: 5000,
      disbursedAmount: 50000,
      insuranceAmount: 500,
      interestOutstanding: 4000,
      principalOutstanding: 45000,
      installmentsOutstanding: 10,
      principalArrear: 0,
      interestArrear: 0,
      installmentsArrear: 0,
      lender: 'ABC Bank',
      funder: 'XYZ Finance',
      loanCycle: 1,
      isUtilized: true,
      utilCheckLatitude: 28.6139,
      utilCheckLongitude: 77.2090,
      repaymentFrequency: 'Monthly',
      policyId: 'POL001',
      preclosingAmount: 46000,
      preclosingReason: '',
      maturityDate: '2025-01-20',
      closureDate: '',
      state: 'Delhi',
      zone: 'North',
      division: 'Central',
      postDisbVerified: true,
      verificationDate: '2024-01-25',
      verificationRemarks: 'All documents verified',
      extLoanId: 'EXT001',
      extLANNo: 'LAN001',
      extCustId: 'CUST001',
      netPayableAmount: 49500,
      netOffLoanId: '',
      netOffCollSequence: 0,
      siApproveDate: '2024-01-18',
      siRejectionReason: '',
      siRequestDate: '2024-01-15',
      siStatus: 'approved',
      siVendor: 'SI Vendor A',
      insuranceId: 'INS001',
      nextDisbursementDate: '',
      neftDate: '2024-01-21',
      isFullyDisbursed: true,
      totalInstallments: 12,
      processingFee: 1000,
      tenureInMonths: 12,
      interestRate: 12.5,
      subPurposeId: 'SP001',
      subPurposeName: 'Small Business',
      purposeId: 'P001',
      purposeName: 'Business',
      utilizationCheckDate: '2024-02-01',
      hospiCashName: '',
      hospiCashAmount: 0,
      emiStartDate: '2024-02-20',
      paymentMode: 'Cash',
      paymentDoneFrom: 'Branch',
      fo: 'Amit Kumar',
      bankAccountType: 'Savings',
      bankAccountNumber: '1234567890',
      ifscCode: 'SBIN0000001',
      bankName: 'State Bank of India',
      bankBranch: 'Connaught Place',
      healthCareAmount: 0,
      sanctionStatus: 'sanctioned',
      neftTransactionNumber: 'NEFT001',
      disbursedBy: 'Manager User'
    },
    {
      id: '2',
      loanCode: 'LN002',
      clientCode: 'CL002',
      customerName: 'Rajesh Kumar',
      customerDOB: '1980-03-22',
      idProofName: 'Aadhaar',
      idProofNumber: '2345-6789-0123',
      addressProofName: 'Voter ID',
      addressProofNumber: 'DEF2345678',
      coApplicantName: 'Sunita Kumar',
      coApplicantDOB: '1982-05-10',
      coApplicantIdType1: 'Aadhaar',
      coApplicantIdNumber1: '3456-7890-1234',
      coApplicantIdType2: '',
      coApplicantIdNumber2: '',
      guarantorName: '',
      guarantorDOB: '',
      guarantorIdType1: '',
      guarantorIdNumber1: '',
      guarantorIdType2: '',
      guarantorIdNumber2: '',
      branch: 'North Branch',
      center: 'Gandhi Colony Center',
      bcPartner: 'Partner B',
      disbursementDate: '2024-01-18',
      coApplicantName2: '',
      nomineeName: 'Mohan Kumar',
      spouseName: 'Sunita Kumar',
      status: 'active',
      productGroup: 'Group Lending',
      productCode: 'GL001',
      productName: 'Group Loan',
      healthcareOpted: true,
      isNetOffEligible: false,
      interestAmount: 7500,
      disbursedAmount: 75000,
      insuranceAmount: 750,
      interestOutstanding: 7000,
      principalOutstanding: 70000,
      installmentsOutstanding: 17,
      principalArrear: 0,
      interestArrear: 0,
      installmentsArrear: 0,
      lender: 'DEF Bank',
      funder: 'PQR Finance',
      loanCycle: 2,
      isUtilized: true,
      utilCheckLatitude: 28.7041,
      utilCheckLongitude: 77.1025,
      repaymentFrequency: 'Monthly',
      policyId: 'POL002',
      preclosingAmount: 72000,
      preclosingReason: '',
      maturityDate: '2025-07-18',
      closureDate: '',
      state: 'Delhi',
      zone: 'North',
      division: 'North',
      postDisbVerified: true,
      verificationDate: '2024-01-23',
      verificationRemarks: 'All documents verified',
      extLoanId: 'EXT002',
      extLANNo: 'LAN002',
      extCustId: 'CUST002',
      netPayableAmount: 74250,
      netOffLoanId: '',
      netOffCollSequence: 0,
      siApproveDate: '2024-01-16',
      siRejectionReason: '',
      siRequestDate: '2024-01-14',
      siStatus: 'approved',
      siVendor: 'SI Vendor B',
      insuranceId: 'INS002',
      nextDisbursementDate: '',
      neftDate: '2024-01-19',
      isFullyDisbursed: true,
      totalInstallments: 18,
      processingFee: 1500,
      tenureInMonths: 18,
      interestRate: 10.5,
      subPurposeId: 'SP002',
      subPurposeName: 'Crop Loan',
      purposeId: 'P002',
      purposeName: 'Agriculture',
      utilizationCheckDate: '2024-01-30',
      hospiCashName: 'Basic Health Cover',
      hospiCashAmount: 1000,
      emiStartDate: '2024-02-18',
      paymentMode: 'Bank Transfer',
      paymentDoneFrom: 'Branch',
      fo: 'Neha Gupta',
      bankAccountType: 'Savings',
      bankAccountNumber: '0987654321',
      ifscCode: 'HDFC0000001',
      bankName: 'HDFC Bank',
      bankBranch: 'Karol Bagh',
      healthCareAmount: 1000,
      sanctionStatus: 'sanctioned',
      neftTransactionNumber: 'NEFT002',
      disbursedBy: 'Manager User'
    }
  ]);
  
  const [filteredLoans, setFilteredLoans] = useState<LoanDetail[]>(loans);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleFilter = (filters: FilterOptions) => {
    let filtered = loans;

    // Apply filters based on the filter options
    if (filters.branch) {
      filtered = filtered.filter(loan => loan.branch.toLowerCase().includes(filters.branch!.toLowerCase()));
    }
    if (filters.center) {
      filtered = filtered.filter(loan => loan.center.toLowerCase().includes(filters.center!.toLowerCase()));
    }
    if (filters.productGroup) {
      filtered = filtered.filter(loan => loan.productGroup.toLowerCase().includes(filters.productGroup!.toLowerCase()));
    }
    if (filters.product) {
      filtered = filtered.filter(loan => loan.productName.toLowerCase().includes(filters.product!.toLowerCase()));
    }
    if (filters.businessPartner) {
      filtered = filtered.filter(loan => loan.bcPartner.toLowerCase().includes(filters.businessPartner.toLowerCase()));
    }
    if (filters.clientCode) {
      filtered = filtered.filter(loan => loan.clientCode.toLowerCase().includes(filters.clientCode!.toLowerCase()));
    }
    if (filters.loanCode) {
      filtered = filtered.filter(loan => loan.loanCode.toLowerCase().includes(filters.loanCode!.toLowerCase()));
    }
    if (filters.status) {
      filtered = filtered.filter(loan => loan.status === filters.status);
    }
    if (filters.sanctionStatus) {
      filtered = filtered.filter(loan => loan.sanctionStatus === filters.sanctionStatus);
    }
    if (filters.externalLoanId) {
      filtered = filtered.filter(loan => loan.extLoanId.toLowerCase().includes(filters.externalLoanId!.toLowerCase()));
    }
    if (filters.closureDateFrom && filters.closureDateTo) {
      filtered = filtered.filter(loan => 
        loan.closureDate && 
        loan.closureDate >= filters.closureDateFrom && 
        loan.closureDate <= filters.closureDateTo
      );
    }
    if (filters.disbursementDateFrom && filters.disbursementDateTo) {
      filtered = filtered.filter(loan => 
        loan.disbursementDate >= filters.disbursementDateFrom && 
        loan.disbursementDate <= filters.disbursementDateTo
      );
    }
    if (filters.neftDateFrom && filters.neftDateTo) {
      filtered = filtered.filter(loan => 
        loan.neftDate >= filters.neftDateFrom && 
        loan.neftDate <= filters.neftDateTo
      );
    }

    setFilteredLoans(filtered);
  };

  const handleMasterPolicyUpload = () => {
    alert('Master Policy Upload functionality will be implemented');
  };

  const handleCashAdjust = () => {
    alert('Cash Adjust functionality will be implemented');
  };

  const handleDownload = () => {
    alert('Download functionality will be implemented');
  };

  const handleTagFunder = () => {
    alert('Tag Funder functionality will be implemented');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-blue-600" />;
      case 'written-off':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-blue-100 text-blue-800';
      case 'written-off':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'actions',
      label: 'Action',
      render: (value: any, row: LoanDetail) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => console.log('Edit loan:', row.id)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => console.log('Delete loan:', row.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      key: 'loanCode',
      label: 'Loan Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'clientCode',
      label: 'Client Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'customerName',
      label: 'Customer Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'customerDOB',
      label: 'Customer DOB',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'idProofName',
      label: 'ID Proof Name',
      sortable: true,
    },
    {
      key: 'idProofNumber',
      label: 'ID Proof Number',
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'addressProofName',
      label: 'Address Proof Name',
      sortable: true,
    },
    {
      key: 'addressProofNumber',
      label: 'Address Proof Number',
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'coApplicantName',
      label: 'Co-Applicant Name',
      sortable: true,
    },
    {
      key: 'coApplicantDOB',
      label: 'Co-Applicant DOB',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'coApplicantIdType1',
      label: 'Co-Applicant ID Type 1',
    },
    {
      key: 'coApplicantIdNumber1',
      label: 'Co-Applicant ID Number 1',
    },
    {
      key: 'coApplicantIdType2',
      label: 'Co-Applicant ID Type 2',
    },
    {
      key: 'coApplicantIdNumber2',
      label: 'Co-Applicant ID Number 2',
    },
    {
      key: 'guarantorName',
      label: 'Guarantor Name',
    },
    {
      key: 'guarantorDOB',
      label: 'Guarantor DOB',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'guarantorIdType1',
      label: 'Guarantor ID Type 1',
    },
    {
      key: 'guarantorIdNumber1',
      label: 'Guarantor ID Number 1',
    },
    {
      key: 'guarantorIdType2',
      label: 'Guarantor ID Type 2',
    },
    {
      key: 'guarantorIdNumber2',
      label: 'Guarantor ID Number 2',
    },
    {
      key: 'branch',
      label: 'Branch',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Building className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'center',
      label: 'Center',
      sortable: true,
    },
    {
      key: 'bcPartner',
      label: 'BC Partner',
      sortable: true,
    },
    {
      key: 'disbursementDate',
      label: 'Disbursement Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'coApplicantName2',
      label: 'Co Applicant Name',
    },
    {
      key: 'nomineeName',
      label: 'Nominee Name',
    },
    {
      key: 'spouseName',
      label: 'Spouse Name',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(value)}`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        </div>
      )
    },
    {
      key: 'productGroup',
      label: 'Product Group',
      sortable: true,
    },
    {
      key: 'productCode',
      label: 'Product Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'productName',
      label: 'Product Name',
      sortable: true,
    },
    {
      key: 'healthcareOpted',
      label: 'Healthcare Opted',
      render: (value: boolean) => value ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      ),
    },
    {
      key: 'isNetOffEligible',
      label: 'Is Net Off Eligible',
      render: (value: boolean) => value ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      ),
    },
    {
      key: 'interestAmount',
      label: 'Interest Amount',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'disbursedAmount',
      label: 'Disbursed Amount',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'insuranceAmount',
      label: 'Insurance Amount',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'interestOutstanding',
      label: 'Interest Outstanding',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'principalOutstanding',
      label: 'Principal Outstanding',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'installmentsOutstanding',
      label: 'Installments Outstanding',
    },
    {
      key: 'principalArrear',
      label: 'Principal Arrear',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'interestArrear',
      label: 'Interest Arrear',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'installmentsArrear',
      label: 'Installments Arrear',
    },
    {
      key: 'lender',
      label: 'Lender',
      sortable: true,
    },
    {
      key: 'funder',
      label: 'Funder',
      sortable: true,
    },
    {
      key: 'loanCycle',
      label: 'Loan Cycle',
      sortable: true,
      render: (value: number) => (
        <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-800">
          Cycle {value}
        </span>
      )
    },
    {
      key: 'isUtilized',
      label: 'Is Utilized',
      render: (value: boolean) => value ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      ),
    },
    {
      key: 'utilCheckLatitude',
      label: 'Util Check Latitude',
      render: (value: number) => value.toFixed(6),
    },
    {
      key: 'utilCheckLongitude',
      label: 'Util Check Longitude',
      render: (value: number) => value.toFixed(6),
    },
    {
      key: 'repaymentFrequency',
      label: 'Repayment Frequency',
      sortable: true,
    },
    {
      key: 'policyId',
      label: 'Policy Id',
    },
    {
      key: 'preclosingAmount',
      label: 'Preclosing Amount',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'preclosingReason',
      label: 'Preclosing Reason',
    },
    {
      key: 'maturityDate',
      label: 'Maturity Date',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'closureDate',
      label: 'Closure Date',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-',
    },
    {
      key: 'state',
      label: 'State',
      sortable: true,
    },
    {
      key: 'zone',
      label: 'Zone',
      sortable: true,
    },
    {
      key: 'division',
      label: 'Division',
      sortable: true,
    },
    {
      key: 'postDisbVerified',
      label: 'Post Disb Verified',
      render: (value: boolean) => value ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      ),
    },
    {
      key: 'verificationDate',
      label: 'Verification Date',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'verificationRemarks',
      label: 'Verification Remarks',
    },
    {
      key: 'extLoanId',
      label: 'Ext Loan Id',
    },
    {
      key: 'extLANNo',
      label: 'Ext LAN No',
    },
    {
      key: 'extCustId',
      label: 'Ext Cust Id',
    },
    {
      key: 'netPayableAmount',
      label: 'Net Payable Amount',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'netOffLoanId',
      label: 'Net Off Loan Id',
    },
    {
      key: 'netOffCollSequence',
      label: 'Net Off Coll Sequence',
    },
    {
      key: 'siApproveDate',
      label: 'SI Approve Date',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'siRejectionReason',
      label: 'SI Rejection Reason',
    },
    {
      key: 'siRequestDate',
      label: 'SI Request Date',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'siStatus',
      label: 'SI Status',
    },
    {
      key: 'siVendor',
      label: 'SI Vendor',
    },
    {
      key: 'insuranceId',
      label: 'Insurance Id',
    },
    {
      key: 'nextDisbursementDate',
      label: 'Next Disbursement Date',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'neftDate',
      label: 'NEFT Date',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'isFullyDisbursed',
      label: 'Is Fully Disbursed',
      render: (value: boolean) => value ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      ),
    },
    {
      key: 'totalInstallments',
      label: 'Total Installments',
    },
    {
      key: 'processingFee',
      label: 'Processing Fee',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'tenureInMonths',
      label: 'Tenure In Months',
      render: (value: number) => `${value} months`,
    },
    {
      key: 'interestRate',
      label: 'Interest Rate',
      render: (value: number) => `${value}%`,
    },
    {
      key: 'subPurposeId',
      label: 'Sub Purpose Id',
    },
    {
      key: 'subPurposeName',
      label: 'Sub Purpose Name',
    },
    {
      key: 'purposeId',
      label: 'Purpose Id',
    },
    {
      key: 'purposeName',
      label: 'Purpose Name',
    },
    {
      key: 'utilizationCheckDate',
      label: 'Utilization Check Date',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'hospiCashName',
      label: 'Hospi Cash Name',
    },
    {
      key: 'hospiCashAmount',
      label: 'Hospi Cash Amount',
      render: (value: number) => value > 0 ? `₹${value.toLocaleString()}` : '-',
    },
    {
      key: 'emiStartDate',
      label: 'Emi Start Date',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'paymentMode',
      label: 'Payment Mode',
    },
    {
      key: 'paymentDoneFrom',
      label: 'Payment Done From',
    },
    {
      key: 'fo',
      label: 'FO',
    },
    {
      key: 'bankAccountType',
      label: 'Bank Account Type',
    },
    {
      key: 'bankAccountNumber',
      label: 'Bank Account Number',
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'ifscCode',
      label: 'IFSC Code',
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'bankName',
      label: 'Bank Name',
    },
    {
      key: 'bankBranch',
      label: 'Bank Branch',
    },
    {
      key: 'healthCareAmount',
      label: 'Health Care Amount',
      render: (value: number) => value > 0 ? `₹${value.toLocaleString()}` : '-',
    },
    {
      key: 'sanctionStatus',
      label: 'Sanction Status',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
          value === 'sanctioned' 
            ? 'bg-green-100 text-green-800' 
            : value === 'rejected'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'neftTransactionNumber',
      label: 'Neft Transaction Number',
    },
    {
      key: 'disbursedBy',
      label: 'Disbursed By',
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading loan details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Loan Details</h1>
        <p className="text-gray-600 mt-1">View and manage loan information</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Loans</p>
              <p className="text-xl font-bold text-gray-900">
                {loans.filter(loan => loan.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Disbursed</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{loans.reduce((sum, loan) => sum + loan.disbursedAmount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{loans.reduce((sum, loan) => sum + loan.principalOutstanding, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Arrears</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{loans.reduce((sum, loan) => sum + loan.principalArrear + loan.interestArrear, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Loan Management</h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredLoans.length} records found
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <FilterDropdown onFilter={handleFilter} />
              
              <button
                onClick={handleMasterPolicyUpload}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <Upload className="w-4 h-4" />
                <span>Master Policy Uploader</span>
              </button>
              
              <button
                onClick={handleCashAdjust}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <DollarSign className="w-4 h-4" />
                <span>Cash Adjust</span>
              </button>
              
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              
              <button
                onClick={handleTagFunder}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <Tag className="w-4 h-4" />
                <span>Tag Funder</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLoans.map((loan, index) => (
                <tr
                  key={loan.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(loan[column.key as keyof LoanDetail], loan) : loan[column.key as keyof LoanDetail]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};