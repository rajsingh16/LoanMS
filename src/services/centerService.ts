import { apiFetch } from '../lib/api';
import { Center, CenterFormData } from '../types/center';

class CenterService {
  private normalizeStatus(status: unknown): Center['status'] {
    // Backend should return only 'active'/'inactive', but we defensively coerce.
    return status === 'inactive' ? 'inactive' : 'active';
  }

  async getAllCenters(): Promise<Center[]> {
    try {
      const res = await apiFetch('/api/centers');
      const { data, error } = await res.json();
      if (!res.ok || error) throw new Error(error?.message || 'Request failed');

      return (data || []).map((center: Record<string, unknown>) => ({
        id: center.id as string,
        centerCode: center.center_code as string,
        centerName: center.center_name as string,
        branchId: center.branch_id as string,
        branchName:
          center.branches && typeof center.branches === 'object' && center.branches !== null
            ? (center.branches as { branch_name?: string }).branch_name || ''
            : '',
        centerDay: (center.center_day as string) || '',
        centerTime: center.center_time
          ? new Date(center.center_time as string).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        status: this.normalizeStatus(center.status),
        blacklisted: center.blacklisted as boolean,
        assignedTo: center.assigned_to as string,
        assignedToName:
          center.assigned_user && typeof center.assigned_user === 'object'
            ? `${(center.assigned_user as { first_name: string }).first_name} ${(center.assigned_user as { last_name: string }).last_name}`
            : '',
        bcCenterId: center.bc_center_id as string | undefined,
        parentCenterId: center.parent_center_id as string | undefined,
        contactPersonName: center.contact_person_name as string,
        contactPersonNumber: center.contact_person_number as string,
        address1: (center.address1 as string) || '',
        address2: center.address2 as string | undefined,
        landmark: center.landmark as string | undefined,
        pincode: center.pincode as string,
        villageId: center.village as string,
        villageName: (center.village as string) || '',
        city: center.city as string | undefined,
        meetingPlace: center.meeting_place as string | undefined,
        latitude: center.latitude ? parseFloat(String(center.latitude)) : undefined,
        longitude: center.longitude ? parseFloat(String(center.longitude)) : undefined,
        createdBy:
          center.created_user && typeof center.created_user === 'object'
            ? `${(center.created_user as { first_name: string }).first_name} ${(center.created_user as { last_name: string }).last_name}`
            : 'System',
        createdAt: (center.created_at as string).split('T')[0],
        updatedAt: center.updated_at ? (center.updated_at as string).split('T')[0] : undefined,
        memberCount: (center.member_count as number) || 0,
      }));
    } catch (error) {
      console.error('Error fetching centers:', error);
      throw new Error('Failed to fetch centers');
    }
  }

  async createCenter(formData: CenterFormData): Promise<Center> {
    try {
      const res = await apiFetch('/api/centers', {
        method: 'POST',
        body: JSON.stringify({
          center_name: formData.centerName,
          branch_id: formData.branchId,
          village: formData.villageId,
          assigned_to: formData.assignedTo,
          center_day: formData.centerDay,
          center_time: formData.centerTime,
          contact_person_name: formData.contactPersonName,
          contact_person_number: formData.contactPersonNumber,
          meeting_place: formData.meetingPlace,
          address1: formData.address1,
          address2: formData.address2,
          landmark: formData.landmark,
          pincode: formData.pincode,
          city: formData.city,
          latitude: formData.latitude,
          longitude: formData.longitude,
          status: formData.status || 'active',
          blacklisted: formData.blacklisted || false,
          bc_center_id: formData.bcCenterId,
          parent_center_id: formData.parentCenterId,
        }),
      });
      const { data, error } = await res.json();
      if (!res.ok || error) throw new Error(error?.message || 'Create failed');

      const center = data as Record<string, unknown>;
      return {
        id: center.id as string,
        centerCode: center.center_code as string,
        centerName: center.center_name as string,
        branchId: center.branch_id as string,
        branchName:
          center.branches && typeof center.branches === 'object'
            ? (center.branches as { branch_name?: string }).branch_name || ''
            : '',
        centerDay: (center.center_day as string) || '',
        centerTime: center.center_time
          ? new Date(center.center_time as string).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        status: this.normalizeStatus(center.status),
        blacklisted: center.blacklisted as boolean,
        assignedTo: center.assigned_to as string,
        assignedToName:
          center.assigned_user && typeof center.assigned_user === 'object'
            ? `${(center.assigned_user as { first_name: string }).first_name} ${(center.assigned_user as { last_name: string }).last_name}`
            : '',
        bcCenterId: center.bc_center_id as string | undefined,
        parentCenterId: center.parent_center_id as string | undefined,
        contactPersonName: center.contact_person_name as string,
        contactPersonNumber: center.contact_person_number as string,
        address1: (center.address1 as string) || '',
        address2: center.address2 as string | undefined,
        landmark: center.landmark as string | undefined,
        pincode: center.pincode as string,
        villageId: center.village as string,
        villageName: (center.village as string) || '',
        city: center.city as string | undefined,
        meetingPlace: center.meeting_place as string | undefined,
        latitude: center.latitude ? parseFloat(String(center.latitude)) : undefined,
        longitude: center.longitude ? parseFloat(String(center.longitude)) : undefined,
        createdBy: 'Current User',
        createdAt: (center.created_at as string).split('T')[0],
        updatedAt: center.updated_at ? (center.updated_at as string).split('T')[0] : undefined,
        memberCount: (center.member_count as number) || 0,
      };
    } catch (error) {
      console.error('Error creating center:', error);
      throw new Error('Failed to create center');
    }
  }

  async updateCenter(id: string, formData: CenterFormData): Promise<Center> {
    try {
      const res = await apiFetch(`/api/centers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          center_name: formData.centerName,
          branch_id: formData.branchId,
          village: formData.villageId,
          assigned_to: formData.assignedTo,
          center_day: formData.centerDay,
          center_time: formData.centerTime,
          contact_person_name: formData.contactPersonName,
          contact_person_number: formData.contactPersonNumber,
          meeting_place: formData.meetingPlace,
          address1: formData.address1,
          address2: formData.address2,
          landmark: formData.landmark,
          pincode: formData.pincode,
          city: formData.city,
          latitude: formData.latitude,
          longitude: formData.longitude,
          status: formData.status,
          blacklisted: formData.blacklisted,
          bc_center_id: formData.bcCenterId,
          parent_center_id: formData.parentCenterId,
        }),
      });
      const { data, error } = await res.json();
      if (!res.ok || error) throw new Error(error?.message || 'Update failed');

      const center = data as Record<string, unknown>;
      return {
        id: center.id as string,
        centerCode: center.center_code as string,
        centerName: center.center_name as string,
        branchId: center.branch_id as string,
        branchName:
          center.branches && typeof center.branches === 'object'
            ? (center.branches as { branch_name?: string }).branch_name || ''
            : '',
        centerDay: (center.center_day as string) || '',
        centerTime: center.center_time
          ? new Date(center.center_time as string).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        status: this.normalizeStatus(center.status),
        blacklisted: center.blacklisted as boolean,
        assignedTo: center.assigned_to as string,
        assignedToName:
          center.assigned_user && typeof center.assigned_user === 'object'
            ? `${(center.assigned_user as { first_name: string }).first_name} ${(center.assigned_user as { last_name: string }).last_name}`
            : '',
        bcCenterId: center.bc_center_id as string | undefined,
        parentCenterId: center.parent_center_id as string | undefined,
        contactPersonName: center.contact_person_name as string,
        contactPersonNumber: center.contact_person_number as string,
        address1: (center.address1 as string) || '',
        address2: center.address2 as string | undefined,
        landmark: center.landmark as string | undefined,
        pincode: center.pincode as string,
        villageId: center.village as string,
        villageName: (center.village as string) || '',
        city: center.city as string | undefined,
        meetingPlace: center.meeting_place as string | undefined,
        latitude: center.latitude ? parseFloat(String(center.latitude)) : undefined,
        longitude: center.longitude ? parseFloat(String(center.longitude)) : undefined,
        createdBy:
          center.created_user && typeof center.created_user === 'object'
            ? `${(center.created_user as { first_name: string }).first_name} ${(center.created_user as { last_name: string }).last_name}`
            : 'System',
        createdAt: (center.created_at as string).split('T')[0],
        updatedAt: center.updated_at ? (center.updated_at as string).split('T')[0] : undefined,
        memberCount: (center.member_count as number) || 0,
      };
    } catch (error) {
      console.error('Error updating center:', error);
      throw new Error('Failed to update center');
    }
  }

  async deleteCenter(id: string): Promise<void> {
    try {
      const res = await apiFetch(`/api/centers/${id}`, { method: 'DELETE' });
      const { error } = await res.json();
      if (!res.ok || error) throw new Error(error?.message || 'Delete failed');
    } catch (error) {
      console.error('Error deleting center:', error);
      throw new Error('Failed to delete center');
    }
  }

  async exportCentersCSV(centers: Center[]): Promise<void> {
    const headers = [
      'Center Code',
      'Center Name',
      'Branch',
      'Center Day',
      'Center Time',
      'Status',
      'Blacklisted',
      'Assigned To',
      'BC Center ID',
      'Parent Center ID',
      'Contact Person Name',
      'Contact Person Number',
      'Address 1',
      'Address 2',
      'Landmark',
      'Pincode',
      'Village',
      'City',
      'Meeting Place',
      'Latitude',
      'Longitude',
      'Created By',
      'Created At',
    ];

    const csvContent = [
      headers.join(','),
      ...centers.map((center) =>
        [
          center.centerCode,
          center.centerName,
          center.branchName,
          center.centerDay,
          center.centerTime,
          center.status,
          center.blacklisted ? 'Yes' : 'No',
          center.assignedToName,
          center.bcCenterId || '',
          center.parentCenterId || '',
          center.contactPersonName || '',
          center.contactPersonNumber || '',
          center.address1,
          center.address2 || '',
          center.landmark || '',
          center.pincode || '',
          center.villageName,
          center.city || '',
          center.meetingPlace || '',
          center.latitude || '',
          center.longitude || '',
          center.createdBy,
          center.createdAt,
        ]
          .map((value) => {
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `centers_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

export const centerService = new CenterService();
