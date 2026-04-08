import React, { useState } from 'react';
import { Toggle } from '../Common/Toggle';

interface InsuranceFormData {
  insuranceCode: string;
  insuranceType: string;
  insuranceName: string;
  premiumCalType: string;
  premiumValue: number;
  paymentFrequency: string;
  durationInMonths: number;
  startDate: string;
  endDate: string;
  isCoApplicantCovered: boolean;
  insuranceGlHead: string;
  insuranceRecHead: string;
  insuranceControlRecHead: string;
  writeOffInsuranceHead: string;
}

interface InsuranceFormProps {
  onSubmit: (data: InsuranceFormData) => void;
  onCancel: () => void;
  initialData?: Partial<InsuranceFormData>;
}

export const InsuranceForm: React.FC<InsuranceFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<InsuranceFormData>({
    insuranceCode: initialData.insuranceCode || '',
    insuranceType: initialData.insuranceType || '',
    insuranceName: initialData.insuranceName || '',
    premiumCalType: initialData.premiumCalType || 'Percentage',
    premiumValue: initialData.premiumValue || 0,
    paymentFrequency: initialData.paymentFrequency || 'Monthly',
    durationInMonths: initialData.durationInMonths || 12,
    startDate: initialData.startDate || '',
    endDate: initialData.endDate || '',
    isCoApplicantCovered: initialData.isCoApplicantCovered ?? false,
    insuranceGlHead: initialData.insuranceGlHead || '',
    insuranceRecHead: initialData.insuranceRecHead || '',
    insuranceControlRecHead: initialData.insuranceControlRecHead || '',
    writeOffInsuranceHead: initialData.writeOffInsuranceHead || '',
  });

  const [errors, setErrors] = useState<Partial<InsuranceFormData>>({});

  const insuranceTypes = ['Life Insurance', 'Health Insurance', 'Term Insurance', 'Accident Insurance', 'Disability Insurance'];
  const premiumCalTypes = ['Percentage', 'Fixed'];
  const paymentFrequencies = ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual'];

  const validateForm = (): boolean => {
    const newErrors: Partial<InsuranceFormData> = {};

    if (!formData.insuranceCode) newErrors.insuranceCode = 'Insurance code is required';
    if (!formData.insuranceType) newErrors.insuranceType = 'Insurance type is required';
    if (!formData.insuranceName) newErrors.insuranceName = 'Insurance name is required';
    if (!formData.premiumCalType) newErrors.premiumCalType = 'Premium calculation type is required';
    if (formData.premiumValue <= 0) newErrors.premiumValue = 'Premium value must be greater than 0';
    if (!formData.paymentFrequency) newErrors.paymentFrequency = 'Payment frequency is required';
    if (formData.durationInMonths <= 0) newErrors.durationInMonths = 'Duration must be greater than 0';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.insuranceGlHead) newErrors.insuranceGlHead = 'Insurance GL Head is required';
    if (!formData.insuranceRecHead) newErrors.insuranceRecHead = 'Insurance REC Head is required';
    if (!formData.insuranceControlRecHead) newErrors.insuranceControlRecHead = 'Insurance Control REC Head is required';
    if (!formData.writeOffInsuranceHead) newErrors.writeOffInsuranceHead = 'WriteOff Insurance Head is required';

    // Validate date range
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof InsuranceFormData, value: string | boolean | number) => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Insurance Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.insuranceCode}
              onChange={(e) => handleChange('insuranceCode', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.insuranceCode ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter insurance code"
            />
            {errors.insuranceCode && <p className="text-red-500 text-xs mt-1">{errors.insuranceCode}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Insurance Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.insuranceType}
              onChange={(e) => handleChange('insuranceType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.insuranceType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Insurance Type</option>
              {insuranceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.insuranceType && <p className="text-red-500 text-xs mt-1">{errors.insuranceType}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Insurance Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.insuranceName}
              onChange={(e) => handleChange('insuranceName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.insuranceName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter insurance name"
            />
            {errors.insuranceName && <p className="text-red-500 text-xs mt-1">{errors.insuranceName}</p>}
          </div>
        </div>
      </div>

      {/* Premium Information Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          💰 Premium Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Premium Cal Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.premiumCalType}
              onChange={(e) => handleChange('premiumCalType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.premiumCalType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              {premiumCalTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.premiumCalType && <p className="text-red-500 text-xs mt-1">{errors.premiumCalType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Premium Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.premiumValue}
              onChange={(e) => handleChange('premiumValue', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.premiumValue ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={formData.premiumCalType === 'Percentage' ? 'Enter percentage' : 'Enter amount'}
            />
            {errors.premiumValue && <p className="text-red-500 text-xs mt-1">{errors.premiumValue}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Frequency <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.paymentFrequency}
              onChange={(e) => handleChange('paymentFrequency', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.paymentFrequency ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              {paymentFrequencies.map(freq => (
                <option key={freq} value={freq}>{freq}</option>
              ))}
            </select>
            {errors.paymentFrequency && <p className="text-red-500 text-xs mt-1">{errors.paymentFrequency}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration In Months <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.durationInMonths}
              onChange={(e) => handleChange('durationInMonths', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.durationInMonths ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter duration in months"
              min="1"
            />
            {errors.durationInMonths && <p className="text-red-500 text-xs mt-1">{errors.durationInMonths}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.startDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.endDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
          </div>
        </div>
      </div>

      {/* Coverage Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          👥 Coverage Options
        </h4>
        <div className="space-y-4">
          <Toggle
            checked={formData.isCoApplicantCovered}
            onChange={(checked) => handleChange('isCoApplicantCovered', checked)}
            label="Is Co-Applicant Covered"
          />
        </div>
      </div>

      {/* Account Head Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          🧾 Account Head Configuration
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Insurance GL Head <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.insuranceGlHead}
              onChange={(e) => handleChange('insuranceGlHead', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.insuranceGlHead ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter GL head code"
            />
            {errors.insuranceGlHead && <p className="text-red-500 text-xs mt-1">{errors.insuranceGlHead}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Insurance REC Head <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.insuranceRecHead}
              onChange={(e) => handleChange('insuranceRecHead', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.insuranceRecHead ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter REC head code"
            />
            {errors.insuranceRecHead && <p className="text-red-500 text-xs mt-1">{errors.insuranceRecHead}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Insurance Control REC Head <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.insuranceControlRecHead}
              onChange={(e) => handleChange('insuranceControlRecHead', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.insuranceControlRecHead ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter control REC head code"
            />
            {errors.insuranceControlRecHead && <p className="text-red-500 text-xs mt-1">{errors.insuranceControlRecHead}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              WriteOff Insurance Head <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.writeOffInsuranceHead}
              onChange={(e) => handleChange('writeOffInsuranceHead', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.writeOffInsuranceHead ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter writeoff head code"
            />
            {errors.writeOffInsuranceHead && <p className="text-red-500 text-xs mt-1">{errors.writeOffInsuranceHead}</p>}
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
          Save Insurance
        </button>
      </div>
    </form>
  );
};