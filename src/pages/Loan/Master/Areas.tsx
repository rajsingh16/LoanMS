import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { AreaFilterDropdown } from '../../../components/Common/AreaFilterDropdown';
import { AreaForm } from '../../../components/Forms/AreaForm';
import { CSVUpload } from '../../../components/Common/CSVUpload';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { DataTable } from '../../../components/Common/DataTable';
import { LoanArea, AreaFormData, AreaFilterOptions } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { areaService } from '../../../services/areaService';
import { 
  Building, 
  MapPin, 
  Users, 
  Calendar, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle,
  Upload,
  Download,
  AlertCircle,
  Loader,
  Star,
  DollarSign,
  Shield,
  Clock,
  FileDown
} from 'lucide-react';

export const Areas: React.FC = () => {
  const { hasPermission } = useAuth();
  const [areas, setAreas] = useState<LoanArea[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<LoanArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState<LoanArea | null>(null);
  const [editingArea, setEditingArea] = useState<LoanArea | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const areaTypes = Array.from(new Set(areas.map(a => a.areaType)));
  const areaCodes = Array.from(new Set(areas.map(a => a.areaCode)));
  const parentAreaCodes = Array.from(new Set(areas.map(a => a.parentArea).filter(Boolean)));

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      setLoading(true);
      const data = await areaService.getAllAreas();
      setAreas(data);
      setFilteredAreas(data);
    } catch (err) {
      setError('Failed to load areas');
      console.error('Error loading areas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters: AreaFilterOptions) => {
    let filtered = areas;

    if (filters.areaType) {
      filtered = filtered.filter(area => area.areaType === filters.areaType);
    }
    if (filters.areaCode) {
      filtered = filtered.filter(area => area.areaCode === filters.areaCode);
    }
    if (filters.parentAreaCode) {
      filtered = filtered.filter(area => area.parentArea === filters.parentAreaCode);
    }

    setFilteredAreas(filtered);
  };

  const handleAddArea = async (formData: AreaFormData) => {
    try {
      setIsSubmitting(true);
      const newArea = await areaService.createArea(formData);
      setAreas(prev => [...prev, newArea]);
      setFilteredAreas(prev => [...prev, newArea]);
      setShowAddModal(false);
      setSuccess('Area created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create area');
      console.error('Error creating area:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditArea = (area: LoanArea) => {
    setEditingArea(area);
  };

  const handleUpdateArea = async (formData: AreaFormData) => {
    if (!editingArea) return;

    try {
      setIsSubmitting(true);
      const updatedArea = await areaService.updateArea(editingArea.id, formData);
      setAreas(prev => prev.map(a => a.id === editingArea.id ? updatedArea : a));
      setFilteredAreas(prev => prev.map(a => a.id === editingArea.id ? updatedArea : a));
      setEditingArea(null);
      setSuccess('Area updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update area');
      console.error('Error updating area:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteArea = async (areaId: string) => {
    if (!window.confirm('Are you sure you want to delete this area?')) return;

    try {
      await areaService.deleteArea(areaId);
      setAreas(prev => prev.filter(a => a.id !== areaId));
      setFilteredAreas(prev => prev.filter(a => a.id !== areaId));
      setSuccess('Area deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete area');
      console.error('Error deleting area:', err);
    }
  };

  const handleCSVUpload = async (file: File) => {
    try {
      const result = await areaService.uploadAreasCSV(file);
      
      if (result.success) {
        await loadAreas();
        setShowCSVModal(false);
        setSuccess(`CSV upload completed! ${result.created} created, ${result.updated} updated, ${result.errors} errors.`);
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
      await areaService.exportAreasCSV(filteredAreas);
      setSuccess('CSV exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export CSV');
      console.error('Error exporting CSV:', err);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await areaService.downloadTemplate();
      setSuccess('Template downloaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to download template');
      console.error('Error downloading template:', err);
    }
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
      render: (value: any, row: LoanArea) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard module="loan" permission="write">
            <button
              onClick={() => handleEditArea(row)}
              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors duration-200"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard module="loan" permission="delete">
            <button
              onClick={() => handleDeleteArea(row.id)}
              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors duration-200"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </PermissionGuard>
        </div>
      )
    },
    {
      key: 'areaType',
      label: 'Area Type',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
          {value}
        </span>
      )
    },
    {
      key: 'areaCode',
      label: 'Area Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'areaName',
      label: 'Area Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'parentArea',
      label: 'Parent Area',
      sortable: true,
    },
    {
      key: 'openingDate',
      label: 'Opening Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'closingDate',
      label: 'Closing Date',
      render: (value?: string) => value ? new Date(value).toLocaleDateString() : '-'
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
              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
          }`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        </div>
      )
    },
    {
      key: 'address1',
      label: 'Address 1',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate max-w-32" title={value}>{value}</span>
        </div>
      )
    },
    {
      key: 'address2',
      label: 'Address 2',
      render: (value?: string) => value || '-'
    },
    {
      key: 'district',
      label: 'District',
      sortable: true,
    },
    {
      key: 'pincode',
      label: 'Pincode',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'latitude',
      label: 'Latitude',
      render: (value?: number) => value ? value.toFixed(6) : '-'
    },
    {
      key: 'longitude',
      label: 'Longitude',
      render: (value?: number) => value ? value.toFixed(6) : '-'
    },
    {
      key: 'phoneNumber',
      label: 'Phone Number',
      render: (value?: string) => value ? (
        <div className="flex items-center space-x-1">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ) : '-'
    },
    {
      key: 'emailId',
      label: 'Email ID',
      render: (value?: string) => value ? (
        <div className="flex items-center space-x-1">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="truncate max-w-32" title={value}>{value}</span>
        </div>
      ) : '-'
    },
    {
      key: 'managerId',
      label: 'Manager ID',
      render: (value?: string) => value || '-'
    },
    {
      key: 'mandatoryDocument',
      label: 'Mandatory Document',
      render: (value?: string) => value || '-'
    },
    {
      key: 'crossSellAllowed',
      label: 'Cross Sell Allowed',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (value?: string) => value ? (
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="font-medium">{value}</span>
        </div>
      ) : '-'
    },
    {
      key: 'minCenterClients',
      label: 'Min Center Clients',
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'maxCenterClients',
      label: 'Max Center Clients',
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'lastDayCloseDate',
      label: 'Last Day Close Date',
      render: (value?: string) => value ? (
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'disbOnMeetingDate',
      label: 'Disb On Meeting Date',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'businessPartner',
      label: 'Business Partner',
      sortable: true,
    },
    {
      key: 'bcBranchId',
      label: 'BC Branch ID',
      render: (value?: string) => value || '-'
    },
    {
      key: 'isDisbActive',
      label: 'Is Disb Active',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'isCashDisbActive',
      label: 'Is Cash Disb Active',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'isSubProductEnabled',
      label: 'Is Sub Product Enabled',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'isClientSourcingEnabled',
      label: 'Is Client Sourcing Enabled',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'isCenterFormationEnabled',
      label: 'Is Center Formation Enabled',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'cashlessDisbPartner',
      label: 'Cashless Disb Partner',
      render: (value?: string) => value || '-'
    },
    {
      key: 'nachPartner',
      label: 'Nach Partner',
      render: (value?: string) => value || '-'
    },
    {
      key: 'insertedOn',
      label: 'Inserted On',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'insertedBy',
      label: 'Inserted By',
      sortable: true,
    },
    {
      key: 'updatedOn',
      label: 'Updated On',
      render: (value?: string) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'updatedBy',
      label: 'Updated By',
      render: (value?: string) => value || '-'
    }
  ];

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const filterComponent = (
    <div className="flex items-center space-x-3">
      <AreaFilterDropdown
        onFilter={handleFilter}
        areaTypes={areaTypes}
        areaCodes={areaCodes}
        parentAreaCodes={parentAreaCodes}
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Areas</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage loan areas and their configurations</p>
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
        data={filteredAreas}
        title="Area Management"
        loading={loading}
        onAdd={handleAddClick}
        filterComponent={filterComponent}
      />

      {/* Add Area Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Area"
        size="xl"
      >
        <AreaForm
          onSubmit={handleAddArea}
          onCancel={() => setShowAddModal(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Edit Area Modal */}
      <Modal
        isOpen={!!editingArea}
        onClose={() => setEditingArea(null)}
        title="Edit Area"
        size="xl"
      >
        {editingArea && (
          <AreaForm
            onSubmit={handleUpdateArea}
            onCancel={() => setEditingArea(null)}
            initialData={{
              areaType: editingArea.areaType,
              parentAreaCode: editingArea.parentArea,
              areaName: editingArea.areaName,
              branchManagerId: editingArea.managerId,
              address1: editingArea.address1,
              address2: editingArea.address2,
              phoneNumber: editingArea.phoneNumber,
              emailId: editingArea.emailId,
              pincode: editingArea.pincode,
              district: editingArea.district,
              state: 'Delhi', // Default state
              mandatoryDocument: editingArea.mandatoryDocument,
              branchRating: editingArea.rating,
              minCenterClients: editingArea.minCenterClients,
              maxCenterClients: editingArea.maxCenterClients,
              bcBranchId: editingArea.bcBranchId,
              businessPartner: editingArea.businessPartner,
              cashlessDisbPartner: editingArea.cashlessDisbPartner,
              nachPartner: editingArea.nachPartner,
              branchOpeningDate: editingArea.openingDate,
              disbOnMeetingDate: editingArea.disbOnMeetingDate,
              crossSellAllowed: editingArea.crossSellAllowed,
              isDisbActive: editingArea.isDisbActive,
              isCashDisbActive: editingArea.isCashDisbActive,
              isSubProductEnabled: editingArea.isSubProductEnabled,
              isClientSourcingEnabled: editingArea.isClientSourcingEnabled,
              isCenterFormationEnabled: editingArea.isCenterFormationEnabled,
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      {/* CSV Upload Modal */}
      <Modal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        title="Upload Areas CSV"
        size="lg"
      >
        <CSVUpload
          onUpload={handleCSVUpload}
          onCancel={() => setShowCSVModal(false)}
          templateColumns={[
            'areaType',
            'parentAreaCode',
            'areaName',
            'branchManagerId',
            'address1',
            'address2',
            'phoneNumber',
            'emailId',
            'pincode',
            'district',
            'state',
            'mandatoryDocument',
            'branchRating',
            'minCenterClients',
            'maxCenterClients',
            'bcBranchId',
            'businessPartner',
            'cashlessDisbPartner',
            'nachPartner',
            'branchOpeningDate',
            'disbOnMeetingDate',
            'crossSellAllowed',
            'isDisbActive',
            'isCashDisbActive',
            'isSubProductEnabled',
            'isClientSourcingEnabled',
            'isCenterFormationEnabled'
          ]}
          entityName="areas"
        />
      </Modal>
    </div>
  );
};