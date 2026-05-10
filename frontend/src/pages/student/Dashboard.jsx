import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tasksAPI, coursesAPI, dsaAPI, jobsAPI } from '../../utils/api';
import {
  BookOpen, Code2, Brain, Briefcase, CheckSquare, TrendingUp,
  Flame, Trophy, Target, ChevronRight, Clock, Star, Zap,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const activityData = [
  { day: 'Mon', problems: 3, tasks: 5 },
  { day: 'Tue', problems: 5, tasks: 3 },
  { day: 'Wed', problems: 2, tasks: 7 },
  { day: 'Thu', problems: 8, tasks: 4 },
  { day: 'Fri', problems: 6, tasks: 6 },
  { day: 'Sat', problems: 10, tasks: 2 },
  { day: 'Sun', problems: 4, tasks: 8 },
];

const diffColors = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };

const StatCard = ({ icon: Icon, label, value, color, sub, link }) => (
  <Link to={link || '#'} className="card-hover p-5 block group">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center`}>
        <Icon size={20} className="text-white" />
      </div>
      <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-green-500 mt-1 font-medium">{sub}</p>}
  </Link>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tasks: [], dsaStats: [], courses: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [tasksRes, dsaRes, coursesRes] = await Promise.allSettled([
          tasksAPI.getStats(),
          dsaAPI.getStats(),
          coursesAPI.getAll({ limit: 3 }),
        ]);
        setStats({
          tasks: tasksRes.status === 'fulfilled' ? tasksRes.value.stats : [],
          dsaStats: dsaRes.status === 'fulfilled' ? dsaRes.value.stats : [],
          courses: coursesRes.status === 'fulfilled' ? coursesRes.value.courses : [],
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalSolved = stats.dsaStats.reduce((a, s) => a + s.count, 0);
  const completedTasks = stats.tasks.find((t) => t._id === 'completed')?.count || 0;
  const totalTasks = stats.tasks.reduce((a, t) => a + t.count, 0);

  const dsaPieData = stats.dsaStats.map((s) => ({
    name: s._id,
    value: s.count,
    color: diffColors[s._id] || '#6366f1',
  }));

  const quickActions = [
    { label: 'Practice DSA', icon: TrendingUp, color: 'bg-blue-500', link: '/student/dsa' },
    { label: 'Code Editor', icon: Code2, color: 'bg-violet-500', link: '/student/editor' },
    { label: 'AI Interview', icon: Brain, color: 'bg-cyan-500', link: '/student/ai-coach' },
    { label: 'Browse Jobs', icon: Briefcase, color: 'bg-emerald-500', link: '/student/jobs' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700 p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-12" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Flame size={20} className="text-orange-300" />
            <span className="text-blue-100 text-sm font-medium">7 day streak 🔥</span>
          </div>
          <h2 className="text-2xl font-display font-bold">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-blue-100 mt-1 text-sm">You're on your way to success. Keep it up!</p>
          <div className="flex gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalSolved}</p>
              <p className="text-xs text-blue-200">Problems Solved</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold">{completedTasks}</p>
              <p className="text-xs text-blue-200">Tasks Done</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold">{user?.enrolledCourses?.length || 0}</p>
              <p className="text-xs text-blue-200">Courses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Problems Solved" value={totalSolved} color="bg-gradient-to-br from-blue-500 to-blue-600" sub="+12 this week" link="/student/dsa" />
        <StatCard icon={BookOpen} label="Enrolled Courses" value={user?.enrolledCourses?.length || 0} color="bg-gradient-to-br from-violet-500 to-violet-600" link="/student/courses" />
        <StatCard icon={CheckSquare} label="Tasks Completed" value={completedTasks} color="bg-gradient-to-br from-emerald-500 to-emerald-600" sub={`${totalTasks} total`} link="/student/tasks" />
        <StatCard icon={Trophy} label="Rank" value="#42" color="bg-gradient-to-br from-orange-500 to-amber-500" sub="Top 5%" />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(({ label, icon: Icon, color, link }) => (
            <Link
              key={label}
              to={link}
              className="card-hover p-4 flex flex-col items-center gap-2 text-center group"
            >
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon size={18} className="text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Weekly Activity</h3>
            <span className="badge-blue">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="colorProblems" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Area type="monotone" dataKey="problems" stroke="#3b82f6" strokeWidth={2} fill="url(#colorProblems)" name="Problems" />
              <Area type="monotone" dataKey="tasks" stroke="#7c3aed" strokeWidth={2} fill="url(#colorTasks)" name="Tasks" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* DSA Progress Pie */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">DSA Progress</h3>
          {dsaPieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={dsaPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {dsaPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {dsaPieData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                      <span className="text-gray-600 dark:text-gray-400 capitalize">{name}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Target size={32} className="text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-500">Start solving problems!</p>
              <Link to="/student/dsa" className="btn-primary btn-sm mt-3 text-xs">Go to DSA Sheet</Link>
            </div>
          )}
        </div>
      </div>

      {/* Featured Courses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Featured Courses</h3>
          <Link to="/student/courses" className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.courses.slice(0, 3).map((course) => (
            <Link key={course._id} to={`/student/courses/${course._id}`} className="card-hover overflow-hidden">
              <div className="h-28 bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <BookOpen size={32} className="text-white/60" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge-blue capitalize">{course.category}</span>
                  <span className="badge-gray capitalize">{course.level}</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">{course.title}</h4>
                <div className="flex items-center gap-1 mt-2">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{course.rating || '4.8'} • {course.duration}h</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
