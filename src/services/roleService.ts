import { apiFetch } from '../lib/api';
import { Role } from '../types/roles';

class RoleService {
  async getAllRoles(): Promise<Role[]> {
    try {
      const res = await apiFetch('/api/roles');
      const { data, error } = await res.json();
      if (!res.ok || error) throw new Error(error?.message || 'Failed to fetch roles');
      return data || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw new Error('Failed to fetch roles');
    }
  }

  async getRoleByCode(roleCode: string): Promise<Role | null> {
    try {
      const res = await apiFetch(`/api/roles/by-code/${encodeURIComponent(roleCode)}`);
      const { data, error } = await res.json();
      if (!res.ok || error) throw new Error(error?.message || 'Failed to fetch role');
      return data || null;
    } catch (error) {
      console.error('Error fetching role by code:', error);
      throw new Error('Failed to fetch role');
    }
  }

  async createRole(roleData: {
    role_name: string;
    role_code: string;
    description?: string;
  }): Promise<Role> {
    try {
      const res = await apiFetch('/api/roles', {
        method: 'POST',
        body: JSON.stringify({
          role_name: roleData.role_name,
          role_code: roleData.role_code,
          description: roleData.description,
        }),
      });
      const { data, error } = await res.json();
      if (!res.ok || error) throw new Error(error?.message || 'Create failed');
      return data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw new Error('Failed to create role');
    }
  }

  async updateRole(id: string, updates: Partial<Role>): Promise<Role> {
    try {
      const res = await apiFetch(`/api/roles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      const { data, error } = await res.json();
      if (!res.ok || error) throw new Error(error?.message || 'Update failed');
      return data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw new Error('Failed to update role');
    }
  }

  async deactivateRole(id: string): Promise<void> {
    try {
      const res = await apiFetch(`/api/roles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: false }),
      });
      const { error } = await res.json();
      if (!res.ok || error) throw new Error(error?.message || 'Deactivate failed');
    } catch (error) {
      console.error('Error deactivating role:', error);
      throw new Error('Failed to deactivate role');
    }
  }

  async roleExists(roleCode: string): Promise<boolean> {
    try {
      const role = await this.getRoleByCode(roleCode);
      return role !== null;
    } catch (error) {
      console.error('Error checking if role exists:', error);
      return false;
    }
  }

  async bulkInsertRoles(
    roles: Array<{
      role_name: string;
      role_code: string;
      description?: string;
    }>
  ): Promise<Role[]> {
    try {
      const res = await apiFetch('/api/roles/bulk-upsert', {
        method: 'POST',
        body: JSON.stringify({ roles }),
      });
      const j = await res.json();
      if (!res.ok || j.error) throw new Error(j.error || 'Bulk insert failed');
      return j.data || [];
    } catch (error) {
      console.error('Error bulk inserting roles:', error);
      throw new Error('Failed to bulk insert roles');
    }
  }

  async getRolesForSelect(): Promise<Array<{ value: string; label: string }>> {
    try {
      const roles = await this.getAllRoles();
      return roles.map((role) => ({
        value: role.role_code,
        label: role.role_name,
      }));
    } catch (error) {
      console.error('Error fetching roles for select:', error);
      return [];
    }
  }
}

export const roleService = new RoleService();
