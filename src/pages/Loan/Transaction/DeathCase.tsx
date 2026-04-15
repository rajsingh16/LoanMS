// ─── DeathCasePage.tsx ─────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from '../../../components/Common/DataTable';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { deathCaseService, DeathCaseRecord, DeathCaseFilterOptions } from '../../../services/transactionService/deathCaseService';
import {
  Download, Upload, Calendar, User, Phone, CheckCircle, XCircle,
  Filter, ChevronDown, Building, Edit, Trash2, AlertCircle,
} from 'lucide-react';

const FilterDropdown: React.FC<{ onFilter: (f: DeathCaseFilterOptions) => void }> = ({ onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<DeathCaseFilterOptions>({ deathReportDateFrom: '', deathReportDateTo: '' });
  const change = (k: keyof DeathCaseFilterOptions, v: string) => setFilters(prev => ({ ...prev, [k]: v }));
  const apply = () => { onFilter(filters); setIsOpen(false); };
  const clear = () => { const e = { deathReportDateFrom: '', deathReportDateTo: '' }; setFilters(e); onFilter(e); };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
        <Filter className="w-4 h-4" /><span>Search Filter</span><ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 p-4 space-y-4">
          <div className="flex items-center space-x-2"><Calendar className="w-5 h-5 text-gray-400" /><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Filters</h3></div>
          <div className="grid grid-cols-2 gap-4">
            {[{ key: 'branch' as const, label: 'Branch', col: 1 }, { key: 'center' as const, label: 'Center', col: 1 }, { key: 'deathId' as const, label: 'Death ID', col: 1 }, { key: 'loanCode' as const, label: 'Loan Code', col: 1 }, { key: 'clientCode' as const, label: 'Client Code', col: 1 }].map(({ key, label }) => (
              <div key={key}><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                <input type="text" value={(filters[key] as string) || ''} onChange={e => change(key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" /></div>
            ))}
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Death Status</label>
              <select value={filters.deathStatus || ''} onChange={e => change('deathStatus', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="">All Status</option><option value="reported">Reported</option><option value="verified">Verified</option><option value="settled">Settled</option><option value="rejected">Rejected</option>
              </select></div>
            {[{ key: 'deathReportDateFrom' as const, label: 'Death Report Date From', required: true }, { key: 'deathReportDateTo' as const, label: 'Death Report Date To', required: true }, { key: 'caseProcessDateFrom' as const, label: 'Case Process Date From' }, { key: 'caseProcessDateTo' as const, label: 'Case Process Date To' }].map(({ key, label, required }) => (
              <div key={key}><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
                <input type="date" value={(filters[key] as string) || ''} onChange={e => change(key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" /></div>
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

export const DeathCasePage: React.FC = () => {
  const [records, setRecords] = useState<DeathCaseRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<DeathCaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const settlementInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    try { setLoading(true); const data = await deathCaseService.getAllRecords(); setRecords(data); setFilteredRecords(data); }
    catch { setError('Failed to load death case data'); }
    finally { setLoading(false); }
  };

  const handleFilter = (filters: DeathCaseFilterOptions) => {
    let f = records;
    if (filters.branch) f = f.filter(r => r.branch.toLowerCase().includes(filters.branch!.toLowerCase()));
    if (filters.center) f = f.filter(r => r.centerName.toLowerCase().includes(filters.center!.toLowerCase()) || r.centerCode.toLowerCase().includes(filters.center!.toLowerCase()));
    if (filters.deathId) f = f.filter(r => r.deathId.toLowerCase().includes(filters.deathId!.toLowerCase()));
    if (filters.loanCode) f = f.filter(r => r.loanCode.toLowerCase().includes(filters.loanCode!.toLowerCase()));
    if (filters.clientCode) f = f.filter(r => r.clientCode.toLowerCase().includes(filters.clientCode!.toLowerCase()));
    if (filters.deathStatus) f = f.filter(r => r.status === filters.deathStatus);
    if (filters.deathReportDateFrom && filters.deathReportDateTo) f = f.filter(r => r.dateReported >= filters.deathReportDateFrom && r.dateReported <= filters.deathReportDateTo);
    setFilteredRecords(f);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await deathCaseService.deleteRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id)); setFilteredRecords(prev => prev.filter(r => r.id !== id));
      setSuccess('Record deleted!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to delete record'); }
  };

  const handleSettlementUpload = () => settlementInputRef.current?.click();

  const handleSettlementFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const result = await deathCaseService.uploadSettlement(file);
      setSuccess(result.message || 'Settlement uploaded successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Settlement upload failed'); }
    e.target.value = '';
  };

  const getStatusIcon = (s: string) => { switch (s) { case 'settled': return <CheckCircle className="w-4 h-4 text-green-600" />; case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />; case 'verified': return <CheckCircle className="w-4 h-4 text-blue-600" />; default: return <Calendar className="w-4 h-4 text-yellow-600" />; } };
  const getStatusColor = (s: string) => { switch (s) { case 'settled': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'; case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'; case 'verified': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'; default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'; } };

  const columns = [
    { key: 'actions', label: 'Action', render: (_: unknown, row: DeathCaseRecord) => (<div className="flex items-center space-x-2"><PermissionGuard module="loan" permission="write"><button onClick={() => console.log('Edit', row.id)} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"><Edit className="w-4 h-4" /></button></PermissionGuard><PermissionGuard module="loan" permission="delete"><button onClick={() => handleDelete(row.id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><Trash2 className="w-4 h-4" /></button></PermissionGuard></div>) },
    { key: 'branch', label: 'Branch', sortable: true, render: (v: string) => <div className="flex items-center space-x-2"><Building className="w-4 h-4 text-gray-400" /><span>{v}</span></div> },
    { key: 'centerCode', label: 'Center Code', sortable: true }, { key: 'centerName', label: 'Center Name', sortable: true },
    { key: 'deathId', label: 'Death Id', sortable: true, render: (v: string) => <span className="font-mono font-medium">{v}</span> },
    { key: 'loanCode', label: 'Loan Code', sortable: true, render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'clientCode', label: 'Client Code', sortable: true, render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'clientName', label: 'Client Name', sortable: true, render: (v: string) => <div className="flex items-center space-x-2"><User className="w-4 h-4 text-gray-400" /><span className="font-medium">{v}</span></div> },
    { key: 'insuranceId', label: 'Insurance Id' },
    { key: 'dateReported', label: 'Date Reported', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> },
    { key: 'clientSpouseFlag', label: 'Client Spouse Flag', render: (v: boolean) => v ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" /> },
    { key: 'beneficiaryPhoneNumber', label: 'Beneficiary Phone', render: (v: string) => <div className="flex items-center space-x-1"><Phone className="w-4 h-4 text-gray-400" /><span>{v}</span></div> },
    { key: 'status', label: 'Status', sortable: true, render: (v: string) => <div className="flex items-center space-x-2">{getStatusIcon(v)}<span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(v)}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span></div> },
  ];

  return (
    <div className="space-y-6">
      <input ref={settlementInputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleSettlementFileChange} />
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Death Case</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Manage death cases and insurance claims</p></div>
      {success && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2"><CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{success}</span></div>}
      {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2"><AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span></div>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[{ label: 'Reported', status: 'reported', icon: Calendar, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' }, { label: 'Verified', status: 'verified', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' }, { label: 'Settled', status: 'settled', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' }, { label: 'Rejected', status: 'rejected', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' }].map(({ label, status, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3"><div className={`p-2 ${bg} rounded-lg`}><Icon className={`w-5 h-5 ${color}`} /></div><div><p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p><p className="text-xl font-bold text-gray-900 dark:text-white">{records.filter(r => r.status === status).length}</p></div></div>
          </div>
        ))}
      </div>
      <DataTable columns={columns} data={filteredRecords} title="Death Case Records" loading={loading}
        filterComponent={<div className="flex items-center space-x-3">
          <FilterDropdown onFilter={handleFilter} />
          <button onClick={() => deathCaseService.exportCSV(filteredRecords)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Download className="w-4 h-4" /><span>Download</span></button>
          <PermissionGuard module="loan" permission="write"><button onClick={handleSettlementUpload} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Upload className="w-4 h-4" /><span>Settlement</span></button></PermissionGuard>
        </div>} />
    </div>
  );
};