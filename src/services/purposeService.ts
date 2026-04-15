import { apiFetch } from '../lib/api';

export interface Purpose {
  id: string;
  purposeId: string;
  purposeCode: string;
  purposeName: string;
  mainPurposeId?: string;
  isMainPurpose: boolean;
  status: 'active' | 'inactive';
  insertedOn: string;
  insertedBy: string;
  updatedOn?: string;
  updatedBy?: string;
}

export interface PurposeFormData {
  purposeCode: string;
  purposeName: string;
  mainPurposeId?: string;
}

export interface PurposeFilterOptions {
  purpose?: string;
  subPurpose?: string;
}

const BASE_URL = '/api/purposes';

export const purposeService = {
  getAllPurposes: async (): Promise<Purpose[]> => {
    const res = await apiFetch(BASE_URL);
    const json = await res.json();
    return json.data ?? json;
  },

  createPurpose: async (formData: PurposeFormData): Promise<Purpose> => {
    const res = await apiFetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create purpose');
    return json.data ?? json;
  },

  updatePurpose: async (id: string, formData: PurposeFormData): Promise<Purpose> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update purpose');
    return json.data ?? json;
  },

  deletePurpose: async (id: string): Promise<void> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Failed to delete purpose');
    }
  },

  uploadPurposesCSV: async (
    file: File
  ): Promise<{ success: boolean; created: number; updated: number; errors: number; message?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiFetch(`${BASE_URL}/upload-csv`, { method: 'POST', body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'CSV upload failed');
    return json;
  },

  exportPurposesCSV: async (records: Purpose[]): Promise<void> => {
    const headers = ['Purpose ID', 'Purpose Code', 'Purpose Name', 'Main Purpose ID', 'Is Main Purpose', 'Status'];
    const csv = [
      headers.join(','),
      ...records.map(p => [
        p.purposeId, p.purposeCode, p.purposeName,
        p.mainPurposeId ?? '', p.isMainPurpose ? 'Yes' : 'No', p.status,
      ].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `purposes_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  downloadTemplate: async (): Promise<void> => {
    const headers = ['purposeCode', 'purposeName', 'mainPurposeId'];
    const blob = new Blob([headers.join(',')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'purposes_template.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};