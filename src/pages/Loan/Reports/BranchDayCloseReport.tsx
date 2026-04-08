import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter, 
  ChevronDown,
  Building,
  User,
  DollarSign,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Pagination } from '../../../components/Common/Pagination';

interface BranchDayCloseRecord {
  id: string;
  branchCode: string;
  branchName: string;
  branchId: string;
  branchCloseDate: string;
  branchBalance: number;
  cashBookBalance: number;
  cashDifference: number;
  remarks: string;
  denomination: string;
  insertedBy: string;
  insertedOn: string;
}

interface BranchDayCloseFilterOptions {
  branch: string;
  closeDateFrom: string;
  closeDateTo: string;
}

const BranchDayCloseFilterDropdown: React.FC<{
  onFilter: (filters: BranchDayCloseFilterOptions) => void;
  onDownload: () => void;
}> = ({ onFilter, onDownload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<BranchDayCloseFilterOptions>({
    branch: '',
    closeDateFrom: '',
    closeDateTo: ''
  });

  const handleFilterChange = (key: keyof BranchDayCloseFilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    if (!filters.branch || !filters.closeDateFrom || !filters.closeDateTo) {
      alert('Branch and Close Date range are mandatory');
      return;
    }
    
    onFilter(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      branch: '',
      closeDateFrom: '',
      closeDateTo: ''
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
          <div className="absolute right-0 mt-2 w-[400px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Building className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Filters</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={filters.branch}
                    onChange={(e) => handleFilterChange('branch', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter branch"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Close Date From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={filters.closeDateFrom}
                    onChange={(e) => handleFilterChange('closeDateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Close Date To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={filters.closeDateTo}
                    onChange={(e) => handleFilterChange('closeDateTo', e.target.value)}
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

export const BranchDayCloseReport: React.FC = () => {
  const [records, setRecords] = useState<BranchDayCloseRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BranchDayCloseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Generate sample data
  useEffect(() => {
    const generateSampleData = () => {
      const sampleData: BranchDayCloseRecord[] = [];
      
      for (let i = 1; i <= 50; i++) {
        const branchIndex = i % 5;
        const branchNames = ['Main Branch', 'North Branch', 'South Branch', 'East Branch', 'West Branch'];
        const branchCodes = ['MBR001', 'NBR002', 'SBR003', 'EBR004', 'WBR005'];
        const branchIds = ['BR001', 'BR002', 'BR003', 'BR004', 'BR005'];
        
        // Calculate a random balance between 50,000 and 200,000
        const baseBalance = 50000 + (Math.floor(Math.random() * 150) * 1000);
        
        // Randomly decide if there's a cash difference (10% chance)
        const hasDifference = Math.random() < 0.1;
        const differenceAmount = hasDifference ? (Math.random() < 0.5 ? 1 : -1) * Math.floor(Math.random() * 500) : 0;
        
        const branchBalance = baseBalance;
        const cashBookBalance = baseBalance + differenceAmount;
        
        // Generate a random date in January 2024
        const day = Math.floor(Math.random() * 28) + 1;
        const date = new Date(2024, 0, day);
        
        sampleData.push({
          id: `${i}`,
          branchCode: branchCodes[branchIndex],
          branchName: branchNames[branchIndex],
          branchId: branchIds[branchIndex],
          branchCloseDate: date.toISOString().split('T')[0],
          branchBalance,
          cashBookBalance,
          cashDifference: differenceAmount,
          remarks: differenceAmount === 0 
            ? 'All balanced' 
            : differenceAmount > 0 
              ? 'Minor excess, to be adjusted' 
              : 'Minor discrepancy, to be investigated',
          denomination: generateRandomDenomination(branchBalance),
          insertedBy: i % 2 === 0 ? 'Admin User' : 'Manager User',
          insertedOn: date.toISOString().split('T')[0]
        });
      }
      
      setRecords(sampleData);
      setFilteredRecords(sampleData);
      setTotalItems(sampleData.length);
      setTotalPages(Math.ceil(sampleData.length / pageSize));
      setLoading(false);
    };
    
    // Helper function to generate a random denomination string
    const generateRandomDenomination = (total: number) => {
      const denominations = [2000, 500, 200, 100, 50, 20, 10];
      let remaining = total;
      const counts: Record<number, number> = {};
      
      // Distribute the total amount across denominations
      for (const denom of denominations) {
        if (remaining <= 0) break;
        
        // Calculate a random count for this denomination
        const maxCount = Math.floor(remaining / denom);
        const count = Math.floor(Math.random() * Math.min(maxCount, 100)) + 1;
        
        counts[denom] = count;
        remaining -= denom * count;
      }
      
      // Add some coins for the remainder
      counts['Coins'] = remaining;
      
      // Format the denomination string
      return Object.entries(counts)
        .map(([denom, count]) => denom === 'Coins' ? `Coins: ${count}` : `${denom}x${count}`)
        .join(', ');
    };
    
    generateSampleData();
  }, []);

  const handleFilter = (filters: BranchDayCloseFilterOptions) => {
    let filtered = records;

    // Apply filters based on the filter options
    if (filters.branch) {
      filtered = filtered.filter(record => 
        record.branchName.toLowerCase().includes(filters.branch.toLowerCase()) ||
        record.branchCode.toLowerCase().includes(filters.branch.toLowerCase())
      );
    }
    if (filters.closeDateFrom && filters.closeDateTo) {
      filtered = filtered.filter(record => 
        record.branchCloseDate >= filters.closeDateFrom && 
        record.branchCloseDate <= filters.closeDateTo
      );
    }

    setFilteredRecords(filtered);
    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1); // Reset to first page
  };

  const handleDownload = () => {
    // In a real application, this would generate and download a CSV or Excel file
    alert('Download functionality will be implemented');
  };

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredRecords.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setTotalPages(Math.ceil(filteredRecords.length / size));
    setCurrentPage(1); // Reset to first page
  };

  const columns = [
    {
      key: 'branchCode',
      label: 'Branch Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
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
      key: 'branchId',
      label: 'Branch Id',
      sortable: true,
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
      key: 'cashBookBalance',
      label: 'Cash Book Balance',
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
          <span className={`font-medium ${value === 0 ? 'text-gray-900 dark:text-gray-100' : value > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ₹{value.toLocaleString()}
          </span>
        </div>
      )
    },
    {
      key: 'remarks',
      label: 'Remarks',
      sortable: true,
    },
    {
      key: 'denomination',
      label: 'Denomination',
      render: (value: string) => (
        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded">{value}</span>
      )
    },
    {
      key: 'insertedBy',
      label: 'Inserted By',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <User className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
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
          <span className="text-gray-600 dark:text-gray-400">Loading branch day close data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Branch Day Close Report</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View and analyze branch day close operations</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Section (Toggleable) */}
      {showSummary && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Total Branches</h4>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{filteredRecords.length}</span>
              </div>
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full">
                <div className="h-1 bg-blue-600 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Total Cash</h4>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹{filteredRecords.reduce((sum, record) => sum + record.branchBalance, 0).toLocaleString()}
                </span>
              </div>
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full">
                <div className="h-1 bg-green-600 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Net Difference</h4>
                <span className={`text-lg font-bold ${
                  filteredRecords.reduce((sum, record) => sum + record.cashDifference, 0) === 0 
                    ? 'text-gray-900 dark:text-white' 
                    : filteredRecords.reduce((sum, record) => sum + record.cashDifference, 0) > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  ₹{filteredRecords.reduce((sum, record) => sum + record.cashDifference, 0).toLocaleString()}
                </span>
              </div>
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full">
                <div 
                  className={`h-1 ${
                    filteredRecords.reduce((sum, record) => sum + record.cashDifference, 0) === 0 
                      ? 'bg-gray-500' 
                      : filteredRecords.reduce((sum, record) => sum + record.cashDifference, 0) > 0
                      ? 'bg-green-600'
                      : 'bg-red-600'
                  } rounded-full`} 
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Branch Day Close Records</h2>
              <button
                onClick={() => setShowSummary(!showSummary)}
                className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                {showSummary ? (
                  <>
                    <ToggleRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>Hide Summary</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5" />
                    <span>Show Summary</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredRecords.length} records found
              </p>
              
              <BranchDayCloseFilterDropdown 
                onFilter={handleFilter}
                onDownload={handleDownload}
              />
            </div>
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
              {getPaginatedData().map((record, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {column.render ? column.render(record[column.key as keyof BranchDayCloseRecord], record) : record[column.key as keyof BranchDayCloseRecord]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
};