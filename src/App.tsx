import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/Layout/MainLayout';
import { LoginPage } from './components/Auth/LoginPage';
import { RegisterPage } from './components/Auth/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { Areas } from './pages/Loan/Master/Areas';
import { Centers } from './pages/Loan/Master/Centers';
import { Villages } from './pages/Loan/Master/Villages';
import { Clients } from './pages/Loan/Master/Clients';
import { Products } from './pages/Loan/Master/Products';
import { ProductGroups } from './pages/Loan/Master/ProductGroups';
import { Districts } from './pages/Loan/Master/Districts';
import { InsuranceMasterPage } from './pages/Loan/Master/Insurance';
import { Pincode } from './pages/Loan/Master/Pincode';
import { IFSC } from './pages/Loan/Master/IFSC';
import { Purpose } from './pages/Loan/Master/Purpose';
import { LoanApplicationPage } from './pages/Loan/Transaction/LoanApplication';
import { LoanDetailsPage } from './pages/Loan/Transaction/LoanDetails';
import { CreditBureauPage } from './pages/Loan/Transaction/CreditBureau';
import { NEFTDisbursementPage } from './pages/Loan/Transaction/NEFTDisbursement';
import { WriteOffPage } from './pages/Loan/Transaction/WriteOff';
import { CenterTransferPage } from './pages/Loan/Transaction/CenterTransfer';
import { CenterMeetingPage } from './pages/Loan/Transaction/CenterMeeting';
import { BranchDayClosePage } from './pages/Loan/Transaction/BranchDayClose';
import { DeathCasePage } from './pages/Loan/Transaction/DeathCase';
import { AppVerificationAdminPage } from './pages/Loan/Transaction/AppVerificationAdmin';
import { ProductBranchMappingPage } from './pages/Loan/Transaction/ProductBranchMapping';
import { BranchAuditPage } from './pages/Loan/Transaction/BranchAudit';
import { OverdueDashboardPage } from './pages/Loan/Dashboard/OverdueDashboard';
import { LoanSummary } from './pages/Loan/Reports/LoanSummary';
import { RepaymentDetails } from './pages/Loan/Reports/RepaymentDetails';
import { BranchDayCloseReport } from './pages/Loan/Reports/BranchDayCloseReport';
import { EmployeeAttendanceReport } from './pages/Loan/Reports/EmployeeAttendanceReport';
import { DeathReport } from './pages/Loan/Reports/DeathReport';
import { InsuranceReport } from './pages/Loan/Reports/InsuranceReport';
import { DueVsCollectionReport } from './pages/Loan/Reports/DueVsCollectionReport';
import { useSessionTimeout } from './hooks/useSessionTimeout';

// Placeholder components for other routes
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">This page is under development</p>
    </div>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Coming Soon</h3>
      <p className="text-gray-600 dark:text-gray-400">This feature is currently under development and will be available soon.</p>
    </div>
  </div>
);

function AppRoutes() {
  const { auth } = useAuth();
  
  // Initialize session timeout for authenticated users
  useSessionTimeout();

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={auth.isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={auth.isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
      />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Loan Module Routes */}
        <Route path="loan/master/areas" element={<Areas />} />
        <Route path="loan/master/centers" element={<Centers />} />
        <Route path="loan/master/villages" element={<Villages />} />
        <Route path="loan/master/clients" element={<Clients />} />
        <Route path="loan/master/products" element={<Products />} />
        <Route path="loan/master/product-groups" element={<ProductGroups />} />
        <Route path="loan/master/districts" element={<Districts />} />
        <Route path="loan/master/insurance" element={<InsuranceMasterPage />} />
        <Route path="loan/master/pincode" element={<Pincode />} />
        <Route path="loan/master/ifsc" element={<IFSC />} />
        <Route path="loan/master/purpose" element={<Purpose />} />
        
        <Route path="loan/transaction/application" element={<LoanApplicationPage />} />
        <Route path="loan/transaction/details" element={<LoanDetailsPage />} />
        <Route path="loan/transaction/credit-bureau" element={<CreditBureauPage />} />
        <Route path="loan/transaction/neft" element={<NEFTDisbursementPage />} />
        <Route path="loan/transaction/write-off" element={<WriteOffPage />} />
        <Route path="loan/transaction/center-transfer" element={<CenterTransferPage />} />
        <Route path="loan/transaction/meeting" element={<CenterMeetingPage />} />
        <Route path="loan/transaction/day-close" element={<BranchDayClosePage />} />
        <Route path="loan/transaction/death-case" element={<DeathCasePage />} />
        <Route path="loan/transaction/app-verification-admin" element={<AppVerificationAdminPage />} />
        <Route path="loan/transaction/product-branch-mapping" element={<ProductBranchMappingPage />} />
        <Route path="loan/transaction/branch-audit" element={<BranchAuditPage />} />
        
        <Route path="loan/reports/summary" element={<LoanSummary />} />
        <Route path="loan/reports/repayment" element={<RepaymentDetails />} />
        <Route path="loan/reports/branch-day-close" element={<BranchDayCloseReport />} />
        <Route path="loan/reports/employee-attendance" element={<EmployeeAttendanceReport />} />
        <Route path="loan/reports/death-report" element={<DeathReport />} />
        <Route path="loan/reports/insurance" element={<InsuranceReport />} />
        <Route path="loan/reports/due-vs-collection" element={<DueVsCollectionReport />} />
        <Route path="loan/reports/agent-pool" element={<PlaceholderPage title="Agent Pool Report" />} />
        <Route path="loan/reports/scv" element={<PlaceholderPage title="SCV Report" />} />
        <Route path="loan/reports/luc" element={<PlaceholderPage title="LUC Report" />} />
        <Route path="loan/reports/house-visit" element={<PlaceholderPage title="House Visit Report" />} />
        <Route path="loan/reports/cgt-grt" element={<PlaceholderPage title="CGT/GRT Report" />} />
        <Route path="loan/reports/login" element={<PlaceholderPage title="Login Report" />} />
        <Route path="loan/reports/center-summary" element={<PlaceholderPage title="Center Summary Report" />} />
        <Route path="loan/reports/backdated" element={<PlaceholderPage title="Backdated Report" />} />
        <Route path="loan/reports/loan-closure" element={<PlaceholderPage title="Loan Closure Report" />} />
        <Route path="loan/reports/credit-bureau" element={<PlaceholderPage title="Credit Bureau Report" />} />
        <Route path="loan/reports/collection-details" element={<PlaceholderPage title="Collection Details Report" />} />
        <Route path="loan/reports/application-verification" element={<PlaceholderPage title="Application Verification Report" />} />
        <Route path="loan/reports/center-reports" element={<PlaceholderPage title="Center Reports" />} />
        <Route path="loan/reports/demand-vs-collection" element={<PlaceholderPage title="Demand vs Collection Report" />} />
        <Route path="loan/reports/disbursement-achievement" element={<PlaceholderPage title="Disbursement Achievement Report" />} />
        <Route path="loan/reports/bucket-comparison" element={<PlaceholderPage title="Bucket Comparison Report" />} />
        <Route path="loan/reports/cgt-crt-pending" element={<PlaceholderPage title="CGT/CRT Pending Report" />} />
        <Route path="loan/reports/recycle-loan" element={<PlaceholderPage title="Recycle Loan Report" />} />
        <Route path="loan/reports/white-board" element={<PlaceholderPage title="White Board Report" />} />
        <Route path="loan/reports/business-opportunity-vs-actual" element={<PlaceholderPage title="Business Opportunity vs Actual Disbursement Report" />} />
        
        <Route path="loan/dashboard/collection" element={<PlaceholderPage title="Collection Dashboard" />} />
        <Route path="loan/dashboard/overdue" element={<OverdueDashboardPage />} />
        <Route path="loan/dashboard/funnel" element={<PlaceholderPage title="Application Funnel" />} />
        
        {/* Admin Routes */}
        <Route path="admin/roles" element={<PlaceholderPage title="Role Management" />} />
        
        {/* Other Module Routes */}
        <Route path="finance/master" element={<PlaceholderPage title="Finance Master" />} />
        <Route path="finance/transaction" element={<PlaceholderPage title="Finance Transaction" />} />
        <Route path="finance/reports" element={<PlaceholderPage title="Finance Reports" />} />
        
        <Route path="hr/master" element={<PlaceholderPage title="HR Master" />} />
        <Route path="hr/transaction" element={<PlaceholderPage title="HR Transaction" />} />
        <Route path="hr/reports" element={<PlaceholderPage title="HR Reports" />} />
        
        <Route path="funds/master" element={<PlaceholderPage title="Funds Master" />} />
        <Route path="funds/transaction" element={<PlaceholderPage title="Funds Transaction" />} />
        
        <Route path="business-partner/external-sanction" element={<PlaceholderPage title="External Sanction" />} />
        
        <Route path="settings" element={<PlaceholderPage title="Settings" />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;