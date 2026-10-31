import { apiFetch } from '../../lib/api';

export interface CreditBureauRecord {
  id: string; loanApplicationId: string; clientId: string; applicationId: string; applicationDate: string;
  bcPartner: string; bureauProvider: string; applicationStatus: string; centerCode: string;
  bureauResult: 'pass' | 'fail' | 'review' | null; checkStatus: string; creditScore: number | null;
  referenceNumber: string | null; isTest: boolean; checkedAt: string | null; createdAt: string;
  clientName: string; appliedAmount: number;
}
export interface CreditBureauFilterOptions { branch?: string; applicationId: string; businessPartner: string; dateFrom: string; dateTo: string; cbPartner: string; result?: string; }
const CB_BASE = '/api/credit-bureau';
async function read<T>(response: Promise<Response> | Response): Promise<T> {
  const res = await response;
  let json: { data?: T; error?: { message?: string } | string; message?: string };
  try {
    json = await res.json();
  } catch {
    throw new Error(res.ok ? 'Credit bureau service returned an invalid response' : `Credit bureau request failed (${res.status})`);
  }
  if (!res.ok || json.error) {
    const message = typeof json.error === 'string' ? json.error : json.error?.message;
    throw new Error(message || json.message || 'Credit bureau request failed');
  }
  return (json.data ?? []) as T;
}
const csvValue = (value: unknown) => { const text = String(value ?? ''); const safe = /^[=+\-@]/.test(text) ? `'${text}` : text; return `"${safe.replace(/"/g, '""')}"`; };

export const creditBureauService = {
  getAllRecords: (): Promise<CreditBureauRecord[]> => read(apiFetch(CB_BASE)),
  getByApplication: (applicationId: string): Promise<CreditBureauRecord[]> => read(apiFetch(`${CB_BASE}/by-application/${encodeURIComponent(applicationId)}`)),
  runCBCheck: (applicationId: string, cbPartner: string, remarks?: string): Promise<CreditBureauRecord> => read(apiFetch(`${CB_BASE}/check`, { method: 'POST', body: JSON.stringify({ applicationId, cbPartner, remarks }) })),
  submitManualResult: (id: string, result: { bureauResult: 'pass' | 'fail' | 'review'; creditScore?: number; remarks?: string }): Promise<CreditBureauRecord> => read(apiFetch(`${CB_BASE}/${encodeURIComponent(id)}/manual-result`, { method: 'POST', body: JSON.stringify(result) })),
  exportCSV: (records: CreditBureauRecord[]): void => {
    const headers = ['Application ID', 'Application Date', 'Provider', 'Application Status', 'Center Code', 'Check Status', 'Bureau Result', 'Client Name', 'Applied Amount', 'Test'];
    const rows = records.map(r => [r.applicationId, r.applicationDate, r.bureauProvider || r.bcPartner, r.applicationStatus, r.centerCode, r.checkStatus, r.bureauResult, r.clientName, r.appliedAmount, r.isTest ? 'TEST' : 'Verified']);
    const blob = new Blob([[headers, ...rows].map(row => row.map(csvValue).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = `credit_bureau_export_${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  },
};
