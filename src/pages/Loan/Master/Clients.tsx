import React, { useState } from 'react';
import { ClientFilterDropdown } from '../../../components/Common/ClientFilterDropdown';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { 
  User, 
  Phone, 
  CreditCard, 
  Calendar, 
  MapPin, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  DollarSign,
  GraduationCap,
  Heart,
  Briefcase,
  Home
} from 'lucide-react';

interface EnhancedLoanClient {
  id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  aadhaarNumber: string;
  voterCardNumber: string;
  kycType: string;
  kycId: string;
  cycle: number;
  dateOfBirth: string;
  age: number;
  fatherName: string;
  motherName: string;
  gender: 'Male' | 'Female' | 'Other';
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  mobileNumber: string;
  status: 'active' | 'inactive';
  qualification: string;
  language: string;
  caste: string;
  religion: string;
  occupation: string;
  landHolding: string;
  monthlyIncome: number;
  annualIncome: number;
  householdIncome: number;
  monthlyExpense: number;
  monthlyObligation: number;
}

export const Clients: React.FC = () => {
  const [clients] = useState<EnhancedLoanClient[]>([
    {
      id: '1',
      clientId: 'CL001',
      firstName: 'Priya',
      lastName: 'Sharma',
      aadhaarNumber: '1234-5678-9012',
      voterCardNumber: 'ABC1234567',
      kycType: 'Aadhaar',
      kycId: '1234-5678-9012',
      cycle: 1,
      dateOfBirth: '1985-06-15',
      age: 38,
      fatherName: 'Ram Sharma',
      motherName: 'Sita Sharma',
      gender: 'Female',
      maritalStatus: 'Married',
      mobileNumber: '+91 9876543210',
      status: 'active',
      qualification: 'Graduate',
      language: 'Hindi',
      caste: 'General',
      religion: 'Hindu',
      occupation: 'Small Business',
      landHolding: '2 Acres',
      monthlyIncome: 25000,
      annualIncome: 300000,
      householdIncome: 45000,
      monthlyExpense: 18000,
      monthlyObligation: 5000
    },
    {
      id: '2',
      clientId: 'CL002',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      aadhaarNumber: '2345-6789-0123',
      voterCardNumber: 'DEF2345678',
      kycType: 'Voter ID',
      kycId: 'DEF2345678',
      cycle: 2,
      dateOfBirth: '1980-03-22',
      age: 43,
      fatherName: 'Mohan Kumar',
      motherName: 'Radha Kumar',
      gender: 'Male',
      maritalStatus: 'Married',
      mobileNumber: '+91 9876543211',
      status: 'active',
      qualification: 'High School',
      language: 'Hindi',
      caste: 'OBC',
      religion: 'Hindu',
      occupation: 'Agriculture',
      landHolding: '5 Acres',
      monthlyIncome: 20000,
      annualIncome: 240000,
      householdIncome: 35000,
      monthlyExpense: 15000,
      monthlyObligation: 3000
    },
    {
      id: '3',
      clientId: 'CL003',
      firstName: 'Sunita',
      lastName: 'Devi',
      aadhaarNumber: '3456-7890-1234',
      voterCardNumber: 'GHI3456789',
      kycType: 'Aadhaar',
      kycId: '3456-7890-1234',
      cycle: 1,
      dateOfBirth: '1990-12-08',
      age: 33,
      fatherName: 'Suresh Devi',
      motherName: 'Kamala Devi',
      gender: 'Female',
      maritalStatus: 'Single',
      mobileNumber: '+91 9876543212',
      status: 'inactive',
      qualification: 'Primary',
      language: 'Hindi',
      caste: 'SC',
      religion: 'Hindu',
      occupation: 'Tailoring',
      landHolding: 'None',
      monthlyIncome: 15000,
      annualIncome: 180000,
      householdIncome: 15000,
      monthlyExpense: 12000,
      monthlyObligation: 2000
    }
  ]);

  const [filteredClients, setFilteredClients] = useState<EnhancedLoanClient[]>(clients);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFilter = (filters: any) => {
    let filtered = clients;

    if (filters.clientCode) {
      filtered = filtered.filter(client => 
        client.clientId.toLowerCase().includes(filters.clientCode.toLowerCase())
      );
    }
    if (filters.voterCardNumber) {
      filtered = filtered.filter(client => 
        client.voterCardNumber.toLowerCase().includes(filters.voterCardNumber.toLowerCase())
      );
    }
    if (filters.aadhaarNumber) {
      filtered = filtered.filter(client => 
        client.aadhaarNumber.includes(filters.aadhaarNumber)
      );
    }

    setFilteredClients(filtered);
  };

  const handleDownload = () => {
    const headers = [
      'Client ID', 'First Name', 'Last Name', 'Aadhaar Number', 'Voter Card Number',
      'KYC Type', 'KYC ID', 'Cycle', 'Date of Birth', 'Age', 'Father Name', 'Mother Name',
      'Gender', 'Marital Status', 'Mobile Number', 'Status', 'Qualification', 'Language',
      'Caste', 'Religion', 'Occupation', 'Land Holding', 'Monthly Income', 'Annual Income',
      'Household Income', 'Monthly Expense', 'Monthly Obligation'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredClients.map(client => [
        client.clientId,
        client.firstName,
        client.lastName,
        client.aadhaarNumber,
        client.voterCardNumber,
        client.kycType,
        client.kycId,
        client.cycle,
        client.dateOfBirth,
        client.age,
        client.fatherName,
        client.motherName,
        client.gender,
        client.maritalStatus,
        client.mobileNumber,
        client.status,
        client.qualification,
        client.language,
        client.caste,
        client.religion,
        client.occupation,
        client.landHolding,
        client.monthlyIncome,
        client.annualIncome,
        client.householdIncome,
        client.monthlyExpense,
        client.monthlyObligation
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setSuccess('Client data exported successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEditClient = (client: EnhancedLoanClient) => {
    console.log('Edit client:', client);
  };

  const handleDeleteClient = (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      console.log('Delete client:', clientId);
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'Female' ? (
      <User className="w-4 h-4 text-pink-500" />
    ) : (
      <User className="w-4 h-4 text-blue-500" />
    );
  };

  const columns = [
    {
      key: 'actions',
      label: 'Action',
      render: (value: any, row: EnhancedLoanClient) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard module="loan" permission="write">
            <button
              onClick={() => handleEditClient(row)}
              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors duration-200"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard module="loan" permission="delete">
            <button
              onClick={() => handleDeleteClient(row.id)}
              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors duration-200"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </PermissionGuard>
        </div>
      )
    },
    {
      key: 'clientId',
      label: 'Client ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'firstName',
      label: 'First Name',
      sortable: true,
      render: (value: string, row: EnhancedLoanClient) => (
        <div className="flex items-center space-x-2">
          {getGenderIcon(row.gender)}
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'lastName',
      label: 'Last Name',
      sortable: true,
    },
    {
      key: 'aadhaarNumber',
      label: 'Aadhaar Number',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span className="font-mono">{value}</span>
        </div>
      )
    },
    {
      key: 'voterCardNumber',
      label: 'Voter Card Number',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'kycType',
      label: 'KYC Type',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {value}
        </span>
      )
    },
    {
      key: 'kycId',
      label: 'KYC ID',
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'cycle',
      label: 'Cycle',
      sortable: true,
      render: (value: number) => (
        <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          Cycle {value}
        </span>
      )
    },
    {
      key: 'dateOfBirth',
      label: 'Date of Birth',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'age',
      label: 'Age',
      sortable: true,
      render: (value: number) => `${value} years`
    },
    {
      key: 'fatherName',
      label: 'Father\'s Name',
      sortable: true,
    },
    {
      key: 'motherName',
      label: 'Mother\'s Name',
      sortable: true,
    },
    {
      key: 'gender',
      label: 'Gender',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          {getGenderIcon(value)}
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'maritalStatus',
      label: 'Marital Status',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Heart className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'mobileNumber',
      label: 'Mobile Number',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
            value === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        </div>
      )
    },
    {
      key: 'qualification',
      label: 'Qualification',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <GraduationCap className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'language',
      label: 'Language',
      sortable: true,
    },
    {
      key: 'caste',
      label: 'Caste',
      sortable: true,
    },
    {
      key: 'religion',
      label: 'Religion',
      sortable: true,
    },
    {
      key: 'occupation',
      label: 'Occupation',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'landHolding',
      label: 'Land Holding',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Home className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'monthlyIncome',
      label: 'Monthly Income',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'annualIncome',
      label: 'Annual Income',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-blue-500" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'householdIncome',
      label: 'Household Income',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-purple-500" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'monthlyExpense',
      label: 'Monthly Expense',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-red-500" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'monthlyObligation',
      label: 'Monthly Obligation',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-orange-500" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading clients...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage client information and profiles</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Client Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredClients.length} records found
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <ClientFilterDropdown
                onFilter={handleFilter}
                onDownload={handleDownload}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClients.map((client, index) => (
                <tr
                  key={client.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {column.render ? column.render(client[column.key as keyof EnhancedLoanClient], client) : client[column.key as keyof EnhancedLoanClient]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};