import { apiFetch } from '../../lib/api';

export interface WriteOffRecord { id: string; loanCode: string; clientName: string; branchName: string; pos: number; iarr: number; requestedWriteOff: number; postedWriteOff: number; status: string; requestedAt: string; approvalDate?: string; }
export interface WriteOffFilterOptions { dateFrom: string; dateTo: string; status?: string; }
export interface EligibleLoan { id: string; loan_account_number: string; client_name: string; branch_name: string; pos: number; iarr: number; }
const BASE = '/api/write-offs';
async function json<T>(path: string, init?: RequestInit): Promise<T> { const response = await apiFetch(path, init); const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body?.error?.message || body?.message || 'Write-off request failed'); return body.data ?? body; }
const query = (values: Record<string, string | undefined>) => { const p = new URLSearchParams(); Object.entries(values).forEach(([k,v]) => { if (v) p.set(k,v); }); return p.toString() ? `?${p}` : ''; };
export const writeOffService = {
  getAllRecords: async (filters: Partial<WriteOffFilterOptions & { search: string }> = {}) => {
    const rows = await json<Array<Record<string, unknown>>>(`${BASE}${query(filters)}`);
    return rows.map((row): WriteOffRecord => ({
      id: String(row.id), loanCode: String(row.loan_code || ''), clientName: String(row.client_name || ''), branchName: String(row.branch_name || ''),
      pos: Number(row.pos || 0), iarr: Number(row.iarr || 0), requestedWriteOff: Number(row.requested_write_off || 0), postedWriteOff: Number(row.posted_write_off || 0),
      status: String(row.status || ''), requestedAt: String(row.requested_at || ''), approvalDate: row.approval_date ? String(row.approval_date) : undefined,
    }));
  },
  summary: () => json<{ total_pos: string; total_iarr: string; total_write_off: string }>(`${BASE}/summary`),
  eligibleLoans: (search = '') => json<EligibleLoan[]>(`${BASE}/eligible-loans${query({ search })}`),
  create: (payload: { loanId: string; requestedPrincipal: string; requestedInterest: string; reason: string; remarks: string }) => json<WriteOffRecord>(BASE, { method: 'POST', body: JSON.stringify(payload) }),
  approve: (id: string, remarks = '') => json(`${BASE}/${id}/approve`, { method: 'POST', body: JSON.stringify({ remarks }) }),
  reject: (id: string, remarks: string) => json(`${BASE}/${id}/reject`, { method: 'POST', body: JSON.stringify({ remarks }) }),
  post: (id: string) => json(`${BASE}/${id}/post`, { method: 'POST' }),
};
