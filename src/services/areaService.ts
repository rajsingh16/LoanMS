import { apiFetch, getStoredToken } from '../lib/api';
import { LoanArea, AreaFormData } from '../types';

interface CSVUploadResult {
  success: boolean;
  message?: string;
  created: number;
  updated: number;
  errors: number;
  errorDetails?: string[];
}

class AreaService {
  async getAllAreas(): Promise<LoanArea[]> {
    try {
      const res = await apiFetch('/api/areas');
      const { data, error } = await res.json();
      if (!res.ok || error) throw new Error(error?.message || 'Request failed');

      return (data || []).map((area: Record<string, unknown>) => ({
        id: area.id as string,
        areaType: area.area_type as string,
        areaCode: area.area_code as string,
        areaName: area.area_name as string,
        parentArea: (area.parent_area_code as string) || '',
        openingDate: (area.branch_opening_date as string | undefined) || '',
        closingDate: area.branch_closing_date as string | undefined,
        status: (area.status as LoanArea['status'] | undefined) || 'active',
        address1: area.address1 as string,
        address2: area.address2 as string | undefined,
        district: area.district as string,
        pincode: area.pincode as string,
        latitude: area.latitude ? parseFloat(String(area.latitude)) : undefined,
        longitude: area.longitude ? parseFloat(String(area.longitude)) : undefined,
        phoneNumber: area.phone_number as string | undefined,
        emailId: area.email_id as string | undefined,
        managerId: area.branch_manager_id as string | undefined,
        mandatoryDocument: area.mandatory_document as string | undefined,
        crossSellAllowed: area.cross_sell_allowed as boolean,
        rating: area.branch_rating as string | undefined,
        minCenterClients: (area.min_center_clients as number) || 0,
        maxCenterClients: (area.max_center_clients as number) || 0,
        lastDayCloseDate: area.last_day_close_date as string | undefined,
        disbOnMeetingDate: area.disb_on_meeting_date as boolean,
        businessPartner: area.business_partner as string,
        bcBranchId: area.bc_branch_id as string | undefined,
        isDisbActive: area.is_disb_active as boolean,
        isCashDisbActive: area.is_cash_disb_active as boolean,
        isSubProductEnabled: area.is_sub_product_enabled as boolean,
        isClientSourcingEnabled: area.is_client_sourcing_enabled as boolean,
        isCenterFormationEnabled: area.is_center_formation_enabled as boolean,
        cashlessDisbPartner: area.cashless_disb_partner as string | undefined,
        nachPartner: area.nach_partner as string | undefined,
        insertedOn: (area.created_at as string).split('T')[0],
        insertedBy:
          area.created_user && typeof area.created_user === 'object'
            ? `${(area.created_user as { first_name: string }).first_name} ${(area.created_user as { last_name: string }).last_name}`
            : 'System',
        updatedOn: area.updated_at ? (area.updated_at as string).split('T')[0] : undefined,
        updatedBy: area.updated_at ? 'Updated User' : undefined,
      }));
    } catch (error) {
      console.error('Error fetching areas:', error);
      throw new Error('Failed to fetch areas');
    }
  }

  async createArea(formData: AreaFormData): Promise<LoanArea> {
    try {
      const areaCode = `${formData.areaType.substring(0, 2).toUpperCase()}${String(Date.now()).slice(-3)}`;

      const res = await apiFetch('/api/areas', {
        method: 'POST',
        body: JSON.stringify({
          area_type: formData.areaType,
          area_code: areaCode,
          area_name: formData.areaName,
          parent_area_code: formData.parentAreaCode || null,
          branch_manager_id: formData.branchManagerId || null,
          address1: formData.address1,
          address2: formData.address2 || null,
          phone_number: formData.phoneNumber || null,
          email_id: formData.emailId || null,
          pincode: formData.pincode,
          district: formData.district,
          state: formData.state,
          mandatory_document: formData.mandatoryDocument || null,
          branch_rating: formData.branchRating || null,
          min_center_clients: formData.minCenterClients,
          max_center_clients: formData.maxCenterClients,
          bc_branch_id: formData.bcBranchId || null,
          business_partner: formData.businessPartner,
          cashless_disb_partner: formData.cashlessDisbPartner || null,
          nach_partner: formData.nachPartner || null,
          branch_opening_date: formData.branchOpeningDate,
          disb_on_meeting_date: formData.disbOnMeetingDate,
          cross_sell_allowed: formData.crossSellAllowed,
          is_disb_active: formData.isDisbActive,
          is_cash_disb_active: formData.isCashDisbActive,
          is_sub_product_enabled: formData.isSubProductEnabled,
          is_client_sourcing_enabled: formData.isClientSourcingEnabled,
          is_center_formation_enabled: formData.isCenterFormationEnabled,
        }),
      });
      const { data, error } = await res.json();
      if (!res.ok || error) throw new Error(error?.message || 'Create failed');

      const d = data as Record<string, unknown>;
      return {
        id: d.id as string,
        areaType: d.area_type as string,
        areaCode: d.area_code as string,
        areaName: d.area_name as string,
        parentArea: (d.parent_area_code as string) || '',
        openingDate: (d.branch_opening_date as string | undefined) || '',
        status: (d.status as LoanArea['status'] | undefined) || 'active',
        address1: d.address1 as string,
        address2: d.address2 as string | undefined,
        district: d.district as string,
        pincode: d.pincode as string,
        phoneNumber: d.phone_number as string | undefined,
        emailId: d.email_id as string | undefined,
        managerId: d.branch_manager_id as string | undefined,
        mandatoryDocument: d.mandatory_document as string | undefined,
        crossSellAllowed: d.cross_sell_allowed as boolean,
        rating: d.branch_rating as string | undefined,
        minCenterClients: (d.min_center_clients as number) || 0,
        maxCenterClients: (d.max_center_clients as number) || 0,
        disbOnMeetingDate: d.disb_on_meeting_date as boolean,
        businessPartner: d.business_partner as string,
        bcBranchId: d.bc_branch_id as string | undefined,
        isDisbActive: d.is_disb_active as boolean,
        isCashDisbActive: d.is_cash_disb_active as boolean,
        isSubProductEnabled: d.is_sub_product_enabled as boolean,
        isClientSourcingEnabled: d.is_client_sourcing_enabled as boolean,
        isCenterFormationEnabled: d.is_center_formation_enabled as boolean,
        cashlessDisbPartner: d.cashless_disb_partner as string | undefined,
        nachPartner: d.nach_partner as string | undefined,
        insertedOn: (d.created_at as string).split('T')[0],
        insertedBy: 'Current User',
      };
    } catch (error) {
      console.error('Error creating area:', error);
      throw new Error('Failed to create area');
    }
  }

  async updateArea(id: string, formData: AreaFormData): Promise<LoanArea> {
    try {
      const res = await apiFetch(`/api/areas/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          area_type: formData.areaType,
          area_name: formData.areaName,
          parent_area_code: formData.parentAreaCode || null,
          branch_manager_id: formData.branchManagerId || null,
          address1: formData.address1,
          address2: formData.address2 || null,
          phone_number: formData.phoneNumber || null,
          email_id: formData.emailId || null,
          pincode: formData.pincode,
          district: formData.district,
          state: formData.state,
          mandatory_document: formData.mandatoryDocument || null,
          branch_rating: formData.branchRating || null,
          min_center_clients: formData.minCenterClients,
          max_center_clients: formData.maxCenterClients,
          bc_branch_id: formData.bcBranchId || null,
          business_partner: formData.businessPartner,
          cashless_disb_partner: formData.cashlessDisbPartner || null,
          nach_partner: formData.nachPartner || null,
          branch_opening_date: formData.branchOpeningDate,
          disb_on_meeting_date: formData.disbOnMeetingDate,
          cross_sell_allowed: formData.crossSellAllowed,
          is_disb_active: formData.isDisbActive,
          is_cash_disb_active: formData.isCashDisbActive,
          is_sub_product_enabled: formData.isSubProductEnabled,
          is_client_sourcing_enabled: formData.isClientSourcingEnabled,
          is_center_formation_enabled: formData.isCenterFormationEnabled,
        }),
      });
      const { data, error } = await res.json();
      if (!res.ok || error) throw new Error(error?.message || 'Update failed');

      const d = data as Record<string, unknown>;
      return {
        id: d.id as string,
        areaType: d.area_type as string,
        areaCode: d.area_code as string,
        areaName: d.area_name as string,
        parentArea: (d.parent_area_code as string) || '',
        openingDate: (d.branch_opening_date as string | undefined) || '',
        closingDate: d.branch_closing_date as string | undefined,
        status: (d.status as LoanArea['status'] | undefined) || 'active',
        address1: d.address1 as string,
        address2: d.address2 as string | undefined,
        district: d.district as string,
        pincode: d.pincode as string,
        latitude: d.latitude ? parseFloat(String(d.latitude)) : undefined,
        longitude: d.longitude ? parseFloat(String(d.longitude)) : undefined,
        phoneNumber: d.phone_number as string | undefined,
        emailId: d.email_id as string | undefined,
        managerId: d.branch_manager_id as string | undefined,
        mandatoryDocument: d.mandatory_document as string | undefined,
        crossSellAllowed: d.cross_sell_allowed as boolean,
        rating: d.branch_rating as string | undefined,
        minCenterClients: (d.min_center_clients as number) || 0,
        maxCenterClients: (d.max_center_clients as number) || 0,
        lastDayCloseDate: d.last_day_close_date as string | undefined,
        disbOnMeetingDate: d.disb_on_meeting_date as boolean,
        businessPartner: d.business_partner as string,
        bcBranchId: d.bc_branch_id as string | undefined,
        isDisbActive: d.is_disb_active as boolean,
        isCashDisbActive: d.is_cash_disb_active as boolean,
        isSubProductEnabled: d.is_sub_product_enabled as boolean,
        isClientSourcingEnabled: d.is_client_sourcing_enabled as boolean,
        isCenterFormationEnabled: d.is_center_formation_enabled as boolean,
        cashlessDisbPartner: d.cashless_disb_partner as string | undefined,
        nachPartner: d.nach_partner as string | undefined,
        insertedOn: (d.created_at as string).split('T')[0],
        insertedBy: 'Original User',
        updatedOn: d.updated_at ? (d.updated_at as string).split('T')[0] : undefined,
        updatedBy: 'Current User',
      };
    } catch (error) {
      console.error('Error updating area:', error);
      throw new Error('Failed to update area');
    }
  }

  async deleteArea(id: string): Promise<void> {
    try {
      const res = await apiFetch(`/api/areas/${id}`, { method: 'DELETE' });
      const { error } = await res.json();
      if (!res.ok || error) throw new Error(error?.message || 'Delete failed');
    } catch (error) {
      console.error('Error deleting area:', error);
      throw new Error('Failed to delete area');
    }
  }

  async uploadAreasCSV(file: File): Promise<CSVUploadResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n').filter((line) => line.trim());

          if (lines.length < 2) {
            resolve({
              success: false,
              message: 'CSV file must contain at least a header row and one data row',
              created: 0,
              updated: 0,
              errors: 1,
            });
            return;
          }

          const headers = lines[0].split(',').map((h) => h.trim());
          const requiredColumns = [
            'areaType',
            'areaName',
            'businessPartner',
            'address1',
            'pincode',
            'district',
            'state',
            'branchOpeningDate',
          ];
          const missingColumns = requiredColumns.filter((col) => !headers.includes(col));
          if (missingColumns.length > 0) {
            resolve({
              success: false,
              message: `Missing required columns: ${missingColumns.join(', ')}`,
              created: 0,
              updated: 0,
              errors: 1,
            });
            return;
          }

          const token = getStoredToken();
          if (!token) {
            resolve({
              success: false,
              message: 'User not authenticated',
              created: 0,
              updated: 0,
              errors: 1,
            });
            return;
          }

          const rowsPayload: Record<string, unknown>[] = [];

          for (let i = 1; i < lines.length; i++) {
            try {
              const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));
              const rowData: Record<string, string> = {};
              headers.forEach((header, index) => {
                rowData[header] = values[index] || '';
              });

              if (!rowData.areaType || !rowData.areaName || !rowData.businessPartner) {
                continue;
              }

              const areaCode =
                rowData.areaCode ||
                `${rowData.areaType.substring(0, 2).toUpperCase()}${String(Date.now() + i).slice(-3)}`;

              rowsPayload.push({
                area_type: rowData.areaType,
                area_code: areaCode,
                area_name: rowData.areaName,
                parent_area_code: rowData.parentAreaCode || null,
                branch_manager_id: rowData.branchManagerId || null,
                address1: rowData.address1,
                address2: rowData.address2 || null,
                phone_number: rowData.phoneNumber || null,
                email_id: rowData.emailId || null,
                pincode: rowData.pincode,
                district: rowData.district,
                state: rowData.state,
                mandatory_document: rowData.mandatoryDocument || null,
                branch_rating: rowData.branchRating || null,
                min_center_clients: parseInt(rowData.minCenterClients, 10) || 0,
                max_center_clients: parseInt(rowData.maxCenterClients, 10) || 0,
                bc_branch_id: rowData.bcBranchId || null,
                business_partner: rowData.businessPartner,
                cashless_disb_partner: rowData.cashlessDisbPartner || null,
                nach_partner: rowData.nachPartner || null,
                branch_opening_date: rowData.branchOpeningDate,
                disb_on_meeting_date: rowData.disbOnMeetingDate === 'true',
                cross_sell_allowed: rowData.crossSellAllowed === 'true',
                is_disb_active: rowData.isDisbActive !== 'false',
                is_cash_disb_active: rowData.isCashDisbActive === 'true',
                is_sub_product_enabled: rowData.isSubProductEnabled === 'true',
                is_client_sourcing_enabled: rowData.isClientSourcingEnabled === 'true',
                is_center_formation_enabled: rowData.isCenterFormationEnabled === 'true',
                status: rowData.status || 'active',
              });
            } catch {
              /* skip bad row */
            }
          }

          const res = await apiFetch('/api/areas/bulk-upsert', {
            method: 'POST',
            body: JSON.stringify({ rows: rowsPayload }),
          });
          const result = await res.json();

          resolve({
            success: result.success !== false,
            created: result.created ?? 0,
            updated: result.updated ?? 0,
            errors: result.errors ?? 0,
            errorDetails: result.errorDetails,
          });
        } catch {
          resolve({
            success: false,
            message: 'Failed to parse CSV file',
            created: 0,
            updated: 0,
            errors: 1,
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          message: 'Failed to read file',
          created: 0,
          updated: 0,
          errors: 1,
        });
      };

      reader.readAsText(file);
    });
  }

  async exportAreasCSV(areas: LoanArea[]): Promise<void> {
    const headers = [
      'areaType',
      'areaCode',
      'areaName',
      'parentArea',
      'openingDate',
      'closingDate',
      'status',
      'address1',
      'address2',
      'district',
      'pincode',
      'latitude',
      'longitude',
      'phoneNumber',
      'emailId',
      'managerId',
      'mandatoryDocument',
      'crossSellAllowed',
      'rating',
      'minCenterClients',
      'maxCenterClients',
      'lastDayCloseDate',
      'disbOnMeetingDate',
      'businessPartner',
      'bcBranchId',
      'isDisbActive',
      'isCashDisbActive',
      'isSubProductEnabled',
      'isClientSourcingEnabled',
      'isCenterFormationEnabled',
      'cashlessDisbPartner',
      'nachPartner',
      'insertedOn',
      'insertedBy',
      'updatedOn',
      'updatedBy',
    ];

    const csvContent = [
      headers.join(','),
      ...areas.map((area) =>
        headers
          .map((header) => {
            const value = area[header as keyof LoanArea];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value || '';
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `areas_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  async downloadTemplate(): Promise<void> {
    const templateHeaders = [
      'areaType',
      'parentAreaCode',
      'areaName',
      'branchManagerId',
      'address1',
      'address2',
      'phoneNumber',
      'emailId',
      'pincode',
      'district',
      'state',
      'mandatoryDocument',
      'branchRating',
      'minCenterClients',
      'maxCenterClients',
      'bcBranchId',
      'businessPartner',
      'cashlessDisbPartner',
      'nachPartner',
      'branchOpeningDate',
      'disbOnMeetingDate',
      'crossSellAllowed',
      'isDisbActive',
      'isCashDisbActive',
      'isSubProductEnabled',
      'isClientSourcingEnabled',
      'isCenterFormationEnabled',
    ];

    const sampleData = [
      'Branch',
      'REG001',
      'Sample Branch',
      'MGR001',
      '123 Sample Street',
      'Near Landmark',
      '+91 9876543210',
      'sample@example.com',
      '110001',
      'Central Delhi',
      'Delhi',
      'Aadhar, PAN',
      'A+',
      '10',
      '50',
      'BC001',
      'Partner A',
      'Cashless Partner',
      'NACH Partner',
      '2024-01-01',
      'true',
      'true',
      'true',
      'false',
      'true',
      'true',
      'true',
    ];

    const csvContent = [templateHeaders.join(','), sampleData.join(',')].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `areas_template_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

export const areaService = new AreaService();
