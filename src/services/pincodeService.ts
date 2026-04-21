import { apiFetch } from '../lib/api';

export interface Pincode {
  id: string;
  pincode: string;
  state: string;
  district: string;
  status: 'active' | 'inactive';
  insertedOn: string;
  insertedBy: string;
  updatedOn?: string;
  updatedBy?: string;
}

export interface PincodeFormData {
  pincode: string;
  state: string;
  status: 'active' | 'inactive';
  district: string;
}

export interface PincodeFilterOptions {
  pincode?: string;
  status?: string;
  district?: string;
}

const BASE_URL = '/api/pincodes';

export const pincodeService = {
  getAllPincodes: async (): Promise<Pincode[]> => {
    const res = await apiFetch(BASE_URL);
    const json = await res.json();
    return json.data ?? json;
  },

  lookupPincode: async (pincode: string): Promise<Pincode | null> => {
    const sanitized = pincode.trim();
    if (!/^\d{6}$/.test(sanitized)) {
      return null;
    }

    const res = await apiFetch(`${BASE_URL}/lookup/${sanitized}`);
    if (res.status === 404) {
      return null;
    }

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || json.error || 'Failed to lookup pincode');
    }
    return json.data ?? null;
  },

  createPincode: async (formData: PincodeFormData): Promise<Pincode> => {
    const res = await apiFetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create pincode');
    return json.data ?? json;
  },

  updatePincode: async (id: string, formData: PincodeFormData): Promise<Pincode> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update pincode');
    return json.data ?? json;
  },

  deletePincode: async (id: string): Promise<void> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Failed to delete pincode');
    }
  },

  uploadPincodesCSV: async (
    file: File
  ): Promise<{ success: boolean; created: number; updated: number; errors: number; message?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiFetch(`${BASE_URL}/upload-csv`, { method: 'POST', body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'CSV upload failed');
    return json;
  },

  exportPincodesCSV: async (records: Pincode[]): Promise<void> => {
    const headers = ['Pincode', 'State', 'District', 'Status', 'Inserted On', 'Inserted By'];
    const csv = [
      headers.join(','),
      ...records.map(p => [p.pincode, p.state, p.district, p.status, p.insertedOn, p.insertedBy].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `pincodes_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  downloadTemplate: async (): Promise<void> => {
    const headers = ['pincode', 'state', 'status', 'district'];
    const blob = new Blob([headers.join(',')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pincodes_template.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};
