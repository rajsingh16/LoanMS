import { Insurance } from '../types/product';
import { apiFetch } from '../lib/api';

export interface InsuranceFormData {
  insuranceCode: string;
  insuranceType: string;
  insuranceName: string;
  premiumCalType: string;
  premiumValue: number;
  paymentFrequency: string;
  durationInMonths: number;
  startDate: string;
  endDate: string;
  status?: string;
  isCoApplicantCovered: boolean;
  insuranceGlHead: string;
  insuranceRecHead: string;
  insuranceControlRecHead: string;
  writeOffInsuranceHead: string;
}

const BASE_URL = '/api/insurance';

export const insuranceService = {
  getAllInsurances: async (): Promise<Insurance[]> => {
    const res = await apiFetch(BASE_URL);
    const json = await res.json();
    return json.data ?? json;
  },

  createInsurance: async (formData: InsuranceFormData): Promise<Insurance> => {
    const res = await apiFetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create insurance');
    return json.data ?? json;
  },

  updateInsurance: async (id: string, formData: InsuranceFormData): Promise<Insurance> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update insurance');
    return json.data ?? json;
  },

  deleteInsurance: async (id: string): Promise<void> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Failed to delete insurance');
    }
  },

  uploadInsuranceCSV: async (
    file: File
  ): Promise<{ success: boolean; created: number; updated: number; errors: number; message?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiFetch(`${BASE_URL}/upload-csv`, { method: 'POST', body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'CSV upload failed');
    return json;
  },

  exportInsuranceCSV: async (records: Insurance[]): Promise<void> => {
    const headers = [
      'Insurance ID', 'Insurance Code', 'Insurance Type', 'Insurance Name', 'Premium Cal Type',
      'Premium Value', 'Payment Frequency', 'Duration In Months', 'Start Date', 'End Date',
      'Status', 'Is Co-Applicant Covered', 'Insurance GL Head', 'Insurance REC Head',
      'Insurance Control REC Head', 'WriteOff Insurance Head', 'Inserted On', 'Inserted By',
    ];
    const csv = [
      headers.join(','),
      ...records.map(i => [
        i.insuranceId, i.insuranceCode, i.insuranceType, i.insuranceName, i.premiumCalType,
        i.premiumValue, i.paymentFrequency, i.durationInMonths, i.startDate, i.endDate,
        i.status, i.isCoApplicantCovered ? 'Yes' : 'No', i.insuranceGlHead, i.insuranceRecHead,
        i.insuranceControlRecHead, i.writeOffInsuranceHead, i.insertedOn, i.insertedBy,
      ].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `insurance_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  downloadTemplate: async (): Promise<void> => {
    const headers = [
      'insuranceCode', 'insuranceType', 'insuranceName', 'premiumCalType', 'premiumValue',
      'paymentFrequency', 'durationInMonths', 'startDate', 'endDate', 'isCoApplicantCovered',
      'insuranceGlHead', 'insuranceRecHead', 'insuranceControlRecHead', 'writeOffInsuranceHead',
    ];
    const blob = new Blob([headers.join(',')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'insurance_template.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};