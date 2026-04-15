import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { ProductFilterDropdown } from '../../../components/Common/ProductFilterDropdown';
import { ProductForm } from '../../../components/Forms/ProductForm';
import { CSVUpload } from '../../../components/Common/CSVUpload';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { DataTable } from '../../../components/Common/DataTable';
import { LoanProduct, ProductFilterOptions } from '../../../types/product';
import { productService, ProductFormData } from '../../../services/productService';
import { useAuth } from '../../../hooks/useAuth';
import {
  Package, DollarSign, Calendar, Edit, Trash2, CheckCircle, XCircle,
  Download, Upload, AlertCircle, FileDown, FileCheck, Play, Percent,
} from 'lucide-react';

export const Products: React.FC = () => {
  const { hasPermission } = useAuth();
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productGroupIds = Array.from(new Set(products.map(p => p.productGroupId)));
  const productIds = Array.from(new Set(products.map(p => p.productId)));

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data); setFilteredProducts(data);
    } catch { setError('Failed to load products'); }
    finally { setLoading(false); }
  };

  const handleFilter = (filters: ProductFilterOptions) => {
    let f = products;
    if (filters.productGroupId) f = f.filter(p => p.productGroupId === filters.productGroupId);
    if (filters.productId) f = f.filter(p => p.productId === filters.productId);
    if (filters.status) f = f.filter(p => p.status === filters.status);
    if (filters.insertedOnFrom) f = f.filter(p => p.insertedOn >= filters.insertedOnFrom!);
    if (filters.insertedOnTo) f = f.filter(p => p.insertedOn <= filters.insertedOnTo!);
    setFilteredProducts(f);
  };

  const handleAdd = async (formData: ProductFormData) => {
    try {
      setIsSubmitting(true);
      const newRecord = await productService.createProduct(formData);
      setProducts(prev => [...prev, newRecord]); setFilteredProducts(prev => [...prev, newRecord]);
      setShowAddModal(false); setSuccess('Product created successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to create product'); }
    finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (formData: ProductFormData) => {
    if (!editingProduct) return;
    try {
      setIsSubmitting(true);
      const updated = await productService.updateProduct(editingProduct.id, formData);
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
      setFilteredProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
      setEditingProduct(null); setSuccess('Product updated successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to update product'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id)); setFilteredProducts(prev => prev.filter(p => p.id !== id));
      setSuccess('Product deleted successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to delete product'); }
  };

  const handleCSVUpload = async (file: File) => {
    try {
      const result = await productService.uploadProductsCSV(file);
      if (result.success) { await loadProducts(); setShowCSVModal(false); setSuccess(`CSV upload completed! ${result.created} created, ${result.updated} updated, ${result.errors} errors.`); setTimeout(() => setSuccess(''), 5000); }
      else { setError(result.message || 'CSV upload failed'); }
    } catch { setError('Failed to upload CSV'); }
  };

  const handleValidate = async () => {
    setSuccess('Validate: please upload a file to validate.'); setTimeout(() => setSuccess(''), 3000);
  };

  const handleProcess = async () => {
    try {
      const result = await productService.processProducts();
      setSuccess(result.message || 'Products processed successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to process products'); }
  };

  const getStatusIcon = (status: string) => status === 'active' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />;
  const getBooleanIcon = (value: boolean) => value ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" />;

  const columns = [
    { key: 'actions', label: 'Action', render: (_: unknown, row: LoanProduct) => (<div className="flex items-center space-x-2"><PermissionGuard module="loan" permission="write"><button onClick={() => setEditingProduct(row)} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"><Edit className="w-4 h-4" /></button></PermissionGuard><PermissionGuard module="loan" permission="delete"><button onClick={() => handleDelete(row.id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><Trash2 className="w-4 h-4" /></button></PermissionGuard></div>) },
    { key: 'productGroupId', label: 'Product Group Id', sortable: true, render: (v: string) => <span className="font-mono font-medium">{v}</span> },
    { key: 'productId', label: 'Product Id', sortable: true, render: (v: string) => <span className="font-mono font-medium">{v}</span> },
    { key: 'productCode', label: 'Product Code', sortable: true, render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'productName', label: 'Product Name', sortable: true, render: (v: string) => <div className="flex items-center space-x-2"><Package className="w-4 h-4 text-gray-400" /><span className="font-medium">{v}</span></div> },
    { key: 'interestRate', label: 'Interest Rate', sortable: true, render: (v: number) => <div className="flex items-center space-x-1"><Percent className="w-4 h-4 text-green-500" /><span>{v}%</span></div> },
    { key: 'tenureInMonths', label: 'Tenure (Months)', sortable: true, render: (v: number) => `${v} months` },
    { key: 'lpfCalcType', label: 'LPF Calc Type', sortable: true },
    { key: 'lpfValue', label: 'LPF Value', render: (v: number) => String(v) },
    { key: 'lpfDeductType', label: 'LPF Deduct Type', sortable: true },
    { key: 'docChargeType', label: 'Doc Charge Type', sortable: true },
    { key: 'docChargeValue', label: 'Doc Charge Value', render: (v: number) => <div className="flex items-center space-x-1"><DollarSign className="w-4 h-4 text-gray-400" /><span>₹{v.toLocaleString()}</span></div> },
    { key: 'principalRepaymentFrequency', label: 'Principal Repayment Freq', sortable: true },
    { key: 'interestRepaymentFrequency', label: 'Interest Repayment Freq', sortable: true },
    { key: 'moratoriumPeriod', label: 'Moratorium Period', render: (v: number) => `${v} months` },
    { key: 'irrWithInsurance', label: 'IRR With Insurance', render: (v: number) => `${v}%` },
    { key: 'interestCalculationOn', label: 'Interest Calculation On', sortable: true },
    { key: 'isSameDateEmi', label: 'Is Same Date EMI', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'totalInstallment', label: 'Total Installment', sortable: true },
    { key: 'isFixedDayEmi', label: 'Is Fixed Day EMI', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'isTopUp', label: 'Is Top Up', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'loanAmount', label: 'Loan Amount', sortable: true, render: (v: number) => <div className="flex items-center space-x-1"><DollarSign className="w-4 h-4 text-gray-400" /><span className="font-medium">₹{v.toLocaleString()}</span></div> },
    { key: 'status', label: 'Status', sortable: true, render: (v: string) => <div className="flex items-center space-x-2">{getStatusIcon(v)}<span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${v === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span></div> },
    { key: 'flexibleEmi', label: 'Flexible EMI', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'isDynamicRepayment', label: 'Is Dynamic Repayment', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'eirInterestRate', label: 'EIR Interest Rate', render: (v: number) => `${v}%` },
    { key: 'effectiveStartDate', label: 'Effective Start Date', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> },
    { key: 'effectiveEndDate', label: 'Effective End Date', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> },
    { key: 'emiAmount', label: 'EMI Amount', sortable: true, render: (v: number) => <div className="flex items-center space-x-1"><DollarSign className="w-4 h-4 text-gray-400" /><span>₹{v.toLocaleString()}</span></div> },
    { key: 'insertedOn', label: 'Inserted On', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> },
    { key: 'insertedBy', label: 'Inserted By', sortable: true },
    { key: 'updatedOn', label: 'Updated On', render: (v?: string) => v ? <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> : '-' },
    { key: 'updatedBy', label: 'Updated By', render: (v?: string) => v || '-' },
  ];

  const filterComponent = (
    <div className="flex items-center space-x-3">
      <ProductFilterDropdown onFilter={handleFilter} productGroupIds={productGroupIds} productIds={productIds} />
      <PermissionGuard module="loan" permission="read"><button onClick={() => productService.downloadTemplate()} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><FileDown className="w-4 h-4" /><span>Template</span></button></PermissionGuard>
      <PermissionGuard module="loan" permission="read"><button onClick={() => productService.exportProductsCSV(filteredProducts)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Download className="w-4 h-4" /><span>Export CSV</span></button></PermissionGuard>
      <PermissionGuard module="loan" permission="write"><button onClick={() => setShowCSVModal(true)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Upload className="w-4 h-4" /><span>Upload CSV</span></button></PermissionGuard>
      <PermissionGuard module="loan" permission="write"><button onClick={handleValidate} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><FileCheck className="w-4 h-4" /><span>Validate</span></button></PermissionGuard>
      <PermissionGuard module="loan" permission="write"><button onClick={handleProcess} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Play className="w-4 h-4" /><span>Process</span></button></PermissionGuard>
    </div>
  );

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Manage loan products and configurations</p></div>
      {success && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2"><CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{success}</span></div>}
      {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2"><AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span></div>}
      <DataTable columns={columns} data={filteredProducts} title="Product Management" loading={loading} onAdd={() => setShowAddModal(true)} filterComponent={filterComponent} />
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Product" size="xl"><ProductForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} isSubmitting={isSubmitting} /></Modal>
      <Modal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} title="Edit Product" size="xl">{editingProduct && <ProductForm onSubmit={handleUpdate} onCancel={() => setEditingProduct(null)} initialData={editingProduct} isSubmitting={isSubmitting} />}</Modal>
      <Modal isOpen={showCSVModal} onClose={() => setShowCSVModal(false)} title="Upload Products CSV" size="lg"><CSVUpload onUpload={handleCSVUpload} onCancel={() => setShowCSVModal(false)} templateColumns={['productGroupId', 'productCode', 'productName', 'interestRate', 'tenureInMonths', 'loanAmount', 'status', 'effectiveStartDate', 'effectiveEndDate']} entityName="products" /></Modal>
    </div>
  );
};