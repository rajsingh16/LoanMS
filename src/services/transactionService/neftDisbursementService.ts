import { apiFetch } from '../../lib/api';
export interface NEFTDisbursementRecord {
    id: string;
    transactionType: string;
    beneficiaryCode: string;
    beneficiaryAccountNumber: string;
    instrumentAmount: number;
    beneficiaryName: string;
    draweeLocation: string;
    printLocation: string;
    beneficiaryAddress1: string;
    beneficiaryAddress2: string;
    beneficiaryAddress3: string;
    beneficiaryAddress4: string;
    beneficiaryAddress5: string;
    instructionReferenceNumber: string;
    customerReferenceNumber: string;
    paymentDetails1: string;
    paymentDetails2: string;
    paymentDetails3: string;
    paymentDetails4: string;
    paymentDetails5: string;
    paymentDetails6: string;
    paymentDetails7: string;
    chequeNumber: string;
    chequeTransactionDate: string;
    micrNumber: string;
    ifscCode: string;
    beneficiaryBankName: string;
    beneficiaryBankBranchName: string;
    beneficiaryEmailId: string;
  }
   
  export interface NEFTUploaderRecord {
    id: string;
    transactionId: string;
    loanCode: string;
    loanAmount: number;
    settleDate: string;
    settledStatus: string;
    isAmortGenerated: boolean;
    processStatus: string;
    processMessage: string;
  }
   
  export interface NEFTDownloaderFilterOptions {
    disbursementDateFrom: string;
    disbursementDateTo: string;
    bcPartner: string;
    zone?: string;
    division?: string;
    branch?: string;
  }
   
  const NEFT_BASE = '/api/neft-disbursement';
   
  export const neftDisbursementService = {
    getDownloaderRecords: async (filters?: Partial<NEFTDownloaderFilterOptions>): Promise<NEFTDisbursementRecord[]> => {
      const params = new URLSearchParams();
      if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const url = params.toString() ? `${NEFT_BASE}/downloader?${params}` : `${NEFT_BASE}/downloader`;
      const res = await apiFetch(url);
      const json = await res.json();
      return json.data ?? json;
    },
   
    getUploaderRecords: async (): Promise<NEFTUploaderRecord[]> => {
      const res = await apiFetch(`${NEFT_BASE}/uploader`);
      const json = await res.json();
      return json.data ?? json;
    },
   
    downloadNEFT: async (filters: Partial<NEFTDownloaderFilterOptions>): Promise<void> => {
      const res = await apiFetch(`${NEFT_BASE}/download`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filters) });
      if (!res.ok) { const json = await res.json(); throw new Error(json.message || 'Download failed'); }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `neft_disbursement_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
    },
   
    uploadNEFT: async (file: File): Promise<{ success: boolean; message?: string }> => {
      const formData = new FormData(); formData.append('file', file);
      const res = await apiFetch(`${NEFT_BASE}/upload`, { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Upload failed');
      return json;
    },
   
    processNEFT: async (): Promise<{ success: boolean; processed: number; message?: string }> => {
      const res = await apiFetch(`${NEFT_BASE}/process`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Process failed');
      return json;
    },
  };