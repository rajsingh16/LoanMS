import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { CSVUpload } from '../../../components/Common/CSVUpload';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { DataTable } from '../../../components/Common/DataTable';
import { useAuth } from '../../../hooks/useAuth';
import { pincodeService, PincodeFormData, PincodeFilterOptions } from '../../../services/pincodeService';
import {
  MapPin, Edit, Trash2, CheckCircle, XCircle,
  Download, Upload, AlertCircle, FileDown, Filter, ChevronDown, Search,
} from 'lucide-react';

const PincodeFilterDropdown: React.FC<{
  onFilter: (filters: PincodeFilterOptions) => void;
  districts: string[];
}> = ({ onFilter, districts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<PincodeFilterOptions>({});
  const change = (k: keyof PincodeFilterOptions, v: string) => setFilters(prev => ({ ...prev, [k]: v || undefined }));
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
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
            <input type="text" value={filters.pincode || ''} onChange={e => change('pincode', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Enter pincode" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select value={filters.status || ''} onChange={e => change('status', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option>
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
            <select value={filters.district || ''} onChange={e => change('district', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">All Districts</option>{districts.map(d => <option key={d} value={d}>{d}</option>)}
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

const PincodeForm: React.FC<{
  onSubmit: (data: PincodeFormData) => void;
  onCancel: () => void;
  initialData?: Partial<PincodeFormData>;
  isSubmitting?: boolean;
}> = ({ onSubmit, onCancel, initialData = {}, isSubmitting }) => {
  const [formData, setFormData] = useState<PincodeFormData>({
    pincode: initialData.pincode || '',
    status: initialData.status || 'active',
    district: initialData.district || '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PincodeFormData, string>>>({});
  const districts = ['Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'];

  const validate = () => {
    const e: Partial<Record<keyof PincodeFormData, string>> = {};
    if (!formData.pincode) e.pincode = 'Pincode is required';
    if (!formData.district) e.district = 'District is required';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (validate()) onSubmit(formData); };
  const change = (f: keyof PincodeFormData, v: string) => { setFormData(prev => ({ ...prev, [f]: v })); if (errors[f]) setErrors(prev => ({ ...prev, [f]: undefined })); };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">📍 Pincode Information</h4>
      <div className="space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode <span className="text-red-500">*</span></label>
          <input type="text" value={formData.pincode} onChange={e => change('pincode', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.pincode ? 'border-red-300' : 'border-gray-300'}`} placeholder="Enter pincode" />
          {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}</div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select value={formData.status} onChange={e => change('status', e.target.value as 'active' | 'inactive')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="active">Active</option><option value="inactive">Inactive</option>
          </select></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District <span className="text-red-500">*</span></label>
          <select value={formData.district} onChange={e => change('district', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.district ? 'border-red-300' : 'border-gray-300'}`}>
            <option value="">Select District</option>{districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>{errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}</div>
      </div>
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save Pincode'}</button>
      </div>
    </form>
  );
};

export const Pincode: React.FC = () => {
  const { hasPermission } = useAuth();
  const [pincodes, setPincodes] = useState<Pincode[]>([]);
  const [filteredPincodes, setFilteredPincodes] = useState<Pincode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [editingPincode, setEditingPincode] = useState<Pincode | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const districts = Array.from(new Set(pincodes.map(p => p.district)));

  useEffect(() => { loadPincodes(); }, []);

  const loadPincodes = async () => {
    try {
      setLoading(true);
      const data = await pincodeService.getAllPincodes();
      setPincodes(data); setFilteredPincodes(data);
    } catch { setError('Failed to load pincodes'); }
    finally { setLoading(false); }
  };

  const handleFilter = (filters: PincodeFilterOptions) => {
    let f = pincodes;
    if (filters.pincode) f = f.filter(p => p.pincode.includes(filters.pincode!));
    if (filters.status) f = f.filter(p => p.status === filters.status);
    if (filters.district) f = f.filter(p => p.district === filters.district);
    setFilteredPincodes(f);
  };

  const handleAdd = async (formData: PincodeFormData) => {
    try {
      setIsSubmitting(true);
      const newRecord = await pincodeService.createPincode(formData);
      setPincodes(prev => [...prev, newRecord]); setFilteredPincodes(prev => [...prev, newRecord]);
      setShowAddModal(false); setSuccess('Pincode created successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to create pincode'); }
    finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (formData: PincodeFormData) => {
    if (!editingPincode) return;
    try {
      setIsSubmitting(true);
      const updated = await pincodeService.updatePincode(editingPincode.id, formData);
      setPincodes(prev => prev.map(p => p.id === editingPincode.id ? updated : p));
      setFilteredPincodes(prev => prev.map(p => p.id === editingPincode.id ? updated : p));
      setEditingPincode(null); setSuccess('Pincode updated successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to update pincode'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this pincode?')) return;
    try {
      await pincodeService.deletePincode(id);
      setPincodes(prev => prev.filter(p => p.id !== id)); setFilteredPincodes(prev => prev.filter(p => p.id !== id));
      setSuccess('Pincode deleted successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to delete pincode'); }
  };

  const handleCSVUpload = async (file: File) => {
    try {
      const result = await pincodeService.uploadPincodesCSV(file);
      if (result.success) { await loadPincodes(); setShowCSVModal(false); setSuccess(`CSV upload completed! ${result.created} created, ${result.updated} updated, ${result.errors} errors.`); setTimeout(() => setSuccess(''), 5000); }
      else { setError(result.message || 'CSV upload failed'); }
    } catch { setError('Failed to upload CSV'); }
  };

  const getStatusIcon = (status: string) => status === 'active'
    ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />;

  const columns = [
    {
      key: 'actions', label: 'Action',
      render: (_: unknown, row: Pincode) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard module="loan" permission="write"><button onClick={() => setEditingPincode(row)} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"><Edit className="w-4 h-4" /></button></PermissionGuard>
          <PermissionGuard module="loan" permission="delete"><button onClick={() => handleDelete(row.id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><Trash2 className="w-4 h-4" /></button></PermissionGuard>
        </div>
      ),
    },
    { key: 'pincode', label: 'Pincode', sortable: true, render: (v: string) => <div className="flex items-center space-x-2"><MapPin className="w-4 h-4 text-gray-400" /><span className="font-mono font-medium">{v}</span></div> },
    { key: 'state', label: 'State', sortable: true },
    { key: 'district', label: 'District', sortable: true },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (v: string) => <div className="flex items-center space-x-2">{getStatusIcon(v)}<span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${v === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span></div>,
    },
  ];

  const filterComponent = (
    <div className="flex items-center space-x-3">
      <PincodeFilterDropdown onFilter={handleFilter} districts={districts} />
      <PermissionGuard module="loan" permission="read">
        <button onClick={async () => { await pincodeService.downloadTemplate(); }} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><FileDown className="w-4 h-4" /><span>Template</span></button>
      </PermissionGuard>
      <PermissionGuard module="loan" permission="read">
        <button onClick={async () => { await pincodeService.exportPincodesCSV(filteredPincodes); }} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Download className="w-4 h-4" /><span>Export CSV</span></button>
      </PermissionGuard>
      <PermissionGuard module="loan" permission="write">
        <button onClick={() => setShowCSVModal(true)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Upload className="w-4 h-4" /><span>Upload CSV</span></button>
      </PermissionGuard>
    </div>
  );

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pincode</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Manage pincode information and locations</p></div>
      {success && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2"><CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{success}</span></div>}
      {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2"><AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span></div>}
      <DataTable columns={columns} data={filteredPincodes} title="Pincode Management" loading={loading} onAdd={() => setShowAddModal(true)} filterComponent={filterComponent} />
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Pincode" size="md">
        <PincodeForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} isSubmitting={isSubmitting} />
      </Modal>
      <Modal isOpen={!!editingPincode} onClose={() => setEditingPincode(null)} title="Edit Pincode" size="md">
        {editingPincode && <PincodeForm onSubmit={handleUpdate} onCancel={() => setEditingPincode(null)} initialData={editingPincode} isSubmitting={isSubmitting} />}
      </Modal>
      <Modal isOpen={showCSVModal} onClose={() => setShowCSVModal(false)} title="Upload Pincodes CSV" size="lg">
        <CSVUpload onUpload={handleCSVUpload} onCancel={() => setShowCSVModal(false)} templateColumns={['pincode', 'status', 'district']} entityName="pincodes" />
      </Modal>
    </div>
  );
};