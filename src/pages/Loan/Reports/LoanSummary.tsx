import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Calendar, 
  Building, 
  User, 
  CreditCard, 
  Filter, 
  ChevronDown,
  MapPin,
  DollarSign,
  Percent,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Pagination } from '../../../components/Common/Pagination';

interface LoanSummaryRecord {
  loanCode: string;
  clientCode: string;
  productId: string;
  productCode: string;
  principalAmount: number;
  principalOutstanding: number;
  interestAmount: number;
  interestOutstanding: number;
  interestRate: number;
  processingFee: number;
  tenureInMonths: number;
  totalInstallments: number;
  installmentsOutstanding: number;
  insuranceId: string;
  insuranceCode: string;
  disbursementDate: string;
  centerId: string;
  centerCode: string;
  centerName: string;
  foId: string;
  foName: string;
  branchId: string;
  branchCode: string;
  branchName: string;
  divisionId: string;
  divisionCode: string;
  divisionName: string;
  centerGroupCode: string;
  purpose: string;
  subPurpose: string;
  repaymentFrequency: string;
  fundSequenceNumber: string;
  allocationDate: string;
  loanCreatedOn: string;
  loanClosureDate: string;
  neftDate: string;
  paymentDoneFrom: string;
  maturityDate: string;
  insuranceFee: number;
  firstName: string;
  lastName: string;
  reservationCategory: string;
  gender: string;
  caste: string;
  dob: string;
  age: number;
  maritalStatus: string;
  totalIncome: number;
  totalExpense: number;
  religion: string;
  sourceOfIncome: string;
  annualIncome: number;
  loanCycle: number;
  aadhaarNumber: string;
  loanStatus: string;
  productName: string;
  voterCardNumber: string;
  rationCardNumber: string;
  extLoanId: string;
  extLanNo: string;
  extCustId: string;
  bcPartnerId: string;
  centerDay: string;
  mobileNumber: string;
  isDeathTagged: boolean;
  stateName: string;
  zoneId: string;
  zoneCode: string;
  zoneName: string;
  villageId: string;
  villageCode: string;
  villageName: string;
  kycId: string;
  kycType: string;
  netPayableAmount: number;
  altContactNumber: string;
  parDays: number;
  principalArrears: number;
  interestArrears: number;
  totalArrears: number;
  lastDueDate: string;
  principalCollected: number;
  interestCollected: number;
  lastCollDate: string;
  parDaysAnswer: number;
  lastCollAmount: number;
  parInstallmentDue: number;
  par30: boolean;
  par90: boolean;
  parAbove90: boolean;
  parStatus: string;
  nomineeName: string;
  coApplicantName: string;
  qctAgent: string;
  qctAgentName: string;
  acmCode: string;
  acmName: string;
  dcmCode: string;
  dcmName: string;
  zmCode: string;
  zmName: string;
  neftTransactionNumber: string;
  disbursedBy: string;
  modeOfDisbursement: string;
  lastCollectionMode: string;
  lastCollectionTransactionId: string;
}

interface LoanSummaryFilterOptions {
  state?: string;
  zone?: string;
  division?: string;
  branch?: string;
  center?: string;
  foId?: string;
  loanCode?: string;
  clientCode?: string;
  loanStatus?: string;
  bcPartnerId?: string;
  loanClosureDateFrom: string;
  loanClosureDateTo: string;
  disbursementDateFrom: string;
  disbursementDateTo: string;
  neftDateFrom?: string;
  neftDateTo?: string;
  aadhaarNumber?: string;
  voterNumber?: string;
}

const LoanSummaryFilterDropdown: React.FC<{
  onFilter: (filters: LoanSummaryFilterOptions) => void;
  onDownload: () => void;
}> = ({ onFilter, onDownload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<LoanSummaryFilterOptions>({
    loanClosureDateFrom: '',
    loanClosureDateTo: '',
    disbursementDateFrom: '',
    disbursementDateTo: ''
  });

  const handleFilterChange = (key: keyof LoanSummaryFilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    if (!filters.loanClosureDateFrom || !filters.loanClosureDateTo || !filters.disbursementDateFrom || !filters.disbursementDateTo) {
      alert('Loan Closure Date range and Disbursement Date range are mandatory');
      return;
    }
    
    onFilter(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      loanClosureDateFrom: '',
      loanClosureDateTo: '',
      disbursementDateFrom: '',
      disbursementDateTo: ''
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
          <div className="absolute right-0 mt-2 w-[800px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Search className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Filters</h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">FO ID</label>
                  <input
                    type="text"
                    value={filters.foId || ''}
                    onChange={(e) => handleFilterChange('foId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter FO ID"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Code</label>
                  <input
                    type="text"
                    value={filters.clientCode || ''}
                    onChange={(e) => handleFilterChange('clientCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter client code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Status</label>
                  <select
                    value={filters.loanStatus || ''}
                    onChange={(e) => handleFilterChange('loanStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="written-off">Written Off</option>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Loan Closure Date From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={filters.loanClosureDateFrom}
                    onChange={(e) => handleFilterChange('loanClosureDateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Loan Closure Date To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={filters.loanClosureDateTo}
                    onChange={(e) => handleFilterChange('loanClosureDateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Disbursement Date From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={filters.disbursementDateFrom}
                    onChange={(e) => handleFilterChange('disbursementDateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Disbursement Date To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={filters.disbursementDateTo}
                    onChange={(e) => handleFilterChange('disbursementDateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NEFT Date From</label>
                  <input
                    type="date"
                    value={filters.neftDateFrom || ''}
                    onChange={(e) => handleFilterChange('neftDateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NEFT Date To</label>
                  <input
                    type="date"
                    value={filters.neftDateTo || ''}
                    onChange={(e) => handleFilterChange('neftDateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aadhaar Number</label>
                  <input
                    type="text"
                    value={filters.aadhaarNumber || ''}
                    onChange={(e) => handleFilterChange('aadhaarNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter Aadhaar number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voter Number</label>
                  <input
                    type="text"
                    value={filters.voterNumber || ''}
                    onChange={(e) => handleFilterChange('voterNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter voter number"
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

export const LoanSummary: React.FC = () => {
  const [records, setRecords] = useState<LoanSummaryRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<LoanSummaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Sample data generation for demonstration
  useEffect(() => {
    const generateSampleData = () => {
      const sampleData: LoanSummaryRecord[] = [];
      
      for (let i = 1; i <= 100; i++) {
        sampleData.push({
          loanCode: `LN${String(i).padStart(3, '0')}`,
          clientCode: `CL${String(i).padStart(3, '0')}`,
          productId: `P${String(Math.ceil(i/20)).padStart(3, '0')}`,
          productCode: i % 2 === 0 ? 'MF001' : 'GL001',
          principalAmount: 50000 + (i * 1000),
          principalOutstanding: 45000 + (i * 800),
          interestAmount: 5000 + (i * 100),
          interestOutstanding: 4000 + (i * 80),
          interestRate: 12.5,
          processingFee: 1000,
          tenureInMonths: 12,
          totalInstallments: 12,
          installmentsOutstanding: 10,
          insuranceId: `INS${String(Math.ceil(i/20)).padStart(3, '0')}`,
          insuranceCode: 'LIFE001',
          disbursementDate: new Date(2024, 0, i % 28 + 1).toISOString().split('T')[0],
          centerId: `CTR${String(Math.ceil(i/10)).padStart(3, '0')}`,
          centerCode: `ANC${String(Math.ceil(i/10)).padStart(3, '0')}`,
          centerName: `Center ${Math.ceil(i/10)}`,
          foId: `FO${String(Math.ceil(i/20)).padStart(3, '0')}`,
          foName: `Field Officer ${Math.ceil(i/20)}`,
          branchId: `BR${String(Math.ceil(i/30)).padStart(3, '0')}`,
          branchCode: `MBR${String(Math.ceil(i/30)).padStart(3, '0')}`,
          branchName: `Branch ${Math.ceil(i/30)}`,
          divisionId: `DIV${String(Math.ceil(i/50)).padStart(3, '0')}`,
          divisionCode: `CDIV${String(Math.ceil(i/50)).padStart(3, '0')}`,
          divisionName: `Division ${Math.ceil(i/50)}`,
          centerGroupCode: `CG${String(Math.ceil(i/10)).padStart(3, '0')}`,
          purpose: i % 3 === 0 ? 'Business' : i % 3 === 1 ? 'Agriculture' : 'Education',
          subPurpose: i % 3 === 0 ? 'Small Business' : i % 3 === 1 ? 'Crop Loan' : 'Higher Education',
          repaymentFrequency: 'Monthly',
          fundSequenceNumber: `FSN${String(i).padStart(3, '0')}`,
          allocationDate: new Date(2024, 0, (i % 28) + 1).toISOString().split('T')[0],
          loanCreatedOn: new Date(2024, 0, (i % 28) + 1).toISOString().split('T')[0],
          loanClosureDate: '',
          neftDate: new Date(2024, 0, (i % 28) + 2).toISOString().split('T')[0],
          paymentDoneFrom: 'Branch',
          maturityDate: new Date(2025, 0, (i % 28) + 1).toISOString().split('T')[0],
          insuranceFee: 500,
          firstName: `First${i}`,
          lastName: `Last${i}`,
          reservationCategory: i % 4 === 0 ? 'General' : i % 4 === 1 ? 'OBC' : i % 4 === 2 ? 'SC' : 'ST',
          gender: i % 2 === 0 ? 'Male' : 'Female',
          caste: i % 4 === 0 ? 'General' : i % 4 === 1 ? 'OBC' : i % 4 === 2 ? 'SC' : 'ST',
          dob: new Date(1980 + (i % 20), (i % 12), (i % 28) + 1).toISOString().split('T')[0],
          age: 30 + (i % 20),
          maritalStatus: i % 3 === 0 ? 'Single' : i % 3 === 1 ? 'Married' : 'Widowed',
          totalIncome: 20000 + (i * 500),
          totalExpense: 15000 + (i * 300),
          religion: i % 4 === 0 ? 'Hindu' : i % 4 === 1 ? 'Muslim' : i % 4 === 2 ? 'Christian' : 'Sikh',
          sourceOfIncome: i % 3 === 0 ? 'Business' : i % 3 === 1 ? 'Agriculture' : 'Salary',
          annualIncome: (20000 + (i * 500)) * 12,
          loanCycle: 1 + (i % 3),
          aadhaarNumber: `${1234 + i}-${5678 + i}-${9012 + i}`,
          loanStatus: i % 10 === 0 ? 'closed' : i % 20 === 0 ? 'written-off' : 'active',
          productName: i % 2 === 0 ? 'Micro Finance Loan' : 'Group Loan',
          voterCardNumber: `VOTER${String(i).padStart(6, '0')}`,
          rationCardNumber: `RATION${String(i).padStart(6, '0')}`,
          extLoanId: `EXT${String(i).padStart(3, '0')}`,
          extLanNo: `LAN${String(i).padStart(3, '0')}`,
          extCustId: `CUST${String(i).padStart(3, '0')}`,
          bcPartnerId: `BCP${String(Math.ceil(i/20)).padStart(3, '0')}`,
          centerDay: i % 7 === 0 ? 'Monday' : i % 7 === 1 ? 'Tuesday' : i % 7 === 2 ? 'Wednesday' : i % 7 === 3 ? 'Thursday' : i % 7 === 4 ? 'Friday' : i % 7 === 5 ? 'Saturday' : 'Sunday',
          mobileNumber: `+91 ${9876543210 + i}`,
          isDeathTagged: i % 50 === 0,
          stateName: i % 5 === 0 ? 'Delhi' : i % 5 === 1 ? 'Maharashtra' : i % 5 === 2 ? 'Karnataka' : i % 5 === 3 ? 'Tamil Nadu' : 'Gujarat',
          zoneId: `ZN${String(Math.ceil(i/40)).padStart(3, '0')}`,
          zoneCode: `NZ${String(Math.ceil(i/40)).padStart(3, '0')}`,
          zoneName: `Zone ${Math.ceil(i/40)}`,
          villageId: `VIL${String(Math.ceil(i/15)).padStart(3, '0')}`,
          villageCode: `VC${String(Math.ceil(i/15)).padStart(3, '0')}`,
          villageName: `Village ${Math.ceil(i/15)}`,
          kycId: i % 2 === 0 ? `${1234 + i}-${5678 + i}-${9012 + i}` : `VOTER${String(i).padStart(6, '0')}`,
          kycType: i % 2 === 0 ? 'Aadhaar' : 'Voter ID',
          netPayableAmount: 49500 + (i * 950),
          altContactNumber: `+91 ${8765432100 + i}`,
          parDays: i % 40 === 0 ? 30 : i % 60 === 0 ? 90 : 0,
          principalArrears: i % 40 === 0 ? 5000 : i % 60 === 0 ? 10000 : 0,
          interestArrears: i % 40 === 0 ? 500 : i % 60 === 0 ? 1000 : 0,
          totalArrears: i % 40 === 0 ? 5500 : i % 60 === 0 ? 11000 : 0,
          lastDueDate: new Date(2024, 1, (i % 28) + 1).toISOString().split('T')[0],
          principalCollected: 5000 + (i * 100),
          interestCollected: 1000 + (i * 20),
          lastCollDate: new Date(2024, 1, (i % 28) + 1).toISOString().split('T')[0],
          parDaysAnswer: i % 40 === 0 ? 30 : i % 60 === 0 ? 90 : 0,
          lastCollAmount: 6000 + (i * 120),
          parInstallmentDue: i % 40 === 0 ? 1 : i % 60 === 0 ? 3 : 0,
          par30: i % 40 === 0,
          par90: i % 60 === 0,
          parAbove90: i % 100 === 0,
          parStatus: i % 40 === 0 ? 'PAR 30' : i % 60 === 0 ? 'PAR 90' : i % 100 === 0 ? 'PAR 90+' : 'Regular',
          nomineeName: `Nominee ${i}`,
          coApplicantName: i % 3 === 0 ? `CoApplicant ${i}` : '',
          qctAgent: `QCT${String(Math.ceil(i/25)).padStart(3, '0')}`,
          qctAgentName: `QCT Agent ${Math.ceil(i/25)}`,
          acmCode: `ACM${String(Math.ceil(i/30)).padStart(3, '0')}`,
          acmName: `ACM ${Math.ceil(i/30)}`,
          dcmCode: `DCM${String(Math.ceil(i/50)).padStart(3, '0')}`,
          dcmName: `DCM ${Math.ceil(i/50)}`,
          zmCode: `ZM${String(Math.ceil(i/70)).padStart(3, '0')}`,
          zmName: `ZM ${Math.ceil(i/70)}`,
          neftTransactionNumber: `NEFT${String(i).padStart(6, '0')}`,
          disbursedBy: 'Manager User',
          modeOfDisbursement: i % 2 === 0 ? 'NEFT' : 'Cash',
          lastCollectionMode: i % 3 === 0 ? 'Cash' : i % 3 === 1 ? 'UPI' : 'Bank Transfer',
          lastCollectionTransactionId: `COLL${String(i).padStart(6, '0')}`
        });
      }
      
      setRecords(sampleData);
      setFilteredRecords(sampleData);
      setTotalItems(sampleData.length);
      setTotalPages(Math.ceil(sampleData.length / pageSize));
      setLoading(false);
    };
    
    generateSampleData();
  }, []);

  const handleFilter = (filters: LoanSummaryFilterOptions) => {
    let filtered = records;

    // Apply filters based on the filter options
    if (filters.state) {
      filtered = filtered.filter(record => record.stateName.toLowerCase().includes(filters.state!.toLowerCase()));
    }
    if (filters.zone) {
      filtered = filtered.filter(record => record.zoneName.toLowerCase().includes(filters.zone!.toLowerCase()));
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
    if (filters.foId) {
      filtered = filtered.filter(record => record.foId.toLowerCase().includes(filters.foId!.toLowerCase()));
    }
    if (filters.loanCode) {
      filtered = filtered.filter(record => record.loanCode.toLowerCase().includes(filters.loanCode!.toLowerCase()));
    }
    if (filters.clientCode) {
      filtered = filtered.filter(record => record.clientCode.toLowerCase().includes(filters.clientCode!.toLowerCase()));
    }
    if (filters.loanStatus) {
      filtered = filtered.filter(record => record.loanStatus === filters.loanStatus);
    }
    if (filters.bcPartnerId) {
      filtered = filtered.filter(record => record.bcPartnerId.toLowerCase().includes(filters.bcPartnerId!.toLowerCase()));
    }
    if (filters.loanClosureDateFrom && filters.loanClosureDateTo) {
      filtered = filtered.filter(record => 
        record.loanClosureDate && 
        record.loanClosureDate >= filters.loanClosureDateFrom && 
        record.loanClosureDate <= filters.loanClosureDateTo
      );
    }
    if (filters.disbursementDateFrom && filters.disbursementDateTo) {
      filtered = filtered.filter(record => 
        record.disbursementDate >= filters.disbursementDateFrom && 
        record.disbursementDate <= filters.disbursementDateTo
      );
    }
    if (filters.neftDateFrom && filters.neftDateTo) {
      filtered = filtered.filter(record => 
        record.neftDate >= filters.neftDateFrom && 
        record.neftDate <= filters.neftDateTo
      );
    }
    if (filters.aadhaarNumber) {
      filtered = filtered.filter(record => record.aadhaarNumber.includes(filters.aadhaarNumber!));
    }
    if (filters.voterNumber) {
      filtered = filtered.filter(record => record.voterCardNumber.includes(filters.voterNumber!));
    }

    setFilteredRecords(filtered);
    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDownload = () => {
    // In a real application, this would generate and download a CSV or Excel file
    alert('Download functionality will be implemented');
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

  const columns = [
    {
      key: 'loanCode',
      label: 'Loan Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
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
      key: 'productId',
      label: 'Product Id',
      sortable: true,
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
      key: 'principalOutstanding',
      label: 'Principal Outstanding',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'interestAmount',
      label: 'Interest Amount',
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
      key: 'interestRate',
      label: 'Interest Rate',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <Percent className="w-4 h-4 text-gray-400" />
          <span>{value}%</span>
        </div>
      )
    },
    {
      key: 'processingFee',
      label: 'Processing Fee',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'tenureInMonths',
      label: 'Tenure In Months',
      sortable: true,
      render: (value: number) => `${value} months`
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
      key: 'insuranceId',
      label: 'Insurance Id',
      sortable: true,
    },
    {
      key: 'insuranceCode',
      label: 'Insurance Code',
      sortable: true,
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
      key: 'foId',
      label: 'FO Id',
      sortable: true,
    },
    {
      key: 'foName',
      label: 'FO Name',
      sortable: true,
    },
    {
      key: 'branchId',
      label: 'Branch Id',
      sortable: true,
    },
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
      key: 'divisionId',
      label: 'Division Id',
      sortable: true,
    },
    {
      key: 'divisionCode',
      label: 'Division Code',
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
      key: 'purpose',
      label: 'Purpose',
      sortable: true,
    },
    {
      key: 'subPurpose',
      label: 'Sub Purpose',
      sortable: true,
    },
    {
      key: 'repaymentFrequency',
      label: 'Repayment Frequency',
      sortable: true,
    },
    {
      key: 'fundSequenceNumber',
      label: 'Fund Sequence Number',
      sortable: true,
    },
    {
      key: 'allocationDate',
      label: 'Allocation Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'loanCreatedOn',
      label: 'Loan Created On',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'loanClosureDate',
      label: 'Loan Closure Date',
      sortable: true,
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'neftDate',
      label: 'NEFT Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'paymentDoneFrom',
      label: 'Payment Done From',
      sortable: true,
    },
    {
      key: 'maturityDate',
      label: 'Maturity Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'insuranceFee',
      label: 'Insurance Fee',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'firstName',
      label: 'First Name',
      sortable: true,
    },
    {
      key: 'lastName',
      label: 'Last Name',
      sortable: true,
    },
    {
      key: 'reservationCategory',
      label: 'Reservation Category',
      sortable: true,
    },
    {
      key: 'gender',
      label: 'Gender',
      sortable: true,
    },
    {
      key: 'caste',
      label: 'Caste',
      sortable: true,
    },
    {
      key: 'dob',
      label: 'DOB',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'age',
      label: 'Age',
      sortable: true,
    },
    {
      key: 'maritalStatus',
      label: 'Marital Status',
      sortable: true,
    },
    {
      key: 'totalIncome',
      label: 'Total Income',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'totalExpense',
      label: 'Total Expense',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'religion',
      label: 'Religion',
      sortable: true,
    },
    {
      key: 'sourceOfIncome',
      label: 'Source Of Income',
      sortable: true,
    },
    {
      key: 'annualIncome',
      label: 'Annual Income',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
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
      key: 'aadhaarNumber',
      label: 'Aadhar Number',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
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
      key: 'productName',
      label: 'Product Name',
      sortable: true,
    },
    {
      key: 'voterCardNumber',
      label: 'Voter Card Number',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'rationCardNumber',
      label: 'Ration Card Number',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'extLoanId',
      label: 'Ext Loan Id',
      sortable: true,
    },
    {
      key: 'extLanNo',
      label: 'Ext Lan No',
      sortable: true,
    },
    {
      key: 'extCustId',
      label: 'Ext Cust Id',
      sortable: true,
    },
    {
      key: 'bcPartnerId',
      label: 'BC Partner Id',
      sortable: true,
    },
    {
      key: 'centerDay',
      label: 'Center Day',
      sortable: true,
    },
    {
      key: 'mobileNumber',
      label: 'Mobile Number',
      sortable: true,
    },
    {
      key: 'isDeathTagged',
      label: 'Is Death Tagged',
      render: (value: boolean) => value ? (
        <CheckCircle className="w-4 h-4 text-red-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      ),
    },
    {
      key: 'stateName',
      label: 'State Name',
      sortable: true,
    },
    {
      key: 'zoneId',
      label: 'Zone Id',
      sortable: true,
    },
    {
      key: 'zoneCode',
      label: 'Zone Code',
      sortable: true,
    },
    {
      key: 'zoneName',
      label: 'Zone Name',
      sortable: true,
    },
    {
      key: 'villageId',
      label: 'Village Id',
      sortable: true,
    },
    {
      key: 'villageCode',
      label: 'Village Code',
      sortable: true,
    },
    {
      key: 'villageName',
      label: 'Village Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'kycId',
      label: 'KYC Id',
      sortable: true,
    },
    {
      key: 'kycType',
      label: 'KYC Type',
      sortable: true,
    },
    {
      key: 'netPayableAmount',
      label: 'Net Payable Amount',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'altContactNumber',
      label: 'Alt Contact Number',
      sortable: true,
    },
    {
      key: 'parDays',
      label: 'PAR Days',
      sortable: true,
    },
    {
      key: 'principalArrears',
      label: 'Principal Arrears',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'interestArrears',
      label: 'Interest Arrears',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'totalArrears',
      label: 'Total Arrears',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'lastDueDate',
      label: 'Last Due Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'principalCollected',
      label: 'Principal Collected',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'interestCollected',
      label: 'Interest Collected',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'lastCollDate',
      label: 'Last Coll Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'parDaysAnswer',
      label: 'PAR Days Answer',
      sortable: true,
    },
    {
      key: 'lastCollAmount',
      label: 'Last Coll Amount',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    {
      key: 'parInstallmentDue',
      label: 'PAR Installment Due',
      sortable: true,
    },
    {
      key: 'par30',
      label: 'PAR 30',
      render: (value: boolean) => value ? (
        <CheckCircle className="w-4 h-4 text-red-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      ),
    },
    {
      key: 'par90',
      label: 'PAR 90',
      render: (value: boolean) => value ? (
        <CheckCircle className="w-4 h-4 text-red-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      ),
    },
    {
      key: 'parAbove90',
      label: 'PAR Above 90',
      render: (value: boolean) => value ? (
        <CheckCircle className="w-4 h-4 text-red-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      ),
    },
    {
      key: 'parStatus',
      label: 'PAR Status',
      sortable: true,
    },
    {
      key: 'nomineeName',
      label: 'Nominee Name',
      sortable: true,
    },
    {
      key: 'coApplicantName',
      label: 'Co-Applicant Name',
      sortable: true,
    },
    {
      key: 'qctAgent',
      label: 'QCT Agent',
      sortable: true,
    },
    {
      key: 'qctAgentName',
      label: 'QCT Agent Name',
      sortable: true,
    },
    {
      key: 'acmCode',
      label: 'ACM Code',
      sortable: true,
    },
    {
      key: 'acmName',
      label: 'ACM Name',
      sortable: true,
    },
    {
      key: 'dcmCode',
      label: 'DCM Code',
      sortable: true,
    },
    {
      key: 'dcmName',
      label: 'DCM Name',
      sortable: true,
    },
    {
      key: 'zmCode',
      label: 'ZM Code',
      sortable: true,
    },
    {
      key: 'zmName',
      label: 'ZM Name',
      sortable: true,
    },
    {
      key: 'neftTransactionNumber',
      label: 'Neft Transaction Number',
      sortable: true,
    },
    {
      key: 'disbursedBy',
      label: 'Disbursed by',
      sortable: true,
    },
    {
      key: 'modeOfDisbursement',
      label: 'Mode of Disbursement',
      sortable: true,
    },
    {
      key: 'lastCollectionMode',
      label: 'Last Collection Mode',
      sortable: true,
    },
    {
      key: 'lastCollectionTransactionId',
      label: 'Last Collection Transaction ID',
      sortable: true,
    }
  ];

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
    setCurrentPage(1); // Reset to first page when changing page size
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading loan summary data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loan Summary Report</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View comprehensive loan information and statistics</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Loans</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {records.filter(loan => loan.loanStatus === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Disbursed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ₹{records.reduce((sum, loan) => sum + loan.principalAmount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Outstanding</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ₹{records.reduce((sum, loan) => sum + loan.principalOutstanding, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Arrears</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ₹{records.reduce((sum, loan) => sum + loan.principalArrears + loan.interestArrears, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loan Summary</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredRecords.length} records found
              </p>
            </div>
            
            <LoanSummaryFilterDropdown 
              onFilter={handleFilter}
              onDownload={handleDownload}
            />
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
                      {column.render ? column.render(record[column.key as keyof LoanSummaryRecord], record) : record[column.key as keyof LoanSummaryRecord]}
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