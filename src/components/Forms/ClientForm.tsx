import React, { useState } from 'react';
import { ClientFormData } from '../../services/clientService';

interface ClientFormProps {
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
  initialData?: Partial<ClientFormData>;
  isSubmitting?: boolean;
}

type FormErrors = Partial<Record<keyof ClientFormData, string>>;

const defaultFormData = (initialData: Partial<ClientFormData> = {}): ClientFormData => ({
  firstName: initialData.firstName || '',
  lastName: initialData.lastName || '',
  aadhaarNumber: initialData.aadhaarNumber || '',
  voterCardNumber: initialData.voterCardNumber || '',
  kycType: initialData.kycType || 'Aadhaar',
  kycId: initialData.kycId || '',
  cycle: initialData.cycle || 1,
  dateOfBirth: initialData.dateOfBirth || '',
  fatherName: initialData.fatherName || '',
  motherName: initialData.motherName || '',
  gender: initialData.gender || 'Female',
  maritalStatus: initialData.maritalStatus || 'Single',
  mobileNumber: initialData.mobileNumber || '',
  status: initialData.status || 'active',
  qualification: initialData.qualification || '',
  language: initialData.language || 'Hindi',
  caste: initialData.caste || '',
  religion: initialData.religion || 'Hindu',
  occupation: initialData.occupation || '',
  landHolding: initialData.landHolding || 'None',
  monthlyIncome: initialData.monthlyIncome ?? 0,
  annualIncome: initialData.annualIncome ?? 0,
  householdIncome: initialData.householdIncome ?? 0,
  monthlyExpense: initialData.monthlyExpense ?? 0,
  monthlyObligation: initialData.monthlyObligation ?? 0,
});

export const ClientForm: React.FC<ClientFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<ClientFormData>(defaultFormData(initialData));
  const [errors, setErrors] = useState<FormErrors>({});

  const kycTypes = ['Aadhaar', 'Voter ID', 'PAN', 'Driving License', 'Passport'];
  const genders: ClientFormData['gender'][] = ['Male', 'Female', 'Other'];
  const maritalStatuses: ClientFormData['maritalStatus'][] = ['Single', 'Married', 'Divorced', 'Widowed'];
  const languages = ['Hindi', 'English', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'];
  const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'];
  const landHoldings = ['None', 'Less than 1 acre', '1-2 acres', '2-5 acres', 'More than 5 acres'];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.aadhaarNumber.trim()) {
      newErrors.aadhaarNumber = 'Aadhaar number is required';
    } else if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Aadhaar number must be 12 digits';
    }
    if (!formData.voterCardNumber.trim()) newErrors.voterCardNumber = 'Voter card number is required';
    if (!formData.kycType) newErrors.kycType = 'KYC type is required';
    if (!formData.kycId.trim()) newErrors.kycId = 'KYC ID is required';
    if (!formData.cycle || formData.cycle < 1) newErrors.cycle = 'Cycle must be at least 1';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = "Father's name is required";
    if (!formData.motherName.trim()) newErrors.motherName = "Mother's name is required";
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    }
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';
    if (!formData.language) newErrors.language = 'Language is required';
    if (!formData.caste.trim()) newErrors.caste = 'Caste is required';
    if (!formData.religion) newErrors.religion = 'Religion is required';
    if (!formData.occupation.trim()) newErrors.occupation = 'Occupation is required';
    if (!formData.landHolding) newErrors.landHolding = 'Land holding is required';
    if (formData.monthlyIncome < 0) newErrors.monthlyIncome = 'Monthly income cannot be negative';
    if (formData.annualIncome < 0) newErrors.annualIncome = 'Annual income cannot be negative';
    if (formData.householdIncome < 0) newErrors.householdIncome = 'Household income cannot be negative';
    if (formData.monthlyExpense < 0) newErrors.monthlyExpense = 'Monthly expense cannot be negative';
    if (formData.monthlyObligation < 0) newErrors.monthlyObligation = 'Monthly obligation cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof ClientFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const inputClass = (field: keyof ClientFormData) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
      errors[field] ? 'border-red-300' : 'border-gray-300'
    }`;

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          Personal Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input type="text" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} className={inputClass('firstName')} placeholder="Enter first name" />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input type="text" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} className={inputClass('lastName')} placeholder="Enter last name" />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input type="date" value={formData.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} className={inputClass('dateOfBirth')} />
            {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Father&apos;s Name <span className="text-red-500">*</span>
            </label>
            <input type="text" value={formData.fatherName} onChange={(e) => handleChange('fatherName', e.target.value)} className={inputClass('fatherName')} placeholder="Enter father's name" />
            {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mother&apos;s Name <span className="text-red-500">*</span>
            </label>
            <input type="text" value={formData.motherName} onChange={(e) => handleChange('motherName', e.target.value)} className={inputClass('motherName')} placeholder="Enter mother's name" />
            {errors.motherName && <p className="text-red-500 text-xs mt-1">{errors.motherName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)} className={inputClass('gender')}>
              {genders.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Marital Status <span className="text-red-500">*</span>
            </label>
            <select value={formData.maritalStatus} onChange={(e) => handleChange('maritalStatus', e.target.value)} className={inputClass('maritalStatus')}>
              {maritalStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.maritalStatus && <p className="text-red-500 text-xs mt-1">{errors.maritalStatus}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input type="text" value={formData.mobileNumber} onChange={(e) => handleChange('mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} className={inputClass('mobileNumber')} placeholder="10-digit mobile number" />
            {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select value={formData.status} onChange={(e) => handleChange('status', e.target.value)} className={inputClass('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          Identity & KYC
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Aadhaar Number <span className="text-red-500">*</span>
            </label>
            <input type="text" value={formData.aadhaarNumber} onChange={(e) => handleChange('aadhaarNumber', e.target.value.replace(/\D/g, '').slice(0, 12))} className={inputClass('aadhaarNumber')} placeholder="12-digit Aadhaar" />
            {errors.aadhaarNumber && <p className="text-red-500 text-xs mt-1">{errors.aadhaarNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Voter Card Number <span className="text-red-500">*</span>
            </label>
            <input type="text" value={formData.voterCardNumber} onChange={(e) => handleChange('voterCardNumber', e.target.value)} className={inputClass('voterCardNumber')} placeholder="Enter voter card number" />
            {errors.voterCardNumber && <p className="text-red-500 text-xs mt-1">{errors.voterCardNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              KYC Type <span className="text-red-500">*</span>
            </label>
            <select value={formData.kycType} onChange={(e) => handleChange('kycType', e.target.value)} className={inputClass('kycType')}>
              {kycTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.kycType && <p className="text-red-500 text-xs mt-1">{errors.kycType}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              KYC ID <span className="text-red-500">*</span>
            </label>
            <input type="text" value={formData.kycId} onChange={(e) => handleChange('kycId', e.target.value)} className={inputClass('kycId')} placeholder="Enter KYC ID" />
            {errors.kycId && <p className="text-red-500 text-xs mt-1">{errors.kycId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cycle <span className="text-red-500">*</span>
            </label>
            <input type="number" min={1} value={formData.cycle} onChange={(e) => handleChange('cycle', parseInt(e.target.value, 10) || 1)} className={inputClass('cycle')} />
            {errors.cycle && <p className="text-red-500 text-xs mt-1">{errors.cycle}</p>}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          Demographics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Qualification <span className="text-red-500">*</span>
            </label>
            <input type="text" value={formData.qualification} onChange={(e) => handleChange('qualification', e.target.value)} className={inputClass('qualification')} placeholder="Enter qualification" />
            {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Language <span className="text-red-500">*</span>
            </label>
            <select value={formData.language} onChange={(e) => handleChange('language', e.target.value)} className={inputClass('language')}>
              {languages.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            {errors.language && <p className="text-red-500 text-xs mt-1">{errors.language}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Caste <span className="text-red-500">*</span>
            </label>
            <input type="text" value={formData.caste} onChange={(e) => handleChange('caste', e.target.value)} className={inputClass('caste')} placeholder="Enter caste" />
            {errors.caste && <p className="text-red-500 text-xs mt-1">{errors.caste}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Religion <span className="text-red-500">*</span>
            </label>
            <select value={formData.religion} onChange={(e) => handleChange('religion', e.target.value)} className={inputClass('religion')}>
              {religions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.religion && <p className="text-red-500 text-xs mt-1">{errors.religion}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Occupation <span className="text-red-500">*</span>
            </label>
            <input type="text" value={formData.occupation} onChange={(e) => handleChange('occupation', e.target.value)} className={inputClass('occupation')} placeholder="Enter occupation" />
            {errors.occupation && <p className="text-red-500 text-xs mt-1">{errors.occupation}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Land Holding <span className="text-red-500">*</span>
            </label>
            <select value={formData.landHolding} onChange={(e) => handleChange('landHolding', e.target.value)} className={inputClass('landHolding')}>
              {landHoldings.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            {errors.landHolding && <p className="text-red-500 text-xs mt-1">{errors.landHolding}</p>}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          Financial Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {([
            ['monthlyIncome', 'Monthly Income'],
            ['annualIncome', 'Annual Income'],
            ['householdIncome', 'Household Income'],
            ['monthlyExpense', 'Monthly Expense'],
            ['monthlyObligation', 'Monthly Obligation'],
          ] as const).map(([field, label]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input
                type="number"
                min={0}
                value={formData[field]}
                onChange={(e) => handleChange(field, parseFloat(e.target.value) || 0)}
                className={inputClass(field)}
                placeholder={`Enter ${label.toLowerCase()}`}
              />
              {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Client'}
        </button>
      </div>
    </form>
  );
};
