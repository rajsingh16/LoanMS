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
  MapPin,
  Clock,
  Smartphone,
  Briefcase,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface EmployeeAttendanceRecord {
  id: string;
  stateName: string;
  zoneName: string;
  divisionName: string;
  branchCode: string;
  branchName: string;
  branchId: string;
  branchManagerName: string;
  branchManagerId: string;
  employeeName: string;
  employeeId: string;
  personalMobileNumber: string;
  cugMobileNumber: string;
  designationName: string;
  businessDate: string;
  status: 'present' | 'absent' | 'leave' | 'holiday';
  attendanceType: string;
  absentReason: string;
  absentReasonMean: string;
  remarks: string;
  inSource: string;
  outSource: string;
  inDeviceId: string;
  outDeviceId: string;
  inLatitude: number;
  outLatitude: number;
  inLongitude: number;
  outLongitude: number;
  inTime: string;
  outTime: string;
  inIp: string;
  outIp: string;
}

interface FilterOptions {
  state?: string;
  circle?: string;
  zone?: string;
  division?: string;
  branch?: string;
  dateFrom: string;
  dateTo: string;
  showDetail: boolean;
}

const FilterDropdown: React.FC<{
  onFilter: (filters: FilterOptions) => void;
  onDownload: () => void;
}> = ({ onFilter, onDownload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dateFrom: '',
    dateTo: '',
    showDetail: false
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    if (!filters.dateFrom || !filters.dateTo) {
      alert('Date range is mandatory');
      return;
    }
    
    onFilter(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      showDetail: false
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Circle</label>
                  <input
                    type="text"
                    value={filters.circle || ''}
                    onChange={(e) => handleFilterChange('circle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter circle"
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

                <div className="flex items-center space-x-2 self-end">
                  <input
                    type="checkbox"
                    id="showDetail"
                    checked={filters.showDetail}
                    onChange={(e) => handleFilterChange('showDetail', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showDetail" className="text-sm text-gray-700 dark:text-gray-300">
                    Show Detail
                  </label>
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

export const EmployeeAttendanceReport: React.FC = () => {
  const [records, setRecords] = useState<EmployeeAttendanceRecord[]>([
    {
      id: '1',
      stateName: 'Delhi',
      zoneName: 'North Zone',
      divisionName: 'Central Division',
      branchCode: 'BR001',
      branchName: 'Main Branch',
      branchId: 'BID001',
      branchManagerName: 'Sunil Kumar',
      branchManagerId: 'MGR001',
      employeeName: 'Amit Kumar',
      employeeId: 'EMP001',
      personalMobileNumber: '+91 9876543210',
      cugMobileNumber: '+91 8765432109',
      designationName: 'Loan Officer',
      businessDate: '2024-01-20',
      status: 'present',
      attendanceType: 'Regular',
      absentReason: '',
      absentReasonMean: '',
      remarks: 'On time',
      inSource: 'Mobile App',
      outSource: 'Mobile App',
      inDeviceId: 'DEVICE001',
      outDeviceId: 'DEVICE001',
      inLatitude: 28.6139,
      outLatitude: 28.6140,
      inLongitude: 77.2090,
      outLongitude: 77.2091,
      inTime: '09:00:00',
      outTime: '18:00:00',
      inIp: '192.168.1.100',
      outIp: '192.168.1.100'
    },
    {
      id: '2',
      stateName: 'Delhi',
      zoneName: 'North Zone',
      divisionName: 'North Division',
      branchCode: 'BR002',
      branchName: 'North Branch',
      branchId: 'BID002',
      branchManagerName: 'Vikram Singh',
      branchManagerId: 'MGR002',
      employeeName: 'Neha Gupta',
      employeeId: 'EMP002',
      personalMobileNumber: '+91 9876543211',
      cugMobileNumber: '+91 8765432110',
      designationName: 'Field Officer',
      businessDate: '2024-01-20',
      status: 'present',
      attendanceType: 'Regular',
      absentReason: '',
      absentReasonMean: '',
      remarks: 'Late by 10 minutes',
      inSource: 'Mobile App',
      outSource: 'Mobile App',
      inDeviceId: 'DEVICE002',
      outDeviceId: 'DEVICE002',
      inLatitude: 28.7041,
      outLatitude: 28.7042,
      inLongitude: 77.1025,
      outLongitude: 77.1026,
      inTime: '09:10:00',
      outTime: '18:15:00',
      inIp: '192.168.1.101',
      outIp: '192.168.1.101'
    },
    {
      id: '3',
      stateName: 'Delhi',
      zoneName: 'South Zone',
      divisionName: 'South Division',
      branchCode: 'BR003',
      branchName: 'South Branch',
      branchId: 'BID003',
      branchManagerName: 'Anil Kapoor',
      branchManagerId: 'MGR003',
      employeeName: 'Rajesh Singh',
      employeeId: 'EMP003',
      personalMobileNumber: '+91 9876543212',
      cugMobileNumber: '+91 8765432111',
      designationName: 'Field Officer',
      businessDate: '2024-01-20',
      status: 'absent',
      attendanceType: 'Absent',
      absentReason: 'Sick',
      absentReasonMean: 'Medical Leave',
      remarks: 'Medical certificate submitted',
      inSource: '',
      outSource: '',
      inDeviceId: '',
      outDeviceId: '',
      inLatitude: 0,
      outLatitude: 0,
      inLongitude: 0,
      outLongitude: 0,
      inTime: '',
      outTime: '',
      inIp: '',
      outIp: ''
    }
  ]);
  
  const [filteredRecords, setFilteredRecords] = useState<EmployeeAttendanceRecord[]>(records);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleFilter = (filters: FilterOptions) => {
    let filtered = records;

    // Apply filters based on the filter options
    if (filters.state) {
      filtered = filtered.filter(record => record.stateName.toLowerCase().includes(filters.state!.toLowerCase()));
    }
    if (filters.circle) {
      // In a real application, this would filter by circle
      filtered = filtered;
    }
    if (filters.zone) {
      filtered = filtered.filter(record => record.zoneName.toLowerCase().includes(filters.zone!.toLowerCase()));
    }
    if (filters.division) {
      filtered = filtered.filter(record => record.divisionName.toLowerCase().includes(filters.division!.toLowerCase()));
    }
    if (filters.branch) {
      filtered = filtered.filter(record => 
        record.branchName.toLowerCase().includes(filters.branch!.toLowerCase()) ||
        record.branchCode.toLowerCase().includes(filters.branch!.toLowerCase())
      );
    }
    if (filters.dateFrom && filters.dateTo) {
      filtered = filtered.filter(record => 
        record.businessDate >= filters.dateFrom && 
        record.businessDate <= filters.dateTo
      );
    }

    setShowDetails(filters.showDetail);
    setFilteredRecords(filtered);
  };

  const handleDownload = () => {
    // In a real application, this would generate and download a CSV or Excel file
    alert('Download functionality will be implemented');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'leave':
        return <Calendar className="w-4 h-4 text-yellow-600" />;
      case 'holiday':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'leave':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'holiday':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const columns = [
    {
      key: 'stateName',
      label: 'State Name',
      sortable: true,
    },
    {
      key: 'zoneName',
      label: 'Zone Name',
      sortable: true,
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
      key: 'branchId',
      label: 'Branch Id',
      sortable: true,
    },
    {
      key: 'branchManagerName',
      label: 'Branch Manager Name',
      sortable: true,
    },
    {
      key: 'branchManagerId',
      label: 'Branch Manager Id',
      sortable: true,
    },
    {
      key: 'employeeName',
      label: 'Employee Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'employeeId',
      label: 'Employee Id',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'personalMobileNumber',
      label: 'Personal Mobile Number',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Smartphone className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'cugMobileNumber',
      label: 'CUG Mobile Number',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Smartphone className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'designationName',
      label: 'Designation Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'businessDate',
      label: 'Business Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
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
    },
    {
      key: 'attendanceType',
      label: 'Attendance Type',
      sortable: true,
    },
    {
      key: 'absentReason',
      label: 'Absent Reason',
      render: (value: string) => value || '-',
    },
    {
      key: 'absentReasonMean',
      label: 'Absent Reason Mean',
      render: (value: string) => value || '-',
    },
    {
      key: 'remarks',
      label: 'Remarks',
    }
  ];

  // Additional columns for detailed view
  const detailColumns = [
    {
      key: 'inSource',
      label: 'In Source',
      render: (value: string) => value || '-',
    },
    {
      key: 'outSource',
      label: 'Out Source',
      render: (value: string) => value || '-',
    },
    {
      key: 'inDeviceId',
      label: 'In Device Id',
      render: (value: string) => value || '-',
    },
    {
      key: 'outDeviceId',
      label: 'Out Device Id',
      render: (value: string) => value || '-',
    },
    {
      key: 'inLatitude',
      label: 'In Latitude',
      render: (value: number) => value ? value.toFixed(6) : '-',
    },
    {
      key: 'outLatitude',
      label: 'Out Latitude',
      render: (value: number) => value ? value.toFixed(6) : '-',
    },
    {
      key: 'inLongitude',
      label: 'In Longitude',
      render: (value: number) => value ? value.toFixed(6) : '-',
    },
    {
      key: 'outLongitude',
      label: 'Out Longitude',
      render: (value: number) => value ? value.toFixed(6) : '-',
    },
    {
      key: 'inTime',
      label: 'In Time',
      render: (value: string) => value || '-',
    },
    {
      key: 'outTime',
      label: 'Out Time',
      render: (value: string) => value || '-',
    },
    {
      key: 'inIp',
      label: 'In IP',
      render: (value: string) => value || '-',
    },
    {
      key: 'outIp',
      label: 'Out IP',
      render: (value: string) => value || '-',
    }
  ];

  // Combine columns based on detail view setting
  const displayColumns = showDetails ? [...columns, ...detailColumns] : columns;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading employee attendance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Attendance Report</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track and analyze employee attendance records</p>
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

      {/* Summary Section (Toggleable) */}
      {showSummary && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Total Employees</h4>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{filteredRecords.length}</span>
              </div>
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full">
                <div className="h-1 bg-blue-600 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Present</h4>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {filteredRecords.filter(record => record.status === 'present').length}
                </span>
              </div>
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full">
                <div className="h-1 bg-green-600 rounded-full" style={{ 
                  width: `${(filteredRecords.filter(record => record.status === 'present').length / filteredRecords.length) * 100}%` 
                }}></div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Absent</h4>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {filteredRecords.filter(record => record.status === 'absent').length}
                </span>
              </div>
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full">
                <div className="h-1 bg-red-600 rounded-full" style={{ 
                  width: `${(filteredRecords.filter(record => record.status === 'absent').length / filteredRecords.length) * 100}%` 
                }}></div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">On Leave</h4>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {filteredRecords.filter(record => record.status === 'leave').length}
                </span>
              </div>
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full">
                <div className="h-1 bg-yellow-600 rounded-full" style={{ 
                  width: `${(filteredRecords.filter(record => record.status === 'leave').length / filteredRecords.length) * 100}%` 
                }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Employee Attendance Records</h2>
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
              
              <FilterDropdown 
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
                {displayColumns.map((column) => (
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
                  {displayColumns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {column.render ? column.render(record[column.key as keyof EmployeeAttendanceRecord], record) : record[column.key as keyof EmployeeAttendanceRecord]}
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