import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Upload, 
  Play, 
  Calendar, 
  Building, 
  CheckCircle, 
  XCircle, 
  Filter, 
  ChevronDown,
  CreditCard,
  User,
  DollarSign,
  Mail,
  MapPin
} from 'lucide-react';

interface NEFTDisbursementRecord {
  id: string;
  transactionType: string;
  beneficiaryCode: string;
  beneficiaryAccountNumber: string;
  instrumentAmount: number;
  beneficiaryName: string;
  draweeLocation: string;
  printLocation: string;
  beneficiaryAddress1: string;
  beneficiaryAddress2: string;
  beneficiaryAddress3: string;
  beneficiaryAddress4: string;
  beneficiaryAddress5: string;
  instructionReferenceNumber: string;
  customerReferenceNumber: string;
  paymentDetails1: string;
  paymentDetails2: string;
  paymentDetails3: string;
  paymentDetails4: string;
  paymentDetails5: string;
  paymentDetails6: string;
  paymentDetails7: string;
  chequeNumber: string;
  chequeTransactionDate: string;
  micrNumber: string;
  ifscCode: string;
  beneficiaryBankName: string;
  beneficiaryBankBranchName: string;
  beneficiaryEmailId: string;
}

interface NEFTUploaderRecord {
  id: string;
  transactionId: string;
  loanCode: string;
  loanAmount: number;
  settleDate: string;
  settledStatus: string;
  isAmortGenerated: boolean;
  processStatus: string;
  processMessage: string;
}

interface DownloaderFilterOptions {
  disbursementDateFrom: string;
  disbursementDateTo: string;
  bcPartner: string;
  zone?: string;
  division?: string;
  branch?: string;
}

const DownloaderFilterDropdown: React.FC<{
  onFilter: (filters: DownloaderFilterOptions) => void;
}> = ({ onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<DownloaderFilterOptions>({
    disbursementDateFrom: '',
    disbursementDateTo: '',
    bcPartner: ''
  });

  const handleFilterChange = (key: keyof DownloaderFilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    onFilter(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      disbursementDateFrom: '',
      disbursementDateTo: '',
      bcPartner: ''
    });
    onFilter({
      disbursementDateFrom: '',
      disbursementDateTo: '',
      bcPartner: ''
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disbursement Date From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={filters.disbursementDateFrom}
                  onChange={(e) => handleFilterChange('disbursementDateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disbursement Date To <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={filters.disbursementDateTo}
                  onChange={(e) => handleFilterChange('disbursementDateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  BC Partner <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={filters.bcPartner}
                  onChange={(e) => handleFilterChange('bcPartner', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter BC partner"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                <input
                  type="text"
                  value={filters.zone || ''}
                  onChange={(e) => handleFilterChange('zone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter zone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                <input
                  type="text"
                  value={filters.division || ''}
                  onChange={(e) => handleFilterChange('division', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter division"
                />
              </div>

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

export const NEFTDisbursementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'downloader' | 'uploader'>('downloader');
  const [downloaderRecords, setDownloaderRecords] = useState<NEFTDisbursementRecord[]>([
    {
      id: '1',
      transactionType: 'NEFT',
      beneficiaryCode: 'BEN001',
      beneficiaryAccountNumber: '1234567890',
      instrumentAmount: 50000,
      beneficiaryName: 'Priya Sharma',
      draweeLocation: 'Delhi',
      printLocation: 'Delhi',
      beneficiaryAddress1: '123 Main St',
      beneficiaryAddress2: 'Anand Nagar',
      beneficiaryAddress3: 'Central Delhi',
      beneficiaryAddress4: 'Delhi',
      beneficiaryAddress5: '110001',
      instructionReferenceNumber: 'INS001',
      customerReferenceNumber: 'CUS001',
      paymentDetails1: 'Loan Disbursement',
      paymentDetails2: 'LN001',
      paymentDetails3: 'Micro Finance Loan',
      paymentDetails4: '',
      paymentDetails5: '',
      paymentDetails6: '',
      paymentDetails7: '',
      chequeNumber: '',
      chequeTransactionDate: '',
      micrNumber: '',
      ifscCode: 'SBIN0000001',
      beneficiaryBankName: 'State Bank of India',
      beneficiaryBankBranchName: 'Connaught Place',
      beneficiaryEmailId: 'priya.sharma@example.com'
    },
    {
      id: '2',
      transactionType: 'NEFT',
      beneficiaryCode: 'BEN002',
      beneficiaryAccountNumber: '0987654321',
      instrumentAmount: 75000,
      beneficiaryName: 'Rajesh Kumar',
      draweeLocation: 'Delhi',
      printLocation: 'Delhi',
      beneficiaryAddress1: '456 Gandhi Road',
      beneficiaryAddress2: 'Gandhi Colony',
      beneficiaryAddress3: 'North Delhi',
      beneficiaryAddress4: 'Delhi',
      beneficiaryAddress5: '110002',
      instructionReferenceNumber: 'INS002',
      customerReferenceNumber: 'CUS002',
      paymentDetails1: 'Loan Disbursement',
      paymentDetails2: 'LN002',
      paymentDetails3: 'Group Loan',
      paymentDetails4: '',
      paymentDetails5: '',
      paymentDetails6: '',
      paymentDetails7: '',
      chequeNumber: '',
      chequeTransactionDate: '',
      micrNumber: '',
      ifscCode: 'HDFC0000001',
      beneficiaryBankName: 'HDFC Bank',
      beneficiaryBankBranchName: 'Karol Bagh',
      beneficiaryEmailId: 'rajesh.kumar@example.com'
    }
  ]);
  
  const [uploaderRecords, setUploaderRecords] = useState<NEFTUploaderRecord[]>([
    {
      id: '1',
      transactionId: 'TRX001',
      loanCode: 'LN001',
      loanAmount: 50000,
      settleDate: '2024-01-21',
      settledStatus: 'settled',
      isAmortGenerated: true,
      processStatus: 'success',
      processMessage: 'Successfully processed'
    },
    {
      id: '2',
      transactionId: 'TRX002',
      loanCode: 'LN002',
      loanAmount: 75000,
      settleDate: '2024-01-19',
      settledStatus: 'settled',
      isAmortGenerated: true,
      processStatus: 'success',
      processMessage: 'Successfully processed'
    }
  ]);
  
  const [filteredDownloaderRecords, setFilteredDownloaderRecords] = useState<NEFTDisbursementRecord[]>(downloaderRecords);
  const [filteredUploaderRecords, setFilteredUploaderRecords] = useState<NEFTUploaderRecord[]>(uploaderRecords);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleDownloaderFilter = (filters: DownloaderFilterOptions) => {
    // In a real application, this would filter based on the provided criteria
    // For now, we'll just return all records
    setFilteredDownloaderRecords(downloaderRecords);
  };

  const handleDownload = () => {
    alert('NEFT Disbursement download functionality will be implemented');
  };

  const handleUpload = () => {
    alert('NEFT Disbursement upload functionality will be implemented');
  };

  const handleProcess = () => {
    alert('NEFT Disbursement process functionality will be implemented');
  };

  const getStatusIcon = (status: string) => {
    return status === 'success' || status === 'settled' ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'success' || status === 'settled' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const downloaderColumns = [
    {
      key: 'transactionType',
      label: 'Transaction Type',
      sortable: true,
    },
    {
      key: 'beneficiaryCode',
      label: 'Beneficiary Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'beneficiaryAccountNumber',
      label: 'Beneficiary Account Number',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span className="font-mono">{value}</span>
        </div>
      )
    },
    {
      key: 'instrumentAmount',
      label: 'Instrument Amount',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'beneficiaryName',
      label: 'Beneficiary Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'draweeLocation',
      label: 'Drawee Location',
    },
    {
      key: 'printLocation',
      label: 'Print Location',
    },
    {
      key: 'beneficiaryAddress1',
      label: 'Beneficiary Address 1',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'beneficiaryAddress2',
      label: 'Beneficiary Address 2',
    },
    {
      key: 'beneficiaryAddress3',
      label: 'Beneficiary Address 3',
    },
    {
      key: 'beneficiaryAddress4',
      label: 'Beneficiary Address 4',
    },
    {
      key: 'beneficiaryAddress5',
      label: 'Beneficiary Address 5',
    },
    {
      key: 'instructionReferenceNumber',
      label: 'Instruction Reference Number',
    },
    {
      key: 'customerReferenceNumber',
      label: 'Customer Reference Number',
    },
    {
      key: 'paymentDetails1',
      label: 'Payment Details 1',
    },
    {
      key: 'paymentDetails2',
      label: 'Payment Details 2',
    },
    {
      key: 'paymentDetails3',
      label: 'Payment Details 3',
    },
    {
      key: 'paymentDetails4',
      label: 'Payment Details 4',
    },
    {
      key: 'paymentDetails5',
      label: 'Payment Details 5',
    },
    {
      key: 'paymentDetails6',
      label: 'Payment Details 6',
    },
    {
      key: 'paymentDetails7',
      label: 'Payment Details 7',
    },
    {
      key: 'chequeNumber',
      label: 'Cheque Number',
    },
    {
      key: 'chequeTransactionDate',
      label: 'Cheque Transaction Date',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'micrNumber',
      label: 'MICR Number',
    },
    {
      key: 'ifscCode',
      label: 'IFSC Code',
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'beneficiaryBankName',
      label: 'Beneficiary Bank Name',
    },
    {
      key: 'beneficiaryBankBranchName',
      label: 'Beneficiary Bank Branch Name',
    },
    {
      key: 'beneficiaryEmailId',
      label: 'Beneficiary Email Id',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Mail className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    }
  ];

  const uploaderColumns = [
    {
      key: 'transactionId',
      label: 'Transaction Id',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'loanCode',
      label: 'Loan Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
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
      key: 'settleDate',
      label: 'Settle Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'settledStatus',
      label: 'Settled Status',
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
      key: 'isAmortGenerated',
      label: 'Is Amort Generated',
      render: (value: boolean) => value ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      ),
    },
    {
      key: 'processStatus',
      label: 'Process Status',
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
      key: 'processMessage',
      label: 'Process Message',
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading NEFT disbursement data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">NEFT Disbursement</h1>
        <p className="text-gray-600 mt-1">Manage NEFT disbursements for loans</p>
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

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('downloader')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'downloader'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              NEFT Disbursement Downloader
            </button>
            <button
              onClick={() => setActiveTab('uploader')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'uploader'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              NEFT Disbursement Uploader
            </button>
          </div>
        </div>

        {/* Downloader Tab Content */}
        {activeTab === 'downloader' && (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">NEFT Disbursement Downloader</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredDownloaderRecords.length} records found
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <DownloaderFilterDropdown onFilter={handleDownloaderFilter} />
                  
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>NEFT Disbursement</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {downloaderColumns.map((column) => (
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
                  {filteredDownloaderRecords.map((record, index) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      {downloaderColumns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {column.render ? column.render(record[column.key as keyof NEFTDisbursementRecord], record) : record[column.key as keyof NEFTDisbursementRecord]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Uploader Tab Content */}
        {activeTab === 'uploader' && (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">NEFT Disbursement Uploader</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredUploaderRecords.length} records found
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleUpload}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </button>
                  
                  <button
                    onClick={handleProcess}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Play className="w-4 h-4" />
                    <span>Process</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {uploaderColumns.map((column) => (
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
                  {filteredUploaderRecords.map((record, index) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      {uploaderColumns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {column.render ? column.render(record[column.key as keyof NEFTUploaderRecord], record) : record[column.key as keyof NEFTUploaderRecord]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};