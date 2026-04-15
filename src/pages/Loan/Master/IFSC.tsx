import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { CSVUpload } from '../../../components/Common/CSVUpload';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { DataTable } from '../../../components/Common/DataTable';
import { useAuth } from '../../../hooks/useAuth';
import { ifscService, IFSCCode, IFSCFormData, IFSCFilterOptions } from '../../../services/ifscService';
import {
  Building, Edit, Trash2, CheckCircle, XCircle, Download, Upload,
  AlertCircle, FileDown, Filter, ChevronDown, Search, Phone, MapPin,
} from 'lucide-react';

const IFSCFilterDropdown: React.FC<{
  onFilter: (filters: IFSCFilterOptions) => void;
  bankNames: string[];
}> = ({ onFilter, bankNames }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<IFSCFilterOptions>({});

  const handleFilterChange = (key: keyof IFSCFilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const applyFilters = () => { onFilter(filters); setIsOpen(false); };
  const clearFilters = () => { setFilters({}); onFilter({}); };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
      >
        <Filter className="w-4 h-4" />
        <span>Search Filter</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Filters</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IFSC Code</label>
              <input type="text" value={filters.ifscCode || ''} onChange={e => handleFilterChange('ifscCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter IFSC code" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
              <select value={filters.bankName || ''} onChange={e => handleFilterChange('bankName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option value="">All Banks</option>
                {bankNames.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
              <button onClick={clearFilters} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800">Clear All</button>
              <button onClick={applyFilters} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Apply Filters</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const IFSCForm: React.FC<{
  onSubmit: (data: IFSCFormData) => void;
  onCancel: () => void;
  initialData?: Partial<IFSCFormData>;
  isSubmitting?: boolean;
}> = ({ onSubmit, onCancel, initialData = {}, isSubmitting }) => {
  const [formData, setFormData] = useState<IFSCFormData>({
    ifscCode: initialData.ifscCode || '',
    bankName: initialData.bankName || '',
    bankBranch: initialData.bankBranch || '',
    bankAddress: initialData.bankAddress || '',
    state: initialData.state || '',
    city: initialData.city || '',
    mobileNumber: initialData.mobileNumber || '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof IFSCFormData, string>>>({});

  const bankNames = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank'];
  const states = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan'];

  const validate = (): boolean => {
    const e: Partial<Record<keyof IFSCFormData, string>> = {};
    if (!formData.ifscCode) e.ifscCode = 'IFSC Code is required';
    if (!formData.bankName) e.bankName = 'Bank Name is required';
    if (!formData.bankBranch) e.bankBranch = 'Bank Branch is required';
    if (!formData.state) e.state = 'State is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const handleChange = (field: keyof IFSCFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">🏦 IFSC Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { field: 'ifscCode' as const, label: 'IFSC Code', required: true, transform: (v: string) => v.toUpperCase() },
          { field: 'bankBranch' as const, label: 'Bank Branch', required: true },
          { field: 'city' as const, label: 'City' },
          { field: 'mobileNumber' as const, label: 'Mobile Number', type: 'tel' },
        ].map(({ field, label, required, transform, type }) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input type={type || 'text'} value={(formData[field] as string) || ''}
              onChange={e => handleChange(field, transform ? transform(e.target.value) : e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors[field] ? 'border-red-300' : 'border-gray-300'}`}
              placeholder={`Enter ${label.toLowerCase()}`} />
            {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name <span className="text-red-500">*</span></label>
          <select value={formData.bankName} onChange={e => handleChange('bankName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.bankName ? 'border-red-300' : 'border-gray-300'}`}>
            <option value="">Select Bank</option>
            {bankNames.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State <span className="text-red-500">*</span></label>
          <select value={formData.state} onChange={e => handleChange('state', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.state ? 'border-red-300' : 'border-gray-300'}`}>
            <option value="">Select State</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Address</label>
          <textarea value={formData.bankAddress} onChange={e => handleChange('bankAddress', e.target.value)}
            rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter bank address" />
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onCancel} disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
        <button type="submit" disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Saving...' : 'Save IFSC'}
        </button>
      </div>
    </form>
  );
};

export const IFSC: React.FC = () => {
  const { hasPermission } = useAuth();
  const [ifscCodes, setIfscCodes] = useState<IFSCCode[]>([]);
  const [filteredIfscCodes, setFilteredIfscCodes] = useState<IFSCCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [editingIfsc, setEditingIfsc] = useState<IFSCCode | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bankNames = Array.from(new Set(ifscCodes.map(i => i.bankName)));

  useEffect(() => { loadIfscCodes(); }, []);

  const loadIfscCodes = async () => {
    try {
      setLoading(true);
      const data = await ifscService.getAllIFSC();
      setIfscCodes(data);
      setFilteredIfscCodes(data);
    } catch (err) {
      setError('Failed to load IFSC codes');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters: IFSCFilterOptions) => {
    let filtered = ifscCodes;
    if (filters.ifscCode) filtered = filtered.filter(i => i.ifscCode.toLowerCase().includes(filters.ifscCode!.toLowerCase()));
    if (filters.bankName) filtered = filtered.filter(i => i.bankName === filters.bankName);
    setFilteredIfscCodes(filtered);
  };

  const handleAdd = async (formData: IFSCFormData) => {
    try {
      setIsSubmitting(true);
      const newRecord = await ifscService.createIFSC(formData);
      setIfscCodes(prev => [...prev, newRecord]);
      setFilteredIfscCodes(prev => [...prev, newRecord]);
      setShowAddModal(false);
      setSuccess('IFSC code created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError('Failed to create IFSC code'); }
    finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (formData: IFSCFormData) => {
    if (!editingIfsc) return;
    try {
      setIsSubmitting(true);
      const updated = await ifscService.updateIFSC(editingIfsc.id, formData);
      setIfscCodes(prev => prev.map(i => i.id === editingIfsc.id ? updated : i));
      setFilteredIfscCodes(prev => prev.map(i => i.id === editingIfsc.id ? updated : i));
      setEditingIfsc(null);
      setSuccess('IFSC code updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError('Failed to update IFSC code'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this IFSC code?')) return;
    try {
      await ifscService.deleteIFSC(id);
      setIfscCodes(prev => prev.filter(i => i.id !== id));
      setFilteredIfscCodes(prev => prev.filter(i => i.id !== id));
      setSuccess('IFSC code deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError('Failed to delete IFSC code'); }
  };

  const handleCSVUpload = async (file: File) => {
    try {
      const result = await ifscService.uploadIFSCCSV(file);
      if (result.success) {
        await loadIfscCodes();
        setShowCSVModal(false);
        setSuccess(`CSV upload completed! ${result.created} created, ${result.updated} updated, ${result.errors} errors.`);
        setTimeout(() => setSuccess(''), 5000);
      } else { setError(result.message || 'CSV upload failed'); }
    } catch (err) { setError('Failed to upload CSV'); }
  };

  const handleExportCSV = async () => {
    try { await ifscService.exportIFSCCSV(filteredIfscCodes); setSuccess('CSV exported successfully!'); setTimeout(() => setSuccess(''), 3000); }
    catch (err) { setError('Failed to export CSV'); }
  };

  const handleDownloadTemplate = async () => {
    try { await ifscService.downloadTemplate(); setSuccess('Template downloaded!'); setTimeout(() => setSuccess(''), 3000); }
    catch (err) { setError('Failed to download template'); }
  };

  const columns = [
    {
      key: 'actions', label: 'Action',
      render: (_: unknown, row: IFSCCode) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard module="loan" permission="write">
            <button onClick={() => setEditingIfsc(row)} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
          </PermissionGuard>
          <PermissionGuard module="loan" permission="delete">
            <button onClick={() => handleDelete(row.id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
          </PermissionGuard>
        </div>
      ),
    },
    { key: 'ifscCode', label: 'IFSC Code', sortable: true, render: (v: string) => <span className="font-mono font-medium">{v}</span> },
    { key: 'bankName', label: 'Bank Name', sortable: true, render: (v: string) => <div className="flex items-center space-x-2"><Building className="w-4 h-4 text-gray-400" /><span className="font-medium">{v}</span></div> },
    { key: 'bankBranch', label: 'Bank Branch', sortable: true },
    { key: 'branchAddress', label: 'Branch Address', render: (v: string) => <div className="flex items-center space-x-1"><MapPin className="w-4 h-4 text-gray-400" /><span className="truncate max-w-48" title={v}>{v}</span></div> },
    { key: 'city', label: 'City', sortable: true },
    { key: 'state', label: 'State', sortable: true },
    { key: 'mobileNumber', label: 'Mobile Number', render: (v?: string) => v ? <div className="flex items-center space-x-1"><Phone className="w-4 h-4 text-gray-400" /><span>{v}</span></div> : '-' },
  ];

  const filterComponent = (
    <div className="flex items-center space-x-3">
      <IFSCFilterDropdown onFilter={handleFilter} bankNames={bankNames} />
      <PermissionGuard module="loan" permission="read">
        <button onClick={handleDownloadTemplate} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
          <FileDown className="w-4 h-4" /><span>Template</span>
        </button>
      </PermissionGuard>
      <PermissionGuard module="loan" permission="read">
        <button onClick={handleExportCSV} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
          <Download className="w-4 h-4" /><span>Export CSV</span>
        </button>
      </PermissionGuard>
      <PermissionGuard module="loan" permission="write">
        <button onClick={() => setShowCSVModal(true)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
          <Upload className="w-4 h-4" /><span>Upload CSV</span>
        </button>
      </PermissionGuard>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">IFSC</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage IFSC codes and bank branch information</p>
      </div>
      {success && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2"><CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{success}</span></div>}
      {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2"><AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span></div>}
      <DataTable columns={columns} data={filteredIfscCodes} title="IFSC Management" loading={loading} onAdd={() => setShowAddModal(true)} filterComponent={filterComponent} />
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New IFSC Code" size="lg">
        <IFSCForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} isSubmitting={isSubmitting} />
      </Modal>
      <Modal isOpen={!!editingIfsc} onClose={() => setEditingIfsc(null)} title="Edit IFSC Code" size="lg">
        {editingIfsc && <IFSCForm onSubmit={handleUpdate} onCancel={() => setEditingIfsc(null)} initialData={editingIfsc} isSubmitting={isSubmitting} />}
      </Modal>
      <Modal isOpen={showCSVModal} onClose={() => setShowCSVModal(false)} title="Upload IFSC CSV" size="lg">
        <CSVUpload onUpload={handleCSVUpload} onCancel={() => setShowCSVModal(false)} templateColumns={['ifscCode', 'bankName', 'bankBranch', 'bankAddress', 'state', 'city', 'mobileNumber']} entityName="IFSC codes" />
      </Modal>
    </div>
  );
};