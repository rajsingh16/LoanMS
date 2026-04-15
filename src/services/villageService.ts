import { Village, VillageFormData, VillageFilterOptions } from '../types/village';
import { apiFetch } from '../lib/api';

const BASE_URL = '/api/villages';

export const villageService = {
  getAllVillages: async (): Promise<Village[]> => {
    const res = await apiFetch(BASE_URL);
    const json = await res.json();
    return json.data ?? json;
  },

  createVillage: async (formData: VillageFormData): Promise<Village> => {
    const res = await apiFetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create village');
    return json.data ?? json;
  },

  updateVillage: async (id: string, formData: VillageFormData): Promise<Village> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update village');
    return json.data ?? json;
  },

  deleteVillage: async (id: string): Promise<void> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Failed to delete village');
    }
  },

  uploadVillagesCSV: async (
    file: File
  ): Promise<{ success: boolean; created: number; updated: number; errors: number; message?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiFetch(`${BASE_URL}/upload-csv`, { method: 'POST', body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'CSV upload failed');
    return json;
  },

  exportVillagesCSV: async (records: Village[]): Promise<void> => {
    const headers = [
      'Village ID', 'Village Name', 'Village Code', 'Branch', 'Status', 'Village Classification',
      'Pincode', 'City', 'Population', 'Distance From Branch', 'Road Type',
      'Inserted On', 'Inserted By',
    ];
    const csv = [
      headers.join(','),
      ...records.map(v => [
        v.villageId, v.villageName, v.villageCode, v.branchName, v.status,
        v.villageClassification, v.pincode, v.city, v.population,
        v.distanceFromBranch, v.roadType, v.insertedOn, v.insertedBy,
      ].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `villages_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  downloadTemplate: async (): Promise<void> => {
    const headers = [
      'branchId', 'villageName', 'villageClassification', 'pincode', 'district',
      'postOffice', 'mohallaName', 'panchayatName', 'policeStation', 'contactPersonName',
      'language', 'customerBaseExpected', 'distanceFromBranch', 'bankDistance',
      'nearestBankName', 'hospitalDistance', 'nearestHospitalName', 'policeStationDistance',
      'population', 'roadType', 'schoolType', 'hospitalType', 'religionMajority',
      'category', 'countryName',
    ];
    const blob = new Blob([headers.join(',')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'villages_template.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};