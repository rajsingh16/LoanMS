import { apiFetch } from '../lib/api';

export interface EnhancedLoanClient {
  id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  aadhaarNumber: string;
  voterCardNumber: string;
  kycType: string;
  kycId: string;
  cycle: number;
  dateOfBirth: string;
  age: number;
  fatherName: string;
  motherName: string;
  gender: 'Male' | 'Female' | 'Other';
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  mobileNumber: string;
  status: 'active' | 'inactive';
  qualification: string;
  language: string;
  caste: string;
  religion: string;
  occupation: string;
  landHolding: string;
  monthlyIncome: number;
  annualIncome: number;
  householdIncome: number;
  monthlyExpense: number;
  monthlyObligation: number;
}

export type ClientFormData = Omit<EnhancedLoanClient, 'id' | 'clientId' | 'age'>;

export interface ClientFilterOptions {
  clientCode?: string;
  voterCardNumber?: string;
  aadhaarNumber?: string;
}

const BASE_URL = '/api/clients';

export const clientService = {
  getAllClients: async (): Promise<EnhancedLoanClient[]> => {
    const res = await apiFetch(BASE_URL);
    const json = await res.json();
    return json.data ?? json;
  },

  getClientById: async (id: string): Promise<EnhancedLoanClient> => {
    const res = await apiFetch(`${BASE_URL}/${id}`);
    const json = await res.json();
    return json.data ?? json;
  },

  createClient: async (formData: ClientFormData): Promise<EnhancedLoanClient> => {
    const res = await apiFetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create client');
    return json.data ?? json;
  },

  updateClient: async (id: string, formData: ClientFormData): Promise<EnhancedLoanClient> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update client');
    return json.data ?? json;
  },

  deleteClient: async (id: string): Promise<void> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Failed to delete client');
    }
  },

  uploadClientsCSV: async (
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

  exportClientsCSV: async (clients: EnhancedLoanClient[]): Promise<void> => {
    const headers = [
      'Client ID', 'First Name', 'Last Name', 'Aadhaar Number', 'Voter Card Number',
      'KYC Type', 'KYC ID', 'Cycle', 'Date of Birth', 'Age', 'Father Name', 'Mother Name',
      'Gender', 'Marital Status', 'Mobile Number', 'Status', 'Qualification', 'Language',
      'Caste', 'Religion', 'Occupation', 'Land Holding', 'Monthly Income', 'Annual Income',
      'Household Income', 'Monthly Expense', 'Monthly Obligation',
    ];

    const csvContent = [
      headers.join(','),
      ...clients.map(c =>
        [
          c.clientId, c.firstName, c.lastName, c.aadhaarNumber, c.voterCardNumber,
          c.kycType, c.kycId, c.cycle, c.dateOfBirth, c.age, c.fatherName, c.motherName,
          c.gender, c.maritalStatus, c.mobileNumber, c.status, c.qualification, c.language,
          c.caste, c.religion, c.occupation, c.landHolding, c.monthlyIncome, c.annualIncome,
          c.householdIncome, c.monthlyExpense, c.monthlyObligation,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  downloadTemplate: async (): Promise<void> => {
    const templateHeaders = [
      'firstName', 'lastName', 'aadhaarNumber', 'voterCardNumber', 'kycType', 'kycId',
      'cycle', 'dateOfBirth', 'fatherName', 'motherName', 'gender', 'maritalStatus',
      'mobileNumber', 'status', 'qualification', 'language', 'caste', 'religion',
      'occupation', 'landHolding', 'monthlyIncome', 'annualIncome', 'householdIncome',
      'monthlyExpense', 'monthlyObligation',
    ];
    const blob = new Blob([templateHeaders.join(',')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};