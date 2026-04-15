import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { CSVUpload } from '../../../components/Common/CSVUpload';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { DataTable } from '../../../components/Common/DataTable';
import { useAuth } from '../../../hooks/useAuth';
import { purposeService, PurposeFormData, PurposeFilterOptions } from '../../../services/purposeService';
import {
  Target, Edit, Trash2, CheckCircle, XCircle,
  Download, Upload, AlertCircle, FileDown, Filter, ChevronDown, Search,
} from 'lucide-react';

const PurposeFilterDropdown: React.FC<{
  onFilter: (filters: PurposeFilterOptions) => void;
  purposes: string[];
  subPurposes: string[];
}> = ({ onFilter, purposes, subPurposes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<PurposeFilterOptions>({});
  const change = (k: keyof PurposeFilterOptions, v: string) => setFilters(prev => ({ ...prev, [k]: v || undefined }));
  const apply = () => { onFilter(filters); setIsOpen(false); };
  const clear = () => { setFilters({}); onFilter({}); };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
        <Filter className="w-4 h-4" /><span>Search Filter</span><ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 p-4 space-y-4">
          <div className="flex items-center space-x-2"><Search className="w-5 h-5 text-gray-400" /><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Filters</h3></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose</label>
            <select value={filters.purpose || ''} onChange={e => change('purpose', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">All Purposes</option>{purposes.map(p => <option key={p} value={p}>{p}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sub Purpose</label>
            <select value={filters.subPurpose || ''} onChange={e => change('subPurpose', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">All Sub Purposes</option>{subPurposes.map(p => <option key={p} value={p}>{p}</option>)}
            </select></div>
          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
            <button onClick={clear} className="px-4 py-2 text-gray-600 dark:text-gray-400">Clear All</button>
            <button onClick={apply} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Apply Filters</button>
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
  isSubmitting?: boolean;
}> = ({ onSubmit, onCancel, initialData = {}, mainPurposes, isSubmitting }) => {
  const [formData, setFormData] = useState<PurposeFormData>({
    purposeCode: initialData.purposeCode || '',
    purposeName: initialData.purposeName || '',
    mainPurposeId: initialData.mainPurposeId || '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PurposeFormData, string>>>({});

  const validate = () => {
    const e: Partial<Record<keyof PurposeFormData, string>> = {};
    if (!formData.purposeCode) e.purposeCode = 'Purpose Code is required';
    if (!formData.purposeName) e.purposeName = 'Purpose Name is required';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (validate()) onSubmit(formData); };
  const change = (f: keyof PurposeFormData, v: string) => { setFormData(prev => ({ ...prev, [f]: v })); if (errors[f]) setErrors(prev => ({ ...prev, [f]: undefined })); };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">🎯 Purpose Information</h4>
      <div className="space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose Code <span className="text-red-500">*</span></label>
          <input type="text" value={formData.purposeCode} onChange={e => change('purposeCode', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.purposeCode ? 'border-red-300' : 'border-gray-300'}`} placeholder="Enter purpose code" />
          {errors.purposeCode && <p className="text-red-500 text-xs mt-1">{errors.purposeCode}</p>}</div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose Name <span className="text-red-500">*</span></label>
          <input type="text" value={formData.purposeName} onChange={e => change('purposeName', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.purposeName ? 'border-red-300' : 'border-gray-300'}`} placeholder="Enter purpose name" />
          {errors.purposeName && <p className="text-red-500 text-xs mt-1">{errors.purposeName}</p>}</div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Main Purpose ID</label>
          <select value={formData.mainPurposeId} onChange={e => change('mainPurposeId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="">Select Main Purpose</option>{mainPurposes.map(p => <option key={p.id} value={p.id}>{p.purposeName}</option>)}
          </select></div>
      </div>
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save Purpose'}</button>
      </div>
    </form>
  );
};

export const Purpose: React.FC = () => {
  const { hasPermission } = useAuth();
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [filteredPurposes, setFilteredPurposes] = useState<Purpose[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [editingPurpose, setEditingPurpose] = useState<Purpose | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mainPurposes = purposes.filter(p => p.isMainPurpose);
  const subPurposes = purposes.filter(p => !p.isMainPurpose);
  const purposeNames = Array.from(new Set(purposes.map(p => p.purposeName)));
  const subPurposeNames = Array.from(new Set(subPurposes.map(p => p.purposeName)));

  useEffect(() => { loadPurposes(); }, []);

  const loadPurposes = async () => {
    try {
      setLoading(true);
      const data = await purposeService.getAllPurposes();
      setPurposes(data); setFilteredPurposes(data);
    } catch { setError('Failed to load purposes'); }
    finally { setLoading(false); }
  };

  const handleFilter = (filters: PurposeFilterOptions) => {
    let f = purposes;
    if (filters.purpose) f = f.filter(p => p.purposeName === filters.purpose);
    if (filters.subPurpose) f = f.filter(p => p.purposeName === filters.subPurpose);
    setFilteredPurposes(f);
  };

  const handleAdd = async (formData: PurposeFormData) => {
    try {
      setIsSubmitting(true);
      const newRecord = await purposeService.createPurpose(formData);
      setPurposes(prev => [...prev, newRecord]); setFilteredPurposes(prev => [...prev, newRecord]);
      setShowAddModal(false); setSuccess('Purpose created successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to create purpose'); }
    finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (formData: PurposeFormData) => {
    if (!editingPurpose) return;
    try {
      setIsSubmitting(true);
      const updated = await purposeService.updatePurpose(editingPurpose.id, formData);
      setPurposes(prev => prev.map(p => p.id === editingPurpose.id ? updated : p));
      setFilteredPurposes(prev => prev.map(p => p.id === editingPurpose.id ? updated : p));
      setEditingPurpose(null); setSuccess('Purpose updated successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to update purpose'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this purpose?')) return;
    try {
      await purposeService.deletePurpose(id);
      setPurposes(prev => prev.filter(p => p.id !== id)); setFilteredPurposes(prev => prev.filter(p => p.id !== id));
      setSuccess('Purpose deleted successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to delete purpose'); }
  };

  const handleCSVUpload = async (file: File) => {
    try {
      const result = await purposeService.uploadPurposesCSV(file);
      if (result.success) { await loadPurposes(); setShowCSVModal(false); setSuccess(`CSV upload completed! ${result.created} created, ${result.updated} updated, ${result.errors} errors.`); setTimeout(() => setSuccess(''), 5000); }
      else { setError(result.message || 'CSV upload failed'); }
    } catch { setError('Failed to upload CSV'); }
  };

  const getStatusIcon = (status: string) => status === 'active' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />;
  const getBooleanIcon = (value: boolean) => value ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" />;

  const columns = [
    { key: 'actions', label: 'Action', render: (_: unknown, row: Purpose) => (<div className="flex items-center space-x-2"><PermissionGuard module="loan" permission="write"><button onClick={() => setEditingPurpose(row)} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"><Edit className="w-4 h-4" /></button></PermissionGuard><PermissionGuard module="loan" permission="delete"><button onClick={() => handleDelete(row.id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><Trash2 className="w-4 h-4" /></button></PermissionGuard></div>) },
    { key: 'purposeId', label: 'Purpose ID', sortable: true, render: (v: string) => <span className="font-mono font-medium">{v}</span> },
    { key: 'purposeCode', label: 'Purpose Code', sortable: true, render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'purposeName', label: 'Purpose Name', sortable: true, render: (v: string) => <div className="flex items-center space-x-2"><Target className="w-4 h-4 text-gray-400" /><span className="font-medium">{v}</span></div> },
    { key: 'mainPurposeId', label: 'Main Purpose ID', render: (v?: string) => v || '-' },
    { key: 'isMainPurpose', label: 'Is Main Purpose', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'status', label: 'Status', sortable: true, render: (v: string) => <div className="flex items-center space-x-2">{getStatusIcon(v)}<span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${v === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span></div> },
  ];

  const filterComponent = (
    <div className="flex items-center space-x-3">
      <PurposeFilterDropdown onFilter={handleFilter} purposes={purposeNames} subPurposes={subPurposeNames} />
      <PermissionGuard module="loan" permission="read"><button onClick={() => purposeService.downloadTemplate()} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><FileDown className="w-4 h-4" /><span>Template</span></button></PermissionGuard>
      <PermissionGuard module="loan" permission="read"><button onClick={() => purposeService.exportPurposesCSV(filteredPurposes)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Download className="w-4 h-4" /><span>Export CSV</span></button></PermissionGuard>
      <PermissionGuard module="loan" permission="write"><button onClick={() => setShowCSVModal(true)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Upload className="w-4 h-4" /><span>Upload CSV</span></button></PermissionGuard>
    </div>
  );

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Purpose</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Manage loan purposes and categories</p></div>
      {success && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2"><CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{success}</span></div>}
      {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2"><AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span></div>}
      <DataTable columns={columns} data={filteredPurposes} title="Purpose Management" loading={loading} onAdd={() => setShowAddModal(true)} filterComponent={filterComponent} />
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Purpose" size="md"><PurposeForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} mainPurposes={mainPurposes} isSubmitting={isSubmitting} /></Modal>
      <Modal isOpen={!!editingPurpose} onClose={() => setEditingPurpose(null)} title="Edit Purpose" size="md">{editingPurpose && <PurposeForm onSubmit={handleUpdate} onCancel={() => setEditingPurpose(null)} initialData={editingPurpose} mainPurposes={mainPurposes} isSubmitting={isSubmitting} />}</Modal>
      <Modal isOpen={showCSVModal} onClose={() => setShowCSVModal(false)} title="Upload Purposes CSV" size="lg"><CSVUpload onUpload={handleCSVUpload} onCancel={() => setShowCSVModal(false)} templateColumns={['purposeCode', 'purposeName', 'mainPurposeId']} entityName="purposes" /></Modal>
    </div>
  );
};