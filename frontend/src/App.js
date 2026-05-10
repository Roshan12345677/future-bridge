import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoadingSpinner from './components/shared/LoadingSpinner';

// ── Public Pages ──────────────────────────────────────────
const HomePage    = lazy(() => import('./pages/home/HomePage'));
const Login       = lazy(() => import('./pages/auth/Login'));
const Register    = lazy(() => import('./pages/auth/Register'));

// ── Layouts ───────────────────────────────────────────────
const StudentLayout = lazy(() => import('./components/dashboard/StudentLayout'));
const TeacherLayout = lazy(() => import('./components/dashboard/TeacherLayout'));
const AdminLayout   = lazy(() => import('./components/dashboard/AdminLayout'));

// ── Student Pages ─────────────────────────────────────────
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const Courses          = lazy(() => import('./pages/student/Courses'));
const CourseDetail     = lazy(() => import('./pages/student/CourseDetail'));
const DSASheet         = lazy(() => import('./pages/student/DSASheet'));
const CodeEditor       = lazy(() => import('./pages/student/CodeEditor'));
const AICoach          = lazy(() => import('./pages/student/AICoach'));
const Jobs             = lazy(() => import('./pages/student/Jobs'));
const Chat             = lazy(() => import('./pages/student/Chat'));
const Tasks            = lazy(() => import('./pages/student/Tasks'));
const Profile          = lazy(() => import('./pages/student/Profile'));

// ── SSBT Pages ────────────────────────────────────────────
const SSBTCourses      = lazy(() => import('./pages/student/ssbt/SSBTCourses'));
const SSBTCourseDetail = lazy(() => import('./pages/student/ssbt/SSBTCourseDetail'));
const MyAttendance     = lazy(() => import('./pages/student/ssbt/MyAttendance'));

// ── Teacher Pages ─────────────────────────────────────────
const TeacherDashboard   = lazy(() => import('./pages/teacher/Dashboard'));
const TeacherCourses     = lazy(() => import('./pages/teacher/Courses'));
const TeacherAssignments = lazy(() => import('./pages/teacher/Assignments'));
const TeacherStudents    = lazy(() => import('./pages/teacher/Students'));
const TeacherForum       = lazy(() => import('./pages/teacher/Forum'));
const TeacherSSBTManager = lazy(() => import('./pages/teacher/ssbt/TeacherSSBTManager'));
const TeacherAttendance  = lazy(() => import('./pages/teacher/ssbt/TeacherAttendance'));

// ── Admin Pages ───────────────────────────────────────────
const AdminDashboard  = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers      = lazy(() => import('./pages/admin/Users'));
const AdminCourses    = lazy(() => import('./pages/admin/Courses'));
const AdminJobs       = lazy(() => import('./pages/admin/Jobs'));
const AdminAnalytics  = lazy(() => import('./pages/admin/Analytics'));

// ── Protected Route ───────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const redirects = { student: '/student', teacher: '/teacher', admin: '/admin' };
    return <Navigate to={redirects[user?.role] || '/login'} replace />;
  }
  return children;
};

// ── Role Redirect (when logged-in user visits /dashboard) ─
const RoleRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const redirects = { student: '/student', teacher: '/teacher', admin: '/admin' };
  return <Navigate to={redirects[user?.role] || '/login'} replace />;
};

// ── App ───────────────────────────────────────────────────
const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>

              {/* ── Public Routes ── */}
              <Route path="/"         element={<HomePage />} />
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<RoleRedirect />} />

              {/* ── Student Routes ── */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentLayout />
                  </ProtectedRoute>
                }
              >
                <Route index                element={<StudentDashboard />} />
                <Route path="courses"       element={<Courses />} />
                <Route path="courses/:id"   element={<CourseDetail />} />
                <Route path="dsa"           element={<DSASheet />} />
                <Route path="editor"        element={<CodeEditor />} />
                <Route path="ai-coach"      element={<AICoach />} />
                <Route path="jobs"          element={<Jobs />} />
                <Route path="chat"          element={<Chat />} />
                <Route path="tasks"         element={<Tasks />} />
                <Route path="profile"       element={<Profile />} />
                <Route path="ssbt"          element={<SSBTCourses />} />
                <Route path="ssbt/:id"      element={<SSBTCourseDetail />} />
                <Route path="ssbt/attendance" element={<MyAttendance />} />
              </Route>

              {/* ── Teacher Routes ── */}
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherLayout />
                  </ProtectedRoute>
                }
              >
                <Route index                    element={<TeacherDashboard />} />
                <Route path="courses"           element={<TeacherCourses />} />
                <Route path="assignments"       element={<TeacherAssignments />} />
                <Route path="students"          element={<TeacherStudents />} />
                <Route path="forum"             element={<TeacherForum />} />
                <Route path="profile"           element={<Profile />} />
                <Route path="ssbt-manager"      element={<TeacherSSBTManager />} />
                <Route path="attendance"        element={<TeacherAttendance />} />
              </Route>

              {/* ── Admin Routes ── */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index             element={<AdminDashboard />} />
                <Route path="users"      element={<AdminUsers />} />
                <Route path="courses"    element={<AdminCourses />} />
                <Route path="jobs"       element={<AdminJobs />} />
                <Route path="analytics"  element={<AdminAnalytics />} />
                <Route path="profile"    element={<Profile />} />
              </Route>

              {/* ── 404 Fallback ── */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </Suspense>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1f2937',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;