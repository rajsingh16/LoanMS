// ─── CreditBureauPage.tsx ──────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { DataTable } from '../../../components/Common/DataTable';
import { creditBureauService, CreditBureauRecord, CreditBureauFilterOptions } from '../../../services/transactionService/creditBureauService';
import { Modal } from '../../../components/Common/Modal';
import { loanApplicationService, LoanApplicationListItem } from '../../../services/transactionService/loanApplicationService';
import {
  Search, Download, CheckCircle, XCircle, Calendar, User,
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
  const [applications, setApplications] = useState<LoanApplicationListItem[]>([]);
  const [checkOpen, setCheckOpen] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [provider, setProvider] = useState('Manual Test');
  const [checkRemarks, setCheckRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [manualRecord, setManualRecord] = useState<CreditBureauRecord | null>(null);
  const [manualResult, setManualResult] = useState<'pass' | 'fail' | 'review'>('review');
  const [creditScore, setCreditScore] = useState('');
  const [remarks, setRemarks] = useState('');
  const selectedApplication = applications.find(application => application.id === applicationId);

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    try { setLoading(true); setError(''); const [data, apps] = await Promise.all([creditBureauService.getAllRecords(), loanApplicationService.getAllApplications()]); setRecords(data); setFilteredRecords(data); setApplications(apps); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Failed to load credit bureau records'); }
    finally { setLoading(false); }
  };

  const handleFilter = (filters: CreditBureauFilterOptions) => {
    let f = records;
    if (filters.branch) f = f.filter(r => r.centerCode.includes(filters.branch!));
    if (filters.applicationId) f = f.filter(r => r.applicationId.includes(filters.applicationId));
    if (filters.businessPartner) f = f.filter(r => r.bcPartner.includes(filters.businessPartner));
    if (filters.cbPartner) f = f.filter(r => r.bureauProvider === filters.cbPartner);
    if (filters.dateFrom) f = f.filter(r => r.applicationDate >= filters.dateFrom);
    if (filters.dateTo) f = f.filter(r => r.applicationDate <= filters.dateTo);
    setFilteredRecords(f);
  };

  const openCheckModal = () => { setApplicationId(''); setProvider('Manual Test'); setCheckRemarks(''); setCheckOpen(true); };
  const handleCBCheck = async () => {
    if (!applicationId || !provider) { setError('Select a loan application and bureau provider.'); return; }
    try { setSaving(true); setError(''); await creditBureauService.runCBCheck(applicationId, provider, checkRemarks); setCheckOpen(false); setSuccess('Prototype CB check created as pending.'); await loadRecords(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'CB check failed'); }
    finally { setSaving(false); }
  };
  const handleManualResult = async () => {
    if (!manualRecord) return;
    try { setSaving(true); setError(''); await creditBureauService.submitManualResult(manualRecord.id, { bureauResult: manualResult, creditScore: creditScore ? Number(creditScore) : undefined, remarks }); setManualRecord(null); setSuccess('Synthetic test result recorded.'); await loadRecords(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Failed to record manual result'); }
    finally { setSaving(false); }
  };

  const getBureauResultIcon = (r: string | null) => r === 'pass' ? <CheckCircle className="w-4 h-4 text-green-600" /> : r === 'fail' ? <XCircle className="w-4 h-4 text-red-600" /> : <AlertCircle className="w-4 h-4 text-yellow-600" />;
  const getStatusColor = (s: string) => { switch (s) { case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'; case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'; default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'; } };

  const columns = [
    { key: 'applicationId', label: 'Application Id', sortable: true, render: (v: string) => <span className="font-mono font-medium">{v}</span> },
    { key: 'applicationDate', label: 'Application Date', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> },
    { key: 'bcPartner', label: 'BC Partner', sortable: true },
    { key: 'applicationStatus', label: 'Application Status', sortable: true, render: (v: string) => <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(v)}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span> },
    { key: 'centerCode', label: 'Center Code', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Building className="w-4 h-4 text-gray-400" /><span>{v}</span></div> },
    { key: 'bureauResult', label: 'Bureau Result', sortable: true, render: (v: string | null, row: CreditBureauRecord) => <div className="flex items-center space-x-2">{getBureauResultIcon(v)}<span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">{v?.toUpperCase() || row.checkStatus.toUpperCase()}</span>{row.isTest && <span className="text-xs font-semibold text-blue-600">TEST</span>}</div> },
    { key: 'clientName', label: 'Client Name', sortable: true, render: (v: string) => <div className="flex items-center space-x-2"><User className="w-4 h-4 text-gray-400" /><span className="font-medium">{v}</span></div> },
    { key: 'appliedAmount', label: 'Applied Amount', sortable: true, render: (v: number) => <span className="font-medium">₹{v.toLocaleString()}</span> },
    { key: 'id', label: 'Action', render: (_v: string, row: CreditBureauRecord) => row.isTest && row.checkStatus === 'pending' ? <button onClick={() => { setManualRecord(row); setCreditScore(''); setRemarks(''); }} className="text-sm text-blue-600 hover:underline">Record result</button> : '—' },
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
      <DataTable columns={columns} data={filteredRecords} title="Credit Bureau Records" loading={loading} onAdd={openCheckModal}
        filterComponent={<div className="flex items-center space-x-3">
          <FilterDropdown onFilter={handleFilter} />
          <button onClick={async () => { await creditBureauService.exportCSV(filteredRecords); }} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Download className="w-4 h-4" /><span>Download</span></button>
          <button onClick={openCheckModal} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Search className="w-4 h-4" /><span>CB Check</span></button>
        </div>} />
      <Modal isOpen={checkOpen} onClose={() => setCheckOpen(false)} title="Add Credit Bureau Record" size="lg"><div className="space-y-4 p-6"><p className="text-sm text-gray-600 dark:text-gray-300">Creates a pending manual prototype check; no external bureau is contacted.</p><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Loan Application<select value={applicationId} onChange={e => setApplicationId(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"><option value="">Select loan application</option>{applications.map(a => <option key={a.id} value={a.id}>{a.application_number} — {a.first_name} {a.last_name}</option>)}</select></label>{selectedApplication && <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-700 dark:bg-gray-700/40 sm:grid-cols-2"><div><span className="text-gray-500">Client Name</span><p className="font-medium dark:text-white">{selectedApplication.first_name} {selectedApplication.last_name}</p></div><div><span className="text-gray-500">Application Number</span><p className="font-medium dark:text-white">{selectedApplication.application_number}</p></div><div><span className="text-gray-500">Application Date</span><p className="font-medium dark:text-white">{String(selectedApplication.application_date).slice(0, 10)}</p></div><div><span className="text-gray-500">Branch</span><p className="font-medium dark:text-white">{selectedApplication.branch_name} ({selectedApplication.branch_code})</p></div><div><span className="text-gray-500">Center</span><p className="font-medium dark:text-white">{selectedApplication.center_name} ({selectedApplication.center_code})</p></div><div><span className="text-gray-500">Applied Loan Amount</span><p className="font-medium dark:text-white">₹{Number(selectedApplication.loan_amount).toLocaleString()}</p></div></div>}<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bureau Provider<select value={provider} onChange={e => setProvider(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"><option value="">Select provider</option><option value="Manual Test">Manual Test</option><option value="CIBIL">CIBIL</option><option value="Experian">Experian</option><option value="Equifax">Equifax</option><option value="CRIF Highmark">CRIF Highmark</option></select></label><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Remarks <span className="font-normal text-gray-500">(optional)</span><textarea value={checkRemarks} onChange={e => setCheckRemarks(e.target.value)} maxLength={2000} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" /></label><div className="flex justify-end gap-3"><button onClick={() => setCheckOpen(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300">Cancel</button><button disabled={!applicationId || !provider || saving} onClick={() => void handleCBCheck()} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">{saving ? 'Creating…' : 'Create pending check'}</button></div></div></Modal>
      <Modal isOpen={!!manualRecord} onClose={() => setManualRecord(null)} title="Record manual test result"><div className="space-y-4 p-6"><p className="rounded bg-blue-50 p-3 text-sm text-blue-800">TEST result only — not a genuine credit bureau report.</p><select value={manualResult} onChange={e => setManualResult(e.target.value as 'pass' | 'fail' | 'review')} className="w-full px-3 py-2 border rounded-lg"><option value="pass">Pass</option><option value="fail">Fail</option><option value="review">Review</option></select><input type="number" min="300" max="900" value={creditScore} onChange={e => setCreditScore(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Credit score (optional)" /><textarea value={remarks} onChange={e => setRemarks(e.target.value)} maxLength={2000} className="w-full px-3 py-2 border rounded-lg" placeholder="Remarks" /><button disabled={saving} onClick={() => void handleManualResult()} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save test result'}</button></div></Modal>
    </div>
  );
};
