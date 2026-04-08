import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { ProductFilterDropdown } from '../../../components/Common/ProductFilterDropdown';
import { ProductForm } from '../../../components/Forms/ProductForm';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { LoanProduct, ProductFilterOptions } from '../../../types/product';
import { useAuth } from '../../../hooks/useAuth';
import { 
  Package, 
  DollarSign, 
  Calendar, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Download, 
  Upload, 
  AlertCircle, 
  Loader, 
  Plus,
  FileCheck,
  Play,
  Percent
} from 'lucide-react';

export const Products: React.FC = () => {
  const { hasPermission } = useAuth();
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Sample data for demonstration
  const sampleProducts: LoanProduct[] = [
    {
      id: '1',
      productGroupId: 'PG001',
      productId: 'P001',
      productCode: 'MF001',
      productName: 'Micro Finance Loan',
      interestRate: 12.5,
      tenureInMonths: 12,
      lpfCalcType: 'Percentage',
      lpfValue: 2.0,
      lpfDeductType: 'Upfront',
      securityValue: 10.0,
      docChargeType: 'Fixed',
      docChargeValue: 500,
      principalRepaymentFrequency: 'Monthly',
      interestRepaymentFrequency: 'Monthly',
      moratoriumPeriod: 0,
      insuranceId: 'INS001',
      insuranceDeductType: 'Monthly',
      irrWithInsurance: 14.2,
      netOffCalculationValue: 0,
      netOffCalculationFor: 'Principal',
      netOffCalculationType: 'None',
      interestCalculationOn: 'Reducing Balance',
      isSameDateEmi: true,
      documentProductAmount: 100000,
      totalInstallment: 12,
      isFixedDayEmi: false,
      isTopUp: false,
      documentProductName: 'Micro Finance Document',
      documentProductCode: 'MFD001',
      vendorProductId: 'VP001',
      emiCalculationType: 'EMI',
      securityCalculationType: 'Percentage',
      bounceChargeValue: 200,
      bounceChargeCalculationType: 'Fixed',
      preCloserType: 'Percentage',
      preCloserValue: 2.0,
      penalChargeType: 'Percentage',
      penalValue: 1.5,
      healthCareProduct: 'Basic',
      healthCareDeductType: 'Monthly',
      loanAmount: 50000,
      status: 'active',
      flexibleEmi: false,
      isDynamicRepayment: false,
      eirInterestRate: 13.8,
      effectiveStartDate: '2024-01-01',
      effectiveEndDate: '2024-12-31',
      emiStartSequence: 1,
      emiEndSequence: 12,
      emiAmount: 4500,
      insertedOn: '2024-01-15',
      insertedBy: 'Admin User'
    },
    {
      id: '2',
      productGroupId: 'PG002',
      productId: 'P002',
      productCode: 'GL001',
      productName: 'Group Loan',
      interestRate: 10.5,
      tenureInMonths: 18,
      lpfCalcType: 'Fixed',
      lpfValue: 1000,
      lpfDeductType: 'Monthly',
      securityValue: 5.0,
      docChargeType: 'Percentage',
      docChargeValue: 1.0,
      principalRepaymentFrequency: 'Monthly',
      interestRepaymentFrequency: 'Monthly',
      moratoriumPeriod: 1,
      irrWithInsurance: 12.1,
      netOffCalculationValue: 0,
      netOffCalculationFor: 'Interest',
      netOffCalculationType: 'None',
      interestCalculationOn: 'Flat Rate',
      isSameDateEmi: false,
      documentProductAmount: 200000,
      totalInstallment: 18,
      isFixedDayEmi: true,
      isTopUp: true,
      documentProductName: 'Group Loan Document',
      documentProductCode: 'GLD001',
      vendorProductId: 'VP002',
      emiCalculationType: 'Principal + Interest',
      securityCalculationType: 'Fixed',
      bounceChargeValue: 300,
      bounceChargeCalculationType: 'Fixed',
      preCloserType: 'Fixed',
      preCloserValue: 1000,
      penalChargeType: 'Fixed',
      penalValue: 500,
      healthCareProduct: 'Premium',
      healthCareDeductType: 'Upfront',
      loanAmount: 100000,
      status: 'active',
      flexibleEmi: true,
      isDynamicRepayment: true,
      eirInterestRate: 11.8,
      effectiveStartDate: '2024-01-01',
      effectiveEndDate: '2024-12-31',
      emiStartSequence: 2,
      emiEndSequence: 18,
      emiAmount: 6200,
      insertedOn: '2024-01-12',
      insertedBy: 'Manager User'
    }
  ];

  const productGroupIds = Array.from(new Set(sampleProducts.map(p => p.productGroupId)));
  const productIds = Array.from(new Set(sampleProducts.map(p => p.productId)));

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setProducts(sampleProducts);
        setFilteredProducts(sampleProducts);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
      setLoading(false);
    }
  };

  const handleFilter = (filters: ProductFilterOptions) => {
    let filtered = products;

    if (filters.productGroupId) {
      filtered = filtered.filter(product => product.productGroupId === filters.productGroupId);
    }
    if (filters.productId) {
      filtered = filtered.filter(product => product.productId === filters.productId);
    }
    if (filters.status) {
      filtered = filtered.filter(product => product.status === filters.status);
    }
    if (filters.insertedOnFrom) {
      filtered = filtered.filter(product => product.insertedOn >= filters.insertedOnFrom!);
    }
    if (filters.insertedOnTo) {
      filtered = filtered.filter(product => product.insertedOn <= filters.insertedOnTo!);
    }

    setFilteredProducts(filtered);
  };

  const handleUpload = () => {
    setSuccess('Upload functionality will be implemented');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleValidate = () => {
    setSuccess('Validation functionality will be implemented');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleProcess = () => {
    setSuccess('Process functionality will be implemented');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDownload = () => {
    const headers = [
      'Product Group Id', 'Product Id', 'Product Code', 'Product Name', 'Interest Rate',
      'Tenure (In Months)', 'LPF Calc Type', 'LPF Value', 'LPF Deduct Type', 'Security Value',
      'Doc Charge Type', 'Doc Charge Value', 'Principal Repayment Frequency',
      'Interest Repayment Frequency', 'Moratorium Period', 'Insurance Id', 'Insurance Deduct Type',
      'IRR With Insurance', 'Net Off Calculation Value', 'Net Off Calculation For',
      'Net Off Calculation Type', 'Interest Calculation On', 'Is Same Date EMI',
      'Document Product Amount', 'Total Installment', 'Is Fixed Day EMI', 'Is Top Up',
      'Document Product Name', 'Document Product Code', 'Vendor Product Id',
      'EMI Calculation Type', 'Security Calculation Type', 'Bounce Charge Value',
      'Bounce Charge Calculation Type', 'Pre Closer Type', 'Pre Closer Value',
      'Penal Charge Type', 'Penal Value', 'Health Care Product', 'Health Care Deduct Type',
      'Loan Amount', 'Status', 'Flexible EMI', 'Is Dynamic Repayment', 'EIR Interest Rate',
      'Effective Start Date', 'Effective End Date', 'EMI Start Sequence', 'EMI End Sequence',
      'EMI Amount', 'Inserted On', 'Inserted By', 'Updated On', 'Updated By'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredProducts.map(product => [
        product.productGroupId,
        product.productId,
        product.productCode,
        product.productName,
        product.interestRate,
        product.tenureInMonths,
        product.lpfCalcType,
        product.lpfValue,
        product.lpfDeductType,
        product.securityValue,
        product.docChargeType,
        product.docChargeValue,
        product.principalRepaymentFrequency,
        product.interestRepaymentFrequency,
        product.moratoriumPeriod,
        product.insuranceId || '',
        product.insuranceDeductType || '',
        product.irrWithInsurance,
        product.netOffCalculationValue,
        product.netOffCalculationFor,
        product.netOffCalculationType,
        product.interestCalculationOn,
        product.isSameDateEmi ? 'Yes' : 'No',
        product.documentProductAmount,
        product.totalInstallment,
        product.isFixedDayEmi ? 'Yes' : 'No',
        product.isTopUp ? 'Yes' : 'No',
        product.documentProductName,
        product.documentProductCode,
        product.vendorProductId,
        product.emiCalculationType,
        product.securityCalculationType,
        product.bounceChargeValue,
        product.bounceChargeCalculationType,
        product.preCloserType,
        product.preCloserValue,
        product.penalChargeType,
        product.penalValue,
        product.healthCareProduct,
        product.healthCareDeductType,
        product.loanAmount,
        product.status,
        product.flexibleEmi ? 'Yes' : 'No',
        product.isDynamicRepayment ? 'Yes' : 'No',
        product.eirInterestRate,
        product.effectiveStartDate,
        product.effectiveEndDate,
        product.emiStartSequence,
        product.emiEndSequence,
        product.emiAmount,
        product.insertedOn,
        product.insertedBy,
        product.updatedOn || '',
        product.updatedBy || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setSuccess('CSV exported successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEditProduct = (product: LoanProduct) => {
    setEditingProduct(product);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      setProducts(prev => prev.filter(p => p.id !== productId));
      setFilteredProducts(prev => prev.filter(p => p.id !== productId));
      setSuccess('Product deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete product');
      console.error('Error deleting product:', err);
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
      render: (value: any, row: LoanProduct) => (
        <div className="flex items-center space-x-2">
          <PermissionGuard module="loan" permission="write">
            <button
              onClick={() => handleEditProduct(row)}
              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors duration-200"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard module="loan" permission="delete">
            <button
              onClick={() => handleDeleteProduct(row.id)}
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
      key: 'productGroupId',
      label: 'Product Group Id',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'productId',
      label: 'Product Id',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'productCode',
      label: 'Product Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'productName',
      label: 'Product Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'interestRate',
      label: 'Interest Rate',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <Percent className="w-4 h-4 text-green-500" />
          <span className="font-medium">{value}%</span>
        </div>
      )
    },
    {
      key: 'tenureInMonths',
      label: 'Tenure (In Months)',
      sortable: true,
      render: (value: number) => `${value} months`
    },
    {
      key: 'lpfCalcType',
      label: 'LPF Calc Type',
      sortable: true,
    },
    {
      key: 'lpfValue',
      label: 'LPF Value',
      sortable: true,
      render: (value: number) => value.toString()
    },
    {
      key: 'lpfDeductType',
      label: 'LPF Deduct Type',
      sortable: true,
    },
    {
      key: 'securityValue',
      label: 'Security Value',
      sortable: true,
      render: (value: number) => value.toString()
    },
    {
      key: 'docChargeType',
      label: 'Doc Charge Type',
      sortable: true,
    },
    {
      key: 'docChargeValue',
      label: 'Doc Charge Value',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'principalRepaymentFrequency',
      label: 'Principal Repayment Frequency',
      sortable: true,
    },
    {
      key: 'interestRepaymentFrequency',
      label: 'Interest Repayment Frequency',
      sortable: true,
    },
    {
      key: 'moratoriumPeriod',
      label: 'Moratorium Period',
      sortable: true,
      render: (value: number) => `${value} months`
    },
    {
      key: 'insuranceId',
      label: 'Insurance Id',
      render: (value?: string) => value || '-'
    },
    {
      key: 'insuranceDeductType',
      label: 'Insurance Deduct Type',
      render: (value?: string) => value || '-'
    },
    {
      key: 'irrWithInsurance',
      label: 'IRR With Insurance',
      sortable: true,
      render: (value: number) => `${value}%`
    },
    {
      key: 'netOffCalculationValue',
      label: 'Net Off Calculation Value',
      sortable: true,
      render: (value: number) => value.toString()
    },
    {
      key: 'netOffCalculationFor',
      label: 'Net Off Calculation For',
      sortable: true,
    },
    {
      key: 'netOffCalculationType',
      label: 'Net Off Calculation Type',
      sortable: true,
    },
    {
      key: 'interestCalculationOn',
      label: 'Interest Calculation On',
      sortable: true,
    },
    {
      key: 'isSameDateEmi',
      label: 'Is Same Date EMI',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'documentProductAmount',
      label: 'Document Product Amount',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'totalInstallment',
      label: 'Total Installment',
      sortable: true,
    },
    {
      key: 'isFixedDayEmi',
      label: 'Is Fixed Day EMI',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'isTopUp',
      label: 'Is Top Up',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'documentProductName',
      label: 'Document Product Name',
      sortable: true,
    },
    {
      key: 'documentProductCode',
      label: 'Document Product Code',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'vendorProductId',
      label: 'Vendor Product Id',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono">{value}</span>
      )
    },
    {
      key: 'emiCalculationType',
      label: 'EMI Calculation Type',
      sortable: true,
    },
    {
      key: 'securityCalculationType',
      label: 'Security Calculation Type',
      sortable: true,
    },
    {
      key: 'bounceChargeValue',
      label: 'Bounce Charge Value',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>₹{value.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'bounceChargeCalculationType',
      label: 'Bounce Charge Calculation Type',
      sortable: true,
    },
    {
      key: 'preCloserType',
      label: 'Pre Closer Type',
      sortable: true,
    },
    {
      key: 'preCloserValue',
      label: 'Pre Closer Value',
      sortable: true,
      render: (value: number) => value.toString()
    },
    {
      key: 'penalChargeType',
      label: 'Penal Charge Type',
      sortable: true,
    },
    {
      key: 'penalValue',
      label: 'Penal Value',
      sortable: true,
      render: (value: number) => value.toString()
    },
    {
      key: 'healthCareProduct',
      label: 'Health Care Product',
      sortable: true,
    },
    {
      key: 'healthCareDeductType',
      label: 'Health Care Deduct Type',
      sortable: true,
    },
    {
      key: 'loanAmount',
      label: 'Loan Amount',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
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
      key: 'flexibleEmi',
      label: 'Flexible EMI',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'isDynamicRepayment',
      label: 'Is Dynamic Repayment',
      render: (value: boolean) => getBooleanIcon(value)
    },
    {
      key: 'eirInterestRate',
      label: 'EIR Interest Rate',
      sortable: true,
      render: (value: number) => `${value}%`
    },
    {
      key: 'effectiveStartDate',
      label: 'Effective Start Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'effectiveEndDate',
      label: 'Effective End Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'emiStartSequence',
      label: 'EMI Start Sequence',
      sortable: true,
    },
    {
      key: 'emiEndSequence',
      label: 'EMI End Sequence',
      sortable: true,
    },
    {
      key: 'emiAmount',
      label: 'EMI Amount',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
      )
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
          <span className="text-gray-600 dark:text-gray-400">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage loan products and configurations</p>
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Product Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredProducts.length} records found
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <ProductFilterDropdown
                onFilter={handleFilter}
                productGroupIds={productGroupIds}
                productIds={productIds}
              />
              
              <PermissionGuard module="loan" permission="write">
                <button
                  onClick={handleUpload}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
                >
                  <Upload className="w-4 h-4" />
                  <span>Uploader</span>
                </button>
              </PermissionGuard>

              <PermissionGuard module="loan" permission="write">
                <button
                  onClick={handleValidate}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Validate</span>
                </button>
              </PermissionGuard>

              <PermissionGuard module="loan" permission="write">
                <button
                  onClick={handleProcess}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
                >
                  <Play className="w-4 h-4" />
                  <span>Process</span>
                </button>
              </PermissionGuard>
              
              <PermissionGuard module="loan" permission="read">
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-white"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
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
              {filteredProducts.map((product, index) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {column.render ? column.render(product[column.key as keyof LoanProduct], product) : product[column.key as keyof LoanProduct]}
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