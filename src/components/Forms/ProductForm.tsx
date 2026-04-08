import React, { useState } from 'react';
import { Toggle } from '../Common/Toggle';

interface ProductFormData {
  productGroupId: string;
  productCode: string;
  productName: string;
  interestRate: number;
  tenureInMonths: number;
  lpfCalcType: string;
  lpfValue: number;
  lpfDeductType: string;
  securityValue: number;
  docChargeType: string;
  docChargeValue: number;
  principalRepaymentFrequency: string;
  interestRepaymentFrequency: string;
  moratoriumPeriod: number;
  insuranceId?: string;
  insuranceDeductType?: string;
  irrWithInsurance: number;
  netOffCalculationValue: number;
  netOffCalculationFor: string;
  netOffCalculationType: string;
  interestCalculationOn: string;
  isSameDateEmi: boolean;
  documentProductAmount: number;
  totalInstallment: number;
  isFixedDayEmi: boolean;
  isTopUp: boolean;
  documentProductName: string;
  documentProductCode: string;
  vendorProductId: string;
  emiCalculationType: string;
  securityCalculationType: string;
  bounceChargeValue: number;
  bounceChargeCalculationType: string;
  preCloserType: string;
  preCloserValue: number;
  penalChargeType: string;
  penalValue: number;
  healthCareProduct: string;
  healthCareDeductType: string;
  loanAmount: number;
  flexibleEmi: boolean;
  isDynamicRepayment: boolean;
  eirInterestRate: number;
  effectiveStartDate: string;
  effectiveEndDate: string;
  emiStartSequence: number;
  emiEndSequence: number;
  emiAmount: number;
}

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  initialData?: Partial<ProductFormData>;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    productGroupId: initialData.productGroupId || '',
    productCode: initialData.productCode || '',
    productName: initialData.productName || '',
    interestRate: initialData.interestRate || 0,
    tenureInMonths: initialData.tenureInMonths || 12,
    lpfCalcType: initialData.lpfCalcType || 'Percentage',
    lpfValue: initialData.lpfValue || 0,
    lpfDeductType: initialData.lpfDeductType || 'Upfront',
    securityValue: initialData.securityValue || 0,
    docChargeType: initialData.docChargeType || 'Fixed',
    docChargeValue: initialData.docChargeValue || 0,
    principalRepaymentFrequency: initialData.principalRepaymentFrequency || 'Monthly',
    interestRepaymentFrequency: initialData.interestRepaymentFrequency || 'Monthly',
    moratoriumPeriod: initialData.moratoriumPeriod || 0,
    insuranceId: initialData.insuranceId || '',
    insuranceDeductType: initialData.insuranceDeductType || '',
    irrWithInsurance: initialData.irrWithInsurance || 0,
    netOffCalculationValue: initialData.netOffCalculationValue || 0,
    netOffCalculationFor: initialData.netOffCalculationFor || 'Principal',
    netOffCalculationType: initialData.netOffCalculationType || 'None',
    interestCalculationOn: initialData.interestCalculationOn || 'Reducing Balance',
    isSameDateEmi: initialData.isSameDateEmi ?? true,
    documentProductAmount: initialData.documentProductAmount || 0,
    totalInstallment: initialData.totalInstallment || 12,
    isFixedDayEmi: initialData.isFixedDayEmi ?? false,
    isTopUp: initialData.isTopUp ?? false,
    documentProductName: initialData.documentProductName || '',
    documentProductCode: initialData.documentProductCode || '',
    vendorProductId: initialData.vendorProductId || '',
    emiCalculationType: initialData.emiCalculationType || 'EMI',
    securityCalculationType: initialData.securityCalculationType || 'Percentage',
    bounceChargeValue: initialData.bounceChargeValue || 0,
    bounceChargeCalculationType: initialData.bounceChargeCalculationType || 'Fixed',
    preCloserType: initialData.preCloserType || 'Percentage',
    preCloserValue: initialData.preCloserValue || 0,
    penalChargeType: initialData.penalChargeType || 'Percentage',
    penalValue: initialData.penalValue || 0,
    healthCareProduct: initialData.healthCareProduct || '',
    healthCareDeductType: initialData.healthCareDeductType || '',
    loanAmount: initialData.loanAmount || 0,
    flexibleEmi: initialData.flexibleEmi ?? false,
    isDynamicRepayment: initialData.isDynamicRepayment ?? false,
    eirInterestRate: initialData.eirInterestRate || 0,
    effectiveStartDate: initialData.effectiveStartDate || '',
    effectiveEndDate: initialData.effectiveEndDate || '',
    emiStartSequence: initialData.emiStartSequence || 1,
    emiEndSequence: initialData.emiEndSequence || 12,
    emiAmount: initialData.emiAmount || 0,
  });

  const [errors, setErrors] = useState<Partial<ProductFormData>>({});

  const productGroups = ['PG001', 'PG002', 'PG003'];
  const calcTypes = ['Percentage', 'Fixed'];
  const deductTypes = ['Upfront', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];
  const repaymentFrequencies = ['Daily', 'Weekly', 'Fortnightly', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];
  const insurances = ['INS001', 'INS002', 'INS003'];
  const calculationTypes = ['None', 'Percentage', 'Fixed'];
  const interestCalculationMethods = ['Reducing Balance', 'Flat Rate'];
  const emiCalculationTypes = ['EMI', 'Principal + Interest'];
  const healthCareProducts = ['Basic', 'Standard', 'Premium', 'None'];

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {};

    if (!formData.productGroupId) newErrors.productGroupId = 'Product group ID is required';
    if (!formData.productCode) newErrors.productCode = 'Product code is required';
    if (!formData.productName) newErrors.productName = 'Product name is required';
    if (formData.interestRate < 0) newErrors.interestRate = 'Interest rate cannot be negative';
    if (formData.tenureInMonths <= 0) newErrors.tenureInMonths = 'Tenure must be greater than 0';
    if (!formData.lpfCalcType) newErrors.lpfCalcType = 'LPF calculation type is required';
    if (!formData.lpfDeductType) newErrors.lpfDeductType = 'LPF deduct type is required';
    if (!formData.docChargeType) newErrors.docChargeType = 'Document charge type is required';
    if (!formData.principalRepaymentFrequency) newErrors.principalRepaymentFrequency = 'Principal repayment frequency is required';
    if (!formData.interestRepaymentFrequency) newErrors.interestRepaymentFrequency = 'Interest repayment frequency is required';
    if (!formData.interestCalculationOn) newErrors.interestCalculationOn = 'Interest calculation method is required';
    if (formData.documentProductAmount < 0) newErrors.documentProductAmount = 'Document product amount cannot be negative';
    if (formData.totalInstallment <= 0) newErrors.totalInstallment = 'Total installment must be greater than 0';
    if (!formData.documentProductName) newErrors.documentProductName = 'Document product name is required';
    if (!formData.documentProductCode) newErrors.documentProductCode = 'Document product code is required';
    if (!formData.emiCalculationType) newErrors.emiCalculationType = 'EMI calculation type is required';
    if (!formData.securityCalculationType) newErrors.securityCalculationType = 'Security calculation type is required';
    if (!formData.bounceChargeCalculationType) newErrors.bounceChargeCalculationType = 'Bounce charge calculation type is required';
    if (!formData.preCloserType) newErrors.preCloserType = 'Pre-closer type is required';
    if (!formData.penalChargeType) newErrors.penalChargeType = 'Penal charge type is required';
    if (formData.loanAmount <= 0) newErrors.loanAmount = 'Loan amount must be greater than 0';
    if (!formData.effectiveStartDate) newErrors.effectiveStartDate = 'Effective start date is required';
    if (!formData.effectiveEndDate) newErrors.effectiveEndDate = 'Effective end date is required';
    if (formData.emiStartSequence <= 0) newErrors.emiStartSequence = 'EMI start sequence must be greater than 0';
    if (formData.emiEndSequence <= 0) newErrors.emiEndSequence = 'EMI end sequence must be greater than 0';
    if (formData.emiAmount <= 0) newErrors.emiAmount = 'EMI amount must be greater than 0';

    // Validate date range
    if (formData.effectiveStartDate && formData.effectiveEndDate && new Date(formData.effectiveStartDate) >= new Date(formData.effectiveEndDate)) {
      newErrors.effectiveEndDate = 'End date must be after start date';
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

  const handleChange = (field: keyof ProductFormData, value: string | boolean | number) => {
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
              Product Group ID <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.productGroupId}
              onChange={(e) => handleChange('productGroupId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.productGroupId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Product Group</option>
              {productGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            {errors.productGroupId && <p className="text-red-500 text-xs mt-1">{errors.productGroupId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.productCode}
              onChange={(e) => handleChange('productCode', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.productCode ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter product code"
            />
            {errors.productCode && <p className="text-red-500 text-xs mt-1">{errors.productCode}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => handleChange('productName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.productName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter product name"
            />
            {errors.productName && <p className="text-red-500 text-xs mt-1">{errors.productName}</p>}
          </div>
        </div>
      </div>

      {/* Loan Terms Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          💰 Loan Terms
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Interest Rate (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.interestRate}
              onChange={(e) => handleChange('interestRate', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.interestRate ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter interest rate"
            />
            {errors.interestRate && <p className="text-red-500 text-xs mt-1">{errors.interestRate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tenure (In Months) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.tenureInMonths}
              onChange={(e) => handleChange('tenureInMonths', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.tenureInMonths ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter tenure in months"
            />
            {errors.tenureInMonths && <p className="text-red-500 text-xs mt-1">{errors.tenureInMonths}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Loan Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.loanAmount}
              onChange={(e) => handleChange('loanAmount', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.loanAmount ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter loan amount"
            />
            {errors.loanAmount && <p className="text-red-500 text-xs mt-1">{errors.loanAmount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              EMI Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.emiAmount}
              onChange={(e) => handleChange('emiAmount', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.emiAmount ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter EMI amount"
            />
            {errors.emiAmount && <p className="text-red-500 text-xs mt-1">{errors.emiAmount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Principal Repayment Frequency <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.principalRepaymentFrequency}
              onChange={(e) => handleChange('principalRepaymentFrequency', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.principalRepaymentFrequency ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Frequency</option>
              {repaymentFrequencies.map(freq => (
                <option key={freq} value={freq}>{freq}</option>
              ))}
            </select>
            {errors.principalRepaymentFrequency && <p className="text-red-500 text-xs mt-1">{errors.principalRepaymentFrequency}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Interest Repayment Frequency <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.interestRepaymentFrequency}
              onChange={(e) => handleChange('interestRepaymentFrequency', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.interestRepaymentFrequency ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Frequency</option>
              {repaymentFrequencies.map(freq => (
                <option key={freq} value={freq}>{freq}</option>
              ))}
            </select>
            {errors.interestRepaymentFrequency && <p className="text-red-500 text-xs mt-1">{errors.interestRepaymentFrequency}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Moratorium Period (Months)
            </label>
            <input
              type="number"
              value={formData.moratoriumPeriod}
              onChange={(e) => handleChange('moratoriumPeriod', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter moratorium period"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Interest Calculation On <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.interestCalculationOn}
              onChange={(e) => handleChange('interestCalculationOn', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.interestCalculationOn ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Method</option>
              {interestCalculationMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
            {errors.interestCalculationOn && <p className="text-red-500 text-xs mt-1">{errors.interestCalculationOn}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              EMI Calculation Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.emiCalculationType}
              onChange={(e) => handleChange('emiCalculationType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.emiCalculationType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Type</option>
              {emiCalculationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.emiCalculationType && <p className="text-red-500 text-xs mt-1">{errors.emiCalculationType}</p>}
          </div>
        </div>
      </div>

      {/* Fees and Charges Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          💵 Fees and Charges
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LPF Calc Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.lpfCalcType}
              onChange={(e) => handleChange('lpfCalcType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.lpfCalcType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Type</option>
              {calcTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.lpfCalcType && <p className="text-red-500 text-xs mt-1">{errors.lpfCalcType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LPF Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.lpfValue}
              onChange={(e) => handleChange('lpfValue', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.lpfValue ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={formData.lpfCalcType === 'Percentage' ? 'Enter percentage' : 'Enter amount'}
            />
            {errors.lpfValue && <p className="text-red-500 text-xs mt-1">{errors.lpfValue}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LPF Deduct Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.lpfDeductType}
              onChange={(e) => handleChange('lpfDeductType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.lpfDeductType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Type</option>
              {deductTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.lpfDeductType && <p className="text-red-500 text-xs mt-1">{errors.lpfDeductType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Security Calculation Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.securityCalculationType}
              onChange={(e) => handleChange('securityCalculationType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.securityCalculationType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Type</option>
              {calcTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.securityCalculationType && <p className="text-red-500 text-xs mt-1">{errors.securityCalculationType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Security Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.securityValue}
              onChange={(e) => handleChange('securityValue', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.securityValue ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={formData.securityCalculationType === 'Percentage' ? 'Enter percentage' : 'Enter amount'}
            />
            {errors.securityValue && <p className="text-red-500 text-xs mt-1">{errors.securityValue}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Doc Charge Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.docChargeType}
              onChange={(e) => handleChange('docChargeType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.docChargeType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Type</option>
              {calcTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.docChargeType && <p className="text-red-500 text-xs mt-1">{errors.docChargeType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Doc Charge Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.docChargeValue}
              onChange={(e) => handleChange('docChargeValue', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.docChargeValue ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={formData.docChargeType === 'Percentage' ? 'Enter percentage' : 'Enter amount'}
            />
            {errors.docChargeValue && <p className="text-red-500 text-xs mt-1">{errors.docChargeValue}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bounce Charge Calculation Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.bounceChargeCalculationType}
              onChange={(e) => handleChange('bounceChargeCalculationType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.bounceChargeCalculationType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Type</option>
              {calcTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.bounceChargeCalculationType && <p className="text-red-500 text-xs mt-1">{errors.bounceChargeCalculationType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bounce Charge Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.bounceChargeValue}
              onChange={(e) => handleChange('bounceChargeValue', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.bounceChargeValue ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={formData.bounceChargeCalculationType === 'Percentage' ? 'Enter percentage' : 'Enter amount'}
            />
            {errors.bounceChargeValue && <p className="text-red-500 text-xs mt-1">{errors.bounceChargeValue}</p>}
          </div>
        </div>
      </div>

      {/* Insurance Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          🛡️ Insurance
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Insurance ID</label>
            <select
              value={formData.insuranceId || ''}
              onChange={(e) => handleChange('insuranceId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Insurance</option>
              {insurances.map(insurance => (
                <option key={insurance} value={insurance}>{insurance}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Insurance Deduct Type</label>
            <select
              value={formData.insuranceDeductType || ''}
              onChange={(e) => handleChange('insuranceDeductType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={!formData.insuranceId}
            >
              <option value="">Select Type</option>
              {deductTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IRR With Insurance (%)</label>
            <input
              type="number"
              step="0.01"
              value={formData.irrWithInsurance}
              onChange={(e) => handleChange('irrWithInsurance', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter IRR with insurance"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Health Care Product</label>
            <select
              value={formData.healthCareProduct}
              onChange={(e) => handleChange('healthCareProduct', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Product</option>
              {healthCareProducts.map(product => (
                <option key={product} value={product}>{product}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Health Care Deduct Type</label>
            <select
              value={formData.healthCareDeductType}
              onChange={(e) => handleChange('healthCareDeductType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={!formData.healthCareProduct || formData.healthCareProduct === 'None'}
            >
              <option value="">Select Type</option>
              {deductTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Document Product Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          📄 Document Product
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Document Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.documentProductName}
              onChange={(e) => handleChange('documentProductName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.documentProductName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter document product name"
            />
            {errors.documentProductName && <p className="text-red-500 text-xs mt-1">{errors.documentProductName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Document Product Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.documentProductCode}
              onChange={(e) => handleChange('documentProductCode', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.documentProductCode ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter document product code"
            />
            {errors.documentProductCode && <p className="text-red-500 text-xs mt-1">{errors.documentProductCode}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Document Product Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.documentProductAmount}
              onChange={(e) => handleChange('documentProductAmount', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.documentProductAmount ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter document product amount"
            />
            {errors.documentProductAmount && <p className="text-red-500 text-xs mt-1">{errors.documentProductAmount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor Product ID</label>
            <input
              type="text"
              value={formData.vendorProductId}
              onChange={(e) => handleChange('vendorProductId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter vendor product ID"
            />
          </div>
        </div>
      </div>

      {/* EMI Configuration Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          📅 EMI Configuration
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Installment <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.totalInstallment}
              onChange={(e) => handleChange('totalInstallment', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.totalInstallment ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter total installment"
            />
            {errors.totalInstallment && <p className="text-red-500 text-xs mt-1">{errors.totalInstallment}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              EMI Start Sequence <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.emiStartSequence}
              onChange={(e) => handleChange('emiStartSequence', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.emiStartSequence ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter EMI start sequence"
            />
            {errors.emiStartSequence && <p className="text-red-500 text-xs mt-1">{errors.emiStartSequence}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              EMI End Sequence <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.emiEndSequence}
              onChange={(e) => handleChange('emiEndSequence', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.emiEndSequence ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter EMI end sequence"
            />
            {errors.emiEndSequence && <p className="text-red-500 text-xs mt-1">{errors.emiEndSequence}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Effective Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.effectiveStartDate}
              onChange={(e) => handleChange('effectiveStartDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.effectiveStartDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.effectiveStartDate && <p className="text-red-500 text-xs mt-1">{errors.effectiveStartDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Effective End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.effectiveEndDate}
              onChange={(e) => handleChange('effectiveEndDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.effectiveEndDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.effectiveEndDate && <p className="text-red-500 text-xs mt-1">{errors.effectiveEndDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">EIR Interest Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={formData.eirInterestRate}
              onChange={(e) => handleChange('eirInterestRate', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter EIR interest rate"
            />
          </div>
        </div>
      </div>

      {/* Feature Toggles Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          🔘 Feature Toggles
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Toggle
            checked={formData.isSameDateEmi}
            onChange={(checked) => handleChange('isSameDateEmi', checked)}
            label="Is Same Date EMI"
          />
          
          <Toggle
            checked={formData.isFixedDayEmi}
            onChange={(checked) => handleChange('isFixedDayEmi', checked)}
            label="Is Fixed Day EMI"
          />
          
          <Toggle
            checked={formData.isTopUp}
            onChange={(checked) => handleChange('isTopUp', checked)}
            label="Is Top Up"
          />
          
          <Toggle
            checked={formData.flexibleEmi}
            onChange={(checked) => handleChange('flexibleEmi', checked)}
            label="Flexible EMI"
          />
          
          <Toggle
            checked={formData.isDynamicRepayment}
            onChange={(checked) => handleChange('isDynamicRepayment', checked)}
            label="Is Dynamic Repayment"
          />
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
          Save Product
        </button>
      </div>
    </form>
  );
};