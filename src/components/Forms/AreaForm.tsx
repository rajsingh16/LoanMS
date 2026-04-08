import React, { useState, useEffect } from 'react';
import { AreaFormData } from '../../types';
import { Toggle } from '../Common/Toggle';

interface AreaFormProps {
  onSubmit: (data: AreaFormData) => void;
  onCancel: () => void;
  initialData?: Partial<AreaFormData>;
  isSubmitting?: boolean;
}

export const AreaForm: React.FC<AreaFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<AreaFormData>({
    areaType: initialData.areaType || '',
    parentAreaCode: initialData.parentAreaCode || '',
    areaName: initialData.areaName || '',
    branchManagerId: initialData.branchManagerId || '',
    address1: initialData.address1 || '',
    address2: initialData.address2 || '',
    phoneNumber: initialData.phoneNumber || '',
    emailId: initialData.emailId || '',
    pincode: initialData.pincode || '',
    district: initialData.district || '',
    state: initialData.state || '',
    mandatoryDocument: initialData.mandatoryDocument || '',
    branchRating: initialData.branchRating || '',
    minCenterClients: initialData.minCenterClients || 0,
    maxCenterClients: initialData.maxCenterClients || 0,
    bcBranchId: initialData.bcBranchId || '',
    businessPartner: initialData.businessPartner || '',
    cashlessDisbPartner: initialData.cashlessDisbPartner || '',
    nachPartner: initialData.nachPartner || '',
    branchOpeningDate: initialData.branchOpeningDate || '',
    disbOnMeetingDate: initialData.disbOnMeetingDate ?? false,
    crossSellAllowed: initialData.crossSellAllowed ?? false,
    isDisbActive: initialData.isDisbActive ?? true,
    isCashDisbActive: initialData.isCashDisbActive ?? false,
    isSubProductEnabled: initialData.isSubProductEnabled ?? false,
    isClientSourcingEnabled: initialData.isClientSourcingEnabled ?? false,
    isCenterFormationEnabled: initialData.isCenterFormationEnabled ?? false,
  });

  const [errors, setErrors] = useState<Partial<AreaFormData>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const areaTypes = ['Branch', 'Region', 'Zone', 'State', 'District', 'Block'];
  const parentAreaCodes = ['REG001', 'REG002', 'ZON001', 'ZON002', 'ST001', 'ST002'];
  const businessPartners = ['Partner A', 'Partner B', 'Partner C', 'Partner D'];
  const states = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan'];
  const districts = ['Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'];
  const ratings = ['A+', 'A', 'B+', 'B', 'C+', 'C'];

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<AreaFormData> = {};

    if (!formData.areaType) newErrors.areaType = 'Area type is required';
    if (!formData.areaName) newErrors.areaName = 'Area name is required';
    if (!formData.address1) newErrors.address1 = 'Address 1 is required';
    if (!formData.businessPartner) newErrors.businessPartner = 'Business partner is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.branchOpeningDate) newErrors.branchOpeningDate = 'Branch opening date is required';

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

  const handleChange = (field: keyof AreaFormData, value: string | boolean | number) => {
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
                Area Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.areaType}
                onChange={(e) => handleChange('areaType', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.areaType ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Area Type</option>
                {areaTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.areaType && <p className="text-red-500 text-xs mt-1">{errors.areaType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Parent Area Code
              </label>
              <select
                value={formData.parentAreaCode}
                onChange={(e) => handleChange('parentAreaCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Parent Area</option>
                {parentAreaCodes.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Area Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.areaName}
                onChange={(e) => handleChange('areaName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.areaName ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter area name"
              />
              {errors.areaName && <p className="text-red-500 text-xs mt-1">{errors.areaName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Branch Manager ID
              </label>
              <input
                type="text"
                value={formData.branchManagerId}
                onChange={(e) => handleChange('branchManagerId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter manager ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Branch Opening Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.branchOpeningDate}
                onChange={(e) => handleChange('branchOpeningDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.branchOpeningDate ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.branchOpeningDate && <p className="text-red-500 text-xs mt-1">{errors.branchOpeningDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Branch Rating
              </label>
              <select
                value={formData.branchRating}
                onChange={(e) => handleChange('branchRating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Rating</option>
                {ratings.map(rating => (
                  <option key={rating} value={rating}>{rating}</option>
                ))}
              </select>
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
                value={formData.address2}
                onChange={(e) => handleChange('address2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter secondary address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.district ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select District</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
              {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.state ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
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
                  errors.pincode ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter pincode"
              />
              {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
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
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email ID
              </label>
              <input
                type="email"
                value={formData.emailId}
                onChange={(e) => handleChange('emailId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter email address"
              />
            </div>
          </div>
        </div>

        {/* Business Configuration Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            💼 Business Configuration
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Business Partner <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.businessPartner}
                onChange={(e) => handleChange('businessPartner', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.businessPartner ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Business Partner</option>
                {businessPartners.map(partner => (
                  <option key={partner} value={partner}>{partner}</option>
                ))}
              </select>
              {errors.businessPartner && <p className="text-red-500 text-xs mt-1">{errors.businessPartner}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cashless Disb Partner
              </label>
              <input
                type="text"
                value={formData.cashlessDisbPartner}
                onChange={(e) => handleChange('cashlessDisbPartner', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter cashless disbursement partner"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nach Partner
              </label>
              <input
                type="text"
                value={formData.nachPartner}
                onChange={(e) => handleChange('nachPartner', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter NACH partner"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                BC Branch ID
              </label>
              <input
                type="text"
                value={formData.bcBranchId}
                onChange={(e) => handleChange('bcBranchId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter BC branch ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mandatory Document
              </label>
              <input
                type="text"
                value={formData.mandatoryDocument}
                onChange={(e) => handleChange('mandatoryDocument', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter mandatory document"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Center Clients
              </label>
              <input
                type="number"
                value={formData.minCenterClients}
                onChange={(e) => handleChange('minCenterClients', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter minimum center clients"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Center Clients
              </label>
              <input
                type="number"
                value={formData.maxCenterClients}
                onChange={(e) => handleChange('maxCenterClients', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter maximum center clients"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            ⚙️ Feature Configuration
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Toggle
              checked={formData.disbOnMeetingDate}
              onChange={(checked) => handleChange('disbOnMeetingDate', checked)}
              label="Disb On Meeting Date"
            />
            
            <Toggle
              checked={formData.crossSellAllowed}
              onChange={(checked) => handleChange('crossSellAllowed', checked)}
              label="Cross Sell Allowed"
            />
            
            <Toggle
              checked={formData.isDisbActive}
              onChange={(checked) => handleChange('isDisbActive', checked)}
              label="Is Disb Active"
            />
            
            <Toggle
              checked={formData.isCashDisbActive}
              onChange={(checked) => handleChange('isCashDisbActive', checked)}
              label="Is Cash Disb Active"
            />
            
            <Toggle
              checked={formData.isSubProductEnabled}
              onChange={(checked) => handleChange('isSubProductEnabled', checked)}
              label="Is Sub Product Enabled"
            />
            
            <Toggle
              checked={formData.isClientSourcingEnabled}
              onChange={(checked) => handleChange('isClientSourcingEnabled', checked)}
              label="Is Client Sourcing Enabled"
            />
            
            <Toggle
              checked={formData.isCenterFormationEnabled}
              onChange={(checked) => handleChange('isCenterFormationEnabled', checked)}
              label="Is Center Formation Enabled"
            />
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
            'Save Area'
          )}
        </button>
      </div>
    </form>
  );
};