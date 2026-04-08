import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  Calendar, 
  User, 
  Phone, 
  CheckCircle, 
  XCircle, 
  Filter, 
  ChevronDown,
  Building,
  Edit,
  Trash2
} from 'lucide-react';

interface DeathCaseRecord {
  id: string;
  branch: string;
  centerCode: string;
  centerName: string;
  deathId: string;
  loanCode: string;
  clientCode: string;
  clientName: string;
  insuranceId: string;
  dateReported: string;
  clientSpouseFlag: boolean;
  beneficiaryPhoneNumber: string;
  status: string;
}

interface FilterOptions {
  branch?: string;
  center?: string;
  deathId?: string;
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
}> = ({ onFilter }) => {
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
    onFilter(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      deathReportDateFrom: '',
      deathReportDateTo: ''
    });
    onFilter({
      deathReportDateFrom: '',
      deathReportDateTo: ''
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
              <Calendar className="w-5 h-5 text-gray-400" />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Death ID</label>
                <input
                  type="text"
                  value={filters.deathId || ''}
                  onChange={(e) => handleFilterChange('deathId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter death ID"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Death Status</label>
                <select
                  value={filters.deathStatus || ''}
                  onChange={(e) => handleFilterChange('deathStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="reported">Reported</option>
                  <option value="verified">Verified</option>
                  <option value="settled">Settled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Death Report Date From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={filters.deathReportDateFrom}
                  onChange={(e) => handleFilterChange('deathReportDateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Death Report Date To <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={filters.deathReportDateTo}
                  onChange={(e) => handleFilterChange('deathReportDateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case Process Date From</label>
                <input
                  type="date"
                  value={filters.caseProcessDateFrom || ''}
                  onChange={(e) => handleFilterChange('caseProcessDateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case Process Date To</label>
                <input
                  type="date"
                  value={filters.caseProcessDateTo || ''}
                  onChange={(e) => handleFilterChange('caseProcessDateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

export const DeathCasePage: React.FC = () => {
  const [records, setRecords] = useState<DeathCaseRecord[]>([
    {
      id: '1',
      branch: 'Main Branch',
      centerCode: 'CTR001',
      centerName: 'Anand Nagar Center',
      deathId: 'DTH001',
      loanCode: 'LN001',
      clientCode: 'CL001',
      clientName: 'Priya Sharma',
      insuranceId: 'INS001',
      dateReported: '2024-01-15',
      clientSpouseFlag: true,
      beneficiaryPhoneNumber: '+91 9876543210',
      status: 'reported'
    },
    {
      id: '2',
      branch: 'North Branch',
      centerCode: 'CTR002',
      centerName: 'Gandhi Colony Center',
      deathId: 'DTH002',
      loanCode: 'LN002',
      clientCode: 'CL002',
      clientName: 'Rajesh Kumar',
      insuranceId: 'INS002',
      dateReported: '2024-01-12',
      clientSpouseFlag: false,
      beneficiaryPhoneNumber: '+91 9876543211',
      status: 'verified'
    },
    {
      id: '3',
      branch: 'South Branch',
      centerCode: 'CTR003',
      centerName: 'Nehru Park Center',
      deathId: 'DTH003',
      loanCode: 'LN003',
      clientCode: 'CL003',
      clientName: 'Sunita Devi',
      insuranceId: 'INS003',
      dateReported: '2024-01-10',
      clientSpouseFlag: true,
      beneficiaryPhoneNumber: '+91 9876543212',
      status: 'settled'
    }
  ]);
  
  const [filteredRecords, setFilteredRecords] = useState<DeathCaseRecord[]>(records);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleFilter = (filters: FilterOptions) => {
    let filtered = records;

    // Apply filters based on the filter options
    if (filters.branch) {
      filtered = filtered.filter(record => record.branch.toLowerCase().includes(filters.branch!.toLowerCase()));
    }
    if (filters.center) {
      filtered = filtered.filter(record => 
        record.centerName.toLowerCase().includes(filters.center!.toLowerCase()) ||
        record.centerCode.toLowerCase().includes(filters.center!.toLowerCase())
      );
    }
    if (filters.deathId) {
      filtered = filtered.filter(record => record.deathId.toLowerCase().includes(filters.deathId!.toLowerCase()));
    }
    if (filters.loanCode) {
      filtered = filtered.filter(record => record.loanCode.toLowerCase().includes(filters.loanCode!.toLowerCase()));
    }
    if (filters.clientCode) {
      filtered = filtered.filter(record => record.clientCode.toLowerCase().includes(filters.clientCode!.toLowerCase()));
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
    // In a real application, we would also filter by case process date

    setFilteredRecords(filtered);
  };

  const handleDownload = () => {
    alert('Download functionality will be implemented');
  };

  const handleSettlementUpload = () => {
    alert('Settlement upload functionality will be implemented');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'settled':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Calendar className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'settled':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'verified':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const columns = [
    {
      key: 'actions',
      label: 'Action',
      render: (value: any, row: DeathCaseRecord) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => console.log('Edit record:', row.id)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => console.log('Delete record:', row.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      key: 'branch',
      label: 'Branch',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'centerCode',
      label: 'Center Code',
      sortable: true,
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
      key: 'loanCode',
      label: 'Loan Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
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
      key: 'clientName',
      label: 'Client Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'insuranceId',
      label: 'Insurance Id',
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
      key: 'clientSpouseFlag',
      label: 'Client Spouse Flag',
      render: (value: boolean) => value ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      ),
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
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading death case data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Death Case</h1>
        <p className="text-gray-600 mt-1">Manage death cases and insurance claims</p>
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
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Reported</p>
              <p className="text-xl font-bold text-gray-900">
                {records.filter(record => record.status === 'reported').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-xl font-bold text-gray-900">
                {records.filter(record => record.status === 'verified').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Settled</p>
              <p className="text-xl font-bold text-gray-900">
                {records.filter(record => record.status === 'settled').length}
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
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-xl font-bold text-gray-900">
                {records.filter(record => record.status === 'rejected').length}
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
              <h2 className="text-xl font-semibold text-gray-900">Death Case Records</h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredRecords.length} records found
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <FilterDropdown onFilter={handleFilter} />
              
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              
              <button
                onClick={handleSettlementUpload}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <Upload className="w-4 h-4" />
                <span>Settlement</span>
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
              {filteredRecords.map((record, index) => (
                <tr
                  key={record.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(record[column.key as keyof DeathCaseRecord], record) : record[column.key as keyof DeathCaseRecord]}
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