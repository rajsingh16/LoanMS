import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle, 
  Filter, 
  ChevronDown,
  Building,
  Edit,
  Trash2,
  Package,
  X
} from 'lucide-react';

interface AppVerificationRecord {
  id: string;
  clientName: string;
  branchName: string;
  applicationId: string;
  appliedOn: string;
  agentId: string;
  agentName: string;
  applicationStatus: string;
  clientId: string;
  divisionName: string;
  centerCode: string;
  productCode: string;
  bcPartnerName: string;
  insertedOn: string;
}

interface FilterOptions {
  branch?: string;
  center?: string;
  productGroup?: string;
  product?: string;
  businessPartner?: string;
  applicationId?: string;
  status?: string;
  applicationDateFrom: string;
  applicationDateTo: string;
  agentId: string;
}

const FilterDropdown: React.FC<{
  onFilter: (filters: FilterOptions) => void;
}> = ({ onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    applicationDateFrom: '',
    applicationDateTo: '',
    agentId: ''
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
      applicationDateFrom: '',
      applicationDateTo: '',
      agentId: ''
    });
    onFilter({
      applicationDateFrom: '',
      applicationDateTo: '',
      agentId: ''
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Partner</label>
                <input
                  type="text"
                  value={filters.businessPartner || ''}
                  onChange={(e) => handleFilterChange('businessPartner', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter business partner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application ID</label>
                <input
                  type="text"
                  value={filters.applicationId || ''}
                  onChange={(e) => handleFilterChange('applicationId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter application ID"
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
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Date From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={filters.applicationDateFrom}
                  onChange={(e) => handleFilterChange('applicationDateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Date To <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={filters.applicationDateTo}
                  onChange={(e) => handleFilterChange('applicationDateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={filters.agentId}
                  onChange={(e) => handleFilterChange('agentId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter agent ID"
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

export const AppVerificationAdminPage: React.FC = () => {
  const [records, setRecords] = useState<AppVerificationRecord[]>([
    {
      id: '1',
      clientName: 'Priya Sharma',
      branchName: 'Main Branch',
      applicationId: 'APP001',
      appliedOn: '2024-01-15',
      agentId: 'AGT001',
      agentName: 'Amit Kumar',
      applicationStatus: 'pending',
      clientId: 'CL001',
      divisionName: 'Central',
      centerCode: 'CTR001',
      productCode: 'MF001',
      bcPartnerName: 'Partner A',
      insertedOn: '2024-01-15'
    },
    {
      id: '2',
      clientName: 'Rajesh Kumar',
      branchName: 'North Branch',
      applicationId: 'APP002',
      appliedOn: '2024-01-14',
      agentId: 'AGT002',
      agentName: 'Neha Gupta',
      applicationStatus: 'approved',
      clientId: 'CL002',
      divisionName: 'North',
      centerCode: 'CTR002',
      productCode: 'GL001',
      bcPartnerName: 'Partner B',
      insertedOn: '2024-01-14'
    },
    {
      id: '3',
      clientName: 'Sunita Devi',
      branchName: 'South Branch',
      applicationId: 'APP003',
      appliedOn: '2024-01-13',
      agentId: 'AGT001',
      agentName: 'Amit Kumar',
      applicationStatus: 'rejected',
      clientId: 'CL003',
      divisionName: 'South',
      centerCode: 'CTR003',
      productCode: 'MF001',
      bcPartnerName: 'Partner A',
      insertedOn: '2024-01-13'
    }
  ]);
  
  const [filteredRecords, setFilteredRecords] = useState<AppVerificationRecord[]>(records);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleFilter = (filters: FilterOptions) => {
    let filtered = records;

    // Apply filters based on the filter options
    if (filters.branch) {
      filtered = filtered.filter(record => record.branchName.toLowerCase().includes(filters.branch!.toLowerCase()));
    }
    if (filters.center) {
      filtered = filtered.filter(record => record.centerCode.toLowerCase().includes(filters.center!.toLowerCase()));
    }
    if (filters.product) {
      filtered = filtered.filter(record => record.productCode.toLowerCase().includes(filters.product!.toLowerCase()));
    }
    if (filters.businessPartner) {
      filtered = filtered.filter(record => record.bcPartnerName.toLowerCase().includes(filters.businessPartner!.toLowerCase()));
    }
    if (filters.applicationId) {
      filtered = filtered.filter(record => record.applicationId.toLowerCase().includes(filters.applicationId!.toLowerCase()));
    }
    if (filters.status) {
      filtered = filtered.filter(record => record.applicationStatus === filters.status);
    }
    if (filters.applicationDateFrom && filters.applicationDateTo) {
      filtered = filtered.filter(record => 
        record.appliedOn >= filters.applicationDateFrom && 
        record.appliedOn <= filters.applicationDateTo
      );
    }
    if (filters.agentId) {
      filtered = filtered.filter(record => record.agentId.toLowerCase().includes(filters.agentId.toLowerCase()));
    }

    setFilteredRecords(filtered);
  };

  const handleClearQueue = () => {
    alert('Clear queue functionality will be implemented');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Calendar className="w-4 h-4 text-yellow-600" />;
    }
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
      key: 'actions',
      label: 'Action',
      render: (value: any, row: AppVerificationRecord) => (
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
      key: 'branchName',
      label: 'Branch Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'applicationId',
      label: 'Application Id',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'appliedOn',
      label: 'Applied On',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'agentId',
      label: 'Agent Id',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'agentName',
      label: 'Agent Name',
      sortable: true,
    },
    {
      key: 'applicationStatus',
      label: 'Application Status',
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
      key: 'clientId',
      label: 'Client Id',
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
      key: 'centerCode',
      label: 'Center Code',
      sortable: true,
    },
    {
      key: 'productCode',
      label: 'Product Code',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="font-mono">{value}</span>
        </div>
      )
    },
    {
      key: 'bcPartnerName',
      label: 'BC Partner Name',
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
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading application verification data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Application Verification Admin</h1>
        <p className="text-gray-600 mt-1">Manage application verification queue</p>
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
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">
                {records.filter(record => record.applicationStatus === 'pending').length}
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
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-xl font-bold text-gray-900">
                {records.filter(record => record.applicationStatus === 'approved').length}
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
                {records.filter(record => record.applicationStatus === 'rejected').length}
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
              <h2 className="text-xl font-semibold text-gray-900">Verification Queue</h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredRecords.length} records found
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <FilterDropdown onFilter={handleFilter} />
              
              <button
                onClick={handleClearQueue}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
                <span>Clear Queue</span>
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
                      {column.render ? column.render(record[column.key as keyof AppVerificationRecord], record) : record[column.key as keyof AppVerificationRecord]}
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