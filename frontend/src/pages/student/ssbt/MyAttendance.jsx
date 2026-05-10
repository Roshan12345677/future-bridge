import React, { useState, useEffect } from 'react';
import { ssbtAPI } from '../../../utils/api';
import { CheckCircle2, XCircle, Clock, AlertTriangle, BookOpen, TrendingUp, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import clsx from 'clsx';

const MyAttendance = () => {
  const [summaries, setSummaries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const [attRes, statRes] = await Promise.all([
          ssbtAPI.getMyAttendance(),
          ssbtAPI.getAttendanceStats(),
        ]);
        setSummaries(attRes.summaries || []);
        setStats(statRes.stats);
      } catch (e) {
        toast.error('Failed to load attendance');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = summaries.filter(s => {
    if (filter === 'shortage') return s.attendancePercentage < 75;
    if (filter === 'good') return s.attendancePercentage >= 75;
    return true;
  });

  const getStatusConfig = (pct) => {
    if (pct >= 85) return { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', bar: 'bg-green-500', label: 'Excellent', icon: CheckCircle2 };
    if (pct >= 75) return { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', bar: 'bg-blue-500', label: 'Good', icon: CheckCircle2 };
    if (pct >= 60) return { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', bar: 'bg-yellow-500', label: 'Warning', icon: AlertTriangle };
    return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', bar: 'bg-red-500', label: 'Shortage', icon: XCircle };
  };

  if (loading) return <LoadingSpinner text="Loading your attendance..." />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">My Attendance</h1>
        <p className="page-subtitle">Track your subject-wise attendance. Minimum 75% required.</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Subjects', value: stats.totalSubjects, icon: BookOpen, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Avg Attendance', value: `${stats.avgPercentage || 0}%`, icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Shortage Subjects', value: stats.shortage, icon: AlertTriangle, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
            { label: 'Safe Subjects', value: (stats.totalSubjects - stats.shortage), icon: CheckCircle2, color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.split(' ').slice(1).join(' ')}`}>
                <Icon size={18} className={color.split(' ')[0]} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 75% Warning Banner */}
      {stats?.shortage > 0 && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400">Attendance Shortage Alert!</p>
            <p className="text-sm text-red-600 dark:text-red-300 mt-0.5">
              You have shortage in <strong>{stats.shortage} subject(s)</strong>. Minimum 75% attendance is required for university exam eligibility.
            </p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'All Subjects' },
          { value: 'good', label: '≥75% (Safe)' },
          { value: 'shortage', label: '<75% (Shortage)' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              filter === f.value ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800'
            )}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Attendance Cards */}
      {filtered.length === 0 ? (
        <div className="card empty-state py-16">
          <Calendar size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 font-medium">No attendance records found</p>
          <p className="text-sm text-gray-400 mt-1">Enroll in SSBT courses to track attendance</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(s => {
            const pct = s.attendancePercentage || 0;
            const conf = getStatusConfig(pct);
            const StatusIcon = conf.icon;
            return (
              <div key={s._id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{s.subject}</h3>
                    {s.subjectCode && <p className="text-xs text-gray-400 mt-0.5">{s.subjectCode} • Sem {s.semester}</p>}
                  </div>
                  <div className={clsx('flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold', conf.bg, conf.color)}>
                    <StatusIcon size={14} />
                    {pct}%
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
                  <div className={clsx('h-full rounded-full transition-all duration-500', conf.bar)}
                    style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                {/* 75% marker */}
                <div className="relative h-0">
                  <div className="absolute border-l-2 border-dashed border-orange-400" style={{ left: '75%', top: '-10px', height: '10px' }} />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{s.totalClasses}</p>
                    <p className="text-xs text-gray-400">Total</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-2">
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">{s.presentClasses}</p>
                    <p className="text-xs text-gray-400">Present</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-2">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">{s.absentClasses}</p>
                    <p className="text-xs text-gray-400">Absent</p>
                  </div>
                </div>

                {/* Classes needed */}
                {pct < 75 && s.totalClasses > 0 && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-xs text-red-600 dark:text-red-400 text-center">
                    ⚠️ Need {Math.ceil((0.75 * (s.totalClasses + 10) - s.presentClasses))} more classes to reach 75%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAttendance;
