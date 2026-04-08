import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard, 
  DollarSign, 
  AlertTriangle,
  Calendar,
  Target,
  Shield
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { PermissionGuard } from '../components/Common/PermissionGuard';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          <div className="flex items-center mt-2">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {Math.abs(change)}%
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { auth } = useAuth();
  const [stats] = useState([
    {
      title: 'Total Loans',
      value: '2,847',
      change: 12.5,
      icon: <CreditCard className="w-6 h-6 text-white" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Clients',
      value: '1,423',
      change: 8.2,
      icon: <Users className="w-6 h-6 text-white" />,
      color: 'bg-green-500'
    },
    {
      title: 'Total Disbursed',
      value: '₹45.2L',
      change: 15.3,
      icon: <DollarSign className="w-6 h-6 text-white" />,
      color: 'bg-indigo-500'
    },
    {
      title: 'Overdue Amount',
      value: '₹2.1L',
      change: -5.4,
      icon: <AlertTriangle className="w-6 h-6 text-white" />,
      color: 'bg-red-500'
    }
  ]);

  const recentApplications = [
    {
      id: 'LA001',
      client: 'Priya Sharma',
      center: 'Anand Nagar',
      amount: '₹50,000',
      status: 'Pending Verification',
      date: '2024-01-15'
    },
    {
      id: 'LA002',
      client: 'Rajesh Kumar',
      center: 'Gandhi Colony',
      amount: '₹75,000',
      status: 'Approved',
      date: '2024-01-14'
    },
    {
      id: 'LA003',
      client: 'Sunita Devi',
      center: 'Nehru Park',
      amount: '₹30,000',
      status: 'Under Review',
      date: '2024-01-13'
    }
  ];

  const overdueLoans = [
    {
      client: 'Mohit Singh',
      center: 'Patel Nagar',
      amount: '₹15,000',
      days: 45,
      officer: 'Amit Jain'
    },
    {
      client: 'Kavita Rani',
      center: 'Shastri Colony',
      amount: '₹22,500',
      days: 30,
      officer: 'Neha Gupta'
    }
  ];

  const getRoleBasedWelcome = () => {
    const role = auth.user?.role;
    switch (role) {
      case 'admin':
        return 'Welcome back, Administrator! You have full system access.';
      case 'manager':
        return 'Welcome back, Manager! Monitor your branch performance.';
      case 'finance_officer':
        return 'Welcome back! Review financial transactions and reports.';
      case 'loan_officer':
        return 'Welcome back! Manage your loan applications and clients.';
      case 'field_officer':
        return 'Welcome back! Check your field visits and collections.';
      default:
        return 'Welcome back! Here\'s your dashboard overview.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{getRoleBasedWelcome()}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-blue-900 rounded-full">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300 capitalize">
              {auth.user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <PermissionGuard module="loan" permission="read">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </PermissionGuard>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <PermissionGuard module="loan" permission="read">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Loan Applications</h3>
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                          {app.client.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{app.client}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{app.center} • {app.amount}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                        app.status === 'Approved' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : app.status === 'Pending Verification'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {app.status}
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{app.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PermissionGuard>

        {/* Overdue Loans */}
        <PermissionGuard module="loan" permission="read">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Overdue Loans</h3>
                <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs font-medium">
                  High Priority
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {overdueLoans.map((loan, index) => (
                  <div key={index} className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">{loan.client}</p>
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">{loan.days} days</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{loan.center}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.amount}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">FO: {loan.officer}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium">
                View All Overdue
              </button>
            </div>
          </div>
        </PermissionGuard>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PermissionGuard module="loan" permission="write">
            <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">New Application</span>
            </button>
          </PermissionGuard>
          
          <PermissionGuard module="loan" permission="write">
            <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <Users className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Add Client</span>
            </button>
          </PermissionGuard>
          
          <PermissionGuard module="loan" permission="write">
            <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <Target className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Center Meeting</span>
            </button>
          </PermissionGuard>
          
          <PermissionGuard module="loan" permission="read">
            <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <DollarSign className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Collection</span>
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Admin Panel Link */}
      <PermissionGuard roles="admin">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300">Admin Panel</h3>
              <p className="text-purple-700 dark:text-purple-400 mt-1">Manage users, roles, and system settings</p>
            </div>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
              Access Admin Panel
            </button>
          </div>
        </div>
      </PermissionGuard>
    </div>
  );
};