import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AlertTriangle, Lock } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  module?: string;
  permission?: string;
  roles?: string | string[];
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  module,
  permission,
  roles,
  fallback
}) => {
  const { hasPermission, hasRole, auth } = useAuth();

  // Check role-based access
  if (roles && !hasRole(roles)) {
    return fallback || (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <Lock className="w-12 h-12 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Access Restricted</h3>
        <p className="text-yellow-700">
          You don't have the required role to access this feature.
        </p>
        <p className="text-sm text-yellow-600 mt-2">
          Required: {Array.isArray(roles) ? roles.join(', ') : roles} | Your role: {auth.user?.role}
        </p>
      </div>
    );
  }

  // Check permission-based access
  if (module && permission && !hasPermission(module, permission)) {
    return fallback || (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="w-12 h-12 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Permission Denied</h3>
        <p className="text-red-700">
          You don't have permission to access this feature.
        </p>
        <p className="text-sm text-red-600 mt-2">
          Required: {module}:{permission}
        </p>
      </div>
    );
  }

  return <>{children}</>;
};