import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { useAuth } from '../../../hooks/useAuth';
import { 
  Target, 
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
  Search
} from 'lucide-react';

interface Purpose {
  id: string;
  purposeId: string;
  purposeCode: string;
  purposeName: string;
  mainPurposeId?: string;
  isMainPurpose: boolean;
  status: 'active' | 'inactive';
  insertedOn: string;
  insertedBy: string;
  updatedOn?: string;
  updatedBy?: string;
}

interface PurposeFormData {
  purposeCode: string;
  purposeName: string;
  mainPurposeId?: string;
}

interface PurposeFilterOptions {
  purpose?: string;
  subPurpose?: string;
}

const PurposeFilterDropdown: React.FC<{
  onFilter: (filters: PurposeFilterOptions) => void;
  purposes: string[];
  subPurposes: string[];
}> = ({ onFilter, purposes, subPurposes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<PurposeFilterOptions>({});

  const handleFilterChange = (key: keyof PurposeFilterOptions, value: string) => {
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
                Purpose <span className="text-red-500">*</span>
              </label>
              <select
                value={filters.purpose || ''}
                onChange={(e) => handleFilterChange('purpose', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Purposes</option>
                {purposes.map(purpose => (
                  <option key={purpose} value={purpose}>{purpose}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sub Purpose <span className="text-red-500">*</span>
              </label>
              <select
                value={filters.subPurpose || ''}
                onChange={(e) => handleFilterChange('subPurpose', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Sub Purposes</option>
                {subPurposes.map(subPurpose => (
                  <option key={subPurpose} value={subPurpose}>{subPurpose}</option>
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

const PurposeForm: React.FC<{
  onSubmit: (data: PurposeFormData) => void;
  onCancel: () => void;
  initialData?: Partial<PurposeFormData>;
  mainPurposes: Purpose[];
}> = ({ onSubmit, onCancel, initialData = {}, mainPurposes }) => {
  const [formData, setFormData] = useState<PurposeFormData>({
    purposeCode: initialData.purposeCode || '',
    purposeName: initialData.purposeName || '',
    mainPurposeId: initialData.mainPurposeId || '',
  });

  const [errors, setErrors] = useState<Partial<PurposeFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<PurposeFormData> = {};

    if (!formData.purposeCode) newErrors.purposeCode = 'Purpose Code is required';
    if (!formData.purposeName) newErrors.purposeName = 'Purpose Name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof PurposeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          🎯 Purpose Information
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Purpose Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.purposeCode}
              onChange={(e) => handleChange('purposeCode', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.purposeCode ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter purpose code"
            />
            {errors.purposeCode && <p className="text-red-500 text-xs mt-1">{errors.purposeCode}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Purpose Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.purposeName}
              onChange={(e) => handleChange('purposeName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.purposeName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter purpose name"
            />
            {errors.purposeName && <p className="text-red-500 text-xs mt-1">{errors.purposeName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Main Purpose ID
            </label>
            <select
              value={formData.mainPurposeId}
              onChange={(e) => handleChange('mainPurposeId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Main Purpose</option>
              {mainPurposes.map(purpose => (
                <option key={purpose.id} value={purpose.id}>{purpose.purposeName}</option>
              ))}
            </select>
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
          Save Purpose
        </button>
      </div>
    </form>
  );
};

export const Purpose: React.FC = () => {
  const { hasPermission } = useAuth();
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [filteredPurposes, setFilteredPurposes] = useState<Purpose[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPurpose, setEditingPurpose] = useState<Purpose | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Sample data
  const samplePurposes: Purpose[] = [
    {
      id: '1',
      purposeId: 'PUR001',
      purposeCode: 'BUS',
      purposeName: 'Business',
      isMainPurpose: true,
      status: 'active',
      insertedOn: '2024-01-15',
      insertedBy: 'Admin User'
    },
    {
      id: '2',
      purposeId: 'PUR002',
      purposeCode: 'SB',
      purposeName: 'Small Business',
      mainPurposeId: '1',
      isMainPurpose: false,
      status: 'active',
      insertedOn: '2024-01-15',
      insertedBy: 'Admin User'
    },
    {
      id: '3',
      purposeId: 'PUR003',
      purposeCode: 'AGR',
      purposeName: 'Agriculture',
      isMainPurpose: true,
      status: 'active',
      insertedOn: '2024-01-12',
      insertedBy: 'Manager User'
    },
    {
      id: '4',
      purposeId: 'PUR004',
      purposeCode: 'EDU',
      purposeName: 'Education',
      isMainPurpose: true,
      status: 'active',
      insertedOn: '2024-01-10',
      insertedBy: 'Admin User'
    }
  ];

  const mainPurposes = samplePurposes.filter(p => p.isMainPurpose);
  const subPurposes = samplePurposes.filter(p => !p.isMainPurpose);
  const purposeNames = Array.from(new Set(samplePurposes.map(p => p.purposeName)));
  const subPurposeNames = Array.from(new Set(subPurposes.map(p => p.purposeName)));

  useEffect(() => {
    loadPurposes();
  }, []);

  const loadPurposes = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setPurposes(samplePurposes);
        setFilteredPurposes(samplePurposes);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load purposes');
      setLoading(false);
    }
  };

  const handleFilter = (filters: PurposeFilterOptions) => {
    let filtered = purposes;

    if (filters.purpose) {
      filtered = filtered.filter(p => p.purposeName === filters.purpose);
    }
    if (filters.subPurpose) {
      filtered = filtered.filter(p => p.purposeName === filters.subPurpose);
    }

    setFilteredPurposes(filtered);
  };

  const handleDownload = () => {
    const headers = ['Purpose ID', 'Purpose Code', 'Purpose Name', 'Main Purpose ID', 'Is Main Purpose', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredPurposes.map(p => [
        p.purposeId, p.purposeCode, p.purposeName, p.mainPurposeId || '', 
        p.isMainPurpose ? 'Yes' : 'No', p.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purposes_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setSuccess('CSV exported successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getBooleanIcon = (value: boolean) => {
    return value ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-gray-400" />
    );
  };

  const columns = [
    {
      key: 'actions',
      label: 'Action',
      render: (value: any, row: Purpose) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard module="loan" permission="write">
            <button
              onClick={() => setEditingPurpose(row)}
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
      key: 'purposeId',
      label: 'Purpose ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'purposeCode',
      label: 'Purpose Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'purposeName',
      label: 'Purpose Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'mainPurposeId',
      label: 'Main Purpose ID',
      render: (value?: string) => value || '-'
    },
    {
      key: 'isMainPurpose',
      label: 'Is Main Purpose',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
            value === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading purposes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Purpose</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage loan purposes and categories</p>
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Purpose Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredPurposes.length} records found
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <PurposeFilterDropdown
                onFilter={handleFilter}
                purposes={purposeNames}
                subPurposes={subPurposeNames}
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
              {filteredPurposes.map((purpose, index) => (
                <tr
                  key={purpose.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {column.render ? column.render(purpose[column.key as keyof Purpose], purpose) : purpose[column.key as keyof Purpose]}
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
        title="Add New Purpose"
        size="md"
      >
        <PurposeForm
          onSubmit={() => {}}
          onCancel={() => setShowAddModal(false)}
          mainPurposes={mainPurposes}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingPurpose}
        onClose={() => setEditingPurpose(null)}
        title="Edit Purpose"
        size="md"
      >
        {editingPurpose && (
          <PurposeForm
            onSubmit={() => {}}
            onCancel={() => setEditingPurpose(null)}
            initialData={editingPurpose}
            mainPurposes={mainPurposes}
          />
        )}
      </Modal>
    </div>
  );
};