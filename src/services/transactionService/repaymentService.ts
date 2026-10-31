import { apiFetch } from '../../lib/api';

export interface ScheduleEligibility {
  eligible: boolean;
  missing: string[];
  blockers?: string[];
}

export interface RepaymentInstallment {
  id: string;
  installment_number: number;
  contractual_due_date: string;
  collection_due_date: string;
  scheduled_principal: string | number;
  scheduled_interest: string | number;
  scheduled_fees: string | number;
  scheduled_amount: string | number;
  principal_paid: string | number;
  interest_paid: string | number;
  fees_paid: string | number;
  payment_status: string;
}

export interface RepaymentSchedule {
  installments: RepaymentInstallment[];
  balance: Record<string, string | number>;
}
export interface RepaymentPayment {
  id: string;
  payment_date: string;
  amount: string | number;
  payment_method: string;
  reference_number?: string | null;
  status: 'posted' | 'reversed';
  reversal_reason?: string | null;
  allocations: Array<{ schedule_id: string; principal_amount: string | number; interest_amount: string | number; fees_amount: string | number }>;
}
export interface PaymentRequest { amount: string; paymentDate: string; paymentMethod: string; referenceNumber?: string; remarks?: string; idempotencyKey: string; }

async function jsonOrMessage(
  response: Response,
  fallback: string
) {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body?.error?.message ||
      body?.message ||
      fallback;

    console.error('Repayment API Error:', {
      status: response.status,
      url: response.url,
      message,
      body
    });

    throw new Error(message);
  }

  return body?.data;
}

function accountPath(accountId: string) {
  return `/api/repayments/accounts/${encodeURIComponent(accountId)}`;
}

export const repaymentService = {
  eligibility: async (accountId: string): Promise<ScheduleEligibility> =>
    jsonOrMessage(await apiFetch(`${accountPath(accountId)}/schedule-eligibility`), 'Failed to load schedule eligibility'),
  schedule: async (accountId: string): Promise<RepaymentSchedule> =>
    jsonOrMessage(await apiFetch(`${accountPath(accountId)}/schedule`), 'Failed to load repayment schedule'),
  generate: async (accountId: string): Promise<unknown> =>
    jsonOrMessage(await apiFetch(`${accountPath(accountId)}/schedule`, { method: 'POST' }), 'Failed to generate repayment schedule'),
  payments: async (accountId: string): Promise<RepaymentPayment[]> =>
    jsonOrMessage(await apiFetch(`${accountPath(accountId)}/payments`), 'Failed to load payment history'),
  postPayment: async (accountId: string, input: PaymentRequest): Promise<RepaymentPayment> =>
    jsonOrMessage(await apiFetch(`${accountPath(accountId)}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }), 'Failed to post payment'),
  reversePayment: async (paymentId: string, reason: string): Promise<RepaymentPayment> =>
    jsonOrMessage(await apiFetch(`/api/repayments/payments/${paymentId}/reverse`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) }), 'Failed to reverse payment'),
};
