import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../../utils/api';
import { Users, BookOpen, Briefcase, MessageSquare, TrendingUp, Shield, ChevronRight, Activity, Award } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const activityData = [
  { day: 'Mon', logins: 45, signups: 12 },
  { day: 'Tue', logins: 52, signups: 8 },
  { day: 'Wed', logins: 38, signups: 15 },
  { day: 'Thu', logins: 67, signups: 20 },
  { day: 'Fri', logins: 71, signups: 18 },
  { day: 'Sat', logins: 33, signups: 5 },
  { day: 'Sun', logins: 28, signups: 3 },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getStats()
      .then(d => { setStats(d.stats); setRecentUsers(d.recentUsers || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading admin dashboard..." />;

  const userPieData = stats ? [
    { name: 'Students', value: stats.users.students, color: '#3b82f6' },
    { name: 'Teachers', value: stats.users.teachers, color: '#10b981' },
    { name: 'Admins', value: stats.users.admins, color: '#f43f5e' },
  ] : [];

  const statCards = stats ? [
    { label: 'Total Users', value: stats.users.total, icon: Users, color: 'bg-gradient-to-br from-blue-500 to-blue-600', link: '/admin/users', sub: `${stats.users.students} students` },
    { label: 'Total Courses', value: stats.courses.total, icon: BookOpen, color: 'bg-gradient-to-br from-violet-500 to-violet-600', link: '/admin/courses', sub: `${stats.courses.published} published` },
    { label: 'Active Jobs', value: stats.jobs.active, icon: Briefcase, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600', link: '/admin/jobs', sub: `${stats.jobs.total} total` },
    { label: 'DSA Solved', value: stats.solvedProblems, icon: Award, color: 'bg-gradient-to-br from-amber-500 to-amber-600', link: '/admin/analytics', sub: 'total solves' },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 via-orange-600 to-amber-600 p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-12" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={18} className="text-orange-200" />
            <span className="text-orange-100 text-sm font-medium">Admin Control Panel</span>
          </div>
          <h2 className="text-2xl font-display font-bold">Platform Overview</h2>
          <p className="text-orange-100 mt-1 text-sm">Everything is running smoothly. {stats?.users.total || 0} users on the platform.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, link, sub }) => (
          <Link key={label} to={link} className="card-hover p-5 block group">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center`}>
                <Icon size={20} className="text-white" />
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-rose-500 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value?.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{label}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Platform Activity</h3>
            <div className="flex gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />Logins</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />Signups</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Line type="monotone" dataKey="logins" stroke="#3b82f6" strokeWidth={2} dot={false} name="Daily Logins" />
              <Line type="monotone" dataKey="signups" stroke="#10b981" strokeWidth={2} dot={false} name="New Signups" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">User Distribution</h3>
          {userPieData.length > 0 && (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={userPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {userPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {userPieData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                      <span className="text-gray-600 dark:text-gray-400">{name}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Users</h3>
          <Link to="/admin/users" className="text-sm text-rose-500 hover:text-rose-600 flex items-center gap-1">
            Manage All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th className="pb-3 text-left">User</th>
                <th className="pb-3 text-left hidden md:table-cell">Email</th>
                <th className="pb-3 text-left">Role</th>
                <th className="pb-3 text-left hidden sm:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {recentUsers.map(user => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${user.role === 'admin' ? 'bg-rose-500' : user.role === 'teacher' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell text-sm text-gray-500">{user.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`badge capitalize text-xs ${user.role === 'admin' ? 'badge-red' : user.role === 'teacher' ? 'badge-green' : 'badge-blue'}`}>{user.role}</span>
                  </td>
                  <td className="py-3 hidden sm:table-cell text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Manage Users', link: '/admin/users', icon: Users, color: 'from-blue-500 to-blue-600' },
          { label: 'Manage Courses', link: '/admin/courses', icon: BookOpen, color: 'from-violet-500 to-violet-600' },
          { label: 'Post a Job', link: '/admin/jobs', icon: Briefcase, color: 'from-emerald-500 to-emerald-600' },
          { label: 'View Analytics', link: '/admin/analytics', icon: TrendingUp, color: 'from-amber-500 to-amber-600' },
        ].map(({ label, link, icon: Icon, color }) => (
          <Link key={label} to={link} className="card-hover p-4 flex flex-col items-center gap-2 text-center group">
            <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Icon size={18} className="text-white" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
