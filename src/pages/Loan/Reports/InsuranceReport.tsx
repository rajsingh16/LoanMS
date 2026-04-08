import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Calendar, 
  Building, 
  User, 
  CheckCircle, 
  XCircle, 
  Filter, 
  ChevronDown,
  CreditCard,
  DollarSign,
  Heart,
  Shield,
  Phone,
  CreditCard as Bank
} from 'lucide-react';

interface InsuranceReportRecord {
  id: string;
  divisionCode: string;
  divisionName: string;
  branchCode: string;
  branchName: string;
  centerCode: string;
  centerName: string;
  deathId: string;
  loanId: string;
  loanDate: string;
  clientId: string;
  customerName: string;
  dateOfBirth: string;
  nomineeName: string;
  nomineeDOB: string;
  dateReported: string;
  deathDate: string;
  fsType: string;
  insuranceId: string;
  deathStatus: string;
  gender: string;
  principalAmount: number;
  principalOutstanding: number;
  principalCollected: number;
  insuranceCompanyName: string;
  coInsurerPolicyId: string;
  clientInsPolicyId: string;
  deathIntimationDate: string;
  dirReceiveDate: string;
  dcReceiveDate: string;
  approveRejectFromHO: string;
  rejectionReason: string;
  claimToInsurerDate: string;
  settlementDate: string;
  settlementAmount: number;
  castToCompanyDate: string;
  chequeReceivedAtRODate: string;
  chequeReceivedAtBODate: string;
  chequeHandoverToNomineeDate: string;
  secondYearPremCollDate: string;
  comments: string;
  paymentMode: string;
  paymentInstrNumber: string;
  interestRate: number;
  schedule: string;
  paymentAgency: string;
  caseProcessDate: string;
  policyId: string;
  caseRejectCount: number;
  writeOffDate: string;
  extLANNo: string;
  productGroupId: string;
  claimAmountMPH: number;
  certificateProcessingDate: string;
  claimPaidToNominee: boolean;
  frStatus: string;
  hoComment: string;
  beneficiaryName: string;
  beneficiaryAccountNumber: string;
  beneficiaryIfscCode: string;
  beneficiaryBankName: string;
  relationship: string;
  hoRejectionReason: string;
  masterPolicyHolderNEFT: string;
  beneficiaryPhoneNumber: string;
  isPartnerRemitted: boolean;
  waiveOffDate: string;
  frSendDate: string;
  frReceivingDate: string;
  mobileNumber: string;
  clientNameInBank: string;
  customerBankValidateResponse: string;
  bankDetailsValidated: boolean;
  micrCode: string;
}

interface FilterOptions {
  state?: string;
  zone?: string;
  division?: string;
  branch?: string;
  center?: string;
  loanId?: string;
  deathStatus?: string;
  caseProcessDateFrom: string;
  caseProcessDateTo: string;
}

const FilterDropdown: React.FC<{
  onFilter: (filters: FilterOptions) => void;
  onDownload: () => void;
}> = ({ onFilter, onDownload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    caseProcessDateFrom: '',
    caseProcessDateTo: ''
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    if (!filters.caseProcessDateFrom || !filters.caseProcessDateTo) {
      alert('Case Process Date range is mandatory');
      return;
    }
    
    onFilter(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      caseProcessDateFrom: '',
      caseProcessDateTo: ''
    });
  };

  return (
    <div className="flex items-center space-x-3">
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
              <div className="flex items-center space-x-2 mb-4">
                <Search className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Filters</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                  <input
                    type="text"
                    value={filters.state || ''}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zone</label>
                  <input
                    type="text"
                    value={filters.zone || ''}
                    onChange={(e) => handleFilterChange('zone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter zone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Division</label>
                  <input
                    type="text"
                    value={filters.division || ''}
                    onChange={(e) => handleFilterChange('division', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter division"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch</label>
                  <input
                    type="text"
                    value={filters.branch || ''}
                    onChange={(e) => handleFilterChange('branch', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter branch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Center</label>
                  <input
                    type="text"
                    value={filters.center || ''}
                    onChange={(e) => handleFilterChange('center', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter center"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan ID</label>
                  <input
                    type="text"
                    value={filters.loanId || ''}
                    onChange={(e) => handleFilterChange('loanId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter loan ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Death Status</label>
                  <select
                    value={filters.deathStatus || ''}
                    onChange={(e) => handleFilterChange('deathStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Status</option>
                    <option value="reported">Reported</option>
                    <option value="verified">Verified</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="settled">Settled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Case Process Date From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={filters.caseProcessDateFrom}
                    onChange={(e) => handleFilterChange('caseProcessDateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Case Process Date To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={filters.caseProcessDateTo}
                    onChange={(e) => handleFilterChange('caseProcessDateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
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

      <button
        onClick={onDownload}
        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
      >
        <Download className="w-4 h-4" />
        <span>Download</span>
      </button>
    </div>
  );
};

export const InsuranceReport: React.FC = () => {
  const [records, setRecords] = useState<InsuranceReportRecord[]>([
    {
      id: '1',
      divisionCode: 'DIV001',
      divisionName: 'Central Division',
      branchCode: 'BR001',
      branchName: 'Main Branch',
      centerCode: 'CTR001',
      centerName: 'Anand Nagar Center',
      deathId: 'DTH001',
      loanId: 'LN001',
      loanDate: '2023-12-15',
      clientId: 'CL001',
      customerName: 'Priya Sharma',
      dateOfBirth: '1985-06-15',
      nomineeName: 'Mohan Sharma',
      nomineeDOB: '1980-03-10',
      dateReported: '2024-01-15',
      deathDate: '2024-01-10',
      fsType: 'Spouse',
      insuranceId: 'INS001',
      deathStatus: 'verified',
      gender: 'Female',
      principalAmount: 50000,
      principalOutstanding: 45000,
      principalCollected: 5000,
      insuranceCompanyName: 'ABC Insurance',
      coInsurerPolicyId: 'POL001',
      clientInsPolicyId: 'CPOL001',
      deathIntimationDate: '2024-01-15',
      dirReceiveDate: '2024-01-16',
      dcReceiveDate: '2024-01-19',
      approveRejectFromHO: 'Approved',
      rejectionReason: '',
      claimToInsurerDate: '2024-01-20',
      settlementDate: '',
      settlementAmount: 0,
      castToCompanyDate: '',
      chequeReceivedAtRODate: '',
      chequeReceivedAtBODate: '',
      chequeHandoverToNomineeDate: '',
      secondYearPremCollDate: '',
      comments: 'All documents verified',
      paymentMode: '',
      paymentInstrNumber: '',
      interestRate: 12.5,
      schedule: 'Monthly',
      paymentAgency: '',
      caseProcessDate: '2024-01-20',
      policyId: 'POL001',
      caseRejectCount: 0,
      writeOffDate: '',
      extLANNo: 'LAN001',
      productGroupId: 'PG001',
      claimAmountMPH: 50000,
      certificateProcessingDate: '',
      claimPaidToNominee: false,
      frStatus: 'Pending',
      hoComment: 'Under review',
      beneficiaryName: 'Mohan Sharma',
      beneficiaryAccountNumber: '1234567890',
      beneficiaryIfscCode: 'SBIN0000001',
      beneficiaryBankName: 'State Bank of India',
      relationship: 'Husband',
      hoRejectionReason: '',
      masterPolicyHolderNEFT: 'NEFT001',
      beneficiaryPhoneNumber: '+91 9876543210',
      isPartnerRemitted: false,
      waiveOffDate: '',
      frSendDate: '2024-01-17',
      frReceivingDate: '2024-01-18',
      mobileNumber: '+91 9876543210',
      clientNameInBank: 'Priya Sharma',
      customerBankValidateResponse: 'Valid',
      bankDetailsValidated: true,
      micrCode: 'MICR001'
    },
    {
      id: '2',
      divisionCode: 'DIV002',
      divisionName: 'North Division',
      branchCode: 'BR002',
      branchName: 'North Branch',
      centerCode: 'CTR002',
      centerName: 'Gandhi Colony Center',
      deathId: 'DTH002',
      loanId: 'LN002',
      loanDate: '2023-11-10',
      clientId: 'CL002',
      customerName: 'Rajesh Kumar',
      dateOfBirth: '1980-03-22',
      nomineeName: 'Sunita Kumar',
      nomineeDOB: '1982-05-10',
      dateReported: '2024-01-12',
      deathDate: '2024-01-08',
      fsType: 'Self',
      insuranceId: 'INS002',
      deathStatus: 'settled',
      gender: 'Male',
      principalAmount: 75000,
      principalOutstanding: 70000,
      principalCollected: 5000,
      insuranceCompanyName: 'XYZ Insurance',
      coInsurerPolicyId: 'POL002',
      clientInsPolicyId: 'CPOL002',
      deathIntimationDate: '2024-01-12',
      dirReceiveDate: '2024-01-13',
      dcReceiveDate: '2024-01-16',
      approveRejectFromHO: 'Approved',
      rejectionReason: '',
      claimToInsurerDate: '2024-01-17',
      settlementDate: '2024-01-25',
      settlementAmount: 75000,
      castToCompanyDate: '2024-01-18',
      chequeReceivedAtRODate: '2024-01-22',
      chequeReceivedAtBODate: '2024-01-23',
      chequeHandoverToNomineeDate: '2024-01-25',
      secondYearPremCollDate: '',
      comments: 'Claim settled',
      paymentMode: 'NEFT',
      paymentInstrNumber: 'NEFT001',
      interestRate: 10.5,
      schedule: 'Monthly',
      paymentAgency: 'Insurance Company A',
      caseProcessDate: '2024-01-17',
      policyId: 'POL002',
      caseRejectCount: 0,
      writeOffDate: '',
      extLANNo: 'LAN002',
      productGroupId: 'PG002',
      claimAmountMPH: 75000,
      certificateProcessingDate: '2024-01-19',
      claimPaidToNominee: true,
      frStatus: 'Completed',
      hoComment: 'Approved for settlement',
      beneficiaryName: 'Sunita Kumar',
      beneficiaryAccountNumber: '0987654321',
      beneficiaryIfscCode: 'HDFC0000001',
      beneficiaryBankName: 'HDFC Bank',
      relationship: 'Wife',
      hoRejectionReason: '',
      masterPolicyHolderNEFT: 'NEFT002',
      beneficiaryPhoneNumber: '+91 9876543211',
      isPartnerRemitted: true,
      waiveOffDate: '',
      frSendDate: '2024-01-14',
      frReceivingDate: '2024-01-15',
      mobileNumber: '+91 9876543211',
      clientNameInBank: 'Rajesh Kumar',
      customerBankValidateResponse: 'Valid',
      bankDetailsValidated: true,
      micrCode: 'MICR002'
    }
  ]);
  
  const [filteredRecords, setFilteredRecords] = useState<InsuranceReportRecord[]>(records);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleFilter = (filters: FilterOptions) => {
    let filtered = records;

    // Apply filters based on the filter options
    if (filters.state) {
      // In a real application, this would filter by state
      filtered = filtered;
    }
    if (filters.zone) {
      // In a real application, this would filter by zone
      filtered = filtered;
    }
    if (filters.division) {
      filtered = filtered.filter(record => 
        record.divisionName.toLowerCase().includes(filters.division!.toLowerCase()) ||
        record.divisionCode.toLowerCase().includes(filters.division!.toLowerCase())
      );
    }
    if (filters.branch) {
      filtered = filtered.filter(record => 
        record.branchName.toLowerCase().includes(filters.branch!.toLowerCase()) ||
        record.branchCode.toLowerCase().includes(filters.branch!.toLowerCase())
      );
    }
    if (filters.center) {
      filtered = filtered.filter(record => 
        record.centerName.toLowerCase().includes(filters.center!.toLowerCase()) ||
        record.centerCode.toLowerCase().includes(filters.center!.toLowerCase())
      );
    }
    if (filters.loanId) {
      filtered = filtered.filter(record => record.loanId.toLowerCase().includes(filters.loanId!.toLowerCase()));
    }
    if (filters.deathStatus) {
      filtered = filtered.filter(record => record.deathStatus === filters.deathStatus);
    }
    if (filters.caseProcessDateFrom && filters.caseProcessDateTo) {
      filtered = filtered.filter(record => 
        record.caseProcessDate >= filters.caseProcessDateFrom && 
        record.caseProcessDate <= filters.caseProcessDateTo
      );
    }

    setFilteredRecords(filtered);
  };

  const handleDownload = () => {
    // In a real application, this would generate and download a CSV or Excel file
    alert('Download functionality will be implemented');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'settled':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Calendar className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'settled':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const columns = [
    {
      key: 'divisionCode',
      label: 'Division Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'divisionName',
      label: 'Division Name',
      sortable: true,
    },
    {
      key: 'branchCode',
      label: 'Branch Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'branchName',
      label: 'Branch Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Building className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'centerCode',
      label: 'Center Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'centerName',
      label: 'Center Name',
      sortable: true,
    },
    {
      key: 'deathId',
      label: 'Death Id',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'loanId',
      label: 'Loan Id',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span className="font-mono">{value}</span>
        </div>
      )
    },
    {
      key: 'loanDate',
      label: 'Loan Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'clientId',
      label: 'Client Id',
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
        <div className="flex items-center space-x-1">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'dateOfBirth',
      label: 'Date Of Birth',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'nomineeName',
      label: 'Nominee Name',
      sortable: true,
    },
    {
      key: 'nomineeDOB',
      label: 'Nominee D.O.B',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'dateReported',
      label: 'Date Reported',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'deathDate',
      label: 'Death Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'fsType',
      label: 'FS Type',
      sortable: true,
    },
    {
      key: 'insuranceId',
      label: 'Insurance Id',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'deathStatus',
      label: 'Death Status',
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
      key: 'gender',
      label: 'Gender',
      sortable: true,
    },
    {
      key: 'principalAmount',
      label: 'Principal Amount',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'principalOutstanding',
      label: 'Principal Outstanding',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'principalCollected',
      label: 'Principal Collected',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'insuranceCompanyName',
      label: 'Insurance Company Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Shield className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'coInsurerPolicyId',
      label: 'Co Insurer Policy Id',
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'clientInsPolicyId',
      label: 'Client INS Policy Id',
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'deathIntimationDate',
      label: 'Death Intimation Date',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'dirReceiveDate',
      label: 'DIR Receive Date',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'dcReceiveDate',
      label: 'DC Receive Date',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'approveRejectFromHO',
      label: 'Approve Reject From HO',
      sortable: true,
    },
    {
      key: 'rejectionReason',
      label: 'Rejection Reason',
      render: (value: string) => value || '-'
    },
    {
      key: 'claimToInsurerDate',
      label: 'Claim To Insurer Date',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'settlementDate',
      label: 'Settlement Date',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'settlementAmount',
      label: 'Settlement Amount',
      render: (value: number) => value > 0 ? (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'castToCompanyDate',
      label: 'Cast To Company Date',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'chequeReceivedAtRODate',
      label: 'Cheque Received At RO Date',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'chequeReceivedAtBODate',
      label: 'Cheque Received At BO Date',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'chequeHandoverToNomineeDate',
      label: 'Cheque Handover To Nominee Date',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'secondYearPremCollDate',
      label: 'Second Year Prem Coll Date',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'comments',
      label: 'Comments',
    },
    {
      key: 'paymentMode',
      label: 'Payment Mode',
      render: (value: string) => value || '-'
    },
    {
      key: 'paymentInstrNumber',
      label: 'Payment INSTR Number',
      render: (value: string) => value || '-'
    },
    {
      key: 'interestRate',
      label: 'Interest Rate',
      render: (value: number) => `${value}%`
    },
    {
      key: 'schedule',
      label: 'Schedule',
    },
    {
      key: 'paymentAgency',
      label: 'Payment Agency',
      render: (value: string) => value || '-'
    },
    {
      key: 'caseProcessDate',
      label: 'Case Process Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'policyId',
      label: 'Policy Id',
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'caseRejectCount',
      label: 'Case Reject Count',
      render: (value: number) => value.toString()
    },
    {
      key: 'writeOffDate',
      label: 'Write Off Date',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'extLANNo',
      label: 'Ext LAN No',
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'productGroupId',
      label: 'Product Group Id',
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'claimAmountMPH',
      label: 'Claim Amount MPH',
      render: (value: number) => value > 0 ? (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>₹{value.toLocaleString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'certificateProcessingDate',
      label: 'Certificate Processing Date',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'claimPaidToNominee',
      label: 'Claim Paid To Nominee',
      render: (value: boolean) => value ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      ),
    },
    {
      key: 'frStatus',
      label: 'FR Status',
    },
    {
      key: 'hoComment',
      label: 'HO Comment',
    },
    {
      key: 'beneficiaryName',
      label: 'Beneficiary Name',
      sortable: true,
    },
    {
      key: 'beneficiaryAccountNumber',
      label: 'Beneficiary Account Number',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Bank className="w-4 h-4 text-gray-400" />
          <span className="font-mono">{value}</span>
        </div>
      )
    },
    {
      key: 'beneficiaryIfscCode',
      label: 'Beneficiary Ifsc Code',
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'beneficiaryBankName',
      label: 'Beneficiary Bank Name',
    },
    {
      key: 'relationship',
      label: 'Relationship',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Heart className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'hoRejectionReason',
      label: 'HO Rejection Reason',
      render: (value: string) => value || '-'
    },
    {
      key: 'masterPolicyHolderNEFT',
      label: 'Master Policy Holder NEFT',
      render: (value: string) => value || '-'
    },
    {
      key: 'beneficiaryPhoneNumber',
      label: 'Beneficiary Phone Number',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'isPartnerRemitted',
      label: 'Is Partner Remitted',
      render: (value: boolean) => value ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      ),
    },
    {
      key: 'waiveOffDate',
      label: 'Waive Off Date',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'frSendDate',
      label: 'FR Send Date',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'frReceivingDate',
      label: 'FR Receiving Date',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'mobileNumber',
      label: 'Mobile Number',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'clientNameInBank',
      label: 'Client Name In Bank',
    },
    {
      key: 'customerBankValidateResponse',
      label: 'Customer Bank Validate Response',
    },
    {
      key: 'bankDetailsValidated',
      label: 'Bank Details Validated',
      render: (value: boolean) => value ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      ),
    },
    {
      key: 'micrCode',
      label: 'MICR Code',
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading insurance report data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Insurance Report</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View and analyze insurance claims and settlements</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg flex items-center space-x-2">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Claims</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {records.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Settled Claims</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {records.filter(record => record.deathStatus === 'settled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Claims</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {records.filter(record => ['reported', 'verified', 'approved'].includes(record.deathStatus)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected Claims</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {records.filter(record => record.deathStatus === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Insurance Report Records</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredRecords.length} records found
              </p>
            </div>
            
            <FilterDropdown 
              onFilter={handleFilter}
              onDownload={handleDownload}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecords.map((record, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {column.render ? column.render(record[column.key as keyof InsuranceReportRecord], record) : record[column.key as keyof InsuranceReportRecord]}
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