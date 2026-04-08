const TOKEN_KEY = 'lms.auth.token';
const API_BASE = import.meta.env.VITE_API_URL || '';

type AuthListener = (event: string, session: { user: { id: string; email: string } } | null) => void;
const authListeners = new Set<AuthListener>();

function notifyAuth(event: string, session: { user: { id: string; email: string } } | null) {
  authListeners.forEach((cb) => cb(event, session));
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (init?.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getStoredToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}

export async function getSession(): Promise<{
  data: { session: { user: { id: string; email: string } } | null };
  error?: { message: string };
}> {
  const token = getStoredToken();
  if (!token) {
    return { data: { session: null } };
  }
  try {
    const res = await apiFetch('/api/auth/me');
    if (!res.ok) {
      setStoredToken(null);
      return { data: { session: null } };
    }
    const j = await res.json();
    return { data: { session: { user: j.user } } };
  } catch {
    setStoredToken(null);
    return { data: { session: null }, error: { message: 'Network error' } };
  }
}

export const auth = {
  signUp: async (email: string, password: string, userData: Record<string, unknown>) => {
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          branch_id: userData.branch_id,
          phone: userData.phone,
          employee_id: userData.employee_id,
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        return { data: null, error: { message: j.error || 'Registration failed' } };
      }
      return { data: { user: null }, error: null };
    } catch {
      return { data: null, error: { message: 'Network error during signup.' } };
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const j = await res.json();
      if (!res.ok) {
        return { data: null, error: { message: j.error || 'Login failed' } };
      }
      setStoredToken(j.token);
      notifyAuth('SIGNED_IN', { user: j.user });
      return { data: { user: j.user, session: { user: j.user } }, error: null };
    } catch {
      return { data: null, error: { message: 'Network error during signin.' } };
    }
  },

  signOut: async () => {
    try {
      setStoredToken(null);
      notifyAuth('SIGNED_OUT', null);
      return { error: null };
    } catch {
      return { error: { message: 'Network error during signout.' } };
    }
  },

  onAuthStateChange: (callback: AuthListener) => {
    authListeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => authListeners.delete(callback),
        },
      },
    };
  },
};

export const db = {
  getUserProfile: async (userId: string) => {
    try {
      const res = await apiFetch(`/api/users/${userId}/profile`);
      const j = await res.json();
      return { data: j.data, error: j.error };
    } catch (error) {
      console.error('Get user profile error:', error);
      return { data: null, error: { message: 'Network error getting user profile.' } };
    }
  },

  updateUserProfile: async (userId: string, updates: Record<string, unknown>) => {
    try {
      const res = await apiFetch(`/api/users/${userId}/profile`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      const j = await res.json();
      if (!res.ok) {
        return { data: null, error: { message: j.error || 'Update failed' } };
      }
      return { data: j.data, error: j.error };
    } catch (error) {
      console.error('Update user profile error:', error);
      return { data: null, error: { message: 'Network error updating user profile.' } };
    }
  },

  getAllUsers: async () => {
    try {
      const res = await apiFetch('/api/users');
      const j = await res.json();
      return { data: j.data, error: j.error };
    } catch (error) {
      console.error('Get all users error:', error);
      return { data: null, error: { message: 'Network error getting users.' } };
    }
  },

  getBranches: async () => {
    try {
      const res = await apiFetch('/api/branches');
      const j = await res.json();
      if (!res.ok) {
        return { data: null, error: { message: j.error || 'Failed to load branches' } };
      }
      return { data: j.data, error: null };
    } catch (error) {
      console.error('Get branches error:', error);
      return { data: null, error: { message: 'Network error getting branches.' } };
    }
  },

  getUserPermissions: async (userId: string) => {
    try {
      const res = await apiFetch(`/api/users/${userId}/permissions`);
      const j = await res.json();
      return { data: j.data, error: j.error };
    } catch (error) {
      console.error('Get user permissions error:', error);
      return { data: null, error: { message: 'Network error getting permissions.' } };
    }
  },

  hasPermission: async (userId: string, module: string, permission: string) => {
    try {
      const res = await apiFetch(`/api/users/${userId}/permissions`);
      const j = await res.json();
      if (j.error || !j.data) {
        return { hasPermission: false, error: j.error };
      }
      const has = j.data.some(
        (p: { module: string; permission: string }) =>
          p.module === module && p.permission === permission
      );
      return { hasPermission: has, error: null };
    } catch (error) {
      console.error('Check permission error:', error);
      return { hasPermission: false, error: { message: 'Network error checking permissions.' } };
    }
  },
};
