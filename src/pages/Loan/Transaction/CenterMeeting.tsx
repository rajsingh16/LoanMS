import React, { useState } from 'react';
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
  Edit,
  Trash2
} from 'lucide-react';

interface CenterMeetingRecord {
  id: string;
  meetingId: string;
  displaySequence: number;
  assignedTo: string;
  centerName: string;
  centerId: string;
  meetingType: string;
  meetingStatus: string;
  scheduleDate: string;
  scheduleTime: string;
  meetingEndDate: string;
}

interface FilterOptions {
  branch: string;
  center?: string;
  meeting?: string;
  meetingType?: string;
  meetingStatus: string;
  scheduleDateFrom: string;
  scheduleDateTo: string;
  assignedTo?: string;
}

const FilterDropdown: React.FC<{
  onFilter: (filters: FilterOptions) => void;
}> = ({ onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    branch: '',
    meetingStatus: '',
    scheduleDateFrom: '',
    scheduleDateTo: ''
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
      branch: '',
      meetingStatus: '',
      scheduleDateFrom: '',
      scheduleDateTo: ''
    });
    onFilter({
      branch: '',
      meetingStatus: '',
      scheduleDateFrom: '',
      scheduleDateTo: ''
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting</label>
                <input
                  type="text"
                  value={filters.meeting || ''}
                  onChange={(e) => handleFilterChange('meeting', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter meeting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Type</label>
                <select
                  value={filters.meetingType || ''}
                  onChange={(e) => handleFilterChange('meetingType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="Regular">Regular</option>
                  <option value="Special">Special</option>
                  <option value="CGT">CGT</option>
                  <option value="GRT">GRT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={filters.meetingStatus}
                  onChange={(e) => handleFilterChange('meetingStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Date From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={filters.scheduleDateFrom}
                    onChange={(e) => handleFilterChange('scheduleDateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Date To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={filters.scheduleDateTo}
                    onChange={(e) => handleFilterChange('scheduleDateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <input
                  type="text"
                  value={filters.assignedTo || ''}
                  onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter assigned to"
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

export const CenterMeetingPage: React.FC = () => {
  const [records, setRecords] = useState<CenterMeetingRecord[]>([
    {
      id: '1',
      meetingId: 'MTG001',
      displaySequence: 1,
      assignedTo: 'Amit Kumar',
      centerName: 'Anand Nagar Center',
      centerId: 'CTR001',
      meetingType: 'Regular',
      meetingStatus: 'scheduled',
      scheduleDate: '2024-01-22',
      scheduleTime: '10:00',
      meetingEndDate: '2024-01-22'
    },
    {
      id: '2',
      meetingId: 'MTG002',
      displaySequence: 2,
      assignedTo: 'Neha Gupta',
      centerName: 'Gandhi Colony Center',
      centerId: 'CTR002',
      meetingType: 'CGT',
      meetingStatus: 'completed',
      scheduleDate: '2024-01-17',
      scheduleTime: '14:00',
      meetingEndDate: '2024-01-17'
    },
    {
      id: '3',
      meetingId: 'MTG003',
      displaySequence: 3,
      assignedTo: 'Rajesh Singh',
      centerName: 'Nehru Park Center',
      centerId: 'CTR003',
      meetingType: 'GRT',
      meetingStatus: 'cancelled',
      scheduleDate: '2024-01-19',
      scheduleTime: '11:30',
      meetingEndDate: '2024-01-19'
    }
  ]);
  
  const [filteredRecords, setFilteredRecords] = useState<CenterMeetingRecord[]>(records);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleFilter = (filters: FilterOptions) => {
    let filtered = records;

    // Apply filters based on the filter options
    if (filters.branch) {
      filtered = filtered.filter(record => record.centerName.toLowerCase().includes(filters.branch.toLowerCase()));
    }
    if (filters.center) {
      filtered = filtered.filter(record => 
        record.centerName.toLowerCase().includes(filters.center!.toLowerCase()) ||
        record.centerId.toLowerCase().includes(filters.center!.toLowerCase())
      );
    }
    if (filters.meeting) {
      filtered = filtered.filter(record => record.meetingId.toLowerCase().includes(filters.meeting!.toLowerCase()));
    }
    if (filters.meetingType) {
      filtered = filtered.filter(record => record.meetingType === filters.meetingType);
    }
    if (filters.meetingStatus) {
      filtered = filtered.filter(record => record.meetingStatus === filters.meetingStatus);
    }
    if (filters.scheduleDateFrom && filters.scheduleDateTo) {
      filtered = filtered.filter(record => 
        record.scheduleDate >= filters.scheduleDateFrom && 
        record.scheduleDate <= filters.scheduleDateTo
      );
    }
    if (filters.assignedTo) {
      filtered = filtered.filter(record => record.assignedTo.toLowerCase().includes(filters.assignedTo!.toLowerCase()));
    }

    setFilteredRecords(filtered);
  };

  const handleDownload = () => {
    alert('Download functionality will be implemented');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const columns = [
    {
      key: 'actions',
      label: 'Action',
      render: (value: any, row: CenterMeetingRecord) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => console.log('Edit meeting:', row.id)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => console.log('Delete meeting:', row.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      key: 'meetingId',
      label: 'Meeting Id',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'displaySequence',
      label: 'Display Sequence',
      sortable: true,
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'centerName',
      label: 'Center Name',
      sortable: true,
    },
    {
      key: 'centerId',
      label: 'Center Id',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'meetingType',
      label: 'Meeting Type',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800">
          {value}
        </span>
      )
    },
    {
      key: 'meetingStatus',
      label: 'Meeting Status',
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
      key: 'scheduleDate',
      label: 'Schedule Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'scheduleTime',
      label: 'Schedule Time',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'meetingEndDate',
      label: 'Meeting End Date',
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
          <span className="text-gray-600">Loading center meetings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Center Meeting</h1>
        <p className="text-gray-600 mt-1">Schedule and manage center meetings</p>
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
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-xl font-bold text-gray-900">
                {records.filter(record => record.meetingStatus === 'scheduled').length}
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
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xl font-bold text-gray-900">
                {records.filter(record => record.meetingStatus === 'completed').length}
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
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-xl font-bold text-gray-900">
                {records.filter(record => record.meetingStatus === 'cancelled').length}
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
              <h2 className="text-xl font-semibold text-gray-900">Center Meetings</h2>
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
                      {column.render ? column.render(record[column.key as keyof CenterMeetingRecord], record) : record[column.key as keyof CenterMeetingRecord]}
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