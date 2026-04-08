import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { DistrictFilterDropdown } from '../../../components/Common/DistrictFilterDropdown';
import { DistrictForm } from '../../../components/Forms/DistrictForm';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { District, DistrictFilterOptions } from '../../../types/product';
import { useAuth } from '../../../hooks/useAuth';
import { 
  MapPin, 
  Calendar, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Download, 
  AlertCircle, 
  Loader, 
  Plus,
  Building
} from 'lucide-react';

export const Districts: React.FC = () => {
  const { hasPermission } = useAuth();
  const [districts, setDistricts] = useState<District[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Sample data for demonstration
  const sampleDistricts: District[] = [
    {
      id: '1',
      districtCode: 'DL001',
      districtName: 'Central Delhi',
      countryId: 'IN',
      stateId: 'DL',
      stateName: 'Delhi',
      insertedOn: '2024-01-15',
      insertedBy: 'Admin User'
    },
    {
      id: '2',
      districtCode: 'DL002',
      districtName: 'North Delhi',
      countryId: 'IN',
      stateId: 'DL',
      stateName: 'Delhi',
      insertedOn: '2024-01-12',
      insertedBy: 'Manager User'
    },
    {
      id: '3',
      districtCode: 'DL003',
      districtName: 'South Delhi',
      countryId: 'IN',
      stateId: 'DL',
      stateName: 'Delhi',
      insertedOn: '2024-01-10',
      insertedBy: 'Admin User'
    },
    {
      id: '4',
      districtCode: 'MH001',
      districtName: 'Mumbai',
      countryId: 'IN',
      stateId: 'MH',
      stateName: 'Maharashtra',
      insertedOn: '2024-01-08',
      insertedBy: 'Manager User'
    }
  ];

  useEffect(() => {
    loadDistricts();
  }, []);

  const loadDistricts = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setDistricts(sampleDistricts);
        setFilteredDistricts(sampleDistricts);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load districts');
      console.error('Error loading districts:', err);
      setLoading(false);
    }
  };

  const handleFilter = (filters: DistrictFilterOptions) => {
    let filtered = districts;

    if (filters.status) {
      // In real implementation, districts would have status field
      filtered = districts; // No filtering for now as sample data doesn't have status
    }

    setFilteredDistricts(filtered);
  };

  const handleDownload = () => {
    const headers = [
      'District Code', 'District Name', 'State', 'Inserted On', 'Inserted By', 'Updated On', 'Updated By'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredDistricts.map(district => [
        district.districtCode,
        district.districtName,
        district.stateName,
        district.insertedOn,
        district.insertedBy,
        district.updatedOn || '',
        district.updatedBy || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `districts_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setSuccess('CSV exported successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEditDistrict = (district: District) => {
    setEditingDistrict(district);
  };

  const handleDeleteDistrict = async (districtId: string) => {
    if (!window.confirm('Are you sure you want to delete this district?')) return;

    try {
      setDistricts(prev => prev.filter(d => d.id !== districtId));
      setFilteredDistricts(prev => prev.filter(d => d.id !== districtId));
      setSuccess('District deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete district');
      console.error('Error deleting district:', err);
    }
  };

  const columns = [
    {
      key: 'actions',
      label: 'Action',
      render: (value: any, row: District) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard module="loan" permission="write">
            <button
              onClick={() => handleEditDistrict(row)}
              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors duration-200"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard module="loan" permission="delete">
            <button
              onClick={() => handleDeleteDistrict(row.id)}
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
      key: 'districtCode',
      label: 'District Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'districtName',
      label: 'District Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'stateName',
      label: 'State',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'insertedOn',
      label: 'Inserted On',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'insertedBy',
      label: 'Inserted By',
      sortable: true,
    },
    {
      key: 'updatedOn',
      label: 'Updated On',
      render: (value?: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'updatedBy',
      label: 'Updated By',
      render: (value?: string) => value || '-'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading districts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Districts</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage district information and locations</p>
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">District Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredDistricts.length} records found
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <DistrictFilterDropdown onFilter={handleFilter} />
              
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
              {filteredDistricts.map((district, index) => (
                <tr
                  key={district.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {column.render ? column.render(district[column.key as keyof District], district) : district[column.key as keyof District]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add District Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New District"
        size="md"
      >
        <DistrictForm
          onSubmit={() => {}}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit District Modal */}
      <Modal
        isOpen={!!editingDistrict}
        onClose={() => setEditingDistrict(null)}
        title="Edit District"
        size="md"
      >
        {editingDistrict && (
          <DistrictForm
            onSubmit={() => {}}
            onCancel={() => setEditingDistrict(null)}
            initialData={editingDistrict}
          />
        )}
      </Modal>
    </div>
  );
};