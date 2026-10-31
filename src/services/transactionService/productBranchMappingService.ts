import { apiFetch } from '../../lib/api';


export interface MappingProduct { id: string; productCode: string; productName: string; productGroupId: string; category?: string; interestRate?: number; tenure?: number; minAmount?: number; maxAmount?: number; status: string; }
export interface MappingBranch { id: string; branchCode: string; branchName: string; location: string; status: string; }
export interface ProductBranchMapping { id: string; productId: string; branchId: string; productName: string; branchName: string; productGroupId?: string; productGroupName?: string; assignedDate: string; status: 'active' | 'inactive'; }
export interface MappingOptions { productGroups: { id: string; productGroupCode: string; productGroupName: string; status: string }[]; products: MappingProduct[]; branches: MappingBranch[]; }
 
const MAPPING_BASE = '/api/product-branch-mappings';
 
export const productBranchMappingService = {
  getOptions: async (): Promise<MappingOptions> => {
    const res = await apiFetch(`${MAPPING_BASE}/options`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to load mapping options');
    return json.data;
  },
  getProducts: async (): Promise<MappingProduct[]> => (await productBranchMappingService.getOptions()).products,
 
  getBranches: async (): Promise<MappingBranch[]> => {
    return (await productBranchMappingService.getOptions()).branches;
  },
 
  getMappings: async (): Promise<ProductBranchMapping[]> => {
    const res = await apiFetch(MAPPING_BASE);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to load mappings');
    return json.data ?? json;
  },
 
  saveMapping: async (productId: string, branchIds: string[]): Promise<{ success: boolean; message?: string }> => {
    const res = await apiFetch(MAPPING_BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, branchIds }) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || json.message || 'Failed to save mapping');
    return json;
  },
  getProductsByBranch: async (branchId: string): Promise<MappingProduct[]> => {
    const res = await apiFetch(`${MAPPING_BASE}/by-branch/${encodeURIComponent(branchId)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to load branch products');
    return json.data ?? [];
  },
  updateMappingStatus: async (id: string, status: 'active' | 'inactive'): Promise<ProductBranchMapping> => {
    const res = await apiFetch(`${MAPPING_BASE}/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to update mapping');
    return json.data;
  },
};
