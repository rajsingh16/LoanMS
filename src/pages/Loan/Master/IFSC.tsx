import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { useAuth } from '../../../hooks/useAuth';
import { 
  Building, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Download, 
  AlertCircle, 
  Loader, 
  Plus,
  Filter,
  ChevronDown,
  Search,
  Phone,
  MapPin
} from 'lucide-react';

interface IFSCCode {
  id: string;
  ifscCode: string;
  bankName: string;
  bankBranch: string;
  branchAddress: string;
  city: string;
  state: string;
  mobileNumber?: string;
  insertedOn: string;
  insertedBy: string;
  updatedOn?: string;
  updatedBy?: string;
}

interface IFSCFormData {
  ifscCode: string;
  bankName: string;
  bankBranch: string;
  bankAddress: string;
  state: string;
  city: string;
  mobileNumber?: string;
}

interface IFSCFilterOptions {
  ifscCode?: string;
  bankName?: string;
}

const IFSCFilterDropdown: React.FC<{
  onFilter: (filters: IFSCFilterOptions) => void;
  bankNames: string[];
}> = ({ onFilter, bankNames }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<IFSCFilterOptions>({});

  const handleFilterChange = (key: keyof IFSCFilterOptions, value: string) => {
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
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Filters</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                IFSC Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={filters.ifscCode || ''}
                onChange={(e) => handleFilterChange('ifscCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter IFSC code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <select
                value={filters.bankName || ''}
                onChange={(e) => handleFilterChange('bankName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Banks</option>
                {bankNames.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
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

const IFSCForm: React.FC<{
  onSubmit: (data: IFSCFormData) => void;
  onCancel: () => void;
  initialData?: Partial<IFSCFormData>;
}> = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState<IFSCFormData>({
    ifscCode: initialData.ifscCode || '',
    bankName: initialData.bankName || '',
    bankBranch: initialData.bankBranch || '',
    bankAddress: initialData.bankAddress || '',
    state: initialData.state || '',
    city: initialData.city || '',
    mobileNumber: initialData.mobileNumber || '',
  });

  const [errors, setErrors] = useState<Partial<IFSCFormData>>({});

  const bankNames = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank'];
  const states = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan'];

  const validateForm = (): boolean => {
    const newErrors: Partial<IFSCFormData> = {};

    if (!formData.ifscCode) newErrors.ifscCode = 'IFSC Code is required';
    if (!formData.bankName) newErrors.bankName = 'Bank Name is required';
    if (!formData.bankBranch) newErrors.bankBranch = 'Bank Branch is required';
    if (!formData.state) newErrors.state = 'State is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof IFSCFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          🏦 IFSC Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              IFSC Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.ifscCode}
              onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.ifscCode ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter IFSC code"
            />
            {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.bankName ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Bank</option>
              {bankNames.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
            {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bank Branch <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.bankBranch}
              onChange={(e) => handleChange('bankBranch', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.bankBranch ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter bank branch"
            />
            {errors.bankBranch && <p className="text-red-500 text-xs mt-1">{errors.bankBranch}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.state ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter city"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => handleChange('mobileNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter mobile number"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bank Address
            </label>
            <textarea
              value={formData.bankAddress}
              onChange={(e) => handleChange('bankAddress', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter bank address"
            />
          </div>
        </div>
      </div>

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
          Save IFSC
        </button>
      </div>
    </form>
  );
};

export const IFSC: React.FC = () => {
  const { hasPermission } = useAuth();
  const [ifscCodes, setIfscCodes] = useState<IFSCCode[]>([]);
  const [filteredIfscCodes, setFilteredIfscCodes] = useState<IFSCCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIfsc, setEditingIfsc] = useState<IFSCCode | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Sample data
  const sampleIfscCodes: IFSCCode[] = [
    {
      id: '1',
      ifscCode: 'SBIN0000001',
      bankName: 'State Bank of India',
      bankBranch: 'Connaught Place',
      branchAddress: 'Connaught Place, New Delhi',
      city: 'New Delhi',
      state: 'Delhi',
      mobileNumber: '+91 9876543210',
      insertedOn: '2024-01-15',
      insertedBy: 'Admin User'
    },
    {
      id: '2',
      ifscCode: 'HDFC0000001',
      bankName: 'HDFC Bank',
      bankBranch: 'Karol Bagh',
      branchAddress: 'Karol Bagh, New Delhi',
      city: 'New Delhi',
      state: 'Delhi',
      mobileNumber: '+91 9876543211',
      insertedOn: '2024-01-12',
      insertedBy: 'Manager User'
    }
  ];

  const bankNames = Array.from(new Set(sampleIfscCodes.map(i => i.bankName)));

  useEffect(() => {
    loadIfscCodes();
  }, []);

  const loadIfscCodes = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setIfscCodes(sampleIfscCodes);
        setFilteredIfscCodes(sampleIfscCodes);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load IFSC codes');
      setLoading(false);
    }
  };

  const handleFilter = (filters: IFSCFilterOptions) => {
    let filtered = ifscCodes;

    if (filters.ifscCode) {
      filtered = filtered.filter(i => i.ifscCode.toLowerCase().includes(filters.ifscCode!.toLowerCase()));
    }
    if (filters.bankName) {
      filtered = filtered.filter(i => i.bankName === filters.bankName);
    }

    setFilteredIfscCodes(filtered);
  };

  const handleDownload = () => {
    const headers = ['IFSC Code', 'Bank Name', 'Bank Branch', 'Branch Address', 'City', 'State', 'Mobile Number'];
    const csvContent = [
      headers.join(','),
      ...filteredIfscCodes.map(i => [
        i.ifscCode, i.bankName, i.bankBranch, i.branchAddress, i.city, i.state, i.mobileNumber || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ifsc_codes_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setSuccess('CSV exported successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const columns = [
    {
      key: 'actions',
      label: 'Action',
      render: (value: any, row: IFSCCode) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard module="loan" permission="write">
            <button
              onClick={() => setEditingIfsc(row)}
              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors duration-200"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard module="loan" permission="delete">
            <button
              onClick={() => {}}
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
      key: 'ifscCode',
      label: 'IFSC Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'bankName',
      label: 'Bank Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'bankBranch',
      label: 'Bank Branch',
      sortable: true,
    },
    {
      key: 'branchAddress',
      label: 'Branch Address',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate max-w-48" title={value}>{value}</span>
        </div>
      )
    },
    {
      key: 'city',
      label: 'City',
      sortable: true,
    },
    {
      key: 'state',
      label: 'State',
      sortable: true,
    },
    {
      key: 'mobileNumber',
      label: 'Mobile Number',
      render: (value?: string) => value ? (
        <div className="flex items-center space-x-1">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ) : '-'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading IFSC codes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">IFSC</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage IFSC codes and bank branch information</p>
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
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">IFSC Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredIfscCodes.length} records found
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <IFSCFilterDropdown
                onFilter={handleFilter}
                bankNames={bankNames}
              />
              
              <PermissionGuard module="loan" permission="read">
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </PermissionGuard>
              
              <PermissionGuard module="loan" permission="write">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </PermissionGuard>
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
              {filteredIfscCodes.map((ifsc, index) => (
                <tr
                  key={ifsc.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {column.render ? column.render(ifsc[column.key as keyof IFSCCode], ifsc) : ifsc[column.key as keyof IFSCCode]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New IFSC Code"
        size="lg"
      >
        <IFSCForm
          onSubmit={() => {}}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingIfsc}
        onClose={() => setEditingIfsc(null)}
        title="Edit IFSC Code"
        size="lg"
      >
        {editingIfsc && (
          <IFSCForm
            onSubmit={() => {}}
            onCancel={() => setEditingIfsc(null)}
            initialData={editingIfsc}
          />
        )}
      </Modal>
    </div>
  );
};