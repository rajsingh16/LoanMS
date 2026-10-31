import { apiFetch } from '../../lib/api';
export interface DeathCaseRecord {
    id: string;
    branch: string;
    centerCode: string;
    centerName: string;
    deathId: string;
    loanCode: string;
    clientCode: string;
    clientName: string;
    insuranceId: string;
    dateReported: string;
    clientSpouseFlag: boolean;
    beneficiaryPhoneNumber: string;
    status: string;
    dateOfDeath?: string;
    caseProcessDate?: string;
    deceasedPersonType?: string;
    beneficiaryName?: string;
    claimAmount?: string | number;
    remarks?: string;
  }
   
  export interface DeathCaseFilterOptions {
    branch?: string;
    center?: string;
    deathId?: string;
    loanCode?: string;
    clientCode?: string;
    deathStatus?: string;
    deathReportDateFrom: string;
    deathReportDateTo: string;
    caseProcessDateFrom?: string;
    caseProcessDateTo?: string;
  }
   
  const DEATH_BASE = '/api/death-cases';
  async function responseJson(res: Response) {
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error?.message || json?.message || `Request failed (${res.status})`);
    return json.data ?? json;
  }
   
  export const deathCaseService = {
    getAllRecords: async (): Promise<DeathCaseRecord[]> => {
      const res = await apiFetch(DEATH_BASE);
      return responseJson(res);
    },

    getSummary: async (): Promise<Record<string, number>> => responseJson(await apiFetch(`${DEATH_BASE}/summary`)),
    getOptions: async (): Promise<any> => responseJson(await apiFetch(`${DEATH_BASE}/options`)),
    createRecord: async (data: Record<string, unknown>): Promise<DeathCaseRecord> => responseJson(await apiFetch(DEATH_BASE, { method: 'POST', body: JSON.stringify(data) })),
   
    updateRecord: async (id: string, data: Partial<DeathCaseRecord>): Promise<DeathCaseRecord> => {
      const res = await apiFetch(`${DEATH_BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      return responseJson(res);
    },
   
    deleteRecord: async (id: string): Promise<void> => {
      const res = await apiFetch(`${DEATH_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) { await responseJson(res); }
    },
   
    uploadSettlement: async (file: File): Promise<{ success: boolean; message?: string }> => {
      const formData = new FormData(); formData.append('file', file);
      const res = await apiFetch(`${DEATH_BASE}/upload-settlement`, { method: 'POST', body: formData });
      return responseJson(res);
    },
   
    exportCSV: async (records: DeathCaseRecord[]): Promise<void> => {
      const headers = ['Branch', 'Center Code', 'Center Name', 'Death Id', 'Loan Code', 'Client Code', 'Client Name', 'Insurance Id', 'Date Reported', 'Client Spouse Flag', 'Beneficiary Phone', 'Status'];
      const escape = (v: unknown) => { const value = String(v ?? ''); const safe = /^[=+\-@]/.test(value) ? `'${value}` : value; return `"${safe.replace(/"/g, '""')}"`; };
      const csv = [headers.map(escape).join(','), ...records.map(r => [r.branch, r.centerCode, r.centerName, r.deathId, r.loanCode, r.clientCode, r.clientName, r.insuranceId, r.dateReported, r.clientSpouseFlag ? 'Yes' : 'No', r.beneficiaryPhoneNumber, r.status].map(escape).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `death_cases_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
    },
  };
