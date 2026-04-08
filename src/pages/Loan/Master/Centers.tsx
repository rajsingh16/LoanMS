import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { CenterFilterDropdown } from '../../../components/Common/CenterFilterDropdown';
import { CenterForm } from '../../../components/Forms/CenterForm';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { DataTable } from '../../../components/Common/DataTable';
import { Center, CenterFormData, CenterFilterOptions } from '../../../types/center';
import { useAuth } from '../../../hooks/useAuth';
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
  AlertCircle, 
  Loader, 
  Plus 
} from 'lucide-react';

export const Centers: React.FC = () => {
  const { hasPermission } = useAuth();
  const [centers, setCenters] = useState<Center[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
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
      // Simulate loading centers from database
      // In a real app, this would fetch from the database
      setTimeout(() => {
        const sampleCenters: Center[] = [
          {
            id: '1',
            centerCode: 'CTR001',
            centerName: 'Anand Nagar Center',
            branchId: 'BR001',
            branchName: 'Main Branch',
            centerDay: 'Monday',
            centerTime: '10:00 AM',
            status: 'active',
            blacklisted: false,
            assignedTo: 'USER001',
            assignedToName: 'Amit Kumar',
            bcCenterId: 'BC001',
            parentCenterId: '',
            contactPersonName: 'Rajesh Sharma',
            contactPersonNumber: '+91 9876543210',
            address1: '123 Main Street',
            address2: 'Anand Nagar',
            landmark: 'Opposite Bank',
            pincode: '110001',
            villageId: 'VIL001',
            villageName: 'Anand Nagar',
            city: 'Delhi',
            meetingPlace: 'Community Hall',
            latitude: 28.6139,
            longitude: 77.2090,
            createdBy: 'Admin User',
            createdAt: '2024-01-15',
            memberCount: 25
          },
          {
            id: '2',
            centerCode: 'CTR002',
            centerName: 'Gandhi Colony Center',
            branchId: 'BR002',
            branchName: 'North Branch',
            centerDay: 'Wednesday',
            centerTime: '2:00 PM',
            status: 'active',
            blacklisted: false,
            assignedTo: 'USER002',
            assignedToName: 'Neha Gupta',
            bcCenterId: 'BC002',
            parentCenterId: '',
            contactPersonName: 'Sunita Devi',
            contactPersonNumber: '+91 9876543211',
            address1: '456 Gandhi Road',
            address2: 'Gandhi Colony',
            landmark: 'Near Temple',
            pincode: '110002',
            villageId: 'VIL002',
            villageName: 'Gandhi Colony',
            city: 'Delhi',
            meetingPlace: 'School Ground',
            latitude: 28.7041,
            longitude: 77.1025,
            createdBy: 'Admin User',
            createdAt: '2024-01-14',
            memberCount: 30
          },
          {
            id: '3',
            centerCode: 'CTR003',
            centerName: 'Nehru Park Center',
            branchId: 'BR003',
            branchName: 'South Branch',
            centerDay: 'Friday',
            centerTime: '11:30 AM',
            status: 'inactive',
            blacklisted: true,
            assignedTo: 'USER003',
            assignedToName: 'Rajesh Singh',
            bcCenterId: 'BC003',
            parentCenterId: '',
            contactPersonName: 'Mohit Kumar',
            contactPersonNumber: '+91 9876543212',
            address1: '789 Park Avenue',
            address2: 'Nehru Park',
            landmark: 'Central Park',
            pincode: '110003',
            villageId: 'VIL003',
            villageName: 'Nehru Park',
            city: 'Delhi',
            meetingPlace: 'Park Pavilion',
            latitude: 28.5355,
            longitude: 77.3910,
            createdBy: 'Admin User',
            createdAt: '2024-01-13',
            memberCount: 18
          }
        ];
        
        setCenters(sampleCenters);
        setFilteredCenters(sampleCenters);
        setLoading(false);
      }, 1000);
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
        setBranches(branchData.map((branch: { id: string; branch_name: string }) => ({
          id: branch.id,
          name: branch.branch_name
        })));
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

      // For demo purposes, create some sample villages
      // In a real app, you would fetch this from the database
      setVillages([
        { id: 'VIL001', name: 'Anand Nagar' },
        { id: 'VIL002', name: 'Gandhi Colony' },
        { id: 'VIL003', name: 'Nehru Park' },
        { id: 'VIL004', name: 'Patel Village' },
        { id: 'VIL005', name: 'Tagore Garden' }
      ]);
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
      filtered = filtered.filter(center => 
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
      // Simulate creating a new center
      setTimeout(() => {
        const newCenter: Center = {
          id: `${Date.now()}`,
          centerCode: `CTR${String(centers.length + 1).padStart(3, '0')}`,
          centerName: formData.centerName,
          branchId: formData.branchId,
          branchName: branches.find(b => b.id === formData.branchId)?.name || '',
          centerDay: formData.centerDay,
          centerTime: formData.centerTime,
          status: formData.status || 'active',
          blacklisted: formData.blacklisted || false,
          assignedTo: formData.assignedTo,
          assignedToName: fieldOfficers.find(fo => fo.id === formData.assignedTo)?.name || '',
          bcCenterId: formData.bcCenterId,
          parentCenterId: formData.parentCenterId,
          contactPersonName: formData.contactPersonName,
          contactPersonNumber: formData.contactPersonNumber,
          address1: formData.address1,
          address2: formData.address2,
          landmark: formData.landmark,
          pincode: formData.pincode,
          villageId: formData.villageId,
          villageName: villages.find(v => v.id === formData.villageId)?.name || '',
          city: formData.city,
          meetingPlace: formData.meetingPlace,
          latitude: formData.latitude,
          longitude: formData.longitude,
          createdBy: 'Current User',
          createdAt: new Date().toISOString().split('T')[0],
          memberCount: 0
        };
        
        setCenters(prev => [...prev, newCenter]);
        setFilteredCenters(prev => [...prev, newCenter]);
        setShowAddModal(false);
        setSuccess('Center created successfully!');
        setTimeout(() => setSuccess(''), 3000);
        setIsSubmitting(false);
      }, 1000);
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
      // Simulate updating a center
      setTimeout(() => {
        const updatedCenter: Center = {
          ...editingCenter,
          centerName: formData.centerName,
          branchId: formData.branchId,
          branchName: branches.find(b => b.id === formData.branchId)?.name || editingCenter.branchName,
          centerDay: formData.centerDay,
          centerTime: formData.centerTime,
          status: formData.status || editingCenter.status,
          blacklisted: formData.blacklisted || false,
          assignedTo: formData.assignedTo,
          assignedToName: fieldOfficers.find(fo => fo.id === formData.assignedTo)?.name || editingCenter.assignedToName,
          bcCenterId: formData.bcCenterId,
          parentCenterId: formData.parentCenterId,
          contactPersonName: formData.contactPersonName,
          contactPersonNumber: formData.contactPersonNumber,
          address1: formData.address1,
          address2: formData.address2,
          landmark: formData.landmark,
          pincode: formData.pincode,
          villageId: formData.villageId,
          villageName: villages.find(v => v.id === formData.villageId)?.name || editingCenter.villageName,
          city: formData.city,
          meetingPlace: formData.meetingPlace,
          latitude: formData.latitude,
          longitude: formData.longitude
        };
        
        setCenters(prev => prev.map(c => c.id === editingCenter.id ? updatedCenter : c));
        setFilteredCenters(prev => prev.map(c => c.id === editingCenter.id ? updatedCenter : c));
        setEditingCenter(null);
        setSuccess('Center updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
        setIsSubmitting(false);
      }, 1000);
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
      // Simulate deleting a center
      setTimeout(() => {
        setCenters(prev => prev.filter(c => c.id !== centerId));
        setFilteredCenters(prev => prev.filter(c => c.id !== centerId));
        setSuccess('Center deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }, 500);
    } catch (err) {
      setError('Failed to delete center');
      console.error('Error deleting center:', err);
    }
  };

  const handleExportCSV = async () => {
    // Create CSV content
    const headers = [
      'Center Code', 'Center Name', 'Branch', 'Center Day', 'Center Time', 'Status', 'Blacklisted',
      'Assigned To', 'BC Center ID', 'Parent Center ID', 'Contact Person Name', 'Contact Person Number',
      'Address 1', 'Address 2', 'Landmark', 'Pincode', 'Village', 'City', 'Meeting Place',
      'Latitude', 'Longitude', 'Created By', 'Created At'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredCenters.map(center => [
        center.centerCode,
        center.centerName,
        center.branchName,
        center.centerDay,
        center.centerTime,
        center.status,
        center.blacklisted ? 'Yes' : 'No',
        center.assignedToName,
        center.bcCenterId || '',
        center.parentCenterId || '',
        center.contactPersonName || '',
        center.contactPersonNumber || '',
        center.address1,
        center.address2 || '',
        center.landmark || '',
        center.pincode || '',
        center.villageName,
        center.city || '',
        center.meetingPlace || '',
        center.latitude || '',
        center.longitude || '',
        center.createdBy,
        center.createdAt
      ].join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `centers_export_${new Date().toISOString().split('T')[0]}.csv`;
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
      <CheckCircle className="w-4 h-4 text-red-600" />
    ) : (
      <XCircle className="w-4 h-4 text-gray-400" />
    );
  };

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
      )
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
      )
    },
    {
      key: 'centerCode',
      label: 'Center Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'centerName',
      label: 'Center Name',
      sortable: true,
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      )
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
      )
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
      )
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
      key: 'blacklisted',
      label: 'Blacklisted',
      render: (value: boolean) => getBooleanIcon(value)
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
      )
    },
    {
      key: 'bcCenterId',
      label: 'BC Center ID',
      render: (value?: string) => value || '-'
    },
    {
      key: 'parentCenterId',
      label: 'Parent Center ID',
      render: (value?: string) => value || '-'
    },
    {
      key: 'contactPersonName',
      label: 'Contact Person Name',
      render: (value?: string) => value || '-'
    },
    {
      key: 'contactPersonNumber',
      label: 'Contact Person Number',
      render: (value?: string) => value ? (
        <div className="flex items-center space-x-1">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ) : '-'
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
      key: 'landmark',
      label: 'Landmark',
      render: (value?: string) => value || '-'
    },
    {
      key: 'pincode',
      label: 'Pincode',
      render: (value?: string) => value || '-'
    },
    {
      key: 'villageName',
      label: 'Village ID',
      sortable: true,
    },
    {
      key: 'city',
      label: 'City',
      render: (value?: string) => value || '-'
    },
    {
      key: 'meetingPlace',
      label: 'Meeting Place',
      render: (value?: string) => value || '-'
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
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading centers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Centers</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage center information and configurations</p>
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
        filterComponent={
          <div className="flex items-center space-x-3">
            <CenterFilterDropdown
              onFilter={handleFilter}
              branches={branches}
              fieldOfficers={fieldOfficers}
            />
            
            <PermissionGuard module="loan" permission="read">
              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </PermissionGuard>
          </div>
        }
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
              parentCenterId: editingCenter.parentCenterId
            }}
            isSubmitting={isSubmitting}
            branches={branches}
            fieldOfficers={fieldOfficers}
            villages={villages}
          />
        )}
      </Modal>
    </div>
  );
};