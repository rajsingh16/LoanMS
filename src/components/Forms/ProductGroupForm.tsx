import React, { useState } from 'react';
import { Toggle } from '../Common/Toggle';
import { ProductGroup } from '../../types/product';

interface ProductGroupFormData {
  productGroupType: string;
  productGroupSegment: string;
  productGroupCode: string;
  productGroupName: string;
  minIrr: number;
  maxIrr: number;
  daysInYear: number;
  bcId: string;
  eligibleGender: string;
  vendorId?: string;
  roundingOff: number;
  yearlyMinHouseholdIncome?: number;
  yearlyMaxHouseholdIncome?: number;
  clmSchemeId?: string;
  minClientPerCenter: number;
  clmLenderId?: string;
  firstEmiType: string;
  disbursementAccountHead: string;
  hospiCashHead: string;
  upiCollectionHead: string;
  bcMigratedAccountHead: string;
  secureGroup: boolean;
  qualifiedGroup: boolean;
  borrowedGroup: boolean;
  cycleIncreaseFlag: boolean;
  isQrCollectionEnable: boolean;
  isProduct: boolean;
  isTranchDisb: boolean;
  exclusivePartner: boolean;
  cashAccountHead: string;
  neftAccountHead: string;
  principalHead: string;
  interestIncomeHead: string;
  lpfIncomeHead: string;
  interestReversalHead: string;
  brokenInterestHead: string;
  extendedIntCollectionHead: string;
  loanWriteOffHead: string;
  loanWaiverHead: string;
  writeOffCollHead: string;
}

interface ProductGroupFormProps {
  onSubmit: (data: ProductGroupFormData) => void;
  onCancel: () => void;
  initialData?: Partial<ProductGroup>;
}

export const ProductGroupForm: React.FC<ProductGroupFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<ProductGroupFormData>({
    productGroupType: initialData.productGroupType || '',
    productGroupSegment: initialData.productGroupSegment || '',
    productGroupCode: initialData.productGroupCode || '',
    productGroupName: initialData.productGroupName || '',
    minIrr: initialData.minIrr || 0,
    maxIrr: initialData.maxIrr || 0,
    daysInYear: initialData.daysInYear || 365,
    bcId: initialData.bcId || '',
    eligibleGender: initialData.eligibleGender || 'Both',
    vendorId: initialData.vendorId || '',
    roundingOff: initialData.roundingOff || 1,
    yearlyMinHouseholdIncome: initialData.yearlyMinHouseholdIncome || 0,
    yearlyMaxHouseholdIncome: initialData.yearlyMaxHouseholdIncome || 0,
    clmSchemeId: initialData.clmSchemeId || '',
    minClientPerCenter: initialData.minClientPerCenter || 5,
    clmLenderId: initialData.clmLenderId || '',
    firstEmiType: initialData.firstEmiType || 'Monthly',
    disbursementAccountHead: initialData.disbursementAccountHead || '',
    hospiCashHead: initialData.hospiCashHead || '',
    upiCollectionHead: initialData.upiCollectionHead || '',
    bcMigratedAccountHead: initialData.bcMigratedAccountHead || '',
    secureGroup: initialData.secureGroup ?? false,
    qualifiedGroup: initialData.qualifiedGroup ?? false,
    borrowedGroup: initialData.borrowedGroup ?? false,
    cycleIncreaseFlag: initialData.cycleIncreaseFlag ?? false,
    isQrCollectionEnable: initialData.isQrCollectionEnable ?? false,
    isProduct: initialData.isProduct ?? true,
    isTranchDisb: initialData.isTranchDisb ?? false,
    exclusivePartner: initialData.exclusivePartner ?? false,
    cashAccountHead: initialData.cashAccountHead || '',
    neftAccountHead: initialData.neftAccountHead || '',
    principalHead: initialData.principalHead || '',
    interestIncomeHead: initialData.interestIncomeHead || '',
    lpfIncomeHead: initialData.lpfIncomeHead || '',
    interestReversalHead: initialData.interestReversalHead || '',
    brokenInterestHead: initialData.brokenInterestHead || '',
    extendedIntCollectionHead: initialData.extendedIntCollectionHead || '',
    loanWriteOffHead: initialData.loanWriteOffHead || '',
    loanWaiverHead: initialData.loanWaiverHead || '',
    writeOffCollHead: initialData.writeOffCollHead || '',
  });

  const [errors, setErrors] = useState<Partial<ProductGroupFormData>>({});

  const productGroupTypes = ['Individual', 'Group', 'Joint Liability', 'Self Help Group'];
  const productGroupSegments = ['Rural', 'Urban', 'Semi-Urban', 'Metro'];
  const eligibleGenders = ['Male', 'Female', 'Both'];
  const emiTypes = ['Monthly', 'Weekly', 'Fortnightly', 'Quarterly'];

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductGroupFormData> = {};

    if (!formData.productGroupType) newErrors.productGroupType = 'Product group type is required';
    if (!formData.productGroupSegment) newErrors.productGroupSegment = 'Product group segment is required';
    if (!formData.productGroupCode) newErrors.productGroupCode = 'Product group code is required';
    if (!formData.productGroupName) newErrors.productGroupName = 'Product group name is required';
    if (formData.minIrr < 0) newErrors.minIrr = 'Min IRR cannot be negative';
    if (formData.maxIrr < 0) newErrors.maxIrr = 'Max IRR cannot be negative';
    if (formData.minIrr >= formData.maxIrr) newErrors.maxIrr = 'Max IRR must be greater than Min IRR';
    if (!formData.bcId) newErrors.bcId = 'BC ID is required';
    if (!formData.eligibleGender) newErrors.eligibleGender = 'Eligible gender is required';
    if (formData.minClientPerCenter < 1) newErrors.minClientPerCenter = 'Min client per center must be at least 1';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof ProductGroupFormData, value: string | boolean | number) => {
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
              Product Group Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.productGroupType}
              onChange={(e) => handleChange('productGroupType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.productGroupType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Type</option>
              {productGroupTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.productGroupType && <p className="text-red-500 text-xs mt-1">{errors.productGroupType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Group Segment <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.productGroupSegment}
              onChange={(e) => handleChange('productGroupSegment', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.productGroupSegment ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Segment</option>
              {productGroupSegments.map(segment => (
                <option key={segment} value={segment}>{segment}</option>
              ))}
            </select>
            {errors.productGroupSegment && <p className="text-red-500 text-xs mt-1">{errors.productGroupSegment}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Group Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.productGroupCode}
              onChange={(e) => handleChange('productGroupCode', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.productGroupCode ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter product group code"
            />
            {errors.productGroupCode && <p className="text-red-500 text-xs mt-1">{errors.productGroupCode}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.productGroupName}
              onChange={(e) => handleChange('productGroupName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.productGroupName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter product group name"
            />
            {errors.productGroupName && <p className="text-red-500 text-xs mt-1">{errors.productGroupName}</p>}
          </div>
        </div>
      </div>

      {/* IRR and Configuration Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          📊 IRR and Configuration
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min IRR</label>
            <input
              type="number"
              step="0.01"
              value={formData.minIrr}
              onChange={(e) => handleChange('minIrr', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.minIrr ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter minimum IRR"
            />
            {errors.minIrr && <p className="text-red-500 text-xs mt-1">{errors.minIrr}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max IRR</label>
            <input
              type="number"
              step="0.01"
              value={formData.maxIrr}
              onChange={(e) => handleChange('maxIrr', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.maxIrr ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter maximum IRR"
            />
            {errors.maxIrr && <p className="text-red-500 text-xs mt-1">{errors.maxIrr}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Days In Year <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.daysInYear}
              onChange={(e) => handleChange('daysInYear', parseInt(e.target.value) || 365)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter days in year"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              BC ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.bcId}
              onChange={(e) => handleChange('bcId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.bcId ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter BC ID"
            />
            {errors.bcId && <p className="text-red-500 text-xs mt-1">{errors.bcId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Eligible Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.eligibleGender}
              onChange={(e) => handleChange('eligibleGender', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.eligibleGender ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              {eligibleGenders.map(gender => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>
            {errors.eligibleGender && <p className="text-red-500 text-xs mt-1">{errors.eligibleGender}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Client Per Center</label>
            <input
              type="number"
              value={formData.minClientPerCenter}
              onChange={(e) => handleChange('minClientPerCenter', parseInt(e.target.value) || 5)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.minClientPerCenter ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter minimum clients per center"
              min="1"
            />
            {errors.minClientPerCenter && <p className="text-red-500 text-xs mt-1">{errors.minClientPerCenter}</p>}
          </div>
        </div>
      </div>

      {/* On/Off Toggles Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          🔘 Feature Toggles
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Toggle
            checked={formData.secureGroup}
            onChange={(checked) => handleChange('secureGroup', checked)}
            label="Secure Group"
          />
          
          <Toggle
            checked={formData.qualifiedGroup}
            onChange={(checked) => handleChange('qualifiedGroup', checked)}
            label="Qualified Group"
          />
          
          <Toggle
            checked={formData.borrowedGroup}
            onChange={(checked) => handleChange('borrowedGroup', checked)}
            label="Borrowed Group"
          />
          
          <Toggle
            checked={formData.cycleIncreaseFlag}
            onChange={(checked) => handleChange('cycleIncreaseFlag', checked)}
            label="Cycle Increase Flag"
          />
          
          <Toggle
            checked={formData.isQrCollectionEnable}
            onChange={(checked) => handleChange('isQrCollectionEnable', checked)}
            label="Is QR Collection Enable"
          />
          
          <Toggle
            checked={formData.isProduct}
            onChange={(checked) => handleChange('isProduct', checked)}
            label="Is Product"
          />
          
          <Toggle
            checked={formData.isTranchDisb}
            onChange={(checked) => handleChange('isTranchDisb', checked)}
            label="Is Tranche Disb"
          />
          
          <Toggle
            checked={formData.exclusivePartner}
            onChange={(checked) => handleChange('exclusivePartner', checked)}
            label="Exclusive Partner"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cash Account Head</label>
            <input
              type="text"
              value={formData.cashAccountHead}
              onChange={(e) => handleChange('cashAccountHead', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter cash account head"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NEFT Account Head (Disb)</label>
            <input
              type="text"
              value={formData.neftAccountHead}
              onChange={(e) => handleChange('neftAccountHead', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter NEFT account head"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Principal Head</label>
            <input
              type="text"
              value={formData.principalHead}
              onChange={(e) => handleChange('principalHead', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter principal head"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest Income Head</label>
            <input
              type="text"
              value={formData.interestIncomeHead}
              onChange={(e) => handleChange('interestIncomeHead', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter interest income head"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LPF Income Head</label>
            <input
              type="text"
              value={formData.lpfIncomeHead}
              onChange={(e) => handleChange('lpfIncomeHead', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter LPF income head"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest Reversal Head</label>
            <input
              type="text"
              value={formData.interestReversalHead}
              onChange={(e) => handleChange('interestReversalHead', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter interest reversal head"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Broken Interest Head</label>
            <input
              type="text"
              value={formData.brokenInterestHead}
              onChange={(e) => handleChange('brokenInterestHead', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter broken interest head"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Extended Int Collection Head</label>
            <input
              type="text"
              value={formData.extendedIntCollectionHead}
              onChange={(e) => handleChange('extendedIntCollectionHead', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter extended int collection head"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Write Off Head</label>
            <input
              type="text"
              value={formData.loanWriteOffHead}
              onChange={(e) => handleChange('loanWriteOffHead', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter loan write off head"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Waiver Head</label>
            <input
              type="text"
              value={formData.loanWaiverHead}
              onChange={(e) => handleChange('loanWaiverHead', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter loan waiver head"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Write Off Coll Head</label>
            <input
              type="text"
              value={formData.writeOffCollHead}
              onChange={(e) => handleChange('writeOffCollHead', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter write off coll head"
            />
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
          Save Product Group
        </button>
      </div>
    </form>
  );
};