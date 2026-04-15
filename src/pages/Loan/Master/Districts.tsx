import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { DistrictFilterDropdown } from '../../../components/Common/DistrictFilterDropdown';
import { DistrictForm } from '../../../components/Forms/DistrictForm';
import { CSVUpload } from '../../../components/Common/CSVUpload';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { DataTable } from '../../../components/Common/DataTable';
import { District, DistrictFilterOptions } from '../../../types/product';
import { districtService, DistrictFormData } from '../../../services/districtService';
import { useAuth } from '../../../hooks/useAuth';
import {
  MapPin,
  Calendar,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  AlertCircle,
  FileDown,
  Building,
} from 'lucide-react';

export const Districts: React.FC = () => {
  const { hasPermission } = useAuth();
  const [districts, setDistricts] = useState<District[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDistricts();
  }, []);

  const loadDistricts = async () => {
    try {
      setLoading(true);
      const data = await districtService.getAllDistricts();
      setDistricts(data);
      setFilteredDistricts(data);
    } catch (err) {
      setError('Failed to load districts');
      console.error('Error loading districts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters: DistrictFilterOptions) => {
    let filtered = districts;

    if (filters.status) {
      filtered = filtered.filter(d => (d as any).status === filters.status);
    }

    setFilteredDistricts(filtered);
  };

  const handleAddDistrict = async (formData: DistrictFormData) => {
    try {
      setIsSubmitting(true);
      const newDistrict = await districtService.createDistrict(formData);
      setDistricts(prev => [...prev, newDistrict]);
      setFilteredDistricts(prev => [...prev, newDistrict]);
      setShowAddModal(false);
      setSuccess('District created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create district');
      console.error('Error creating district:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDistrict = async (formData: DistrictFormData) => {
    if (!editingDistrict) return;

    try {
      setIsSubmitting(true);
      const updatedDistrict = await districtService.updateDistrict(editingDistrict.id, formData);
      setDistricts(prev => prev.map(d => (d.id === editingDistrict.id ? updatedDistrict : d)));
      setFilteredDistricts(prev => prev.map(d => (d.id === editingDistrict.id ? updatedDistrict : d)));
      setEditingDistrict(null);
      setSuccess('District updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update district');
      console.error('Error updating district:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDistrict = async (districtId: string) => {
    if (!window.confirm('Are you sure you want to delete this district?')) return;

    try {
      await districtService.deleteDistrict(districtId);
      setDistricts(prev => prev.filter(d => d.id !== districtId));
      setFilteredDistricts(prev => prev.filter(d => d.id !== districtId));
      setSuccess('District deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete district');
      console.error('Error deleting district:', err);
    }
  };

  const handleCSVUpload = async (file: File) => {
    try {
      const result = await districtService.uploadDistrictsCSV(file);
      if (result.success) {
        await loadDistricts();
        setShowCSVModal(false);
        setSuccess(
          `CSV upload completed! ${result.created} created, ${result.updated} updated, ${result.errors} errors.`
        );
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.message || 'CSV upload failed');
      }
    } catch (err) {
      setError('Failed to upload CSV');
      console.error('Error uploading CSV:', err);
    }
  };

  const handleExportCSV = async () => {
    try {
      await districtService.exportDistrictsCSV(filteredDistricts);
      setSuccess('CSV exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export CSV');
      console.error('Error exporting CSV:', err);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await districtService.downloadTemplate();
      setSuccess('Template downloaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to download template');
      console.error('Error downloading template:', err);
    }
  };

  const columns = [
    {
      key: 'actions',
      label: 'Action',
      render: (_value: unknown, row: District) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard module="loan" permission="write">
            <button
              onClick={() => setEditingDistrict(row)}
              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors duration-200"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard module="loan" permission="delete">
            <button
              onClick={() => handleDeleteDistrict(row.id)}
              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors duration-200"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </PermissionGuard>
        </div>
      ),
    },
    {
      key: 'districtCode',
      label: 'District Code',
      sortable: true,
      render: (value: string) => <span className="font-mono font-medium">{value}</span>,
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
      ),
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
      ),
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
      ),
    },
    {
      key: 'insertedBy',
      label: 'Inserted By',
      sortable: true,
    },
    {
      key: 'updatedOn',
      label: 'Updated On',
      render: (value?: string) =>
        value ? (
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{new Date(value).toLocaleDateString()}</span>
          </div>
        ) : (
          '-'
        ),
    },
    {
      key: 'updatedBy',
      label: 'Updated By',
      render: (value?: string) => value || '-',
    },
  ];

  const filterComponent = (
    <div className="flex items-center space-x-3">
      <DistrictFilterDropdown onFilter={handleFilter} />

      <PermissionGuard module="loan" permission="read">
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
        >
          <FileDown className="w-4 h-4" />
          <span>Template</span>
        </button>
      </PermissionGuard>

      <PermissionGuard module="loan" permission="read">
        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </PermissionGuard>

      <PermissionGuard module="loan" permission="write">
        <button
          onClick={() => setShowCSVModal(true)}
          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
        >
          <Upload className="w-4 h-4" />
          <span>Upload CSV</span>
        </button>
      </PermissionGuard>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Districts</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage district information and locations
        </p>
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
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredDistricts}
        title="District Management"
        loading={loading}
        onAdd={() => setShowAddModal(true)}
        filterComponent={filterComponent}
      />

      {/* Add District Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New District"
        size="md"
      >
        <DistrictForm
          onSubmit={handleAddDistrict}
          onCancel={() => setShowAddModal(false)}
          isSubmitting={isSubmitting}
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
            onSubmit={handleUpdateDistrict}
            onCancel={() => setEditingDistrict(null)}
            initialData={editingDistrict}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      {/* CSV Upload Modal */}
      <Modal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        title="Upload Districts CSV"
        size="lg"
      >
        <CSVUpload
          onUpload={handleCSVUpload}
          onCancel={() => setShowCSVModal(false)}
          templateColumns={['districtCode', 'districtName', 'countryId', 'stateId', 'stateName']}
          entityName="districts"
        />
      </Modal>
    </div>
  );
};