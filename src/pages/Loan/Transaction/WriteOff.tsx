// ─── WriteOffPage.tsx ──────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from '../../../components/Common/DataTable';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { writeOffService, WriteOffRecord, WriteOffFilterOptions } from '../../../services/transactionService/writeOffService';
import {
  Upload, Calendar, CheckCircle, Filter, ChevronDown, DollarSign, AlertCircle,
} from 'lucide-react';

const FilterDropdown: React.FC<{ onFilter: (f: WriteOffFilterOptions) => void }> = ({ onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<WriteOffFilterOptions>({ dateFrom: '', dateTo: '' });
  const change = (k: keyof WriteOffFilterOptions, v: string) => setFilters(prev => ({ ...prev, [k]: v }));
  const apply = () => { onFilter(filters); setIsOpen(false); };
  const clear = () => { const e = { dateFrom: '', dateTo: '' }; setFilters(e); onFilter(e); };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
        <Filter className="w-4 h-4" /><span>Search Filter</span><ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 p-4 space-y-4">
          <div className="flex items-center space-x-2"><Calendar className="w-5 h-5 text-gray-400" /><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Date Range</h3></div>
          <div className="grid grid-cols-2 gap-4">
            {[{ key: 'dateFrom' as const, label: 'Date From', required: true }, { key: 'dateTo' as const, label: 'Date To', required: true }].map(({ key, label, required }) => (
              <div key={key}><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
                <input type="date" value={filters[key]} onChange={e => change(key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" /></div>
            ))}
          </div>
          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
            <button onClick={clear} className="px-4 py-2 text-gray-600 dark:text-gray-400">Clear All</button>
            <button onClick={apply} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Apply Filters</button>
          </div>
        </div>
      )}
    </div>
  );
};

export const WriteOffPage: React.FC = () => {
  const [records, setRecords] = useState<WriteOffRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<WriteOffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async (filters?: Partial<WriteOffFilterOptions>) => {
    try {
      setLoading(true);
      const data = await writeOffService.getAllRecords(filters);
      setRecords(data); setFilteredRecords(data);
    } catch { setError('Failed to load write-off data'); }
    finally { setLoading(false); }
  };

  const handleFilter = async (filters: WriteOffFilterOptions) => {
    await loadRecords(filters);
  };

  const handleUpload = () => uploadInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const result = await writeOffService.uploadWriteOff(file);
      setSuccess(result.message || 'File uploaded successfully!'); await loadRecords(); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Upload failed'); }
    e.target.value = '';
  };

  const handleWriteOff = async () => {
    if (!window.confirm('Are you sure you want to process write-offs for all displayed records?')) return;
    try {
      setIsProcessing(true);
      const result = await writeOffService.processWriteOff(filteredRecords.map(r => r.loanCode));
      setSuccess(result.message || `${result.processed} loans written off successfully!`); await loadRecords(); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Write-off processing failed'); }
    finally { setIsProcessing(false); }
  };

  const totalPos = records.reduce((s, r) => s + r.pos, 0);
  const totalIarr = records.reduce((s, r) => s + r.iarr, 0);

  const columns = [
    { key: 'loanCode', label: 'Loan Code', sortable: true, render: (v: string) => <span className="font-mono font-medium">{v}</span> },
    { key: 'pos', label: 'POS', sortable: true, render: (v: number) => <div className="flex items-center space-x-1"><DollarSign className="w-4 h-4 text-gray-400" /><span className="font-medium">₹{v.toLocaleString()}</span></div> },
    { key: 'iarr', label: 'IARR', sortable: true, render: (v: number) => <div className="flex items-center space-x-1"><DollarSign className="w-4 h-4 text-gray-400" /><span>₹{v.toLocaleString()}</span></div> },
  ];

  return (
    <div className="space-y-6">
      <input ref={uploadInputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileChange} />
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Write Off</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Manage loan write-offs</p></div>
      {success && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2"><CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{success}</span></div>}
      {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2"><AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span></div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ label: 'Total POS', value: `₹${totalPos.toLocaleString()}`, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' }, { label: 'Total IARR', value: `₹${totalIarr.toLocaleString()}`, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' }, { label: 'Total Write-Off', value: `₹${(totalPos + totalIarr).toLocaleString()}`, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' }].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3"><div className={`p-2 ${bg} rounded-lg`}><DollarSign className={`w-5 h-5 ${color}`} /></div><div><p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p><p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p></div></div>
          </div>
        ))}
      </div>
      <DataTable columns={columns} data={filteredRecords} title="Write-Off Management" loading={loading}
        filterComponent={<div className="flex items-center space-x-3">
          <FilterDropdown onFilter={handleFilter} />
          <PermissionGuard module="loan" permission="write"><button onClick={handleUpload} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Upload className="w-4 h-4" /><span>Upload</span></button></PermissionGuard>
          <PermissionGuard module="loan" permission="write"><button onClick={handleWriteOff} disabled={isProcessing || filteredRecords.length === 0} className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"><span>{isProcessing ? 'Processing...' : 'Write Off'}</span></button></PermissionGuard>
        </div>} />
    </div>
  );
};
