import { roleService } from '../services/roleService';
import { ROLE_CODES } from '../types/roles';

/**
 * Seed all required roles into the database
 * This can be called during application initialization or as a manual operation
 */
export const seedRoles = async (): Promise<void> => {
  const rolesToSeed = [
    { role_name: 'External_sanction', role_code: ROLE_CODES.EXTERNAL_SANCTION, description: 'Role for external sanction operations' },
    { role_name: 'Admin', role_code: ROLE_CODES.ADMIN, description: 'Administrator role with full system access' },
    { role_name: 'MIS', role_code: ROLE_CODES.MIS, description: 'Management Information System role' },
    { role_name: 'Receipt_payment', role_code: ROLE_CODES.RECEIPT_PAYMENT, description: 'Role for receipt and payment operations' },
    { role_name: 'Bypass_2FA', role_code: ROLE_CODES.BYPASS_2FA, description: 'Role to bypass two-factor authentication' },
    { role_name: 'Loan_Waiver', role_code: ROLE_CODES.LOAN_WAIVER, description: 'Role for loan waiver operations' },
    { role_name: 'Role_SCV', role_code: ROLE_CODES.ROLE_SCV, description: 'SCV role for specific operations' },
    { role_name: 'Role_BC', role_code: ROLE_CODES.ROLE_BC, description: 'Business Correspondent role' },
    { role_name: 'Role_Insurance', role_code: ROLE_CODES.ROLE_INSURANCE, description: 'Insurance operations role' },
    { role_name: 'Role_BM', role_code: ROLE_CODES.ROLE_BM, description: 'Branch Manager role' },
    { role_name: 'Role_HO', role_code: ROLE_CODES.ROLE_HO, description: 'Head Office role' },
    { role_name: 'Role_HR', role_code: ROLE_CODES.ROLE_HR, description: 'Human Resources role' },
    { role_name: 'Role_Accountant', role_code: ROLE_CODES.ROLE_ACCOUNTANT, description: 'Accountant role' },
    { role_name: 'Role_Chief_Accountant', role_code: ROLE_CODES.ROLE_CHIEF_ACCOUNTANT, description: 'Chief Accountant role' },
    { role_name: 'Role_Funder_Tag', role_code: ROLE_CODES.ROLE_FUNDER_TAG, description: 'Funder tagging role' },
    { role_name: 'Role_Voucher_Booking', role_code: ROLE_CODES.ROLE_VOUCHER_BOOKING, description: 'Voucher booking role' },
    { role_name: 'Role_Voucher_Approval', role_code: ROLE_CODES.ROLE_VOUCHER_APPROVAL, description: 'Voucher approval role' },
    { role_name: 'Role_FO', role_code: ROLE_CODES.ROLE_FO, description: 'Field Officer role' },
    { role_name: 'Role_Auditor', role_code: ROLE_CODES.ROLE_AUDITOR, description: 'Auditor role' },
    { role_name: 'Role_BR_Book_Debt', role_code: ROLE_CODES.ROLE_BR_BOOK_DEBT, description: 'Book debt role' },
    { role_name: 'Role_TDS', role_code: ROLE_CODES.ROLE_TDS, description: 'TDS operations role' },
    { role_name: 'Role_Credit_Bureau_Page', role_code: ROLE_CODES.ROLE_CREDIT_BUREAU_PAGE, description: 'Credit bureau page access role' },
    { role_name: 'Role_BR_Aging', role_code: ROLE_CODES.ROLE_BR_AGING, description: 'Aging report role' },
    { role_name: 'Role_LOS', role_code: ROLE_CODES.ROLE_LOS, description: 'Loan Origination System role' },
    { role_name: 'Role_Loan_Hub', role_code: ROLE_CODES.ROLE_LOAN_HUB, description: 'Loan hub access role' },
    { role_name: 'Role_BR_Dialy_Info', role_code: ROLE_CODES.ROLE_BR_DAILY_INFO, description: 'Daily information role' },
    { role_name: 'Role_BR_Dormant', role_code: ROLE_CODES.ROLE_BR_DORMANT, description: 'Dormant account role' },
    { role_name: 'Role_BR_Future', role_code: ROLE_CODES.ROLE_BR_FUTURE, description: 'Future operations role' },
    { role_name: 'Role_BR_Glance', role_code: ROLE_CODES.ROLE_BR_GLANCE, description: 'Glance report role' },
    { role_name: 'Role_BR_Overdue', role_code: ROLE_CODES.ROLE_BR_OVERDUE, description: 'Overdue management role' },
    { role_name: 'Role_Client_Black_Listed', role_code: ROLE_CODES.ROLE_CLIENT_BLACK_LISTED, description: 'Client blacklist management role' },
    { role_name: 'Role_Audit_Module', role_code: ROLE_CODES.ROLE_AUDIT_MODULE, description: 'Audit module access role' },
    { role_name: 'Role_Abm', role_code: ROLE_CODES.ROLE_ABM, description: 'ABM role' },
    { role_name: 'Role_Inventory', role_code: ROLE_CODES.ROLE_INVENTORY, description: 'Inventory management role' },
    { role_name: 'Role_Tele_Caller', role_code: ROLE_CODES.ROLE_TELE_CALLER, description: 'Tele caller role' },
    { role_name: 'Role_Voucher_Back_Date_Posting', role_code: ROLE_CODES.ROLE_VOUCHER_BACK_DATE_POSTING, description: 'Back date voucher posting role' },
    { role_name: 'Role_NEFT_Disb', role_code: ROLE_CODES.ROLE_NEFT_DISB, description: 'NEFT disbursement role' },
    { role_name: 'Role_Legal_Doc', role_code: ROLE_CODES.ROLE_LEGAL_DOC, description: 'Legal document role' },
    { role_name: 'Role_Demo', role_code: ROLE_CODES.ROLE_DEMO, description: 'Demo access role' },
    { role_name: 'Role_Fig', role_code: ROLE_CODES.ROLE_FIG, description: 'FIG role' },
    { role_name: 'Role_PennyDrop_Validate', role_code: ROLE_CODES.ROLE_PENNYDROP_VALIDATE, description: 'Penny drop validation role' },
    { role_name: 'Role_Attendance_Edit', role_code: ROLE_CODES.ROLE_ATTENDANCE_EDIT, description: 'Attendance editing role' },
    { role_name: 'Role_Miscellaneous_RPT', role_code: ROLE_CODES.ROLE_MISCELLANEOUS_RPT, description: 'Miscellaneous report role' },
    { role_name: 'Role_Doc_Veri_Admin', role_code: ROLE_CODES.ROLE_DOC_VERI_ADMIN, description: 'Document verification admin role' },
    { role_name: 'Role_Dashboard', role_code: ROLE_CODES.ROLE_DASHBOARD, description: 'Dashboard access role' },
    { role_name: 'Role_Bulk_Vou_Narration', role_code: ROLE_CODES.ROLE_BULK_VOU_NARRATION, description: 'Bulk voucher narration role' },
    { role_name: 'Role_Doc_Lead', role_code: ROLE_CODES.ROLE_DOC_LEAD, description: 'Document lead role' },
    { role_name: 'Role_Ledger_Book', role_code: ROLE_CODES.ROLE_LEDGER_BOOK, description: 'Ledger book access role' },
    { role_name: 'Role_Incentive_Dashboard', role_code: ROLE_CODES.ROLE_INCENTIVE_DASHBOARD, description: 'Incentive dashboard role' },
    { role_name: 'Role_Ledger_Book_vendor', role_code: ROLE_CODES.ROLE_LEDGER_BOOK_VENDOR, description: 'Vendor ledger book role' },
    { role_name: 'Role_DM', role_code: ROLE_CODES.ROLE_DM, description: 'District Manager role' },
    { role_name: 'Role_QCT', role_code: ROLE_CODES.ROLE_QCT, description: 'QCT role' },
    { role_name: 'Role_ZM', role_code: ROLE_CODES.ROLE_ZM, description: 'Zonal Manager role' },
    { role_name: 'Role_DOC_Verify', role_code: ROLE_CODES.ROLE_DOC_VERIFY, description: 'Document verification role' },
    { role_name: 'Role_client', role_code: ROLE_CODES.ROLE_CLIENT, description: 'Client role' },
    { role_name: 'Role_Memo_Book', role_code: ROLE_CODES.ROLE_MEMO_BOOK, description: 'Memo book role' },
    { role_name: 'Role_HO_IT', role_code: ROLE_CODES.ROLE_HO_IT, description: 'Head Office IT role' },
    { role_name: 'Role_Salary_Uploader', role_code: ROLE_CODES.ROLE_SALARY_UPLOADER, description: 'Salary uploader role' },
    { role_name: 'Role_Vendor_Master', role_code: ROLE_CODES.ROLE_VENDOR_MASTER, description: 'Vendor master role' },
    { role_name: 'Role_State_IT', role_code: ROLE_CODES.ROLE_STATE_IT, description: 'State IT role' },
    { role_name: 'Role_CRM_Loan_Sanction', role_code: ROLE_CODES.ROLE_CRM_LOAN_SANCTION, description: 'CRM loan sanction role' },
    { role_name: 'Role_App_Restrict', role_code: ROLE_CODES.ROLE_APP_RESTRICT, description: 'Application restriction role' }
  ];

  try {
    console.log('Starting role seeding process...');
    const insertedRoles = await roleService.bulkInsertRoles(rolesToSeed);
    console.log(`Successfully seeded ${insertedRoles.length} roles`);
    return;
  } catch (error) {
    console.error('Error seeding roles:', error);
    throw new Error('Failed to seed roles');
  }
};

/**
 * Check if all required roles exist in the database
 */
export const validateRoles = async (): Promise<boolean> => {
  try {
    const allRoles = await roleService.getAllRoles();
    const existingRoleCodes = allRoles.map(role => role.role_code);
    
    const requiredRoleCodes = Object.values(ROLE_CODES);
    const missingRoles = requiredRoleCodes.filter(code => !existingRoleCodes.includes(code));
    
    if (missingRoles.length > 0) {
      console.warn(`Missing roles: ${missingRoles.join(', ')}`);
      return false;
    }
    
    console.log('All required roles are present in the database');
    return true;
  } catch (error) {
    console.error('Error validating roles:', error);
    return false;
  }
};