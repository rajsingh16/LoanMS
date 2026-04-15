import { ProductGroup, ProductGroupFilterOptions } from '../types/product';
import { apiFetch } from '../lib/api';

export type ProductGroupFormData = Omit<ProductGroup, 'id' | 'insertedOn' | 'insertedBy' | 'updatedOn' | 'updatedBy'>;

const BASE_URL = '/api/product-groups';

export const productGroupService = {
  getAllProductGroups: async (): Promise<ProductGroup[]> => {
    const res = await apiFetch(BASE_URL);
    const json = await res.json();
    return json ?? json;
  },

  createProductGroup: async (formData: ProductGroupFormData): Promise<ProductGroup> => {
    const res = await apiFetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create product group');
    return json.data ?? json;
  },

  updateProductGroup: async (id: string, formData: ProductGroupFormData): Promise<ProductGroup> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update product group');
    return json.data ?? json;
  },

  deleteProductGroup: async (id: string): Promise<void> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Failed to delete product group');
    }
  },

  uploadProductGroupsCSV: async (
    file: File
  ): Promise<{ success: boolean; created: number; updated: number; errors: number; message?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiFetch(`${BASE_URL}/upload-csv`, { method: 'POST', body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'CSV upload failed');
    return json;
  },

  exportProductGroupsCSV: async (records: ProductGroup[]): Promise<void> => {
    const headers = [
      'Product Group Code', 'Product Group Name', 'Product Group Segment', 'Product Group Type',
      'Status', 'Min IRR', 'Max IRR', 'Days In Year', 'Eligible Gender',
      'Inserted On', 'Inserted By',
    ];
    const csv = [
      headers.join(','),
      ...records.map(pg => [
        pg.productGroupCode, pg.productGroupName, pg.productGroupSegment, pg.productGroupType,
        pg.status, pg.minIrr, pg.maxIrr, pg.daysInYear, pg.eligibleGender,
        pg.insertedOn, pg.insertedBy,
      ].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `product_groups_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  downloadTemplate: async (): Promise<void> => {
    const headers = [
      'productGroupCode', 'productGroupName', 'productGroupSegment', 'productGroupType',
      'status', 'minIrr', 'maxIrr', 'daysInYear', 'eligibleGender',
    ];
    const blob = new Blob([headers.join(',')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'product_groups_template.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};