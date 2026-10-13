
import React, { useCallback, useEffect, useState } from 'react';
import { Eye, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  LoanAccountListItem,
  loanAccountService,
} from '../../../services/transactionService/loanApplicationService';

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white';

const money = (value: number | string | null | undefined) =>
  `₹${Number(value ?? 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;

const date = (value?: string) =>
  value ? value.slice(0, 10) : '—';

const statusClass = (status: string) => {
  switch (status) {
    case 'active':
    case 'fully_disbursed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    case 'closed':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
    case 'cancelled':
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    case 'partially_disbursed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    default:
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
  }
};

function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(value)}`}
    >
      {value.replace(/_/g, ' ')}
    </span>
  );
}

export const LoanAccounts: React.FC = () => {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<LoanAccountListItem[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loanStatus, setLoanStatus] = useState('');
  const [disbursementStatus, setDisbursementStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await loanAccountService.getAccounts({
        search,
        loanStatus,
        disbursementStatus,
        page,
        limit,
      });

      setAccounts(result.data);
      setTotal(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load loan accounts',
      );
    } finally {
      setLoading(false);
    }
  }, [search, loanStatus, disbursementStatus, page, limit]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const applySearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setLoanStatus('');
    setDisbursementStatus('');
    setPage(1);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Loan Accounts
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage accounts created from approved loan applications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadAccounts()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Matching accounts
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {total}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Current page
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {totalPages ? page : 0} / {totalPages}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Accounts per page
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {limit}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-5">
        <form
          onSubmit={applySearch}
          className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"
        >
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search account, application or client"
              className={`${inputClass} pl-9`}
              aria-label="Search loan accounts"
            />
          </div>

          <select
            value={loanStatus}
            onChange={(event) => {
              setLoanStatus(event.target.value);
              setPage(1);
            }}
            className={inputClass}
            aria-label="Filter by loan status"
          >
            <option value="">All loan statuses</option>
            <option value="pending_disbursement">Pending disbursement</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={disbursementStatus}
            onChange={(event) => {
              setDisbursementStatus(event.target.value);
              setPage(1);
            }}
            className={inputClass}
            aria-label="Filter by disbursement status"
          >
            <option value="">All disbursement statuses</option>
            <option value="not_disbursed">Not disbursed</option>
            <option value="partially_disbursed">Partially disbursed</option>
            <option value="fully_disbursed">Fully disbursed</option>
          </select>

          <div className="flex flex-col gap-2 sm:flex-row md:col-span-2 xl:col-span-4">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Search
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Clear filters
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadAccounts()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Branch / Center</th>
                <th className="px-4 py-3">Loan amount</th>
                <th className="px-4 py-3">Disbursed</th>
                <th className="px-4 py-3">Remaining</th>
                <th className="px-4 py-3">Loan status</th>
                <th className="px-4 py-3">Disbursement</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    Loading loan accounts…
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    No loan accounts found.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/40"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {account.loan_account_number}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {account.application_number}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {[account.client_first_name, account.client_last_name]
                          .filter(Boolean)
                          .join(' ')}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {account.client_code}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-gray-800 dark:text-gray-200">
                        {account.branch_name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {account.center_name}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-medium">
                      {money(account.loan_amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      {money(account.total_disbursed)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      {money(account.remaining_amount)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge value={account.loan_status} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge value={account.disbursement_status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/loan/transaction/accounts/${account.id}`)
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoanAccounts;
