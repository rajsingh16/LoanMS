import { apiFetch } from '../lib/api';

export interface IFSCCode {
  id: string;
  ifscCode: string;
  bankName: string;
  bankBranch: string;
  branchAddress: string;
  city: string;
  state: string;
  mobileNumber?: string;
  insertedOn: string;
  insertedBy: string;
  updatedOn?: string;
  updatedBy?: string;
}

export interface IFSCFormData {
  ifscCode: string;
  bankName: string;
  bankBranch: string;
  bankAddress: string;
  state: string;
  city: string;
  mobileNumber?: string;
}

export interface IFSCFilterOptions {
  ifscCode?: string;
  bankName?: string;
}

const BASE_URL = '/api/ifsc';

export const ifscService = {
  getAllIFSC: async (): Promise<IFSCCode[]> => {
    const res = await apiFetch(BASE_URL);
    const json = await res.json();
    return json.data ?? json;
  },

  createIFSC: async (formData: IFSCFormData): Promise<IFSCCode> => {
    const res = await apiFetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create IFSC');
    return json.data ?? json;
  },

  updateIFSC: async (id: string, formData: IFSCFormData): Promise<IFSCCode> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update IFSC');
    return json.data ?? json;
  },

  deleteIFSC: async (id: string): Promise<void> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Failed to delete IFSC');
    }
  },

  uploadIFSCCSV: async (
    file: File
  ): Promise<{ success: boolean; created: number; updated: number; errors: number; message?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiFetch(`${BASE_URL}/upload-csv`, { method: 'POST', body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'CSV upload failed');
    return json;
  },

  exportIFSCCSV: async (records: IFSCCode[]): Promise<void> => {
    const headers = ['IFSC Code', 'Bank Name', 'Bank Branch', 'Branch Address', 'City', 'State', 'Mobile Number'];
    const csv = [
      headers.join(','),
      ...records.map(i => [i.ifscCode, i.bankName, i.bankBranch, i.branchAddress, i.city, i.state, i.mobileNumber ?? ''].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ifsc_codes_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  downloadTemplate: async (): Promise<void> => {
    const headers = ['ifscCode', 'bankName', 'bankBranch', 'bankAddress', 'state', 'city', 'mobileNumber'];
    const blob = new Blob([headers.join(',')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ifsc_template.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};