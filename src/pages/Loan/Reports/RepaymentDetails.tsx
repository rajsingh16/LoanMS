import React, { useState, useEffect } from 'react';
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
  Phone,
  Clock,
  FileText
} from 'lucide-react';
import { Pagination } from '../../../components/Common/Pagination';

interface RepaymentDetailRecord {
  id: string;
  loanId: string;
  loanCode: string;
  branchName: string;
  centerCode: string;
  centerName: string;
  foId: string;
  foName: string;
  clientId: string;
  clientName: string;
  mobileNumber: string;
  husbandNumber: string;
  coApplicantNumber: string;
  productCode: string;
  principalAmount: number;
  interestAmount: number;
  principalOutstanding: number;
  interestOutstanding: number;
  totalOutstanding: number;
  totalInstallments: number;
  installmentsOutstanding: number;
  centerDay: string;
  centerTime: string;
  contactPersonName: string;
  divisionName: string;
  centerGroupCode: string;
  closureDate: string;
  loanCycle: number;
  emiSequence: number;
  ddPrincipalDue: number;
  ddInterestDue: number;
  ddTotalAmountDue: number;
  ddPrincipalCollected: number;
  ddInterestCollected: number;
  ddTotalAmountCollected: number;
  ddPrincipalOutstanding: number;
  ddCenterMeetingId: string;
  collectionDate: string;
  meetingDate: string;
  villageName: string;
  principalArrear: number;
  interestArrear: number;
  totalArrear: number;
  centerLeadName: string;
  loanStatus: string;
  insertedOn: string;
}

interface CenterDemandRecord {
  id: string;
  branchCode: string;
  branchName: string;
  foId: string;
  foName: string;
  centerId: string;
  centerCode: string;
  centerName: string;
  centerGroupCode: string;
  clientId: string;
  loanCode: string;
  clientName: string;
  mobileNumber: string;
  husbandName: string;
  disbursementDate: string;
  principalAmount: number;
  loanCycle: number;
  totalInstallments: number;
  installmentsOutstanding: number;
  principalDue: number;
  interestDue: number;
  penalDue: number;
  totalDue: number;
  principalArrear: number;
  interestArrear: number;
  totalArrear: number;
  parDays: number;
  collectionAmount: number;
  extendedPeriodInterest: number;
}

interface RepaymentDetailFilterOptions {
  state?: string;
  zone?: string;
  division?: string;
  branch?: string;
  center?: string;
  loanCode?: string;
  dueDate: string;
  assignedTo?: string;
}

interface CenterDemandFilterOptions {
  branch: string;
  meetingDate: string;
  assignedTo: string;
  showMature: boolean;
}

const RepaymentDetailFilterDropdown: React.FC<{
  onFilter: (filters: RepaymentDetailFilterOptions) => void;
  onDownload: () => void;
}> = ({ onFilter, onDownload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<RepaymentDetailFilterOptions>({
    dueDate: ''
  });

  const handleFilterChange = (key: keyof RepaymentDetailFilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    if (!filters.dueDate) {
      alert('Due Date is mandatory');
      return;
    }
    
    onFilter(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      dueDate: ''
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={filters.dueDate}
                    onChange={(e) => handleFilterChange('dueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={filters.assignedTo || ''}
                    onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter assigned to"
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

const CenterDemandFilterDropdown: React.FC<{
  onFilter: (filters: CenterDemandFilterOptions) => void;
  onDownload: (format: 'csv' | 'pdf') => void;
}> = ({ onFilter, onDownload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<CenterDemandFilterOptions>({
    branch: '',
    meetingDate: '',
    assignedTo: '',
    showMature: false
  });

  const handleFilterChange = (key: keyof CenterDemandFilterOptions, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    if (!filters.branch || !filters.meetingDate || !filters.assignedTo) {
      alert('Branch, Meeting Date, and Assigned To are mandatory');
      return;
    }
    
    onFilter(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      branch: '',
      meetingDate: '',
      assignedTo: '',
      showMature: false
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
                <Search className="w-5 h-5 text-gray-400" />
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
                    Meeting Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={filters.meetingDate}
                    onChange={(e) => handleFilterChange('meetingDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Assigned To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={filters.assignedTo}
                    onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter assigned to"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showMature"
                    checked={filters.showMature}
                    onChange={(e) => handleFilterChange('showMature', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showMature" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Show Mature
                  </label>
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

      <div className="relative group">
        <button
          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 hidden group-hover:block">
          <div className="py-1">
            <button
              onClick={() => onDownload('csv')}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              CSV
            </button>
            <button
              onClick={() => onDownload('pdf')}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RepaymentDetails: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'repaymentDetail' | 'centerDemand'>('repaymentDetail');
  
  const [repaymentRecords, setRepaymentRecords] = useState<RepaymentDetailRecord[]>([]);
  const [centerDemandRecords, setCenterDemandRecords] = useState<CenterDemandRecord[]>([]);
  
  const [filteredRepaymentRecords, setFilteredRepaymentRecords] = useState<RepaymentDetailRecord[]>([]);
  const [filteredCenterDemandRecords, setFilteredCenterDemandRecords] = useState<CenterDemandRecord[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Pagination state for repayment details
  const [repaymentCurrentPage, setRepaymentCurrentPage] = useState(1);
  const [repaymentPageSize, setRepaymentPageSize] = useState(10);
  const [repaymentTotalItems, setRepaymentTotalItems] = useState(0);
  const [repaymentTotalPages, setRepaymentTotalPages] = useState(0);
  
  // Pagination state for center demand
  const [demandCurrentPage, setDemandCurrentPage] = useState(1);
  const [demandPageSize, setDemandPageSize] = useState(10);
  const [demandTotalItems, setDemandTotalItems] = useState(0);
  const [demandTotalPages, setDemandTotalPages] = useState(0);

  // Generate sample data
  useEffect(() => {
    const generateSampleData = () => {
      // Generate repayment records
      const repaymentData: RepaymentDetailRecord[] = [];
      for (let i = 1; i <= 50; i++) {
        repaymentData.push({
          id: `${i}`,
          loanId: `${i}`,
          loanCode: `LN${String(i).padStart(3, '0')}`,
          branchName: i % 3 === 0 ? 'Main Branch' : i % 3 === 1 ? 'North Branch' : 'South Branch',
          centerCode: `CTR${String(Math.ceil(i/5)).padStart(3, '0')}`,
          centerName: `Center ${Math.ceil(i/5)}`,
          foId: `FO${String(Math.ceil(i/10)).padStart(3, '0')}`,
          foName: `Field Officer ${Math.ceil(i/10)}`,
          clientId: `CL${String(i).padStart(3, '0')}`,
          clientName: `Client ${i}`,
          mobileNumber: `+91 ${9876543210 + i}`,
          husbandNumber: i % 2 === 0 ? `+91 ${8765432100 + i}` : '',
          coApplicantNumber: i % 3 === 0 ? `+91 ${7654321000 + i}` : '',
          productCode: i % 2 === 0 ? 'MF001' : 'GL001',
          principalAmount: 50000 + (i * 1000),
          interestAmount: 5000 + (i * 100),
          principalOutstanding: 45000 + (i * 800),
          interestOutstanding: 4000 + (i * 80),
          totalOutstanding: 49000 + (i * 880),
          totalInstallments: 12,
          installmentsOutstanding: 10,
          centerDay: i % 7 === 0 ? 'Monday' : i % 7 === 1 ? 'Tuesday' : i % 7 === 2 ? 'Wednesday' : i % 7 === 3 ? 'Thursday' : i % 7 === 4 ? 'Friday' : i % 7 === 5 ? 'Saturday' : 'Sunday',
          centerTime: `${10 + (i % 8)}:00`,
          contactPersonName: `Contact Person ${i}`,
          divisionName: i % 3 === 0 ? 'Central Division' : i % 3 === 1 ? 'North Division' : 'South Division',
          centerGroupCode: `CG${String(Math.ceil(i/5)).padStart(3, '0')}`,
          closureDate: '',
          loanCycle: 1 + (i % 3),
          emiSequence: 3,
          ddPrincipalDue: 4167 + (i * 83),
          ddInterestDue: 417 + (i * 8),
          ddTotalAmountDue: 4584 + (i * 91),
          ddPrincipalCollected: 4167 + (i * 83),
          ddInterestCollected: 417 + (i * 8),
          ddTotalAmountCollected: 4584 + (i * 91),
          ddPrincipalOutstanding: 0,
          ddCenterMeetingId: `CM${String(Math.ceil(i/5)).padStart(3, '0')}`,
          collectionDate: new Date(2024, 1, (i % 28) + 1).toISOString().split('T')[0],
          meetingDate: new Date(2024, 1, (i % 28) + 1).toISOString().split('T')[0],
          villageName: `Village ${Math.ceil(i/7)}`,
          principalArrear: 0,
          interestArrear: 0,
          totalArrear: 0,
          centerLeadName: `Center Lead ${Math.ceil(i/5)}`,
          loanStatus: 'active',
          insertedOn: new Date(2024, 0, (i % 28) + 1).toISOString().split('T')[0]
        });
      }
      
      // Generate center demand records
      const centerDemandData: CenterDemandRecord[] = [];
      for (let i = 1; i <= 50; i++) {
        centerDemandData.push({
          id: `${i}`,
          branchCode: i % 3 === 0 ? 'MBR001' : i % 3 === 1 ? 'NBR002' : 'SBR003',
          branchName: i % 3 === 0 ? 'Main Branch' : i % 3 === 1 ? 'North Branch' : 'South Branch',
          foId: `FO${String(Math.ceil(i/10)).padStart(3, '0')}`,
          foName: `Field Officer ${Math.ceil(i/10)}`,
          centerId: `CTR${String(Math.ceil(i/5)).padStart(3, '0')}`,
          centerCode: `CC${String(Math.ceil(i/5)).padStart(3, '0')}`,
          centerName: `Center ${Math.ceil(i/5)}`,
          centerGroupCode: `CG${String(Math.ceil(i/5)).padStart(3, '0')}`,
          clientId: `CL${String(i).padStart(3, '0')}`,
          loanCode: `LN${String(i).padStart(3, '0')}`,
          clientName: `Client ${i}`,
          mobileNumber: `+91 ${9876543210 + i}`,
          husbandName: i % 2 === 0 ? `Husband ${i}` : '',
          disbursementDate: new Date(2024, 0, (i % 28) + 1).toISOString().split('T')[0],
          principalAmount: 50000 + (i * 1000),
          loanCycle: 1 + (i % 3),
          totalInstallments: 12,
          installmentsOutstanding: 10,
          principalDue: 4167 + (i * 83),
          interestDue: 417 + (i * 8),
          penalDue: 0,
          totalDue: 4584 + (i * 91),
          principalArrear: 0,
          interestArrear: 0,
          totalArrear: 0,
          parDays: 0,
          collectionAmount: 4584 + (i * 91),
          extendedPeriodInterest: 0
        });
      }
      
      setRepaymentRecords(repaymentData);
      setFilteredRepaymentRecords(repaymentData);
      setRepaymentTotalItems(repaymentData.length);
      setRepaymentTotalPages(Math.ceil(repaymentData.length / repaymentPageSize));
      
      setCenterDemandRecords(centerDemandData);
      setFilteredCenterDemandRecords(centerDemandData);
      setDemandTotalItems(centerDemandData.length);
      setDemandTotalPages(Math.ceil(centerDemandData.length / demandPageSize));
      
      setLoading(false);
    };
    
    generateSampleData();
  }, []);

  const handleRepaymentFilter = (filters: RepaymentDetailFilterOptions) => {
    let filtered = repaymentRecords;

    // Apply filters based on the filter options
    if (filters.state) {
      // In a real application, this would filter by state
      filtered = filtered;
    }
    if (filters.zone) {
      // In a real application, this would filter by zone
      filtered = filtered;
    }
    if (filters.division) {
      filtered = filtered.filter(record => record.divisionName.toLowerCase().includes(filters.division!.toLowerCase()));
    }
    if (filters.branch) {
      filtered = filtered.filter(record => record.branchName.toLowerCase().includes(filters.branch!.toLowerCase()));
    }
    if (filters.center) {
      filtered = filtered.filter(record => record.centerName.toLowerCase().includes(filters.center!.toLowerCase()));
    }
    if (filters.loanCode) {
      filtered = filtered.filter(record => record.loanCode.toLowerCase().includes(filters.loanCode!.toLowerCase()));
    }
    if (filters.dueDate) {
      // In a real application, this would filter by due date
      filtered = filtered;
    }
    if (filters.assignedTo) {
      filtered = filtered.filter(record => record.foName.toLowerCase().includes(filters.assignedTo!.toLowerCase()));
    }

    setFilteredRepaymentRecords(filtered);
    setRepaymentTotalItems(filtered.length);
    setRepaymentTotalPages(Math.ceil(filtered.length / repaymentPageSize));
    setRepaymentCurrentPage(1); // Reset to first page
  };

  const handleCenterDemandFilter = (filters: CenterDemandFilterOptions) => {
    let filtered = centerDemandRecords;

    // Apply filters based on the filter options
    if (filters.branch) {
      filtered = filtered.filter(record => record.branchName.toLowerCase().includes(filters.branch.toLowerCase()));
    }
    if (filters.meetingDate) {
      // In a real application, this would filter by meeting date
      filtered = filtered;
    }
    if (filters.assignedTo) {
      filtered = filtered.filter(record => record.foName.toLowerCase().includes(filters.assignedTo.toLowerCase()));
    }
    // In a real application, showMature would filter mature loans

    setFilteredCenterDemandRecords(filtered);
    setDemandTotalItems(filtered.length);
    setDemandTotalPages(Math.ceil(filtered.length / demandPageSize));
    setDemandCurrentPage(1); // Reset to first page
  };

  const handleRepaymentDownload = () => {
    // In a real application, this would generate and download a CSV or Excel file
    alert('Download functionality will be implemented');
  };

  const handleCenterDemandDownload = (format: 'csv' | 'pdf') => {
    // In a real application, this would generate and download a file in the specified format
    alert(`Download ${format.toUpperCase()} functionality will be implemented`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'written-off':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'closed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'written-off':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  const repaymentColumns = [
    {
      key: 'loanId',
      label: 'Loan Id',
      sortable: true,
    },
    {
      key: 'loanCode',
      label: 'Loan Code',
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
      key: 'foId',
      label: 'FO Id',
      sortable: true,
    },
    {
      key: 'foName',
      label: 'FO Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <User className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'clientId',
      label: 'Client Id',
      sortable: true,
    },
    {
      key: 'clientName',
      label: 'Client Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'mobileNumber',
      label: 'Mobile Number',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'husbandNumber',
      label: 'Husband Number',
      render: (value: string) => value || '-'
    },
    {
      key: 'coApplicantNumber',
      label: 'Co-Applicant Number',
      render: (value: string) => value || '-'
    },
    {
      key: 'productCode',
      label: 'Product Code',
      sortable: true,
    },
    {
      key: 'principalAmount',
      label: 'Principal Amount',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'interestAmount',
      label: 'Interest Amount',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'principalOutstanding',
      label: 'Principal Outstanding',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'interestOutstanding',
      label: 'Interest Outstanding',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'totalOutstanding',
      label: 'Total Outstanding',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'totalInstallments',
      label: 'Total Installments',
      sortable: true,
    },
    {
      key: 'installmentsOutstanding',
      label: 'Installments Outstanding',
      sortable: true,
    },
    {
      key: 'centerDay',
      label: 'Center Day',
      sortable: true,
    },
    {
      key: 'centerTime',
      label: 'Center Time',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'contactPersonName',
      label: 'Contact Person Name',
      sortable: true,
    },
    {
      key: 'divisionName',
      label: 'Division Name',
      sortable: true,
    },
    {
      key: 'centerGroupCode',
      label: 'Center Group Code',
      sortable: true,
    },
    {
      key: 'closureDate',
      label: 'Closure Date',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'loanCycle',
      label: 'Loan Cycle',
      sortable: true,
      render: (value: number) => (
        <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
          Cycle {value}
        </span>
      )
    },
    {
      key: 'emiSequence',
      label: 'EMI Sequence',
      sortable: true,
    },
    {
      key: 'ddPrincipalDue',
      label: 'DD Principal Due',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'ddInterestDue',
      label: 'DD Interest Due',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'ddTotalAmountDue',
      label: 'DD Total Amount Due',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'ddPrincipalCollected',
      label: 'DD Principal Collected',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'ddInterestCollected',
      label: 'DD Interest Collected',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'ddTotalAmountCollected',
      label: 'DD Total Amount Collected',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'ddPrincipalOutstanding',
      label: 'DD Principal Outstanding',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'ddCenterMeetingId',
      label: 'DD Center Meeting Id',
      sortable: true,
    },
    {
      key: 'collectionDate',
      label: 'Collection Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'meetingDate',
      label: 'Meeting Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'villageName',
      label: 'Village Name',
      sortable: true,
    },
    {
      key: 'principalArrear',
      label: 'Principal Arrear',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'interestArrear',
      label: 'Interest Arrear',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'totalArrear',
      label: 'Total Arrear',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'centerLeadName',
      label: 'Center Lead Name',
      sortable: true,
    },
    {
      key: 'loanStatus',
      label: 'Loan Status',
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
      key: 'insertedOn',
      label: 'Inserted On',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const centerDemandColumns = [
    {
      key: 'branchCode',
      label: 'Branch Code',
      sortable: true,
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
      key: 'foId',
      label: 'FO Id',
      sortable: true,
    },
    {
      key: 'foName',
      label: 'FO Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <User className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'centerId',
      label: 'Center Id',
      sortable: true,
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
      key: 'centerGroupCode',
      label: 'Center Group Code',
      sortable: true,
    },
    {
      key: 'clientId',
      label: 'Client Id',
      sortable: true,
    },
    {
      key: 'loanCode',
      label: 'Loan Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'clientName',
      label: 'Client Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'mobileNumber',
      label: 'Mobile Number',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'husbandName',
      label: 'Husband Name',
      sortable: true,
      render: (value: string) => value || '-'
    },
    {
      key: 'disbursementDate',
      label: 'Disbursement Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'principalAmount',
      label: 'Principal Amount',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'loanCycle',
      label: 'Loan Cycle',
      sortable: true,
      render: (value: number) => (
        <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
          Cycle {value}
        </span>
      )
    },
    {
      key: 'totalInstallments',
      label: 'Total Installments',
      sortable: true,
    },
    {
      key: 'installmentsOutstanding',
      label: 'Installments Outstanding',
      sortable: true,
    },
    {
      key: 'principalDue',
      label: 'Principal Due',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'interestDue',
      label: 'Interest Due',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'penalDue',
      label: 'Penal Due',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'totalDue',
      label: 'Total Due',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'principalArrear',
      label: 'Principal Arrear',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'interestArrear',
      label: 'Interest Arrear',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'totalArrear',
      label: 'Total Arrear',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'parDays',
      label: 'PAR Days',
      sortable: true,
    },
    {
      key: 'collectionAmount',
      label: 'Collection Amount',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'extendedPeriodInterest',
      label: 'Extended Period Interest',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    }
  ];

  // Get paginated data for repayment details
  const getPaginatedRepaymentData = () => {
    const startIndex = (repaymentCurrentPage - 1) * repaymentPageSize;
    const endIndex = startIndex + repaymentPageSize;
    return filteredRepaymentRecords.slice(startIndex, endIndex);
  };

  // Get paginated data for center demand
  const getPaginatedDemandData = () => {
    const startIndex = (demandCurrentPage - 1) * demandPageSize;
    const endIndex = startIndex + demandPageSize;
    return filteredCenterDemandRecords.slice(startIndex, endIndex);
  };

  const handleRepaymentPageChange = (page: number) => {
    setRepaymentCurrentPage(page);
  };

  const handleRepaymentPageSizeChange = (size: number) => {
    setRepaymentPageSize(size);
    setRepaymentTotalPages(Math.ceil(filteredRepaymentRecords.length / size));
    setRepaymentCurrentPage(1); // Reset to first page
  };

  const handleDemandPageChange = (page: number) => {
    setDemandCurrentPage(page);
  };

  const handleDemandPageSizeChange = (size: number) => {
    setDemandPageSize(size);
    setDemandTotalPages(Math.ceil(filteredCenterDemandRecords.length / size));
    setDemandCurrentPage(1); // Reset to first page
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading repayment data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Repayment Details</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage loan repayment information</p>
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

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('repaymentDetail')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'repaymentDetail'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Repayment Detail Report
            </button>
            <button
              onClick={() => setActiveTab('centerDemand')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'centerDemand'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Center Demand Report
            </button>
          </div>
        </div>

        {/* Repayment Detail Tab Content */}
        {activeTab === 'repaymentDetail' && (
          <>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Repayment Detail Report</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {filteredRepaymentRecords.length} records found
                  </p>
                </div>
                
                <RepaymentDetailFilterDropdown 
                  onFilter={handleRepaymentFilter}
                  onDownload={handleRepaymentDownload}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {repaymentColumns.map((column) => (
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
                  {getPaginatedRepaymentData().map((record, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      {repaymentColumns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {column.render ? column.render(record[column.key as keyof RepaymentDetailRecord], record) : record[column.key as keyof RepaymentDetailRecord]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={repaymentCurrentPage}
              totalPages={repaymentTotalPages}
              pageSize={repaymentPageSize}
              totalItems={repaymentTotalItems}
              onPageChange={handleRepaymentPageChange}
              onPageSizeChange={handleRepaymentPageSizeChange}
            />
          </>
        )}

        {/* Center Demand Tab Content */}
        {activeTab === 'centerDemand' && (
          <>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Center Demand Report</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {filteredCenterDemandRecords.length} records found
                  </p>
                </div>
                
                <CenterDemandFilterDropdown 
                  onFilter={handleCenterDemandFilter}
                  onDownload={handleCenterDemandDownload}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {centerDemandColumns.map((column) => (
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
                  {getPaginatedDemandData().map((record, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      {centerDemandColumns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {column.render ? column.render(record[column.key as keyof CenterDemandRecord], record) : record[column.key as keyof CenterDemandRecord]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={demandCurrentPage}
              totalPages={demandTotalPages}
              pageSize={demandPageSize}
              totalItems={demandTotalItems}
              onPageChange={handleDemandPageChange}
              onPageSizeChange={handleDemandPageSizeChange}
            />
          </>
        )}
      </div>
    </div>
  );
};