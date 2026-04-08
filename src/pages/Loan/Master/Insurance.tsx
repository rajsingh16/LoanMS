import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { InsuranceForm } from '../../../components/Forms/InsuranceForm';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { Insurance as InsuranceType } from '../../../types/product';
import { useAuth } from '../../../hooks/useAuth';
import { 
  Shield, 
  Calendar, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Download, 
  AlertCircle, 
  Loader, 
  Plus,
  DollarSign,
  Clock,
  User
} from 'lucide-react';

export const InsuranceMasterPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [insurances, setInsurances] = useState<InsuranceType[]>([]);
  const [filteredInsurances, setFilteredInsurances] = useState<InsuranceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<InsuranceType | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Sample data for demonstration
  const sampleInsurances: InsuranceType[] = [
    {
      id: '1',
      insuranceId: 'INS001',
      insuranceCode: 'LIFE001',
      insuranceType: 'Life Insurance',
      insuranceName: 'Basic Life Cover',
      premiumCalType: 'Percentage',
      premiumValue: 2.5,
      paymentFrequency: 'Monthly',
      durationInMonths: 12,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      isCoApplicantCovered: true,
      insuranceGlHead: 'INS_GL_001',
      insuranceRecHead: 'INS_REC_001',
      insuranceControlRecHead: 'INS_CTRL_001',
      writeOffInsuranceHead: 'INS_WO_001',
      insertedOn: '2024-01-15',
      insertedBy: 'Admin User'
    },
    {
      id: '2',
      insuranceId: 'INS002',
      insuranceCode: 'HEALTH001',
      insuranceType: 'Health Insurance',
      insuranceName: 'Health Protection Plan',
      premiumCalType: 'Fixed',
      premiumValue: 500,
      paymentFrequency: 'Quarterly',
      durationInMonths: 24,
      startDate: '2024-01-01',
      endDate: '2025-12-31',
      status: 'active',
      isCoApplicantCovered: false,
      insuranceGlHead: 'INS_GL_002',
      insuranceRecHead: 'INS_REC_002',
      insuranceControlRecHead: 'INS_CTRL_002',
      writeOffInsuranceHead: 'INS_WO_002',
      insertedOn: '2024-01-12',
      insertedBy: 'Manager User'
    },
    {
      id: '3',
      insuranceId: 'INS003',
      insuranceCode: 'TERM001',
      insuranceType: 'Term Insurance',
      insuranceName: 'Term Life Protection',
      premiumCalType: 'Percentage',
      premiumValue: 1.8,
      paymentFrequency: 'Annual',
      durationInMonths: 60,
      startDate: '2024-01-01',
      endDate: '2028-12-31',
      status: 'inactive',
      isCoApplicantCovered: true,
      insuranceGlHead: 'INS_GL_003',
      insuranceRecHead: 'INS_REC_003',
      insuranceControlRecHead: 'INS_CTRL_003',
      writeOffInsuranceHead: 'INS_WO_003',
      insertedOn: '2024-01-10',
      insertedBy: 'Admin User'
    }
  ];

  useEffect(() => {
    loadInsurances();
  }, []);

  const loadInsurances = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setInsurances(sampleInsurances);
        setFilteredInsurances(sampleInsurances);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load insurances');
      console.error('Error loading insurances:', err);
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const headers = [
      'Insurance ID', 'Insurance Code', 'Insurance Type', 'Insurance Name', 'Premium Cal Type',
      'Premium Value', 'Payment Frequency', 'Duration In Months', 'Start Date', 'End Date',
      'Status', 'Is Co-Applicant Covered', 'Insurance GL Head', 'Insurance REC Head',
      'Insurance Control REC Head', 'WriteOff Insurance Head', 'Inserted On', 'Inserted By',
      'Updated On', 'Updated By'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredInsurances.map(insurance => [
        insurance.insuranceId,
        insurance.insuranceCode,
        insurance.insuranceType,
        insurance.insuranceName,
        insurance.premiumCalType,
        insurance.premiumValue,
        insurance.paymentFrequency,
        insurance.durationInMonths,
        insurance.startDate,
        insurance.endDate,
        insurance.status,
        insurance.isCoApplicantCovered ? 'Yes' : 'No',
        insurance.insuranceGlHead,
        insurance.insuranceRecHead,
        insurance.insuranceControlRecHead,
        insurance.writeOffInsuranceHead,
        insurance.insertedOn,
        insurance.insertedBy,
        insurance.updatedOn || '',
        insurance.updatedBy || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insurance_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setSuccess('CSV exported successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddInsurance = async (formData: any) => {
    try {
      const newInsurance: InsuranceType = {
        id: String(insurances.length + 1),
        insuranceId: `INS${String(insurances.length + 1).padStart(3, '0')}`,
        insuranceCode: formData.insuranceCode,
        insuranceType: formData.insuranceType,
        insuranceName: formData.insuranceName,
        premiumCalType: formData.premiumCalType,
        premiumValue: formData.premiumValue,
        paymentFrequency: formData.paymentFrequency,
        durationInMonths: formData.durationInMonths,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: 'active',
        isCoApplicantCovered: formData.isCoApplicantCovered,
        insuranceGlHead: formData.insuranceGlHead,
        insuranceRecHead: formData.insuranceRecHead,
        insuranceControlRecHead: formData.insuranceControlRecHead,
        writeOffInsuranceHead: formData.writeOffInsuranceHead,
        insertedOn: new Date().toISOString().split('T')[0],
        insertedBy: 'Current User'
      };

      setInsurances(prev => [...prev, newInsurance]);
      setFilteredInsurances(prev => [...prev, newInsurance]);
      setShowAddModal(false);
      setSuccess('Insurance created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create insurance');
      console.error('Error creating insurance:', err);
    }
  };

  const handleEditInsurance = (insurance: InsuranceType) => {
    setEditingInsurance(insurance);
  };

  const handleUpdateInsurance = async (formData: any) => {
    if (!editingInsurance) return;

    try {
      const updatedInsurance: InsuranceType = {
        ...editingInsurance,
        insuranceCode: formData.insuranceCode,
        insuranceType: formData.insuranceType,
        insuranceName: formData.insuranceName,
        premiumCalType: formData.premiumCalType,
        premiumValue: formData.premiumValue,
        paymentFrequency: formData.paymentFrequency,
        durationInMonths: formData.durationInMonths,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isCoApplicantCovered: formData.isCoApplicantCovered,
        insuranceGlHead: formData.insuranceGlHead,
        insuranceRecHead: formData.insuranceRecHead,
        insuranceControlRecHead: formData.insuranceControlRecHead,
        writeOffInsuranceHead: formData.writeOffInsuranceHead,
        updatedOn: new Date().toISOString().split('T')[0],
        updatedBy: 'Current User'
      };

      setInsurances(prev => prev.map(i => i.id === editingInsurance.id ? updatedInsurance : i));
      setFilteredInsurances(prev => prev.map(i => i.id === editingInsurance.id ? updatedInsurance : i));
      setEditingInsurance(null);
      setSuccess('Insurance updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update insurance');
      console.error('Error updating insurance:', err);
    }
  };

  const handleDeleteInsurance = async (insuranceId: string) => {
    if (!window.confirm('Are you sure you want to delete this insurance?')) return;

    try {
      setInsurances(prev => prev.filter(i => i.id !== insuranceId));
      setFilteredInsurances(prev => prev.filter(i => i.id !== insuranceId));
      setSuccess('Insurance deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete insurance');
      console.error('Error deleting insurance:', err);
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
      render: (value: any, row: InsuranceType) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard module="loan" permission="write">
            <button
              onClick={() => handleEditInsurance(row)}
              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors duration-200"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard module="loan" permission="delete">
            <button
              onClick={() => handleDeleteInsurance(row.id)}
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
      key: 'insuranceId',
      label: 'Insurance ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'insuranceCode',
      label: 'Insurance Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'insuranceType',
      label: 'Insurance Type',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {value}
        </span>
      )
    },
    {
      key: 'insuranceName',
      label: 'Insurance Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'premiumCalType',
      label: 'Premium Cal Type',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          {value}
        </span>
      )
    },
    {
      key: 'premiumValue',
      label: 'Premium Value',
      sortable: true,
      render: (value: number, row: InsuranceType) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span className="font-medium">
            {row.premiumCalType === 'Percentage' ? `${value}%` : `₹${value.toLocaleString()}`}
          </span>
        </div>
      )
    },
    {
      key: 'paymentFrequency',
      label: 'Payment Frequency',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'durationInMonths',
      label: 'Duration In Months',
      sortable: true,
      render: (value: number) => `${value} months`
    },
    {
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-green-500" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'endDate',
      label: 'End Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-red-500" />
          <span>{new Date(value).toLocaleDateString()}</span>
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
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        </div>
      )
    },
    {
      key: 'isCoApplicantCovered',
      label: 'Is Co-Applicant Covered',
      render: (value: boolean) => (
        <div className="flex items-center space-x-2">
          {getBooleanIcon(value)}
          <User className="w-4 h-4 text-gray-400" />
        </div>
      )
    },
    {
      key: 'insuranceGlHead',
      label: 'Insurance GL Head',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'insuranceRecHead',
      label: 'Insurance REC Head',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'insuranceControlRecHead',
      label: 'Insurance Control REC Head',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'writeOffInsuranceHead',
      label: 'WriteOff Insurance Head',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
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
          <span className="text-gray-600 dark:text-gray-400">Loading insurances...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Insurance</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage insurance products and policies</p>
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Insurance Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredInsurances.length} records found
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
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
              {filteredInsurances.map((insurance, index) => (
                <tr
                  key={insurance.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {column.render ? column.render(insurance[column.key as keyof InsuranceType], insurance) : insurance[column.key as keyof InsuranceType]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Insurance Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Insurance"
        size="lg"
      >
        <InsuranceForm
          onSubmit={handleAddInsurance}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Insurance Modal */}
      <Modal
        isOpen={!!editingInsurance}
        onClose={() => setEditingInsurance(null)}
        title="Edit Insurance"
        size="lg"
      >
        {editingInsurance && (
          <InsuranceForm
            onSubmit={handleUpdateInsurance}
            onCancel={() => setEditingInsurance(null)}
            initialData={editingInsurance}
          />
        )}
      </Modal>
    </div>
  );
};