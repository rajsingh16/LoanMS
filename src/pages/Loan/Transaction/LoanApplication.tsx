import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Building, CheckCircle, ChevronDown, Clock, CreditCard, DollarSign, Edit, Filter, Home, Plus, Search, User, Users, X, XCircle, Eye, FileText, Upload } from 'lucide-react';
import { Modal } from '../../../components/Common/Modal';
import { Pagination } from '../../../components/Common/Pagination';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { apiFetch } from '../../../lib/api';
import { ClientFormData } from '../../../services/clientService';
import { centerService } from '../../../services/centerService';
import { ifscService, IFSCCode } from '../../../services/ifscService';
import { productGroupService } from '../../../services/productGroupService';
import { productService } from '../../../services/productService';
import { productBranchMappingService } from '../../../services/transactionService/productBranchMappingService';
import { purposeService, Purpose } from '../../../services/purposeService';
import { villageService } from '../../../services/villageService';
import { districtService } from '../../../services/districtService';
import { pincodeService, Pincode } from '../../../services/pincodeService';
import { LoanApplicationBankAccount, LoanApplicationChildAddress, LoanApplicationDetail, LoanApplicationFamilyMember, LoanApplicationListItem, LoanApplicationRequest, ProductLoanTerms, loanApplicationService } from '../../../services/transactionService/loanApplicationService';

type Option = { id: string; label: string; groupId?: string; stateName?: string };
type FormState = Omit<LoanApplicationRequest, 'addresses' | 'familyMembers' | 'bankAccounts'> & { addresses: LoanApplicationChildAddress[]; familyMembers: LoanApplicationFamilyMember[]; bankAccounts: LoanApplicationBankAccount[] };
const field = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white';
const blankAddress = (): LoanApplicationChildAddress => ({ addressType: 'current', address1: '' });
const hasAddressContent = (address: LoanApplicationChildAddress) => [address.address1, address.address2, address.mohalla, address.postOffice, address.nearestPoliceStation, address.pincode, address.villageId, address.districtId, address.state, address.residenceType].some(value => Boolean(value?.trim()));
const hasFamilyContent = (member: LoanApplicationFamilyMember) => [member.relation, member.firstName, member.lastName, member.mobileNumber, member.dateOfBirth, member.idType, member.idNumber, member.additionalIdType, member.additionalIdNumber, member.maritalStatus, member.employmentStatus, member.qualification, member.occupation, member.occupationType].some(value => Boolean(value?.trim())) || Boolean(member.considerForAssessment || member.isNominee || member.isCoApplicant || member.isGuarantor);
const hasBankContent = (bank: LoanApplicationBankAccount) => [bank.accountType, bank.accountNumber, bank.confirmAccountNumber, bank.ifscId, bank.customerName].some(value => Boolean(value?.trim())) || Boolean(bank.forDisbursement || bank.forCollection || bank.pennyDropDone || bank.nameMatchPercentage != null);
const blankFamily = (): LoanApplicationFamilyMember => ({ relation: '', firstName: '' });
const blankBank = (): LoanApplicationBankAccount => ({ accountType: '', accountNumber: '', confirmAccountNumber: '' });
const maxDocumentBytes = 10 * 1024 * 1024;
const emptyForm: FormState = { branchId: '', centerId: '', clientId: '', productGroupId: '', productId: '', purposeId: '', subPurposeId: '', isTopUp: false, loanAmount: 0, emiAmount: undefined, interestRate: undefined, tenure: undefined, repaymentFrequency: 'monthly', contractualFirstInstallmentDate: '', fieldOfficerId: '', remarks: '', addresses: [blankAddress()], familyMembers: [], bankAccounts: [] };
const normalizeId = (value: unknown) => String(value ?? '').trim();
const todayDateInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const blankNewClient: ClientFormData = { firstName: '', lastName: '', aadhaarNumber: '', voterCardNumber: '', kycType: '', kycId: '', cycle: 1, dateOfBirth: '', fatherName: '', motherName: '', gender: 'Male', maritalStatus: 'Single', mobileNumber: '', status: 'active', qualification: '', language: '', caste: '', religion: '', occupation: '', landHolding: '', monthlyIncome: 0, annualIncome: 0, householdIncome: 0, monthlyExpense: 0, monthlyObligation: 0 };

function RemoveButton({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-label="Remove row" className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"><X className="h-4 w-4" /></button>;
}


function ApplicationForm({ initial, editingId, applicationNumber, applicationDate, linkedClient, onCancel, onSaved }: { initial?: FormState; editingId?: string; applicationNumber?: string; applicationDate?: string; linkedClient?: LoanApplicationDetail; onCancel: () => void; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState<FormState>(initial || emptyForm);
  const [newClient, setNewClient] = useState<ClientFormData>(blankNewClient);
  const [branches, setBranches] = useState<Option[]>([]);
  const [centers, setCenters] = useState<Option[]>([]);
  const [groups, setGroups] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [branchProducts, setBranchProducts] = useState<Option[]>([]);
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [ifscs, setIfscs] = useState<IFSCCode[]>([]);
  const [villages, setVillages] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [officers, setOfficers] = useState<Option[]>([]);
  const [masterLoading, setMasterLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentMessage, setDocumentMessage] = useState<{ type: 'success' | 'error'; text: string }>();
  const [terms, setTerms] = useState<ProductLoanTerms>();
  const termsRequest = useRef(0);
  const productListRequest = useRef(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch('/api/branches').then(async response => {
        const json = await response.json();
        if (!response.ok) throw new Error(json.error?.message || 'Failed to load branches');
        return json.data || [];
      }),
      centerService.getAllCenters(),
      productGroupService.getAllProductGroups(),
      productService.getAllProducts(),
      purposeService.getAllPurposes(),
      ifscService.getAllIFSC(),
      villageService.getAllVillages(),
      districtService.getAllDistricts(),
      loanApplicationService.getFieldOfficers(),
    ]).then(([branchRows, centerRows, groupRows, productRows, purposeRows, ifscRows, villageRows, districtRows, officerRows]) => {
      if (!active) return;
      setBranches(branchRows.filter((item: Record<string, unknown>) => item.status === 'active').map((item: Record<string, unknown>) => ({
        id: normalizeId(item.id), label: `${item.branch_code} - ${item.branch_name}`
      })));
      setCenters(centerRows.filter(center => center.status === 'active').map(center => ({
        id: center.id, label: `${center.centerCode} - ${center.centerName}`, groupId: center.branchId
      })));
      setGroups(groupRows.filter(group => group.status === 'active').map(group => ({
        id: group.id, label: `${group.productGroupCode} - ${group.productGroupName}`
      })));
      setProducts(productRows.filter(product => product.status === 'active').map(product => ({
        id: product.id, label: `${product.productCode} - ${product.productName}`, groupId: product.productGroupId
      })));
      setPurposes(purposeRows.filter(purpose => purpose.status === 'active'));
      setIfscs(ifscRows);
      setVillages(villageRows.filter(village => village.status === 'active').map(village => ({
        id: village.id, label: village.villageName
      })));
      setDistricts(districtRows.map(district => ({
        id: district.id, label: district.districtName, stateName: district.stateName
      })));
      setOfficers(officerRows.map(officer => ({
        id: officer.id,
        label: `${officer.first_name} ${officer.last_name}${officer.employee_id ? ` (${officer.employee_id})` : ''}`
      })));
    }).catch(reason => {
      if (active) setError(reason instanceof Error ? reason.message : 'Unable to load application options');
    }).finally(() => {
      if (active) setMasterLoading(false);
    });
    return () => { active = false; };
  }, []);

  const update = (key: keyof FormState, value: unknown) => setForm(previous => ({ ...previous, [key]: value }));

  const applyTerms = useCallback(async (productId: string, overrides: Partial<Pick<FormState, 'loanAmount' | 'tenure'>> = {}) => {
    const request = ++termsRequest.current;
    if (!productId || !form.productGroupId) { setTerms(undefined); return; }
    try {
      // Read the selected record first so the application always uses the
      // backend's current product master, rather than a stale dropdown row.
      const product = await productService.getProductConfiguration(productId);
      if (request !== termsRequest.current) return;
      const defaultTenure = Number(product.defaultTenure ?? product.tenureInMonths) || undefined;
      const tenure = overrides.tenure ?? form.tenure ?? defaultTenure;
      const loanAmount = overrides.loanAmount ?? form.loanAmount;
      if (!tenure || !loanAmount || loanAmount <= 0) {
        setForm(previous => ({ ...previous, interestRate: Number(product.interestRate) || 0, tenure: tenure ?? previous.tenure, repaymentFrequency: product.principalRepaymentFrequency || previous.repaymentFrequency }));
        setTerms(undefined);
        return;
      }
      const calculated = await loanApplicationService.calculateTerms({ productGroupId: form.productGroupId, productId, loanAmount, tenure });
      if (request !== termsRequest.current) return;
      setTerms(calculated);
      setForm(previous => ({ ...previous, tenure, interestRate: calculated.interestRate, repaymentFrequency: calculated.repaymentFrequency, emiAmount: calculated.emiAmount }));
      setError('');
    } catch (reason) {
      if (request === termsRequest.current) { setTerms(undefined); setError(reason instanceof Error ? reason.message : 'Unable to calculate product terms'); }
    }
  }, [form.loanAmount, form.productGroupId, form.tenure]);

  const selectProductGroup = useCallback(async (groupId: string) => {
    const request = ++productListRequest.current;
    termsRequest.current += 1;
    setTerms(undefined);
    update('productGroupId', groupId); update('productId', ''); update('interestRate', undefined); update('emiAmount', undefined); update('tenure', undefined);
    if (!groupId) return;
    try {
      const rows = await productService.getProductsByGroup(groupId);
      if (request !== productListRequest.current) return;
      const mappedIds = new Set(branchProducts.map(product => product.id));
      setProducts(rows.filter(product => mappedIds.has(product.id)).map(product => ({ id: product.id, label: `${product.productCode} - ${product.productName}`, groupId: product.productGroupId })));
    } catch (reason) {
      if (request === productListRequest.current) setError(reason instanceof Error ? reason.message : 'Unable to load products for this group');
    }
  }, [branchProducts]);

  const selectBranch = useCallback(async (branchId: string) => {
    update('branchId', branchId); update('centerId', ''); update('productGroupId', ''); update('productId', '');
    setProducts([]); setBranchProducts([]); setTerms(undefined);
    if (!branchId) return;
    try {
      const rows = await productBranchMappingService.getProductsByBranch(branchId);
      setBranchProducts(rows.map(product => ({ id: product.id, label: `${product.productCode} - ${product.productName}`, groupId: product.productGroupId })));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load products for this branch'); }
  }, []);

  useEffect(() => {
    if (!form.productId || !form.loanAmount || !form.tenure) return;
    const timer = window.setTimeout(() => void applyTerms(form.productId), 250);
    return () => window.clearTimeout(timer);
  }, [form.productId, form.loanAmount, form.tenure, applyTerms]);

  const updateRow = <T,>(key: 'addresses' | 'familyMembers' | 'bankAccounts', index: number, value: T) => {
    const rows = [...form[key]] as T[];
    rows[index] = value;
    update(key, rows);
  };

  const removeRow = (key: 'addresses' | 'familyMembers' | 'bankAccounts', index: number) => {
    const row = form[key][index];
    if (row.id) {
      update('deletedChildIds', {
        ...form.deletedChildIds,
        [key]: [...(form.deletedChildIds?.[key] || []), row.id],
      });
    }
    update(key, form[key].filter((_, rowIndex) => rowIndex !== index));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.purposeId) {
      setError('Purpose is required');
      return;
    }

    for (const bank of form.bankAccounts) {
      if (bank.confirmAccountNumber && bank.accountNumber !== bank.confirmAccountNumber) {
        setError('Bank account numbers do not match');
        return;
      }
    }

    setSaving(true);
    setError('');

    try {
      const addresses = form.addresses.filter(address => Boolean(address.id) || hasAddressContent(address));
      const familyMembers = form.familyMembers.filter(member => Boolean(member.id) || hasFamilyContent(member));
      const bankAccounts = form.bankAccounts.filter(bank => Boolean(bank.id) || hasBankContent(bank));

      const payload: LoanApplicationRequest = {
        ...form,
        clientId: editingId ? form.clientId : '',
        clientMode: editingId ? 'existing' : 'new',
        newClient: editingId ? undefined : newClient,
        addresses,
        familyMembers,
        bankAccounts,
        documents: undefined,
      };

      if (editingId) {
        await loanApplicationService.updateApplication(editingId, payload);
      } else {
        await loanApplicationService.createApplication(payload);
      }

      await onSaved();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to save application');
    } finally {
      setSaving(false);
    }
  };

  const uploadDocument = async (type: string = documentType) => {
    if (!editingId) {
      setDocumentMessage({ type: 'error', text: 'Save the application before uploading documents.' });
      return;
    }
    if (!type || !documentFile) {
      setDocumentMessage({ type: 'error', text: 'Select a document type and file.' });
      return;
    }
    if (documentFile.size <= 0) {
      setDocumentMessage({ type: 'error', text: 'Empty files cannot be uploaded.' });
      return;
    }
    if (documentFile.size > maxDocumentBytes) {
      setDocumentMessage({ type: 'error', text: 'Maximum file size is 10 MB.' });
      return;
    }
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(documentFile.type)) {
      setDocumentMessage({ type: 'error', text: 'Choose a PDF, JPEG, or PNG file.' });
      return;
    }

    setUploadingDocument(true);
    setDocumentMessage(undefined);

    try {
      const uploaded = await loanApplicationService.uploadDocument(editingId, documentFile, type);
      const metadata = {
        id: uploaded.id,
        documentType: uploaded.document_type,
        fileName: uploaded.file_name,
        mimeType: uploaded.mime_type,
        fileSizeBytes: Number(uploaded.file_size_bytes),
        verificationStatus: uploaded.verification_status,
        uploadedAt: uploaded.uploaded_at,
      };
      update('documents', [...(form.documents || []), metadata]);
      setDocumentMessage({ type: 'success', text: `${uploaded.file_name} uploaded successfully.` });
      setDocumentFile(null);
      setDocumentType('');
    } catch (reason) {
      setDocumentMessage({ type: 'error', text: reason instanceof Error ? reason.message : 'Document upload failed.' });
    } finally {
      setUploadingDocument(false);
    }
  };

  const centersForBranch = centers.filter(center => !form.branchId || center.groupId === normalizeId(form.branchId));
  const eligibleGroupIds = new Set(branchProducts.map(product => normalizeId(product.groupId)));
  const availableGroups = form.branchId ? groups.filter(group => eligibleGroupIds.has(normalizeId(group.id))) : [];
  const productsForGroup = form.productGroupId ? products.filter(product => normalizeId(product.groupId) === normalizeId(form.productGroupId)) : [];
  const mainPurposes = purposes.filter(purpose => purpose.isMainPurpose);
  const subPurposes = purposes.filter(purpose => !purpose.isMainPurpose && purpose.mainPurposeId === form.purposeId);

  const documentCards = [
    { label: 'Borrower KYC 1', type: 'Borrower KYC 1' },
    { label: 'Borrower KYC 2', type: 'Borrower KYC 2' },
    { label: 'Bank Passbook / Cheque', type: 'Bank Passbook/Cheque' },
    { label: 'Co-applicant KYC 1 & 2', type: 'Co-applicant KYC 1 & 2' },
    { label: 'Profile Photo', type: 'Profile Photo' },
    { label: 'Business Registration Proof', type: 'Business Registration Proof' },
    { label: 'Client Consent', type: 'Client Consent' },
    { label: 'CIBIL', type: 'CIBIL' },
    { label: 'Loan Application', type: 'Loan Application' },
    { label: 'Bank Statement', type: 'Bank Statement' },
    { label: 'Ownership Proof', type: 'Ownership Proof' },
    { label: 'Other Document 1 & 2', type: 'Other Document 1 & 2' },
  ];

  const latestDocumentForType = (type: string) => (form.documents || []).find(document => document.documentType === type);

  const chooseDocumentForCard = (type: string) => {
    setDocumentType(type);
    setDocumentMessage(undefined);
  };

  return (
    <form onSubmit={submit} className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {masterLoading && (
        <p role="status" className="text-sm text-gray-500">
          Loading branch, client, product, address, and IFSC reference data…
        </p>
      )}

      {/* Center Details - restored previous visual structure, current master data */}
      <section>
        <h4 className="mb-4 flex items-center border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
          <Building className="mr-2 h-5 w-5" />
          Center Details
        </h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Select label="Branch" required value={form.branchId} onChange={value => void selectBranch(value)} options={branches} disabled={masterLoading} />
          </div>
          <div>
            <Select label="Center" required value={form.centerId} onChange={value => update('centerId', value)} options={centersForBranch} disabled={!form.branchId || masterLoading} />
          </div>
          <div className="flex items-end">
            <label className="flex w-full items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600">
              <input type="checkbox" checked={!!form.isTopUp} onChange={event => update('isTopUp', event.target.checked)} />
              Is Top-Up
            </label>
          </div>
          <div>
            <Select label="Field Officer" value={form.fieldOfficerId || ''} onChange={value => update('fieldOfficerId', value)} options={officers} emptyMessage="No active field officers" disabled={masterLoading} />
          </div>
          <div>
            <ReadOnly label="Application Number" value={applicationNumber || 'Generated when submitted'} />
          </div>
          <div>
            <ReadOnly label="Application Date" value={applicationDate ? applicationDate.slice(0, 10) : 'Assigned on submission'} />
          </div>
        </div>
      </section>

      {/* Customer Details */}
      <section>
        <h4 className="mb-4 flex items-center border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
          <User className="mr-2 h-5 w-5" />
          Customer Details
        </h4>

        {editingId ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ReadOnly label="Client Code" value={linkedClient?.clientCode || ''} />
            <ReadOnly label="Aadhaar Number" value={linkedClient?.aadhaarNumber || ''} />
            <ReadOnly label="Voter ID" value={linkedClient?.voterId || ''} />
            <ReadOnly label="Other ID Type" value={linkedClient?.kycType || ''} />
            <ReadOnly label="ID Number" value={linkedClient?.kycId || ''} />
            <ReadOnly label="First Name" value={linkedClient?.firstName || ''} />
            <ReadOnly label="Last Name" value={linkedClient?.lastName || ''} />
            <ReadOnly label="Father's Name" value={linkedClient?.fatherName || ''} />
            <ReadOnly label="Mother's Name" value={linkedClient?.motherName || ''} />
            <ReadOnly label="Mobile Number" value={linkedClient?.mobileNumber || ''} />
            <ReadOnly label="Date of Birth" value={linkedClient?.dateOfBirth || ''} />
            <ReadOnly label="Age" value={linkedClient?.age == null ? '' : String(linkedClient.age)} />
            <ReadOnly label="Gender" value={linkedClient?.gender || ''} />
            <ReadOnly label="Caste" value={linkedClient?.caste || ''} />
            <ReadOnly label="Preferred Language" value={linkedClient?.preferredLanguage || ''} />
            <ReadOnly label="Qualification" value={linkedClient?.qualification || ''} />
            <ReadOnly label="Occupation" value={linkedClient?.occupation || ''} />
            <ReadOnly label="Marital Status" value={linkedClient?.maritalStatus || ''} />
            <ReadOnly label="Religion" value={linkedClient?.religion || ''} />
            <ReadOnly label="Agricultural Land" value={linkedClient?.agriculturalLand || ''} />
          </div>
        ) : (
          <NewClientFields value={newClient} onChange={setNewClient} />
        )}
      </section>

      {/* Address Details */}
      <section>
        <h4 className="mb-4 flex items-center border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
          <Home className="mr-2 h-5 w-5" />
          Address Details
        </h4>
        {form.addresses.map((address, index) => (
          <div key={address.id || index} className="mb-6 rounded-lg border border-gray-200 p-4 dark:border-gray-600">
            <div className="mb-4 flex items-center justify-between">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Address {index + 1}</h5>
              <RemoveButton onClick={() => removeRow('addresses', index)} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Select label="Address Type" value={address.addressType || 'current'} onChange={value => updateRow('addresses', index, { ...address, addressType: value })} options={[
                { id: 'current', label: 'Current' },
                { id: 'permanent', label: 'Permanent' },
                { id: 'correspondence', label: 'Correspondence' },
              ]} />
              <TextField label="Address 1" required={Boolean(address.id) || hasAddressContent(address)} value={address.address1} onChange={value => updateRow('addresses', index, { ...address, address1: value })} />
              <TextField label="Address 2" value={address.address2 || ''} onChange={value => updateRow('addresses', index, { ...address, address2: value })} />
              <TextField label="Mohalla" value={address.mohalla || ''} onChange={value => updateRow('addresses', index, { ...address, mohalla: value })} />
              <TextField label="Post Office" value={address.postOffice || ''} onChange={value => updateRow('addresses', index, { ...address, postOffice: value })} />
              <TextField label="Nearest Police Station" value={address.nearestPoliceStation || ''} onChange={value => updateRow('addresses', index, { ...address, nearestPoliceStation: value })} />
              <PincodeField value={address.pincode || ''} onChange={value => updateRow('addresses', index, { ...address, pincode: value })} onLookup={match => setForm(previous => ({
                ...previous,
                addresses: previous.addresses.map((current, rowIndex) => {
                  if (rowIndex !== index) return current;
                  const normalizedDistrict = match.district.trim().toLocaleLowerCase();
                  const normalizedState = match.state.trim().toLocaleLowerCase();
                  const district = districts.find(item =>
                    item.label.trim().toLocaleLowerCase() === normalizedDistrict &&
                    (!item.stateName || item.stateName.trim().toLocaleLowerCase() === normalizedState)
                  );
                  return { ...current, districtId: district?.id, districtName: match.district, state: match.state };
                }),
              }))} />
              <Select label="Village" value={address.villageId || ''} onChange={value => updateRow('addresses', index, { ...address, villageId: value || undefined })} options={villages} disabled={masterLoading} />
              <Select label="District" value={address.districtId || ''} onChange={value => updateRow('addresses', index, { ...address, districtId: value || undefined })} options={districts} disabled={masterLoading} />
              <TextField label="State" value={address.state || ''} onChange={value => updateRow('addresses', index, { ...address, state: value })} />
              <TextField label="Residence Type" value={address.residenceType || ''} onChange={value => updateRow('addresses', index, { ...address, residenceType: value })} />
            </div>
          </div>
        ))}
        <AddButton onClick={() => update('addresses', [...form.addresses, blankAddress()])} label="Add Address" />
      </section>

      {/* Family Details */}
      <section>
        <h4 className="mb-4 flex items-center border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
          <Users className="mr-2 h-5 w-5" />
          Family Details
        </h4>
        {form.familyMembers.map((member, index) => (
          <div key={member.id || index} className="mb-6 rounded-lg border border-gray-200 p-4 dark:border-gray-600">
            <div className="mb-4 flex items-center justify-between">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Family Member {index + 1}</h5>
              <RemoveButton onClick={() => removeRow('familyMembers', index)} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <TextField label="Relation" required={Boolean(member.id) || hasFamilyContent(member)} value={member.relation} onChange={value => updateRow('familyMembers', index, { ...member, relation: value })} />
              <TextField label="First Name" required={Boolean(member.id) || hasFamilyContent(member)} value={member.firstName} onChange={value => updateRow('familyMembers', index, { ...member, firstName: value })} />
              <TextField label="Last Name" value={member.lastName || ''} onChange={value => updateRow('familyMembers', index, { ...member, lastName: value })} />
              <TextField label="Mobile Number" value={member.mobileNumber || ''} onChange={value => updateRow('familyMembers', index, { ...member, mobileNumber: value })} />
              <TextField label="Date of Birth" type="date" value={member.dateOfBirth || ''} onChange={value => updateRow('familyMembers', index, { ...member, dateOfBirth: value })} />
              <TextField label="ID Type" value={member.idType || ''} onChange={value => updateRow('familyMembers', index, { ...member, idType: value })} />
              <TextField label="ID Number" value={member.idNumber || ''} onChange={value => updateRow('familyMembers', index, { ...member, idNumber: value })} />
              <TextField label="Additional ID Type" value={member.additionalIdType || ''} onChange={value => updateRow('familyMembers', index, { ...member, additionalIdType: value })} />
              <TextField label="Additional ID Number" value={member.additionalIdNumber || ''} onChange={value => updateRow('familyMembers', index, { ...member, additionalIdNumber: value })} />
              <TextField label="Marital Status" value={member.maritalStatus || ''} onChange={value => updateRow('familyMembers', index, { ...member, maritalStatus: value })} />
              <TextField label="Employment Status" value={member.employmentStatus || ''} onChange={value => updateRow('familyMembers', index, { ...member, employmentStatus: value })} />
              <TextField label="Qualification" value={member.qualification || ''} onChange={value => updateRow('familyMembers', index, { ...member, qualification: value })} />
              <TextField label="Occupation" value={member.occupation || ''} onChange={value => updateRow('familyMembers', index, { ...member, occupation: value })} />
              <TextField label="Occupation Type" value={member.occupationType || ''} onChange={value => updateRow('familyMembers', index, { ...member, occupationType: value })} />
            </div>
            <div className="mt-4 flex flex-wrap gap-5">
              {([
                ['considerForAssessment', 'Consider for Assessment'],
                ['isNominee', 'Nominee'],
                ['isCoApplicant', 'Co-applicant'],
                ['isGuarantor', 'Guarantor'],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={!!member[key]} onChange={event => updateRow('familyMembers', index, { ...member, [key]: event.target.checked })} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        ))}
        <AddButton onClick={() => update('familyMembers', [...form.familyMembers, blankFamily()])} label="Add Another Family Member" />
      </section>

      {/* Bank Details */}
      <section>
        <h4 className="mb-4 flex items-center border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
          <CreditCard className="mr-2 h-5 w-5" />
          Bank Details
        </h4>
        {form.bankAccounts.map((bank, index) => (
          <div key={bank.id || index} className="mb-6 rounded-lg border border-gray-200 p-4 dark:border-gray-600">
            <div className="mb-4 flex items-center justify-between">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Bank Account {index + 1}</h5>
              <RemoveButton onClick={() => removeRow('bankAccounts', index)} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Select label="Account Type" required={Boolean(bank.id) || hasBankContent(bank)} value={bank.accountType} onChange={value => updateRow('bankAccounts', index, { ...bank, accountType: value })} options={[
                { id: 'Savings', label: 'Savings' },
                { id: 'Current', label: 'Current' },
                { id: 'Other', label: 'Other' },
              ]} />
              <TextField label="Account Number" required={Boolean(bank.id) || hasBankContent(bank)} value={bank.accountNumber} onChange={value => updateRow('bankAccounts', index, { ...bank, accountNumber: value })} />
              <TextField label="Confirm Account Number" value={bank.confirmAccountNumber || ''} onChange={value => updateRow('bankAccounts', index, { ...bank, confirmAccountNumber: value })} />
              <Select label="IFSC" value={bank.ifscId || ''} onChange={value => {
                const selected = ifscs.find(item => item.id === value);
                updateRow('bankAccounts', index, {
                  ...bank,
                  ifscId: value || undefined,
                  ifscCode: selected?.ifscCode,
                  bankName: selected?.bankName,
                  bankBranch: selected?.bankBranch,
                });
              }} options={ifscs.map(item => ({ id: item.id, label: `${item.ifscCode} · ${item.bankName} · ${item.bankBranch}` }))} disabled={masterLoading} />
              <ReadOnly label="Bank Name" value={bank.bankName || ifscs.find(item => item.id === bank.ifscId)?.bankName || ''} />
              <ReadOnly label="Bank Branch" value={bank.bankBranch || ifscs.find(item => item.id === bank.ifscId)?.bankBranch || ''} />
              <TextField label="Customer Name" value={bank.customerName || ''} onChange={value => updateRow('bankAccounts', index, { ...bank, customerName: value })} />
              <NumberField label="Name Match Percentage" value={bank.nameMatchPercentage} min={0} max={100} onChange={value => updateRow('bankAccounts', index, { ...bank, nameMatchPercentage: value })} />
            </div>
            <div className="mt-4 flex flex-wrap gap-5">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><input type="checkbox" checked={!!bank.forDisbursement} onChange={event => updateRow('bankAccounts', index, { ...bank, forDisbursement: event.target.checked })} />For Disbursement</label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><input type="checkbox" checked={!!bank.forCollection} onChange={event => updateRow('bankAccounts', index, { ...bank, forCollection: event.target.checked })} />For Collection</label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><input type="checkbox" checked={!!bank.pennyDropDone} onChange={event => updateRow('bankAccounts', index, { ...bank, pennyDropDone: event.target.checked })} />Penny Drop Done</label>
            </div>
          </div>
        ))}
        <AddButton onClick={() => update('bankAccounts', [...form.bankAccounts, blankBank()])} label="Add Another Bank Details" />
      </section>

      {/* Product Details */}
      <section>
        <h4 className="mb-4 flex items-center border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
          <DollarSign className="mr-2 h-5 w-5" />
          Product Details
        </h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Select label="Product Group" required value={form.productGroupId} onChange={value => void selectProductGroup(value)} options={availableGroups} disabled={!form.branchId || masterLoading} />
          <Select label="Product" required value={form.productId} onChange={value => { update('productId', value); void applyTerms(value, { loanAmount: form.loanAmount }); }} options={productsForGroup} disabled={!form.productGroupId || masterLoading} />
          <ReadOnly label="Product Name" value={products.find(product => product.id === form.productId)?.label || ''} />
          <NumberField label="Loan Amount" required value={form.loanAmount} min={terms?.minAmount || 0.01} max={terms?.maxAmount ?? undefined} onChange={value => update('loanAmount', value)} />
          <ReadOnly label="EMI Amount" value={form.emiAmount == null ? '' : `₹${Number(form.emiAmount).toLocaleString()}`} />
          <ReadOnly label="Interest Rate" value={form.interestRate == null ? '' : `${form.interestRate}%`} />
          <label>
            <FieldLabel>Repayment Frequency</FieldLabel>
            <input className={`${field} bg-gray-50`} value={form.repaymentFrequency || ''} readOnly />
          </label>
          <label>
            <FieldLabel>Contractual First Installment Date</FieldLabel>
            <input type="date" className={field} value={form.contractualFirstInstallmentDate || ''} onChange={event => update('contractualFirstInstallmentDate', event.target.value)} />
          </label>
          <NumberField label="Tenure (months)" value={form.tenure} min={terms?.minTenure ?? 1} max={terms?.maxTenure ?? undefined} onChange={value => update('tenure', value)} />
          <Select label="Purpose" required value={form.purposeId || ''} onChange={value => { update('purposeId', value); update('subPurposeId', ''); }} options={mainPurposes.map(item => ({ id: item.id, label: item.purposeName }))} disabled={masterLoading} />
          <Select label="Sub Purpose" value={form.subPurposeId || ''} onChange={value => update('subPurposeId', value)} options={subPurposes.map(item => ({ id: item.id, label: item.purposeName }))} disabled={!form.purposeId || masterLoading} />
        </div>
        {terms && <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950"><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><span>Amount range: ₹{terms.minAmount.toLocaleString()}–₹{terms.maxAmount?.toLocaleString() ?? 'No maximum'}</span><span>Tenure: {terms.minTenure ?? 1}–{terms.maxTenure ?? 'unbounded'} months</span><span>Total interest: ₹{terms.totalInterest.toLocaleString()}</span><span>Total payable: ₹{terms.totalPayableAmount.toLocaleString()}</span><span>Processing fee: ₹{terms.processingFee.toLocaleString()}</span><span>Insurance: ₹{terms.insuranceCharge.toLocaleString()}</span><span>Other charges: ₹{terms.otherCharges.toLocaleString()}</span><span>Method: {terms.interestCalculationMethod.replace(/_/g, ' ')}</span></div><details className="mt-4"><summary className="cursor-pointer font-medium">Repayment schedule preview ({terms.schedule.length} installments)</summary><div className="mt-3 max-h-56 overflow-auto"><table className="w-full text-left text-xs"><thead><tr><th>#</th><th>Due date</th><th>Opening</th><th>Principal</th><th>Interest</th><th>Installment</th><th>Closing</th></tr></thead><tbody>{terms.schedule.map(row => <tr key={row.installmentNumber} className="border-t border-blue-100"><td>{row.installmentNumber}</td><td>{row.dueDate}</td><td>₹{row.openingPrincipal.toLocaleString()}</td><td>₹{row.principalComponent.toLocaleString()}</td><td>₹{row.interestComponent.toLocaleString()}</td><td>₹{row.installmentAmount.toLocaleString()}</td><td>₹{row.closingPrincipal.toLocaleString()}</td></tr>)}</tbody></table></div></details></div>}
        <label className="mt-4 block">
          <FieldLabel>Application Remarks</FieldLabel>
          <textarea className={`${field} resize-y`} rows={3} value={form.remarks || ''} onChange={event => update('remarks', event.target.value)} />
        </label>
      </section>

      {/* Financial Assessment - included now, non-blocking for unfinished fields */}
      <section>
        <h4 className="mb-4 flex items-center border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
          <DollarSign className="mr-2 h-5 w-5" />
          Financial Assessment
        </h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ReadOnly label="Annual Income" value={formatCurrency(editingId ? linkedClient?.annualIncome : newClient.annualIncome)} />
          <ReadOnly label="Monthly Income" value={formatCurrency(editingId ? linkedClient?.monthlyIncome : newClient.monthlyIncome)} />
          <ReadOnly label="Monthly Expenses" value={formatCurrency(editingId ? linkedClient?.monthlyExpense : newClient.monthlyExpense)} />
          <ReadOnly label="Existing EMI Obligation" value={formatCurrency(editingId ? linkedClient?.monthlyObligation : newClient.monthlyObligation)} />
          <ReadOnly label="Proposed EMI" value={form.emiAmount == null ? '' : `₹${Number(form.emiAmount).toLocaleString()}`} />
          <ReadOnly label="FOIR" value="" />
          <ReadOnly label="Credit Bureau Active Accounts" value="" />
          <ReadOnly label="Outstanding Amount" value="" />
          <ReadOnly label="Overdue Accounts" value="" />
          <ReadOnly label="Overdue Amount" value="" />
          <ReadOnly label="Write-off Accounts" value="" />
          <ReadOnly label="Write-off Amount" value="" />
        </div>
        <p className="mt-3 text-xs text-amber-700">
          Financial fields that do not yet have application-level persistence or calculation rules are intentionally non-blocking for testing.
        </p>
      </section>

      {/* Document Uploader - old visual cards, current upload mechanism */}
      <section>
        <h4 className="mb-4 flex items-center border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
          <FileText className="mr-2 h-5 w-5" />
          Document Uploader
        </h4>

        <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Documents are optional. Save the application first, then attach PDF, JPEG, or PNG files up to 10 MB.
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {documentCards.map(card => {
            const existing = latestDocumentForType(card.type);
            const selectedForCard = documentType === card.type;

            return (
              <div key={card.label} className="rounded-lg border border-gray-200 p-4 dark:border-gray-600">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{card.label}</label>

                {existing && (
                  <div className="mb-3 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    <div className="font-medium">{existing.fileName || 'Uploaded file'}</div>
                    <div>{existing.verificationStatus || 'pending'}</div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => chooseDocumentForCard(card.type)}
                  disabled={!editingId}
                  className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                >
                  <Upload className="h-4 w-4" />
                  {existing ? 'Replace / Upload' : 'Select Document'}
                </button>

                {selectedForCard && editingId && (
                  <>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      className={`${field} mb-2 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5`}
                      onChange={event => {
                        setDocumentFile(event.target.files?.[0] || null);
                        setDocumentMessage(undefined);
                      }}
                    />
                    <button
                      type="button"
                      disabled={uploadingDocument || !documentFile}
                      onClick={() => void uploadDocument(card.type)}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uploadingDocument ? 'Uploading…' : 'Upload'}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {documentMessage && (
          <p role={documentMessage.type === 'error' ? 'alert' : 'status'} className={`mt-3 text-sm ${documentMessage.type === 'error' ? 'text-red-600' : 'text-green-700'}`}>
            {documentMessage.text}
          </p>
        )}
      </section>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || masterLoading}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : editingId ? 'Update Application' : 'Submit Application'}
        </button>
      </div>
    </form>
  );
}
function FieldLabel({ children }: { children: React.ReactNode }) { return <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{children}</span>; }
function formatCurrency(value?: number) { return value == null ? '' : `₹${Number(value).toLocaleString()}`; }
function NewClientFields({ value, onChange }: { value: ClientFormData; onChange: (value: ClientFormData) => void }) {
  const text = (key: keyof ClientFormData, label: string, required = true) => <TextField label={label} required={required} value={String(value[key] ?? '')} onChange={next => onChange({ ...value, [key]: next })} />;
  const number = (key: keyof ClientFormData, label: string) => <NumberField label={label} min={0} value={Number(value[key] ?? 0)} onChange={next => onChange({ ...value, [key]: next ?? 0 })} />;
  return <><div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">Enter the client profile below. It will be created and linked to this application in one save operation.</div><div className="grid grid-cols-1 gap-4 md:grid-cols-3">
    {text('firstName', 'First Name')}{text('lastName', 'Last Name')}{text('aadhaarNumber', 'Aadhaar Number')}{text('voterCardNumber', 'Voter Card Number')}
    <Select label="KYC Type" required value={value.kycType} onChange={next => onChange({ ...value, kycType: next })} options={[{ id: 'Aadhaar', label: 'Aadhaar' }, { id: 'Voter ID', label: 'Voter ID' }, { id: 'Other', label: 'Other' }]} />
    {text('kycId', 'KYC ID')}<TextField label="Date of Birth" required type="date" max={todayDateInputValue()} value={value.dateOfBirth || ''} onChange={next => onChange({ ...value, dateOfBirth: next })} />{text('fatherName', "Father's Name")}{text('motherName', "Mother's Name")}{text('mobileNumber', 'Mobile Number')}
    <Select label="Gender" required value={value.gender} onChange={next => onChange({ ...value, gender: next as ClientFormData['gender'] })} options={['Male','Female','Other'].map(id => ({ id, label: id }))} />
    <Select label="Marital Status" required value={value.maritalStatus} onChange={next => onChange({ ...value, maritalStatus: next as ClientFormData['maritalStatus'] })} options={['Single','Married','Divorced','Widowed'].map(id => ({ id, label: id }))} />
    {text('qualification', 'Qualification')}{text('language', 'Language')}{text('caste', 'Caste')}{text('religion', 'Religion')}{text('occupation', 'Occupation')}{text('landHolding', 'Land Holding')}
    {number('monthlyIncome', 'Monthly Income')}{number('annualIncome', 'Annual Income')}{number('householdIncome', 'Household Income')}{number('monthlyExpense', 'Monthly Expense')}{number('monthlyObligation', 'Monthly Obligation')}
  </div></>;
}
function PincodeField({ value, onChange, onLookup }: { value: string; onChange: (value: string) => void; onLookup: (pincode: Pincode) => void }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const requestId = useRef(0);
  const currentValue = useRef(value);
  currentValue.current = value;
  useEffect(() => () => { requestId.current += 1; }, []);
  const lookup = async () => {
    if (!/^\d{6}$/.test(value)) { setMessage(''); return; }
    const lookupId = ++requestId.current;
    const requestedValue = value;
    setLoading(true); setMessage('');
    try {
      const result = await pincodeService.lookupPincode(requestedValue);
      if (lookupId !== requestId.current || currentValue.current !== requestedValue) return;
      if (result) { onLookup(result); setMessage(`Matched ${result.district}, ${result.state}`); } else setMessage('No pincode master match');
    } catch (reason) {
      if (lookupId === requestId.current && currentValue.current === requestedValue) setMessage(reason instanceof Error ? reason.message : 'Pincode lookup failed');
    } finally { if (lookupId === requestId.current) setLoading(false); }
  };
  return <label><FieldLabel>Pincode</FieldLabel><input inputMode="numeric" maxLength={6} pattern="[0-9]{6}" className={field} value={value} onChange={event => { setMessage(''); onChange(event.target.value.replace(/\D/g, '').slice(0, 6)); }} onBlur={lookup} />{(loading || message) && <span className="mt-1 block text-xs text-gray-500">{loading ? 'Checking pincode master…' : message}</span>}</label>;
}
function TextField({ label, value, onChange, required, type = 'text', max }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; max?: string }) { return <label><FieldLabel>{label} {required && <b className="text-red-500">*</b>}</FieldLabel><input required={required} type={type} max={max} className={field} value={value} onChange={event => onChange(event.target.value)} /></label>; }
function ReadOnly({ label, value }: { label: string; value: string }) { return <label><FieldLabel>{label}</FieldLabel><input readOnly className={`${field} bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-300`} value={value || '—'} /></label>; }
function Select({ label, value, onChange, options, required, disabled, emptyMessage }: { label: string; value: string; onChange: (value: string) => void; options: Option[]; required?: boolean; disabled?: boolean; emptyMessage?: string }) { return <label><FieldLabel>{label} {required && <b className="text-red-500">*</b>}</FieldLabel><select required={required} disabled={disabled} className={`${field} disabled:cursor-not-allowed disabled:opacity-60`} value={value} onChange={event => onChange(event.target.value)}><option value="">{emptyMessage || `Select ${label}`}</option>{options.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>; }
function NumberField({ label, value, onChange, required, min, max }: { label: string; value?: number; onChange: (value: number | undefined) => void; required?: boolean; min: number; max?: number }) { return <label><FieldLabel>{label} {required && <b className="text-red-500">*</b>}</FieldLabel><input required={required} min={min} max={max} type="number" className={field} value={value ?? ''} onChange={event => onChange(event.target.value === '' ? undefined : Number(event.target.value))} /></label>; }
function AddButton({ onClick, label }: { onClick: () => void; label: string }) { return <button type="button" onClick={onClick} className="mt-3 flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"><Plus className="h-4 w-4" />{label}</button>; }

const LoanApplicationPageContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [applications, setApplications] = useState<LoanApplicationListItem[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [search, setSearch] = useState(''); const [statusFilter, setStatusFilter] = useState(''); const [showFilter, setShowFilter] = useState(false); const [showModal, setShowModal] = useState(false); const [currentPage, setCurrentPage] = useState(1); const [pageSize, setPageSize] = useState(10); const [editing, setEditing] = useState<{ id: string; form: FormState; applicationNumber: string; applicationDate: string; detail: LoanApplicationDetail }>();
  const load = useCallback(async () => { setLoading(true); try { setApplications(await loanApplicationService.getAllApplications()); setError(''); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load applications'); } finally { setLoading(false); } }, []);
  const openEdit = useCallback(async (id: string) => {
    try {
      const detail: LoanApplicationDetail = await loanApplicationService.getApplication(id);
      setEditing({ id, applicationNumber: detail.applicationNumber, applicationDate: detail.applicationDate, detail, form: {
        branchId: detail.branchId, centerId: detail.centerId, clientId: detail.clientId, productGroupId: detail.productGroupId, productId: detail.productId,
        purposeId: detail.purposeId, subPurposeId: detail.subPurposeId, isTopUp: detail.isTopUp, loanAmount: detail.loanAmount, emiAmount: detail.emiAmount,
        interestRate: detail.interestRate, tenure: detail.tenure, repaymentFrequency: detail.repaymentFrequency || 'monthly', contractualFirstInstallmentDate: detail.contractualFirstInstallmentDate || '', fieldOfficerId: detail.fieldOfficerId || '',
        remarks: detail.remarks || '', addresses: detail.addresses, familyMembers: detail.familyMembers, bankAccounts: detail.bankAccounts, documents: detail.documents,
      } });
      setShowModal(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load application'); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const editId = location.state?.editId;

    if (editId) {
      openEdit(editId);

      // Clear the navigation state so refreshing/back navigation
      // doesn't reopen the edit modal.
      window.history.replaceState({}, document.title, window.location.href);
    }
  }, [location.state, openEdit]);
  const visible = useMemo(() => applications.filter(application => { const text = `${application.application_number} ${application.client_id} ${application.first_name} ${application.last_name} ${application.branch_name} ${application.center_name} ${application.product_name}`.toLowerCase(); return (!search || text.includes(search.toLowerCase())) && (!statusFilter || application.application_status === statusFilter); }), [applications, search, statusFilter]);
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, pageSize]);
  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const paged = useMemo(() => visible.slice((currentPage - 1) * pageSize, currentPage * pageSize), [visible, currentPage, pageSize]);
  const statusCount = (status: string) => applications.filter(application => application.application_status === status).length;
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loan Applications</h1><p className="mt-1 text-gray-600 dark:text-gray-400">Track and manage loan applications</p></div>{success && <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700"><CheckCircle className="h-5 w-5" />{success}</div>}{error && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700"><AlertCircle className="h-5 w-5" />{error}</div>}<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
    <Stat label="draft" value={statusCount('draft')} color="gray" icon={<FileText className="h-5 w-5" />} /><Stat label="Submitted" value={statusCount('submitted')} color="yellow" icon={<Clock  className="h-5 w-5" />} /><Stat label="Under Review" value={statusCount('under_review')} color="blue" icon={<Clock className="h-5 w-5" />} /><Stat label="Approved" value={statusCount('approved')} color="green" icon={<CheckCircle className="h-5 w-5" />} /><Stat label="Rejected" value={statusCount('rejected')} color="red" icon={<XCircle className="h-5 w-5" />} /></div><div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"><div className="border-b border-gray-200 p-6 dark:border-gray-700"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Application Management</h2><p className="mt-1 text-sm text-gray-500">{visible.length} records found</p></div><div className="flex flex-wrap items-center gap-3"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 dark:border-gray-600 dark:bg-gray-700 dark:text-white md:w-64" placeholder="Search applications..." value={search} onChange={e => setSearch(e.target.value)} /></div><button onClick={() => setShowFilter(previous => !previous)} className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:text-white"><Filter className="h-4 w-4" />Filter<ChevronDown className={`h-4 w-4 ${showFilter ? 'rotate-180' : ''}`} /></button><PermissionGuard module="loan" permission="write"><button onClick={() => { setEditing(undefined); setShowModal(true); }} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"><Plus className="h-4 w-4" />Add New</button></PermissionGuard></div></div>{showFilter && <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4 dark:border-gray-700"><label className="text-sm text-gray-600 dark:text-gray-300">Application status<select className="ml-2 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">All statuses</option>
  <option value="draft">Draft</option><option value="submitted">Submitted</option><option value="under_review">Under Review</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></label><button className="text-sm text-gray-500 underline" onClick={() => { setSearch(''); setStatusFilter(''); }}>Clear filters</button></div>}</div><div className="w-full min-w-0 overflow-x-auto overscroll-x-contain">{loading ? <div className="flex items-center justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /><span className="ml-3 text-gray-600">Loading applications...</span></div> : <table className="w-full min-w-max"><thead className="bg-gray-50 dark:bg-gray-700"><tr>{['Action','Application ID','Client','Branch','Center','Product','Loan Amount','Status'].map(label => <th key={label} className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">{label}</th>)}</tr></thead><tbody className="divide-y divide-gray-200 dark:divide-gray-700">{paged.length ? paged.map(application => <tr key={application.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
    <td className="px-6 py-4">
      <div className="flex items-center gap-1">
      <PermissionGuard module="loan" permission="read">
        <button title="View" onClick={() => navigate(`/loan/transaction/application/${application.id}`)} className="rounded p-1 text-gray-600 hover:bg-gray-100"><Eye className="h-4 w-4" /></button>
      </PermissionGuard>
      <PermissionGuard module="loan" permission="write">{application.application_status === 'draft' && <button title="Edit" onClick={() => openEdit(application.id)} className="rounded p-1 text-blue-600 hover:bg-blue-50"><Edit className="h-4 w-4" /></button>}</PermissionGuard>
      </div>
    </td>
    <td className="px-6 py-4 text-sm"><span className="font-mono font-medium">{application.application_number}</span><div className="text-xs text-gray-500">{String(application.application_date).slice(0, 10)}</div></td><td className="px-6 py-4 text-sm">{application.client_id}<div className="text-xs text-gray-500">{application.first_name} {application.last_name}</div></td><td className="px-6 py-4 text-sm">{application.branch_name}<div className="text-xs text-gray-500">{application.branch_code}</div></td><td className="px-6 py-4 text-sm">{application.center_name}<div className="text-xs text-gray-500">{application.center_code}</div></td><td className="px-6 py-4 text-sm">{application.product_name}<div className="text-xs text-gray-500">{application.product_group_name}</div></td><td className="px-6 py-4 text-sm">₹{Number(application.loan_amount).toLocaleString()}</td><td className="px-6 py-4"><span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${application.application_status === 'approved' ? 'bg-green-100 text-green-800' : application.application_status === 'rejected' ? 'bg-red-100 text-red-800' : application.application_status === 'disbursed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{application.application_status}</span></td></tr>) : <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">{search || statusFilter ? 'No applications match the selected filters.' : 'No loan applications found.'}</td></tr>}</tbody></table>}</div>{visible.length > 0 && !loading && <Pagination currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} totalItems={visible.length} onPageChange={setCurrentPage} onPageSizeChange={size => { setPageSize(size); setCurrentPage(1); }} />}</div><Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Loan Application' : 'Add New Loan Application'} size="xl"><ApplicationForm initial={editing?.form} editingId={editing?.id} applicationNumber={editing?.applicationNumber} applicationDate={editing?.applicationDate} linkedClient={editing?.detail} onCancel={() => setShowModal(false)} onSaved={async () => { setShowModal(false); setEditing(undefined); setSuccess(editing ? 'Application updated successfully.' : 'Application submitted successfully.'); await load(); setTimeout(() => setSuccess(''), 3000); }} /></Modal></div>;
};

export const LoanApplicationPage: React.FC = () => (
  <PermissionGuard module="loan" permission="read">
    <LoanApplicationPageContent />
  </PermissionGuard>
);

function Stat({ label, value, color, icon }: { label: string; value: number; color: 'yellow' | 'green' | 'blue' | 'red' | 'gray'; icon: React.ReactNode }) { const colors = { yellow: 'bg-yellow-100 text-yellow-600', green: 'bg-green-100 text-green-600', blue: 'bg-blue-100 text-blue-600', red: 'bg-red-100 text-red-600' }; return <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"><div className="flex items-center gap-3"><div className={`rounded-lg p-2 ${colors[color]}`}>{icon}</div><div><p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p><p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p></div></div></div>; }
