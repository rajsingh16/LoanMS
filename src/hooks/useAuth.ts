import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { auth, db, getSession } from '../lib/api';
import { UserProfile } from '../types/database';

interface AuthUser extends UserProfile {
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  userPermissions: string[];
}

interface AuthContextType {
  auth: AuthState;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  hasPermission: (module: string, permission: string) => boolean;
  hasRole: (roles: string | string[]) => boolean;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  branchId?: string;
  phone?: string;
  employeeId?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    userPermissions: [],
  });

  const clearAuthState = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
      userPermissions: [],
    });
  };

  const loadUserProfile = async (sessionUser: { id: string; email?: string }) => {
    try {
      const { data: profile, error } = await db.getUserProfile(sessionUser.id);
      if (error) throw error;

      if (profile) {
        const { data: permissions } = await db.getUserPermissions(sessionUser.id);
        const permissionStrings = permissions?.map(p => `${p.module}:${p.permission}`) || [];

        const authUser: AuthUser = {
          ...profile,
          email: sessionUser.email || '',
        };

        setAuthState({
          user: authUser,
          isAuthenticated: true,
          loading: false,
          userPermissions: permissionStrings,
        });
      } else {
        // If no profile exists but user is authenticated, create a minimal state
        // This can happen during registration before profile is fully created
        setAuthState({
          user: {
            id: sessionUser.id,
            email: sessionUser.email || '',
            username: '',
            first_name: '',
            last_name: '',
            role: 'viewer',
            branch_id: null,
            status: 'active',
            phone: null,
            employee_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          isAuthenticated: true,
          loading: false,
          userPermissions: [],
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      clearAuthState();
    }
  };

  useEffect(() => {
    // Initialize with loading state
    setAuthState(prev => ({ ...prev, loading: true }));
    
    // First check if we have a session
    const checkSession = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          clearAuthState();
          return;
        }
        
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          clearAuthState();
        }
      } catch (error) {
        console.error('Error checking session:', error);
        clearAuthState();
      }
    };
    
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        clearAuthState();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        clearAuthState();
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user);
        return { success: true };
      }

      clearAuthState();
      return { success: false, error: 'Login failed' };
    } catch (error) {
      clearAuthState();
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear the local auth state regardless of signOut success/failure
      clearAuthState();
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await auth.signUp(userData.email, userData.password, {
        username: userData.username,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role,
        branch_id: userData.branchId,
        phone: userData.phone,
        employee_id: userData.employeeId,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const hasPermission = (module: string, permission: string): boolean => {
    if (authState.user?.role === 'admin') return true;
    return authState.userPermissions.includes(`${module}:${permission}`);
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!authState.user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(authState.user.role);
  };

  const refreshUser = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Get the current session
      const { data: { session }, error: sessionError } = await getSession();
      
      if (sessionError) {
        console.error('Error refreshing session:', sessionError);
        clearAuthState();
        return;
      }
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        clearAuthState();
      }
    } catch (error) {
      console.error('Error in refreshUser:', error);
      clearAuthState();
    }
  };

  return {
    auth: authState,
    login,
    logout,
    register,
    hasPermission,
    hasRole,
    refreshUser,
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authState = useAuthState();
  
  return React.createElement(AuthContext.Provider, { value: authState }, children);
};