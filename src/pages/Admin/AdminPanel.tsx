import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Edit, RefreshCw, Shield, Settings, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/api';
import { roleService } from '../../services/roleService';
import { Role } from '../../types/roles';
import { Branch, UserProfile } from '../../types/database';
import { Modal } from '../../components/Common/Modal';

type AdminTab = 'users' | 'roles' | 'settings';
type UserWithBranch = UserProfile & { email?: string; branches?: { branch_name?: string } | null };

const cardClass = 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700';
const inputClass = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent';

const statusClass = (status: UserProfile['status']) => status === 'active'
  ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
  : status === 'suspended'
    ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';

export const AdminPanel: React.FC = () => {
  const { auth } = useAuth();
  const [tab, setTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<UserWithBranch[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [userPermissions, setUserPermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserWithBranch | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [editingRole, setEditingRole] = useState<Partial<Role> | null>(null);
  const [saving, setSaving] = useState(false);

  const isAdmin = ['admin', 'administrator'].includes(auth.user?.role?.toLowerCase() || '');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersResult, loadedRoles, branchResult] = await Promise.all([db.getAllUsers(), roleService.getAllRoles(), db.getBranches()]);
      if (usersResult.error) throw new Error(usersResult.error.message);
      const loadedUsers = (usersResult.data || []) as UserWithBranch[];
      setUsers(loadedUsers);
      setRoles(loadedRoles);
      setBranches(branchResult.data || []);
      const permissionEntries = await Promise.all(loadedUsers.map(async user => {
        const result = await db.getUserPermissions(user.id);
        return [user.id, (result.data || []).map(permission => `${permission.module}:${permission.permission}`)] as const;
      }));
      setUserPermissions(Object.fromEntries(permissionEntries));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load administration data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAdmin) void loadData(); }, [isAdmin]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(user => [user.first_name, user.last_name, user.username, user.email, user.employee_id, user.role]
      .some(value => value?.toLowerCase().includes(term)));
  }, [search, users]);

  const saveUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const result = await db.updateUserProfile(editingUser.id, {
      first_name: String(form.get('first_name') || ''),
      last_name: String(form.get('last_name') || ''),
      username: String(form.get('username') || ''),
      role: String(form.get('role') || ''),
      status: String(form.get('status') || 'active'),
      phone: String(form.get('phone') || '') || null,
      employee_id: String(form.get('employee_id') || '') || null,
      branch_id: String(form.get('branch_id') || '') || null,
    });
    setSaving(false);
    if (result.error) setError(result.error.message);
    else { setEditingUser(null); setNotice('User updated successfully.'); await loadData(); }
  };

  const createUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const result = await db.createUser({
      first_name: String(form.get('first_name') || ''),
      last_name: String(form.get('last_name') || ''),
      username: String(form.get('username') || ''),
      email: String(form.get('email') || ''),
      phone: String(form.get('phone') || '') || null,
      employee_id: String(form.get('employee_id') || '') || null,
      role: String(form.get('role') || ''),
      branch_id: String(form.get('branch_id') || '') || null,
      status: String(form.get('status') || 'active'),
    });
    setSaving(false);
    if (result.error) setError(result.error.message);
    else { setCreatingUser(false); setTemporaryPassword(result.data?.temporary_password || ''); setNotice('User created. Share the temporary password securely with the employee.'); await loadData(); }
  };

  const saveRole = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingRole) return;
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      if (editingRole.id) await roleService.updateRole(editingRole.id, { role_name: String(form.get('role_name')), role_code: String(form.get('role_code')), description: String(form.get('description') || '') });
      else await roleService.createRole({ role_name: String(form.get('role_name')), role_code: String(form.get('role_code')), description: String(form.get('description') || '') });
      setEditingRole(null); setNotice('Role saved successfully.'); await loadData();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Unable to save role.'); }
    finally { setSaving(false); }
  };

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1><span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"><Shield className="h-3 w-3" /> Administrator</span></div>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Manage users, roles, permissions, and system settings</p>
        </div>
        <div className="flex flex-wrap gap-2"><button onClick={() => setCreatingUser(true)} className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">Create user</button><button onClick={() => void loadData()} className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700" aria-label="Refresh administration data"><RefreshCw className="h-4 w-4" /> Refresh</button></div>
      </div>

      {notice && <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"><CheckCircle className="h-5 w-5" />{notice}</div>}
      {error && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"><AlertCircle className="h-5 w-5" />{error}</div>}

      <div className={`${cardClass} overflow-x-auto`} role="tablist" aria-label="Administration sections">
        <div className="flex min-w-max border-b border-gray-200 dark:border-gray-700">
          {([['users', 'Users', Users], ['roles', 'Roles & Permissions', Shield], ['settings', 'System Settings', Settings]] as const).map(([key, label, Icon]) => <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${tab === key ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}><Icon className="h-4 w-4" />{label}</button>)}
        </div>
      </div>

      {loading ? <div className={`${cardClass} flex min-h-48 items-center justify-center`}><div className="flex items-center gap-3 text-gray-600 dark:text-gray-400"><span className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />Loading administration data...</div></div> : tab === 'users' ? <UsersSection users={filteredUsers} allUsers={users} roles={roles} search={search} setSearch={setSearch} onEdit={setEditingUser} permissions={userPermissions} /> : tab === 'roles' ? <RolesSection roles={roles} users={users} permissions={userPermissions} onEdit={setEditingRole} /> : <SettingsSection />}

      <Modal isOpen={Boolean(editingUser)} onClose={() => setEditingUser(null)} title="Edit user" size="lg">{editingUser && <form onSubmit={saveUser} className="space-y-4 p-6"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{[['first_name', 'First name'], ['last_name', 'Last name'], ['username', 'Username'], ['employee_id', 'Employee ID'], ['phone', 'Mobile']].map(([name, label]) => <label key={name} className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}<input name={name} defaultValue={editingUser[name as keyof UserWithBranch] as string || ''} className={`${inputClass} mt-1`} /></label>)}<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status<select name="status" defaultValue={editingUser.status} className={`${inputClass} mt-1`}><option value="pending">Pending</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select></label><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role<select name="role" defaultValue={editingUser.role || ''} className={`${inputClass} mt-1`}><option value="">Unassigned</option>{roles.map(role => <option key={role.id} value={role.role_code}>{role.role_name}</option>)}</select></label><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Branch<select name="branch_id" defaultValue={editingUser.branch_id || ''} className={`${inputClass} mt-1`}><option value="">Unassigned</option>{branches.map(branch => <option key={branch.id} value={branch.id}>{branch.branch_name}</option>)}</select></label></div><div className="flex justify-end gap-3"><button type="button" onClick={() => setEditingUser(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:text-gray-200">Cancel</button><button disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save changes'}</button></div></form>}</Modal>
      <Modal isOpen={creatingUser} onClose={() => setCreatingUser(false)} title="Create user" size="lg"><form onSubmit={createUser} className="space-y-4 p-6"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{[['first_name', 'First name'], ['last_name', 'Last name'], ['username', 'Username'], ['email', 'Email'], ['employee_id', 'Employee ID'], ['phone', 'Mobile']].map(([name, label]) => <label key={name} className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}{['first_name', 'last_name', 'username', 'email'].includes(name) && ' *'}<input required={['first_name', 'last_name', 'username', 'email'].includes(name)} name={name} className={`${inputClass} mt-1`} /></label>)}<label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role *<select required name="role" className={`${inputClass} mt-1`}><option value="">Select role</option>{roles.map(role => <option key={role.id} value={role.role_code}>{role.role_name}</option>)}</select></label><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Branch<select name="branch_id" className={`${inputClass} mt-1`}><option value="">Unassigned</option>{branches.map(branch => <option key={branch.id} value={branch.id}>{branch.branch_name}</option>)}</select></label><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status<select name="status" defaultValue="active" className={`${inputClass} mt-1`}><option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select></label></div><div className="flex justify-end gap-3"><button type="button" onClick={() => setCreatingUser(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:text-gray-200">Cancel</button><button disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">{saving ? 'Creating...' : 'Create user'}</button></div></form></Modal>
      {temporaryPassword && <Modal isOpen={Boolean(temporaryPassword)} onClose={() => setTemporaryPassword('')} title="Temporary password"><div className="space-y-4 p-6"><p className="text-sm text-gray-600 dark:text-gray-300">This temporary password is shown once. Share it securely with the employee and ask them to change it through the approved password flow.</p><code className="block rounded-lg bg-gray-100 p-3 font-mono text-sm dark:bg-gray-700 dark:text-gray-100">{temporaryPassword}</code><button onClick={() => setTemporaryPassword('')} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Done</button></div></Modal>}
      <Modal isOpen={Boolean(editingRole)} onClose={() => setEditingRole(null)} title={editingRole?.id ? 'Edit role' : 'Create role'}><form onSubmit={saveRole} className="space-y-4 p-6"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role name<input required name="role_name" defaultValue={editingRole?.role_name || ''} className={`${inputClass} mt-1`} /></label><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role code<input required name="role_code" defaultValue={editingRole?.role_code || ''} className={`${inputClass} mt-1`} /></label><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description<textarea name="description" defaultValue={editingRole?.description || ''} className={`${inputClass} mt-1`} rows={3} /></label><div className="flex justify-end gap-3"><button type="button" onClick={() => setEditingRole(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:text-gray-200">Cancel</button><button disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save role'}</button></div></form></Modal>
    </div>
  );
};

const UsersSection: React.FC<{ users: UserWithBranch[]; allUsers: UserWithBranch[]; roles: Role[]; search: string; setSearch: (value: string) => void; onEdit: (user: UserWithBranch) => void; permissions: Record<string, string[]> }> = ({ users, allUsers, roles, search, setSearch, onEdit, permissions }) => <section className={`${cardClass} min-w-0`}><div className="flex flex-col gap-4 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700"><div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Users</h2><p className="text-sm text-gray-500 dark:text-gray-400">{allUsers.length} users found</p></div><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search users..." className={`${inputClass} w-full sm:w-72`} aria-label="Search users" /></div><div className="overflow-x-auto"><table className="w-full min-w-[950px]"><thead className="bg-gray-50 dark:bg-gray-700"><tr>{['Name', 'Email', 'Employee ID', 'Role', 'Branch', 'Status', 'Permissions', 'Actions'].map(label => <th key={label} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">{label}</th>)}</tr></thead><tbody className="divide-y divide-gray-200 dark:divide-gray-700">{users.map(user => <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700"><td className="px-4 py-3"><div className="font-medium text-gray-900 dark:text-white">{user.first_name} {user.last_name}</div><div className="text-xs text-gray-500">@{user.username}</div></td><td className="max-w-[220px] break-words px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.email || '—'}</td><td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.employee_id || '—'}</td><td className="px-4 py-3"><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{roles.find(role => role.role_code === user.role)?.role_name || user.role || 'Unassigned'}</span></td><td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.branches?.branch_name || 'Unassigned'}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(user.status)}`}>{user.status}</span></td><td className="max-w-[220px] px-4 py-3"><div className="flex flex-wrap gap-1">{(permissions[user.id] || []).length ? permissions[user.id].map(permission => <span key={permission} className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">{permission}</span>) : <span className="text-sm text-gray-400">None</span>}</div></td><td className="px-4 py-3"><button onClick={() => onEdit(user)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"><Edit className="h-4 w-4" /> Edit</button></td></tr>)}{!users.length && <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">No users found.</td></tr>}</tbody></table></div></section>;

const RolesSection: React.FC<{ roles: Role[]; users: UserWithBranch[]; permissions: Record<string, string[]>; onEdit: (role: Partial<Role>) => void }> = ({ roles, users, permissions, onEdit }) => {
  const permissionNames = [...new Set(Object.values(permissions).flat())];
  return <section className={`${cardClass} min-w-0`}>
    <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
      <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Roles &amp; Permissions</h2><p className="text-sm text-gray-500 dark:text-gray-400">Manage roles and review permissions currently assigned to users.</p></div>
      <button onClick={() => onEdit({})} className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Create role</button>
    </div>
    <div className="overflow-x-auto"><table className="w-full min-w-[850px]"><thead className="bg-gray-50 dark:bg-gray-700"><tr>{['Role name', 'Role code', 'Description', 'Users', 'Permissions in use', 'Status', 'Actions'].map(label => <th key={label} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">{label}</th>)}</tr></thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{roles.map(role => {
        const roleUsers = users.filter(user => user.role === role.role_code);
        const rolePermissionNames = [...new Set(roleUsers.flatMap(user => permissions[user.id] || []))];
        return <tr key={role.id}><td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{role.role_name}</td><td className="px-4 py-3 font-mono text-sm text-gray-600 dark:text-gray-300">{role.role_code}</td><td className="max-w-[280px] break-words px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{role.description || '—'}</td><td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{roleUsers.length}</td><td className="max-w-[300px] px-4 py-3"><div className="flex flex-wrap gap-1">{(rolePermissionNames.length ? rolePermissionNames : permissionNames.length ? ['No permissions assigned to users in this role'] : []).map(permission => <span key={permission} className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">{permission}</span>)}{!permissionNames.length && <span className="text-sm text-gray-400">None available</span>}</div></td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${role.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>{role.is_active ? 'Active' : 'Inactive'}</span></td><td className="px-4 py-3"><button onClick={() => onEdit(role)} className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400"><Edit className="h-4 w-4" /> Edit</button></td></tr>;
      })}{!roles.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">No roles configured.</td></tr>}</tbody>
    </table></div>
    <p className="border-t border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">Permission assignments are exposed by the existing per-user permission API. The current backend does not provide role-permission mutation endpoints, so no unsupported permission controls are shown.</p>
  </section>;
};

const SettingsSection: React.FC = () => <section className={`${cardClass} p-6`}><div className="flex items-start gap-3"><Settings className="mt-1 h-5 w-5 text-gray-500" /><div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Settings</h2><p className="mt-1 text-gray-600 dark:text-gray-400">No persistent system settings are currently exposed by the backend.</p><p className="mt-4 text-sm text-gray-500 dark:text-gray-400">This section is ready for settings when the application service layer supports them. No non-functional controls have been added.</p></div></div></section>;
