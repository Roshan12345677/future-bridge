import React, { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '../../utils/api';
import { Users, Search, Shield, UserCheck, UserX, Trash2, Edit2, Plus, Loader2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/shared/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import clsx from 'clsx';

const roleConfig = {
  student: { badge: 'badge-blue', label: 'Student' },
  teacher: { badge: 'badge-green', label: 'Teacher' },
  admin: { badge: 'badge-red', label: 'Admin' },
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editModal, setEditModal] = useState({ open: false, user: null });
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'student', isActive: true });
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (search) params.search = search;
      const data = await usersAPI.getAll(params);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (e) { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openEdit = (user) => {
    setEditForm({ name: user.name, email: user.email, role: user.role, isActive: user.isActive });
    setEditModal({ open: true, user });
  };

  const saveUser = async () => {
    setSaving(true);
    try {
      await usersAPI.update(editModal.user._id, editForm);
      toast.success('User updated!');
      setEditModal({ open: false, user: null });
      fetchUsers();
    } catch (e) { toast.error(e.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (user) => {
    try {
      const data = await usersAPI.toggleStatus(user._id);
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: data.isActive } : u));
      toast.success(data.message);
    } catch (e) { toast.error('Failed to update status'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await usersAPI.delete(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch (e) { toast.error(e.message || 'Failed to delete'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">{total} total users on the platform</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="input pl-9" />
        </div>
        <div className="flex gap-2">
          {['all', 'student', 'teacher', 'admin'].map(role => (
            <button key={role} onClick={() => setRoleFilter(role)} className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors', roleFilter === role ? 'bg-rose-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800')}>
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner text="Loading users..." /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${user.role === 'admin' ? 'bg-gradient-to-br from-rose-500 to-orange-600' : user.role === 'teacher' ? 'bg-gradient-to-br from-emerald-500 to-cyan-600' : 'bg-gradient-to-br from-blue-500 to-violet-600'}`}>
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                          {user.skills?.length > 0 && <p className="text-xs text-gray-400">{user.skills.slice(0, 2).join(', ')}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('badge text-xs capitalize', roleConfig[user.role]?.badge)}>
                        {roleConfig[user.role]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={clsx('badge text-xs', user.isActive ? 'badge-green' : 'badge-red')}>
                        {user.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(user)} className="btn-icon text-gray-400 hover:text-blue-500 w-8 h-8" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => toggleStatus(user)} className={clsx('btn-icon w-8 h-8', user.isActive ? 'text-gray-400 hover:text-yellow-500' : 'text-gray-400 hover:text-green-500')} title={user.isActive ? 'Deactivate' : 'Activate'}>
                          {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button onClick={() => deleteUser(user._id)} className="btn-icon text-gray-400 hover:text-red-500 w-8 h-8" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="empty-state py-12">
                <Users size={32} className="text-gray-200 dark:text-gray-700 mb-2" />
                <p className="text-sm text-gray-500">No users found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, user: null })} title="Edit User" size="sm"
        footer={<div className="flex justify-end gap-2"><button onClick={() => setEditModal({ open: false, user: null })} className="btn-secondary btn-sm">Cancel</button><button onClick={saveUser} disabled={saving} className="btn-primary btn-sm flex items-center gap-1.5">{saving && <Loader2 size={13} className="animate-spin" />}Update</button></div>}
      >
        <div className="space-y-4">
          <div><label className="input-label">Name</label><input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="input" /></div>
          <div><label className="input-label">Email</label><input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className="input" /></div>
          <div><label className="input-label">Role</label>
            <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} className="input capitalize">
              {['student', 'teacher', 'admin'].map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Account Active</span>
          </label>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;
