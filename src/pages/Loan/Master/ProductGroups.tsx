import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/Common/Modal';
import { ProductGroupFilterDropdown } from '../../../components/Common/ProductGroupFilterDropdown';
import { ProductGroupForm } from '../../../components/Forms/ProductGroupForm';
import { CSVUpload } from '../../../components/Common/CSVUpload';
import { PermissionGuard } from '../../../components/Common/PermissionGuard';
import { DataTable } from '../../../components/Common/DataTable';
import { ProductGroup, ProductGroupFilterOptions } from '../../../types/product';
import { productGroupService, ProductGroupFormData } from '../../../services/productgroupService';
import { useAuth } from '../../../hooks/useAuth';
import {
  Package, Calendar, Edit, Trash2, CheckCircle, XCircle,
  Download, Upload, AlertCircle, FileDown, Percent, Users,
} from 'lucide-react';

export const ProductGroups: React.FC = () => {
  const { hasPermission } = useAuth();
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [filteredProductGroups, setFilteredProductGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [editingProductGroup, setEditingProductGroup] = useState<ProductGroup | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const businessPartners = Array.from(new Set(productGroups.map(pg => pg.bcId).filter(Boolean)));

  useEffect(() => { loadProductGroups(); }, []);

  const loadProductGroups = async () => {
    try {
      setLoading(true);
      const data = await productGroupService.getAllProductGroups();
      setProductGroups(data); setFilteredProductGroups(data);
    } catch { setError('Failed to load product groups'); }
    finally { setLoading(false); }
  };

  const handleFilter = (filters: ProductGroupFilterOptions) => {
    let f = productGroups;
    if (filters.businessPartner) f = f.filter(pg => pg.productGroupName.toLowerCase().includes(filters.businessPartner!.toLowerCase()));
    if (filters.status) f = f.filter(pg => pg.status === filters.status);
    setFilteredProductGroups(f);
  };

  const handleAdd = async (formData: ProductGroupFormData) => {
    try {
      setIsSubmitting(true);
      const newRecord = await productGroupService.createProductGroup(formData);
      setProductGroups(prev => [...prev, newRecord]); setFilteredProductGroups(prev => [...prev, newRecord]);
      setShowAddModal(false); setSuccess('Product group created successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to create product group'); }
    finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (formData: ProductGroupFormData) => {
    if (!editingProductGroup) return;
    try {
      setIsSubmitting(true);
      const updated = await productGroupService.updateProductGroup(editingProductGroup.id, formData);
      setProductGroups(prev => prev.map(pg => pg.id === editingProductGroup.id ? updated : pg));
      setFilteredProductGroups(prev => prev.map(pg => pg.id === editingProductGroup.id ? updated : pg));
      setEditingProductGroup(null); setSuccess('Product group updated successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to update product group'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product group?')) return;
    try {
      await productGroupService.deleteProductGroup(id);
      setProductGroups(prev => prev.filter(pg => pg.id !== id)); setFilteredProductGroups(prev => prev.filter(pg => pg.id !== id));
      setSuccess('Product group deleted successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to delete product group'); }
  };

  const handleCSVUpload = async (file: File) => {
    try {
      const result = await productGroupService.uploadProductGroupsCSV(file);
      if (result.success) { await loadProductGroups(); setShowCSVModal(false); setSuccess(`CSV upload completed! ${result.created} created, ${result.updated} updated, ${result.errors} errors.`); setTimeout(() => setSuccess(''), 5000); }
      else { setError(result.message || 'CSV upload failed'); }
    } catch { setError('Failed to upload CSV'); }
  };

  const getStatusIcon = (status: string) => status === 'active' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />;
  const getBooleanIcon = (value: boolean) => value ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" />;

  const columns = [
    { key: 'actions', label: 'Action', render: (_: unknown, row: ProductGroup) => (<div className="flex items-center space-x-2"><PermissionGuard module="loan" permission="write"><button onClick={() => setEditingProductGroup(row)} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"><Edit className="w-4 h-4" /></button></PermissionGuard><PermissionGuard module="loan" permission="delete"><button onClick={() => handleDelete(row.id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><Trash2 className="w-4 h-4" /></button></PermissionGuard></div>) },
    { key: 'productGroupCode', label: 'Product Group Code', sortable: true, render: (v: string) => <span className="font-mono font-medium">{v}</span> },
    { key: 'productGroupName', label: 'Product Group Name', sortable: true, render: (v: string) => <div className="flex items-center space-x-2"><Package className="w-4 h-4 text-gray-400" /><span className="font-medium">{v}</span></div> },
    { key: 'productGroupSegment', label: 'Segment', sortable: true, render: (v: string) => <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">{v}</span> },
    { key: 'productGroupType', label: 'Type', sortable: true, render: (v: string) => <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">{v}</span> },
    { key: 'status', label: 'Status', sortable: true, render: (v: string) => <div className="flex items-center space-x-2">{getStatusIcon(v)}<span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${v === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span></div> },
    { key: 'secureGroup', label: 'Secure Group', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'qualifiedGroup', label: 'Qualified Group', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'borrowedGroup', label: 'Borrowed Group', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'cycleIncreaseFlag', label: 'Cycle Increase Flag', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'clmSchemeId', label: 'CLM Scheme ID', render: (v?: string) => v || '-' },
    { key: 'minClientPerCenter', label: 'Min Client Per Center', sortable: true, render: (v: number) => <div className="flex items-center space-x-1"><Users className="w-4 h-4 text-gray-400" /><span>{v}</span></div> },
    { key: 'isQrCollectionEnable', label: 'Is QR Collection Enable', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'firstEmiType', label: 'First EMI Type', sortable: true },
    { key: 'minIrr', label: 'Min IRR', sortable: true, render: (v: number) => <div className="flex items-center space-x-1"><Percent className="w-4 h-4 text-green-500" /><span>{v}%</span></div> },
    { key: 'maxIrr', label: 'Max IRR', sortable: true, render: (v: number) => <div className="flex items-center space-x-1"><Percent className="w-4 h-4 text-red-500" /><span>{v}%</span></div> },
    { key: 'isProduct', label: 'Is Product', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'isTranchDisb', label: 'Is Tranche Disb', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'daysInYear', label: 'Days In Year', sortable: true },
    { key: 'bcId', label: 'BC ID', render: (v: string) => <span className="font-mono">{v}</span> },
    { key: 'exclusivePartner', label: 'Exclusive Partner', render: (v: boolean) => getBooleanIcon(v) },
    { key: 'eligibleGender', label: 'Eligible Gender', sortable: true },
    { key: 'insertedOn', label: 'Inserted On', sortable: true, render: (v: string) => <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> },
    { key: 'insertedBy', label: 'Inserted By', sortable: true },
    { key: 'updatedOn', label: 'Updated On', render: (v?: string) => v ? <div className="flex items-center space-x-1"><Calendar className="w-4 h-4 text-gray-400" /><span>{new Date(v).toLocaleDateString()}</span></div> : '-' },
    { key: 'updatedBy', label: 'Updated By', render: (v?: string) => v || '-' },
  ];

  const filterComponent = (
    <div className="flex items-center space-x-3">
      <ProductGroupFilterDropdown onFilter={handleFilter} businessPartners={businessPartners} />
      <PermissionGuard module="loan" permission="read"><button onClick={() => productGroupService.downloadTemplate()} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><FileDown className="w-4 h-4" /><span>Template</span></button></PermissionGuard>
      <PermissionGuard module="loan" permission="read"><button onClick={() => productGroupService.exportProductGroupsCSV(filteredProductGroups)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Download className="w-4 h-4" /><span>Export CSV</span></button></PermissionGuard>
      <PermissionGuard module="loan" permission="write"><button onClick={() => setShowCSVModal(true)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"><Upload className="w-4 h-4" /><span>Upload CSV</span></button></PermissionGuard>
    </div>
  );

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Groups</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Manage product group configurations and settings</p></div>
      {success && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2"><CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{success}</span></div>}
      {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2"><AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span></div>}
      <DataTable columns={columns} data={filteredProductGroups} title="Product Group Management" loading={loading} onAdd={() => setShowAddModal(true)} filterComponent={filterComponent} />
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Product Group" size="xl"><ProductGroupForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} isSubmitting={isSubmitting} /></Modal>
      <Modal isOpen={!!editingProductGroup} onClose={() => setEditingProductGroup(null)} title="Edit Product Group" size="xl">{editingProductGroup && <ProductGroupForm onSubmit={handleUpdate} onCancel={() => setEditingProductGroup(null)} initialData={editingProductGroup} isSubmitting={isSubmitting} />}</Modal>
      <Modal isOpen={showCSVModal} onClose={() => setShowCSVModal(false)} title="Upload Product Groups CSV" size="lg"><CSVUpload onUpload={handleCSVUpload} onCancel={() => setShowCSVModal(false)} templateColumns={['productGroupCode', 'productGroupName', 'productGroupSegment', 'productGroupType', 'status', 'minIrr', 'maxIrr', 'daysInYear', 'eligibleGender']} entityName="product groups" /></Modal>
    </div>
  );
};