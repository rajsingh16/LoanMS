import { apiFetch } from '../../lib/api';

export interface AppVerificationRecord {
  id: string; clientName: string; branchName: string; applicationId: string; appliedOn: string;
  agentId: string; agentName: string; applicationStatus: string; clientId: string; divisionName: string | null;
  centerCode: string; productCode: string; bcPartnerName: string | null; insertedOn: string;
  applicationUuid?: string; verificationStatus?: 'pending' | 'approved' | 'rejected'; verificationRemarks?: string | null;
  rejectionReason?: string | null; verifiedAt?: string | null; loanAmount?: string; documentVerificationStatus?: string;
  history?: Array<{ previous_status: string | null; new_status: string; remarks?: string | null; rejection_reason?: string | null; created_at: string; actorName?: string }>;
}
export type VerificationFilters = Record<string, string | undefined>;
async function request<T>(path: string, init?: RequestInit): Promise<T> { const res = await apiFetch(path, init); const body = await res.json(); if (!res.ok) throw new Error(body.error?.message || body.error || 'Request failed'); return body.data as T; }
export const appVerificationService = {
  getAllRecords: (filters: VerificationFilters = {}) => request<AppVerificationRecord[]>(`/api/application-verification?${new URLSearchParams(Object.entries(filters).filter(([,v]) => v) as [string,string][]).toString()}`),
  getSummary: () => request<{ pending: number; approved: number; rejected: number }>('/api/application-verification/summary'),
  getRecordById: (id: string) => request<AppVerificationRecord>(`/api/application-verification/${id}`),
  approveVerification: (id: string, remarks?: string) => request(`/api/application-verification/${id}/approve`, { method: 'POST', body: JSON.stringify({ remarks }) }),
  rejectVerification: (id: string, rejectionReason: string, remarks?: string) => request(`/api/application-verification/${id}/reject`, { method: 'POST', body: JSON.stringify({ rejectionReason, remarks }) }),
  reopenVerification: (id: string, remarks?: string) => request(`/api/application-verification/${id}/reopen`, { method: 'POST', body: JSON.stringify({ remarks }) }),
  clearCompletedQueue: () => request<{ dismissed: number }>('/api/application-verification/queue/clear-completed', { method: 'POST' }),
  getFilterOptions: () => request<unknown[]>('/api/application-verification/filters'),
};
