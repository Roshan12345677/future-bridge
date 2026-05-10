import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, BookOpen, Code2, Brain, Briefcase, MessageSquare,
  CheckSquare, User, LogOut, Sun, Moon, GraduationCap, Shield,
  Users, BarChart3, PlusSquare, ClipboardList, TrendingUp,
  Building2, CalendarCheck,
} from 'lucide-react';
import clsx from 'clsx';

const studentNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/student' },
  { label: 'SSBT Courses', icon: Building2, path: '/student/ssbt' },
  { label: 'My Attendance', icon: CalendarCheck, path: '/student/ssbt/attendance' },
  { label: 'Courses', icon: BookOpen, path: '/student/courses' },
  { label: 'DSA Sheet', icon: TrendingUp, path: '/student/dsa' },
  { label: 'Code Editor', icon: Code2, path: '/student/editor' },
  { label: 'AI Coach', icon: Brain, path: '/student/ai-coach' },
  { label: 'Jobs & Internships', icon: Briefcase, path: '/student/jobs' },
  { label: 'Discussion Forum', icon: MessageSquare, path: '/student/chat' },
  { label: 'Task Manager', icon: CheckSquare, path: '/student/tasks' },
  { label: 'Profile', icon: User, path: '/student/profile' },
];

const teacherNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/teacher' },
  { label: 'SSBT Manager', icon: Building2, path: '/teacher/ssbt-manager' },
  { label: 'Attendance', icon: CalendarCheck, path: '/teacher/attendance' },
  { label: 'My Courses', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Assignments', icon: ClipboardList, path: '/teacher/assignments' },
  { label: 'Students', icon: Users, path: '/teacher/students' },
  { label: 'Forum', icon: MessageSquare, path: '/teacher/forum' },
  { label: 'Profile', icon: User, path: '/teacher/profile' },
];

const adminNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Users', icon: Users, path: '/admin/users' },
  { label: 'Courses', icon: BookOpen, path: '/admin/courses' },
  { label: 'Job Portal', icon: Briefcase, path: '/admin/jobs' },
  { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { label: 'Profile', icon: User, path: '/admin/profile' },
];

const roleConfig = {
  student: { nav: studentNav, color: 'from-blue-600 to-violet-600', icon: GraduationCap, label: 'Student' },
  teacher: { nav: teacherNav, color: 'from-emerald-600 to-cyan-600', icon: PlusSquare, label: 'Teacher' },
  admin: { nav: adminNav, color: 'from-rose-600 to-orange-600', icon: Shield, label: 'Admin' },
};

const Sidebar = ({ collapsed = false, onToggle }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const config = roleConfig[user?.role] || roleConfig.student;
  const RoleIcon = config.icon;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen flex flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-30 transition-all duration-300 shadow-sm',
        collapsed ? 'w-16' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className={clsx('flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800', collapsed && 'justify-center')}>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0 shadow-glow-blue`}>
          <RoleIcon size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-display font-bold text-gray-900 dark:text-white text-sm leading-tight">Future Bridge</h1>
            <span className={`text-xs font-medium bg-gradient-to-r ${config.color} bg-clip-text text-transparent capitalize`}>{config.label} Portal</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {/* SSBT Section Label */}
        {!collapsed && user?.role !== 'admin' && (
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 mt-1">
            {user?.role === 'teacher' ? 'SSBT Features' : 'Academic'}
          </p>
        )}
        <div className="space-y-0.5">
          {config.nav.map(({ label, icon: Icon, path }, idx) => {
            // Add section divider before non-SSBT items for student
            const isSSBT = path.includes('ssbt') || path.includes('attendance');
            const prevIsSSBT = idx > 0 && (config.nav[idx-1].path.includes('ssbt') || config.nav[idx-1].path.includes('attendance'));
            const showDivider = !collapsed && user?.role === 'student' && !isSSBT && prevIsSSBT;

            return (
              <React.Fragment key={path}>
                {showDivider && (
                  <div className="px-3 py-2">
                    <div className="border-t border-gray-100 dark:border-gray-800" />
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">Learning</p>
                  </div>
                )}
                <NavLink
                  to={path}
                  end={path === '/student' || path === '/teacher' || path === '/admin'}
                  className={({ isActive }) =>
                    clsx('sidebar-item', isActive && 'active', collapsed && 'justify-center px-0')
                  }
                  title={collapsed ? label : undefined}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              </React.Fragment>
            );
          })}
        </div>
      </nav>

      {/* User profile & actions */}
      <div className={clsx('p-3 border-t border-gray-100 dark:border-gray-800 space-y-1', collapsed && 'px-1')}>
        <button
          onClick={toggleTheme}
          className={clsx('sidebar-item w-full', collapsed && 'justify-center px-0')}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0 text-white text-sm font-bold`}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={clsx('sidebar-item w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600', collapsed && 'justify-center px-0')}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
