import React, { useState } from 'react';
import { 
  Search, 
  Building, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Filter, 
  ChevronDown,
  ArrowRight,
  User
} from 'lucide-react';

interface CenterRecord {
  id: string;
  branch: string;
  centerId: string;
  centerName: string;
  centerCode: string;
  centerDay: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  meetingPlace: string;
  collPartnerId: string;
  villageId: string;
  status: 'active' | 'inactive';
}

interface FilterOptions {
  branch: string;
  foId?: string;
  center?: string;
}

const FilterDropdown: React.FC<{
  onFilter: (filters: FilterOptions) => void;
  onFetch: () => void;
}> = ({ onFilter, onFetch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    branch: ''
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
      branch: ''
    });
    onFilter({
      branch: ''
    });
  };

  const handleFetch = () => {
    onFetch();
    setIsOpen(false);
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={filters.branch}
                  onChange={(e) => handleFilterChange('branch', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter branch"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">FO ID</label>
                <input
                  type="text"
                  value={filters.foId || ''}
                  onChange={(e) => handleFilterChange('foId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter FO ID"
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
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Clear All
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={handleFetch}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Fetch
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
        </div>
      )}
    </div>
  );
};

export const CenterTransferPage: React.FC = () => {
  const [records, setRecords] = useState<CenterRecord[]>([
    {
      id: '1',
      branch: 'Main Branch',
      centerId: 'CTR001',
      centerName: 'Anand Nagar Center',
      centerCode: 'ANC001',
      centerDay: 'Monday',
      address1: '123 Main Street',
      address2: 'Anand Nagar',
      address3: 'Central Delhi',
      city: 'Delhi',
      meetingPlace: 'Community Hall',
      collPartnerId: 'CP001',
      villageId: 'VIL001',
      status: 'active'
    },
    {
      id: '2',
      branch: 'North Branch',
      centerId: 'CTR002',
      centerName: 'Gandhi Colony Center',
      centerCode: 'GCC002',
      centerDay: 'Wednesday',
      address1: '456 Gandhi Road',
      address2: 'Gandhi Colony',
      address3: 'North Delhi',
      city: 'Delhi',
      meetingPlace: 'School Ground',
      collPartnerId: 'CP002',
      villageId: 'VIL002',
      status: 'active'
    },
    {
      id: '3',
      branch: 'South Branch',
      centerId: 'CTR003',
      centerName: 'Nehru Park Center',
      centerCode: 'NPC003',
      centerDay: 'Friday',
      address1: '789 Park Avenue',
      address2: 'Nehru Park',
      address3: 'South Delhi',
      city: 'Delhi',
      meetingPlace: 'Park Pavilion',
      collPartnerId: 'CP003',
      villageId: 'VIL003',
      status: 'inactive'
    }
  ]);
  
  const [filteredRecords, setFilteredRecords] = useState<CenterRecord[]>(records);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [targetBranch, setTargetBranch] = useState('');
  const [targetFoId, setTargetFoId] = useState('');
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);

  const handleFilter = (filters: FilterOptions) => {
    let filtered = records;

    // Apply filters based on the filter options
    if (filters.branch) {
      filtered = filtered.filter(record => record.branch.toLowerCase().includes(filters.branch.toLowerCase()));
    }
    if (filters.foId) {
      filtered = filtered.filter(record => record.collPartnerId.toLowerCase().includes(filters.foId.toLowerCase()));
    }
    if (filters.center) {
      filtered = filtered.filter(record => 
        record.centerName.toLowerCase().includes(filters.center!.toLowerCase()) ||
        record.centerCode.toLowerCase().includes(filters.center!.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  };

  const handleFetch = () => {
    // In a real application, this would fetch data from the server
    setSuccess('Centers fetched successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleTransfer = () => {
    if (!targetBranch || !targetFoId || selectedCenters.length === 0) {
      setError('Please select target branch, target FO ID, and at least one center to transfer');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // In a real application, this would send the transfer request to the server
    setSuccess(`${selectedCenters.length} centers transferred successfully to ${targetBranch}`);
    setSelectedCenters([]);
    setTimeout(() => setSuccess(''), 3000);
  };

  const toggleCenterSelection = (centerId: string) => {
    setSelectedCenters(prev => 
      prev.includes(centerId) 
        ? prev.filter(id => id !== centerId)
        : [...prev, centerId]
    );
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const columns = [
    {
      key: 'select',
      label: 'Select',
      render: (value: any, row: CenterRecord) => (
        <input
          type="checkbox"
          checked={selectedCenters.includes(row.id)}
          onChange={() => toggleCenterSelection(row.id)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
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
      key: 'centerId',
      label: 'Center Id',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'centerName',
      label: 'Center Name',
      sortable: true,
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
      key: 'centerDay',
      label: 'Center Day',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'address1',
      label: 'Address 1',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'address2',
      label: 'Address 2',
    },
    {
      key: 'address3',
      label: 'Address 3',
    },
    {
      key: 'city',
      label: 'City',
      sortable: true,
    },
    {
      key: 'meetingPlace',
      label: 'Meeting Place',
    },
    {
      key: 'collPartnerId',
      label: 'Coll Partner Id',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-mono">{value}</span>
        </div>
      )
    },
    {
      key: 'villageId',
      label: 'Village Id',
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
          <span className="text-gray-600">Loading center data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Center Transfer</h1>
        <p className="text-gray-600 mt-1">Transfer centers between branches and field officers</p>
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

      {/* Transfer Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Branch <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={targetBranch}
              onChange={(e) => setTargetBranch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter target branch"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target FO ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={targetFoId}
              onChange={(e) => setTargetFoId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter target FO ID"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleTransfer}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              disabled={!targetBranch || !targetFoId || selectedCenters.length === 0}
            >
              <ArrowRight className="w-4 h-4" />
              <span>Transfer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Centers</h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredRecords.length} records found • {selectedCenters.length} selected
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <FilterDropdown onFilter={handleFilter} onFetch={handleFetch} />
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
                  className={`hover:bg-gray-50 transition-colors duration-200 ${
                    selectedCenters.includes(record.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(record[column.key as keyof CenterRecord], record) : record[column.key as keyof CenterRecord]}
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