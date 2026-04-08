import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { ProductGroupFilterDropdown } from '../../../components/Common/ProductGroupFilterDropdown';
import { ProductGroupForm } from '../../../components/Forms/ProductGroupForm';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { ProductGroup, ProductGroupFilterOptions } from '../../../types/product';
import { useAuth } from '../../../hooks/useAuth';
import { 
  Package, 
  Building, 
  Calendar, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Download, 
  AlertCircle, 
  Loader, 
  Plus,
  Percent,
  Users,
  DollarSign
} from 'lucide-react';

export const ProductGroups: React.FC = () => {
  const { hasPermission } = useAuth();
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [filteredProductGroups, setFilteredProductGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProductGroup, setEditingProductGroup] = useState<ProductGroup | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Sample data for demonstration
  const sampleProductGroups: ProductGroup[] = [
    {
      id: '1',
      productGroupCode: 'PG001',
      productGroupName: 'Micro Finance Group',
      productGroupSegment: 'Rural',
      productGroupType: 'Individual',
      status: 'active',
      secureGroup: true,
      qualifiedGroup: true,
      borrowedGroup: false,
      cycleIncreaseFlag: true,
      clmSchemeId: 'CLM001',
      minClientPerCenter: 10,
      isQrCollectionEnable: true,
      clmLenderId: 'LEND001',
      firstEmiType: 'Monthly',
      disbursementAccountHead: 'DISB001',
      hospiCashHead: 'HOSP001',
      upiCollectionHead: 'UPI001',
      bcMigratedAccountHead: 'BC001',
      minIrr: 10.0,
      maxIrr: 15.0,
      isProduct: true,
      isTranchDisb: false,
      daysInYear: 365,
      bcId: 'BC001',
      exclusivePartner: false,
      roundingOff: 1,
      eligibleGender: 'Both',
      vendorId: 'VEN001',
      yearlyMinHouseholdIncome: 50000,
      yearlyMaxHouseholdIncome: 200000,
      cashAccountHead: 'CASH001',
      neftAccountHead: 'NEFT001',
      principalHead: 'PRIN001',
      interestIncomeHead: 'INT001',
      lpfIncomeHead: 'LPF001',
      interestReversalHead: 'INTREV001',
      brokenInterestHead: 'BRINT001',
      extendedIntCollectionHead: 'EXTINT001',
      loanWriteOffHead: 'WRITEOFF001',
      loanWaiverHead: 'WAIVER001',
      writeOffCollHead: 'WOCOLL001',
      insertedOn: '2024-01-15',
      insertedBy: 'Admin User'
    },
    {
      id: '2',
      productGroupCode: 'PG002',
      productGroupName: 'Group Lending',
      productGroupSegment: 'Urban',
      productGroupType: 'Group',
      status: 'active',
      secureGroup: false,
      qualifiedGroup: true,
      borrowedGroup: true,
      cycleIncreaseFlag: false,
      clmSchemeId: 'CLM002',
      minClientPerCenter: 5,
      isQrCollectionEnable: false,
      clmLenderId: 'LEND002',
      firstEmiType: 'Weekly',
      disbursementAccountHead: 'DISB002',
      hospiCashHead: 'HOSP002',
      upiCollectionHead: 'UPI002',
      bcMigratedAccountHead: 'BC002',
      minIrr: 8.0,
      maxIrr: 12.0,
      isProduct: true,
      isTranchDisb: true,
      daysInYear: 360,
      bcId: 'BC002',
      exclusivePartner: true,
      roundingOff: 5,
      eligibleGender: 'Female',
      yearlyMinHouseholdIncome: 75000,
      yearlyMaxHouseholdIncome: 300000,
      cashAccountHead: 'CASH002',
      neftAccountHead: 'NEFT002',
      principalHead: 'PRIN002',
      interestIncomeHead: 'INT002',
      lpfIncomeHead: 'LPF002',
      interestReversalHead: 'INTREV002',
      brokenInterestHead: 'BRINT002',
      extendedIntCollectionHead: 'EXTINT002',
      loanWriteOffHead: 'WRITEOFF002',
      loanWaiverHead: 'WAIVER002',
      writeOffCollHead: 'WOCOLL002',
      insertedOn: '2024-01-12',
      insertedBy: 'Manager User'
    }
  ];

  const businessPartners = ['Partner A', 'Partner B', 'Partner C', 'Partner D'];

  useEffect(() => {
    loadProductGroups();
  }, []);

  const loadProductGroups = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setProductGroups(sampleProductGroups);
        setFilteredProductGroups(sampleProductGroups);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load product groups');
      console.error('Error loading product groups:', err);
      setLoading(false);
    }
  };

  const handleFilter = (filters: ProductGroupFilterOptions) => {
    let filtered = productGroups;

    if (filters.businessPartner) {
      // This would filter by business partner in real implementation
      filtered = filtered.filter(pg => pg.productGroupName.toLowerCase().includes(filters.businessPartner!.toLowerCase()));
    }
    if (filters.status) {
      filtered = filtered.filter(pg => pg.status === filters.status);
    }

    setFilteredProductGroups(filtered);
  };

  const handleDownload = () => {
    const headers = [
      'Product Group Code', 'Product Group Name', 'Product Group Segment', 'Product Group Type',
      'Status', 'Secure Group', 'Qualified Group', 'Borrowed Group', 'Cycle Increase Flag',
      'CLM Scheme ID', 'Min Client Per Center', 'Is QR Collection Enable', 'CLM Lender ID',
      'First EMI Type', 'Disbursement Account Head', 'Hospi Cash Head', 'UPI Collection Head',
      'BC Migrated Account Head', 'Min IRR', 'Max IRR', 'Is Product', 'Is Tranche Disb',
      'Days In Year', 'BC ID', 'Exclusive Partner', 'Rounding Off', 'Eligible Gender',
      'Vendor ID', 'Cash Account Head', 'NEFT Account Head (Disb)', 'Principal Head',
      'Interest Income Head', 'LPF Income Head', 'Interest Reversal Head', 'Broken Interest Head',
      'Extended Int Collection Head', 'Loan Write Off Head', 'Loan Waiver Head', 'Write Off Coll Head',
      'Inserted On', 'Inserted By', 'Updated On', 'Updated By'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredProductGroups.map(pg => [
        pg.productGroupCode,
        pg.productGroupName,
        pg.productGroupSegment,
        pg.productGroupType,
        pg.status,
        pg.secureGroup ? 'Yes' : 'No',
        pg.qualifiedGroup ? 'Yes' : 'No',
        pg.borrowedGroup ? 'Yes' : 'No',
        pg.cycleIncreaseFlag ? 'Yes' : 'No',
        pg.clmSchemeId || '',
        pg.minClientPerCenter,
        pg.isQrCollectionEnable ? 'Yes' : 'No',
        pg.clmLenderId || '',
        pg.firstEmiType,
        pg.disbursementAccountHead,
        pg.hospiCashHead,
        pg.upiCollectionHead,
        pg.bcMigratedAccountHead,
        pg.minIrr,
        pg.maxIrr,
        pg.isProduct ? 'Yes' : 'No',
        pg.isTranchDisb ? 'Yes' : 'No',
        pg.daysInYear,
        pg.bcId,
        pg.exclusivePartner ? 'Yes' : 'No',
        pg.roundingOff,
        pg.eligibleGender,
        pg.vendorId || '',
        pg.cashAccountHead,
        pg.neftAccountHead,
        pg.principalHead,
        pg.interestIncomeHead,
        pg.lpfIncomeHead,
        pg.interestReversalHead,
        pg.brokenInterestHead,
        pg.extendedIntCollectionHead,
        pg.loanWriteOffHead,
        pg.loanWaiverHead,
        pg.writeOffCollHead,
        pg.insertedOn,
        pg.insertedBy,
        pg.updatedOn || '',
        pg.updatedBy || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product_groups_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setSuccess('CSV exported successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEditProductGroup = (productGroup: ProductGroup) => {
    setEditingProductGroup(productGroup);
  };

  const handleDeleteProductGroup = async (productGroupId: string) => {
    if (!window.confirm('Are you sure you want to delete this product group?')) return;

    try {
      setProductGroups(prev => prev.filter(pg => pg.id !== productGroupId));
      setFilteredProductGroups(prev => prev.filter(pg => pg.id !== productGroupId));
      setSuccess('Product group deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete product group');
      console.error('Error deleting product group:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getBooleanIcon = (value: boolean) => {
    return value ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-gray-400" />
    );
  };

  const columns = [
    {
      key: 'actions',
      label: 'Action',
      render: (value: any, row: ProductGroup) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard module="loan" permission="write">
            <button
              onClick={() => handleEditProductGroup(row)}
              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors duration-200"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard module="loan" permission="delete">
            <button
              onClick={() => handleDeleteProductGroup(row.id)}
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
      key: 'productGroupCode',
      label: 'Product Group Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'productGroupName',
      label: 'Product Group Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'productGroupSegment',
      label: 'Product Group Segment',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {value}
        </span>
      )
    },
    {
      key: 'productGroupType',
      label: 'Product Group Type',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          {value}
        </span>
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
      key: 'secureGroup',
      label: 'Secure Group',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'qualifiedGroup',
      label: 'Qualified Group',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'borrowedGroup',
      label: 'Borrowed Group',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'cycleIncreaseFlag',
      label: 'Cycle Increase Flag',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'clmSchemeId',
      label: 'CLM Scheme ID',
      render: (value?: string) => value || '-'
    },
    {
      key: 'minClientPerCenter',
      label: 'Min Client Per Center',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'isQrCollectionEnable',
      label: 'Is QR Collection Enable',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'clmLenderId',
      label: 'CLM Lender ID',
      render: (value?: string) => value || '-'
    },
    {
      key: 'firstEmiType',
      label: 'First EMI Type',
      sortable: true,
    },
    {
      key: 'disbursementAccountHead',
      label: 'Disbursement Account Head',
      sortable: true,
    },
    {
      key: 'hospiCashHead',
      label: 'Hospi Cash Head',
      sortable: true,
    },
    {
      key: 'upiCollectionHead',
      label: 'UPI Collection Head',
      sortable: true,
    },
    {
      key: 'bcMigratedAccountHead',
      label: 'BC Migrated Account Head',
      sortable: true,
    },
    {
      key: 'minIrr',
      label: 'Min IRR',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <Percent className="w-4 h-4 text-green-500" />
          <span>{value}%</span>
        </div>
      )
    },
    {
      key: 'maxIrr',
      label: 'Max IRR',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <Percent className="w-4 h-4 text-red-500" />
          <span>{value}%</span>
        </div>
      )
    },
    {
      key: 'isProduct',
      label: 'Is Product',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'isTranchDisb',
      label: 'Is Tranche Disb',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'daysInYear',
      label: 'Days In Year',
      sortable: true,
    },
    {
      key: 'bcId',
      label: 'BC ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'exclusivePartner',
      label: 'Exclusive Partner',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'roundingOff',
      label: 'Rounding Off',
      sortable: true,
    },
    {
      key: 'eligibleGender',
      label: 'Eligible Gender',
      sortable: true,
    },
    {
      key: 'vendorId',
      label: 'Vendor ID',
      render: (value?: string) => value || '-'
    },
    {
      key: 'cashAccountHead',
      label: 'Cash Account Head',
      sortable: true,
    },
    {
      key: 'neftAccountHead',
      label: 'NEFT Account Head (Disb)',
      sortable: true,
    },
    {
      key: 'principalHead',
      label: 'Principal Head',
      sortable: true,
    },
    {
      key: 'interestIncomeHead',
      label: 'Interest Income Head',
      sortable: true,
    },
    {
      key: 'lpfIncomeHead',
      label: 'LPF Income Head',
      sortable: true,
    },
    {
      key: 'interestReversalHead',
      label: 'Interest Reversal Head',
      sortable: true,
    },
    {
      key: 'brokenInterestHead',
      label: 'Broken Interest Head',
      sortable: true,
    },
    {
      key: 'extendedIntCollectionHead',
      label: 'Extended Int Collection Head',
      sortable: true,
    },
    {
      key: 'loanWriteOffHead',
      label: 'Loan Write Off Head',
      sortable: true,
    },
    {
      key: 'loanWaiverHead',
      label: 'Loan Waiver Head',
      sortable: true,
    },
    {
      key: 'writeOffCollHead',
      label: 'Write Off Coll Head',
      sortable: true,
    },
    {
      key: 'insertedOn',
      label: 'Inserted On',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'insertedBy',
      label: 'Inserted By',
      sortable: true,
    },
    {
      key: 'updatedOn',
      label: 'Updated On',
      render: (value?: string) => value ? (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-'
    },
    {
      key: 'updatedBy',
      label: 'Updated By',
      render: (value?: string) => value || '-'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading product groups...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Groups</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage product group configurations and settings</p>
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Product Group Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredProductGroups.length} records found
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <ProductGroupFilterDropdown
                onFilter={handleFilter}
                businessPartners={businessPartners}
              />
              
              <PermissionGuard module="loan" permission="read">
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </PermissionGuard>
              
              <PermissionGuard module="loan" permission="write">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </PermissionGuard>
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
              {filteredProductGroups.map((productGroup, index) => (
                <tr
                  key={productGroup.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {column.render ? column.render(productGroup[column.key as keyof ProductGroup], productGroup) : productGroup[column.key as keyof ProductGroup]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Group Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Product Group"
        size="xl"
      >
        <ProductGroupForm
          onSubmit={() => {}}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Product Group Modal */}
      <Modal
        isOpen={!!editingProductGroup}
        onClose={() => setEditingProductGroup(null)}
        title="Edit Product Group"
        size="xl"
      >
        {editingProductGroup && (
          <ProductGroupForm
            onSubmit={() => {}}
            onCancel={() => setEditingProductGroup(null)}
            initialData={editingProductGroup}
          />
        )}
      </Modal>
    </div>
  );
};