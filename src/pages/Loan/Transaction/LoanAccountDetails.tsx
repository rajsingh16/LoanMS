import React, { useEffect, useState } from 'react';
import { ArrowLeft, Building2, CalendarDays, CreditCard, UserRound, Plus, CheckCircle2, XCircle, Ban } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LoanAccountDetail,
  loanAccountService,
} from '../../../services/transactionService/loanApplicationService';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';

const money = (value: number | string | null | undefined) =>
  `₹${Number(value ?? 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;

const date = (value?: string | null) =>
  value ? value.slice(0, 10) : '—';


const statusClass = (status: string) => {
  if (['active', 'fully_disbursed', 'completed'].includes(status)) {
    return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
  }
  if (['closed'].includes(status)) {
    return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
  }
  if (['cancelled', 'failed', 'rejected'].includes(status)) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
  }
  if (status === 'partially_disbursed') {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
  }
  return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
};

function Badge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(value)}`}
    >
      {value.replace(/_/g, ' ')}
    </span>
  );
}

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 text-base font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <div className="mt-1 break-words text-sm font-medium text-gray-900 dark:text-gray-100">
        {value ?? '—'}
      </div>
    </div>
  );
}

export const LoanAccountDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [account, setAccount] = useState<LoanAccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDisbursementForm, setShowDisbursementForm] = useState(false);
  const [savingDisbursement, setSavingDisbursement] = useState(false);
  const [updatingDisbursementId, setUpdatingDisbursementId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [disbursementForm, setDisbursementForm] = useState({ disbursementDate: new Date().toLocaleDateString('en-CA'), disbursementAmount: '', disbursementMode: 'neft' as | 'bank_transfer' | 'neft' | 'rtgs' | 'imps' | 'cheque' | 'other', bankAccountId: '', referenceNumber: '', remarks: '',});
  const refreshAccount = async ()=> {
    if (!id) return;
    const result = await loanAccountService.getAccount(id);
    setAccount(result);
  };

    const handleCreateDisbursement = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (!id || !account) return;

        const amount = Number(disbursementForm.disbursementAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
        setActionError('Enter a valid disbursement amount.');
        return;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(
        disbursementForm.disbursementDate,
        )) {
        setActionError('Select a valid disbursement date.');
        return;
        }

        if (amount > Number(account.remaining_amount)) {
        setActionError(
            'The amount cannot exceed the remaining amount to disburse.',
        );
        return;
        }

        try {
        setSavingDisbursement(true);
        setActionError('');
        setActionSuccess('');

        await loanAccountService.createDisbursement(id, {
            disbursementDate: disbursementForm.disbursementDate,
            disbursementAmount: amount,
            disbursementMode: disbursementForm.disbursementMode,
            bankAccountId: disbursementForm.bankAccountId || null,
            referenceNumber:
            disbursementForm.referenceNumber.trim() || undefined,
            remarks: disbursementForm.remarks.trim() || undefined,
        });

        await refreshAccount();

        setDisbursementForm({
            disbursementDate: new Date().toLocaleDateString('en-CA'),
            disbursementAmount: '',
            disbursementMode: 'neft',
            bankAccountId: '',
            referenceNumber: '',
            remarks: '',
        });

        setShowDisbursementForm(false);
        setActionSuccess(
            'Disbursement recorded successfully with pending status.',
        );
        } catch (err) {
        setActionError(
            err instanceof Error
            ? err.message
            : 'Unable to record disbursement.',
        );
        } finally {
        setSavingDisbursement(false);
        }
    };

    const handleDisbursementStatus = async (
        disbursementId: string,
        status: 'completed' | 'failed' | 'cancelled',
    ) => {
        if (!id) return;

        const actionLabel = status.replace('_', ' ');

        if (
        !window.confirm(
            `Are you sure you want to mark this disbursement as ${actionLabel}?`,
        )
        ) {
        return;
        }

        try {
        setUpdatingDisbursementId(disbursementId);
        setActionError('');
        setActionSuccess('');

        await loanAccountService.updateDisbursementStatus(
            id,
            disbursementId,
            status,
        );

        await refreshAccount();

        setActionSuccess(
            `Disbursement marked as ${actionLabel}.`,
        );
        } catch (err) {
        setActionError(
            err instanceof Error
            ? err.message
            : 'Unable to update disbursement.',
        );
        } finally {
        setUpdatingDisbursementId(null);
        }
    };




  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!id || id === 'undefined' || id === 'null') {
        setError('Loan account ID is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const result = await loanAccountService.getAccount(id);
        if (active) setAccount(result);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load loan account',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    
  
    void load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Loading loan account details…
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <button
          type="button"
          onClick={() => navigate('/loan/transaction/accounts')}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Loan Accounts
        </button>
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          {error || 'Loan account not found.'}
        </div>
      </div>
    );
  }

  const clientName = [
    account.client_first_name,
    account.client_last_name,
  ]
    .filter(Boolean)
    .join(' ') || '—';

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/loan/transaction/accounts')}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Loan Accounts
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-semibold text-gray-900 dark:text-white">
              {account.loan_account_number}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Application: {account.application_number}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge value={account.loan_status} />
            <Badge value={account.disbursement_status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sanctioned amount
          </p>
          <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
            {money(account.sanction_amount)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total disbursed
          </p>
          <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
            {money(account.total_disbursed)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Remaining to disburse
          </p>
          <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
            {money(account.remaining_amount)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            EMI amount
          </p>
          <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
            {money(account.emi_amount)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <InfoCard title="Client Information" icon={<UserRound className="h-5 w-5 text-blue-600" />}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Client name" value={clientName} />
            <Field label="Client code" value={account.client_code} />
            <Field label="Application number" value={account.application_number} />
            <Field label="Application date" value={date(account.application_date)} />
            <Field label="Application status" value={<Badge value={account.application_status} />} />
            <Field label="Sanction status" value={<Badge value={account.sanction_status} />} />
          </div>
        </InfoCard>

        <InfoCard title="Branch & Product" icon={<Building2 className="h-5 w-5 text-blue-600" />}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Branch" value={`${account.branch_code} — ${account.branch_name}`} />
            <Field label="Center" value={`${account.center_code} — ${account.center_name}`} />
            <Field label="Product group" value={account.product_group_name} />
            <Field label="Product" value={account.product_name} />
          </div>
        </InfoCard>

        <InfoCard title="Loan Terms" icon={<CreditCard className="h-5 w-5 text-blue-600" />}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Loan account number" value={account.loan_account_number} />
            <Field label="Loan amount" value={money(account.loan_amount)} />
            <Field label="Sanction amount" value={money(account.sanction_amount)} />
            <Field label="Interest rate" value={`${Number(account.interest_rate).toLocaleString('en-IN')}%`} />
            <Field label="Tenure" value={`${account.tenure} periods`} />
            <Field label="Repayment frequency" value={account.repayment_frequency} />
            <Field label="EMI amount" value={money(account.emi_amount)} />
          </div>
        </InfoCard>

        <InfoCard title="Account Dates & Status" icon={<CalendarDays className="h-5 w-5 text-blue-600" />}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Sanction date" value={date(account.sanction_date)} />
            <Field label="Account created" value={date(account.created_at)} />
            <Field label="Last modified" value={date(account.updated_at)} />
            <Field label="Loan status" value={<Badge value={account.loan_status} />} />
            <Field label="Disbursement status" value={<Badge value={account.disbursement_status} />} />
          </div>
        </InfoCard>
      </div>
      

      {(actionError || actionSuccess) && (
        <div
            role={actionError ? 'alert' : 'status'}
            className={`rounded-lg border p-3 text-sm ${
            actionError
                ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300'
                : 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300'
            }`}
        >
            {actionError || actionSuccess}
        </div>
        )}

        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Loan Disbursement
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Remaining amount: {money(account.remaining_amount)}
            </p>
            </div>

            <PermissionGuard module="loan" permission="write" fallback={<></>}>
            <button
            type="button"
            disabled={
                Number(account.remaining_amount) <= 0 ||
                ['closed', 'cancelled'].includes(account.loan_status)
            }
            onClick={() => {
                setActionError('');
                setActionSuccess('');
                setShowDisbursementForm((current) => !current);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
            <Plus className="h-4 w-4" />
            Record Disbursement
            </button>
            </PermissionGuard>
        </div>

        {showDisbursementForm && (
            <form
            onSubmit={handleCreateDisbursement}
            className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-200 pt-5 sm:grid-cols-2 dark:border-gray-700"
            >
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Disbursement Date *
                </label>
                <input
                type="date"
                required
                value={disbursementForm.disbursementDate}
                onChange={(event) =>
                    setDisbursementForm((form) => ({
                    ...form,
                    disbursementDate: event.target.value,
                    }))
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Amount *
                </label>
                <input
                type="number"
                required
                min="0.01"
                max={Number(account.remaining_amount)}
                step="0.01"
                value={disbursementForm.disbursementAmount}
                onChange={(event) =>
                    setDisbursementForm((form) => ({
                    ...form,
                    disbursementAmount: event.target.value,
                    }))
                }
                placeholder="Enter amount"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Disbursement Mode *
                </label>
                <select
                required
                value={disbursementForm.disbursementMode}
                onChange={(event) =>
                    setDisbursementForm((form) => ({
                    ...form,
                    disbursementMode: event.target.value as typeof form.disbursementMode,
                    }))
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="neft">NEFT</option>
                <option value="rtgs">RTGS</option>
                <option value="imps">IMPS</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
                </select>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Disbursement Bank Account
                </label>
                <select
                value={disbursementForm.bankAccountId}
                onChange={(event) =>
                    setDisbursementForm((form) => ({
                    ...form,
                    bankAccountId: event.target.value,
                    }))
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                >
                <option value="">No linked bank account</option>
                {account.eligible_bank_accounts.map((bankAccount) => (
                    <option key={bankAccount.id} value={bankAccount.id}>
                    {bankAccount.account_type} — ••••{bankAccount.account_number.slice(-4)}
                    {bankAccount.customer_name ? ` (${bankAccount.customer_name})` : ''}
                    </option>
                ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                Only accounts marked for disbursement on this application are available.
                </p>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Reference Number
                </label>
                <input
                maxLength={200}
                value={disbursementForm.referenceNumber}
                onChange={(event) =>
                    setDisbursementForm((form) => ({
                    ...form,
                    referenceNumber: event.target.value,
                    }))
                }
                placeholder="Bank transaction reference"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Remarks
                </label>
                <input
                maxLength={2000}
                value={disbursementForm.remarks}
                onChange={(event) =>
                    setDisbursementForm((form) => ({
                    ...form,
                    remarks: event.target.value,
                    }))
                }
                placeholder="Optional remarks"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
                <button
                type="button"
                onClick={() => setShowDisbursementForm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                Cancel
                </button>

                <button
                type="submit"
                disabled={savingDisbursement}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                {savingDisbursement ? 'Saving...' : 'Save Disbursement'}
                </button>
            </div>
            </form>
        )}
        </section>


      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 p-4 sm:p-5 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Disbursement History
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Only completed disbursements contribute to the total disbursed amount.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[850px] w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Remarks</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {account.disbursements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    No disbursements have been recorded for this account.
                  </td>
                </tr>
              ) : (
                account.disbursements.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="whitespace-nowrap px-4 py-4">{date(item.disbursement_date)}</td>
                    <td className="whitespace-nowrap px-4 py-4 font-medium">{money(item.disbursement_amount)}</td>
                    <td className="px-4 py-4">{item.disbursement_mode.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-4">{item.reference_number || '—'}</td>
                    <td className="max-w-xs whitespace-normal px-4 py-4">{item.remarks || '—'}</td>
                    <td className="px-4 py-4"><Badge value={item.status} /></td>
                    
                    <td className="px-4 py-4">
                    {item.status === 'pending' ? (
                        <PermissionGuard module="loan" permission="write" fallback={<span className="text-xs text-gray-400">No actions</span>}>
                        <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            disabled={updatingDisbursementId === item.id}
                            onClick={() =>
                            void handleDisbursementStatus(item.id, 'completed')
                            }
                            title="Mark completed"
                            className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50 dark:bg-green-900/30 dark:text-green-300"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Complete
                        </button>

                        <button
                            type="button"
                            disabled={updatingDisbursementId === item.id}
                            onClick={() =>
                            void handleDisbursementStatus(item.id, 'failed')
                            }
                            title="Mark failed"
                            className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-300"
                        >
                            <XCircle className="h-3.5 w-3.5" />
                            Fail
                        </button>

                        <button
                            type="button"
                            disabled={updatingDisbursementId === item.id}
                            onClick={() =>
                            void handleDisbursementStatus(item.id, 'cancelled')
                            }
                            title="Cancel disbursement"
                            className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            <Ban className="h-3.5 w-3.5" />
                            Cancel
                        </button>
                        </div>
                        </PermissionGuard>
                    ) : (
                        <span className="text-xs text-gray-400">No actions</span>
                    )}

                    {updatingDisbursementId === item.id && (
                        <span className="mt-1 block text-xs text-gray-500">
                        Updating...
                        </span>
                    )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default LoanAccountDetails;
