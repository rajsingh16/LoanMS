import { apiFetch } from '../../lib/api';

export interface BranchAuditSummary {
  totalBranchesAudited: number;
  compliantBranches: number;
  nonCompliantBranches: number;
  latestUploadDate: string | null;
  latestUploaderName: string | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init);
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error?.message || 'Branch audit request failed');
  return body.data;
}

function filename(disposition: string | null) {
  return disposition?.match(/filename="?([^";]+)"?/i)?.[1] || 'branch-audit-template.xlsx';
}

export const branchAuditService = {
  getSummary: () => request<BranchAuditSummary>('/api/branch-audits/summary'),
  getUploads: (page = 1, limit = 20) => request<unknown[]>(`/api/branch-audits/uploads?page=${page}&limit=${limit}`),
  getUploadDetails: (id: string) => request<unknown>(`/api/branch-audits/uploads/${encodeURIComponent(id)}`),
  getRecords: (filters: Record<string, string> = {}) => request<unknown[]>(`/api/branch-audits/records?${new URLSearchParams(filters)}`),
  async downloadTemplate() {
    const response = await apiFetch('/api/branch-audits/template');
    if (!response.ok) { const body = await response.json().catch(() => null); throw new Error(body?.error?.message || 'Template download failed'); }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a'); link.href = url; link.download = filename(response.headers.get('content-disposition')); link.click();
    URL.revokeObjectURL(url);
  },
  uploadAudit: (file: File) => { const form = new FormData(); form.append('file', file); return request<{ id: string }>('/api/branch-audits/upload', { method: 'POST', body: form }); },
};
