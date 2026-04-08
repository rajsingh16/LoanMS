import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  CreditCard,
  DollarSign,
  Users,
  PiggyBank,
  Handshake,
  ChevronDown,
  ChevronRight,
  Settings,
  LogOut,
  X,
  Shield,
  FileText,
  Calculator,
  UserCheck,
  Building2,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { PermissionGuard } from '../Common/PermissionGuard';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  roles?: string[];
  module?: string;
  permission?: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home className="w-5 h-5" />,
    path: '/dashboard'
  },
  {
    id: 'loan',
    label: 'Loan Module',
    icon: <CreditCard className="w-5 h-5" />,
    module: 'loan',
    permission: 'read',
    children: [
      {
        id: 'loan-master',
        label: 'Master',
        icon: <div className="w-2 h-2 bg-blue-500 rounded-full"></div>,
        children: [
          { id: 'areas', label: 'Areas', icon: null, path: '/loan/master/areas', module: 'loan', permission: 'read' },
          { id: 'centers', label: 'Centers', icon: null, path: '/loan/master/centers', module: 'loan', permission: 'read' },
          { id: 'villages', label: 'Villages', icon: null, path: '/loan/master/villages', module: 'loan', permission: 'read' },
          { id: 'clients', label: 'Clients', icon: null, path: '/loan/master/clients', module: 'loan', permission: 'read' },
          { id: 'products', label: 'Products', icon: null, path: '/loan/master/products', module: 'loan', permission: 'read' },
          { id: 'product-groups', label: 'Product Groups', icon: null, path: '/loan/master/product-groups', module: 'loan', permission: 'read' },
          { id: 'districts', label: 'Districts', icon: null, path: '/loan/master/districts', module: 'loan', permission: 'read' },
          { id: 'insurance', label: 'Insurance', icon: null, path: '/loan/master/insurance', module: 'loan', permission: 'read' },
          { id: 'pincode', label: 'Pincode', icon: null, path: '/loan/master/pincode', module: 'loan', permission: 'read' },
          { id: 'ifsc', label: 'IFSC', icon: null, path: '/loan/master/ifsc', module: 'loan', permission: 'read' },
          { id: 'purpose', label: 'Purpose', icon: null, path: '/loan/master/purpose', module: 'loan', permission: 'read' },
        ]
      },
      {
        id: 'loan-transaction',
        label: 'Transaction',
        icon: <div className="w-2 h-2 bg-green-500 rounded-full"></div>,
        children: [
          { id: 'loan-application', label: 'Loan Application', icon: null, path: '/loan/transaction/application', module: 'loan', permission: 'write' },
          { id: 'loan-details', label: 'Loan Details', icon: null, path: '/loan/transaction/details', module: 'loan', permission: 'read' },
          { id: 'credit-bureau', label: 'Credit Bureau', icon: null, path: '/loan/transaction/credit-bureau', module: 'loan', permission: 'read' },
          { id: 'neft-disbursement', label: 'NEFT Disbursement', icon: null, path: '/loan/transaction/neft', module: 'loan', permission: 'write' },
          { id: 'write-off', label: 'Write Off', icon: null, path: '/loan/transaction/write-off', module: 'loan', permission: 'write' },
          { id: 'center-transfer', label: 'Center Transfer', icon: null, path: '/loan/transaction/center-transfer', module: 'loan', permission: 'write' },
          { id: 'product-branch-mapping', label: 'Product Branch Mapping', icon: null, path: '/loan/transaction/product-branch-mapping', roles: ['admin', 'manager'] },
          { id: 'center-meeting', label: 'Center Meeting', icon: null, path: '/loan/transaction/meeting', module: 'loan', permission: 'write' },
          { id: 'branch-day-close', label: 'Branch Day Close', icon: null, path: '/loan/transaction/day-close', roles: ['admin', 'manager'] },
          { id: 'death-case', label: 'Death Case', icon: null, path: '/loan/transaction/death-case', module: 'loan', permission: 'write' },
          { id: 'app-verification-admin', label: 'App Verification Admin', icon: null, path: '/loan/transaction/app-verification-admin', roles: ['admin', 'manager'] },
          { id: 'branch-audit', label: 'Branch Audit', icon: null, path: '/loan/transaction/branch-audit', roles: ['admin', 'manager'] },
        ]
      },
      {
        id: 'loan-reports',
        label: 'Reports',
        icon: <div className="w-2 h-2 bg-purple-500 rounded-full"></div>,
        children: [
          { id: 'loan-summary', label: 'Loan Summary', icon: null, path: '/loan/reports/summary', module: 'loan', permission: 'read' },
          { id: 'repayment-details', label: 'Repayment Details', icon: null, path: '/loan/reports/repayment', module: 'loan', permission: 'read' },
          { id: 'branch-day-close-report', label: 'Branch Day Close', icon: null, path: '/loan/reports/branch-day-close', module: 'loan', permission: 'read' },
          { id: 'employee-attendance', label: 'Employee Attendance', icon: null, path: '/loan/reports/employee-attendance', module: 'loan', permission: 'read' },
          { id: 'death-report', label: 'Death Report', icon: null, path: '/loan/reports/death-report', module: 'loan', permission: 'read' },
          { id: 'insurance-report', label: 'Insurance Report', icon: null, path: '/loan/reports/insurance', module: 'loan', permission: 'read' },
          { id: 'due-vs-collection', label: 'Due vs Collection', icon: null, path: '/loan/reports/due-vs-collection', module: 'loan', permission: 'read' },
          { id: 'agent-pool', label: 'Agent Pool', icon: null, path: '/loan/reports/agent-pool', module: 'loan', permission: 'read' },
          { id: 'scv', label: 'SCV', icon: null, path: '/loan/reports/scv', module: 'loan', permission: 'read' },
          { id: 'luc', label: 'LUC', icon: null, path: '/loan/reports/luc', module: 'loan', permission: 'read' },
          { id: 'house-visit', label: 'House Visit', icon: null, path: '/loan/reports/house-visit', module: 'loan', permission: 'read' },
          { id: 'cgt-grt', label: 'CGT/GRT', icon: null, path: '/loan/reports/cgt-grt', module: 'loan', permission: 'read' },
          { id: 'login', label: 'Login', icon: null, path: '/loan/reports/login', module: 'loan', permission: 'read' },
          { id: 'center-summary', label: 'Center Summary', icon: null, path: '/loan/reports/center-summary', module: 'loan', permission: 'read' },
          { id: 'backdated', label: 'Backdated', icon: null, path: '/loan/reports/backdated', module: 'loan', permission: 'read' },
          { id: 'loan-closure', label: 'Loan Closure', icon: null, path: '/loan/reports/loan-closure', module: 'loan', permission: 'read' },
          { id: 'credit-bureau', label: 'Credit Bureau', icon: null, path: '/loan/reports/credit-bureau', module: 'loan', permission: 'read' },
          { id: 'collection-details', label: 'Collection Details', icon: null, path: '/loan/reports/collection-details', module: 'loan', permission: 'read' },
          { id: 'application-verification', label: 'Application Verification', icon: null, path: '/loan/reports/application-verification', module: 'loan', permission: 'read' },
          { id: 'center-reports', label: 'Center Reports', icon: null, path: '/loan/reports/center-reports', module: 'loan', permission: 'read' },
          { id: 'demand-vs-collection', label: 'Demand vs Collection', icon: null, path: '/loan/reports/demand-vs-collection', module: 'loan', permission: 'read' },
          { id: 'disbursement-achievement', label: 'Disbursement Achievement', icon: null, path: '/loan/reports/disbursement-achievement', module: 'loan', permission: 'read' },
          { id: 'bucket-comparison', label: 'Bucket Comparison', icon: null, path: '/loan/reports/bucket-comparison', module: 'loan', permission: 'read' },
          { id: 'cgt-crt-pending', label: 'CGT/CRT Pending', icon: null, path: '/loan/reports/cgt-crt-pending', module: 'loan', permission: 'read' },
          { id: 'recycle-loan', label: 'Recycle Loan', icon: null, path: '/loan/reports/recycle-loan', module: 'loan', permission: 'read' },
          { id: 'white-board', label: 'White Board', icon: null, path: '/loan/reports/white-board', module: 'loan', permission: 'read' },
          { id: 'business-opportunity-vs-actual', label: 'Business Opportunity vs Actual Disbursement', icon: null, path: '/loan/reports/business-opportunity-vs-actual', module: 'loan', permission: 'read' },
        ]
      },
      {
        id: 'loan-dashboard',
        label: 'Dashboard',
        icon: <div className="w-2 h-2 bg-orange-500 rounded-full"></div>,
        children: [
          { id: 'collection-dashboard', label: 'Collection Dashboard', icon: null, path: '/loan/dashboard/collection', module: 'loan', permission: 'read' },
          { id: 'overdue-dashboard', label: 'Overdue Dashboard', icon: null, path: '/loan/dashboard/overdue', module: 'loan', permission: 'read' },
          { id: 'application-funnel', label: 'Application Funnel', icon: null, path: '/loan/dashboard/funnel', module: 'loan', permission: 'read' },
        ]
      }
    ]
  },
  {
    id: 'finance',
    label: 'Finance Module',
    icon: <DollarSign className="w-5 h-5" />,
    module: 'finance',
    permission: 'read',
    children: [
      {
        id: 'finance-master',
        label: 'Master',
        icon: <div className="w-2 h-2 bg-blue-500 rounded-full"></div>,
        children: [
          { id: 'account', label: 'Account', icon: null, path: '/finance/master/account', module: 'finance', permission: 'read' },
          { id: 'period', label: 'Period', icon: null, path: '/finance/master/period', module: 'finance', permission: 'read' },
        ]
      },
      {
        id: 'finance-transaction',
        label: 'Transaction',
        icon: <div className="w-2 h-2 bg-green-500 rounded-full"></div>,
        children: [
          { id: 'voucher-reversal', label: 'Voucher Reversal', icon: null, path: '/finance/transaction/voucher-reversal', module: 'finance', permission: 'write' },
          { id: 'voucher-approval', label: 'Voucher Approval', icon: null, path: '/finance/transaction/voucher-approval', module: 'finance', permission: 'write' },
        ]
      },
    ]
  },
  {
    id: 'hr',
    label: 'HR Module',
    icon: <Users className="w-5 h-5" />,
    roles: ['admin', 'manager'],
    children: [
      {
        id: 'hr-master',
        label: 'Master',
        icon: <div className="w-2 h-2 bg-blue-500 rounded-full"></div>,
        children: [
          { id: 'hr-department', label: 'Department', icon: null, path: '/hr/master/department', roles: ['admin', 'manager'] },
          { id: 'designation', label: 'Designation', icon: null, path: '/hr/master/designation', roles: ['admin', 'manager'] },
        ]
      },
    ]
  },
  {
    id: 'funds',
    label: 'Funds Allocation',
    icon: <PiggyBank className="w-5 h-5" />,
    roles: ['admin', 'manager', 'finance_officer'],
    children: [
      {
        id: 'funds-master',
        label: 'Master',
        icon: <div className="w-2 h-2 bg-blue-500 rounded-full"></div>,
        children: [
          { id: 'lender', label: 'Lender', icon: null, path: '/funds/master/lender', roles: ['admin', 'manager', 'finance_officer'] },
          { id: 'funder', label: 'Funder', icon: null, path: '/funds/master/funder', roles: ['admin', 'manager', 'finance_officer'] },
        ]
      },
    ]
  },
  {
    id: 'business-partner',
    label: 'Business Partner',
    icon: <Handshake className="w-5 h-5" />,
    roles: ['admin', 'manager'],
    children: [
      { id: 'external-sanction', label: 'External Sanction', icon: <div className="w-2 h-2 bg-blue-500 rounded-full"></div>, path: '/business-partner/external-sanction', roles: ['admin', 'manager'] },
    ]
  }
];

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['loan']);
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, logout, hasRole, hasPermission } = useAuth();

  // Close other menu items when a new one is expanded
  const toggleExpanded = (itemId: string) => {
    if (expandedItems.includes(itemId)) {
      // If already expanded, collapse it and its children
      setExpandedItems(prev =>
        prev.filter(id => id !== itemId && !id.startsWith(`${itemId}-`))
      );
    } else {
      // If expanding, collapse all other items at the same level
      const parts = itemId.split('-');
      const parentId = parts.slice(0, -1).join('-');
      const siblingPrefix = parentId ? `${parentId}-` : '';
      
      // Get all current expanded items
      const currentExpanded = [...expandedItems];
      
      // Find all siblings (items with same parent)
      const siblings = currentExpanded.filter(id => {
        const idParts = id.split('-');
        // Remove the last part (the actual id)
        const idParentParts = idParts.slice(0, -1);
        const idParent = idParentParts.join('-');
        
        // Check if this item has the same parent
        return idParent === parentId && id.startsWith(siblingPrefix) && id !== itemId;
      });
      
      // Remove siblings and their children
      const filteredItems = currentExpanded.filter(id => {
        return !siblings.some(siblingId => id === siblingId || id.startsWith(`${siblingId}-`));
      });
      
      // Add the new item
      setExpandedItems([...filteredItems, itemId]);
    }
  };

  // Update expanded items based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Find which menu item matches the current path
    let matchedItemId = '';
    
    const findMatch = (items: MenuItem[], parentId = '') => {
      for (const item of items) {
        const currentId = parentId ? `${parentId}-${item.id}` : item.id;
        
        if (item.path === currentPath) {
          matchedItemId = currentId;
          return true;
        }
        
        if (item.children && findMatch(item.children, currentId)) {
          return true;
        }
      }
      return false;
    };
    
    findMatch(menuItems);
    
    if (matchedItemId) {
      // Extract all parent IDs from the matched path
      const parts = matchedItemId.split('-');
      const parentIds: string[] = [];
      
      let currentId = '';
      for (const part of parts) {
        currentId = currentId ? `${currentId}-${part}` : part;
        parentIds.push(currentId);
      }
      
      // Ensure all parent items are expanded
      setExpandedItems(prev => {
        const newExpanded = [...prev];
        for (const id of parentIds) {
          if (!newExpanded.includes(id)) {
            newExpanded.push(id);
          }
        }
        return newExpanded;
      });
    }
  }, [location.pathname]);

  const isActive = (path?: string) => {
    return path && location.pathname === path;
  };

  const canAccessItem = (item: MenuItem): boolean => {
    // Check role-based access
    if (item.roles && !hasRole(item.roles)) {
      return false;
    }
    
    // Check permission-based access
    if (item.module && item.permission && !hasPermission(item.module, item.permission)) {
      return false;
    }
    
    return true;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    if (!canAccessItem(item)) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isItemActive = isActive(item.path);
    const hasActiveChild = hasChildren && item.children!.some(child => 
      isActive(child.path) || 
      (child.children && child.children.some(grandchild => isActive(grandchild.path)))
    );

    return (
      <div key={item.id} className={`${level > 0 ? 'ml-4' : ''}`}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium rounded-lg transition-colors duration-200 ${
              hasActiveChild 
                ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                : level === 0 
                  ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <Link
            to={item.path || '#'}
            className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              isItemActive
                ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-r-2 border-blue-700 dark:border-blue-500'
                : level === 0
                ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => window.innerWidth < 768 && onClose()}
          >
            {item.icon && <span>{item.icon}</span>}
            <span>{item.label}</span>
          </Link>
        )}

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:z-auto flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">LoanMS</span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {auth.user?.first_name?.[0]}{auth.user?.last_name?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {auth.user?.first_name} {auth.user?.last_name}
              </p>
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-gray-400" />
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {auth.user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};