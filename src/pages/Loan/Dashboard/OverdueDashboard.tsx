import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  FunnelChart, 
  Funnel, 
  LabelList,
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, AlertTriangle, DollarSign, Users, Calendar, Filter } from 'lucide-react';
import { OverdueData } from '../../../types';

export const OverdueDashboardPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Sample data for charts
  const overdueByBranch = [
    { branch: 'Main Branch', amount: 250000, count: 15, percentage: 35 },
    { branch: 'North Branch', amount: 180000, count: 12, percentage: 25 },
    { branch: 'South Branch', amount: 150000, count: 10, percentage: 21 },
    { branch: 'East Branch', amount: 120000, count: 8, percentage: 17 },
    { branch: 'West Branch', amount: 80000, count: 5, percentage: 11 }
  ];

  const overdueByCategory = [
    { name: 'Micro Finance', value: 45, amount: 320000, color: '#3B82F6' },
    { name: 'Group Lending', value: 30, amount: 210000, color: '#10B981' },
    { name: 'Individual Lending', value: 20, amount: 140000, color: '#F59E0B' },
    { name: 'Emergency Loans', value: 5, amount: 35000, color: '#EF4444' }
  ];

  const repaymentFunnel = [
    { name: 'Total Due', value: 1000, fill: '#3B82F6' },
    { name: 'Reminder Sent', value: 800, fill: '#10B981' },
    { name: 'Follow-up Call', value: 600, fill: '#F59E0B' },
    { name: 'Field Visit', value: 400, fill: '#EF4444' },
    { name: 'Legal Notice', value: 200, fill: '#8B5CF6' },
    { name: 'Paid', value: 100, fill: '#06B6D4' }
  ];

  const overdueByDays = [
    { days: '1-30 Days', amount: 180000, count: 25, color: '#10B981' },
    { days: '31-60 Days', amount: 220000, count: 18, color: '#F59E0B' },
    { days: '61-90 Days', amount: 150000, count: 12, color: '#EF4444' },
    { days: '90+ Days', amount: 230000, count: 15, color: '#7C2D12' }
  ];

  const summaryStats = [
    {
      title: 'Total Overdue Amount',
      value: '₹7.8L',
      change: 12.5,
      icon: <DollarSign className="w-6 h-6 text-white" />,
      color: 'bg-red-500'
    },
    {
      title: 'Overdue Accounts',
      value: '70',
      change: -5.2,
      icon: <Users className="w-6 h-6 text-white" />,
      color: 'bg-orange-500'
    },
    {
      title: 'Recovery Rate',
      value: '68%',
      change: 8.1,
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      color: 'bg-green-500'
    },
    {
      title: 'Avg Days Overdue',
      value: '45',
      change: -3.2,
      icon: <Calendar className="w-6 h-6 text-white" />,
      color: 'bg-blue-500'
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'amount' ? `Amount: ₹${(entry.value / 1000).toFixed(0)}K` : `Count: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Percentage: {data.value}%</p>
          <p className="text-sm text-gray-600">Amount: ₹{(data.amount / 1000).toFixed(0)}K</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overdue Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and analyze overdue loan accounts</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Branches</option>
            <option value="main">Main Branch</option>
            <option value="north">North Branch</option>
            <option value="south">South Branch</option>
            <option value="east">East Branch</option>
            <option value="west">West Branch</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className={`w-4 h-4 mr-1 ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-sm font-medium ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(stat.change)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue by Branch - Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Overdue Amount by Branch</h3>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overdueByBranch}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="branch" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="amount" 
                fill="#EF4444" 
                name="Amount (₹)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Overdue by Category - Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Overdue Distribution by Category</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Interactive</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={overdueByCategory}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={40}
                paddingAngle={2}
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {overdueByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="outside"
                  formatter={(value: number) => `${value}%`}
                  style={{ fontSize: '12px', fontWeight: 'bold' }}
                />
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color, fontSize: '12px' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Repayment Funnel and Overdue by Days */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repayment Process Funnel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Repayment Process Funnel</h3>
            <div className="text-sm text-gray-500">Collection Pipeline</div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <FunnelChart>
              <Tooltip 
                formatter={(value, name) => [`${value} accounts`, name]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Funnel
                dataKey="value"
                data={repaymentFunnel}
                isAnimationActive={true}
                animationDuration={1000}
              >
                <LabelList 
                  position="center" 
                  fill="#fff" 
                  stroke="none"
                  fontSize={12}
                  fontWeight="bold"
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* Overdue by Days - Horizontal Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Overdue by Age Buckets</h3>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-4">
            {overdueByDays.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.days}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{(item.amount / 1000).toFixed(0)}K
                    </div>
                    <div className="text-xs text-gray-500">{item.count} accounts</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${(item.amount / Math.max(...overdueByDays.map(d => d.amount))) * 100}%`,
                      backgroundColor: item.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Total Overdue:</span>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  ₹{(overdueByDays.reduce((sum, item) => sum + item.amount, 0) / 1000).toFixed(0)}K
                </div>
                <div className="text-gray-500">
                  {overdueByDays.reduce((sum, item) => sum + item.count, 0)} accounts
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Action Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-red-800">Critical Overdue</h4>
            </div>
            <p className="text-sm text-red-700 mt-1">15 accounts overdue by 90+ days</p>
            <p className="text-xs text-red-600 mt-2">Requires immediate legal action</p>
          </div>
          
          <div className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded-r-lg">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-600" />
              <h4 className="font-semibold text-orange-800">Field Visits Due</h4>
            </div>
            <p className="text-sm text-orange-700 mt-1">28 accounts need field officer visit</p>
            <p className="text-xs text-orange-600 mt-2">Schedule within next 3 days</p>
          </div>
          
          <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-800">Recovery Opportunity</h4>
            </div>
            <p className="text-sm text-blue-700 mt-1">₹2.1L potential recovery this week</p>
            <p className="text-xs text-blue-600 mt-2">Focus on 31-60 day bucket</p>
          </div>
        </div>
      </div>
    </div>
  );
};