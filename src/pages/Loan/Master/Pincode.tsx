import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { useAuth } from '../../../hooks/useAuth';
import { 
  MapPin, 
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

interface Pincode {
  id: string;
  pincode: string;
  state: string;
  district: string;
  status: 'active' | 'inactive';
  insertedOn: string;
  insertedBy: string;
  updatedOn?: string;
  updatedBy?: string;
}

interface PincodeFormData {
  pincode: string;
  status: 'active' | 'inactive';
  district: string;
}

interface PincodeFilterOptions {
  pincode?: string;
  status?: string;
  district?: string;
}

const PincodeFilterDropdown: React.FC<{
  onFilter: (filters: PincodeFilterOptions) => void;
  districts: string[];
}> = ({ onFilter, districts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<PincodeFilterOptions>({});

  const handleFilterChange = (key: keyof PincodeFilterOptions, value: string) => {
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
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={filters.pincode || ''}
                onChange={(e) => handleFilterChange('pincode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter pincode"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <select
                value={filters.district || ''}
                onChange={(e) => handleFilterChange('district', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Districts</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
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

const PincodeForm: React.FC<{
  onSubmit: (data: PincodeFormData) => void;
  onCancel: () => void;
  initialData?: Partial<PincodeFormData>;
}> = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState<PincodeFormData>({
    pincode: initialData.pincode || '',
    status: initialData.status || 'active',
    district: initialData.district || '',
  });

  const [errors, setErrors] = useState<Partial<PincodeFormData>>({});

  const districts = ['Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'];

  const validateForm = (): boolean => {
    const newErrors: Partial<PincodeFormData> = {};

    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.district) newErrors.district = 'District is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof PincodeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          📍 Pincode Information
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => handleChange('pincode', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.pincode ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter pincode"
            />
            {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as 'active' | 'inactive')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.status ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              District <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.district}
              onChange={(e) => handleChange('district', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.district ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select District</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
            {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
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
          Save Pincode
        </button>
      </div>
    </form>
  );
};

export const Pincode: React.FC = () => {
  const { hasPermission } = useAuth();
  const [pincodes, setPincodes] = useState<Pincode[]>([]);
  const [filteredPincodes, setFilteredPincodes] = useState<Pincode[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPincode, setEditingPincode] = useState<Pincode | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Sample data
  const samplePincodes: Pincode[] = [
    {
      id: '1',
      pincode: '110001',
      state: 'Delhi',
      district: 'Central Delhi',
      status: 'active',
      insertedOn: '2024-01-15',
      insertedBy: 'Admin User'
    },
    {
      id: '2',
      pincode: '110002',
      state: 'Delhi',
      district: 'North Delhi',
      status: 'active',
      insertedOn: '2024-01-12',
      insertedBy: 'Manager User'
    }
  ];

  const districts = Array.from(new Set(samplePincodes.map(p => p.district)));

  useEffect(() => {
    loadPincodes();
  }, []);

  const loadPincodes = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setPincodes(samplePincodes);
        setFilteredPincodes(samplePincodes);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load pincodes');
      setLoading(false);
    }
  };

  const handleFilter = (filters: PincodeFilterOptions) => {
    let filtered = pincodes;

    if (filters.pincode) {
      filtered = filtered.filter(p => p.pincode.includes(filters.pincode!));
    }
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters.district) {
      filtered = filtered.filter(p => p.district === filters.district);
    }

    setFilteredPincodes(filtered);
  };

  const handleDownload = () => {
    const headers = ['Pincode', 'State', 'District', 'Status', 'Inserted On', 'Inserted By'];
    const csvContent = [
      headers.join(','),
      ...filteredPincodes.map(p => [p.pincode, p.state, p.district, p.status, p.insertedOn, p.insertedBy].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pincodes_export_${new Date().toISOString().split('T')[0]}.csv`;
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

  const columns = [
    {
      key: 'actions',
      label: 'Action',
      render: (value: any, row: Pincode) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard module="loan" permission="write">
            <button
              onClick={() => setEditingPincode(row)}
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
      key: 'pincode',
      label: 'Pincode',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="font-mono font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'state',
      label: 'State',
      sortable: true,
    },
    {
      key: 'district',
      label: 'District',
      sortable: true,
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
          <span className="text-gray-600 dark:text-gray-400">Loading pincodes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pincode</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage pincode information and locations</p>
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pincode Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredPincodes.length} records found
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <PincodeFilterDropdown
                onFilter={handleFilter}
                districts={districts}
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
              {filteredPincodes.map((pincode, index) => (
                <tr
                  key={pincode.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {column.render ? column.render(pincode[column.key as keyof Pincode], pincode) : pincode[column.key as keyof Pincode]}
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
        title="Add New Pincode"
        size="md"
      >
        <PincodeForm
          onSubmit={() => {}}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingPincode}
        onClose={() => setEditingPincode(null)}
        title="Edit Pincode"
        size="md"
      >
        {editingPincode && (
          <PincodeForm
            onSubmit={() => {}}
            onCancel={() => setEditingPincode(null)}
            initialData={editingPincode}
          />
        )}
      </Modal>
    </div>
  );
};