import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { coursesAPI, assignmentsAPI } from '../../utils/api';
import { BookOpen, Users, ClipboardList, TrendingUp, Plus, ChevronRight, Star, Award, BarChart3, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const enrollmentData = [
  { month: 'Jan', students: 12 }, { month: 'Feb', students: 19 },
  { month: 'Mar', students: 25 }, { month: 'Apr', students: 31 },
  { month: 'May', students: 28 }, { month: 'Jun', students: 45 },
  { month: 'Jul', students: 52 },
];

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [coursesRes, assignRes] = await Promise.allSettled([
          coursesAPI.getMyCourses(),
          assignmentsAPI.getAll(),
        ]);
        if (coursesRes.status === 'fulfilled') {
          setCourses(coursesRes.value.courses || []);
        } else {
          console.log('Courses load issue:', coursesRes.reason);
          setCourses([]);
        }
        if (assignRes.status === 'fulfilled') {
          setAssignments(assignRes.value.assignments || []);
        } else {
          console.log('Assignments load issue:', assignRes.reason);
          setAssignments([]);
        }
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalStudents = courses.reduce((a, c) => a + (c.enrolledStudents?.length || 0), 0);
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => c.isPublished).length;
  const pendingSubmissions = assignments.reduce((a, asgn) => a + (asgn.submissions?.filter(s => s.status === 'pending').length || 0), 0);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-cyan-600 to-teal-700 p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="relative z-10">
          <p className="text-emerald-100 text-sm mb-1">👋 Welcome back, Professor</p>
          <h2 className="text-2xl font-display font-bold">{user?.name}</h2>
          <p className="text-emerald-100 mt-1 text-sm">You're inspiring {totalStudents} students today</p>
          <div className="flex gap-6 mt-4">
            <div className="text-center"><p className="text-2xl font-bold">{totalStudents}</p><p className="text-xs text-emerald-200">Total Students</p></div>
            <div className="w-px bg-white/20" />
            <div className="text-center"><p className="text-2xl font-bold">{publishedCourses}</p><p className="text-xs text-emerald-200">Active Courses</p></div>
            <div className="w-px bg-white/20" />
            <div className="text-center"><p className="text-2xl font-bold">{pendingSubmissions}</p><p className="text-xs text-emerald-200">Pending Reviews</p></div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Courses', value: totalCourses, icon: BookOpen, color: 'bg-gradient-to-br from-blue-500 to-blue-600', link: '/teacher/courses' },
          { label: 'Total Students', value: totalStudents, icon: Users, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600', link: '/teacher/students' },
          { label: 'Assignments', value: assignments.length, icon: ClipboardList, color: 'bg-gradient-to-br from-violet-500 to-violet-600', link: '/teacher/assignments' },
          { label: 'Pending Reviews', value: pendingSubmissions, icon: Clock, color: 'bg-gradient-to-br from-amber-500 to-amber-600', link: '/teacher/assignments' },
        ].map(({ label, value, icon: Icon, color, link }) => (
          <Link key={label} to={link} className="card-hover p-5 block group">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center`}>
                <Icon size={20} className="text-white" />
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Enrollment chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Student Enrollment</h3>
            <span className="badge-green">Growing</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="students" fill="#10b981" radius={[4, 4, 0, 0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* My Courses */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">My Courses</h3>
            <Link to="/teacher/courses" className="text-sm text-emerald-500 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {courses.length === 0 ? (
            <div className="empty-state py-8">
              <BookOpen size={32} className="text-gray-200 dark:text-gray-700 mb-2" />
              <p className="text-sm text-gray-400">No courses yet</p>
              <Link to="/teacher/courses" className="btn-primary btn-sm mt-3">
                <Plus size={14} className="mr-1" /> Create Course
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.slice(0, 4).map(course => (
                <div key={course._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{course.title}</p>
                    <p className="text-xs text-gray-500">{course.enrolledStudents?.length || 0} students • {course.isPublished ? '✅ Published' : '⏳ Draft'}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-500">
                    <Star size={12} className="fill-amber-500" />
                    {course.rating?.toFixed(1) || '4.8'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Assignments */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Assignments</h3>
          <Link to="/teacher/assignments" className="btn-primary btn-sm flex items-center gap-1">
            <Plus size={14} /> New Assignment
          </Link>
        </div>
        {assignments.length === 0 ? (
          <div className="empty-state py-8">
            <ClipboardList size={32} className="text-gray-200 dark:text-gray-700 mb-2" />
            <p className="text-sm text-gray-400">No assignments created yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assignments.slice(0, 4).map(asgn => {
              const pending = asgn.submissions?.filter(s => s.status === 'pending').length || 0;
              const total = asgn.submissions?.length || 0;
              return (
                <div key={asgn._id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">{asgn.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">Due: {new Date(asgn.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge-blue">{total} submissions</span>
                    {pending > 0 && <span className="badge-yellow">{pending} pending</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
