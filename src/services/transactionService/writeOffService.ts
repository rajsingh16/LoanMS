import { apiFetch } from '../../lib/api';

export interface WriteOffRecord { id: string; loanCode: string; pos: number; iarr: number; }
export interface WriteOffFilterOptions { dateFrom: string; dateTo: string; }
 
const WRITEOFF_BASE = '/api/write-offs';
 
export const writeOffService = {
  getAllRecords: async (filters?: Partial<WriteOffFilterOptions>): Promise<WriteOffRecord[]> => {
    const params = new URLSearchParams();
    if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const url = params.toString() ? `${WRITEOFF_BASE}?${params}` : WRITEOFF_BASE;
    const res = await apiFetch(url);
    const json = await res.json();
    return json.data ?? json;
  },
 
  uploadWriteOff: async (file: File): Promise<{ success: boolean; message?: string }> => {
    const formData = new FormData(); formData.append('file', file);
    const res = await apiFetch(`${WRITEOFF_BASE}/upload`, { method: 'POST', body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Upload failed');
    return json;
  },
 
  processWriteOff: async (loanCodes: string[]): Promise<{ success: boolean; processed: number; message?: string }> => {
    const res = await apiFetch(`${WRITEOFF_BASE}/process`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ loanCodes }) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Write-off processing failed');
    return json;
  },
};