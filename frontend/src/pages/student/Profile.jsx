import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';
import { User, Mail, Shield, Edit2, Save, X, Plus, Trash2, Lock, Loader2, Camera, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const roleColors = {
  student: 'from-blue-500 to-violet-600',
  teacher: 'from-emerald-500 to-cyan-600',
  admin: 'from-rose-500 to-orange-600',
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', skills: user?.skills || [] });
  const [newSkill, setNewSkill] = useState('');
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const roleColor = roleColors[user?.role] || roleColors.student;

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      await updateUser({ name: form.name, bio: form.bio, skills: form.skills });
      setEditing(false);
    } catch (e) {
      toast.error(e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user?.name || '', bio: user?.bio || '', skills: user?.skills || [] });
    setEditing(false);
  };

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill) return;
    if (form.skills.includes(skill)) return toast.error('Skill already added');
    setForm(f => ({ ...f, skills: [...f.skills, skill] }));
    setNewSkill('');
  };

  const removeSkill = (skill) => setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));

  const changePassword = async () => {
    if (!pwdForm.currentPassword || !pwdForm.newPassword) return toast.error('Fill all password fields');
    if (pwdForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (pwdForm.newPassword !== pwdForm.confirmPassword) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password changed successfully!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setChangingPwd(false);
    } catch (e) {
      toast.error(e.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="card overflow-hidden">
        {/* Banner */}
        <div className={`h-28 bg-gradient-to-br ${roleColor} relative`}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>

        {/* Avatar & Info */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${roleColor} flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-gray-900 shadow-lg`}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
            </div>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn-outline btn-sm flex items-center gap-1.5">
                <Edit2 size={14} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancel} className="btn-secondary btn-sm flex items-center gap-1.5">
                  <X size={14} /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="btn-primary btn-sm flex items-center gap-1.5">
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={14} />}
                  Save
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="input-label">Full Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Your name" />
              </div>
              <div>
                <label className="input-label">Bio</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} className="input resize-none" placeholder="Tell others about yourself..." maxLength={500} />
                <p className="text-xs text-gray-400 mt-1">{form.bio.length}/500</p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className={clsx('badge capitalize', user?.role === 'admin' ? 'badge-red' : user?.role === 'teacher' ? 'badge-green' : 'badge-blue')}>
                  <Shield size={10} className="mr-1" />{user?.role}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-500"><Mail size={13} />{user?.email}</span>
              </div>
              {user?.bio && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{user.bio}</p>}
              <p className="text-xs text-gray-400 mt-2">Member since {new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
            </div>
          )}
        </div>
      </div>

      {/* Skills Card */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award size={18} className="text-blue-500" /> Skills
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {(editing ? form.skills : user?.skills || []).map(skill => (
            <span key={skill} className={clsx('flex items-center gap-1.5 badge-blue py-1 px-2.5', editing && 'pr-1.5')}>
              {skill}
              {editing && (
                <button onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors">
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
          {(!editing && (!user?.skills || user.skills.length === 0)) && (
            <p className="text-sm text-gray-400">No skills added yet. Edit your profile to add skills.</p>
          )}
        </div>
        {editing && (
          <div className="flex gap-2">
            <input
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSkill()}
              placeholder="Add a skill (e.g. React, Python)"
              className="input flex-1"
            />
            <button onClick={addSkill} className="btn-primary btn-sm flex items-center gap-1">
              <Plus size={14} /> Add
            </button>
          </div>
        )}
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Courses', value: user?.enrolledCourses?.length || 0, icon: '📚' },
          { label: 'Problems', value: user?.solvedProblems?.length || 0, icon: '💻' },
          { label: 'Days Active', value: Math.floor((Date.now() - new Date(user?.createdAt)) / 86400000), icon: '🔥' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card p-4 text-center">
            <span className="text-2xl">{icon}</span>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Change Password */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock size={18} className="text-blue-500" /> Password & Security
          </h3>
          {!changingPwd && (
            <button onClick={() => setChangingPwd(true)} className="btn-outline btn-sm">Change Password</button>
          )}
        </div>

        {changingPwd ? (
          <div className="space-y-3">
            {[
              { key: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
              { key: 'newPassword', label: 'New Password', placeholder: 'Min 6 characters' },
              { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="input-label">{label}</label>
                <input
                  type="password"
                  value={pwdForm[key]}
                  onChange={e => setPwdForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="input"
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setChangingPwd(false); setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} className="btn-secondary btn-sm">Cancel</button>
              <button onClick={changePassword} disabled={saving} className="btn-primary btn-sm flex items-center gap-1.5">
                {saving && <Loader2 size={13} className="animate-spin" />}
                Update Password
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Keep your account secure with a strong password. We recommend using a mix of letters, numbers, and symbols.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
