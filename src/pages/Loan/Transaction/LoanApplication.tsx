import React, { useState, useRef } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { Toggle } from '../../../components/Common/Toggle';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { 
  User, 
  DollarSign, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter,
  ChevronDown,
  Search,
  Plus,
  Upload,
  Download,
  Building,
  Home,
  Users,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2
} from 'lucide-react';

interface LoanApplicationData {
  id: string;
  applicationId: string;
  applicationDate: string;
  clientCode: string;
  branch: string;
  centerCode: string;
  centerName: string;
  centerGroup: string;
  firstName: string;
  middleName: string;
  lastName: string;
  husbandName: string;
  fatherName: string;
  motherName: string;
  coApplicantName: string;
  coApplicantDOB: string;
  coApplicantIdType1: string;
  coApplicantIdNumber1: string;
  coApplicantIdType2: string;
  coApplicantIdNumber2: string;
  guarantorName: string;
  guarantorDOB: string;
  guarantorIdType1: string;
  guarantorIdNumber1: string;
  guarantorIdType2: string;
  guarantorIdNumber2: string;
  docVerifiedStatus: string;
  applicationStatus: string;
  docRejectionReason: string;
  docRejectionRemarks: string;
  appRejectionReason: string;
  remarks: string;
  cycle: number;
  productGroup: string;
  product: string;
  loanAmount: number;
  payableAmount: number;
  processingCharge: number;
  insuranceCharge: number;
  documentationCharge: number;
  healthCareAmount: number;
  sanctionAmount: number;
  sanctionDate: string;
  tenure: number;
  repaymentFrequency: string;
  aadhaarId: string;
  voterId: string;
  gender: string;
  dob: string;
  age: number;
  maritalStatus: string;
  preferredLanguage: string;
  mobileNumber: string;
  alternateMobileNo: string;
  correspondenceAddress: string;
  pincode: string;
  village: string;
  district: string;
  state: string;
  zone: string;
  division: string;
  caste: string;
  religion: string;
  bankName: string;
  ifscCode: string;
  bankAccNo: string;
  customerNameInBank: string;
  nameMatchPercentage: number;
  pennyDropDone: boolean;
  annualIncome: number;
  land: string;
  qualification: string;
  occupation: string;
  externalLanNo: string;
  fo: string;
  kycSource: string;
  docRejectionCount: number;
  docVerificationDate: string;
  docVerifiedBy: string;
  otherKycType: string;
  otherKycId: string;
  insertedBy: string;
  insertedOn: string;
  oldLoanId: string;
  oldCustomerId: string;
  bcPartner: string;
  eKycNumber: string;
  eKycReferenceKey: string;
  sanctionStatus: string;
  lastModifyName: string;
  lastModifyDate: string;
  lastDocumentsVerificationDate: string;
  lastDocumentsUploader: string;
  cgtDoneBy: string;
  cgtDoneDate: string;
  grtDoneBy: string;
  grtDate: string;
  grt2Status: string;
  grt2AssignedTo: string;
  grt2Remarks: string;
  grt2CompletedOn: string;
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  activeMfiAccountByCb: number;
  outstandingAmountByCb: number;
  noOfOverdueAccountsByCb: number;
  overdueAmountByCb: number;
  writeOffAccountByCb: number;
  writeOffAmountByCb: number;
  emiObligation: number;
  proposedEmi: number;
  foirPercentage: number;
}

interface FilterOptions {
  branch?: string;
  center?: string;
  productGroup?: string;
  product?: string;
  businessPartner?: string;
  clientCode?: string;
  aadhaarNumber?: string;
  applicationId?: string;
  applicationStatus?: string;
  grt2Status?: string;
  clmStatus?: string;
  appVerificationStatus?: string;
  bcSanctionStatus?: string;
  externalLanNumber?: string;
  applicationDateFrom?: string;
  applicationDateTo?: string;
  verificationDateFrom?: string;
  verificationDateTo?: string;
}

const FilterDropdown: React.FC<{
  onFilter: (filters: FilterOptions) => void;
}> = ({ onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    onFilter(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({});
    onFilter({});
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
      >
        <Filter className="w-4 h-4" />
        <span>Filter Panel</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Panel</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Group</label>
                <input
                  type="text"
                  value={filters.productGroup || ''}
                  onChange={(e) => handleFilterChange('productGroup', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter product group"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product</label>
                <input
                  type="text"
                  value={filters.product || ''}
                  onChange={(e) => handleFilterChange('product', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter product"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Partner</label>
                <input
                  type="text"
                  value={filters.businessPartner || ''}
                  onChange={(e) => handleFilterChange('businessPartner', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter business partner"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application ID</label>
                <input
                  type="text"
                  value={filters.applicationId || ''}
                  onChange={(e) => handleFilterChange('applicationId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter application ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Status</label>
                <select
                  value={filters.applicationStatus || ''}
                  onChange={(e) => handleFilterChange('applicationStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="disbursed">Disbursed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GRT 2 Status</label>
                <select
                  value={filters.grt2Status || ''}
                  onChange={(e) => handleFilterChange('grt2Status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CLM Status</label>
                <select
                  value={filters.clmStatus || ''}
                  onChange={(e) => handleFilterChange('clmStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">App Verification Status</label>
                <select
                  value={filters.appVerificationStatus || ''}
                  onChange={(e) => handleFilterChange('appVerificationStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BC Sanction Status</label>
                <select
                  value={filters.bcSanctionStatus || ''}
                  onChange={(e) => handleFilterChange('bcSanctionStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="sanctioned">Sanctioned</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">External LAN Number</label>
                <input
                  type="text"
                  value={filters.externalLanNumber || ''}
                  onChange={(e) => handleFilterChange('externalLanNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter external LAN number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Date From</label>
                <input
                  type="date"
                  value={filters.applicationDateFrom || ''}
                  onChange={(e) => handleFilterChange('applicationDateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Date To</label>
                <input
                  type="date"
                  value={filters.applicationDateTo || ''}
                  onChange={(e) => handleFilterChange('applicationDateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verification Date From</label>
                <input
                  type="date"
                  value={filters.verificationDateFrom || ''}
                  onChange={(e) => handleFilterChange('verificationDateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verification Date To</label>
                <input
                  type="date"
                  value={filters.verificationDateTo || ''}
                  onChange={(e) => handleFilterChange('verificationDateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
  );
};

const LoanApplicationForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    // Center Details
    branchId: '',
    centerId: '',
    isTopUp: false,
    
    // Customer Details
    aadhaarNumber: '',
    voterId: '',
    otherIdType: '',
    idNumber: '',
    firstName: '',
    middleName: '',
    lastName: '',
    fatherName: '',
    motherName: '',
    mobileNumber: '',
    alternateMobileNumber: '',
    dateOfBirth: '',
    age: '',
    placeOfBirth: '',
    gender: '',
    category: '',
    caste: '',
    preferredLanguage: '',
    qualification: '',
    occupation: '',
    maritalStatus: '',
    religion: '',
    familyType: '',
    agriculturalLand: '',
    ppiScore: '',
    ppiScoreTagging: '',
    
    // Address Details
    address1: '',
    address2: '',
    mohalla: '',
    postOffice: '',
    nearestPoliceStation: '',
    pincode: '',
    village: '',
    district: '',
    state: '',
    residenceType: '',
    permanentAddress: false,
    correspondenceAddress: false,
    
    // Bank Details
    bankAccountType: '',
    bankAccountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    bankBranch: '',
    forDisbursement: false,
    forCollection: false,
    
    // Product Details
    productGroupId: '',
    productId: '',
    productName: '',
    loanAmount: '',
    emiAmount: '',
    interestRate: '',
    repaymentFrequency: '',
    tenure: '',
    purpose: '',
    subPurpose: ''
  });

  const [familyMembers, setFamilyMembers] = useState([{
    relation: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    dateOfBirth: '',
    idType: '',
    idNumber: '',
    additionalIdType: '',
    additionalIdNumber: '',
    maritalStatus: '',
    employmentStatus: '',
    qualification: '',
    occupation: '',
    occupationType: '',
    considerForAssessment: false,
    nameNominee: false,
    coApplicant: false,
    guarantor: false
  }]);

  const [bankDetails, setBankDetails] = useState([{
    bankAccountType: '',
    bankAccountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    bankBranch: '',
    forDisbursement: false,
    forCollection: false
  }]);

  const [addresses, setAddresses] = useState([{
    address1: '',
    address2: '',
    mohalla: '',
    postOffice: '',
    nearestPoliceStation: '',
    pincode: '',
    village: '',
    district: '',
    state: '',
    residenceType: ''
  }]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, familyMembers, bankDetails, addresses });
  };

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, {
      relation: '',
      firstName: '',
      lastName: '',
      mobileNumber: '',
      dateOfBirth: '',
      idType: '',
      idNumber: '',
      additionalIdType: '',
      additionalIdNumber: '',
      maritalStatus: '',
      employmentStatus: '',
      qualification: '',
      occupation: '',
      occupationType: '',
      considerForAssessment: false,
      nameNominee: false,
      coApplicant: false,
      guarantor: false
    }]);
  };

  const addBankDetail = () => {
    setBankDetails([...bankDetails, {
      bankAccountType: '',
      bankAccountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      bankName: '',
      bankBranch: '',
      forDisbursement: false,
      forCollection: false
    }]);
  };

  const addAddress = () => {
    setAddresses([...addresses, {
      address1: '',
      address2: '',
      mohalla: '',
      postOffice: '',
      nearestPoliceStation: '',
      pincode: '',
      village: '',
      district: '',
      state: '',
      residenceType: ''
    }]);
  };

  const handleAutoFetch = () => {
    // Simulate auto-fetch functionality
    alert('Auto-fetch functionality will be implemented');
  };

  const handleIncExpAdd = () => {
    // Simulate income/expense add functionality
    alert('Income/Expense add functionality will be implemented');
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
      {/* Center Details */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <Building className="w-5 h-5 mr-2" />
          Center Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Branch ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.branchId}
              onChange={(e) => setFormData({...formData, branchId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter branch ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Center ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.centerId}
              onChange={(e) => setFormData({...formData, centerId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter center ID"
            />
          </div>
          <div className="flex items-center">
            <Toggle
              checked={formData.isTopUp}
              onChange={(checked) => setFormData({...formData, isTopUp: checked})}
              label="Is Top-Up"
            />
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Customer Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Aadhaar Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.aadhaarNumber}
              onChange={(e) => setFormData({...formData, aadhaarNumber: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter Aadhaar number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Voter ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.voterId}
              onChange={(e) => setFormData({...formData, voterId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter voter ID"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAutoFetch}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Search className="w-4 h-4 mr-2 inline" />
              Search
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Other ID Type</label>
            <input
              type="text"
              value={formData.otherIdType}
              onChange={(e) => setFormData({...formData, otherIdType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter other ID type"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID Number</label>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter ID number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Middle Name</label>
            <input
              type="text"
              value={formData.middleName}
              onChange={(e) => setFormData({...formData, middleName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter middle name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter last name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Father's Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fatherName}
              onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter father's name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mother's Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.motherName}
              onChange={(e) => setFormData({...formData, motherName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter mother's name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter mobile number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alternate Mobile Number</label>
            <input
              type="tel"
              value={formData.alternateMobileNumber}
              onChange={(e) => setFormData({...formData, alternateMobileNumber: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter alternate mobile number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter age"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Place of Birth</label>
            <input
              type="text"
              value={formData.placeOfBirth}
              onChange={(e) => setFormData({...formData, placeOfBirth: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter place of birth"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="md:col-span-3 flex items-center space-x-4">
            <button
              type="button"
              onClick={handleIncExpAdd}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              ADD INC/EXP
            </button>
          </div>
        </div>
      </div>

      {/* Address Details */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <Home className="w-5 h-5 mr-2" />
          Address Details
        </h4>
        {addresses.map((address, index) => (
          <div key={index} className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address.address1}
                  onChange={(e) => {
                    const newAddresses = [...addresses];
                    newAddresses[index].address1 = e.target.value;
                    setAddresses(newAddresses);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter address 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address 2</label>
                <input
                  type="text"
                  value={address.address2}
                  onChange={(e) => {
                    const newAddresses = [...addresses];
                    newAddresses[index].address2 = e.target.value;
                    setAddresses(newAddresses);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter address 2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mohalla <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address.mohalla}
                  onChange={(e) => {
                    const newAddresses = [...addresses];
                    newAddresses[index].mohalla = e.target.value;
                    setAddresses(newAddresses);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter mohalla"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addAddress}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
        >
          <Plus className="w-4 h-4" />
          <span>Add Address</span>
        </button>
      </div>

      {/* Family Details */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Family Details
        </h4>
        {familyMembers.map((member, index) => (
          <div key={index} className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Relation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={member.relation}
                  onChange={(e) => {
                    const newMembers = [...familyMembers];
                    newMembers[index].relation = e.target.value;
                    setFamilyMembers(newMembers);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter relation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={member.firstName}
                  onChange={(e) => {
                    const newMembers = [...familyMembers];
                    newMembers[index].firstName = e.target.value;
                    setFamilyMembers(newMembers);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={member.lastName}
                  onChange={(e) => {
                    const newMembers = [...familyMembers];
                    newMembers[index].lastName = e.target.value;
                    setFamilyMembers(newMembers);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter last name"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addFamilyMember}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Family Member</span>
        </button>
      </div>

      {/* Bank Details */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Bank Details
        </h4>
        {bankDetails.map((bank, index) => (
          <div key={index} className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank Account Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={bank.bankAccountType}
                  onChange={(e) => {
                    const newBankDetails = [...bankDetails];
                    newBankDetails[index].bankAccountType = e.target.value;
                    setBankDetails(newBankDetails);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Account Type</option>
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bank.bankAccountNumber}
                  onChange={(e) => {
                    const newBankDetails = [...bankDetails];
                    newBankDetails[index].bankAccountNumber = e.target.value;
                    setBankDetails(newBankDetails);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter bank account number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bank.confirmAccountNumber}
                  onChange={(e) => {
                    const newBankDetails = [...bankDetails];
                    newBankDetails[index].confirmAccountNumber = e.target.value;
                    setBankDetails(newBankDetails);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Confirm bank account number"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addBankDetail}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Bank Details</span>
        </button>
      </div>

      {/* Product Details */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Product Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Group ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.productGroupId}
              onChange={(e) => setFormData({...formData, productGroupId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter product group ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.productId}
              onChange={(e) => setFormData({...formData, productId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter product ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData({...formData, productName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter product name"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Amount</label>
            <input
              type="number"
              value={formData.loanAmount}
              onChange={(e) => setFormData({...formData, loanAmount: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter loan amount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">EMI Amount</label>
            <input
              type="number"
              value={formData.emiAmount}
              onChange={(e) => setFormData({...formData, emiAmount: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter EMI amount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest Rate</label>
            <input
              type="number"
              value={formData.interestRate}
              onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter interest rate"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Repayment Frequency</label>
            <select
              value={formData.repaymentFrequency}
              onChange={(e) => setFormData({...formData, repaymentFrequency: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Frequency</option>
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
              <option value="Fortnightly">Fortnightly</option>
              <option value="Quarterly">Quarterly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tenure</label>
            <input
              type="number"
              value={formData.tenure}
              onChange={(e) => setFormData({...formData, tenure: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter tenure"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Purpose <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Purpose</option>
              <option value="Business">Business</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Education">Education</option>
              <option value="Medical">Medical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sub Purpose <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.subPurpose}
              onChange={(e) => setFormData({...formData, subPurpose: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Sub Purpose</option>
              <option value="Small Business">Small Business</option>
              <option value="Crop Loan">Crop Loan</option>
              <option value="School Fees">School Fees</option>
              <option value="Medical Emergency">Medical Emergency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document Uploader */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Document Uploader
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Borrower KYC1</label>
            <button
              type="button"
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Borrower KYC2</label>
            <button
              type="button"
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BANK PASSBOOK/CHEQUE</label>
            <button
              type="button"
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CO APP KYC 1 & 2</label>
            <button
              type="button"
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PROFILE PHOTO</label>
            <button
              type="button"
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BUSINESS REGISTRATION PROOF</label>
            <button
              type="button"
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CLIENT CONSENT</label>
            <button
              type="button"
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CIBIL</label>
            <button
              type="button"
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LOAN APPLICATION</label>
            <button
              type="button"
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BANK STATEMENT</label>
            <button
              type="button"
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OWNERSHIP PROOF</label>
            <button
              type="button"
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OTHER DOCUMENT 1 & 2</label>
            <button
              type="button"
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Submit Application
        </button>
      </div>
    </form>
  );
};

export const LoanApplicationPage: React.FC = () => {
  const [applications, setApplications] = useState<LoanApplicationData[]>([
    {
      id: '1',
      applicationId: 'LA001',
      applicationDate: '2024-01-15',
      clientCode: 'CL001',
      branch: 'Main Branch',
      centerCode: 'CTR001',
      centerName: 'Anand Nagar Center',
      centerGroup: 'Group A',
      firstName: 'Priya',
      middleName: '',
      lastName: 'Sharma',
      husbandName: 'Rahul Sharma',
      fatherName: 'Rajesh Kumar',
      motherName: 'Sunita Devi',
      coApplicantName: '',
      coApplicantDOB: '',
      coApplicantIdType1: '',
      coApplicantIdNumber1: '',
      coApplicantIdType2: '',
      coApplicantIdNumber2: '',
      guarantorName: '',
      guarantorDOB: '',
      guarantorIdType1: '',
      guarantorIdNumber1: '',
      guarantorIdType2: '',
      guarantorIdNumber2: '',
      docVerifiedStatus: 'Pending',
      applicationStatus: 'pending',
      docRejectionReason: '',
      docRejectionRemarks: '',
      appRejectionReason: '',
      remarks: '',
      cycle: 1,
      productGroup: 'Micro Finance',
      product: 'Micro Finance Loan',
      loanAmount: 50000,
      payableAmount: 55000,
      processingCharge: 1000,
      insuranceCharge: 500,
      documentationCharge: 500,
      healthCareAmount: 0,
      sanctionAmount: 0,
      sanctionDate: '',
      tenure: 12,
      repaymentFrequency: 'Monthly',
      aadhaarId: '1234-5678-9012',
      voterId: 'ABC1234567',
      gender: 'Female',
      dob: '1985-06-15',
      age: 38,
      maritalStatus: 'Married',
      preferredLanguage: 'Hindi',
      mobileNumber: '+91 9876543210',
      alternateMobileNo: '',
      correspondenceAddress: '123 Main St, Anand Nagar',
      pincode: '110001',
      village: 'Anand Nagar',
      district: 'Central Delhi',
      state: 'Delhi',
      zone: 'North',
      division: 'Central',
      caste: 'General',
      religion: 'Hindu',
      bankName: 'State Bank of India',
      ifscCode: 'SBIN0000001',
      bankAccNo: '1234567890',
      customerNameInBank: 'Priya Sharma',
      nameMatchPercentage: 100,
      pennyDropDone: true,
      annualIncome: 300000,
      land: '2 Acres',
      qualification: 'Graduate',
      occupation: 'Small Business',
      externalLanNo: '',
      fo: 'Amit Kumar',
      kycSource: 'Physical',
      docRejectionCount: 0,
      docVerificationDate: '',
      docVerifiedBy: '',
      otherKycType: '',
      otherKycId: '',
      insertedBy: 'Admin User',
      insertedOn: '2024-01-15',
      oldLoanId: '',
      oldCustomerId: '',
      bcPartner: 'Partner A',
      eKycNumber: '',
      eKycReferenceKey: '',
      sanctionStatus: 'Pending',
      lastModifyName: '',
      lastModifyDate: '',
      lastDocumentsVerificationDate: '',
      lastDocumentsUploader: '',
      cgtDoneBy: '',
      cgtDoneDate: '',
      grtDoneBy: '',
      grtDate: '',
      grt2Status: 'Pending',
      grt2AssignedTo: '',
      grt2Remarks: '',
      grt2CompletedOn: '',
      totalMonthlyIncome: 25000,
      totalMonthlyExpenses: 15000,
      activeMfiAccountByCb: 1,
      outstandingAmountByCb: 20000,
      noOfOverdueAccountsByCb: 0,
      overdueAmountByCb: 0,
      writeOffAccountByCb: 0,
      writeOffAmountByCb: 0,
      emiObligation: 5000,
      proposedEmi: 4500,
      foirPercentage: 18
    },
    {
      id: '2',
      applicationId: 'LA002',
      applicationDate: '2024-01-14',
      clientCode: 'CL002',
      branch: 'North Branch',
      centerCode: 'CTR002',
      centerName: 'Gandhi Colony Center',
      centerGroup: 'Group B',
      firstName: 'Rajesh',
      middleName: '',
      lastName: 'Kumar',
      husbandName: '',
      fatherName: 'Mohan Kumar',
      motherName: 'Radha Kumar',
      coApplicantName: 'Sunita Kumar',
      coApplicantDOB: '1982-05-10',
      coApplicantIdType1: 'Aadhaar',
      coApplicantIdNumber1: '2345-6789-0123',
      coApplicantIdType2: '',
      coApplicantIdNumber2: '',
      guarantorName: '',
      guarantorDOB: '',
      guarantorIdType1: '',
      guarantorIdNumber1: '',
      guarantorIdType2: '',
      guarantorIdNumber2: '',
      docVerifiedStatus: 'Completed',
      applicationStatus: 'approved',
      docRejectionReason: '',
      docRejectionRemarks: '',
      appRejectionReason: '',
      remarks: 'Approved after verification',
      cycle: 2,
      productGroup: 'Group Lending',
      product: 'Group Loan',
      loanAmount: 75000,
      payableAmount: 82500,
      processingCharge: 1500,
      insuranceCharge: 750,
      documentationCharge: 750,
      healthCareAmount: 0,
      sanctionAmount: 75000,
      sanctionDate: '2024-01-20',
      tenure: 18,
      repaymentFrequency: 'Monthly',
      aadhaarId: '2345-6789-0123',
      voterId: 'DEF2345678',
      gender: 'Male',
      dob: '1980-03-22',
      age: 43,
      maritalStatus: 'Married',
      preferredLanguage: 'Hindi',
      mobileNumber: '+91 9876543211',
      alternateMobileNo: '+91 9876543212',
      correspondenceAddress: '456 Gandhi Road, Gandhi Colony',
      pincode: '110002',
      village: 'Gandhi Colony',
      district: 'North Delhi',
      state: 'Delhi',
      zone: 'North',
      division: 'North',
      caste: 'OBC',
      religion: 'Hindu',
      bankName: 'HDFC Bank',
      ifscCode: 'HDFC0000001',
      bankAccNo: '0987654321',
      customerNameInBank: 'Rajesh Kumar',
      nameMatchPercentage: 100,
      pennyDropDone: true,
      annualIncome: 240000,
      land: '5 Acres',
      qualification: 'High School',
      occupation: 'Agriculture',
      externalLanNo: 'EXT002',
      fo: 'Neha Gupta',
      kycSource: 'Physical',
      docRejectionCount: 0,
      docVerificationDate: '2024-01-16',
      docVerifiedBy: 'Verification Officer',
      otherKycType: '',
      otherKycId: '',
      insertedBy: 'Manager User',
      insertedOn: '2024-01-14',
      oldLoanId: '',
      oldCustomerId: '',
      bcPartner: 'Partner B',
      eKycNumber: '',
      eKycReferenceKey: '',
      sanctionStatus: 'Approved',
      lastModifyName: 'Manager User',
      lastModifyDate: '2024-01-20',
      lastDocumentsVerificationDate: '2024-01-16',
      lastDocumentsUploader: 'Rajesh Kumar',
      cgtDoneBy: 'CGT Officer',
      cgtDoneDate: '2024-01-17',
      grtDoneBy: 'GRT Officer',
      grtDate: '2024-01-18',
      grt2Status: 'Completed',
      grt2AssignedTo: 'GRT2 Officer',
      grt2Remarks: 'All checks passed',
      grt2CompletedOn: '2024-01-19',
      totalMonthlyIncome: 20000,
      totalMonthlyExpenses: 12000,
      activeMfiAccountByCb: 1,
      outstandingAmountByCb: 15000,
      noOfOverdueAccountsByCb: 0,
      overdueAmountByCb: 0,
      writeOffAccountByCb: 0,
      writeOffAmountByCb: 0,
      emiObligation: 3000,
      proposedEmi: 4600,
      foirPercentage: 23
    }
  ]);
  
  const [filteredApplications, setFilteredApplications] = useState<LoanApplicationData[]>(applications);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleFilter = (filters: FilterOptions) => {
    let filtered = applications;

    // Apply filters based on the filter options
    if (filters.branch) {
      filtered = filtered.filter(app => app.branch.toLowerCase().includes(filters.branch!.toLowerCase()));
    }
    if (filters.center) {
      filtered = filtered.filter(app => app.centerName.toLowerCase().includes(filters.center!.toLowerCase()));
    }
    if (filters.productGroup) {
      filtered = filtered.filter(app => app.productGroup.toLowerCase().includes(filters.productGroup!.toLowerCase()));
    }
    if (filters.product) {
      filtered = filtered.filter(app => app.product.toLowerCase().includes(filters.product!.toLowerCase()));
    }
    if (filters.clientCode) {
      filtered = filtered.filter(app => app.clientCode.toLowerCase().includes(filters.clientCode!.toLowerCase()));
    }
    if (filters.aadhaarNumber) {
      filtered = filtered.filter(app => app.aadhaarId.includes(filters.aadhaarNumber!));
    }
    if (filters.applicationId) {
      filtered = filtered.filter(app => app.applicationId.toLowerCase().includes(filters.applicationId!.toLowerCase()));
    }
    if (filters.applicationStatus) {
      filtered = filtered.filter(app => app.applicationStatus === filters.applicationStatus);
    }
    if (filters.grt2Status) {
      filtered = filtered.filter(app => app.grt2Status === filters.grt2Status);
    }
    if (filters.applicationDateFrom) {
      filtered = filtered.filter(app => app.applicationDate >= filters.applicationDateFrom!);
    }
    if (filters.applicationDateTo) {
      filtered = filtered.filter(app => app.applicationDate <= filters.applicationDateTo!);
    }
    if (filters.verificationDateFrom && filters.verificationDateTo) {
      filtered = filtered.filter(app => 
        app.docVerificationDate && 
        app.docVerificationDate >= filters.verificationDateFrom! && 
        app.docVerificationDate <= filters.verificationDateTo!
      );
    }

    setFilteredApplications(filtered);
  };

  const handleAddApplication = (formData: any) => {
    // In a real application, this would send the data to the server
    console.log('Form data submitted:', formData);
    setShowAddModal(false);
    setSuccess('Application submitted successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleExportCSV = () => {
    // In a real application, this would generate and download a CSV file
    alert('Export functionality will be implemented');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'disbursed':
        return <DollarSign className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'disbursed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const columns = [
    {
      key: 'actions',
      label: 'Action',
      render: (value: any, row: LoanApplicationData) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard module="loan" permission="write">
            <button
              onClick={() => console.log('Edit application:', row.id)}
              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors duration-200"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard module="loan" permission="delete">
            <button
              onClick={() => console.log('Delete application:', row.id)}
              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors duration-200"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </PermissionGuard>
        </div>
      )
    },
    {
      key: 'applicationId',
      label: 'Application ID',
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
      key: 'clientCode',
      label: 'Client Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'branch',
      label: 'Branch',
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
      key: 'centerGroup',
      label: 'Center Group',
      sortable: true,
    },
    {
      key: 'firstName',
      label: 'First Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'middleName',
      label: 'Middle Name',
      sortable: true,
    },
    {
      key: 'lastName',
      label: 'Last Name',
      sortable: true,
    },
    {
      key: 'husbandName',
      label: 'Husband Name',
      sortable: true,
    },
    {
      key: 'fatherName',
      label: 'Father Name',
      sortable: true,
    },
    {
      key: 'motherName',
      label: 'Mother Name',
      sortable: true,
    },
    {
      key: 'coApplicantName',
      label: 'Co-Applicant Name',
      sortable: true,
    },
    {
      key: 'coApplicantDOB',
      label: 'Co-Applicant DOB',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'coApplicantIdType1',
      label: 'Co-Applicant ID Type 1',
    },
    {
      key: 'coApplicantIdNumber1',
      label: 'Co-Applicant ID Number 1',
    },
    {
      key: 'coApplicantIdType2',
      label: 'Co-Applicant ID Type 2',
    },
    {
      key: 'coApplicantIdNumber2',
      label: 'Co-Applicant ID Number 2',
    },
    {
      key: 'guarantorName',
      label: 'Guarantor Name',
    },
    {
      key: 'guarantorDOB',
      label: 'Guarantor DOB',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'guarantorIdType1',
      label: 'Guarantor ID Type 1',
    },
    {
      key: 'guarantorIdNumber1',
      label: 'Guarantor ID Number 1',
    },
    {
      key: 'guarantorIdType2',
      label: 'Guarantor ID Type 2',
    },
    {
      key: 'guarantorIdNumber2',
      label: 'Guarantor ID Number 2',
    },
    {
      key: 'docVerifiedStatus',
      label: 'Doc Verified Status',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
          value === 'Completed' 
            ? 'bg-green-100 text-green-800'
            : value === 'Failed'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      )
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
      key: 'docRejectionReason',
      label: 'Doc Rejection Reason',
    },
    {
      key: 'docRejectionRemarks',
      label: 'Doc Rejection Remarks',
    },
    {
      key: 'appRejectionReason',
      label: 'App Rejection Reason',
    },
    {
      key: 'remarks',
      label: 'Remarks',
    },
    {
      key: 'cycle',
      label: 'Cycle',
      sortable: true,
      render: (value: number) => (
        <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-800">
          Cycle {value}
        </span>
      )
    },
    {
      key: 'productGroup',
      label: 'Product Group',
      sortable: true,
    },
    {
      key: 'product',
      label: 'Product',
      sortable: true,
    },
    {
      key: 'loanAmount',
      label: 'Loan Amount',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'payableAmount',
      label: 'Payable Amount',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'processingCharge',
      label: 'Processing Charge',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'insuranceCharge',
      label: 'Insurance Charge',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'documentationCharge',
      label: 'Documentation Charge',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'healthCareAmount',
      label: 'Health Care Amount',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'sanctionAmount',
      label: 'Sanction Amount',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'sanctionDate',
      label: 'Sanction Date',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'tenure',
      label: 'Tenure',
      sortable: true,
      render: (value: number) => `${value} months`,
    },
    {
      key: 'repaymentFrequency',
      label: 'Repayment Frequency',
      sortable: true,
    },
    {
      key: 'aadhaarId',
      label: 'Aadhaar ID',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span className="font-mono">{value}</span>
        </div>
      )
    },
    {
      key: 'voterId',
      label: 'Voter ID',
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'gender',
      label: 'Gender',
      sortable: true,
    },
    {
      key: 'dob',
      label: 'DOB',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'age',
      label: 'Age',
      render: (value: number) => `${value} years`,
    },
    {
      key: 'maritalStatus',
      label: 'Marital Status',
      sortable: true,
    },
    {
      key: 'preferredLanguage',
      label: 'Preferred Language',
    },
    {
      key: 'mobileNumber',
      label: 'Mobile Number',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'alternateMobileNo',
      label: 'Alternate Mobile No.',
    },
    {
      key: 'correspondenceAddress',
      label: 'Correspondence Address',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate max-w-32" title={value}>{value}</span>
        </div>
      )
    },
    {
      key: 'pincode',
      label: 'Pincode',
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'village',
      label: 'Village',
    },
    {
      key: 'district',
      label: 'District',
    },
    {
      key: 'state',
      label: 'State',
    },
    {
      key: 'zone',
      label: 'Zone',
    },
    {
      key: 'division',
      label: 'Division',
    },
    {
      key: 'caste',
      label: 'Caste',
    },
    {
      key: 'religion',
      label: 'Religion',
    },
    {
      key: 'bankName',
      label: 'Bank Name',
    },
    {
      key: 'ifscCode',
      label: 'IFSC Code',
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'bankAccNo',
      label: 'Bank Acc No.',
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'customerNameInBank',
      label: 'Customer Name In Bank',
    },
    {
      key: 'nameMatchPercentage',
      label: 'Name Match Percentage',
      render: (value: number) => `${value}%`,
    },
    {
      key: 'pennyDropDone',
      label: 'Penny Drop Done',
      render: (value: boolean) => value ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-red-600" />
      ),
    },
    {
      key: 'annualIncome',
      label: 'Annual Income',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'land',
      label: 'Land',
    },
    {
      key: 'qualification',
      label: 'Qualification',
    },
    {
      key: 'occupation',
      label: 'Occupation',
    },
    {
      key: 'externalLanNo',
      label: 'External LAN No',
    },
    {
      key: 'fo',
      label: 'FO',
    },
    {
      key: 'kycSource',
      label: 'KYC Source',
    },
    {
      key: 'docRejectionCount',
      label: 'Doc Rejection Count',
    },
    {
      key: 'docVerificationDate',
      label: 'Doc Verification Date',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'docVerifiedBy',
      label: 'Doc Verified By',
    },
    {
      key: 'otherKycType',
      label: 'Other KYC Type',
    },
    {
      key: 'otherKycId',
      label: 'Other KYC ID',
    },
    {
      key: 'insertedBy',
      label: 'Inserted By',
    },
    {
      key: 'insertedOn',
      label: 'Inserted On',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'oldLoanId',
      label: 'Old Loan ID',
    },
    {
      key: 'oldCustomerId',
      label: 'Old Customer ID',
    },
    {
      key: 'bcPartner',
      label: 'BC Partner',
    },
    {
      key: 'eKycNumber',
      label: 'E-KYC Number',
    },
    {
      key: 'eKycReferenceKey',
      label: 'E-KYC Reference Key',
    },
    {
      key: 'sanctionStatus',
      label: 'Sanction Status',
    },
    {
      key: 'lastModifyName',
      label: 'Last Modify Name',
    },
    {
      key: 'lastModifyDate',
      label: 'Last Modify Date',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'lastDocumentsVerificationDate',
      label: 'Last Documents Verification Date',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'lastDocumentsUploader',
      label: 'Last Documents Uploader',
    },
    {
      key: 'cgtDoneBy',
      label: 'CGT Done By',
    },
    {
      key: 'cgtDoneDate',
      label: 'CGT Done Date',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'grtDoneBy',
      label: 'GRT Done By',
    },
    {
      key: 'grtDate',
      label: 'GRT Date',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'grt2Status',
      label: 'GRT 2 Status',
    },
    {
      key: 'grt2AssignedTo',
      label: 'GRT 2 Assigned To',
    },
    {
      key: 'grt2Remarks',
      label: 'GRT 2 Remarks',
    },
    {
      key: 'grt2CompletedOn',
      label: 'GRT 2 Completed On',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'totalMonthlyIncome',
      label: 'Total Monthly Income',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'totalMonthlyExpenses',
      label: 'Total Monthly Expenses',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'activeMfiAccountByCb',
      label: 'Active MFI Account by CB',
    },
    {
      key: 'outstandingAmountByCb',
      label: 'Outstanding Amount by CB',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'noOfOverdueAccountsByCb',
      label: 'No. of Overdue Accounts by CB',
    },
    {
      key: 'overdueAmountByCb',
      label: 'Overdue Amount by CB',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'writeOffAccountByCb',
      label: 'Write-Off Account by CB',
    },
    {
      key: 'writeOffAmountByCb',
      label: 'Write-Off Amount by CB',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'emiObligation',
      label: 'EMI Obligation',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'proposedEmi',
      label: 'Proposed EMI',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'foirPercentage',
      label: 'FOIR Percentage',
      render: (value: number) => `${value}%`,
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading applications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Loan Applications</h1>
        <p className="text-gray-600 mt-1">Track and manage loan applications</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">
                {applications.filter(app => app.applicationStatus === 'pending').length}
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
                {applications.filter(app => app.applicationStatus === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Disbursed</p>
              <p className="text-xl font-bold text-gray-900">
                {applications.filter(app => app.applicationStatus === 'disbursed').length}
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
                {applications.filter(app => app.applicationStatus === 'rejected').length}
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
              <h2 className="text-xl font-semibold text-gray-900">Application Management</h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredApplications.length} records found
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <FilterDropdown onFilter={handleFilter} />
              
              <PermissionGuard module="loan" permission="read">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </PermissionGuard>
              
              <PermissionGuard module="loan" permission="write">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New</span>
                </button>
              </PermissionGuard>
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
              {filteredApplications.map((application, index) => (
                <tr
                  key={application.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(application[column.key as keyof LoanApplicationData], application) : application[column.key as keyof LoanApplicationData]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Application Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Loan Application"
        size="xl"
      >
        <LoanApplicationForm
          onSubmit={handleAddApplication}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
};