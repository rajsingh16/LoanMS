// ─── CenterMeetingPage.tsx ─────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from '../../../components/Common/DataTable';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { centerMeetingService, CenterMeetingRecord, CenterMeetingFilterOptions, MeetingInput, MeetingOptions } from '../../../services/transactionService/centerMeetingService';
import {
  Search, Download, Calendar, Clock, CheckCircle, XCircle,
  Filter, ChevronDown, User, Edit, Trash2, AlertCircle,
} from 'lucide-react';

const FilterDropdown: React.FC<{ onFilter: (f: CenterMeetingFilterOptions) => void }> = ({ onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<CenterMeetingFilterOptions>({ branch: '', meetingStatus: '', scheduleDateFrom: '', scheduleDateTo: '' });
  const change = (k: keyof CenterMeetingFilterOptions, v: string) => setFilters(prev => ({ ...prev, [k]: v }));
  const apply = () => { onFilter(filters); setIsOpen(false); };
  const clear = () => { const empty = { branch: '', meetingStatus: '', scheduleDateFrom: '', scheduleDateTo: '' }; setFilters(empty); onFilter(empty); };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
        <Filter className="w-4 h-4" /><span>Search Filter</span><ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 p-4 space-y-4">
          <div className="flex items-center space-x-2"><Search className="w-5 h-5 text-gray-400" /><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Filters</h3></div>
          {[{ key: 'branch' as const, label: 'Branch', required: true }, { key: 'center' as const, label: 'Center' }, { key: 'meeting' as const, label: 'Meeting' }, { key: 'assignedTo' as const, label: 'Assigned To' }].map(({ key, label, required }) => (
            <div key={key}><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
              <input type="text" value={(filters[key] as string) || ''} onChange={e => change(key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder={`Enter ${label.toLowerCase()}`} /></div>
          ))}
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Type</label>
            <select value={filters.meetingType || ''} onChange={e => change('meetingType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">All Types</option><option value="Regular">Regular</option><option value="Special">Special</option><option value="CGT">CGT</option><option value="GRT">GRT</option>
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Status <span className="text-red-500">*</span></label>
            <select value={filters.meetingStatus} onChange={e => change('meetingStatus', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">All Status</option><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
            </select></div>
          <div className="grid grid-cols-2 gap-4">
            {[{ key: 'scheduleDateFrom' as const, label: 'From' }, { key: 'scheduleDateTo' as const, label: 'To' }].map(({ key, label }) => (
              <div key={key}><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Schedule Date {label} <span className="text-red-500">*</span></label>
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

export const CenterMeetingPage: React.FC = () => {
  const [records, setRecords] = useState<CenterMeetingRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<CenterMeetingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeFilters, setActiveFilters] = useState<CenterMeetingFilterOptions>({ branch: '', meetingStatus: '', scheduleDateFrom: '', scheduleDateTo: '' });
  const [options, setOptions] = useState<MeetingOptions>({ branches: [], centers: [], fieldOfficers: [] });
  const [editing, setEditing] = useState<CenterMeetingRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const requestId = useRef(0);

  useEffect(() => { loadRecords(); centerMeetingService.getOptions().then(setOptions).catch(e => setError(e.message)); }, []);

  const loadRecords = async () => {
    const request = ++requestId.current;
    try {
      setLoading(true); setError('');
      const data = await centerMeetingService.getAllMeetings();
      if (request !== requestId.current) return;
      setRecords(data); applyFilters(data, activeFilters);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load center meetings'); }
    finally { if (request === requestId.current) setLoading(false); }
  };

  const applyFilters = (source: CenterMeetingRecord[], filters: CenterMeetingFilterOptions) => {
    let f = source;
    if (filters.branch) f = f.filter(r => (r.branchName || '').toLowerCase().includes(filters.branch.toLowerCase()));
    if (filters.center) f = f.filter(r => r.centerName.toLowerCase().includes(filters.center!.toLowerCase()) || r.centerId.toLowerCase().includes(filters.center!.toLowerCase()));
    if (filters.meeting) f = f.filter(r => r.meetingId.toLowerCase().includes(filters.meeting!.toLowerCase()));
    if (filters.meetingType) f = f.filter(r => r.meetingType === filters.meetingType);
    if (filters.meetingStatus) f = f.filter(r => r.meetingStatus === filters.meetingStatus);
    if (filters.scheduleDateFrom) f = f.filter(r => r.scheduleDate >= filters.scheduleDateFrom);
    if (filters.scheduleDateTo) f = f.filter(r => r.scheduleDate <= filters.scheduleDateTo);
    if (filters.assignedTo) f = f.filter(r => r.assignedTo.toLowerCase().includes(filters.assignedTo!.toLowerCase()));
    setFilteredRecords(f);
  };
  const handleFilter = (filters: CenterMeetingFilterOptions) => { setActiveFilters(filters); applyFilters(records, filters); };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;
    try {
      await centerMeetingService.deleteMeeting(id);
      await loadRecords(); setSuccess('Meeting cancelled successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to delete meeting'); }
  };
  const emptyForm = (): MeetingInput => ({ branchId: '', centerUuid: '', fieldOfficerId: '', meetingType: 'Regular', scheduleDate: '', scheduleTime: '', meetingEndDate: '', meetingEndTime: '', meetingLocation: '', agenda: '', remarks: '' });
  const initialForm = editing ? { branchId: editing.branchId || '', centerUuid: editing.centerUuid || '', fieldOfficerId: editing.fieldOfficerId || '', meetingType: editing.meetingType, scheduleDate: editing.scheduleDate, scheduleTime: editing.scheduleTime, meetingEndDate: editing.meetingEndDate, meetingEndTime: editing.meetingEndTime || '', meetingLocation: editing.meetingLocation || '', agenda: editing.agenda || '', remarks: editing.remarks || '' } : emptyForm();
  const MeetingForm: React.FC = () => { const [form, setForm] = useState<MeetingInput>(initialForm); const set = (key: keyof MeetingInput, value: string) => setForm(p => ({ ...p, [key]: value })); const submit = async (e: React.FormEvent) => { e.preventDefault(); try { setError(''); editing ? await centerMeetingService.updateMeeting(editing.id, form) : await centerMeetingService.createMeeting(form); setShowForm(false); setEditing(null); await loadRecords(); setSuccess(`Meeting ${editing ? 'updated' : 'created'} successfully!`); setTimeout(() => setSuccess(''), 3000); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save meeting'); } }; const centers = options.centers.filter(x => !form.branchId || x.branch_id === form.branchId); const officers = options.fieldOfficers.filter(x => !form.branchId || x.branch_id === form.branchId); return <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"><form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4"><h2 className="text-xl font-semibold dark:text-white">{editing ? 'Edit Center Meeting' : 'Add Center Meeting'}</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[["Branch",'branchId',options.branches.map(x=>[x.id,x.branch_name])],["Center",'centerUuid',centers.map(x=>[x.id,x.center_name])],["Assigned Field Officer",'fieldOfficerId',officers.map(x=>[x.id,`${x.first_name} ${x.last_name}`])],["Meeting Type",'meetingType',['Regular','Special','CGT','GRT'].map(x=>[x,x])]].map(([label,key,items])=><label key={String(key)} className="text-sm dark:text-gray-200">{String(label)}<select required value={String(form[key as keyof MeetingInput] || '')} onChange={e=>set(key as keyof MeetingInput,e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700"><option value="">Select {label}</option>{(items as string[][]).map(x=><option key={x[0]} value={x[0]}>{x[1]}</option>)}</select></label>)}{[['Schedule Date','scheduleDate','date'],['Schedule Time','scheduleTime','time'],['Meeting End Date','meetingEndDate','date'],['Meeting End Time','meetingEndTime','time']].map(([label,key,type])=><label key={key} className="text-sm dark:text-gray-200">{label}<input required type={type} value={String(form[key as keyof MeetingInput] || '')} onChange={e=>set(key as keyof MeetingInput,e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></label>)}</div>{[['Meeting Location','meetingLocation'],['Agenda','agenda'],['Remarks','remarks']].map(([label,key])=><label key={key} className="block text-sm dark:text-gray-200">{label}<textarea value={String(form[key as keyof MeetingInput] || '')} onChange={e=>set(key as keyof MeetingInput,e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700" /></label>)}<div className="flex justify-end gap-3"><button type="button" onClick={()=>{setShowForm(false);setEditing(null);}} className="px-4 py-2 border rounded-lg dark:text-white">Cancel</button><button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Meeting</button></div></form></div>; };

  const handleDownload = async () => {
    try { await centerMeetingService.exportCSV(filteredRecords); setSuccess('CSV exported!'); setTimeout(() => setSuccess(''), 3000); }
    catch { setError('Failed to export CSV'); }
  };

  const getStatusIcon = (status: string) => { switch (status) { case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />; case 'cancelled': return <XCircle className="w-4 h-4 text-red-600" />; default: return <Clock className="w-4 h-4 text-yellow-600" />; } };
  const getStatusColor = (status: string) => { switch (status) { case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'; case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'; default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'; } };

  const columns = [
    { key: 'actions', label: 'Action', render: (_: unknown, row: CenterMeetingRecord) => (<div className="flex items-center space-x-2"><PermissionGuard module="loan" permission="write"><button onClick={() => { setEditing(row); setShowForm(true); }} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"><Edit className="w-4 h-4" /></button></PermissionGuard><PermissionGuard module="loan" permission="delete"><button onClick={() => handleDelete(row.id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><Trash2 className="w-4 h-4" /></button></PermissionGuard></div>) },
    { key: 'meetingId', label: 'Meeting Id', sortable: true, render: (v: string) => <span className="font-mono font-medium">{v}</span> },
    { key: 'displaySequence', label: 'Display Sequence', sortable: true },
    { key: 'assignedTo', label: 'Assigned To', sortable: true, render: (v: string) => <div className="flex items-center space-x-2"><User className="w-4 h-4 text-gray-400" /><span>{v}</span></div> },
    { key: 'centerName', label: 'Center Name', sortable: true },
    { key: 'centerId', label: 'Center Id', sortable: true, render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'meetingType', label: 'Meeting Type', sortable: true, render: (v: string) => <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">{v}</span> },
    { key: 'meetingStatus', label: 'Meeting Status', sortable: true, render: (v: string) => <div className="flex items-center space-x-2">{getStatusIcon(v)}<span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(v)}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span></div> },
    { key: 'scheduleDate', label: 'Schedule Date', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> },
    { key: 'scheduleTime', label: 'Schedule Time', render: (v: string) => <div className="flex items-center space-x-1"><Clock className="w-4 h-4 text-gray-400" /><span>{v}</span></div> },
    { key: 'meetingEndDate', label: 'Meeting End Date', render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> },
  ];

  const scheduled = records.filter(r => r.meetingStatus === 'scheduled').length;
  const completed = records.filter(r => r.meetingStatus === 'completed').length;
  const cancelled = records.filter(r => r.meetingStatus === 'cancelled').length;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Center Meeting</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Schedule and manage center meetings</p></div>
      {success && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2"><CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{success}</span></div>}
      {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2"><AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span></div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ label: 'Scheduled', count: scheduled, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' }, { label: 'Completed', count: completed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' }, { label: 'Cancelled', count: cancelled, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' }].map(({ label, count, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3"><div className={`p-2 ${bg} rounded-lg`}><Icon className={`w-5 h-5 ${color}`} /></div><div><p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p><p className="text-xl font-bold text-gray-900 dark:text-white">{count}</p></div></div>
          </div>
        ))}
      </div>
      <DataTable columns={columns} data={filteredRecords} title="Center Meetings" loading={loading} exportable={false} onAdd={() => { setEditing(null); setShowForm(true); }}
        filterComponent={<div className="flex items-center space-x-3"><FilterDropdown onFilter={handleFilter} /><PermissionGuard module="loan" permission="read"><button onClick={handleDownload} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Download className="w-4 h-4" /><span>Download</span></button></PermissionGuard></div>} />
      {showForm && <MeetingForm />}
    </div>
  );
};
