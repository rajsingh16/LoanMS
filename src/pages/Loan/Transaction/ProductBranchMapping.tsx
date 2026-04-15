import React, { useState, useEffect} from 'react';
//import { DataTable } from '../../../components/Common/DataTable';
//import { PermissionGuard } from '../../../components/Common/PermissionGuard';

import {
   CheckCircle, AlertCircle,
} from 'lucide-react';
import { ArrowRight, ArrowLeft, Search } from 'lucide-react';
import { productBranchMappingService, MappingProduct, MappingBranch, ProductBranchMapping } from '../../../services/transactionService/productBranchMappingService';

export const ProductBranchMappingPage: React.FC = () => {
  const [products, setProducts] = useState<MappingProduct[]>([]);
  const [branches, setBranches] = useState<MappingBranch[]>([]);
  const [mappings, setMappings] = useState<ProductBranchMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [availableBranches, setAvailableBranches] = useState<MappingBranch[]>([]);
  const [assignedBranches, setAssignedBranches] = useState<MappingBranch[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, b, m] = await Promise.all([productBranchMappingService.getProducts(), productBranchMappingService.getBranches(), productBranchMappingService.getMappings()]);
        setProducts(p); setBranches(b); setMappings(m);
      } catch { setError('Failed to load data'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const categories = Array.from(new Set(products.map(p => p.category)));
  const filteredProducts = selectedCategory ? products.filter(p => p.category === selectedCategory) : products;

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    const assignedIds = mappings.filter(m => m.productId === productId && m.status === 'active').map(m => m.branchId);
    setAssignedBranches(branches.filter(b => assignedIds.includes(b.id)));
    setAvailableBranches(branches.filter(b => !assignedIds.includes(b.id)));
    setSelectedAvailable([]); setSelectedAssigned([]);
  };

  const moveToAssigned = () => {
    const toMove = availableBranches.filter(b => selectedAvailable.includes(b.id));
    setAssignedBranches(prev => [...prev, ...toMove]);
    setAvailableBranches(prev => prev.filter(b => !selectedAvailable.includes(b.id)));
    setSelectedAvailable([]);
  };

  const moveToAvailable = () => {
    const toMove = assignedBranches.filter(b => selectedAssigned.includes(b.id));
    setAvailableBranches(prev => [...prev, ...toMove]);
    setAssignedBranches(prev => prev.filter(b => !selectedAssigned.includes(b.id)));
    setSelectedAssigned([]);
  };

  const handleSaveMapping = async () => {
    if (!selectedProduct) return;
    try {
      setIsSaving(true);
      await productBranchMappingService.saveMapping(selectedProduct, assignedBranches.map(b => b.id));
      const updatedMappings = await productBranchMappingService.getMappings();
      setMappings(updatedMappings);
      setSuccess('Product-Branch mapping saved successfully!'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to save mapping'); }
    finally { setIsSaving(false); }
  };

  const toggleAvailable = (id: string) => setSelectedAvailable(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleAssigned = (id: string) => setSelectedAssigned(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Branch Mapping</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Assign products to branches for loan processing</p></div>
      {success && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2"><CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{success}</span></div>}
      {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2"><AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span></div>}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4"><Search className="w-5 h-5 text-gray-400" /><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search & Filter</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Category</label>
            <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setSelectedProduct(''); setAvailableBranches([]); setAssignedBranches([]); }} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="">Select Category</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product</label>
            <select value={selectedProduct} onChange={e => handleProductSelect(e.target.value)} disabled={!selectedCategory} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed">
              <option value="">Select Product</option>{filteredProducts.map(p => <option key={p.id} value={p.id}>{p.productName} ({p.productCode})</option>)}
            </select></div>
        </div>
      </div>

      {selectedProduct && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Branch Assignment</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[{ title: 'Available Branches', list: availableBranches, selected: selectedAvailable, toggle: toggleAvailable, selectedColor: 'bg-blue-100 border-blue-300 dark:bg-blue-900/30' }, { title: 'Assigned Branches', list: assignedBranches, selected: selectedAssigned, toggle: toggleAssigned, selectedColor: 'bg-green-100 border-green-300 dark:bg-green-900/30' }].map(({ title, list, selected, toggle, selectedColor }, i) => (
              <React.Fragment key={title}>
                {i === 1 && (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <button onClick={moveToAssigned} disabled={selectedAvailable.length === 0} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"><ArrowRight className="w-4 h-4" /><span>Assign</span></button>
                    <button onClick={moveToAvailable} disabled={selectedAssigned.length === 0} className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"><ArrowLeft className="w-4 h-4" /><span>Remove</span></button>
                  </div>
                )}
                <div className="space-y-4">
                  <div className="flex items-center justify-between"><h4 className="font-medium text-gray-900 dark:text-white">{title}</h4><span className="text-sm text-gray-500 dark:text-gray-400">({list.length})</span></div>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg h-80 overflow-y-auto">
                    <div className="p-2 space-y-1">
                      {list.map(branch => (
                        <div key={branch.id} onClick={() => toggle(branch.id)} className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${selected.includes(branch.id) ? `${selectedColor} border` : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'}`}>
                          <div className="font-medium text-sm text-gray-900 dark:text-white">{branch.branchName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{branch.branchCode} · {branch.location}</div>
                        </div>
                      ))}
                      {list.length === 0 && <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">No branches</div>}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleSaveMapping} disabled={isSaving} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">{isSaving ? 'Saving...' : 'Save Mapping'}</button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Product-Branch Mappings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>{['Product', 'Branch', 'Assigned Date', 'Status'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading mappings…</td>
                </tr>
              ) : (
                mappings.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{m.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{m.branchName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{new Date(m.assignedDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${m.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>{m.status.charAt(0).toUpperCase() + m.status.slice(1)}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};