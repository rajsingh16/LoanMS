import { District, DistrictFilterOptions } from '../types/product';
import { apiFetch } from '../lib/api';

export interface DistrictFormData {
  districtCode: string;
  districtName: string;
  countryId: string;
  stateId: string;
  stateName: string;
}

const BASE_URL = '/api/districts';

export const districtService = {
  getAllDistricts: async (): Promise<District[]> => {
    const res = await apiFetch(BASE_URL);
    const json = await res.json();
    return json.data ?? json;
  },

  getDistrictById: async (id: string): Promise<District> => {
    const res = await apiFetch(`${BASE_URL}/${id}`);
    const json = await res.json();
    return json.data ?? json;
  },

  createDistrict: async (formData: DistrictFormData): Promise<District> => {
    const res = await apiFetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create district');
    return json.data ?? json;
  },

  updateDistrict: async (id: string, formData: DistrictFormData): Promise<District> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update district');
    return json.data ?? json;
  },

  deleteDistrict: async (id: string): Promise<void> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Failed to delete district');
    }
  },

  uploadDistrictsCSV: async (
    file: File
  ): Promise<{ success: boolean; created: number; updated: number; errors: number; message?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiFetch(`${BASE_URL}/upload-csv`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'CSV upload failed');
    return json;
  },

  exportDistrictsCSV: async (districts: District[]): Promise<void> => {
    const headers = [
      'District Code', 'District Name', 'State',
      'Inserted On', 'Inserted By', 'Updated On', 'Updated By',
    ];

    const csvContent = [
      headers.join(','),
      ...districts.map(d =>
        [
          d.districtCode,
          d.districtName,
          d.stateName,
          d.insertedOn,
          d.insertedBy,
          d.updatedOn ?? '',
          d.updatedBy ?? '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `districts_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  downloadTemplate: async (): Promise<void> => {
    const templateHeaders = ['districtCode', 'districtName', 'countryId', 'stateId', 'stateName'];
    const blob = new Blob([templateHeaders.join(',')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'districts_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};