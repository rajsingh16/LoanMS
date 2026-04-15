// ─── CreditBureauPage.tsx ──────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { DataTable } from '../../../components/Common/DataTable';
import { creditBureauService, CreditBureauRecord, CreditBureauFilterOptions } from '../../../services/transactionService/creditBureauService';
import {
  Search, Download, CheckCircle, XCircle, Calendar, User, CreditCard,
  Filter, ChevronDown, Building, FileText, AlertCircle,
} from 'lucide-react';

const FilterDropdown: React.FC<{ onFilter: (f: CreditBureauFilterOptions) => void }> = ({ onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<CreditBureauFilterOptions>({ applicationId: '', businessPartner: '', dateFrom: '', dateTo: '', cbPartner: '' });
  const change = (k: keyof CreditBureauFilterOptions, v: string) => setFilters(prev => ({ ...prev, [k]: v }));
  const apply = () => { onFilter(filters); setIsOpen(false); };
  const clear = () => { const e = { applicationId: '', businessPartner: '', dateFrom: '', dateTo: '', cbPartner: '' }; setFilters(e); onFilter(e); };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
        <Filter className="w-4 h-4" /><span>Search Filter</span><ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 p-4 space-y-4">
          <div className="flex items-center space-x-2"><Search className="w-5 h-5 text-gray-400" /><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Filters</h3></div>
          {[{ key: 'branch' as const, label: 'Branch' }, { key: 'applicationId' as const, label: 'Application ID', required: true }, { key: 'businessPartner' as const, label: 'Business Partner', required: true }].map(({ key, label, required }) => (
            <div key={key}><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
              <input type="text" value={(filters[key] as string) || ''} onChange={e => change(key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" /></div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            {[{ key: 'dateFrom' as const, label: 'Date From', required: true }, { key: 'dateTo' as const, label: 'Date To', required: true }].map(({ key, label, required }) => (
              <div key={key}><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
                <input type="date" value={filters[key]} onChange={e => change(key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" /></div>
            ))}
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CB Partner <span className="text-red-500">*</span></label>
            <select value={filters.cbPartner} onChange={e => change('cbPartner', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">Select CB Partner</option><option value="CIBIL">CIBIL</option><option value="Experian">Experian</option><option value="Equifax">Equifax</option><option value="CRIF Highmark">CRIF Highmark</option>
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

export const CreditBureauPage: React.FC = () => {
  const [records, setRecords] = useState<CreditBureauRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<CreditBureauRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    try { setLoading(true); const data = await creditBureauService.getAllRecords(); setRecords(data); setFilteredRecords(data); }
    catch { setError('Failed to load credit bureau records'); }
    finally { setLoading(false); }
  };

  const handleFilter = (filters: CreditBureauFilterOptions) => {
    let f = records;
    if (filters.branch) f = f.filter(r => r.centerCode.includes(filters.branch!));
    if (filters.applicationId) f = f.filter(r => r.applicationId.includes(filters.applicationId));
    if (filters.businessPartner) f = f.filter(r => r.bcPartner.includes(filters.businessPartner));
    if (filters.dateFrom && filters.dateTo) f = f.filter(r => r.applicationDate >= filters.dateFrom && r.applicationDate <= filters.dateTo);
    setFilteredRecords(f);
  };

  const handleCBCheck = async () => {
    try { setSuccess('CB Check initiated. Results will be updated shortly.'); setTimeout(() => setSuccess(''), 3000); }
    catch { setError('CB Check failed'); }
  };

  const getBureauResultIcon = (r: string) => r === 'pass' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />;
  const getStatusColor = (s: string) => { switch (s) { case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'; case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'; default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'; } };

  const columns = [
    { key: 'applicationId', label: 'Application Id', sortable: true, render: (v: string) => <span className="font-mono font-medium">{v}</span> },
    { key: 'applicationDate', label: 'Application Date', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> },
    { key: 'bcPartner', label: 'BC Partner', sortable: true },
    { key: 'applicationStatus', label: 'Application Status', sortable: true, render: (v: string) => <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(v)}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span> },
    { key: 'centerCode', label: 'Center Code', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Building className="w-4 h-4 text-gray-400" /><span>{v}</span></div> },
    { key: 'bureauResult', label: 'Bureau Result', sortable: true, render: (v: string) => <div className="flex items-center space-x-2">{getBureauResultIcon(v)}<span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${v === 'pass' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>{v.toUpperCase()}</span></div> },
    { key: 'clientName', label: 'Client Name', sortable: true, render: (v: string) => <div className="flex items-center space-x-2"><User className="w-4 h-4 text-gray-400" /><span className="font-medium">{v}</span></div> },
    { key: 'aadhaarNumber', label: 'Aadhar Number', render: (v: string) => <div className="flex items-center space-x-1"><CreditCard className="w-4 h-4 text-gray-400" /><span className="font-mono">{v}</span></div> },
    { key: 'voterNumber', label: 'Voter Number', render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'appliedAmount', label: 'Applied Amount', sortable: true, render: (v: number) => <span className="font-medium">₹{v.toLocaleString()}</span> },
  ];

  const passed = records.filter(r => r.bureauResult === 'pass').length;
  const failed = records.filter(r => r.bureauResult === 'fail').length;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Credit Bureau</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Check and manage credit bureau reports</p></div>
      {success && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2"><CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{success}</span></div>}
      {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2"><AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span></div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ label: 'Passed', count: passed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' }, { label: 'Failed', count: failed, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' }, { label: 'Total Checks', count: records.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' }].map(({ label, count, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3"><div className={`p-2 ${bg} rounded-lg`}><Icon className={`w-5 h-5 ${color}`} /></div><div><p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p><p className="text-xl font-bold text-gray-900 dark:text-white">{count}</p></div></div>
          </div>
        ))}
      </div>
      <DataTable columns={columns} data={filteredRecords} title="Credit Bureau Records" loading={loading}
        filterComponent={<div className="flex items-center space-x-3">
          <FilterDropdown onFilter={handleFilter} />
          <button onClick={async () => { await creditBureauService.exportCSV(filteredRecords); }} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Download className="w-4 h-4" /><span>Download</span></button>
          <button onClick={handleCBCheck} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Search className="w-4 h-4" /><span>CB Check</span></button>
        </div>} />
    </div>
  );
};