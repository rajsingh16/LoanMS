import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User, 
  CreditCard, 
  Filter, 
  ChevronDown,
  Building,
  FileText
} from 'lucide-react';

interface CreditBureauRecord {
  id: string;
  applicationId: string;
  applicationDate: string;
  bcPartner: string;
  applicationStatus: string;
  centerCode: string;
  bureauResult: string;
  clientName: string;
  aadhaarNumber: string;
  voterNumber: string;
  appliedAmount: number;
}

interface FilterOptions {
  branch?: string;
  applicationId: string;
  businessPartner: string;
  dateFrom: string;
  dateTo: string;
  cbPartner: string;
}

const FilterDropdown: React.FC<{
  onFilter: (filters: FilterOptions) => void;
}> = ({ onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    applicationId: '',
    businessPartner: '',
    dateFrom: '',
    dateTo: '',
    cbPartner: ''
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
      applicationId: '',
      businessPartner: '',
      dateFrom: '',
      dateTo: '',
      cbPartner: ''
    });
    onFilter({
      applicationId: '',
      businessPartner: '',
      dateFrom: '',
      dateTo: '',
      cbPartner: ''
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

            <div className="grid grid-cols-1 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={filters.applicationId}
                  onChange={(e) => handleFilterChange('applicationId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter application ID"
                  required
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CB Partner <span className="text-red-500">*</span>
                </label>
                <select
                  value={filters.cbPartner}
                  onChange={(e) => handleFilterChange('cbPartner', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select CB Partner</option>
                  <option value="CIBIL">CIBIL</option>
                  <option value="Experian">Experian</option>
                  <option value="Equifax">Equifax</option>
                  <option value="CRIF Highmark">CRIF Highmark</option>
                </select>
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

export const CreditBureauPage: React.FC = () => {
  const [records, setRecords] = useState<CreditBureauRecord[]>([
    {
      id: '1',
      applicationId: 'APP001',
      applicationDate: '2024-01-15',
      bcPartner: 'Partner A',
      applicationStatus: 'pending',
      centerCode: 'CTR001',
      bureauResult: 'pass',
      clientName: 'Priya Sharma',
      aadhaarNumber: '1234-5678-9012',
      voterNumber: 'ABC1234567',
      appliedAmount: 50000
    },
    {
      id: '2',
      applicationId: 'APP002',
      applicationDate: '2024-01-14',
      bcPartner: 'Partner B',
      applicationStatus: 'approved',
      centerCode: 'CTR002',
      bureauResult: 'pass',
      clientName: 'Rajesh Kumar',
      aadhaarNumber: '2345-6789-0123',
      voterNumber: 'DEF2345678',
      appliedAmount: 75000
    },
    {
      id: '3',
      applicationId: 'APP003',
      applicationDate: '2024-01-13',
      bcPartner: 'Partner A',
      applicationStatus: 'rejected',
      centerCode: 'CTR001',
      bureauResult: 'fail',
      clientName: 'Sunita Devi',
      aadhaarNumber: '3456-7890-1234',
      voterNumber: 'GHI3456789',
      appliedAmount: 30000
    }
  ]);
  
  const [filteredRecords, setFilteredRecords] = useState<CreditBureauRecord[]>(records);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleFilter = (filters: FilterOptions) => {
    let filtered = records;

    // Apply filters based on the filter options
    if (filters.branch) {
      filtered = filtered.filter(record => record.centerCode.includes(filters.branch!));
    }
    if (filters.applicationId) {
      filtered = filtered.filter(record => record.applicationId.includes(filters.applicationId));
    }
    if (filters.businessPartner) {
      filtered = filtered.filter(record => record.bcPartner.includes(filters.businessPartner));
    }
    if (filters.dateFrom && filters.dateTo) {
      filtered = filtered.filter(record => 
        record.applicationDate >= filters.dateFrom && 
        record.applicationDate <= filters.dateTo
      );
    }
    // In a real application, we would filter by CB partner as well

    setFilteredRecords(filtered);
  };

  const handleDownload = () => {
    alert('Download functionality will be implemented');
  };

  const handleCBCheck = () => {
    alert('Credit Bureau check functionality will be implemented');
  };

  const getBureauResultIcon = (result: string) => {
    return result === 'pass' ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const columns = [
    {
      key: 'applicationId',
      label: 'Application Id',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'applicationDate',
      label: 'Application Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'bcPartner',
      label: 'BC Partner',
      sortable: true,
    },
    {
      key: 'applicationStatus',
      label: 'Application Status',
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'centerCode',
      label: 'Center Code',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Building className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'bureauResult',
      label: 'Bureau Result',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          {getBureauResultIcon(value)}
          <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
            value === 'pass' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {value.toUpperCase()}
          </span>
        </div>
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
      key: 'aadhaarNumber',
      label: 'Aadhar Number',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span className="font-mono">{value}</span>
        </div>
      )
    },
    {
      key: 'voterNumber',
      label: 'Voter Number',
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'appliedAmount',
      label: 'Applied Amount',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading credit bureau records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Credit Bureau</h1>
        <p className="text-gray-600 mt-1">Check and manage credit bureau reports</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Passed</p>
              <p className="text-xl font-bold text-gray-900">
                {records.filter(record => record.bureauResult === 'pass').length}
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
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-xl font-bold text-gray-900">
                {records.filter(record => record.bureauResult === 'fail').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Checks</p>
              <p className="text-xl font-bold text-gray-900">
                {records.length}
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
              <h2 className="text-xl font-semibold text-gray-900">Credit Bureau Records</h2>
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
                onClick={handleCBCheck}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Search className="w-4 h-4" />
                <span>CB Check</span>
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
                      {column.render ? column.render(record[column.key as keyof CreditBureauRecord], record) : record[column.key as keyof CreditBureauRecord]}
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