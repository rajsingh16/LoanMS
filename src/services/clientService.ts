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

function mapClient(client: Record<string, unknown>): EnhancedLoanClient {
  const dob = client.date_of_birth as string;
  return {
    id: client.id as string,
    clientId: client.client_id as string,
    firstName: client.first_name as string,
    lastName: client.last_name as string,
    aadhaarNumber: client.aadhaar_number as string,
    voterCardNumber: client.voter_card_number as string,
    kycType: client.kyc_type as string,
    kycId: client.kyc_id as string,
    cycle: Number(client.cycle || 1),
    dateOfBirth: dob ? String(dob).split('T')[0] : '',
    age: Number(client.age || 0),
    fatherName: client.father_name as string,
    motherName: client.mother_name as string,
    gender: client.gender as EnhancedLoanClient['gender'],
    maritalStatus: client.marital_status as EnhancedLoanClient['maritalStatus'],
    mobileNumber: client.mobile_number as string,
    status: (client.status as EnhancedLoanClient['status']) || 'active',
    qualification: client.qualification as string,
    language: client.language as string,
    caste: client.caste as string,
    religion: client.religion as string,
    occupation: client.occupation as string,
    landHolding: client.land_holding as string,
    monthlyIncome: Number(client.monthly_income || 0),
    annualIncome: Number(client.annual_income || 0),
    householdIncome: Number(client.household_income || 0),
    monthlyExpense: Number(client.monthly_expense || 0),
    monthlyObligation: Number(client.monthly_obligation || 0),
  };
}

function toApiPayload(formData: ClientFormData) {
  return {
    first_name: formData.firstName,
    last_name: formData.lastName,
    aadhaar_number: formData.aadhaarNumber,
    voter_card_number: formData.voterCardNumber,
    kyc_type: formData.kycType,
    kyc_id: formData.kycId,
    cycle: formData.cycle,
    date_of_birth: formData.dateOfBirth,
    father_name: formData.fatherName,
    mother_name: formData.motherName,
    gender: formData.gender,
    marital_status: formData.maritalStatus,
    mobile_number: formData.mobileNumber,
    status: formData.status,
    qualification: formData.qualification,
    language: formData.language,
    caste: formData.caste,
    religion: formData.religion,
    occupation: formData.occupation,
    land_holding: formData.landHolding,
    monthly_income: formData.monthlyIncome,
    annual_income: formData.annualIncome,
    household_income: formData.householdIncome,
    monthly_expense: formData.monthlyExpense,
    monthly_obligation: formData.monthlyObligation,
  };
}

export const clientService = {
  getAllClients: async (): Promise<EnhancedLoanClient[]> => {
    const res = await apiFetch(BASE_URL);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to load clients');
    return (json.data ?? []).map(mapClient);
  },

  getClientById: async (id: string): Promise<EnhancedLoanClient> => {
    const res = await apiFetch(`${BASE_URL}/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to load client');
    return mapClient(json.data ?? json);
  },

  createClient: async (formData: ClientFormData): Promise<EnhancedLoanClient> => {
    const res = await apiFetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toApiPayload(formData)),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || json.message || 'Failed to create client');
    return mapClient(json.data ?? json);
  },

  updateClient: async (id: string, formData: ClientFormData): Promise<EnhancedLoanClient> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toApiPayload(formData)),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || json.message || 'Failed to update client');
    return mapClient(json.data ?? json);
  },

  deleteClient: async (id: string): Promise<void> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error?.message || json.message || 'Failed to delete client');
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
