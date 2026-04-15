import { apiFetch } from '../../lib/api';

export interface CenterTransferRecord {
    id: string;
    branch: string;
    centerId: string;
    centerName: string;
    centerCode: string;
    centerDay: string;
    address1: string;
    address2: string;
    address3: string;
    city: string;
    meetingPlace: string;
    collPartnerId: string;
    villageId: string;
    status: 'active' | 'inactive';
  }
   
  export interface CenterTransferFilterOptions {
    branch: string;
    foId?: string;
    center?: string;
  }
   
  export interface TransferPayload {
    centerIds: string[];
    targetBranch: string;
    targetFoId: string;
  }
   
  const TRANSFER_BASE = '/api/center-transfers';
   
  export const centerTransferService = {
    getCenters: async (filters?: Partial<CenterTransferFilterOptions>): Promise<CenterTransferRecord[]> => {
      const params = new URLSearchParams();
      if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const url = params.toString() ? `${TRANSFER_BASE}/centers?${params}` : `${TRANSFER_BASE}/centers`;
      const res = await apiFetch(url);
      const json = await res.json();
      return json.data ?? json;
    },
   
    transferCenters: async (payload: TransferPayload): Promise<{ success: boolean; message?: string }> => {
      const res = await apiFetch(`${TRANSFER_BASE}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Transfer failed');
      return json;
    },
  };
   