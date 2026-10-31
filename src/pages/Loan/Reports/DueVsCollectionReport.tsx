import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Calendar, 
  Building, 
  CheckCircle, 
  XCircle, 
  Filter, 
  ChevronDown,
  FileText
} from 'lucide-react';
import { apiFetch } from '../../../lib/api';

interface DueVsCollectionRecord {
  id: string;
  reportStatus: string;
  startDate: string;
  endDate: string;
  userId: string;
  reportName: string;
  fromDate: string;
  toDate: string;
  branch: string;
  collectionType: string;
  bcPartnerId: string;
  collectionSegment: string;
}

interface FilterOptions {
  state?: string;
  zone?: string;
  division?: string;
  branch?: string;
  dateFrom: string;
  dateTo: string;
  collectionType?: string;
  bcPartnerId?: string;
  collectionSegment?: string;
}

interface DueVsCollectionSummary {
  from: string;
  to: string;
  scheduled_due: string | number;
  principal_due: string | number;
  interest_due: string | number;
  fees_due: string | number;
  collected_amount: string | number;
  collection_count: string | number;
}

const FilterDropdown: React.FC<{
  onFilter: (filters: FilterOptions) => void;
  onValidationError: (message: string) => void;
}> = ({ onFilter, onValidationError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dateFrom: '',
    dateTo: ''
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    if (!filters.dateFrom || !filters.dateTo) {
      onValidationError('Date From and Date To are required.');
      return;
    }
    if (filters.dateFrom > filters.dateTo) {
      onValidationError('Date From must not be later than Date To.');
      return;
    }
    
    onFilter(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: ''
    });
  };

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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date To <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Collection Type</label>
                <select
                  value={filters.collectionType || ''}
                  onChange={(e) => handleFilterChange('collectionType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Types</option>
                  <option value="cash">Cash</option>
                  <option value="digital">Digital</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank-transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BC Partner ID</label>
                <input
                  type="text"
                  value={filters.bcPartnerId || ''}
                  onChange={(e) => handleFilterChange('bcPartnerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter BC partner ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Collection Segment</label>
                <select
                  value={filters.collectionSegment || ''}
                  onChange={(e) => handleFilterChange('collectionSegment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Segments</option>
                  <option value="regular">Regular</option>
                  <option value="overdue">Overdue</option>
                  <option value="advance">Advance</option>
                </select>
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
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const DueVsCollectionReport: React.FC = () => {
  const [records, setRecords] = useState<DueVsCollectionRecord[]>([]);
  
  const [filteredRecords, setFilteredRecords] = useState<DueVsCollectionRecord[]>(records);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions | null>(null);
  const [summary, setSummary] = useState<DueVsCollectionSummary | null>(null);

  const money = (value: string | number) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const loadReport = async (filters: FilterOptions) => {
    const unsupported = ['state', 'zone', 'division', 'branch', 'collectionType', 'bcPartnerId', 'collectionSegment']
      .filter(key => Boolean(filters[key as keyof FilterOptions]));
    if (unsupported.length) {
      setError(`The authoritative Due vs Collection API does not support: ${unsupported.join(', ')}.`);
      return;
    }
    setAppliedFilters(filters);
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const query = new URLSearchParams({ from: filters.dateFrom, to: filters.dateTo });
      const response = await apiFetch(`/api/repayments/reports/due-vs-collection?${query.toString()}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message || 'Failed to load due vs collection data');
      const result = body.data as DueVsCollectionSummary;
      const report: DueVsCollectionRecord = { id: `${result.from}:${result.to}`, reportStatus: '—', startDate: result.from, endDate: result.to, userId: '—', reportName: 'Due Vs Collection', fromDate: result.from, toDate: result.to, branch: '—', collectionType: '—', bcPartnerId: '—', collectionSegment: '—' };
      setRecords([report]);
      setFilteredRecords([report]);
      setSummary(result);
      const outstanding = Number(result.scheduled_due) - Number(result.collected_amount);
      setSuccess(`Due: ₹${money(result.scheduled_due)} · Collected: ₹${money(result.collected_amount)} · Outstanding: ₹${money(outstanding)} · ${result.collection_count} posted collection(s).`);
    } catch (reason) {
      setRecords([]);
      setFilteredRecords([]);
      setSummary(null);
      setError(reason instanceof Error ? reason.message : 'Failed to load due vs collection data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters: FilterOptions) => { void loadReport(filters); };

  const handleDownload = () => {
    if (!summary) return;
    const rows = [
      ['From Date', 'To Date', 'Scheduled Due', 'Principal Due', 'Interest Due', 'Fees Due', 'Collected Amount', 'Outstanding Due', 'Posted Collections'],
      [summary.from, summary.to, summary.scheduled_due, summary.principal_due, summary.interest_due, summary.fees_due, summary.collected_amount, String(Number(summary.scheduled_due) - Number(summary.collected_amount)), summary.collection_count].map(String),
    ];
    const blob = new Blob([rows.map(row => row.map(value => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `due-vs-collection-${summary.from}-to-${summary.to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleEdit = (record: DueVsCollectionRecord) => {
    setSuccess(`No persisted detail view exists for the ${record.reportName} aggregate.`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Calendar className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const columns = [
    {
      key: 'download',
      label: 'Download',
      render: (value: any, row: DueVsCollectionRecord) => (
        <button
          onClick={(event) => { event.stopPropagation(); handleDownload(); }}
          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors duration-200"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>
      )
    },
    {
      key: 'reportStatus',
      label: 'Report Status',
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
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'endDate',
      label: 'End Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'userId',
      label: 'User ID',
      sortable: true,
    },
    {
      key: 'reportName',
      label: 'Report Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'fromDate',
      label: 'From Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'toDate',
      label: 'To Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
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
      key: 'collectionType',
      label: 'Collection Type',
      sortable: true,
      render: (value: string) => (
        <span className="capitalize">{value.replace('-', ' ')}</span>
      )
    },
    {
      key: 'bcPartnerId',
      label: 'BC Partner Id',
      sortable: true,
    },
    {
      key: 'collectionSegment',
      label: 'Collection Segment',
      sortable: true,
      render: (value: string) => (
        <span className="capitalize">{value}</span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading due vs collection data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Due Vs Collection</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Compare due amounts with collection performance</p>
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
          <div><span>{error}</span>{appliedFilters && <button onClick={() => void loadReport(appliedFilters)} className="ml-3 text-sm underline">Retry</button>}</div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Due Vs Collection Reports</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredRecords.length} records found
              </p>
            </div>
            
            <FilterDropdown onFilter={handleFilter} onValidationError={setError} />
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
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleEdit(record)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {column.render ? column.render(record[column.key as keyof DueVsCollectionRecord], record) : record[column.key as keyof DueVsCollectionRecord]}
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
