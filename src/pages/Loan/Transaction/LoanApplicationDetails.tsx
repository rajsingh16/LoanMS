import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Building,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  User,
  Users,
  Edit,
  Download,
  ClipboardCheck,
  Calculator,
  Save,
} from 'lucide-react';
import {
  LoanApplicationDetail,
  LoanApplicationStatus,
  loanApplicationService,
  LoanApplicationFieldVerification,
  LoanApplicationAssessment,
  LoanApplicationFieldVerificationRequest,
  LoanApplicationAssessmentRequest,
  LoanApplicationStatusUpdate,
  LoanAccountReference,
} from '../../../services/transactionService/loanApplicationService';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';

const NA = 'Not Available';

const show = (v: unknown) => (v == null || v === '' ? NA : String(v));
const yesNo = (v: unknown) => (v == null ? NA : v ? 'Yes' : 'No');
const date = (v: unknown) => (v ? String(v).slice(0, 10) : NA);
const money = (v: unknown) =>
  v == null || v === '' ? NA : `₹${Number(v).toLocaleString()}`;
const maskAccount = (n: unknown) => {
  const s = String(n ?? '');
  return s
    ? `${'•'.repeat(Math.max(s.length - 4, 0))}${s.slice(-4)}`
    : NA;
};
const name = (a?: unknown, b?: unknown) =>
  [a, b].filter(Boolean).join(' ') || NA;

const hasValidLoanTerms = (application: LoanApplicationDetail) =>
  Number.isFinite(application.interestRate) && Number(application.interestRate) >= 0 &&
  Number.isInteger(application.tenure) && Number(application.tenure) > 0 &&
  Number.isFinite(application.emiAmount) && Number(application.emiAmount) > 0 &&
  ['weekly', 'fortnightly', 'monthly', 'quarterly'].includes(application.repaymentFrequency || '');

const LIST_PATH = '/loan/transaction/application';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


const badge = (status: string) => {
  switch (status) {
    case 'approved':
    case 'verified':
      return 'bg-green-100 text-green-800';

    case 'rejected':
      return 'bg-red-100 text-red-800';

    case 'submitted':
    case 'under_review':
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';

    case 'draft':
    case 'pending':
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};
function Badge({ status }: { status?: string }) {
  if (!status) return <span>{NA}</span>;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badge(status)}`}
    >
      {status}
    </span>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 flex items-center border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
        {icon}
        <span className="ml-2">{title}</span>
      </h2>
      {children}
    </section>
  );
}

function Item({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm text-gray-900 dark:text-white">
        {children}
      </dd>
    </div>
  );
}

const Grid = ({ children }: { children: React.ReactNode }) => (
  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {children}
  </dl>
);

const Empty = ({ text }: { text: string }) => (
  <p className="text-sm text-gray-500">{text}</p>
);

const SubCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
    {children}
  </div>
);

type LoanApplicationDetailWithAudit = LoanApplicationDetail & {
  createdAt?: unknown;
  updatedAt?: unknown;
};

const LoanApplicationDetailsContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<LoanApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<string>();
  const [documentError, setDocumentError] = useState('');
  const [fieldVerifications, setFieldVerifications] = useState<LoanApplicationFieldVerification[]>([]);
  const [assessments, setAssessments] = useState<LoanApplicationAssessment[]>([]);
  const [fieldOfficers, setFieldOfficers] = useState<Array<{id: string; employee_id?: string; first_name?: string; last_name?: string;}>>([]);
  const [phase5Loading, setPhase5Loading] = useState(false);
  const [phase5Saving, setPhase5Saving] = useState(false);
  const [phase5Error, setPhase5Error] = useState('');
  const [phase5Success, setPhase5Success] = useState('');
  const [verificationForm, setVerificationForm] = useState<LoanApplicationFieldVerificationRequest>({ fieldOfficerId: '', visitDate: new Date().toISOString().slice(0, 10), visitLocation: '', applicantMet: false, businessVerified: false, residenceVerified: false, findings: '', remarks: '', verificationResult: 'inconclusive', });
  const [assessmentForm, setAssessmentForm] = useState<LoanApplicationAssessmentRequest>({ monthlyIncome: null, monthlyExpenses: null, existingObligations: null, householdIncome: null, householdExpenses: null, recommendedLoanAmount: null, recommendedEmi: null, assessmentResult: 'inconclusive', assessmentRemarks: '', });
  const [verifyingDocumentId, setVerifyingDocumentId] = useState<string>();
  const [showDocumentRejectModal, setShowDocumentRejectModal] = useState(false);
  const [documentToReject, setDocumentToReject] = useState<string>();
  const [documentRejectionReason, setDocumentRejectionReason] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [sanctionAmount, setSanctionAmount] = useState('');
  const [sanctionDate, setSanctionDate] = useState(new Date().toISOString().slice(0, 10));
  const [sanctionRemarks, setSanctionRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [creatingLoanAccount, setCreatingLoanAccount] = useState(false);
  const [loanAccountMessage, setLoanAccountMessage] = useState('');
  const [existingLoanAccount, setExistingLoanAccount] = useState<LoanAccountReference | null>(null);
  const [showLoanTermsForm, setShowLoanTermsForm] = useState(false);
  const [savingLoanTerms, setSavingLoanTerms] = useState(false);
  const [loanTerms, setLoanTerms] = useState({
    interestRate: '',
    tenure: '',
    repaymentFrequency: 'monthly' as 'weekly' | 'fortnightly' | 'monthly' | 'quarterly',
    emiAmount: '',
  });

  const updateStatus = async (
    status: LoanApplicationStatus,
    payload: LoanApplicationStatusUpdate = {},
  ) : Promise<boolean> => {
    if (!data) return false;
  
    setStatusUpdating(true);
    setError('');
  
    try {
      const updated =
        await loanApplicationService.updateApplicationStatus(
          data.id,
          status,
          payload
        );
  
      setData(updated);
      return true;
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Unable to update application status'
      );
      return false;
    } finally {
      setStatusUpdating(false);
    }
  };

  const openDocument = async (documentId: string, fileName?: string) => {
    if (!id) return;

    setDownloadingDocumentId(documentId);
    setDocumentError('');

    try {
      const blob = await loanApplicationService.downloadDocument(id, documentId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = fileName || 'loan-application-document';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (reason) {
      setDocumentError(
        reason instanceof Error ? reason.message : 'Unable to open document',
      );
    } finally {
      setDownloadingDocumentId(undefined);
    }
  };
  const verifyDocument = async (
    documentId: string,
    status: 'verified' | 'rejected',
    reason?: string,
  ) => {
    if (!id) return;
  
    setVerifyingDocumentId(documentId);
    setDocumentError('');
  
    try {
      const updated =
        await loanApplicationService.verifyDocument(
          id,
          documentId,
          status,
          reason,
        );
  
      setData(updated);
  
      setShowDocumentRejectModal(false);
      setDocumentToReject(undefined);
      setDocumentRejectionReason('');
    } catch (reason) {
      setDocumentError(
        reason instanceof Error
          ? reason.message
          : 'Unable to update document verification',
      );
    } finally {
      setVerifyingDocumentId(undefined);
    }
  };
  const createLoanAccount = async () => {
    if (!data || !id) return;
  
    if (
      data.applicationStatus !== 'approved' ||
      data.sanctionStatus !== 'approved'
    ) {
      setLoanAccountMessage(
        'Only applications with approved application and sanction status can create a loan account.',
      );
      return;
    }
  
    const confirmed = window.confirm(
      `Create a loan account for application ${data.applicationNumber}?`,
    );
  
    if (!confirmed) return;
  
    setCreatingLoanAccount(true);
    setLoanAccountMessage('');
  
    try {
      const account = await loanApplicationService.createLoanAccount(id);
  
      const accountId = account?.id ?? account?.data?.id;
  
      if (typeof accountId === 'string' && UUID.test(accountId)) {
        setExistingLoanAccount({
          id: accountId,
          loan_account_number: account.loan_account_number ?? account.data?.loan_account_number ?? '',
        });
        navigate(`/loan/transaction/accounts/${accountId}`);
        return;
      }
  
      setLoanAccountMessage(
        'The request completed, but no account ID was returned. Check the API response.',
      );
    } catch (reason) {
      setLoanAccountMessage(
        reason instanceof Error
          ? reason.message
          : 'Unable to create the loan account.',
      );
    } finally {
      setCreatingLoanAccount(false);
    }
  };
  const openLoanTermsForm = () => {
    if (!data) return;
    setLoanAccountMessage('');
    setLoanTerms({
      interestRate: Number.isFinite(data.interestRate) ? String(data.interestRate) : '',
      tenure: Number.isInteger(data.tenure) && Number(data.tenure) > 0 ? String(data.tenure) : '',
      repaymentFrequency: ['weekly', 'fortnightly', 'monthly', 'quarterly'].includes(data.repaymentFrequency || '')
        ? data.repaymentFrequency as 'weekly' | 'fortnightly' | 'monthly' | 'quarterly'
        : 'monthly',
      emiAmount: Number.isFinite(data.emiAmount) && Number(data.emiAmount) > 0 ? String(data.emiAmount) : '',
    });
    setShowLoanTermsForm(true);
  };
  const saveLoanTerms = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || !data || savingLoanTerms) return;
    if (data.applicationStatus !== 'approved' || data.sanctionStatus !== 'approved') {
      setLoanAccountMessage('Financial terms can only be confirmed for an approved and sanctioned application.');
      return;
    }
    const interestRate = Number(loanTerms.interestRate);
    const tenure = Number(loanTerms.tenure);
    const emiAmount = Number(loanTerms.emiAmount);
    if (loanTerms.interestRate.trim() === '' || !Number.isFinite(interestRate) || interestRate < 0 || Math.abs(interestRate * 10000 - Math.round(interestRate * 10000)) > 0.000001) {
      setLoanAccountMessage('Enter an interest rate with at most four decimal places.'); return;
    }
    if (loanTerms.tenure.trim() === '' || !Number.isInteger(tenure) || tenure <= 0) {
      setLoanAccountMessage('Enter a positive whole-number tenure.'); return;
    }
    if (loanTerms.emiAmount.trim() === '' || !Number.isFinite(emiAmount) || emiAmount <= 0 || Math.abs(emiAmount * 100 - Math.round(emiAmount * 100)) > 0.000001) {
      setLoanAccountMessage('Enter a positive EMI amount with at most two decimal places.'); return;
    }
    try {
      setSavingLoanTerms(true); setLoanAccountMessage('');
      await loanApplicationService.updateLoanTerms(id, { interestRate, tenure, emiAmount, repaymentFrequency: loanTerms.repaymentFrequency });
      setData(await loanApplicationService.getApplication(id));
      setShowLoanTermsForm(false);
      setLoanAccountMessage('Loan financial terms saved. You can now create the loan account.');
    } catch (reason) {
      setLoanAccountMessage(reason instanceof Error ? reason.message : 'Unable to save loan financial terms.');
    } finally {
      setSavingLoanTerms(false);
    }
  };
  //Field Verification
  const saveFieldVerification = async () => {
    if (!id) return;
  
    setPhase5Error('');
    setPhase5Success('');
  
    if (!verificationForm.fieldOfficerId) {
      setPhase5Error('Please select a field officer.');
      return;
    }
  
    if (!verificationForm.visitDate) {
      setPhase5Error('Please select the verification date.');
      return;
    }
  
    setPhase5Saving(true);
  
    try {
      const created =
        await loanApplicationService.createFieldVerification(
          id,
          verificationForm,
        );
  
      setFieldVerifications((current) => [
        created,
        ...current,
      ]);
  
      setPhase5Success('Field verification saved successfully.');
  
      setVerificationForm({
        fieldOfficerId: '',
        visitDate: new Date().toISOString().slice(0, 10),
        visitLocation: '',
        applicantMet: false,
        businessVerified: false,
        residenceVerified: false,
        findings: '',
        remarks: '',
        verificationResult: 'inconclusive',
      });
    } catch (reason) {
      setPhase5Error(
        reason instanceof Error
          ? reason.message
          : 'Unable to save field verification',
      );
    } finally {
      setPhase5Saving(false);
    }
  };
  //Applicant Assessment
  const saveAssessment = async () => {
    if (!id) return;
  
    setPhase5Error('');
    setPhase5Success('');
  
    setPhase5Saving(true);
  
    try {
      const created =
        await loanApplicationService.createAssessment(
          id,
          assessmentForm,
        );
  
      setAssessments((current) => [
        created,
        ...current,
      ]);
      setShowAssessmentForm(false);
  
      setPhase5Success('Applicant assessment saved successfully.');
  
      setAssessmentForm({
        monthlyIncome: null,
        monthlyExpenses: null,
        existingObligations: null,
        householdIncome: null,
        householdExpenses: null,
        recommendedLoanAmount: null,
        recommendedEmi: null,
        assessmentResult: 'inconclusive',
        assessmentRemarks: '',
      });
    } catch (reason) {
      setPhase5Error(
        reason instanceof Error
          ? reason.message
          : 'Unable to save applicant assessment',
      );
    } finally {
      setPhase5Saving(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let active = true;

    setLoading(true);
    setError('');
    setNotFound(false);

    loanApplicationService
      .getApplication(id)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (!active) return;

        const message =
          e instanceof Error ? e.message : 'Unable to load application';

        if (/not found|invalid application id/i.test(message)) {
          setNotFound(true);
        } else {
          setError(message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const viewLoanAccount = () => {
    if (!existingLoanAccount || !UUID.test(existingLoanAccount.id)) {
      setLoanAccountMessage(
        'This application does not have a valid loan account to view.',
      );
      return;
    }

    navigate(`/loan/transaction/accounts/${existingLoanAccount.id}`);
  };
  useEffect(() => {
    if (!id) return;
    let active = true;
    loanApplicationService.getLoanAccountForApplication(id)
      .then((account) => { if (active) setExistingLoanAccount(account); })
      .catch(() => { if (active) setExistingLoanAccount(null); });
    return () => { active = false; };
  }, [id]);
  useEffect(() => {
    if (!id) return;
  
    let active = true;
  
    const loadPhase5Data = async () => {
      setPhase5Loading(true);
      setPhase5Error('');
  
      try {
        const [verifications, assessmentRows, officers] = await Promise.all([
          loanApplicationService.getFieldVerifications(id),
          loanApplicationService.getAssessments(id),
          loanApplicationService.getFieldOfficers(),
        ]);
  
        if (!active) return;
  
        setFieldVerifications(verifications);
        setAssessments(assessmentRows);
  
        setFieldOfficers(
          (officers ?? []).map((officer: any) => ({
            id: officer.id,
            employee_id:
              officer.employee_id ?? officer.employeeId,
            first_name:
              officer.first_name ?? officer.firstName,
            last_name:
              officer.last_name ?? officer.lastName,
          })),
        );
      } catch (reason) {
        if (active) {
          setPhase5Error(
            reason instanceof Error
              ? reason.message
              : 'Unable to load field verification and assessment data',
          );
        }
      } finally {
        if (active) {
          setPhase5Loading(false);
        }
      }
    };
  
    void loadPhase5Data();
  
    return () => {
      active = false;
    };
  }, [id]);

  const back = (
    <button
      type="button"
      onClick={() => navigate(LIST_PATH)}
      className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Loan Applications
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <span className="ml-3 text-gray-600">Loading application...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-4">
        {back}
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="space-y-4">
        {back}
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800">
          Loan application not found.
        </div>
      </div>
    );
  }
  const assessmentIncome = assessmentForm.householdIncome ?? assessmentForm.monthlyIncome ??0;

  const assessmentExpenses = assessmentForm.householdExpenses ?? assessmentForm.monthlyExpenses ??0;

  const assessmentObligations = assessmentForm.existingObligations ?? 0;

  const calculatedNetIncome = Math.max(0, Number(assessmentIncome) - Number(assessmentExpenses) - Number(assessmentObligations),);

  const calculatedRepaymentCapacity = calculatedNetIncome;

  const detail = data as LoanApplicationDetailWithAudit;
  const addresses = data.addresses ?? [];
  const family = data.familyMembers ?? [];
  const banks = data.bankAccounts ?? [];
  const documents = data.documents ?? [];

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Loan Application Details
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="break-all font-mono text-xl font-semibold text-blue-600">
              {show(data.applicationNumber)}
            </span>
            <Badge status={data.applicationStatus} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
        {data.applicationStatus === 'draft' && (
          <>
          <PermissionGuard
            module="loan"
            permission="write"
            fallback={<></>}
          >
            <button
              type="button"
              disabled={statusUpdating}
              onClick={() => updateStatus('submitted')}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {statusUpdating ? 'Submitting...' : 'Submit Application'}
            </button>
          </PermissionGuard>
          
          <PermissionGuard module="loan" permission="write" fallback={<></>}>
              <button
                type="button"
                onClick={() =>
                  navigate(LIST_PATH, {
                    state: { editId: data.id },
                  })
                }
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
            </PermissionGuard>
          
          </>
          )}

        {data.applicationStatus === 'submitted' && (
          <PermissionGuard
            module="loan"
            permission="write"
            fallback={<></>}
          >
            <button
              type="button"
              disabled={statusUpdating}
              onClick={() => updateStatus('under_review')}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {statusUpdating ? 'Updating...' : 'Move to Under Review'}
            </button>
          </PermissionGuard>
        )}

        {data.applicationStatus === 'under_review' && (
          <PermissionGuard
            module="loan"
            permission="write"
            fallback={<></>}
          >
            <button
              type="button"
              disabled={statusUpdating}
              onClick={() => {
                setSanctionAmount(String(data.loanAmount));
                setSanctionDate(new Date().toISOString().slice(0, 10));
                setSanctionRemarks('');
                setShowApproveModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
            >
              {statusUpdating ? 'Approving...' : 'Approve'}
            </button>
            <button
              type="button"
              disabled={statusUpdating}
              onClick={() => setShowRejectModal(true)}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
            >
              Reject
            </button>
          </PermissionGuard>
        )}
        {existingLoanAccount ? (
          <PermissionGuard module="loan" permission="read" fallback={<></>}>
            <button
              type="button"
              onClick={viewLoanAccount}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <CreditCard className="h-4 w-4" />
              View Loan Account
            </button>
          </PermissionGuard>
        ) : data.applicationStatus === 'approved' &&
          data.sanctionStatus === 'approved' && !hasValidLoanTerms(data) ? (
            <PermissionGuard module="loan" permission="write" fallback={<></>}>
              <button
                type="button"
                disabled={savingLoanTerms}
                onClick={openLoanTermsForm}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CreditCard className="h-4 w-4" />
                Enter Loan Terms
              </button>
            </PermissionGuard>
          ) : data.applicationStatus === 'approved' &&
          data.sanctionStatus === 'approved' && (
            <PermissionGuard
              module="loan"
              permission="write"
              fallback={<></>}
            >
              <button
                type="button"
                disabled={creatingLoanAccount}
                onClick={() => void createLoanAccount()}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CreditCard className="h-4 w-4" />
                {creatingLoanAccount
                  ? 'Creating Account...'
                  : 'Create Loan Account'}
              </button>
            </PermissionGuard>
          )}
          {back}
        </div>
        {loanAccountMessage && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {loanAccountMessage}
          </div>
        )}
      </div>

      {showLoanTermsForm && (
        <form
          onSubmit={saveLoanTerms}
          className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm dark:border-blue-900 dark:bg-blue-950/20 sm:p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Loan Financial Terms</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">These agreed terms are required before the loan account can be created.</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Interest Rate *
              <input type="number" required min="0" step="0.0001" value={loanTerms.interestRate} onChange={(event) => setLoanTerms((current) => ({ ...current, interestRate: event.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Tenure *
              <input type="number" required min="1" step="1" value={loanTerms.tenure} onChange={(event) => setLoanTerms((current) => ({ ...current, tenure: event.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Repayment Frequency *
              <select value={loanTerms.repaymentFrequency} onChange={(event) => setLoanTerms((current) => ({ ...current, repaymentFrequency: event.target.value as typeof current.repaymentFrequency }))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                <option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option>
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">EMI Amount *
              <input type="number" required min="0.01" step="0.01" value={loanTerms.emiAmount} onChange={(event) => setLoanTerms((current) => ({ ...current, emiAmount: event.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Sanction Amount
              <input readOnly value={money(data.sanctionAmount)} className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300" />
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Sanction Date
              <input readOnly value={date(data.sanctionDate)} className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300" />
            </label>
          </div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" disabled={savingLoanTerms} onClick={() => setShowLoanTermsForm(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 dark:border-gray-600 dark:text-gray-200">Cancel</button>
            <button type="submit" disabled={savingLoanTerms} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{savingLoanTerms ? 'Saving Terms...' : 'Save Terms'}</button>
          </div>
        </form>
      )}

      <Card icon={<FileText className="h-5 w-5" />} title="Application Information">
        <Grid>
          <Item label="Application Number">
            <span className="font-mono">{show(data.applicationNumber)}</span>
          </Item>
          <Item label="Application Date">{date(data.applicationDate)}</Item>
          <Item label="Application Status">
            <Badge status={data.applicationStatus} />
          </Item>
          <Item label="Document Verification">
            <Badge status={data.documentVerificationStatus} />
          </Item>
          <Item label="Sanction Status">
            <Badge status={data.sanctionStatus} />
          </Item>
          <Item label="Top Up">{yesNo(data.isTopUp)}</Item>
          <Item label="Created On">{date(detail.createdAt)}</Item>
          <Item label="Modified On">{date(detail.updatedAt)}</Item>
        </Grid>
      </Card>

      <Card icon={<Building className="h-5 w-5" />} title="Client & Assignment">
        <Grid>
          <Item label="Client">
            {data.clientCode
              ? `${data.clientCode} - ${name(data.firstName, data.lastName)}`
              : NA}
          </Item>
          <Item label="Branch">
            {data.branchName
              ? `${data.branchCode} - ${data.branchName}`
              : NA}
          </Item>
          <Item label="Center">
            {data.centerName
              ? `${data.centerCode} - ${data.centerName}`
              : NA}
          </Item>
          <Item label="Field Officer">
            {name(data.officerFirstName, data.officerLastName)}
          </Item>
        </Grid>
      </Card>

      <Card icon={<User className="h-5 w-5" />} title="Customer & KYC (Client Master)">
        <Grid>
          <Item label="Aadhaar">{show(data.aadhaarNumber)}</Item>
          <Item label="Voter ID">{show(data.voterId)}</Item>
          <Item label="Other ID Type">{show(data.kycType)}</Item>
          <Item label="Other ID Number">{show(data.kycId)}</Item>
          <Item label="Date of Birth">{date(data.dateOfBirth)}</Item>
          <Item label="Age">{show(data.age)}</Item>
          <Item label="Gender">{show(data.gender)}</Item>
          <Item label="Father's Name">{show(data.fatherName)}</Item>
          <Item label="Mother's Name">{show(data.motherName)}</Item>
          <Item label="Mobile Number">{show(data.mobileNumber)}</Item>
          <Item label="Marital Status">{show(data.maritalStatus)}</Item>
          <Item label="Caste">{show(data.caste)}</Item>
          <Item label="Preferred Language">{show(data.preferredLanguage)}</Item>
          <Item label="Qualification">{show(data.qualification)}</Item>
          <Item label="Occupation">{show(data.occupation)}</Item>
          <Item label="Religion">{show(data.religion)}</Item>
          <Item label="Agricultural Land">{show(data.agriculturalLand)}</Item>
        </Grid>
      </Card>

      <Card icon={<DollarSign className="h-5 w-5" />} title="Loan Details">
        <Grid>
          <Item label="Product Group">{show(data.productGroupName)}</Item>
          <Item label="Product">{show(data.productName)}</Item>
          <Item label="Purpose">{show(data.purposeName)}</Item>
          <Item label="Sub Purpose">{show(data.subPurposeName)}</Item>
          <Item label="Loan Amount">{money(data.loanAmount)}</Item>
          <Item label="EMI Amount">{money(data.emiAmount)}</Item>
          <Item label="Interest Rate">
            {data.interestRate == null ? NA : `${Number(data.interestRate)}%`}
          </Item>
          <Item label="Tenure">{show(data.tenure)}</Item>
          <Item label="Repayment Frequency">
            <span className="capitalize">{show(data.repaymentFrequency)}</span>
          </Item>
        </Grid>
        <div className="mt-4">
          <Item label="Remarks">
            <span className="whitespace-pre-wrap">{show(data.remarks)}</span>
          </Item>
        </div>
      </Card>

      <Card
        icon={<DollarSign className="h-5 w-5" />}
        title="Financial Assessment (Client Master)"
      >
        <Grid>
          <Item label="Annual Income">{money(data.annualIncome)}</Item>
          <Item label="Monthly Income">{money(data.monthlyIncome)}</Item>
          <Item label="Monthly Expenses">{money(data.monthlyExpense)}</Item>
          <Item label="Existing EMI Obligation">
            {money(data.monthlyObligation)}
          </Item>
          <Item label="Household Income">{money(data.householdIncome)}</Item>
        </Grid>
      </Card>

      <Card icon={<Home className="h-5 w-5" />} title="Address Details">
        {addresses.length ? (
          <div className="space-y-3">
            {addresses.map((a, i) => (
              <SubCard key={a.id ?? i}>
                <Grid>
                  <Item label="Address Type">
                    <span className="capitalize">{show(a.addressType)}</span>
                  </Item>
                  <Item label="Address Line 1">{show(a.address1)}</Item>
                  <Item label="Address Line 2">{show(a.address2)}</Item>
                  <Item label="Mohalla">{show(a.mohalla)}</Item>
                  <Item label="Post Office">{show(a.postOffice)}</Item>
                  <Item label="Nearest Police Station">
                    {show(a.nearestPoliceStation)}
                  </Item>
                  <Item label="Village">{show(a.villageName)}</Item>
                  <Item label="District">{show(a.districtName)}</Item>
                  <Item label="State">{show(a.state)}</Item>
                  <Item label="Pincode">{show(a.pincode)}</Item>
                  <Item label="Residence Type">{show(a.residenceType)}</Item>
                </Grid>
              </SubCard>
            ))}
          </div>
        ) : (
          <Empty text="No addresses recorded." />
        )}
      </Card>

      <Card icon={<Users className="h-5 w-5" />} title="Family Members">
        {family.length ? (
          <div className="space-y-3">
            {family.map((m, i) => (
              <SubCard key={m.id ?? i}>
                <Grid>
                  <Item label="Name">{name(m.firstName, m.lastName)}</Item>
                  <Item label="Relation">{show(m.relation)}</Item>
                  <Item label="Mobile">{show(m.mobileNumber)}</Item>
                  <Item label="Date of Birth">{date(m.dateOfBirth)}</Item>
                  <Item label="ID Type">{show(m.idType)}</Item>
                  <Item label="ID Number">{show(m.idNumber)}</Item>
                  <Item label="Additional ID Type">
                    {show(m.additionalIdType)}
                  </Item>
                  <Item label="Additional ID Number">
                    {show(m.additionalIdNumber)}
                  </Item>
                  <Item label="Marital Status">{show(m.maritalStatus)}</Item>
                  <Item label="Employment Status">
                    {show(m.employmentStatus)}
                  </Item>
                  <Item label="Qualification">{show(m.qualification)}</Item>
                  <Item label="Occupation">{show(m.occupation)}</Item>
                  <Item label="Occupation Type">
                    {show(m.occupationType)}
                  </Item>
                  <Item label="Roles">
                    {[
                      m.isNominee && 'Nominee',
                      m.isCoApplicant && 'Co-applicant',
                      m.isGuarantor && 'Guarantor',
                      m.considerForAssessment && 'Considered for assessment',
                    ]
                      .filter(Boolean)
                      .join(', ') || NA}
                  </Item>
                </Grid>
              </SubCard>
            ))}
          </div>
        ) : (
          <Empty text="No family members recorded." />
        )}
      </Card>

      <Card icon={<CreditCard className="h-5 w-5" />} title="Bank Accounts">
        {banks.length ? (
          <div className="space-y-3">
            {banks.map((b, i) => (
              <SubCard key={b.id ?? i}>
                <Grid>
                  <Item label="Account Type">{show(b.accountType)}</Item>
                  <Item label="Account Number">
                    <span className="font-mono">
                      {maskAccount(b.accountNumber)}
                    </span>
                  </Item>
                  <Item label="Account Holder">
                    {show(b.customerName)}
                  </Item>
                  <Item label="IFSC">
                    {b.ifscCode
                      ? `${b.ifscCode} - ${show(b.bankName)}`
                      : NA}
                  </Item>
                  <Item label="Bank Branch">{show(b.bankBranch)}</Item>
                  <Item label="For Disbursement">
                    {yesNo(b.forDisbursement)}
                  </Item>
                  <Item label="For Collection">
                    {yesNo(b.forCollection)}
                  </Item>
                  <Item label="Name Match">
                    {b.nameMatchPercentage == null
                      ? NA
                      : `${Number(b.nameMatchPercentage)}%`}
                  </Item>
                  <Item label="Penny Drop Done">
                    {yesNo(b.pennyDropDone)}
                  </Item>
                </Grid>
              </SubCard>
            ))}
          </div>
        ) : (
          <Empty text="No bank accounts recorded." />
        )}
      </Card>
      {/* =======================================================
        FIELD VERIFICATION
      ======================================================= */}

      <Card
        icon={<ClipboardCheck className="h-5 w-5" />}
        title="Field Verification"
      >
        {phase5Error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {phase5Error}
          </div>
        )}

        {phase5Success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {phase5Success}
          </div>
        )}

        {data.applicationStatus !== 'under_review' ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            Field verification can be recorded only when the application is under review.
          </div>
        ) : fieldVerifications.length === 0 || showVerificationForm ?(
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
              Record Field Verification
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

            {/* Field Officer */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Field Officer
              </label>

              <select
                value={verificationForm.fieldOfficerId}
                onChange={(e) =>
                  setVerificationForm((current) => ({
                    ...current,
                  fieldOfficerId: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Field Officer</option>

              {fieldOfficers.map((officer) => (
                <option key={officer.id} value={officer.id}>
                  {[
                    officer.employee_id,
                    officer.first_name,
                    officer.last_name,
                  ]
                    .filter(Boolean)
                    .join(' - ')}
                </option>
              ))}
            </select>
          </div>

          {/* Visit Date */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Verification Date
            </label>

            <input
              type="date"
              value={verificationForm.visitDate}
              onChange={(e) =>
                setVerificationForm((current) => ({
                  ...current,
                  visitDate: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Visit Location */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Visit Location
            </label>

            <input
              type="text"
              value={verificationForm.visitLocation ?? ''}
              onChange={(e) =>
                setVerificationForm((current) => ({
                  ...current,
                  visitLocation: e.target.value,
                }))
              }
              placeholder="Enter visit location"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Verification Result */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Verification Result
            </label>

            <select
              value={verificationForm.verificationResult}
              onChange={(e) =>
                setVerificationForm((current) => ({
                  ...current,
                  verificationResult:
                    e.target.value as
                      | 'positive'
                      | 'negative'
                      | 'inconclusive',
                }))
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="inconclusive">Inconclusive</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
            </select>
          </div>
        </div>

        {/* Verification Checks */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <input
              type="checkbox"
              checked={verificationForm.applicantMet}
              onChange={(e) =>
                setVerificationForm((current) => ({
                  ...current,
                  applicantMet: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Applicant Met
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <input
              type="checkbox"
              checked={verificationForm.businessVerified}
              onChange={(e) =>
                setVerificationForm((current) => ({
                  ...current,
                  businessVerified: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Business Verified
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <input
              type="checkbox"
              checked={verificationForm.residenceVerified}
              onChange={(e) =>
                setVerificationForm((current) => ({
                  ...current,
                  residenceVerified: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Residence Verified
            </span>
          </label>
        </div>

        {/* Findings */}
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Findings
          </label>

          <textarea
            rows={3}
            value={verificationForm.findings ?? ''}
            onChange={(e) =>
              setVerificationForm((current) => ({
                ...current,
                findings: e.target.value,
              }))
            }
            placeholder="Enter field verification findings"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Remarks */}
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Remarks
          </label>

          <textarea
            rows={3}
            value={verificationForm.remarks ?? ''}
            onChange={(e) =>
              setVerificationForm((current) => ({
                ...current,
                remarks: e.target.value,
              }))
            }
            placeholder="Enter remarks"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          {fieldVerifications.length > 0 && (
            <button
              type="button"
              onClick={() => setShowVerificationForm(false)}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            disabled={phase5Saving}
            onClick={() => void saveFieldVerification()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {phase5Saving ? 'Saving...' : 'Save Verification'}
          </button>
        </div>
      </div>
    ) : (
      <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-green-800">
          Field verification completed
        </p>
        <p className="mt-1 text-sm text-green-700">
          The application already has a field verification record.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowVerificationForm(true)}
        className="rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
      >
        Add New Verification
      </button>
    </div>
  </div>

    )}

    {/* Verification History */}
    <div className="mt-6">
      <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
        Verification History
      </h3>

      {phase5Loading ? (
        <p className="text-sm text-gray-500">
          Loading verification history...
        </p>
      ) : fieldVerifications.length ? (
        <div className="space-y-3">
          {fieldVerifications.map((verification) => (
            <SubCard key={verification.id}>
              <Grid>
                <Item label="Field Officer">
                  {name(
                    verification.officer_first_name,
                    verification.officer_last_name,
                  )}
                </Item>

                <Item label="Verification Date">
                  {date(verification.visit_date)}
                </Item>

                <Item label="Visit Location">
                  {show(verification.visit_location)}
                </Item>

                <Item label="Applicant Met">
                  {yesNo(verification.applicant_met)}
                </Item>

                <Item label="Business Verified">
                  {yesNo(verification.business_verified)}
                </Item>

                <Item label="Residence Verified">
                  {yesNo(verification.residence_verified)}
                </Item>

                <Item label="Result">
                  <Badge status={verification.verification_result} />
                </Item>

                <Item label="Findings">
                  <span className="whitespace-pre-wrap">
                    {show(verification.findings)}
                  </span>
                </Item>

                <Item label="Remarks">
                  <span className="whitespace-pre-wrap">
                    {show(verification.remarks)}
                  </span>
                </Item>
              </Grid>
            </SubCard>
          ))}
        </div>
      ) : (
        <Empty text="No field verification records." />
      )}
    </div>
  </Card>
  <Card
  icon={<Calculator className="h-5 w-5" />}
  title="Applicant Assessment"
>
  <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
    <h3 className="mb-3 text-sm font-semibold text-blue-900 dark:text-blue-200">
      Client Financial Information
    </h3>

    <Grid>
      <Item label="Client Monthly Income">
        {money(data.monthlyIncome)}
      </Item>

      <Item label="Client Monthly Expenses">
        {money(data.monthlyExpense)}
      </Item>

      <Item label="Existing Obligation">
        {money(data.monthlyObligation)}
      </Item>

      <Item label="Client Household Income">
        {money(data.householdIncome)}
      </Item>
    </Grid>
  </div>

  {data.applicationStatus !== 'under_review' ? (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
      Applicant assessment can be recorded only when the application is under review.
    </div>
  ) : assessments.length === 0 || showAssessmentForm ? (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">

      <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
        New Assessment
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Monthly Income
          </label>

          <input
            type="number"
            min="0"
            value={assessmentForm.monthlyIncome ?? ''}
            onChange={(e) =>
              setAssessmentForm((current) => ({
                ...current,
                monthlyIncome:
                  e.target.value === ''
                    ? null
                    : Number(e.target.value),
              }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Monthly Expenses
          </label>

          <input
            type="number"
            min="0"
            value={assessmentForm.monthlyExpenses ?? ''}
            onChange={(e) =>
              setAssessmentForm((current) => ({
                ...current,
                monthlyExpenses:
                  e.target.value === ''
                    ? null
                    : Number(e.target.value),
              }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Existing Obligations
          </label>

          <input
            type="number"
            min="0"
            value={assessmentForm.existingObligations ?? ''}
            onChange={(e) =>
              setAssessmentForm((current) => ({
                ...current,
                existingObligations:
                  e.target.value === ''
                    ? null
                    : Number(e.target.value),
              }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Household Income
          </label>

          <input
            type="number"
            min="0"
            value={assessmentForm.householdIncome ?? ''}
            onChange={(e) =>
              setAssessmentForm((current) => ({
                ...current,
                householdIncome:
                  e.target.value === ''
                    ? null
                    : Number(e.target.value),
              }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Household Expenses
          </label>

          <input
            type="number"
            min="0"
            value={assessmentForm.householdExpenses ?? ''}
            onChange={(e) =>
              setAssessmentForm((current) => ({
                ...current,
                householdExpenses:
                  e.target.value === ''
                    ? null
                    : Number(e.target.value),
              }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recommended Loan Amount
          </label>

          <input
            type="number"
            min="0"
            value={assessmentForm.recommendedLoanAmount ?? ''}
            onChange={(e) =>
              setAssessmentForm((current) => ({
                ...current,
                recommendedLoanAmount:
                  e.target.value === ''
                    ? null
                    : Number(e.target.value),
              }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recommended EMI
          </label>

          <input
            type="number"
            min="0"
            value={assessmentForm.recommendedEmi ?? ''}
            onChange={(e) =>
              setAssessmentForm((current) => ({
                ...current,
                recommendedEmi:
                  e.target.value === ''
                    ? null
                    : Number(e.target.value),
              }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Calculated Net Income */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
          <p className="text-xs font-medium uppercase tracking-wide text-green-700 dark:text-green-300">
            Net Monthly Income
          </p>

          <p className="mt-1 text-lg font-semibold text-green-800 dark:text-green-200">
            {money(calculatedNetIncome)}
          </p>
        </div>

        {/* Calculated Repayment Capacity */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
            Repayment Capacity
          </p>

          <p className="mt-1 text-lg font-semibold text-blue-800 dark:text-blue-200">
            {money(calculatedRepaymentCapacity)}
          </p>
        </div>
      </div>

      {/* Assessment Result */}
      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Assessment Result
        </label>

        <select
          value={assessmentForm.assessmentResult}
          onChange={(e) =>
            setAssessmentForm((current) => ({
              ...current,
              assessmentResult:
                e.target.value as
                  | 'positive'
                  | 'negative'
                  | 'inconclusive',
            }))
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="inconclusive">Inconclusive</option>
          <option value="positive">Positive</option>
          <option value="negative">Negative</option>
        </select>
      </div>

      {/* Assessment Remarks */}
      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Assessment Remarks
        </label>

        <textarea
          rows={3}
          value={assessmentForm.assessmentRemarks ?? ''}
          onChange={(e) =>
            setAssessmentForm((current) => ({
              ...current,
              assessmentRemarks: e.target.value,
            }))
          }
          placeholder="Enter assessment remarks"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        {assessments.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAssessmentForm(false)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        )}

        <button
          type="button"
          disabled={phase5Saving}
          onClick={() => void saveAssessment()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
            {phase5Saving ? 'Saving...' : 'Save Assessment'}
        </button>
      </div>
    </div>
  ) : (
    <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-green-800">
          Applicant assessment completed
        </p>

        <p className="mt-1 text-sm text-green-700">
          An applicant assessment has already been completed for this application.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowAssessmentForm(true)}
        className="rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
      >
        Reassess
      </button>
    </div>
  </div>
  )}

  {/* Assessment History */}
  <div className="mt-6">
    <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
      Assessment History
    </h3>

    {assessments.length ? (
      <div className="space-y-3">
        {assessments.map((assessment) => (
          <SubCard key={assessment.id}>
            <Grid>
              <Item label="Assessed By">
                {name(
                  assessment.assessor_first_name,
                  assessment.assessor_last_name,
                )}
              </Item>

              <Item label="Assessed On">
                {date(assessment.assessed_at)}
              </Item>

              <Item label="Monthly Income">
                {money(assessment.monthly_income)}
              </Item>

              <Item label="Monthly Expenses">
                {money(assessment.monthly_expenses)}
              </Item>

              <Item label="Existing Obligations">
                {money(assessment.existing_obligations)}
              </Item>

              <Item label="Household Income">
                {money(assessment.household_income)}
              </Item>

              <Item label="Household Expenses">
                {money(assessment.household_expenses)}
              </Item>

              <Item label="Net Monthly Income">
                {money(assessment.net_monthly_income)}
              </Item>

              <Item label="Repayment Capacity">
                {money(assessment.repayment_capacity)}
              </Item>

              <Item label="Recommended Loan Amount">
                {money(assessment.recommended_loan_amount)}
              </Item>

              <Item label="Recommended EMI">
                {money(assessment.recommended_emi)}
              </Item>

              <Item label="Assessment Result">
                <Badge status={assessment.assessment_result} />
              </Item>

              <Item label="Remarks">
                <span className="whitespace-pre-wrap">
                  {show(assessment.assessment_remarks)}
                </span>
              </Item>
            </Grid>
          </SubCard>
        ))}
      </div>
    ) : (
      <Empty text="No applicant assessment records." />
    )}
    </div>
  </Card>

      <Card icon={<User className="h-5 w-5" />} title="Document Records">
        {documentError && (
          <p
            role="alert"
            className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {documentError}
          </p>
        )}

        {documents.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {[
                    'Document Type',
                    'File Name',
                    'Verification Status',
                    'Uploaded',
                    'Action',
                  ].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {documents.map((d, i) => (
                  <tr key={d.id ?? i}>
                    <td className="px-4 py-3 text-sm">
                      {show(d.documentType)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {show(d.fileName)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={d.verificationStatus} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {date(d.uploadedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={
                            !d.id ||
                            downloadingDocumentId === d.id
                          }
                          onClick={() =>
                            d.id &&
                            void openDocument(d.id, d.fileName)
                          }
                          className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50 disabled:opacity-50 dark:border-gray-600 dark:text-blue-300"
                        >
                          <Download className="h-4 w-4" />

                          {downloadingDocumentId === d.id
                            ? 'Loading…'
                            : 'Download'}
                        </button>

                        {d.id &&
                          d.verificationStatus !== 'verified' && (
                            <PermissionGuard
                              module="loan"
                              permission="write"
                              fallback={<></>}
                            >
                              <button
                                type="button"
                                disabled={
                                  verifyingDocumentId === d.id
                                }
                                onClick={() =>
                                  void verifyDocument(
                                    d.id!,
                                    'verified',
                                  )
                                }
                                className="inline-flex items-center whitespace-nowrap rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                              >
                                {verifyingDocumentId === d.id
                                  ? 'Saving...'
                                  : 'Verify'}
                              </button>

                              <button
                                type="button"
                                disabled={
                                  verifyingDocumentId === d.id
                                }
                                onClick={() => {
                                  setDocumentToReject(d.id);
                                  setDocumentRejectionReason('');
                                  setShowDocumentRejectModal(true);
                                }}
                                  className="inline-flex items-center whitespace-nowrap rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </PermissionGuard>
                          )}
                        </div>

                        {d.verificationStatus === 'rejected' &&
                          d.rejectionReason && (
                            <p className="mt-2 max-w-md text-xs text-red-600 dark:text-red-400">
                              Reason: {d.rejectionReason}
                            </p>
                          )}
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty text="No document records." />
        )}
      </Card>
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Approve Loan Application</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Enter the sanctioned amount and approval date.</p>
            <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Sanction Amount
              <input type="number" min="0.01" max={data.loanAmount} step="0.01" value={sanctionAmount} onChange={(event) => setSanctionAmount(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </label>
            <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Sanction Date
              <input type="date" value={sanctionDate} onChange={(event) => setSanctionDate(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </label>
            <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Remarks (optional)
              <textarea value={sanctionRemarks} onChange={(event) => setSanctionRemarks(event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" disabled={statusUpdating} onClick={() => setShowApproveModal(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
              <button type="button" disabled={statusUpdating || !sanctionAmount || Number(sanctionAmount) <= 0 || Number(sanctionAmount) > data.loanAmount || !sanctionDate} 
              onClick={async () => {
                const success = await updateStatus('approved', { sanctionAmount: Number(sanctionAmount), sanctionDate, sanctionRemarks: sanctionRemarks.trim() || undefined });
                if(success){
                  setShowApproveModal(false);
                }
              }} className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50">{statusUpdating ? 'Approving...' : 'Confirm Approval'}</button>
            </div>
          </div>
        </div>
      )}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reject Loan Application
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Please provide a reason for rejecting this application.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Enter rejection reason..."
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                disabled={statusUpdating}
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={statusUpdating || !rejectionReason.trim()}
                onClick={async () => {
                  const success = await updateStatus(
                    'rejected',
                    { 
                      rejectionReason: rejectionReason.trim(),
                      rejectionRemarks: rejectionRemarks.trim() || undefined, },
                  );

                  if (success){
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setRejectionRemarks('');
                  }
                  
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                {statusUpdating ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showDocumentRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reject Document
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Please provide a reason for rejecting this document.
            </p>

            <textarea
              value={documentRejectionReason}
              onChange={(e) =>
                setDocumentRejectionReason(e.target.value)
              }
              rows={4}
              className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Enter document rejection reason..."
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                disabled={Boolean(verifyingDocumentId)}
                onClick={() => {
                  setShowDocumentRejectModal(false);
                  setDocumentToReject(undefined);
                  setDocumentRejectionReason('');
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  Boolean(verifyingDocumentId) ||
                  !documentRejectionReason.trim() ||
                  !documentToReject
                }
                onClick={() => {
                  if (!documentToReject) return;

                  void verifyDocument(
                    documentToReject,
                    'rejected',
                    documentRejectionReason.trim(),
                  );
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                {verifyingDocumentId
                  ? 'Rejecting...'
                  : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const LoanApplicationDetails: React.FC = () => (
  <PermissionGuard module="loan" permission="read">
    <LoanApplicationDetailsContent />
  </PermissionGuard>
);
