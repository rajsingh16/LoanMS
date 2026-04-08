import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Search } from 'lucide-react';
import { LoanProduct, Branch, ProductBranchMapping } from '../../../types';

export const ProductBranchMappingPage: React.FC = () => {
  const [products] = useState<LoanProduct[]>([
    { id: '1', productCode: 'MF001', productName: 'Micro Finance Loan', category: 'Micro Finance', interestRate: 12, tenure: 12, minAmount: 10000, maxAmount: 100000, status: 'active' },
    { id: '2', productCode: 'GL001', productName: 'Group Loan', category: 'Group Lending', interestRate: 10, tenure: 18, minAmount: 50000, maxAmount: 500000, status: 'active' },
    { id: '3', productCode: 'IL001', productName: 'Individual Loan', category: 'Individual Lending', interestRate: 14, tenure: 24, minAmount: 25000, maxAmount: 250000, status: 'active' },
    { id: '4', productCode: 'EL001', productName: 'Emergency Loan', category: 'Emergency', interestRate: 16, tenure: 6, minAmount: 5000, maxAmount: 50000, status: 'active' }
  ]);

  const [branches] = useState<Branch[]>([
    { id: '1', branchCode: 'BR001', branchName: 'Main Branch', location: 'Central Delhi', status: 'active' },
    { id: '2', branchCode: 'BR002', branchName: 'North Branch', location: 'North Delhi', status: 'active' },
    { id: '3', branchCode: 'BR003', branchName: 'South Branch', location: 'South Delhi', status: 'active' },
    { id: '4', branchCode: 'BR004', branchName: 'East Branch', location: 'East Delhi', status: 'active' },
    { id: '5', branchCode: 'BR005', branchName: 'West Branch', location: 'West Delhi', status: 'active' }
  ]);

  const [mappings, setMappings] = useState<ProductBranchMapping[]>([
    { id: '1', productId: '1', branchId: '1', productName: 'Micro Finance Loan', branchName: 'Main Branch', assignedDate: '2024-01-10', status: 'active' },
    { id: '2', productId: '1', branchId: '2', productName: 'Micro Finance Loan', branchName: 'North Branch', assignedDate: '2024-01-10', status: 'active' },
    { id: '3', productId: '2', branchId: '1', productName: 'Group Loan', branchName: 'Main Branch', assignedDate: '2024-01-12', status: 'active' }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [assignedBranches, setAssignedBranches] = useState<Branch[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);

  const categories = Array.from(new Set(products.map(p => p.category)));
  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category === selectedCategory)
    : products;

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    
    // Get branches already assigned to this product
    const assignedBranchIds = mappings
      .filter(m => m.productId === productId && m.status === 'active')
      .map(m => m.branchId);
    
    const assigned = branches.filter(b => assignedBranchIds.includes(b.id));
    const available = branches.filter(b => !assignedBranchIds.includes(b.id));
    
    setAssignedBranches(assigned);
    setAvailableBranches(available);
    setSelectedAvailable([]);
    setSelectedAssigned([]);
  };

  const handleMoveToAssigned = () => {
    const branchesToMove = availableBranches.filter(b => selectedAvailable.includes(b.id));
    setAssignedBranches(prev => [...prev, ...branchesToMove]);
    setAvailableBranches(prev => prev.filter(b => !selectedAvailable.includes(b.id)));
    setSelectedAvailable([]);
  };

  const handleMoveToAvailable = () => {
    const branchesToMove = assignedBranches.filter(b => selectedAssigned.includes(b.id));
    setAvailableBranches(prev => [...prev, ...branchesToMove]);
    setAssignedBranches(prev => prev.filter(b => !selectedAssigned.includes(b.id)));
    setSelectedAssigned([]);
  };

  const handleSaveMapping = () => {
    if (!selectedProduct) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    // Remove existing mappings for this product
    const updatedMappings = mappings.filter(m => m.productId !== selectedProduct);

    // Add new mappings
    const newMappings = assignedBranches.map(branch => ({
      id: `${selectedProduct}-${branch.id}`,
      productId: selectedProduct,
      branchId: branch.id,
      productName: product.productName,
      branchName: branch.branchName,
      assignedDate: new Date().toISOString().split('T')[0],
      status: 'active' as const
    }));

    setMappings([...updatedMappings, ...newMappings]);
    alert('Product-Branch mapping saved successfully!');
  };

  const toggleAvailableSelection = (branchId: string) => {
    setSelectedAvailable(prev => 
      prev.includes(branchId) 
        ? prev.filter(id => id !== branchId)
        : [...prev, branchId]
    );
  };

  const toggleAssignedSelection = (branchId: string) => {
    setSelectedAssigned(prev => 
      prev.includes(branchId) 
        ? prev.filter(id => id !== branchId)
        : [...prev, branchId]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Product Branch Mapping</h1>
        <p className="text-gray-600 mt-1">Assign products to branches for loan processing</p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Search className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedProduct('');
                setAvailableBranches([]);
                setAssignedBranches([]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => handleProductSelect(e.target.value)}
              disabled={!selectedCategory}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Product</option>
              {filteredProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.productName} ({product.productCode})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mapping Interface */}
      {selectedProduct && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Branch Assignment</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Available Branches */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Available Branches</h4>
                <span className="text-sm text-gray-500">({availableBranches.length})</span>
              </div>
              
              <div className="border border-gray-300 rounded-lg h-80 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {availableBranches.map(branch => (
                    <div
                      key={branch.id}
                      onClick={() => toggleAvailableSelection(branch.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                        selectedAvailable.includes(branch.id)
                          ? 'bg-blue-100 border-blue-300 border'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="font-medium text-sm">{branch.branchName}</div>
                      <div className="text-xs text-gray-500">{branch.branchCode} • {branch.location}</div>
                    </div>
                  ))}
                  {availableBranches.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No available branches
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <button
                onClick={handleMoveToAssigned}
                disabled={selectedAvailable.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Assign</span>
              </button>
              
              <button
                onClick={handleMoveToAvailable}
                disabled={selectedAssigned.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Remove</span>
              </button>
            </div>

            {/* Assigned Branches */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Assigned Branches</h4>
                <span className="text-sm text-gray-500">({assignedBranches.length})</span>
              </div>
              
              <div className="border border-gray-300 rounded-lg h-80 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {assignedBranches.map(branch => (
                    <div
                      key={branch.id}
                      onClick={() => toggleAssignedSelection(branch.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                        selectedAssigned.includes(branch.id)
                          ? 'bg-green-100 border-green-300 border'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="font-medium text-sm">{branch.branchName}</div>
                      <div className="text-xs text-gray-500">{branch.branchCode} • {branch.location}</div>
                    </div>
                  ))}
                  {assignedBranches.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No assigned branches
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveMapping}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Save Mapping
            </button>
          </div>
        </div>
      )}

      {/* Current Mappings Display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Product-Branch Mappings</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mappings.map(mapping => (
                <tr key={mapping.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {mapping.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mapping.branchName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(mapping.assignedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                      mapping.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {mapping.status.charAt(0).toUpperCase() + mapping.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};