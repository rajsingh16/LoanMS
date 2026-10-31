import { apiFetch } from '../../lib/api';

export interface BranchDayCloseRecord { id:string; branch:string; branchCloseDate:string; branchBalance:number; cashbookBalance:number; cashDifference:number; denomination:string; branchId?:string; status?:string; remarks?:string; preparedBy?:string; verifiedBy?:string; approvedBy?:string; denominationDetails?:Record<string,number>; }
export interface Branch { id:string; branch_name:string; branch_code:string; }
export interface Reconciliation { cashbookBalance:number; cashRepayments:number; cashTransactionCount:number; definition:string; }
export interface DayCloseInput { branchId:string; branchCloseDate:string; branchBalance:number; denominationDetails:Record<string,number>; remarks?:string; }
async function request<T>(path:string, init?:RequestInit):Promise<T> { const res=await apiFetch(path,init); const body=await res.json().catch(()=>null); if(!res.ok) throw new Error(body?.error?.message || 'Branch day close request failed'); return body.data; }
export const branchDayCloseService = {
  getAllRecords: () => request<BranchDayCloseRecord[]>('/api/branch-day-close'),
  getSummary: () => request<{totalBranches:number;totalCash:number;netDifference:number}>('/api/branch-day-close/summary'),
  getBranches: () => request<Branch[]>('/api/branch-day-close/branches'),
  getReconciliation: (branchId:string,date:string) => request<Reconciliation>(`/api/branch-day-close/reconciliation?branchId=${encodeURIComponent(branchId)}&date=${encodeURIComponent(date)}`),
  createRecord: (input:DayCloseInput) => request<BranchDayCloseRecord>('/api/branch-day-close',{method:'POST',body:JSON.stringify(input)}),
  updateRecord: (id:string,input:DayCloseInput) => request<BranchDayCloseRecord>(`/api/branch-day-close/${id}`,{method:'PUT',body:JSON.stringify(input)}),
  deleteRecord: (id:string) => request<void>(`/api/branch-day-close/${id}`,{method:'DELETE'}),
  submitRecord: (id:string) => request<BranchDayCloseRecord>(`/api/branch-day-close/${id}/submit`,{method:'POST'}),
  verifyRecord: (id:string) => request<BranchDayCloseRecord>(`/api/branch-day-close/${id}/verify`,{method:'POST'}),
  closeRecord: (id:string) => request<BranchDayCloseRecord>(`/api/branch-day-close/${id}/close`,{method:'POST'}),
  rejectRecord: (id:string,reason:string) => request<BranchDayCloseRecord>(`/api/branch-day-close/${id}/reject`,{method:'POST',body:JSON.stringify({reason})}),
  exportCSV(records:BranchDayCloseRecord[]) { const safe=(value:unknown)=>{const s=String(value??'');return `"${(/^[=+\-@]/.test(s)?"'":'')+s.replace(/"/g,'""')}"`;}; const text=[['Branch','Branch Close Date','Branch Balance','Cashbook Balance','Cash Difference','Denomination','Status'].map(safe).join(','),...records.map(r=>[r.branch,r.branchCloseDate,r.branchBalance,r.cashbookBalance,r.cashDifference,r.denomination,r.status||''].map(safe).join(','))].join('\r\n'); const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='branch-day-close.csv';a.click();URL.revokeObjectURL(url); }
};
