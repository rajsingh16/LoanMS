import { apiFetch } from '../../lib/api';

export interface CreditBureauRecord {
    id: string;
    applicationId: string;
    applicationDate: string;
    bcPartner: string;
    applicationStatus: string;
    centerCode: string;
    bureauResult: string;
    clientName: string;
    aadhaarNumber: string;
    voterNumber: string;
    appliedAmount: number;
  }
   
  export interface CreditBureauFilterOptions {
    branch?: string;
    applicationId: string;
    businessPartner: string;
    dateFrom: string;
    dateTo: string;
    cbPartner: string;
  }
   
  const CB_BASE = '/api/credit-bureau';
   
  export const creditBureauService = {
    getAllRecords: async (): Promise<CreditBureauRecord[]> => {
      const res = await apiFetch(CB_BASE);
      const json = await res.json();
      return json.data ?? json;
    },
   
    runCBCheck: async (applicationId: string, cbPartner: string): Promise<{ success: boolean; result: string; message?: string }> => {
      const res = await apiFetch(`${CB_BASE}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, cbPartner }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'CB check failed');
      return json;
    },
   
    exportCSV: async (records: CreditBureauRecord[]): Promise<void> => {
      const headers = ['Application Id', 'Application Date', 'BC Partner', 'Application Status', 'Center Code', 'Bureau Result', 'Client Name', 'Aadhaar Number', 'Voter Number', 'Applied Amount'];
      const csv = [headers.join(','), ...records.map(r => [r.applicationId, r.applicationDate, r.bcPartner, r.applicationStatus, r.centerCode, r.bureauResult, r.clientName, r.aadhaarNumber, r.voterNumber, r.appliedAmount].join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `credit_bureau_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
    },
  };
   