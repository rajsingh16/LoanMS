import { LoanProduct, ProductFilterOptions } from '../types/product';
import { apiFetch } from '../lib/api';

export type ProductFormData = Omit<LoanProduct, 'id' | 'insertedOn' | 'insertedBy' | 'updatedOn' | 'updatedBy'>;

const BASE_URL = '/api/products';

export const productService = {
  getAllProducts: async (): Promise<LoanProduct[]> => {
    const res = await apiFetch(BASE_URL);
    const json = await res.json();
    return json.data ?? json;
  },

  createProduct: async (formData: ProductFormData): Promise<LoanProduct> => {
    const res = await apiFetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create product');
    return json.data ?? json;
  },

  updateProduct: async (id: string, formData: ProductFormData): Promise<LoanProduct> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update product');
    return json.data ?? json;
  },

  deleteProduct: async (id: string): Promise<void> => {
    const res = await apiFetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Failed to delete product');
    }
  },

  uploadProductsCSV: async (
    file: File
  ): Promise<{ success: boolean; created: number; updated: number; errors: number; message?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiFetch(`${BASE_URL}/upload-csv`, { method: 'POST', body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'CSV upload failed');
    return json;
  },

  validateProductsCSV: async (
    file: File
  ): Promise<{ success: boolean; errors: string[]; message?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiFetch(`${BASE_URL}/validate-csv`, { method: 'POST', body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Validation failed');
    return json;
  },

  processProducts: async (): Promise<{ success: boolean; message?: string }> => {
    const res = await apiFetch(`${BASE_URL}/process`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Processing failed');
    return json;
  },

  exportProductsCSV: async (records: LoanProduct[]): Promise<void> => {
    const headers = [
      'Product Group Id', 'Product Id', 'Product Code', 'Product Name', 'Interest Rate',
      'Tenure In Months', 'Loan Amount', 'Status', 'Effective Start Date', 'Effective End Date',
      'Inserted On', 'Inserted By',
    ];
    const csv = [
      headers.join(','),
      ...records.map(p => [
        p.productGroupId, p.productId, p.productCode, p.productName, p.interestRate,
        p.tenureInMonths, p.loanAmount, p.status, p.effectiveStartDate, p.effectiveEndDate,
        p.insertedOn, p.insertedBy,
      ].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  downloadTemplate: async (): Promise<void> => {
    const headers = [
      'productGroupId', 'productCode', 'productName', 'interestRate', 'tenureInMonths',
      'lpfCalcType', 'lpfValue', 'lpfDeductType', 'securityValue', 'docChargeType',
      'docChargeValue', 'principalRepaymentFrequency', 'interestRepaymentFrequency',
      'moratoriumPeriod', 'loanAmount', 'status', 'effectiveStartDate', 'effectiveEndDate',
    ];
    const blob = new Blob([headers.join(',')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'products_template.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};