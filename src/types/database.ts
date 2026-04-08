export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string;
          role_name: string;
          role_code: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          role_name: string;
          role_code: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role_name?: string;
          role_code?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          role: string; // Updated to support any role from roles table
          branch_id: string | null;
          status: 'active' | 'inactive' | 'suspended';
          phone: string | null;
          employee_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          first_name: string;
          last_name: string;
          role?: string;
          branch_id?: string | null;
          status?: 'active' | 'inactive' | 'suspended';
          phone?: string | null;
          employee_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          first_name?: string;
          last_name?: string;
          role?: string;
          branch_id?: string | null;
          status?: 'active' | 'inactive' | 'suspended';
          phone?: string | null;
          employee_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      branches: {
        Row: {
          id: string;
          branch_code: string;
          branch_name: string;
          location: string | null;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          branch_code: string;
          branch_name: string;
          location?: string | null;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          branch_code?: string;
          branch_name?: string;
          location?: string | null;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
      };
      user_permissions: {
        Row: {
          id: string;
          user_id: string;
          module: string;
          permission: 'read' | 'write' | 'delete' | 'admin';
          granted_by: string | null;
          granted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          module: string;
          permission: 'read' | 'write' | 'delete' | 'admin';
          granted_by?: string | null;
          granted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          module?: string;
          permission?: 'read' | 'write' | 'delete' | 'admin';
          granted_by?: string | null;
          granted_at?: string;
        };
      };
    };
  };
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type Branch = Database['public']['Tables']['branches']['Row'];
export type UserPermission = Database['public']['Tables']['user_permissions']['Row'];