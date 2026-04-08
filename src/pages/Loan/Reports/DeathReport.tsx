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
  Shield
} from 'lucide-react';

interface DeathReportRecord {
  id: string;
  divisionCode: string;
  divisionName: string;
  branchCode: string;
  branchName: string;
  centerCode: string;
  centerName: string;
  clientId: string;
  customerName: string;
  fsName: string;
  gender: string;
  sumAssured: number;
  insuranceType: string;
  claimAmount: number;
  nomineeName: string;
  coInsurerPolicyId: string;
  clientInsPolicyId: string;
  deathId: string;
  loanId: string;
  dateReported: string;
  deathDate: string;
  clientSpouseFlag: boolean;
  insuranceCode: string;
  insuranceName: string;
  status: string;
  dirReceiveDate: string;
  dirApprovedDate: string;
  dirApprovedBy: string;
  dcReceiveDate: string;
  dcProcessedDate: string;
  dcProcessedBy: string;
  settlementDate: string;
  comments: string;
  settlementAmount: number;
  paymentMode: string;
  paymentInstrNumber: string;
  paymentAgency: string;
  rejectionReason: string;
  insertedBy: string;
  insertedOn: string;
  updatedBy: string;
  updatedOn: string;
}

interface FilterOptions {
  division?: string;
  branch?: string;
  center?: string;
  loanCode?: string;
  clientCode?: string;
  deathStatus?: string;
  deathReportDateFrom: string;
  deathReportDateTo: string;
  caseProcessDateFrom?: string;
  caseProcessDateTo?: string;
}

const FilterDropdown: React.FC<{
  onFilter: (filters: FilterOptions) => void;
  onDownload: () => void;
}> = ({ onFilter, onDownload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    deathReportDateFrom: '',
    deathReportDateTo: ''
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    if (!filters.deathReportDateFrom || !filters.deathReportDateTo) {
      alert('Death Report Date range is mandatory');
      return;
    }
    
    onFilter(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      deathReportDateFrom: '',
      deathReportDateTo: ''
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Code</label>
                  <input
                    type="text"
                    value={filters.loanCode || ''}
                    onChange={(e) => handleFilterChange('loanCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter loan code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Code</label>
                  <input
                    type="text"
                    value={filters.clientCode || ''}
                    onChange={(e) => handleFilterChange('clientCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter client code"
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
                    Death Report Date From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={filters.deathReportDateFrom}
                    onChange={(e) => handleFilterChange('deathReportDateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Death Report Date To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={filters.deathReportDateTo}
                    onChange={(e) => handleFilterChange('deathReportDateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Case Process Date From
                  </label>
                  <input
                    type="date"
                    value={filters.caseProcessDateFrom || ''}
                    onChange={(e) => handleFilterChange('caseProcessDateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Case Process Date To
                  </label>
                  <input
                    type="date"
                    value={filters.caseProcessDateTo || ''}
                    onChange={(e) => handleFilterChange('caseProcessDateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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

export const DeathReport: React.FC = () => {
  const [records, setRecords] = useState<DeathReportRecord[]>([
    {
      id: '1',
      divisionCode: 'DIV001',
      divisionName: 'Central Division',
      branchCode: 'BR001',
      branchName: 'Main Branch',
      centerCode: 'CTR001',
      centerName: 'Anand Nagar Center',
      clientId: 'CL001',
      customerName: 'Priya Sharma',
      fsName: 'Rahul Sharma',
      gender: 'Female',
      sumAssured: 50000,
      insuranceType: 'Life Insurance',
      claimAmount: 50000,
      nomineeName: 'Mohan Sharma',
      coInsurerPolicyId: 'POL001',
      clientInsPolicyId: 'CPOL001',
      deathId: 'DTH001',
      loanId: 'LN001',
      dateReported: '2024-01-15',
      deathDate: '2024-01-10',
      clientSpouseFlag: false,
      insuranceCode: 'INS001',
      insuranceName: 'Basic Life Cover',
      status: 'verified',
      dirReceiveDate: '2024-01-16',
      dirApprovedDate: '2024-01-18',
      dirApprovedBy: 'Manager User',
      dcReceiveDate: '2024-01-19',
      dcProcessedDate: '2024-01-20',
      dcProcessedBy: 'Admin User',
      settlementDate: '',
      comments: 'All documents verified',
      settlementAmount: 0,
      paymentMode: '',
      paymentInstrNumber: '',
      paymentAgency: '',
      rejectionReason: '',
      insertedBy: 'Field Officer',
      insertedOn: '2024-01-15',
      updatedBy: 'Manager User',
      updatedOn: '2024-01-18'
    },
    {
      id: '2',
      divisionCode: 'DIV002',
      divisionName: 'North Division',
      branchCode: 'BR002',
      branchName: 'North Branch',
      centerCode: 'CTR002',
      centerName: 'Gandhi Colony Center',
      clientId: 'CL002',
      customerName: 'Rajesh Kumar',
      fsName: 'Mohan Kumar',
      gender: 'Male',
      sumAssured: 75000,
      insuranceType: 'Life Insurance',
      claimAmount: 75000,
      nomineeName: 'Sunita Kumar',
      coInsurerPolicyId: 'POL002',
      clientInsPolicyId: 'CPOL002',
      deathId: 'DTH002',
      loanId: 'LN002',
      dateReported: '2024-01-12',
      deathDate: '2024-01-08',
      clientSpouseFlag: false,
      insuranceCode: 'INS002',
      insuranceName: 'Term Life Protection',
      status: 'settled',
      dirReceiveDate: '2024-01-13',
      dirApprovedDate: '2024-01-15',
      dirApprovedBy: 'Manager User',
      dcReceiveDate: '2024-01-16',
      dcProcessedDate: '2024-01-17',
      dcProcessedBy: 'Admin User',
      settlementDate: '2024-01-25',
      comments: 'Claim settled',
      settlementAmount: 75000,
      paymentMode: 'NEFT',
      paymentInstrNumber: 'NEFT001',
      paymentAgency: 'Insurance Company A',
      rejectionReason: '',
      insertedBy: 'Field Officer',
      insertedOn: '2024-01-12',
      updatedBy: 'Admin User',
      updatedOn: '2024-01-25'
    },
    {
      id: '3',
      divisionCode: 'DIV003',
      divisionName: 'South Division',
      branchCode: 'BR003',
      branchName: 'South Branch',
      centerCode: 'CTR003',
      centerName: 'Nehru Park Center',
      clientId: 'CL003',
      customerName: 'Sunita Devi',
      fsName: 'Ramesh Devi',
      gender: 'Female',
      sumAssured: 30000,
      insuranceType: 'Life Insurance',
      claimAmount: 0,
      nomineeName: 'Suresh Devi',
      coInsurerPolicyId: 'POL003',
      clientInsPolicyId: 'CPOL003',
      deathId: 'DTH003',
      loanId: 'LN003',
      dateReported: '2024-01-10',
      deathDate: '2024-01-05',
      clientSpouseFlag: false,
      insuranceCode: 'INS003',
      insuranceName: 'Basic Life Cover',
      status: 'rejected',
      dirReceiveDate: '2024-01-11',
      dirApprovedDate: '',
      dirApprovedBy: '',
      dcReceiveDate: '2024-01-12',
      dcProcessedDate: '2024-01-13',
      dcProcessedBy: 'Admin User',
      settlementDate: '',
      comments: 'Claim rejected due to policy exclusion',
      settlementAmount: 0,
      paymentMode: '',
      paymentInstrNumber: '',
      paymentAgency: '',
      rejectionReason: 'Policy exclusion - pre-existing condition',
      insertedBy: 'Field Officer',
      insertedOn: '2024-01-10',
      updatedBy: 'Admin User',
      updatedOn: '2024-01-13'
    }
  ]);
  
  const [filteredRecords, setFilteredRecords] = useState<DeathReportRecord[]>(records);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleFilter = (filters: FilterOptions) => {
    let filtered = records;

    // Apply filters based on the filter options
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
    if (filters.loanCode) {
      filtered = filtered.filter(record => record.loanId.toLowerCase().includes(filters.loanCode!.toLowerCase()));
    }
    if (filters.clientCode) {
      filtered = filtered.filter(record => record.clientId.toLowerCase().includes(filters.clientCode!.toLowerCase()));
    }
    if (filters.deathStatus) {
      filtered = filtered.filter(record => record.status === filters.deathStatus);
    }
    if (filters.deathReportDateFrom && filters.deathReportDateTo) {
      filtered = filtered.filter(record => 
        record.dateReported >= filters.deathReportDateFrom && 
        record.dateReported <= filters.deathReportDateTo
      );
    }
    if (filters.caseProcessDateFrom && filters.caseProcessDateTo) {
      filtered = filtered.filter(record => 
        record.dcProcessedDate && 
        record.dcProcessedDate >= filters.caseProcessDateFrom && 
        record.dcProcessedDate <= filters.caseProcessDateTo
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
      key: 'fsName',
      label: 'FS Name',
      sortable: true,
    },
    {
      key: 'gender',
      label: 'Gender',
      sortable: true,
    },
    {
      key: 'sumAssured',
      label: 'Sum Assured',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'insuranceType',
      label: 'Insurance Type',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Shield className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'claimAmount',
      label: 'Claim Amount',
      sortable: true,
      render: (value: number) => value > 0 ? (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'nomineeName',
      label: 'Nominee Name',
      sortable: true,
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
      key: 'clientSpouseFlag',
      label: 'Client Spouse Flag',
      render: (value: boolean) => value ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      ),
    },
    {
      key: 'insuranceCode',
      label: 'Insurance Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'insuranceName',
      label: 'Insurance Name',
      sortable: true,
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
      key: 'dirReceiveDate',
      label: 'DIR Receive Date',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'dirApprovedDate',
      label: 'DIR Approved Date',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'dirApprovedBy',
      label: 'DIR Approved By',
      render: (value: string) => value || '-'
    },
    {
      key: 'dcReceiveDate',
      label: 'DC Receive Date',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'dcProcessedDate',
      label: 'DC Processed Date',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'dcProcessedBy',
      label: 'DC Processed By',
      render: (value: string) => value || '-'
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
      key: 'comments',
      label: 'Comments',
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
      key: 'paymentAgency',
      label: 'Payment Agency',
      render: (value: string) => value || '-'
    },
    {
      key: 'rejectionReason',
      label: 'Rejection Reason',
      render: (value: string) => value || '-'
    },
    {
      key: 'insertedBy',
      label: 'Inserted By',
      sortable: true,
    },
    {
      key: 'insertedOn',
      label: 'Inserted On',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'updatedBy',
      label: 'Updated By',
      render: (value: string) => value || '-'
    },
    {
      key: 'updatedOn',
      label: 'Updated On',
      render: (value: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading death report data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Death Report</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage death cases and insurance claims</p>
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
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reported</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {records.filter(record => record.status === 'reported').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {records.filter(record => record.status === 'verified').length}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Settled</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {records.filter(record => record.status === 'settled').length}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {records.filter(record => record.status === 'rejected').length}
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Death Report Records</h2>
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
                      {column.render ? column.render(record[column.key as keyof DeathReportRecord], record) : record[column.key as keyof DeathReportRecord]}
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