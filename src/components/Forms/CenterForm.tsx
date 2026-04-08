import React, { useState, useEffect } from 'react';
import { CenterFormData } from '../../types/center';
import { Toggle } from '../Common/Toggle';

interface CenterFormProps {
  onSubmit: (data: CenterFormData) => void;
  onCancel: () => void;
  initialData?: Partial<CenterFormData>;
  isSubmitting?: boolean;
  branches: { id: string; name: string }[];
  fieldOfficers: { id: string; name: string }[];
  villages: { id: string; name: string }[];
}

export const CenterForm: React.FC<CenterFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  isSubmitting = false,
  branches,
  fieldOfficers,
  villages
}) => {
  const [formData, setFormData] = useState<CenterFormData>({
    branchId: initialData.branchId || '',
    centerName: initialData.centerName || '',
    centerDay: initialData.centerDay || '',
    centerTime: initialData.centerTime || '',
    assignedTo: initialData.assignedTo || '',
    contactPersonName: initialData.contactPersonName || '',
    contactPersonNumber: initialData.contactPersonNumber || '',
    address1: initialData.address1 || '',
    address2: initialData.address2 || '',
    landmark: initialData.landmark || '',
    villageId: initialData.villageId || '',
    pincode: initialData.pincode || '',
    city: initialData.city || '',
    meetingPlace: initialData.meetingPlace || '',
    latitude: initialData.latitude,
    longitude: initialData.longitude,
    status: initialData.status || 'active',
    blacklisted: initialData.blacklisted || false,
    bcCenterId: initialData.bcCenterId || '',
    parentCenterId: initialData.parentCenterId || ''
  });

  const [errors, setErrors] = useState<Partial<CenterFormData>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Generate time options from 6:00 AM to 8:00 PM in 30-minute intervals
  const timeOptions = [];
  for (let hour = 6; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 20 && minute > 0) continue; // Skip after 8:00 PM
      const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
      const period = hour < 12 ? 'AM' : 'PM';
      timeOptions.push(`${formattedHour}:${minute === 0 ? '00' : minute} ${period}`);
    }
  }

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CenterFormData> = {};

    if (!formData.branchId) newErrors.branchId = 'Branch is required';
    if (!formData.centerName) newErrors.centerName = 'Center name is required';
    if (!formData.centerDay) newErrors.centerDay = 'Center day is required';
    if (!formData.centerTime) newErrors.centerTime = 'Center time is required';
    if (!formData.assignedTo) newErrors.assignedTo = 'Field officer assignment is required';
    if (!formData.address1) newErrors.address1 = 'Address is required';
    if (!formData.villageId) newErrors.villageId = 'Village is required';

    setErrors(newErrors);
    const valid = Object.keys(newErrors).length === 0;
    setIsFormValid(valid);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof CenterFormData, value: string | boolean | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-130px)]">
        {/* Basic Information Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            📋 Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Branch <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.branchId}
                onChange={(e) => handleChange('branchId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.branchId ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Branch</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
              {errors.branchId && <p className="text-red-500 text-xs mt-1">{errors.branchId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Center Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.centerName}
                onChange={(e) => handleChange('centerName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.centerName ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter center name"
              />
              {errors.centerName && <p className="text-red-500 text-xs mt-1">{errors.centerName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Center Day <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.centerDay}
                onChange={(e) => handleChange('centerDay', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.centerDay ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Day</option>
                {weekdays.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              {errors.centerDay && <p className="text-red-500 text-xs mt-1">{errors.centerDay}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Center Time <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.centerTime}
                onChange={(e) => handleChange('centerTime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.centerTime ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Time</option>
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              {errors.centerTime && <p className="text-red-500 text-xs mt-1">{errors.centerTime}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assigned To <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => handleChange('assignedTo', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.assignedTo ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Field Officer</option>
                {fieldOfficers.map(officer => (
                  <option key={officer.id} value={officer.id}>{officer.name}</option>
                ))}
              </select>
              {errors.assignedTo && <p className="text-red-500 text-xs mt-1">{errors.assignedTo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Village <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.villageId}
                onChange={(e) => handleChange('villageId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.villageId ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Village</option>
                {villages.map(village => (
                  <option key={village.id} value={village.id}>{village.name}</option>
                ))}
              </select>
              {errors.villageId && <p className="text-red-500 text-xs mt-1">{errors.villageId}</p>}
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            📞 Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                value={formData.contactPersonName || ''}
                onChange={(e) => handleChange('contactPersonName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter contact person name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Person Number
              </label>
              <input
                type="tel"
                value={formData.contactPersonNumber || ''}
                onChange={(e) => handleChange('contactPersonNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter contact number"
              />
            </div>
          </div>
        </div>

        {/* Address Information Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            🏠 Address Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address1}
                onChange={(e) => handleChange('address1', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.address1 ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter primary address"
              />
              {errors.address1 && <p className="text-red-500 text-xs mt-1">{errors.address1}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address 2
              </label>
              <input
                type="text"
                value={formData.address2 || ''}
                onChange={(e) => handleChange('address2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter secondary address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Landmark
              </label>
              <input
                type="text"
                value={formData.landmark || ''}
                onChange={(e) => handleChange('landmark', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter landmark"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={formData.pincode || ''}
                onChange={(e) => handleChange('pincode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter pincode"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meeting Place
              </label>
              <input
                type="text"
                value={formData.meetingPlace || ''}
                onChange={(e) => handleChange('meetingPlace', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter meeting place"
              />
            </div>
          </div>
        </div>

        {/* Location Information Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            📍 Location Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.latitude || ''}
                onChange={(e) => handleChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter latitude"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.longitude || ''}
                onChange={(e) => handleChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter longitude"
              />
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            ℹ️ Additional Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                BC Center ID
              </label>
              <input
                type="text"
                value={formData.bcCenterId || ''}
                onChange={(e) => handleChange('bcCenterId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter BC center ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Parent Center ID
              </label>
              <input
                type="text"
                value={formData.parentCenterId || ''}
                onChange={(e) => handleChange('parentCenterId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter parent center ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => handleChange('status', e.target.value as 'active' | 'inactive')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 mt-8">
              <Toggle
                checked={formData.blacklisted || false}
                onChange={(checked) => handleChange('blacklisted', checked)}
                label="Blacklisted"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions - Sticky Footer */}
      <div className="sticky bottom-0 flex justify-end space-x-3 p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-md">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Saving...</span>
            </>
          ) : (
            'Save Center'
          )}
        </button>
      </div>
    </form>
  );
};