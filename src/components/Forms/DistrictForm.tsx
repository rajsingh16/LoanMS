import React, { useState } from 'react';

interface DistrictFormData {
  countryId: string;
  stateId: string;
  districtCode: string;
  districtName: string;
}

interface DistrictFormProps {
  onSubmit: (data: DistrictFormData) => void;
  onCancel: () => void;
  initialData?: Partial<DistrictFormData>;
}

export const DistrictForm: React.FC<DistrictFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<DistrictFormData>({
    countryId: initialData.countryId || 'IN',
    stateId: initialData.stateId || '',
    districtCode: initialData.districtCode || '',
    districtName: initialData.districtName || '',
  });

  const [errors, setErrors] = useState<Partial<DistrictFormData>>({});

  const countries = [
    { id: 'IN', name: 'India' },
    { id: 'US', name: 'United States' },
    { id: 'UK', name: 'United Kingdom' }
  ];

  const states = [
    { id: 'DL', name: 'Delhi', countryId: 'IN' },
    { id: 'MH', name: 'Maharashtra', countryId: 'IN' },
    { id: 'KA', name: 'Karnataka', countryId: 'IN' },
    { id: 'TN', name: 'Tamil Nadu', countryId: 'IN' },
    { id: 'GJ', name: 'Gujarat', countryId: 'IN' },
    { id: 'RJ', name: 'Rajasthan', countryId: 'IN' }
  ];

  const filteredStates = states.filter(state => state.countryId === formData.countryId);

  const validateForm = (): boolean => {
    const newErrors: Partial<DistrictFormData> = {};

    if (!formData.countryId) newErrors.countryId = 'Country is required';
    if (!formData.stateId) newErrors.stateId = 'State is required';
    if (!formData.districtCode) newErrors.districtCode = 'District code is required';
    if (!formData.districtName) newErrors.districtName = 'District name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof DistrictFormData, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      // Reset state when country changes
      ...(field === 'countryId' ? { stateId: '' } : {})
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          📍 District Information
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Country ID <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.countryId}
              onChange={(e) => handleChange('countryId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.countryId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Country</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>{country.name}</option>
              ))}
            </select>
            {errors.countryId && <p className="text-red-500 text-xs mt-1">{errors.countryId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              State ID <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.stateId}
              onChange={(e) => handleChange('stateId', e.target.value)}
              disabled={!formData.countryId}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.stateId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select State</option>
              {filteredStates.map(state => (
                <option key={state.id} value={state.id}>{state.name}</option>
              ))}
            </select>
            {errors.stateId && <p className="text-red-500 text-xs mt-1">{errors.stateId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              District Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.districtCode}
              onChange={(e) => handleChange('districtCode', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.districtCode ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter district code"
            />
            {errors.districtCode && <p className="text-red-500 text-xs mt-1">{errors.districtCode}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              District Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.districtName}
              onChange={(e) => handleChange('districtName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.districtName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter district name"
            />
            {errors.districtName && <p className="text-red-500 text-xs mt-1">{errors.districtName}</p>}
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
          Save District
        </button>
      </div>
    </form>
  );
};