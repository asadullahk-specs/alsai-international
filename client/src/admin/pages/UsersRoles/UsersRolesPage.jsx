import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiShield, FiUser } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StackTable from '../../components/common/StackTable';

const MODULES = ['dashboard', 'products', 'orders', 'customers', 'reviews', 'newsletter', 'content', 'marketing', 'inventory', 'reports', 'settings', 'users', 'backup'];
const ACTIONS = ['view', 'create', 'edit', 'delete', 'approve'];

const emptyRoleForm = { name: '', description: '', permissions: [] };
const emptyAdminForm = { fullName: '', email: '', password: '', role: '' };

const UsersRolesPage = ({ embedded = false }) => {
  const [tab, setTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleForm, setRoleForm] = useState(null);
  const [adminForm, setAdminForm] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([adminAxios.get('users/roles'), adminAxios.get('users/admins')]).then(([rolesRes, adminsRes]) => {
      setRoles(rolesRes.data.data.roles);
      setAdmins(adminsRes.data.data.admins);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const toggleAction = (moduleName, action) => {
    setRoleForm((prev) => {
      const permissions = [...prev.permissions];
      const idx = permissions.findIndex((p) => p.module === moduleName);
      if (idx === -1) {
        permissions.push({ module: moduleName, actions: [action] });
      } else {
        const actions = permissions[idx].actions.includes(action)
          ? permissions[idx].actions.filter((a) => a !== action)
          : [...permissions[idx].actions, action];
        permissions[idx] = { ...permissions[idx], actions };
      }
      return { ...prev, permissions };
    });
  };

  const hasAction = (moduleName, action) => {
    const perm = roleForm.permissions.find((p) => p.module === moduleName);
    return perm?.actions.includes(action) || false;
  };

  const saveRole = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (roleForm.id) await adminAxios.put(`users/roles/${roleForm.id}`, roleForm);
      else await adminAxios.post('users/roles', roleForm);
      setRoleForm(null);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save role.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRole = async (id) => {
    if (!window.confirm('Delete this role?')) return;
    try {
      await adminAxios.delete(`users/roles/${id}`);
      fetchAll();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Unable to delete role.');
    }
  };

  const saveAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (adminForm.id) {
        await adminAxios.put(`users/admins/${adminForm.id}`, { fullName: adminForm.fullName, role: adminForm.role });
      } else {
        await adminAxios.post('users/admins', adminForm);
      }
      setAdminForm(null);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save admin user.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAdminStatus = async (a) => {
    await adminAxios.put(`users/admins/${a._id}`, { isActive: !a.isActive });
    fetchAll();
  };

  const deleteAdmin = async (id) => {
    if (!window.confirm('Delete this admin user?')) return;
    try {
      await adminAxios.delete(`users/admins/${id}`);
      fetchAll();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Unable to delete admin.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {!embedded && <h1 className="font-serif text-2xl text-ink mb-6">Users &amp; Roles</h1>}

      <div className="flex items-center gap-2 mb-6 border-b border-cream-200">
        <button type="button" onClick={() => setTab('roles')} className={`px-3 py-2 text-xs tracking-widest border-b-2 ${tab === 'roles' ? 'border-brand text-brand' : 'border-transparent text-muted'}`}>
          ROLES
        </button>
        <button type="button" onClick={() => setTab('admins')} className={`px-3 py-2 text-xs tracking-widest border-b-2 ${tab === 'admins' ? 'border-brand text-brand' : 'border-transparent text-muted'}`}>
          ADMIN USERS
        </button>
      </div>

      {tab === 'roles' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => setRoleForm({ ...emptyRoleForm, id: null })}
              className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-4 py-2.5"
            >
              <FiPlus size={14} /> ADD ROLE
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((r) => (
              <div key={r._id} className="bg-white border border-cream-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-serif text-lg text-ink flex items-center gap-2">
                    <FiShield size={15} className="text-brand" /> {r.name}
                  </p>
                  {!r.isSystemRole && (
                    <button type="button" onClick={() => deleteRole(r._id)} className="text-muted hover:text-charcoal">
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted mb-3">{r.description}</p>
                <p className="text-xs text-muted mb-3">{r.adminCount} admin(s) · {r.isSystemRole ? 'All permissions' : `${r.permissions.length} module(s)`}</p>
                <button
                  type="button"
                  onClick={() => setRoleForm({ id: r._id, name: r.name, description: r.description, permissions: r.permissions })}
                  className="text-xs text-brand hover:underline"
                  disabled={r.isSystemRole}
                >
                  {r.isSystemRole ? 'System role' : 'Edit Permissions →'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'admins' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => setAdminForm({ ...emptyAdminForm, id: null })}
              className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-4 py-2.5"
            >
              <FiPlus size={14} /> ADD ADMIN USER
            </button>
          </div>
          <div className="bg-white border border-cream-200">
            <StackTable
              breakpoint={1180}
              rows={admins}
              rowKey={(a) => a._id}
              columns={[
                { key: 'name', label: 'Name', render: (a) => <span className="flex items-center gap-2 whitespace-nowrap"><FiUser size={14} className="text-muted" /> {a.fullName}</span> },
                { key: 'email', label: 'Email', render: (a) => a.email },
                { key: 'role', label: 'Role', render: (a) => a.role?.name },
                { key: 'lastLogin', label: 'Last Login', render: (a) => (a.lastLogin ? new Date(a.lastLogin).toLocaleString() : 'Never') },
                {
                  key: 'status',
                  label: 'Status',
                  render: (a) => (
                    <button type="button" onClick={() => toggleAdminStatus(a)}>
                      <span className={`text-[10px] tracking-wide px-2 py-1 ${a.isActive ? 'bg-brand/10 text-brand' : 'bg-cream-200 text-muted'}`}>
                        {a.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  ),
                },
              ]}
              actions={(a) => (
                <>
                  <button type="button" onClick={() => setAdminForm({ id: a._id, fullName: a.fullName, email: a.email, password: '', role: a.role?._id })} className="text-muted hover:text-brand text-xs">
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteAdmin(a._id)} className="text-muted hover:text-charcoal">
                    <FiTrash2 size={14} />
                  </button>
                </>
              )}
            />
          </div>
        </div>
      )}

      {roleForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={saveRole} className="bg-white p-6 w-full max-w-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-lg text-ink">{roleForm.id ? 'Edit Role' : 'Add Role'}</h2>
            {error && <p className="text-sm text-charcoal">{error}</p>}
            <input required placeholder="Role Name" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} className="w-full px-4 py-2.5 border border-cream-200 text-sm" />
            <input placeholder="Role Description" value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} className="w-full px-4 py-2.5 border border-cream-200 text-sm" />
            <p className="text-xs tracking-widest text-muted">PERMISSIONS</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th className="py-1 font-normal">Module</th>
                    {ACTIONS.map((a) => (
                      <th key={a} className="py-1 font-normal capitalize text-center">{a}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((m) => (
                    <tr key={m} className="border-t border-cream-100">
                      <td className="py-2 text-ink capitalize">{m}</td>
                      {ACTIONS.map((a) => (
                        <td key={a} className="py-2 text-center">
                          <input type="checkbox" checked={hasAction(m, a)} onChange={() => toggleAction(m, a)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3 pt-2 max-480:flex-col">
              <button type="button" onClick={() => setRoleForm(null)} className="flex-1 border border-ink/20 text-ink text-xs tracking-widest py-3 hover:border-ink">
                CANCEL
              </button>
              <button type="submit" disabled={submitting} className="flex-1 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest py-3 disabled:opacity-60">
                {submitting ? 'SAVING...' : 'SAVE ROLE'}
              </button>
            </div>
          </form>
        </div>
      )}

      {adminForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={saveAdmin} className="bg-white p-6 w-full max-w-md space-y-4">
            <h2 className="font-serif text-lg text-ink">{adminForm.id ? 'Edit Admin User' : 'Add Admin User'}</h2>
            {error && <p className="text-sm text-charcoal">{error}</p>}
            <input required placeholder="Full Name" value={adminForm.fullName} onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })} className="w-full px-4 py-2.5 border border-cream-200 text-sm" />
            <input required type="email" disabled={!!adminForm.id} placeholder="Email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} className="w-full px-4 py-2.5 border border-cream-200 text-sm disabled:bg-cream-100" />
            {!adminForm.id && (
              <input required type="password" placeholder="Temporary Password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} className="w-full px-4 py-2.5 border border-cream-200 text-sm" />
            )}
            <select required value={adminForm.role} onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })} className="w-full px-4 py-2.5 border border-cream-200 text-sm">
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
            <div className="flex gap-3 max-480:flex-col">
              <button type="button" onClick={() => setAdminForm(null)} className="flex-1 border border-ink/20 text-ink text-xs tracking-widest py-3 hover:border-ink">
                CANCEL
              </button>
              <button type="submit" disabled={submitting} className="flex-1 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest py-3 disabled:opacity-60">
                {submitting ? 'SAVING...' : 'SAVE'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UsersRolesPage;
