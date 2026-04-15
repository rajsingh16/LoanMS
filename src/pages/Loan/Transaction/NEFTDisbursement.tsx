// ─── NEFTDisbursementPage.tsx ──────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from '../../../components/Common/DataTable';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { neftDisbursementService, NEFTDisbursementRecord, NEFTUploaderRecord, NEFTDownloaderFilterOptions } from '../../../services/transactionService/neftDisbursementService';
import {
  Download, Upload, Play, Calendar, CheckCircle, XCircle,
  Filter, ChevronDown, CreditCard, User, DollarSign, Mail, MapPin, AlertCircle, Search,
} from 'lucide-react';

const DownloaderFilterDropdown: React.FC<{ onFilter: (f: NEFTDownloaderFilterOptions) => void }> = ({ onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<NEFTDownloaderFilterOptions>({ disbursementDateFrom: '', disbursementDateTo: '', bcPartner: '' });
  const change = (k: keyof NEFTDownloaderFilterOptions, v: string) => setFilters(prev => ({ ...prev, [k]: v }));
  const apply = () => { onFilter(filters); setIsOpen(false); };
  const clear = () => { const e = { disbursementDateFrom: '', disbursementDateTo: '', bcPartner: '' }; setFilters(e); onFilter(e); };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
        <Filter className="w-4 h-4" /><span>Search Filter</span><ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 p-4 space-y-4">
          <div className="flex items-center space-x-2"><Search className="w-5 h-5 text-gray-400" /><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Filters</h3></div>
          <div className="grid grid-cols-2 gap-4">
            {[{ key: 'disbursementDateFrom' as const, label: 'Disbursement Date From', required: true, type: 'date' }, { key: 'disbursementDateTo' as const, label: 'Disbursement Date To', required: true, type: 'date' }].map(({ key, label, required, type }) => (
              <div key={key}><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
                <input type={type} value={filters[key] || ''} onChange={e => change(key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" /></div>
            ))}
          </div>
          {[{ key: 'bcPartner' as const, label: 'BC Partner', required: true }, { key: 'zone' as const, label: 'Zone' }, { key: 'division' as const, label: 'Division' }, { key: 'branch' as const, label: 'Branch' }].map(({ key, label, required }) => (
            <div key={key}><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
              <input type="text" value={(filters[key] as string) || ''} onChange={e => change(key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder={`Enter ${label.toLowerCase()}`} /></div>
          ))}
          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
            <button onClick={clear} className="px-4 py-2 text-gray-600 dark:text-gray-400">Clear All</button>
            <button onClick={apply} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Apply Filters</button>
          </div>
        </div>
      )}
    </div>
  );
};

export const NEFTDisbursementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'downloader' | 'uploader'>('downloader');
  const [downloaderRecords, setDownloaderRecords] = useState<NEFTDisbursementRecord[]>([]);
  const [uploaderRecords, setUploaderRecords] = useState<NEFTUploaderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dl, ul] = await Promise.all([neftDisbursementService.getDownloaderRecords(), neftDisbursementService.getUploaderRecords()]);
      setDownloaderRecords(dl); setUploaderRecords(ul);
    } catch { setError('Failed to load NEFT disbursement data'); }
    finally { setLoading(false); }
  };

  const handleDownloaderFilter = async (filters: NEFTDownloaderFilterOptions) => {
    try {
      setLoading(true);
      const data = await neftDisbursementService.getDownloaderRecords(filters);
      setDownloaderRecords(data);
    } catch { setError('Failed to filter records'); }
    finally { setLoading(false); }
  };

  const handleDownload = async () => {
    try { await neftDisbursementService.downloadNEFT({}); setSuccess('NEFT file downloaded!'); setTimeout(() => setSuccess(''), 3000); }
    catch { setError('Download failed'); }
  };

  const handleUpload = () => uploadInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const result = await neftDisbursementService.uploadNEFT(file);
      setSuccess(result.message || 'File uploaded!'); await loadData(); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Upload failed'); }
    e.target.value = '';
  };

  const handleProcess = async () => {
    try {
      setIsProcessing(true);
      const result = await neftDisbursementService.processNEFT();
      setSuccess(result.message || `${result.processed} records processed!`); await loadData(); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Processing failed'); }
    finally { setIsProcessing(false); }
  };

  const getStatusIcon = (s: string) => s === 'success' || s === 'settled' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />;
  const getStatusColor = (s: string) => s === 'success' || s === 'settled' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';

  const downloaderColumns = [
    { key: 'transactionType', label: 'Transaction Type', sortable: true },
    { key: 'beneficiaryCode', label: 'Beneficiary Code', sortable: true, render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'beneficiaryAccountNumber', label: 'Beneficiary Account Number', render: (v: string) => <div className="flex items-center space-x-1"><CreditCard className="w-4 h-4 text-gray-400" /><span className="font-mono">{v}</span></div> },
    { key: 'instrumentAmount', label: 'Instrument Amount', sortable: true, render: (v: number) => <div className="flex items-center space-x-1"><DollarSign className="w-4 h-4 text-gray-400" /><span className="font-medium">₹{v.toLocaleString()}</span></div> },
    { key: 'beneficiaryName', label: 'Beneficiary Name', sortable: true, render: (v: string) => <div className="flex items-center space-x-2"><User className="w-4 h-4 text-gray-400" /><span className="font-medium">{v}</span></div> },
    { key: 'draweeLocation', label: 'Drawee Location' }, { key: 'printLocation', label: 'Print Location' },
    { key: 'beneficiaryAddress1', label: 'Beneficiary Address 1', render: (v: string) => <div className="flex items-center space-x-1"><MapPin className="w-4 h-4 text-gray-400" /><span>{v}</span></div> },
    { key: 'beneficiaryAddress2', label: 'Beneficiary Address 2' }, { key: 'beneficiaryAddress3', label: 'Beneficiary Address 3' }, { key: 'beneficiaryAddress4', label: 'Beneficiary Address 4' }, { key: 'beneficiaryAddress5', label: 'Beneficiary Address 5' },
    { key: 'instructionReferenceNumber', label: 'Instruction Reference Number' }, { key: 'customerReferenceNumber', label: 'Customer Reference Number' },
    { key: 'paymentDetails1', label: 'Payment Details 1' }, { key: 'paymentDetails2', label: 'Payment Details 2' }, { key: 'paymentDetails3', label: 'Payment Details 3' }, { key: 'paymentDetails4', label: 'Payment Details 4' }, { key: 'paymentDetails5', label: 'Payment Details 5' }, { key: 'paymentDetails6', label: 'Payment Details 6' }, { key: 'paymentDetails7', label: 'Payment Details 7' },
    { key: 'chequeNumber', label: 'Cheque Number' }, { key: 'chequeTransactionDate', label: 'Cheque Transaction Date', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'micrNumber', label: 'MICR Number' },
    { key: 'ifscCode', label: 'IFSC Code', render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'beneficiaryBankName', label: 'Beneficiary Bank Name' }, { key: 'beneficiaryBankBranchName', label: 'Beneficiary Bank Branch Name' },
    { key: 'beneficiaryEmailId', label: 'Beneficiary Email Id', render: (v: string) => <div className="flex items-center space-x-1"><Mail className="w-4 h-4 text-gray-400" /><span>{v}</span></div> },
  ];

  const uploaderColumns = [
    { key: 'transactionId', label: 'Transaction Id', sortable: true, render: (v: string) => <span className="font-mono font-medium">{v}</span> },
    { key: 'loanCode', label: 'Loan Code', sortable: true, render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'loanAmount', label: 'Loan Amount', sortable: true, render: (v: number) => <div className="flex items-center space-x-1"><DollarSign className="w-4 h-4 text-gray-400" /><span className="font-medium">₹{v.toLocaleString()}</span></div> },
    { key: 'settleDate', label: 'Settle Date', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> },
    { key: 'settledStatus', label: 'Settled Status', sortable: true, render: (v: string) => <div className="flex items-center space-x-2">{getStatusIcon(v)}<span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(v)}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span></div> },
    { key: 'isAmortGenerated', label: 'Is Amort Generated', render: (v: boolean) => v ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" /> },
    { key: 'processStatus', label: 'Process Status', sortable: true, render: (v: string) => <div className="flex items-center space-x-2">{getStatusIcon(v)}<span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(v)}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span></div> },
    { key: 'processMessage', label: 'Process Message' },
  ];

  return (
    <div className="space-y-6">
      <input ref={uploadInputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileChange} />
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">NEFT Disbursement</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Manage NEFT disbursements for loans</p></div>
      {success && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2"><CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{success}</span></div>}
      {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2"><AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span></div>}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {[{ key: 'downloader' as const, label: 'NEFT Disbursement Downloader' }, { key: 'uploader' as const, label: 'NEFT Disbursement Uploader' }].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)} className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>{label}</button>
            ))}
          </div>
        </div>

        {activeTab === 'downloader' && (
          <>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">NEFT Disbursement Downloader</h2><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{downloaderRecords.length} records found</p></div>
                <div className="flex items-center space-x-3">
                  <DownloaderFilterDropdown onFilter={handleDownloaderFilter} />
                  <PermissionGuard module="loan" permission="read"><button onClick={handleDownload} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Download className="w-4 h-4" /><span>NEFT Disbursement</span></button></PermissionGuard>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50 dark:bg-gray-700"><tr>{downloaderColumns.map(c => <th key={c.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">{c.label}</th>)}</tr></thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{loading ? <tr><td colSpan={downloaderColumns.length} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr> : downloaderRecords.map(r => <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">{downloaderColumns.map(c => <td key={c.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{c.render ? (c.render as any)(r[c.key as keyof NEFTDisbursementRecord], r) : r[c.key as keyof NEFTDisbursementRecord]}</td>)}</tr>)}</tbody>
            </table></div>
          </>
        )}

        {activeTab === 'uploader' && (
          <>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">NEFT Disbursement Uploader</h2><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{uploaderRecords.length} records found</p></div>
                <div className="flex items-center space-x-3">
                  <PermissionGuard module="loan" permission="write"><button onClick={handleUpload} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Upload className="w-4 h-4" /><span>Upload</span></button></PermissionGuard>
                  <PermissionGuard module="loan" permission="write"><button onClick={handleProcess} disabled={isProcessing} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white disabled:opacity-50"><Play className="w-4 h-4" /><span>{isProcessing ? 'Processing...' : 'Process'}</span></button></PermissionGuard>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50 dark:bg-gray-700"><tr>{uploaderColumns.map(c => <th key={c.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">{c.label}</th>)}</tr></thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{loading ? <tr><td colSpan={uploaderColumns.length} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr> : uploaderRecords.map(r => <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">{uploaderColumns.map(c => <td key={c.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{c.render ? (c.render as any)(r[c.key as keyof NEFTUploaderRecord], r) : r[c.key as keyof NEFTUploaderRecord]}</td>)}</tr>)}</tbody>
            </table></div>
          </>
        )}
      </div>
    </div>
  );
};