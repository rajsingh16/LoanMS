import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { CenterFilterDropdown } from '../../../components/Common/CenterFilterDropdown';
import { CenterForm } from '../../../components/Forms/CenterForm';
import { CSVUpload } from '../../../components/Common/CSVUpload';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { DataTable } from '../../../components/Common/DataTable';
import { Center, CenterFormData, CenterFilterOptions } from '../../../types/center';
import { useAuth } from '../../../hooks/useAuth';
import { centerService } from '../../../services/centerService';
import { apiFetch, db } from '../../../lib/api';
import {
  Building,
  Users,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  AlertCircle,
  FileDown,
} from 'lucide-react';

export const Centers: React.FC = () => {
  const { hasPermission } = useAuth();
  const [centers, setCenters] = useState<Center[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [editingCenter, setEditingCenter] = useState<Center | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data for dropdowns
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [fieldOfficers, setFieldOfficers] = useState<{ id: string; name: string }[]>([]);
  const [villages, setVillages] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadCenters();
    loadDropdownData();
  }, []);

  const loadCenters = async () => {
    try {
      setLoading(true);
      const data = await centerService.getAllCenters();
      setCenters(data);
      setFilteredCenters(data);
    } catch (err) {
      setError('Failed to load centers');
      console.error('Error loading centers:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      // Load branches
      const { data: branchData } = await db.getBranches();
      if (branchData) {
        setBranches(
          branchData.map((branch: { id: string; branch_name: string }) => ({
            id: branch.id,
            name: branch.branch_name,
          }))
        );
      }

      // Load field officers (users with field_officer role)
      const foRes = await apiFetch('/api/users/by-role/field_officer');
      const foJson = await foRes.json();
      if (foJson.data) {
        setFieldOfficers(
          foJson.data.map((user: { id: string; first_name: string; last_name: string }) => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
          }))
        );
      }

      // Load villages
      const villageRes = await fetch('/api/villages');
      const villageJson = await villageRes.json();
      if (villageJson.data) {
        setVillages(
          villageJson.data.map((v: { id: string; name: string }) => ({
            id: v.id,
            name: v.name,
          }))
        );
      }
    } catch (err) {
      console.error('Error loading dropdown data:', err);
    }
  };

  const handleFilter = (filters: CenterFilterOptions) => {
    let filtered = centers;

    if (filters.branch) {
      filtered = filtered.filter(center => center.branchId === filters.branch);
    }
    if (filters.center) {
      filtered = filtered.filter(
        center =>
          center.centerName.toLowerCase().includes(filters.center!.toLowerCase()) ||
          center.centerCode.toLowerCase().includes(filters.center!.toLowerCase())
      );
    }
    if (filters.status) {
      filtered = filtered.filter(center => center.status === filters.status);
    }
    if (filters.assignedTo) {
      filtered = filtered.filter(center => center.assignedTo === filters.assignedTo);
    }
    if (filters.createdOn) {
      filtered = filtered.filter(center => center.createdAt === filters.createdOn);
    }

    setFilteredCenters(filtered);
  };

  const handleAddCenter = async (formData: CenterFormData) => {
    try {
      setIsSubmitting(true);
      const newCenter = await centerService.createCenter(formData);
      setCenters(prev => [...prev, newCenter]);
      setFilteredCenters(prev => [...prev, newCenter]);
      setShowAddModal(false);
      setSuccess('Center created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create center');
      console.error('Error creating center:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCenter = (center: Center) => {
    setEditingCenter(center);
  };

  const handleUpdateCenter = async (formData: CenterFormData) => {
    if (!editingCenter) return;

    try {
      setIsSubmitting(true);
      const updatedCenter = await centerService.updateCenter(editingCenter.id, formData);
      setCenters(prev => prev.map(c => (c.id === editingCenter.id ? updatedCenter : c)));
      setFilteredCenters(prev => prev.map(c => (c.id === editingCenter.id ? updatedCenter : c)));
      setEditingCenter(null);
      setSuccess('Center updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update center');
      console.error('Error updating center:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCenter = async (centerId: string) => {
    if (!window.confirm('Are you sure you want to delete this center?')) return;

    try {
      await centerService.deleteCenter(centerId);
      setCenters(prev => prev.filter(c => c.id !== centerId));
      setFilteredCenters(prev => prev.filter(c => c.id !== centerId));
      setSuccess('Center deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete center');
      console.error('Error deleting center:', err);
    }
  };

  const handleCSVUpload = async (file: File) => {
    try {
      const result = await centerService.uploadCentersCSV(file);
      if (result.success) {
        await loadCenters();
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
      await centerService.exportCentersCSV(filteredCenters);
      setSuccess('CSV exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export CSV');
      console.error('Error exporting CSV:', err);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await centerService.downloadTemplate();
      setSuccess('Template downloaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to download template');
      console.error('Error downloading template:', err);
    }
  };

  const getStatusIcon = (status: string) =>
    status === 'active' ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );

  const getBooleanIcon = (value: boolean) =>
    value ? (
      <CheckCircle className="w-4 h-4 text-red-600" />
    ) : (
      <XCircle className="w-4 h-4 text-gray-400" />
    );

  const columns = [
    {
      key: 'actions',
      label: 'Action',
      render: (_value: unknown, row: Center) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard module="loan" permission="write">
            <button
              onClick={() => handleEditCenter(row)}
              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors duration-200"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard module="loan" permission="delete">
            <button
              onClick={() => handleDeleteCenter(row.id)}
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
      key: 'branchName',
      label: 'Branch',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'centerCode',
      label: 'Center Code',
      sortable: true,
      render: (value: string) => <span className="font-mono font-medium">{value}</span>,
    },
    {
      key: 'centerName',
      label: 'Center Name',
      sortable: true,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'centerDay',
      label: 'Center Day',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'centerTime',
      label: 'Center Time',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <span
            className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
              value === 'active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
            }`}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        </div>
      ),
    },
    {
      key: 'blacklisted',
      label: 'Blacklisted',
      render: (value: boolean) => getBooleanIcon(value),
    },
    {
      key: 'assignedToName',
      label: 'Assigned To',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'bcCenterId',
      label: 'BC Center ID',
      render: (value?: string) => value || '-',
    },
    {
      key: 'parentCenterId',
      label: 'Parent Center ID',
      render: (value?: string) => value || '-',
    },
    {
      key: 'contactPersonName',
      label: 'Contact Person Name',
      render: (value?: string) => value || '-',
    },
    {
      key: 'contactPersonNumber',
      label: 'Contact Person Number',
      render: (value?: string) =>
        value ? (
          <div className="flex items-center space-x-1">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{value}</span>
          </div>
        ) : (
          '-'
        ),
    },
    {
      key: 'address1',
      label: 'Address 1',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate max-w-32" title={value}>
            {value}
          </span>
        </div>
      ),
    },
    {
      key: 'address2',
      label: 'Address 2',
      render: (value?: string) => value || '-',
    },
    {
      key: 'landmark',
      label: 'Landmark',
      render: (value?: string) => value || '-',
    },
    {
      key: 'pincode',
      label: 'Pincode',
      render: (value?: string) => value || '-',
    },
    {
      key: 'villageName',
      label: 'Village',
      sortable: true,
    },
    {
      key: 'city',
      label: 'City',
      render: (value?: string) => value || '-',
    },
    {
      key: 'meetingPlace',
      label: 'Meeting Place',
      render: (value?: string) => value || '-',
    },
    {
      key: 'latitude',
      label: 'Latitude',
      render: (value?: number) => (value ? value.toFixed(6) : '-'),
    },
    {
      key: 'longitude',
      label: 'Longitude',
      render: (value?: number) => (value ? value.toFixed(6) : '-'),
    },
    {
      key: 'createdBy',
      label: 'Created By',
      sortable: true,
    },
    {
      key: 'createdAt',
      label: 'Created On',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ),
    },
  ];

  const filterComponent = (
    <div className="flex items-center space-x-3">
      <CenterFilterDropdown
        onFilter={handleFilter}
        branches={branches}
        fieldOfficers={fieldOfficers}
      />

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Centers</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage center information and configurations
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
        data={filteredCenters}
        title="Center Management"
        loading={loading}
        onAdd={() => setShowAddModal(true)}
        filterComponent={filterComponent}
      />

      {/* Add Center Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Center"
        size="xl"
      >
        <CenterForm
          onSubmit={handleAddCenter}
          onCancel={() => setShowAddModal(false)}
          isSubmitting={isSubmitting}
          branches={branches}
          fieldOfficers={fieldOfficers}
          villages={villages}
        />
      </Modal>

      {/* Edit Center Modal */}
      <Modal
        isOpen={!!editingCenter}
        onClose={() => setEditingCenter(null)}
        title="Edit Center"
        size="xl"
      >
        {editingCenter && (
          <CenterForm
            onSubmit={handleUpdateCenter}
            onCancel={() => setEditingCenter(null)}
            initialData={{
              branchId: editingCenter.branchId,
              centerName: editingCenter.centerName,
              centerDay: editingCenter.centerDay,
              centerTime: editingCenter.centerTime,
              assignedTo: editingCenter.assignedTo,
              contactPersonName: editingCenter.contactPersonName,
              contactPersonNumber: editingCenter.contactPersonNumber,
              address1: editingCenter.address1,
              address2: editingCenter.address2,
              landmark: editingCenter.landmark,
              villageId: editingCenter.villageId,
              pincode: editingCenter.pincode,
              city: editingCenter.city,
              meetingPlace: editingCenter.meetingPlace,
              latitude: editingCenter.latitude,
              longitude: editingCenter.longitude,
              status: editingCenter.status,
              blacklisted: editingCenter.blacklisted,
              bcCenterId: editingCenter.bcCenterId,
              parentCenterId: editingCenter.parentCenterId,
            }}
            isSubmitting={isSubmitting}
            branches={branches}
            fieldOfficers={fieldOfficers}
            villages={villages}
          />
        )}
      </Modal>

      {/* CSV Upload Modal */}
      <Modal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        title="Upload Centers CSV"
        size="lg"
      >
        <CSVUpload
          onUpload={handleCSVUpload}
          onCancel={() => setShowCSVModal(false)}
          templateColumns={[
            'branchId',
            'centerName',
            'centerDay',
            'centerTime',
            'assignedTo',
            'contactPersonName',
            'contactPersonNumber',
            'address1',
            'address2',
            'landmark',
            'villageId',
            'pincode',
            'city',
            'meetingPlace',
            'latitude',
            'longitude',
            'status',
            'blacklisted',
            'bcCenterId',
            'parentCenterId',
          ]}
          entityName="centers"
        />
      </Modal>
    </div>
  );
};