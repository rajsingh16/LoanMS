import { useState, useEffect } from 'react';
import { roleService } from '../services/roleService';
import { Role } from '../types/roles';

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const fetchedRoles = await roleService.getAllRoles();
        setRoles(fetchedRoles);
        setError(null);
      } catch (err) {
        console.error('Error fetching roles:', err);
        setError('Failed to fetch roles');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const refreshRoles = async () => {
    try {
      setLoading(true);
      const fetchedRoles = await roleService.getAllRoles();
      setRoles(fetchedRoles);
      setError(null);
    } catch (err) {
      console.error('Error refreshing roles:', err);
      setError('Failed to refresh roles');
    } finally {
      setLoading(false);
    }
  };

  return {
    roles,
    loading,
    error,
    refreshRoles
  };
};

export const useRoleOptions = () => {
  const [roleOptions, setRoleOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoleOptions = async () => {
      try {
        setLoading(true);
        const options = await roleService.getRolesForSelect();
        setRoleOptions(options);
        setError(null);
      } catch (err) {
        console.error('Error fetching role options:', err);
        setError('Failed to fetch role options');
      } finally {
        setLoading(false);
      }
    };

    fetchRoleOptions();
  }, []);

  return {
    roleOptions,
    loading,
    error
  };
};