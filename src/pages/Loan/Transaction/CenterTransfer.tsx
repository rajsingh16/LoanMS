// ─── CenterTransferPage.tsx ────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { DataTable } from '../../../components/Common/DataTable';
import { centerTransferService, CenterTransferRecord, CenterTransferFilterOptions } from '../../../services/transactionService/centerTransferService';
import {
  Search, Building, Calendar, MapPin, CheckCircle, XCircle,
  Filter, ChevronDown, ArrowRight, User, AlertCircle,
} from 'lucide-react';

const FilterDropdown: React.FC<{ onFilter: (f: CenterTransferFilterOptions) => void; onFetch: () => void }> = ({ onFilter, onFetch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<CenterTransferFilterOptions>({ branch: '' });
  const change = (k: keyof CenterTransferFilterOptions, v: string) => setFilters(prev => ({ ...prev, [k]: v }));
  const apply = () => { onFilter(filters); setIsOpen(false); };
  const clear = () => { setFilters({ branch: '' }); onFilter({ branch: '' }); };
  const fetch = () => { onFetch(); setIsOpen(false); };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
        <Filter className="w-4 h-4" /><span>Search Filter</span><ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 p-4 space-y-4">
          <div className="flex items-center space-x-2"><Search className="w-5 h-5 text-gray-400" /><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Filters</h3></div>
          {[{ key: 'branch' as const, label: 'Branch', required: true }, { key: 'foId' as const, label: 'FO ID' }, { key: 'center' as const, label: 'Center' }].map(({ key, label, required }) => (
            <div key={key}><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
              <input type="text" value={(filters[key] as string) || ''} onChange={e => change(key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder={`Enter ${label.toLowerCase()}`} /></div>
          ))}
          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
            <button onClick={clear} className="px-4 py-2 text-gray-600 dark:text-gray-400">Clear All</button>
            <div className="flex space-x-2">
              <button onClick={fetch} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Fetch</button>
              <button onClick={apply} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Apply Filters</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const CenterTransferPage: React.FC = () => {
  const [records, setRecords] = useState<CenterTransferRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<CenterTransferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [targetBranch, setTargetBranch] = useState('');
  const [targetFoId, setTargetFoId] = useState('');
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await centerTransferService.getCenters();
      setRecords(data); setFilteredRecords(data);
    } catch { setError('Failed to load centers'); }
    finally { setLoading(false); }
  };

  const handleFilter = (filters: CenterTransferFilterOptions) => {
    let f = records;
    if (filters.branch) f = f.filter(r => r.branch.toLowerCase().includes(filters.branch.toLowerCase()));
    if (filters.foId) f = f.filter(r => r.collPartnerId.toLowerCase().includes(filters.foId!.toLowerCase()));
    if (filters.center) f = f.filter(r => r.centerName.toLowerCase().includes(filters.center!.toLowerCase()) || r.centerCode.toLowerCase().includes(filters.center!.toLowerCase()));
    setFilteredRecords(f);
  };

  const handleFetch = async () => {
    await loadRecords();
    setSuccess('Centers fetched successfully!'); setTimeout(() => setSuccess(''), 3000);
  };

  const handleTransfer = async () => {
    if (!targetBranch || !targetFoId || selectedCenters.length === 0) {
      setError('Please select target branch, FO ID, and at least one center'); setTimeout(() => setError(''), 3000); return;
    }
    try {
      setIsTransferring(true);
      const result = await centerTransferService.transferCenters({ centerIds: selectedCenters, targetBranch, targetFoId });
      setSuccess(result.message || `${selectedCenters.length} centers transferred to ${targetBranch}`);
      setSelectedCenters([]); await loadRecords(); setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message || 'Transfer failed'); }
    finally { setIsTransferring(false); }
  };

  const toggle = (id: string) => setSelectedCenters(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const getStatusIcon = (s: string) => s === 'active' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />;

  const columns = [
    { key: 'select', label: 'Select', render: (_: unknown, row: CenterTransferRecord) => <input type="checkbox" checked={selectedCenters.includes(row.id)} onChange={() => toggle(row.id)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" /> },
    { key: 'branch', label: 'Branch', sortable: true, render: (v: string) => <div className="flex items-center space-x-2"><Building className="w-4 h-4 text-gray-400" /><span>{v}</span></div> },
    { key: 'centerId', label: 'Center Id', sortable: true, render: (v: string) => <span className="font-mono font-medium">{v}</span> },
    { key: 'centerName', label: 'Center Name', sortable: true },
    { key: 'centerCode', label: 'Center Code', sortable: true, render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'centerDay', label: 'Center Day', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{v}</span></div> },
    { key: 'address1', label: 'Address 1', render: (v: string) => <div className="flex items-center space-x-1"><MapPin className="w-4 h-4 text-gray-400" /><span>{v}</span></div> },
    { key: 'address2', label: 'Address 2' }, { key: 'address3', label: 'Address 3' }, { key: 'city', label: 'City', sortable: true }, { key: 'meetingPlace', label: 'Meeting Place' },
    { key: 'collPartnerId', label: 'Coll Partner Id', render: (v: string) => <div className="flex items-center space-x-1"><User className="w-4 h-4 text-gray-400" /><span className="font-mono">{v}</span></div> },
    { key: 'villageId', label: 'Village Id' },
    { key: 'status', label: 'Status', sortable: true, render: (v: string) => <div className="flex items-center space-x-2">{getStatusIcon(v)}<span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${v === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span></div> },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Center Transfer</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Transfer centers between branches and field officers</p></div>
      {success && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2"><CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{success}</span></div>}
      {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2"><AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span></div>}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transfer Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Branch <span className="text-red-500">*</span></label>
            <input type="text" value={targetBranch} onChange={e => setTargetBranch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" placeholder="Enter target branch" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target FO ID <span className="text-red-500">*</span></label>
            <input type="text" value={targetFoId} onChange={e => setTargetFoId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" placeholder="Enter target FO ID" /></div>
          <div className="flex items-end">
            <button onClick={handleTransfer} disabled={!targetBranch || !targetFoId || selectedCenters.length === 0 || isTransferring} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              <ArrowRight className="w-4 h-4" /><span>{isTransferring ? 'Transferring...' : 'Transfer'}</span>
            </button>
          </div>
        </div>
      </div>
      <DataTable columns={columns} data={filteredRecords} title={`Centers — ${filteredRecords.length} found · ${selectedCenters.length} selected`} loading={loading}
        filterComponent={<FilterDropdown onFilter={handleFilter} onFetch={handleFetch} />} />
    </div>
  );
};  