import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { VillageFilterDropdown } from '../../../components/Common/VillageFilterDropdown';
import { VillageForm } from '../../../components/Forms/VillageForm';
import { CSVUpload } from '../../../components/Common/CSVUpload';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { DataTable } from '../../../components/Common/DataTable';
import { Village, VillageFormData, VillageFilterOptions } from '../../../types/village';
import { villageService } from '../../../services/villageService';
import { useAuth } from '../../../hooks/useAuth';
import {
  Building, MapPin, Users, Calendar, Edit, Trash2, Phone,
  CheckCircle, XCircle, Download, Upload, AlertCircle, FileDown,
  Home, School, Guitar as Hospital, ShoppingCart,
} from 'lucide-react';

export const Villages: React.FC = () => {
  const { hasPermission } = useAuth();
  const [villages, setVillages] = useState<Village[]>([]);
  const [filteredVillages, setFilteredVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [editingVillage, setEditingVillage] = useState<Village | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const branches = Array.from(new Set(villages.map(v => v.branchName)));
  const pincodes = Array.from(new Set(villages.map(v => v.pincode)));
  const villageNames = Array.from(new Set(villages.map(v => v.villageName)));

  useEffect(() => { loadVillages(); }, []);

  const loadVillages = async () => {
    try {
      setLoading(true);
      const data = await villageService.getAllVillages();
      setVillages(data); setFilteredVillages(data);
    } catch { setError('Failed to load villages'); }
    finally { setLoading(false); }
  };

  const handleFilter = (filters: VillageFilterOptions) => {
    let f = villages;
    if (filters.branch) f = f.filter(v => v.branchName === filters.branch);
    if (filters.pincode) f = f.filter(v => v.pincode === filters.pincode);
    if (filters.village) f = f.filter(v => v.villageName === filters.village);
    if (filters.status) f = f.filter(v => v.status === filters.status);
    if (filters.dateFrom) f = f.filter(v => v.insertedOn >= filters.dateFrom!);
    if (filters.dateTo) f = f.filter(v => v.insertedOn <= filters.dateTo!);
    setFilteredVillages(f);
  };

  const handleFetch = () => { loadVillages(); setSuccess('Data fetched successfully!'); setTimeout(() => setSuccess(''), 3000); };

  const handleAdd = async (formData: VillageFormData) => {
    try {
      setIsSubmitting(true);
      const newRecord = await villageService.createVillage(formData);
      setVillages(prev => [...prev, newRecord]); setFilteredVillages(prev => [...prev, newRecord]);
      setShowAddModal(false); setSuccess('Village created successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to create village'); }
    finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (formData: VillageFormData) => {
    if (!editingVillage) return;
    try {
      setIsSubmitting(true);
      const updated = await villageService.updateVillage(editingVillage.id, formData);
      setVillages(prev => prev.map(v => v.id === editingVillage.id ? updated : v));
      setFilteredVillages(prev => prev.map(v => v.id === editingVillage.id ? updated : v));
      setEditingVillage(null); setSuccess('Village updated successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to update village'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this village?')) return;
    try {
      await villageService.deleteVillage(id);
      setVillages(prev => prev.filter(v => v.id !== id)); setFilteredVillages(prev => prev.filter(v => v.id !== id));
      setSuccess('Village deleted successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to delete village'); }
  };

  const handleCSVUpload = async (file: File) => {
    try {
      const result = await villageService.uploadVillagesCSV(file);
      if (result.success) { await loadVillages(); setShowCSVModal(false); setSuccess(`CSV upload completed! ${result.created} created, ${result.updated} updated, ${result.errors} errors.`); setTimeout(() => setSuccess(''), 5000); }
      else { setError(result.message || 'CSV upload failed'); }
    } catch { setError('Failed to upload CSV'); }
  };

  const getStatusIcon = (status: string) => status === 'active' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />;
  const getBooleanIcon = (value: boolean) => value ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" />;

  const columns = [
    { key: 'actions', label: 'Action', render: (_: unknown, row: Village) => (<div className="flex items-center space-x-2"><PermissionGuard module="loan" permission="write"><button onClick={() => setEditingVillage(row)} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"><Edit className="w-4 h-4" /></button></PermissionGuard><PermissionGuard module="loan" permission="delete"><button onClick={() => handleDelete(row.id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><Trash2 className="w-4 h-4" /></button></PermissionGuard></div>) },
    { key: 'villageId', label: 'Village ID', sortable: true, render: (v: string) => <span className="font-mono font-medium">{v}</span> },
    { key: 'villageName', label: 'Village Name', sortable: true, render: (v: string) => <div className="flex items-center space-x-2"><Building className="w-4 h-4 text-gray-400" /><span className="font-medium">{v}</span></div> },
    { key: 'villageCode', label: 'Village Code', sortable: true, render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'branchName', label: 'Branch', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (v: string) => <div className="flex items-center space-x-2">{getStatusIcon(v)}<span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${v === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span></div> },
    { key: 'villageClassification', label: 'Classification', sortable: true, render: (v: string) => <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">{v}</span> },
    { key: 'pincode', label: 'Pincode', sortable: true, render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'city', label: 'City', sortable: true },
    { key: 'isPrimaryHealthCentre', label: 'Is Primary Health Centre', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'isPoliticallyInfluenced', label: 'Is Politically Influenced', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'distanceFromBranch', label: 'Distance From Branch (km)', sortable: true, render: (v: number) => `${v} km` },
    { key: 'bankDistance', label: 'Bank Distance (km)', render: (v: number) => `${v} km` },
    { key: 'hospitalDistance', label: 'Hospital Distance (km)', render: (v: number) => `${v} km` },
    { key: 'policeStationDistance', label: 'Police Station Distance (km)', render: (v: number) => `${v} km` },
    { key: 'numberOfSchools', label: 'Number of Schools', render: (v?: number) => <div className="flex items-center space-x-1"><School className="w-4 h-4 text-gray-400" /><span>{v || 0}</span></div> },
    { key: 'totalClinics', label: 'Total Clinics', render: (v?: number) => <div className="flex items-center space-x-1"><Hospital className="w-4 h-4 text-gray-400" /><span>{v || 0}</span></div> },
    { key: 'totalKiryanaStores', label: 'Total Kiryana Stores', render: (v?: number) => <div className="flex items-center space-x-1"><ShoppingCart className="w-4 h-4 text-gray-400" /><span>{v || 0}</span></div> },
    { key: 'population', label: 'Population', sortable: true, render: (v: number) => <div className="flex items-center space-x-1"><Users className="w-4 h-4 text-gray-400" /><span className="font-medium">{v.toLocaleString()}</span></div> },
    { key: 'totalKutchaHouses', label: 'Total Kutcha Houses', render: (v?: number) => <div className="flex items-center space-x-1"><Home className="w-4 h-4 text-orange-400" /><span>{v || 0}</span></div> },
    { key: 'totalPakkaHouses', label: 'Total Pakka Houses', render: (v?: number) => <div className="flex items-center space-x-1"><Home className="w-4 h-4 text-green-400" /><span>{v || 0}</span></div> },
    { key: 'roadType', label: 'Road Type', sortable: true },
    { key: 'schoolType', label: 'School Type', sortable: true },
    { key: 'hospitalType', label: 'Hospital Type', sortable: true },
    { key: 'contactPersonName', label: 'Contact Person Name', sortable: true },
    { key: 'contactPersonNumber', label: 'Contact Person Number', render: (v?: string) => v ? <div className="flex items-center space-x-1"><Phone className="w-4 h-4 text-gray-400" /><span>{v}</span></div> : '-' },
    { key: 'language', label: 'Language', sortable: true },
    { key: 'latitude', label: 'Latitude', render: (v?: number) => v ? v.toFixed(6) : '-' },
    { key: 'longitude', label: 'Longitude', render: (v?: number) => v ? v.toFixed(6) : '-' },
    { key: 'insertedOn', label: 'Inserted On', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> },
    { key: 'insertedBy', label: 'Inserted By', sortable: true },
    { key: 'updatedOn', label: 'Updated On', render: (v?: string) => v ? <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> : '-' },
    { key: 'updatedBy', label: 'Updated By', render: (v?: string) => v || '-' },
  ];

  const filterComponent = (
    <div className="flex items-center space-x-3">
      <VillageFilterDropdown onFilter={handleFilter} onFetch={handleFetch} branches={branches} pincodes={pincodes} villages={villageNames} />
      <PermissionGuard module="loan" permission="read"><button onClick={() => villageService.downloadTemplate()} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><FileDown className="w-4 h-4" /><span>Template</span></button></PermissionGuard>
      <PermissionGuard module="loan" permission="read"><button onClick={() => villageService.exportVillagesCSV(filteredVillages)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Download className="w-4 h-4" /><span>Export CSV</span></button></PermissionGuard>
      <PermissionGuard module="loan" permission="write"><button onClick={() => setShowCSVModal(true)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Upload className="w-4 h-4" /><span>Upload CSV</span></button></PermissionGuard>
    </div>
  );

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Villages</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Manage village information and demographics</p></div>
      {success && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2"><CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{success}</span></div>}
      {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2"><AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span></div>}
      <DataTable columns={columns} data={filteredVillages} title="Village Management" loading={loading} onAdd={() => setShowAddModal(true)} filterComponent={filterComponent} />
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Village" size="xl"><VillageForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} isSubmitting={isSubmitting} /></Modal>
      <Modal isOpen={!!editingVillage} onClose={() => setEditingVillage(null)} title="Edit Village" size="xl">
        {editingVillage && (
          <VillageForm onSubmit={handleUpdate} onCancel={() => setEditingVillage(null)} isSubmitting={isSubmitting}
            initialData={{ countryName: editingVillage.countryName, branchId: editingVillage.branchId, villageName: editingVillage.villageName, villageClassification: editingVillage.villageClassification, pincode: editingVillage.pincode, district: editingVillage.district, postOffice: editingVillage.postOffice, mohallaName: editingVillage.mohallaName, panchayatName: editingVillage.panchayatName, policeStation: editingVillage.policeStation, contactPersonName: editingVillage.contactPersonName, language: editingVillage.language, customerBaseExpected: editingVillage.customerBaseExpected, distanceFromBranch: editingVillage.distanceFromBranch, bankDistance: editingVillage.bankDistance, nearestBankName: editingVillage.nearestBankName, hospitalDistance: editingVillage.hospitalDistance, nearestHospitalName: editingVillage.nearestHospitalName, policeStationDistance: editingVillage.policeStationDistance, population: editingVillage.population, roadType: editingVillage.roadType, schoolType: editingVillage.schoolType, hospitalType: editingVillage.hospitalType, religionMajority: editingVillage.religionMajority, category: editingVillage.category }}
          />
        )}
      </Modal>
      <Modal isOpen={showCSVModal} onClose={() => setShowCSVModal(false)} title="Upload Villages CSV" size="lg">
        <CSVUpload onUpload={handleCSVUpload} onCancel={() => setShowCSVModal(false)}
          templateColumns={['branchId', 'villageName', 'villageClassification', 'pincode', 'district', 'postOffice', 'mohallaName', 'panchayatName', 'policeStation', 'contactPersonName', 'language', 'customerBaseExpected', 'distanceFromBranch', 'bankDistance', 'nearestBankName', 'hospitalDistance', 'nearestHospitalName', 'policeStationDistance', 'population', 'roadType', 'schoolType', 'hospitalType', 'religionMajority', 'category', 'countryName']}
          entityName="villages" />
      </Modal>
    </div>
  );
};