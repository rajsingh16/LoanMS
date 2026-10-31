import { apiFetch } from '../../lib/api';

export interface CenterTransferRecord { id: string; centerId: string; centerName: string; centerCode: string; branchId: string | null; branch: string; fieldOfficerId: string | null; fieldOfficer: string; centerDay: string; address1: string; address2: string; address3: string; city: string; meetingPlace: string; collPartnerId: string; villageId: string; status: 'active' | 'inactive'; }
export interface CenterTransferFilterOptions { branch?: string; fieldOfficer?: string; status?: string; search?: string; }
export interface Branch { id: string; branch_name: string; branch_code: string; }
export interface FieldOfficer { id: string; first_name: string; last_name: string; employee_id?: string; branch_id: string; }
export interface TransferPayload { centerIds: string[]; targetBranchId: string; targetFieldOfficerId: string; reason: string; }

const BASE = '/api/center-transfers';
async function result<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init); const body = await res.json();
  if (!res.ok || body.error) throw new Error(body.error?.message || body.message || 'Request failed');
  return body.data as T;
}
export const centerTransferService = {
  getCenters: (filters: CenterTransferFilterOptions = {}) => { const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => Boolean(value)) as [string, string][]); return result<CenterTransferRecord[]>(`${BASE}/centers${params.size ? `?${params}` : ''}`); },
  getBranches: () => result<Branch[]>(`${BASE}/branches`),
  getFieldOfficers: (branchId: string) => result<FieldOfficer[]>(`${BASE}/field-officers?branchId=${encodeURIComponent(branchId)}`),
  validate: (payload: TransferPayload) => result<{ valid: boolean }>(`${BASE}/validate`, { method: 'POST', body: JSON.stringify(payload) }),
  exportCenters: async (filters: CenterTransferFilterOptions = {}) => { const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => Boolean(value)) as [string, string][]); const response = await apiFetch(`${BASE}/export${params.size ? `?${params}` : ''}`); if (!response.ok) { const body = await response.json(); throw new Error(body.error?.message || 'Export failed'); } const url = URL.createObjectURL(await response.blob()); const link = document.createElement('a'); link.href = url; link.download = 'center-transfers.csv'; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); },
  transferCenters: async (payload: TransferPayload) => { const res = await apiFetch(BASE, { method: 'POST', body: JSON.stringify(payload) }); const body = await res.json(); if (!res.ok || body.error) throw new Error(body.error?.message || body.message || 'Transfer failed'); return body as { message?: string; data: { transferred: number } }; },
};
