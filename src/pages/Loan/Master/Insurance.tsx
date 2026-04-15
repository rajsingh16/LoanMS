// ─── InsuranceMasterPage.tsx ───────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { InsuranceForm } from '../../../components/Forms/InsuranceForm';
import { CSVUpload } from '../../../components/Common/CSVUpload';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { DataTable } from '../../../components/Common/DataTable';
import { Insurance as InsuranceType } from '../../../types/product';
import { insuranceService, InsuranceFormData } from '../../../services/insuranceService';
import { useAuth } from '../../../hooks/useAuth';
import {
  Shield, Calendar, Edit, Trash2, CheckCircle, XCircle,
  Download, Upload, AlertCircle, FileDown, DollarSign, Clock, User,
} from 'lucide-react';

export const InsuranceMasterPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [insurances, setInsurances] = useState<InsuranceType[]>([]);
  const [filteredInsurances, setFilteredInsurances] = useState<InsuranceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<InsuranceType | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { loadInsurances(); }, []);

  const loadInsurances = async () => {
    try {
      setLoading(true);
      const data = await insuranceService.getAllInsurances();
      setInsurances(data);
      setFilteredInsurances(data);
    } catch { setError('Failed to load insurances'); }
    finally { setLoading(false); }
  };

  const handleAdd = async (formData: InsuranceFormData) => {
    try {
      setIsSubmitting(true);
      const newRecord = await insuranceService.createInsurance(formData);
      setInsurances(prev => [...prev, newRecord]);
      setFilteredInsurances(prev => [...prev, newRecord]);
      setShowAddModal(false);
      setSuccess('Insurance created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to create insurance'); }
    finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (formData: InsuranceFormData) => {
    if (!editingInsurance) return;
    try {
      setIsSubmitting(true);
      const updated = await insuranceService.updateInsurance(editingInsurance.id, formData);
      setInsurances(prev => prev.map(i => i.id === editingInsurance.id ? updated : i));
      setFilteredInsurances(prev => prev.map(i => i.id === editingInsurance.id ? updated : i));
      setEditingInsurance(null);
      setSuccess('Insurance updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to update insurance'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this insurance?')) return;
    try {
      await insuranceService.deleteInsurance(id);
      setInsurances(prev => prev.filter(i => i.id !== id));
      setFilteredInsurances(prev => prev.filter(i => i.id !== id));
      setSuccess('Insurance deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to delete insurance'); }
  };

  const handleCSVUpload = async (file: File) => {
    try {
      const result = await insuranceService.uploadInsuranceCSV(file);
      if (result.success) {
        await loadInsurances(); setShowCSVModal(false);
        setSuccess(`CSV upload completed! ${result.created} created, ${result.updated} updated, ${result.errors} errors.`);
        setTimeout(() => setSuccess(''), 5000);
      } else { setError(result.message || 'CSV upload failed'); }
    } catch { setError('Failed to upload CSV'); }
  };

  const getStatusIcon = (status: string) => status === 'active'
    ? <CheckCircle className="w-4 h-4 text-green-600" />
    : <XCircle className="w-4 h-4 text-red-600" />;

  const getBooleanIcon = (value: boolean) => value
    ? <CheckCircle className="w-4 h-4 text-green-600" />
    : <XCircle className="w-4 h-4 text-gray-400" />;

  const columns = [
    {
      key: 'actions', label: 'Action',
      render: (_: unknown, row: InsuranceType) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard module="loan" permission="write">
            <button onClick={() => setEditingInsurance(row)} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"><Edit className="w-4 h-4" /></button>
          </PermissionGuard>
          <PermissionGuard module="loan" permission="delete">
            <button onClick={() => handleDelete(row.id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><Trash2 className="w-4 h-4" /></button>
          </PermissionGuard>
        </div>
      ),
    },
    { key: 'insuranceId', label: 'Insurance ID', sortable: true, render: (v: string) => <span className="font-mono font-medium">{v}</span> },
    { key: 'insuranceCode', label: 'Insurance Code', sortable: true, render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'insuranceType', label: 'Insurance Type', sortable: true, render: (v: string) => <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">{v}</span> },
    { key: 'insuranceName', label: 'Insurance Name', sortable: true, render: (v: string) => <div className="flex items-center space-x-2"><Shield className="w-4 h-4 text-gray-400" /><span className="font-medium">{v}</span></div> },
    { key: 'premiumCalType', label: 'Premium Cal Type', sortable: true, render: (v: string) => <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">{v}</span> },
    { key: 'premiumValue', label: 'Premium Value', sortable: true, render: (v: number, row: InsuranceType) => <div className="flex items-center space-x-1"><DollarSign className="w-4 h-4 text-green-500" /><span>{row.premiumCalType === 'Percentage' ? `${v}%` : `₹${v.toLocaleString()}`}</span></div> },
    { key: 'paymentFrequency', label: 'Payment Frequency', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Clock className="w-4 h-4 text-gray-400" /><span>{v}</span></div> },
    { key: 'durationInMonths', label: 'Duration In Months', sortable: true, render: (v: number) => `${v} months` },
    { key: 'startDate', label: 'Start Date', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-green-500" /><span>{new Date(v).toLocaleDateString()}</span></div> },
    { key: 'endDate', label: 'End Date', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-red-500" /><span>{new Date(v).toLocaleDateString()}</span></div> },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (v: string) => <div className="flex items-center space-x-2">{getStatusIcon(v)}<span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${v === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span></div>,
    },
    { key: 'isCoApplicantCovered', label: 'Is Co-Applicant Covered', render: (v: boolean) => <div className="flex items-center space-x-2">{getBooleanIcon(v)}<User className="w-4 h-4 text-gray-400" /></div> },
    { key: 'insuranceGlHead', label: 'Insurance GL Head', sortable: true, render: (v: string) => <span className="font-mono text-sm">{v}</span> },
    { key: 'insuranceRecHead', label: 'Insurance REC Head', render: (v: string) => <span className="font-mono text-sm">{v}</span> },
    { key: 'insuranceControlRecHead', label: 'Insurance Control REC Head', render: (v: string) => <span className="font-mono text-sm">{v}</span> },
    { key: 'writeOffInsuranceHead', label: 'WriteOff Insurance Head', render: (v: string) => <span className="font-mono text-sm">{v}</span> },
    { key: 'insertedOn', label: 'Inserted On', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> },
    { key: 'insertedBy', label: 'Inserted By', sortable: true },
    { key: 'updatedOn', label: 'Updated On', render: (v?: string) => v ? <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> : '-' },
    { key: 'updatedBy', label: 'Updated By', render: (v?: string) => v || '-' },
  ];

  const filterComponent = (
    <div className="flex items-center space-x-3">
      <PermissionGuard module="loan" permission="read">
        <button onClick={async () => { await insuranceService.downloadTemplate(); setSuccess('Template downloaded!'); setTimeout(() => setSuccess(''), 3000); }} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><FileDown className="w-4 h-4" /><span>Template</span></button>
      </PermissionGuard>
      <PermissionGuard module="loan" permission="read">
        <button onClick={async () => { await insuranceService.exportInsuranceCSV(filteredInsurances); setSuccess('CSV exported!'); setTimeout(() => setSuccess(''), 3000); }} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Download className="w-4 h-4" /><span>Export CSV</span></button>
      </PermissionGuard>
      <PermissionGuard module="loan" permission="write">
        <button onClick={() => setShowCSVModal(true)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Upload className="w-4 h-4" /><span>Upload CSV</span></button>
      </PermissionGuard>
    </div>
  );

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Insurance</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Manage insurance products and policies</p></div>
      {success && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2"><CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{success}</span></div>}
      {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2"><AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span></div>}
      <DataTable columns={columns} data={filteredInsurances} title="Insurance Management" loading={loading} onAdd={() => setShowAddModal(true)} filterComponent={filterComponent} />
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Insurance" size="lg">
        <InsuranceForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} isSubmitting={isSubmitting} />
      </Modal>
      <Modal isOpen={!!editingInsurance} onClose={() => setEditingInsurance(null)} title="Edit Insurance" size="lg">
        {editingInsurance && <InsuranceForm onSubmit={handleUpdate} onCancel={() => setEditingInsurance(null)} initialData={editingInsurance} isSubmitting={isSubmitting} />}
      </Modal>
      <Modal isOpen={showCSVModal} onClose={() => setShowCSVModal(false)} title="Upload Insurance CSV" size="lg">
        <CSVUpload onUpload={handleCSVUpload} onCancel={() => setShowCSVModal(false)} templateColumns={['insuranceCode', 'insuranceType', 'insuranceName', 'premiumCalType', 'premiumValue', 'paymentFrequency', 'durationInMonths', 'startDate', 'endDate', 'isCoApplicantCovered', 'insuranceGlHead', 'insuranceRecHead', 'insuranceControlRecHead', 'writeOffInsuranceHead']} entityName="insurances" />
      </Modal>
    </div>
  );
};