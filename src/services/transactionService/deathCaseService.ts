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
   
  export const deathCaseService = {
    getAllRecords: async (): Promise<DeathCaseRecord[]> => {
      const res = await apiFetch(DEATH_BASE);
      const json = await res.json();
      return json.data ?? json;
    },
   
    updateRecord: async (id: string, data: Partial<DeathCaseRecord>): Promise<DeathCaseRecord> => {
      const res = await apiFetch(`${DEATH_BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update');
      return json.data ?? json;
    },
   
    deleteRecord: async (id: string): Promise<void> => {
      const res = await apiFetch(`${DEATH_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) { const json = await res.json(); throw new Error(json.message || 'Failed to delete'); }
    },
   
    uploadSettlement: async (file: File): Promise<{ success: boolean; message?: string }> => {
      const formData = new FormData(); formData.append('file', file);
      const res = await apiFetch(`${DEATH_BASE}/upload-settlement`, { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Settlement upload failed');
      return json;
    },
   
    exportCSV: async (records: DeathCaseRecord[]): Promise<void> => {
      const headers = ['Branch', 'Center Code', 'Center Name', 'Death Id', 'Loan Code', 'Client Code', 'Client Name', 'Insurance Id', 'Date Reported', 'Client Spouse Flag', 'Beneficiary Phone', 'Status'];
      const csv = [headers.join(','), ...records.map(r => [r.branch, r.centerCode, r.centerName, r.deathId, r.loanCode, r.clientCode, r.clientName, r.insuranceId, r.dateReported, r.clientSpouseFlag ? 'Yes' : 'No', r.beneficiaryPhoneNumber, r.status].join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `death_cases_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
    },
  };