import React, { useState } from 'react';
import { VillageFormData } from '../../types/village';

interface VillageFormProps {
  onSubmit: (data: VillageFormData) => void;
  onCancel: () => void;
  initialData?: Partial<VillageFormData>;
}

export const VillageForm: React.FC<VillageFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<VillageFormData>({
    countryName: initialData.countryName || 'India',
    branchId: initialData.branchId || '',
    villageName: initialData.villageName || '',
    villageClassification: initialData.villageClassification || 'Rural',
    pincode: initialData.pincode || '',
    district: initialData.district || '',
    postOffice: initialData.postOffice || '',
    mohallaName: initialData.mohallaName || '',
    panchayatName: initialData.panchayatName || '',
    policeStation: initialData.policeStation || '',
    contactPersonName: initialData.contactPersonName || '',
    language: initialData.language || 'Hindi',
    customerBaseExpected: initialData.customerBaseExpected || 0,
    distanceFromBranch: initialData.distanceFromBranch || 0,
    bankDistance: initialData.bankDistance || 0,
    nearestBankName: initialData.nearestBankName || '',
    hospitalDistance: initialData.hospitalDistance || 0,
    nearestHospitalName: initialData.nearestHospitalName || '',
    policeStationDistance: initialData.policeStationDistance || 0,
    population: initialData.population || 0,
    roadType: initialData.roadType || 'Paved',
    schoolType: initialData.schoolType || 'Government',
    hospitalType: initialData.hospitalType || 'Government',
    religionMajority: initialData.religionMajority || 'Hindu',
    category: initialData.category || 'General',
  });

  const [errors, setErrors] = useState<Partial<VillageFormData>>({});

  const branches = ['BR001', 'BR002', 'BR003', 'BR004', 'BR005'];
  const villageClassifications = ['Rural', 'Semi-Urban', 'Urban', 'Metro'];
  const languages = ['Hindi', 'English', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'];
  const roadTypes = ['Paved', 'Unpaved', 'Mixed'];
  const schoolTypes = ['Government', 'Private', 'Both', 'None'];
  const hospitalTypes = ['Government', 'Private', 'Both', 'None'];
  const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'];
  const categories = ['General', 'OBC', 'SC', 'ST', 'Other'];

  const validateForm = (): boolean => {
    const newErrors: Partial<VillageFormData> = {};

    if (!formData.countryName) newErrors.countryName = 'Country name is required';
    if (!formData.branchId) newErrors.branchId = 'Branch ID is required';
    if (!formData.villageName) newErrors.villageName = 'Village name is required';
    if (!formData.villageClassification) newErrors.villageClassification = 'Village classification is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.postOffice) newErrors.postOffice = 'Post office is required';
    if (!formData.mohallaName) newErrors.mohallaName = 'Mohalla name is required';
    if (!formData.panchayatName) newErrors.panchayatName = 'Panchayat name is required';
    if (!formData.policeStation) newErrors.policeStation = 'Police station is required';
    if (!formData.contactPersonName) newErrors.contactPersonName = 'Contact person name is required';
    if (!formData.language) newErrors.language = 'Language is required';
    if (formData.customerBaseExpected < 0) newErrors.customerBaseExpected = 'Customer base expected cannot be negative';
    if (formData.distanceFromBranch < 0) newErrors.distanceFromBranch = 'Distance from branch cannot be negative';
    if (formData.bankDistance < 0) newErrors.bankDistance = 'Bank distance cannot be negative';
    if (!formData.nearestBankName) newErrors.nearestBankName = 'Nearest bank name is required';
    if (formData.hospitalDistance < 0) newErrors.hospitalDistance = 'Hospital distance cannot be negative';
    if (!formData.nearestHospitalName) newErrors.nearestHospitalName = 'Nearest hospital name is required';
    if (formData.policeStationDistance < 0) newErrors.policeStationDistance = 'Police station distance cannot be negative';
    if (formData.population <= 0) newErrors.population = 'Population must be greater than 0';
    if (!formData.roadType) newErrors.roadType = 'Road type is required';
    if (!formData.schoolType) newErrors.schoolType = 'School type is required';
    if (!formData.hospitalType) newErrors.hospitalType = 'Hospital type is required';
    if (!formData.religionMajority) newErrors.religionMajority = 'Religion majority is required';
    if (!formData.category) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof VillageFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Basic Information Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          📋 Basic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Country Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.countryName}
              onChange={(e) => handleChange('countryName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.countryName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter country name"
            />
            {errors.countryName && <p className="text-red-500 text-xs mt-1">{errors.countryName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Branch ID <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.branchId}
              onChange={(e) => handleChange('branchId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.branchId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Branch</option>
              {branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            {errors.branchId && <p className="text-red-500 text-xs mt-1">{errors.branchId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Village Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.villageName}
              onChange={(e) => handleChange('villageName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.villageName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter village name"
            />
            {errors.villageName && <p className="text-red-500 text-xs mt-1">{errors.villageName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Village Classification <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.villageClassification}
              onChange={(e) => handleChange('villageClassification', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.villageClassification ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Classification</option>
              {villageClassifications.map(classification => (
                <option key={classification} value={classification}>{classification}</option>
              ))}
            </select>
            {errors.villageClassification && <p className="text-red-500 text-xs mt-1">{errors.villageClassification}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => handleChange('pincode', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.pincode ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter pincode"
            />
            {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              District <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => handleChange('district', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.district ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter district"
            />
            {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Post Office <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.postOffice}
              onChange={(e) => handleChange('postOffice', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.postOffice ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter post office"
            />
            {errors.postOffice && <p className="text-red-500 text-xs mt-1">{errors.postOffice}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mohalla Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.mohallaName}
              onChange={(e) => handleChange('mohallaName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.mohallaName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter mohalla name"
            />
            {errors.mohallaName && <p className="text-red-500 text-xs mt-1">{errors.mohallaName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Panchayat Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.panchayatName}
              onChange={(e) => handleChange('panchayatName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.panchayatName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter panchayat name"
            />
            {errors.panchayatName && <p className="text-red-500 text-xs mt-1">{errors.panchayatName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Police Station <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.policeStation}
              onChange={(e) => handleChange('policeStation', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.policeStation ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter police station"
            />
            {errors.policeStation && <p className="text-red-500 text-xs mt-1">{errors.policeStation}</p>}
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          📞 Contact Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contact Person Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.contactPersonName}
              onChange={(e) => handleChange('contactPersonName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.contactPersonName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter contact person name"
            />
            {errors.contactPersonName && <p className="text-red-500 text-xs mt-1">{errors.contactPersonName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Language <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.language ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Language</option>
              {languages.map(language => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>
            {errors.language && <p className="text-red-500 text-xs mt-1">{errors.language}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer Base Expected
            </label>
            <input
              type="number"
              value={formData.customerBaseExpected}
              onChange={(e) => handleChange('customerBaseExpected', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.customerBaseExpected ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter expected customer base"
            />
            {errors.customerBaseExpected && <p className="text-red-500 text-xs mt-1">{errors.customerBaseExpected}</p>}
          </div>
        </div>
      </div>

      {/* Distance Information Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          🗺️ Distance Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Distance From Branch (kms) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.distanceFromBranch}
              onChange={(e) => handleChange('distanceFromBranch', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.distanceFromBranch ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter distance from branch"
            />
            {errors.distanceFromBranch && <p className="text-red-500 text-xs mt-1">{errors.distanceFromBranch}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bank Distance (kms) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.bankDistance}
              onChange={(e) => handleChange('bankDistance', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.bankDistance ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter bank distance"
            />
            {errors.bankDistance && <p className="text-red-500 text-xs mt-1">{errors.bankDistance}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nearest Bank Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nearestBankName}
              onChange={(e) => handleChange('nearestBankName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.nearestBankName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter nearest bank name"
            />
            {errors.nearestBankName && <p className="text-red-500 text-xs mt-1">{errors.nearestBankName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hospital Distance (kms) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.hospitalDistance}
              onChange={(e) => handleChange('hospitalDistance', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.hospitalDistance ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter hospital distance"
            />
            {errors.hospitalDistance && <p className="text-red-500 text-xs mt-1">{errors.hospitalDistance}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nearest Hospital Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nearestHospitalName}
              onChange={(e) => handleChange('nearestHospitalName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.nearestHospitalName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter nearest hospital name"
            />
            {errors.nearestHospitalName && <p className="text-red-500 text-xs mt-1">{errors.nearestHospitalName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Police Station Distance (kms) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.policeStationDistance}
              onChange={(e) => handleChange('policeStationDistance', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.policeStationDistance ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter police station distance"
            />
            {errors.policeStationDistance && <p className="text-red-500 text-xs mt-1">{errors.policeStationDistance}</p>}
          </div>
        </div>
      </div>

      {/* Demographics Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          👥 Demographics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Population <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.population}
              onChange={(e) => handleChange('population', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.population ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter population"
            />
            {errors.population && <p className="text-red-500 text-xs mt-1">{errors.population}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Road Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.roadType}
              onChange={(e) => handleChange('roadType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.roadType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Road Type</option>
              {roadTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.roadType && <p className="text-red-500 text-xs mt-1">{errors.roadType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              School Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.schoolType}
              onChange={(e) => handleChange('schoolType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.schoolType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select School Type</option>
              {schoolTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.schoolType && <p className="text-red-500 text-xs mt-1">{errors.schoolType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hospital Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.hospitalType}
              onChange={(e) => handleChange('hospitalType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.hospitalType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Hospital Type</option>
              {hospitalTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.hospitalType && <p className="text-red-500 text-xs mt-1">{errors.hospitalType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Religion Majority <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.religionMajority}
              onChange={(e) => handleChange('religionMajority', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.religionMajority ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Religion</option>
              {religions.map(religion => (
                <option key={religion} value={religion}>{religion}</option>
              ))}
            </select>
            {errors.religionMajority && <p className="text-red-500 text-xs mt-1">{errors.religionMajority}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.category ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Save Village
        </button>
      </div>
    </form>
  );
};