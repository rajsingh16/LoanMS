import { Village, VillageFormData, VillageFilterOptions } from '../types/village';
import { apiFetch } from '../lib/api';

const BASE_URL = '/api/villages';

function mapVillage(village: Record<string, unknown>): Village {
  return {
    id: village.id as string,
    villageId: village.village_id as string,
    villageName: village.village_name as string,
    villageCode: village.village_code as string,
    branchId: (village.branch_id as string) || '',
    branchName:
      village.branches && typeof village.branches === 'object'
        ? ((village.branches as { branch_name?: string }).branch_name || '')
        : '',
    status: (village.status as Village['status']) || 'active',
    villageClassification: village.village_classification as string,
    pincode: village.pincode as string,
    closeDate: undefined,
    city: (village.city as string) || '',
    isPrimaryHealthCentre: Boolean(village.is_primary_health_centre),
    isPoliticallyInfluenced: Boolean(village.is_politically_influenced),
    countryName: ((village.country_name as string) || 'India'),
    district: village.district as string,
    postOffice: village.post_office as string,
    mohallaName: village.mohalla_name as string,
    panchayatName: village.panchayat_name as string,
    policeStation: village.police_station as string,
    contactPersonName: village.contact_person_name as string,
    language: village.language as string,
    customerBaseExpected: Number(village.customer_base_expected || 0),
    distanceFromBranch: Number(village.distance_from_branch || 0),
    bankDistance: Number(village.bank_distance || 0),
    nearestBankName: village.nearest_bank_name as string,
    hospitalDistance: Number(village.hospital_distance || 0),
    nearestHospitalName: village.nearest_hospital_name as string,
    policeStationDistance: Number(village.police_station_distance || 0),
    population: Number(village.population || 0),
    roadType: village.road_type as string,
    schoolType: village.school_type as string,
    hospitalType: village.hospital_type as string,
    religionMajority: village.religion_majority as string,
    category: village.category as string,
    numberOfSchools: Number(village.number_of_schools || 0),
    totalClinics: Number(village.total_clinics || 0),
    totalKiryanaStores: Number(village.total_kiryana_stores || 0),
    totalKutchaHouses: Number(village.total_kutcha_houses || 0),
    totalPakkaHouses: Number(village.total_pakka_houses || 0),
    contactPersonNumber: village.contact_person_number as string | undefined,
    latitude: village.latitude ? parseFloat(String(village.latitude)) : undefined,
    longitude: village.longitude ? parseFloat(String(village.longitude)) : undefined,
    insertedOn: (village.created_at as string).split('T')[0],
    insertedBy:
      village.created_user && typeof village.created_user === 'object'
        ? `${(village.created_user as { first_name: string }).first_name} ${(village.created_user as { last_name: string }).last_name}`
        : 'System',
    updatedOn: village.updated_at ? (village.updated_at as string).split('T')[0] : undefined,
    updatedBy: village.updated_at ? 'Updated User' : undefined,
  };
}

export const villageService = {
  getAllVillages: async (): Promise<Village[]> => {
    const res = await apiFetch(BASE_URL);
    const json = await res.json();
    return (json.data ?? []).map(mapVillage);
  },

  createVillage: async (formData: VillageFormData): Promise<Village> => {
    const res = await apiFetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branch_id: formData.branchId,
        village_name: formData.villageName,
        village_classification: formData.villageClassification,
        pincode: formData.pincode,
        district: formData.district,
        post_office: formData.postOffice,
        mohalla_name: formData.mohallaName,
        panchayat_name: formData.panchayatName,
        police_station: formData.policeStation,
        contact_person_name: formData.contactPersonName,
        language: formData.language,
        customer_base_expected: formData.customerBaseExpected,
        distance_from_branch: formData.distanceFromBranch,
        bank_distance: formData.bankDistance,
        nearest_bank_name: formData.nearestBankName,
        hospital_distance: formData.hospitalDistance,
        nearest_hospital_name: formData.nearestHospitalName,
        police_station_distance: formData.policeStationDistance,
        population: formData.population,
        road_type: formData.roadType,
        school_type: formData.schoolType,
        hospital_type: formData.hospitalType,
        religion_majority: formData.religionMajority,
        category: formData.category,
        country_name: formData.countryName,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create village');
    return mapVillage(json.data ?? json);
  },

  updateVillage: async (id: string, formData: VillageFormData): Promise<Village> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branch_id: formData.branchId,
        village_name: formData.villageName,
        village_classification: formData.villageClassification,
        pincode: formData.pincode,
        district: formData.district,
        post_office: formData.postOffice,
        mohalla_name: formData.mohallaName,
        panchayat_name: formData.panchayatName,
        police_station: formData.policeStation,
        contact_person_name: formData.contactPersonName,
        language: formData.language,
        customer_base_expected: formData.customerBaseExpected,
        distance_from_branch: formData.distanceFromBranch,
        bank_distance: formData.bankDistance,
        nearest_bank_name: formData.nearestBankName,
        hospital_distance: formData.hospitalDistance,
        nearest_hospital_name: formData.nearestHospitalName,
        police_station_distance: formData.policeStationDistance,
        population: formData.population,
        road_type: formData.roadType,
        school_type: formData.schoolType,
        hospital_type: formData.hospitalType,
        religion_majority: formData.religionMajority,
        category: formData.category,
        country_name: formData.countryName,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update village');
    return mapVillage(json.data ?? json);
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
