import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { VillageFilterDropdown } from '../../../components/Common/VillageFilterDropdown';
import { VillageForm } from '../../../components/Forms/VillageForm';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { Village, VillageFormData, VillageFilterOptions } from '../../../types/village';
import { useAuth } from '../../../hooks/useAuth';
import { Building, MapPin, Users, Calendar, Edit, Trash2, Phone, Mail, CheckCircle, XCircle, Download, AlertCircle, Loader, Plus, Home, School, Guitar as Hospital, ShoppingCart, Shield } from 'lucide-react';

export const Villages: React.FC = () => {
  const { hasPermission } = useAuth();
  const [villages, setVillages] = useState<Village[]>([]);
  const [filteredVillages, setFilteredVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [editingVillage, setEditingVillage] = useState<Village | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Sample data for demonstration
  const sampleVillages: Village[] = [
    {
      id: '1',
      villageId: 'VIL001',
      villageName: 'Rampur',
      villageCode: 'RAM001',
      branchId: 'BR001',
      branchName: 'Main Branch',
      status: 'active',
      villageClassification: 'Rural',
      pincode: '110001',
      city: 'Delhi',
      isPrimaryHealthCentre: true,
      isPoliticallyInfluenced: false,
      countryName: 'India',
      district: 'Central Delhi',
      postOffice: 'Rampur PO',
      mohallaName: 'Rampur Mohalla',
      panchayatName: 'Rampur Panchayat',
      policeStation: 'Rampur PS',
      contactPersonName: 'Ram Singh',
      language: 'Hindi',
      customerBaseExpected: 500,
      distanceFromBranch: 5.5,
      bankDistance: 2.0,
      nearestBankName: 'SBI Rampur',
      hospitalDistance: 3.0,
      nearestHospitalName: 'Rampur Hospital',
      policeStationDistance: 1.5,
      population: 2500,
      roadType: 'Paved',
      schoolType: 'Government',
      hospitalType: 'Government',
      religionMajority: 'Hindu',
      category: 'General',
      insertedOn: '2024-01-15',
      insertedBy: 'Admin User'
    },
    {
      id: '2',
      villageId: 'VIL002',
      villageName: 'Shyampur',
      villageCode: 'SHY001',
      branchId: 'BR002',
      branchName: 'North Branch',
      status: 'active',
      villageClassification: 'Semi-Urban',
      pincode: '110002',
      city: 'Delhi',
      isPrimaryHealthCentre: false,
      isPoliticallyInfluenced: true,
      countryName: 'India',
      district: 'North Delhi',
      postOffice: 'Shyampur PO',
      mohallaName: 'Shyampur Mohalla',
      panchayatName: 'Shyampur Panchayat',
      policeStation: 'Shyampur PS',
      contactPersonName: 'Shyam Kumar',
      language: 'Hindi',
      customerBaseExpected: 750,
      distanceFromBranch: 8.2,
      bankDistance: 1.5,
      nearestBankName: 'HDFC Shyampur',
      hospitalDistance: 4.5,
      nearestHospitalName: 'Shyampur Clinic',
      policeStationDistance: 2.0,
      population: 3200,
      roadType: 'Paved',
      schoolType: 'Both',
      hospitalType: 'Private',
      religionMajority: 'Hindu',
      category: 'OBC',
      insertedOn: '2024-01-12',
      insertedBy: 'Manager User'
    }
  ];

  const branches = Array.from(new Set(sampleVillages.map(v => v.branchName)));
  const pincodes = Array.from(new Set(sampleVillages.map(v => v.pincode)));
  const villageNames = Array.from(new Set(sampleVillages.map(v => v.villageName)));

  useEffect(() => {
    loadVillages();
  }, []);

  const loadVillages = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setVillages(sampleVillages);
        setFilteredVillages(sampleVillages);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load villages');
      console.error('Error loading villages:', err);
      setLoading(false);
    }
  };

  const handleFilter = (filters: VillageFilterOptions) => {
    let filtered = villages;

    if (filters.branch) {
      filtered = filtered.filter(village => village.branchName === filters.branch);
    }
    if (filters.pincode) {
      filtered = filtered.filter(village => village.pincode === filters.pincode);
    }
    if (filters.village) {
      filtered = filtered.filter(village => village.villageName === filters.village);
    }
    if (filters.status) {
      filtered = filtered.filter(village => village.status === filters.status);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(village => village.insertedOn >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(village => village.insertedOn <= filters.dateTo!);
    }

    setFilteredVillages(filtered);
  };

  const handleFetch = () => {
    loadVillages();
    setSuccess('Data fetched successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddVillage = async (formData: VillageFormData) => {
    try {
      const newVillage: Village = {
        id: String(villages.length + 1),
        villageId: `VIL${String(villages.length + 1).padStart(3, '0')}`,
        villageName: formData.villageName,
        villageCode: `${formData.villageName.substring(0, 3).toUpperCase()}${String(villages.length + 1).padStart(3, '0')}`,
        branchId: formData.branchId,
        branchName: 'Sample Branch',
        status: 'active',
        villageClassification: formData.villageClassification,
        pincode: formData.pincode,
        city: 'Delhi',
        isPrimaryHealthCentre: false,
        isPoliticallyInfluenced: false,
        countryName: formData.countryName,
        district: formData.district,
        postOffice: formData.postOffice,
        mohallaName: formData.mohallaName,
        panchayatName: formData.panchayatName,
        policeStation: formData.policeStation,
        contactPersonName: formData.contactPersonName,
        language: formData.language,
        customerBaseExpected: formData.customerBaseExpected,
        distanceFromBranch: formData.distanceFromBranch,
        bankDistance: formData.bankDistance,
        nearestBankName: formData.nearestBankName,
        hospitalDistance: formData.hospitalDistance,
        nearestHospitalName: formData.nearestHospitalName,
        policeStationDistance: formData.policeStationDistance,
        population: formData.population,
        roadType: formData.roadType,
        schoolType: formData.schoolType,
        hospitalType: formData.hospitalType,
        religionMajority: formData.religionMajority,
        category: formData.category,
        insertedOn: new Date().toISOString().split('T')[0],
        insertedBy: 'Current User'
      };

      setVillages(prev => [...prev, newVillage]);
      setFilteredVillages(prev => [...prev, newVillage]);
      setShowAddModal(false);
      setSuccess('Village created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create village');
      console.error('Error creating village:', err);
    }
  };

  const handleEditVillage = (village: Village) => {
    setEditingVillage(village);
  };

  const handleUpdateVillage = async (formData: VillageFormData) => {
    if (!editingVillage) return;

    try {
      const updatedVillage: Village = {
        ...editingVillage,
        villageName: formData.villageName,
        villageClassification: formData.villageClassification,
        pincode: formData.pincode,
        countryName: formData.countryName,
        district: formData.district,
        postOffice: formData.postOffice,
        mohallaName: formData.mohallaName,
        panchayatName: formData.panchayatName,
        policeStation: formData.policeStation,
        contactPersonName: formData.contactPersonName,
        language: formData.language,
        customerBaseExpected: formData.customerBaseExpected,
        distanceFromBranch: formData.distanceFromBranch,
        bankDistance: formData.bankDistance,
        nearestBankName: formData.nearestBankName,
        hospitalDistance: formData.hospitalDistance,
        nearestHospitalName: formData.nearestHospitalName,
        policeStationDistance: formData.policeStationDistance,
        population: formData.population,
        roadType: formData.roadType,
        schoolType: formData.schoolType,
        hospitalType: formData.hospitalType,
        religionMajority: formData.religionMajority,
        category: formData.category,
        updatedOn: new Date().toISOString().split('T')[0],
        updatedBy: 'Current User'
      };

      setVillages(prev => prev.map(v => v.id === editingVillage.id ? updatedVillage : v));
      setFilteredVillages(prev => prev.map(v => v.id === editingVillage.id ? updatedVillage : v));
      setEditingVillage(null);
      setSuccess('Village updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update village');
      console.error('Error updating village:', err);
    }
  };

  const handleDeleteVillage = async (villageId: string) => {
    if (!window.confirm('Are you sure you want to delete this village?')) return;

    try {
      setVillages(prev => prev.filter(v => v.id !== villageId));
      setFilteredVillages(prev => prev.filter(v => v.id !== villageId));
      setSuccess('Village deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete village');
      console.error('Error deleting village:', err);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Village ID', 'Village Name', 'Village Code', 'Branch', 'Status', 'Village Classification',
      'Pincode', 'Close Date', 'City', 'Is Primary Health Centre', 'Is Politically Influenced',
      'Distance From Branch (kms)', 'Main Road Distance (kms)', 'School Distance (kms)',
      'Bank Distance (kms)', 'Hospital Distance (kms)', 'Market Distance (kms)',
      'Police Station Distance (kms)', 'Number of Schools', 'Total Clinics', 'Total Kiryana Stores',
      'Total General Stores', 'Total Tailors', 'Total Vegetable Stalls', 'Total Fruit Stalls',
      'Total Tea Stalls', 'Total Dairies', 'Total Cattle', 'Total Hotels', 'Men Population',
      'Women Population', 'Population', 'Literate Men', 'Literate Women', 'Total Kutcha Houses',
      'Total Pakka Houses', 'Road Type', 'School Type', 'Hospital Type', 'Anganwadi Name',
      'Pradhan Name', 'Gram Panchayat', 'Mauja Name', 'Contact Person Name', 'Contact Person Number',
      'Approved On', 'Approved By', 'Language', 'MFI 1 Detail', 'MFI 2 Detail', 'MFI 3 Detail',
      'MFI 4 Detail', 'Latitude', 'Longitude', 'Inserted On', 'Inserted By', 'Updated On', 'Updated By'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredVillages.map(village => [
        village.villageId,
        village.villageName,
        village.villageCode,
        village.branchName,
        village.status,
        village.villageClassification,
        village.pincode,
        village.closeDate || '',
        village.city,
        village.isPrimaryHealthCentre ? 'Yes' : 'No',
        village.isPoliticallyInfluenced ? 'Yes' : 'No',
        village.distanceFromBranch,
        village.mainRoadDistance || '',
        village.schoolDistance || '',
        village.bankDistance,
        village.hospitalDistance,
        village.marketDistance || '',
        village.policeStationDistance,
        village.numberOfSchools || '',
        village.totalClinics || '',
        village.totalKiryanaStores || '',
        village.totalGeneralStores || '',
        village.totalTailors || '',
        village.totalVegetableStalls || '',
        village.totalFruitStalls || '',
        village.totalTeaStalls || '',
        village.totalDairies || '',
        village.totalCattle || '',
        village.totalHotels || '',
        village.menPopulation || '',
        village.womenPopulation || '',
        village.population,
        village.literateMen || '',
        village.literateWomen || '',
        village.totalKutchaHouses || '',
        village.totalPakkaHouses || '',
        village.roadType,
        village.schoolType,
        village.hospitalType,
        village.anganwadiName || '',
        village.pradhanName || '',
        village.gramPanchayat || '',
        village.maujaName || '',
        village.contactPersonName,
        village.contactPersonNumber || '',
        village.approvedOn || '',
        village.approvedBy || '',
        village.language,
        village.mfi1Detail || '',
        village.mfi2Detail || '',
        village.mfi3Detail || '',
        village.mfi4Detail || '',
        village.latitude || '',
        village.longitude || '',
        village.insertedOn,
        village.insertedBy,
        village.updatedOn || '',
        village.updatedBy || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `villages_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setSuccess('CSV exported successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getBooleanIcon = (value: boolean) => {
    return value ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-gray-400" />
    );
  };

  const columns = [
    {
      key: 'actions',
      label: 'Action',
      render: (value: any, row: Village) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard module="loan" permission="write">
            <button
              onClick={() => handleEditVillage(row)}
              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors duration-200"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard module="loan" permission="delete">
            <button
              onClick={() => handleDeleteVillage(row.id)}
              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors duration-200"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </PermissionGuard>
        </div>
      )
    },
    {
      key: 'villageId',
      label: 'Village ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'villageName',
      label: 'Village Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'villageCode',
      label: 'Village Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'branchName',
      label: 'Branch',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
            value === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        </div>
      )
    },
    {
      key: 'villageClassification',
      label: 'Village Classification',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {value}
        </span>
      )
    },
    {
      key: 'pincode',
      label: 'Pincode',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'closeDate',
      label: 'Close Date',
      render: (value?: string) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'city',
      label: 'City',
      sortable: true,
    },
    {
      key: 'isPrimaryHealthCentre',
      label: 'Is Primary Health Centre',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'isPoliticallyInfluenced',
      label: 'Is Politically Influenced',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'distanceFromBranch',
      label: 'Distance From Branch (kms)',
      sortable: true,
      render: (value: number) => `${value} km`
    },
    {
      key: 'mainRoadDistance',
      label: 'Main Road Distance (kms)',
      render: (value?: number) => value ? `${value} km` : '-'
    },
    {
      key: 'schoolDistance',
      label: 'School Distance (kms)',
      render: (value?: number) => value ? `${value} km` : '-'
    },
    {
      key: 'bankDistance',
      label: 'Bank Distance (kms)',
      sortable: true,
      render: (value: number) => `${value} km`
    },
    {
      key: 'hospitalDistance',
      label: 'Hospital Distance (kms)',
      sortable: true,
      render: (value: number) => `${value} km`
    },
    {
      key: 'marketDistance',
      label: 'Market Distance (kms)',
      render: (value?: number) => value ? `${value} km` : '-'
    },
    {
      key: 'policeStationDistance',
      label: 'Police Station Distance (kms)',
      sortable: true,
      render: (value: number) => `${value} km`
    },
    {
      key: 'numberOfSchools',
      label: 'Number of Schools',
      render: (value?: number) => (
        <div className="flex items-center space-x-1">
          <School className="w-4 h-4 text-gray-400" />
          <span>{value || 0}</span>
        </div>
      )
    },
    {
      key: 'totalClinics',
      label: 'Total Clinics',
      render: (value?: number) => (
        <div className="flex items-center space-x-1">
          <Hospital className="w-4 h-4 text-gray-400" />
          <span>{value || 0}</span>
        </div>
      )
    },
    {
      key: 'totalKiryanaStores',
      label: 'Total Kiryana Stores',
      render: (value?: number) => (
        <div className="flex items-center space-x-1">
          <ShoppingCart className="w-4 h-4 text-gray-400" />
          <span>{value || 0}</span>
        </div>
      )
    },
    {
      key: 'totalGeneralStores',
      label: 'Total General Stores',
      render: (value?: number) => value || 0
    },
    {
      key: 'totalTailors',
      label: 'Total Tailors',
      render: (value?: number) => value || 0
    },
    {
      key: 'totalVegetableStalls',
      label: 'Total Vegetable Stalls',
      render: (value?: number) => value || 0
    },
    {
      key: 'totalFruitStalls',
      label: 'Total Fruit Stalls',
      render: (value?: number) => value || 0
    },
    {
      key: 'totalTeaStalls',
      label: 'Total Tea Stalls',
      render: (value?: number) => value || 0
    },
    {
      key: 'totalDairies',
      label: 'Total Dairies',
      render: (value?: number) => value || 0
    },
    {
      key: 'totalCattle',
      label: 'Total Cattle',
      render: (value?: number) => value || 0
    },
    {
      key: 'totalHotels',
      label: 'Total Hotels',
      render: (value?: number) => value || 0
    },
    {
      key: 'menPopulation',
      label: 'Men Population',
      render: (value?: number) => (
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-blue-400" />
          <span>{value || 0}</span>
        </div>
      )
    },
    {
      key: 'womenPopulation',
      label: 'Women Population',
      render: (value?: number) => (
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-pink-400" />
          <span>{value || 0}</span>
        </div>
      )
    },
    {
      key: 'population',
      label: 'Population',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'literateMen',
      label: 'Literate Men',
      render: (value?: number) => value || 0
    },
    {
      key: 'literateWomen',
      label: 'Literate Women',
      render: (value?: number) => value || 0
    },
    {
      key: 'totalKutchaHouses',
      label: 'Total Kutcha Houses',
      render: (value?: number) => (
        <div className="flex items-center space-x-1">
          <Home className="w-4 h-4 text-orange-400" />
          <span>{value || 0}</span>
        </div>
      )
    },
    {
      key: 'totalPakkaHouses',
      label: 'Total Pakka Houses',
      render: (value?: number) => (
        <div className="flex items-center space-x-1">
          <Home className="w-4 h-4 text-green-400" />
          <span>{value || 0}</span>
        </div>
      )
    },
    {
      key: 'roadType',
      label: 'Road Type',
      sortable: true,
    },
    {
      key: 'schoolType',
      label: 'School Type',
      sortable: true,
    },
    {
      key: 'hospitalType',
      label: 'Hospital Type',
      sortable: true,
    },
    {
      key: 'anganwadiName',
      label: 'Anganwadi Name',
      render: (value?: string) => value || '-'
    },
    {
      key: 'pradhanName',
      label: 'Pradhan Name',
      render: (value?: string) => value || '-'
    },
    {
      key: 'gramPanchayat',
      label: 'Gram Panchayat',
      render: (value?: string) => value || '-'
    },
    {
      key: 'maujaName',
      label: 'Mauja Name',
      render: (value?: string) => value || '-'
    },
    {
      key: 'contactPersonName',
      label: 'Contact Person Name',
      sortable: true,
    },
    {
      key: 'contactPersonNumber',
      label: 'Contact Person Number',
      render: (value?: string) => value ? (
        <div className="flex items-center space-x-1">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ) : '-'
    },
    {
      key: 'approvedOn',
      label: 'Approved On',
      render: (value?: string) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'approvedBy',
      label: 'Approved By',
      render: (value?: string) => value || '-'
    },
    {
      key: 'language',
      label: 'Language',
      sortable: true,
    },
    {
      key: 'mfi1Detail',
      label: 'MFI 1 Detail',
      render: (value?: string) => value || '-'
    },
    {
      key: 'mfi2Detail',
      label: 'MFI 2 Detail',
      render: (value?: string) => value || '-'
    },
    {
      key: 'mfi3Detail',
      label: 'MFI 3 Detail',
      render: (value?: string) => value || '-'
    },
    {
      key: 'mfi4Detail',
      label: 'MFI 4 Detail',
      render: (value?: string) => value || '-'
    },
    {
      key: 'latitude',
      label: 'Latitude',
      render: (value?: number) => value ? value.toFixed(6) : '-'
    },
    {
      key: 'longitude',
      label: 'Longitude',
      render: (value?: number) => value ? value.toFixed(6) : '-'
    },
    {
      key: 'insertedOn',
      label: 'Inserted On',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'insertedBy',
      label: 'Inserted By',
      sortable: true,
    },
    {
      key: 'updatedOn',
      label: 'Updated On',
      render: (value?: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'updatedBy',
      label: 'Updated By',
      render: (value?: string) => value || '-'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading villages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Villages</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage village information and demographics</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Village Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredVillages.length} records found
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <VillageFilterDropdown
                onFilter={handleFilter}
                onFetch={handleFetch}
                branches={branches}
                pincodes={pincodes}
                villages={villageNames}
              />
              
              <PermissionGuard module="loan" permission="read">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </PermissionGuard>
              
              <PermissionGuard module="loan" permission="write">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>New</span>
                </button>
              </PermissionGuard>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredVillages.map((village, index) => (
                <tr
                  key={village.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {column.render ? column.render(village[column.key as keyof Village], village) : village[column.key as keyof Village]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Village Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Village"
        size="xl"
      >
        <VillageForm
          onSubmit={handleAddVillage}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Village Modal */}
      <Modal
        isOpen={!!editingVillage}
        onClose={() => setEditingVillage(null)}
        title="Edit Village"
        size="xl"
      >
        {editingVillage && (
          <VillageForm
            onSubmit={handleUpdateVillage}
            onCancel={() => setEditingVillage(null)}
            initialData={{
              countryName: editingVillage.countryName,
              branchId: editingVillage.branchId,
              villageName: editingVillage.villageName,
              villageClassification: editingVillage.villageClassification,
              pincode: editingVillage.pincode,
              district: editingVillage.district,
              postOffice: editingVillage.postOffice,
              mohallaName: editingVillage.mohallaName,
              panchayatName: editingVillage.panchayatName,
              policeStation: editingVillage.policeStation,
              contactPersonName: editingVillage.contactPersonName,
              language: editingVillage.language,
              customerBaseExpected: editingVillage.customerBaseExpected,
              distanceFromBranch: editingVillage.distanceFromBranch,
              bankDistance: editingVillage.bankDistance,
              nearestBankName: editingVillage.nearestBankName,
              hospitalDistance: editingVillage.hospitalDistance,
              nearestHospitalName: editingVillage.nearestHospitalName,
              policeStationDistance: editingVillage.policeStationDistance,
              population: editingVillage.population,
              roadType: editingVillage.roadType,
              schoolType: editingVillage.schoolType,
              hospitalType: editingVillage.hospitalType,
              religionMajority: editingVillage.religionMajority,
              category: editingVillage.category,
            }}
          />
        )}
      </Modal>
    </div>
  );
};