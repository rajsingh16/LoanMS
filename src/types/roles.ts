export interface Role {
  id: string;
  role_name: string;
  role_code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  module: string;
  permission: string;
  granted_at: string;
}

export interface UserRole {
  user_id: string;
  role_code: string;
  assigned_at: string;
  assigned_by?: string;
}

// Predefined role codes for type safety
export const ROLE_CODES = {
  // Core roles
  ADMIN: 'admin',
  EXTERNAL_SANCTION: 'external_sanction',
  MIS: 'mis',
  RECEIPT_PAYMENT: 'receipt_payment',
  BYPASS_2FA: 'bypass_2fa',
  LOAN_WAIVER: 'loan_waiver',
  
  // Operational roles
  ROLE_SCV: 'role_scv',
  ROLE_BC: 'role_bc',
  ROLE_INSURANCE: 'role_insurance',
  ROLE_BM: 'role_bm',
  ROLE_HO: 'role_ho',
  ROLE_HR: 'role_hr',
  ROLE_ACCOUNTANT: 'role_accountant',
  ROLE_CHIEF_ACCOUNTANT: 'role_chief_accountant',
  
  // Financial roles
  ROLE_FUNDER_TAG: 'role_funder_tag',
  ROLE_VOUCHER_BOOKING: 'role_voucher_booking',
  ROLE_VOUCHER_APPROVAL: 'role_voucher_approval',
  ROLE_TDS: 'role_tds',
  ROLE_NEFT_DISB: 'role_neft_disb',
  
  // Field roles
  ROLE_FO: 'role_fo',
  ROLE_AUDITOR: 'role_auditor',
  ROLE_TELE_CALLER: 'role_tele_caller',
  
  // Report roles
  ROLE_BR_BOOK_DEBT: 'role_br_book_debt',
  ROLE_CREDIT_BUREAU_PAGE: 'role_credit_bureau_page',
  ROLE_BR_AGING: 'role_br_aging',
  ROLE_BR_DAILY_INFO: 'role_br_daily_info',
  ROLE_BR_DORMANT: 'role_br_dormant',
  ROLE_BR_FUTURE: 'role_br_future',
  ROLE_BR_GLANCE: 'role_br_glance',
  ROLE_BR_OVERDUE: 'role_br_overdue',
  ROLE_MISCELLANEOUS_RPT: 'role_miscellaneous_rpt',
  
  // System roles
  ROLE_LOS: 'role_los',
  ROLE_LOAN_HUB: 'role_loan_hub',
  ROLE_CLIENT_BLACK_LISTED: 'role_client_black_listed',
  ROLE_AUDIT_MODULE: 'role_audit_module',
  ROLE_INVENTORY: 'role_inventory',
  ROLE_DASHBOARD: 'role_dashboard',
  
  // Document roles
  ROLE_LEGAL_DOC: 'role_legal_doc',
  ROLE_DOC_VERI_ADMIN: 'role_doc_veri_admin',
  ROLE_DOC_LEAD: 'role_doc_lead',
  ROLE_DOC_VERIFY: 'role_doc_verify',
  
  // Management roles
  ROLE_ABM: 'role_abm',
  ROLE_DM: 'role_dm',
  ROLE_QCT: 'role_qct',
  ROLE_ZM: 'role_zm',
  
  // Specialized roles
  ROLE_DEMO: 'role_demo',
  ROLE_FIG: 'role_fig',
  ROLE_PENNYDROP_VALIDATE: 'role_pennydrop_validate',
  ROLE_ATTENDANCE_EDIT: 'role_attendance_edit',
  ROLE_VOUCHER_BACK_DATE_POSTING: 'role_voucher_back_date_posting',
  ROLE_BULK_VOU_NARRATION: 'role_bulk_vou_narration',
  ROLE_LEDGER_BOOK: 'role_ledger_book',
  ROLE_INCENTIVE_DASHBOARD: 'role_incentive_dashboard',
  ROLE_LEDGER_BOOK_VENDOR: 'role_ledger_book_vendor',
  ROLE_CLIENT: 'role_client',
  ROLE_MEMO_BOOK: 'role_memo_book',
  ROLE_HO_IT: 'role_ho_it',
  ROLE_SALARY_UPLOADER: 'role_salary_uploader',
  ROLE_VENDOR_MASTER: 'role_vendor_master',
  ROLE_STATE_IT: 'role_state_it',
  ROLE_CRM_LOAN_SANCTION: 'role_crm_loan_sanction',
  ROLE_APP_RESTRICT: 'role_app_restrict'
} as const;

export type RoleCode = typeof ROLE_CODES[keyof typeof ROLE_CODES];