import { apiFetch } from '../../lib/api';


export interface MappingProduct { id: string; productCode: string; productName: string; category: string; interestRate: number; tenure: number; minAmount: number; maxAmount: number; status: string; }
export interface MappingBranch { id: string; branchCode: string; branchName: string; location: string; status: string; }
export interface ProductBranchMapping { id: string; productId: string; branchId: string; productName: string; branchName: string; assignedDate: string; status: 'active' | 'inactive'; }
 
const MAPPING_BASE = '/api/product-branch-mappings';
 
export const productBranchMappingService = {
  getProducts: async (): Promise<MappingProduct[]> => {
    const res = await apiFetch(`${MAPPING_BASE}/products`);
    const json = await res.json();
    return json.data ?? json;
  },
 
  getBranches: async (): Promise<MappingBranch[]> => {
    const res = await apiFetch(`${MAPPING_BASE}/branches`);
    const json = await res.json();
    return json.data ?? json;
  },
 
  getMappings: async (): Promise<ProductBranchMapping[]> => {
    const res = await apiFetch(MAPPING_BASE);
    const json = await res.json();
    return json.data ?? json;
  },
 
  saveMapping: async (productId: string, branchIds: string[]): Promise<{ success: boolean; message?: string }> => {
    const res = await apiFetch(MAPPING_BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, branchIds }) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to save mapping');
    return json;
  },
};