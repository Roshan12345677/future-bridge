import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, BookOpen, Award, Briefcase, MessageSquare } from 'lucide-react';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const monthlyData = [
  { month: 'Jan', users: 45, courses: 8, jobs: 12, solves: 234 },
  { month: 'Feb', users: 72, courses: 12, jobs: 18, solves: 345 },
  { month: 'Mar', users: 89, courses: 15, jobs: 22, solves: 412 },
  { month: 'Apr', users: 124, courses: 18, jobs: 28, solves: 567 },
  { month: 'May', users: 156, courses: 22, jobs: 35, solves: 678 },
  { month: 'Jun', users: 198, courses: 28, jobs: 42, solves: 789 },
  { month: 'Jul', users: 234, courses: 32, jobs: 48, solves: 923 },
];

const categoryData = [
  { name: 'Academic', value: 35, color: '#3b82f6' },
  { name: 'Competitive', value: 25, color: '#7c3aed' },
  { name: 'Placement', value: 28, color: '#10b981' },
  { name: 'DSA', value: 8, color: '#f59e0b' },
  { name: 'Other', value: 4, color: '#94a3b8' },
];

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getStats()
      .then(d => setStats(d.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading analytics..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Platform Analytics</h1>
        <p className="page-subtitle">Comprehensive insights into platform performance</p>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Users', value: stats.users.total, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Students', value: stats.users.students, icon: Users, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
            { label: 'Teachers', value: stats.users.teachers, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Courses', value: stats.courses.total, icon: BookOpen, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
            { label: 'Active Jobs', value: stats.jobs.active, icon: Briefcase, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'DSA Solved', value: stats.solvedProblems, icon: Award, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-4 text-center">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value?.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Growth Chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Platform Growth (2024)</h3>
          <div className="flex gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />Users</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-violet-500 rounded-full inline-block" />Solves</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSolves" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
            <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fill="url(#colorUsers)" name="New Users" />
            <Area type="monotone" dataKey="solves" stroke="#7c3aed" strokeWidth={2} fill="url(#colorSolves)" name="DSA Solves" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Course Category Distribution */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Course Category Distribution</h3>
          <div className="flex gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={2}>
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} formatter={(val) => [`${val}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5 justify-center flex flex-col">
              {categoryData.map(({ name, value, color }) => (
                <div key={name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{name}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Activity */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Jobs & Courses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="courses" fill="#7c3aed" radius={[4, 4, 0, 0]} name="New Courses" />
              <Bar dataKey="jobs" fill="#10b981" radius={[4, 4, 0, 0]} name="Job Postings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
