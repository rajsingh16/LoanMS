import React, { useState } from 'react';
import { 
  Download, 
  Plus, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Filter, 
  ChevronDown,
  Building,
  Edit,
  Trash2
} from 'lucide-react';

interface BranchDayCloseRecord {
  id: string;
  branch: string;
  branchCloseDate: string;
  branchBalance: number;
  cashbookBalance: number;
  cashDifference: number;
  denomination: string;
}

interface FilterOptions {
  branch: string;
}

const FilterDropdown: React.FC<{
  onFilter: (filters: FilterOptions) => void;
}> = ({ onFilter }) => {
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
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Building className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Branch Filter</h3>
            </div>

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

export const BranchDayClosePage: React.FC = () => {
  const [records, setRecords] = useState<BranchDayCloseRecord[]>([
    {
      id: '1',
      branch: 'Main Branch',
      branchCloseDate: '2024-01-20',
      branchBalance: 125000,
      cashbookBalance: 125000,
      cashDifference: 0,
      denomination: '2000x10, 500x150, 200x50, 100x100, 50x20, 20x50, 10x100, Coins: 500'
    },
    {
      id: '2',
      branch: 'North Branch',
      branchCloseDate: '2024-01-20',
      branchBalance: 85000,
      cashbookBalance: 85200,
      cashDifference: -200,
      denomination: '2000x5, 500x100, 200x50, 100x100, 50x20, 20x50, 10x50, Coins: 200'
    },
    {
      id: '3',
      branch: 'South Branch',
      branchCloseDate: '2024-01-20',
      branchBalance: 95000,
      cashbookBalance: 94800,
      cashDifference: 200,
      denomination: '2000x10, 500x90, 200x50, 100x100, 50x20, 20x50, 10x80, Coins: 300'
    }
  ]);
  
  const [filteredRecords, setFilteredRecords] = useState<BranchDayCloseRecord[]>(records);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleFilter = (filters: FilterOptions) => {
    let filtered = records;

    // Apply filters based on the filter options
    if (filters.branch) {
      filtered = filtered.filter(record => record.branch.toLowerCase().includes(filters.branch.toLowerCase()));
    }

    setFilteredRecords(filtered);
  };

  const handleDownload = () => {
    alert('Download functionality will be implemented');
  };

  const handleAdd = () => {
    alert('Add branch day close functionality will be implemented');
  };

  const columns = [
    {
      key: 'actions',
      label: 'Action',
      render: (value: any, row: BranchDayCloseRecord) => (
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
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'branchCloseDate',
      label: 'Branch Close Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'branchBalance',
      label: 'Branch Balance',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'cashbookBalance',
      label: 'Cashbook Balance',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'cashDifference',
      label: 'Cash Difference',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className={`font-medium ${value === 0 ? 'text-gray-900' : value > 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{value.toLocaleString()}
          </span>
        </div>
      )
    },
    {
      key: 'denomination',
      label: 'Denomination',
      render: (value: string) => (
        <span className="text-xs font-mono bg-gray-100 p-1 rounded">{value}</span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading branch day close data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Branch Day Close</h1>
        <p className="text-gray-600 mt-1">Manage branch day close operations</p>
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Branches</p>
              <p className="text-xl font-bold text-gray-900">
                {records.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cash</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{records.reduce((sum, record) => sum + record.branchBalance, 0).toLocaleString()}
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
              <p className="text-sm font-medium text-gray-600">Net Difference</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{records.reduce((sum, record) => sum + record.cashDifference, 0).toLocaleString()}
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
              <h2 className="text-xl font-semibold text-gray-900">Branch Day Close Records</h2>
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
                onClick={handleAdd}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
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
                      {column.render ? column.render(record[column.key as keyof BranchDayCloseRecord], record) : record[column.key as keyof BranchDayCloseRecord]}
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