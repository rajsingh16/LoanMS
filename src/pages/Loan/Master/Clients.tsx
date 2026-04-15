import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { ClientFilterDropdown } from '../../../components/Common/ClientFilterDropdown';
import { CSVUpload } from '../../../components/Common/CSVUpload';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { DataTable } from '../../../components/Common/DataTable';
import { clientService, EnhancedLoanClient, ClientFormData, ClientFilterOptions } from '../../../services/clientService.tsx';
import {
  User,
  Phone,
  CreditCard,
  Calendar,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  GraduationCap,
  Heart,
  Briefcase,
  Home,
  Download,
  Upload,
  FileDown,
} from 'lucide-react';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<EnhancedLoanClient[]>([]);
  const [filteredClients, setFilteredClients] = useState<EnhancedLoanClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [editingClient, setEditingClient] = useState<EnhancedLoanClient | null>(null);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAllClients();
      setClients(data);
      setFilteredClients(data);
    } catch (err) {
      setError('Failed to load clients');
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters: ClientFilterOptions) => {
    let filtered = clients;

    if (filters.clientCode) {
      filtered = filtered.filter(client =>
        client.clientId.toLowerCase().includes(filters.clientCode!.toLowerCase())
      );
    }
    if (filters.voterCardNumber) {
      filtered = filtered.filter(client =>
        client.voterCardNumber.toLowerCase().includes(filters.voterCardNumber!.toLowerCase())
      );
    }
    if (filters.aadhaarNumber) {
      filtered = filtered.filter(client =>
        client.aadhaarNumber.includes(filters.aadhaarNumber!)
      );
    }

    setFilteredClients(filtered);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;

    try {
      await clientService.deleteClient(clientId);
      setClients(prev => prev.filter(c => c.id !== clientId));
      setFilteredClients(prev => prev.filter(c => c.id !== clientId));
      setSuccess('Client deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete client');
      console.error('Error deleting client:', err);
    }
  };

  const handleUpdateClient = async (formData: ClientFormData) => {
    if (!editingClient) return;

    try {
      setIsSubmitting(true);
      const updatedClient = await clientService.updateClient(editingClient.id, formData);
      setClients(prev => prev.map(c => (c.id === editingClient.id ? updatedClient : c)));
      setFilteredClients(prev => prev.map(c => (c.id === editingClient.id ? updatedClient : c)));
      setEditingClient(null);
      setSuccess('Client updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update client');
      console.error('Error updating client:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCSVUpload = async (file: File) => {
    try {
      const result = await clientService.uploadClientsCSV(file);
      if (result.success) {
        await loadClients();
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
      await clientService.exportClientsCSV(filteredClients);
      setSuccess('CSV exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export CSV');
      console.error('Error exporting CSV:', err);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await clientService.downloadTemplate();
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

  const getGenderIcon = (gender: string) =>
    gender === 'Female' ? (
      <User className="w-4 h-4 text-pink-500" />
    ) : (
      <User className="w-4 h-4 text-blue-500" />
    );

  const columns = [
    {
      key: 'actions',
      label: 'Action',
      render: (_value: unknown, row: EnhancedLoanClient) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard module="loan" permission="write">
            <button
              onClick={() => setEditingClient(row)}
              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors duration-200"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard module="loan" permission="delete">
            <button
              onClick={() => handleDeleteClient(row.id)}
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
      key: 'clientId',
      label: 'Client ID',
      sortable: true,
      render: (value: string) => <span className="font-mono font-medium">{value}</span>,
    },
    {
      key: 'firstName',
      label: 'First Name',
      sortable: true,
      render: (value: string, row: EnhancedLoanClient) => (
        <div className="flex items-center space-x-2">
          {getGenderIcon(row.gender)}
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'lastName',
      label: 'Last Name',
      sortable: true,
    },
    {
      key: 'aadhaarNumber',
      label: 'Aadhaar Number',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span className="font-mono">{value}</span>
        </div>
      ),
    },
    {
      key: 'voterCardNumber',
      label: 'Voter Card Number',
      sortable: true,
      render: (value: string) => <span className="font-mono">{value}</span>,
    },
    {
      key: 'kycType',
      label: 'KYC Type',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
          {value}
        </span>
      ),
    },
    {
      key: 'kycId',
      label: 'KYC ID',
      render: (value: string) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: 'cycle',
      label: 'Cycle',
      sortable: true,
      render: (value: number) => (
        <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
          Cycle {value}
        </span>
      ),
    },
    {
      key: 'dateOfBirth',
      label: 'Date of Birth',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'age',
      label: 'Age',
      sortable: true,
      render: (value: number) => `${value} years`,
    },
    {
      key: 'fatherName',
      label: "Father's Name",
      sortable: true,
    },
    {
      key: 'motherName',
      label: "Mother's Name",
      sortable: true,
    },
    {
      key: 'gender',
      label: 'Gender',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          {getGenderIcon(value)}
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'maritalStatus',
      label: 'Marital Status',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Heart className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'mobileNumber',
      label: 'Mobile Number',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Phone className="w-4 h-4 text-gray-400" />
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
      key: 'qualification',
      label: 'Qualification',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <GraduationCap className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    { key: 'language', label: 'Language', sortable: true },
    { key: 'caste', label: 'Caste', sortable: true },
    { key: 'religion', label: 'Religion', sortable: true },
    {
      key: 'occupation',
      label: 'Occupation',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'landHolding',
      label: 'Land Holding',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Home className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'monthlyIncome',
      label: 'Monthly Income',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'annualIncome',
      label: 'Annual Income',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-blue-500" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'householdIncome',
      label: 'Household Income',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-purple-500" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'monthlyExpense',
      label: 'Monthly Expense',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-red-500" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'monthlyObligation',
      label: 'Monthly Obligation',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-orange-500" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      ),
    },
  ];

  const filterComponent = (
    <div className="flex items-center space-x-3">
      <ClientFilterDropdown onFilter={handleFilter} onDownload={handleExportCSV} />

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage client information and profiles</p>
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
        data={filteredClients}
        title="Client Management"
        loading={loading}
        filterComponent={filterComponent}
      />

      {/* CSV Upload Modal */}
      <Modal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        title="Upload Clients CSV"
        size="lg"
      >
        <CSVUpload
          onUpload={handleCSVUpload}
          onCancel={() => setShowCSVModal(false)}
          templateColumns={[
            'firstName', 'lastName', 'aadhaarNumber', 'voterCardNumber', 'kycType', 'kycId',
            'cycle', 'dateOfBirth', 'fatherName', 'motherName', 'gender', 'maritalStatus',
            'mobileNumber', 'status', 'qualification', 'language', 'caste', 'religion',
            'occupation', 'landHolding', 'monthlyIncome', 'annualIncome', 'householdIncome',
            'monthlyExpense', 'monthlyObligation',
          ]}
          entityName="clients"
        />
      </Modal>
    </div>
  );
};