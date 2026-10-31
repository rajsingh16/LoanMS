import { apiFetch } from '../../lib/api';

export interface NEFTDisbursementRecord { id: string; transactionType: string; beneficiaryCode: string; beneficiaryAccountNumber: string; instrumentAmount: number; beneficiaryName: string; draweeLocation: string; loanAccountNumber: string; applicationNumber: string; bank: string; transactionStatus: string; }
export interface NEFTBatch { id: string; batch_number: string; status: string; total_transactions: number; total_amount: string; }
export interface NEFTUpload { id: string; validation_errors: { line: number; message: string }[]; preview?: { line: number; transaction_reference: string; status: string; bank_reference?: string }[]; canConfirm?: boolean; }
const BASE = '/api/neft-disbursements';
async function result<T>(res: Response): Promise<T> { const body = await res.json(); if (!res.ok) throw new Error(body?.error?.message || 'NEFT request failed'); return body.data; }
export const neftDisbursementService = {
  eligible: async () => result<NEFTDisbursementRecord[]>(await apiFetch(`${BASE}/eligible`)),
  batches: async () => result<NEFTBatch[]>(await apiFetch(BASE)),
  createBatch: async (disbursementIds: string[]) => result<NEFTBatch>(await apiFetch(`${BASE}/batches`, { method: 'POST', body: JSON.stringify({ disbursementIds }) })),
  downloadBatch: async (id: string) => { const res = await apiFetch(`${BASE}/batches/${id}/download`); if (!res.ok) await result(res); const url = URL.createObjectURL(await res.blob()); const a = document.createElement('a'); a.href = url; a.download = `neft_${id}.csv`; a.click(); URL.revokeObjectURL(url); },
  upload: async (file: File) => { const form = new FormData(); form.append('file', file); return result<NEFTUpload>(await apiFetch(`${BASE}/uploads`, { method: 'POST', body: form })); },
  confirm: async (id: string) => result<{ processed: boolean }>(await apiFetch(`${BASE}/uploads/${id}/confirm`, { method: 'POST' })),
};
