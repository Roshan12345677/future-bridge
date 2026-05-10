import React, { useState, useEffect } from 'react';
import { ssbtAPI } from '../../../utils/api';
import {
  CheckCircle2, XCircle, Clock, Users, Save, Calendar,
  ChevronDown, BookOpen, AlertTriangle, Loader2, Eye, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import clsx from 'clsx';

const STATUS_OPTIONS = [
  { value: 'present', label: 'P', fullLabel: 'Present', color: 'bg-green-500 text-white', ring: 'ring-green-400' },
  { value: 'absent', label: 'A', fullLabel: 'Absent', color: 'bg-red-500 text-white', ring: 'ring-red-400' },
  { value: 'late', label: 'L', fullLabel: 'Late', color: 'bg-yellow-500 text-white', ring: 'ring-yellow-400' },
  { value: 'excused', label: 'E', fullLabel: 'Excused', color: 'bg-blue-500 text-white', ring: 'ring-blue-400' },
];

const TeacherAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mark'); // mark | history | report
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseStudents, setCourseStudents] = useState([]);
  const [form, setForm] = useState({
    subject: '',
    subjectCode: '',
    semester: 1,
    division: 'A',
    batch: '',
    date: new Date().toISOString().slice(0, 10),
    lectureType: 'lecture',
    topic: '',
  });
  const [attendance, setAttendance] = useState([]); // [{studentId, name, rollNumber, status}]
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Report state
  const [reportFilter, setReportFilter] = useState({ courseId: '', subject: '', semester: 1 });
  const [report, setReport] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          ssbtAPI.getCourses(),
          ssbtAPI.getSessions(),
        ]);
        setCourses(cRes.courses || []);
        setSessions(sRes.sessions || []);
      } catch (e) { toast.error('Failed to load data'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Load students when course + filters change
  const loadStudents = async () => {
    if (!selectedCourse) return toast.error('Please select a course first');
    setStudentsLoading(true);
    try {
      const data = await ssbtAPI.getCourseStudents(selectedCourse, {
        semester: form.semester,
        division: form.division,
        batch: form.batch || undefined,
      });
      const students = data.students || [];
      setCourseStudents(students);
      // Initialize attendance as absent for all
      setAttendance(students.map(s => ({
        studentId: s.student?._id,
        name: s.student?.name || 'Unknown',
        rollNumber: s.rollNumber || '',
        status: 'present', // default present, teacher marks absent
        remark: '',
      })));
      if (students.length === 0) toast('No students found for this filter', { icon: '⚠️' });
      else toast.success(`${students.length} students loaded`);
    } catch (e) { toast.error('Failed to load students'); }
    finally { setStudentsLoading(false); }
  };

  const setAllStatus = (status) => {
    setAttendance(prev => prev.map(a => ({ ...a, status })));
  };

  const toggleStatus = (studentId) => {
    setAttendance(prev => prev.map(a => {
      if (a.studentId !== studentId) return a;
      const order = ['present', 'absent', 'late', 'excused'];
      const next = order[(order.indexOf(a.status) + 1) % order.length];
      return { ...a, status: next };
    }));
  };

  const setStudentStatus = (studentId, status) => {
    setAttendance(prev => prev.map(a => a.studentId === studentId ? { ...a, status } : a));
  };

  const submitAttendance = async () => {
    if (!selectedCourse) return toast.error('Please select a course');
    if (!form.subject) return toast.error('Please enter subject name');
    if (attendance.length === 0) return toast.error('Please load students first');

    setSaving(true);
    try {
      await ssbtAPI.createSession({
        courseId: selectedCourse,
        ...form,
        students: attendance,
      });
      toast.success(`Attendance saved! ${attendance.filter(a => a.status === 'present').length} present, ${attendance.filter(a => a.status === 'absent').length} absent`);
      // Reload sessions
      const sRes = await ssbtAPI.getSessions();
      setSessions(sRes.sessions || []);
    } catch (e) { toast.error(e.message || 'Failed to save attendance'); }
    finally { setSaving(false); }
  };

  const loadReport = async () => {
    if (!reportFilter.courseId || !reportFilter.subject) return toast.error('Select course and subject');
    setReportLoading(true);
    try {
      const data = await ssbtAPI.getSubjectReport({
        courseId: reportFilter.courseId,
        subject: reportFilter.subject,
        semester: reportFilter.semester,
      });
      setReport(data.report || []);
    } catch (e) { toast.error('Failed to load report'); }
    finally { setReportLoading(false); }
  };

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;

  if (loading) return <LoadingSpinner text="Loading attendance system..." />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Attendance Management</h1>
        <p className="page-subtitle">Mark and track student attendance for SSBT courses</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'mark', label: 'Mark Attendance', icon: CheckCircle2 },
          { id: 'history', label: 'Session History', icon: Calendar },
          { id: 'report', label: 'Reports', icon: BarChart3 },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={clsx('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
              activeTab === id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800'
            )}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── Mark Attendance Tab ────────────────────────────── */}
      {activeTab === 'mark' && (
        <div className="space-y-4">
          {/* Config Card */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Session Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="input-label">Course *</label>
                <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="input">
                  <option value="">Select Engineering Course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.shortName})</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Subject Name *</label>
                <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. Data Structures" className="input" />
              </div>
              <div>
                <label className="input-label">Subject Code</label>
                <input value={form.subjectCode} onChange={e => setForm(f => ({ ...f, subjectCode: e.target.value }))}
                  placeholder="e.g. BTCS302" className="input" />
              </div>
              <div>
                <label className="input-label">Semester</label>
                <select value={form.semester} onChange={e => setForm(f => ({ ...f, semester: Number(e.target.value) }))} className="input">
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Division</label>
                <select value={form.division} onChange={e => setForm(f => ({ ...f, division: e.target.value }))} className="input">
                  {['A', 'B', 'C', 'D'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Batch</label>
                <input value={form.batch} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))}
                  placeholder="e.g. 2021-2025" className="input" />
              </div>
              <div>
                <label className="input-label">Date *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="input-label">Lecture Type</label>
                <select value={form.lectureType} onChange={e => setForm(f => ({ ...f, lectureType: e.target.value }))} className="input">
                  <option value="lecture">Lecture</option>
                  <option value="practical">Practical</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>
              <div>
                <label className="input-label">Topic Covered</label>
                <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                  placeholder="e.g. Binary Trees" className="input" />
              </div>
            </div>
            <button onClick={loadStudents} disabled={studentsLoading} className="btn-primary flex items-center gap-2">
              {studentsLoading ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
              {studentsLoading ? 'Loading Students...' : 'Load Students'}
            </button>
          </div>

          {/* Attendance Sheet */}
          {attendance.length > 0 && (
            <div className="card overflow-hidden">
              {/* Stats bar */}
              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total: <strong className="text-gray-900 dark:text-white">{attendance.length}</strong></span>
                  <span className="text-green-600 dark:text-green-400">Present: <strong>{presentCount}</strong></span>
                  <span className="text-red-500">Absent: <strong>{absentCount}</strong></span>
                  <span className="text-blue-500">Rate: <strong>{Math.round((presentCount / attendance.length) * 100)}%</strong></span>
                </div>
                {/* Mark all buttons */}
                <div className="flex gap-2">
                  <button onClick={() => setAllStatus('present')} className="btn-success btn-sm text-xs">All Present</button>
                  <button onClick={() => setAllStatus('absent')} className="btn-danger btn-sm text-xs">All Absent</button>
                </div>
              </div>

              {/* Student List */}
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {attendance.map((student, idx) => {
                  const statusConf = STATUS_OPTIONS.find(s => s.value === student.status);
                  return (
                    <div key={student.studentId} className={clsx(
                      'flex items-center gap-3 px-5 py-3 transition-colors',
                      student.status === 'present' ? 'bg-green-50/50 dark:bg-green-900/5' :
                      student.status === 'absent' ? 'bg-red-50/50 dark:bg-red-900/5' : ''
                    )}>
                      {/* Index */}
                      <span className="text-xs text-gray-400 w-6 flex-shrink-0">{idx + 1}</span>

                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {student.name[0]?.toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                        {student.rollNumber && <p className="text-xs text-gray-400">{student.rollNumber}</p>}
                      </div>

                      {/* Status Buttons */}
                      <div className="flex gap-1.5">
                        {STATUS_OPTIONS.map(opt => (
                          <button key={opt.value} onClick={() => setStudentStatus(student.studentId, opt.value)}
                            title={opt.fullLabel}
                            className={clsx(
                              'w-8 h-8 rounded-lg text-xs font-bold transition-all',
                              student.status === opt.value
                                ? `${opt.color} ring-2 ${opt.ring} scale-110`
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                            )}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save Button */}
              <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  📊 {presentCount}/{attendance.length} students present ({Math.round((presentCount / attendance.length) * 100)}%)
                </div>
                <button onClick={submitAttendance} disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── History Tab ────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="card empty-state py-16">
              <Calendar size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
              <p className="text-gray-500 font-medium">No attendance sessions yet</p>
              <p className="text-sm text-gray-400 mt-1">Mark attendance to see history here</p>
            </div>
          ) : sessions.map(session => (
            <div key={session._id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{session.subject}</h3>
                    {session.subjectCode && <span className="badge-gray text-xs">{session.subjectCode}</span>}
                    <span className="badge-blue capitalize text-xs">{session.lectureType}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {session.course?.name} • Sem {session.semester} • Div {session.division}
                  </p>
                  {session.topic && <p className="text-xs text-gray-400 mt-0.5">Topic: {session.topic}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {session.presentCount}/{session.totalStudents} present
                  </p>
                </div>
              </div>
              {/* Mini progress */}
              <div className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  style={{ width: `${session.totalStudents ? (session.presentCount / session.totalStudents) * 100 : 0}%` }} />
              </div>
              <div className="flex gap-3 mt-2 text-xs text-gray-400">
                <span className="text-green-500">✓ {session.presentCount} present</span>
                <span className="text-red-400">✗ {session.absentCount} absent</span>
                <span>{Math.round(session.totalStudents ? (session.presentCount / session.totalStudents) * 100 : 0)}% attendance</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Report Tab ─────────────────────────────────────── */}
      {activeTab === 'report' && (
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Generate Subject Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="input-label">Course</label>
                <select value={reportFilter.courseId} onChange={e => setReportFilter(f => ({ ...f, courseId: e.target.value }))} className="input">
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.shortName} - {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Subject Name</label>
                <input value={reportFilter.subject} onChange={e => setReportFilter(f => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. Data Structures" className="input" />
              </div>
              <div>
                <label className="input-label">Semester</label>
                <select value={reportFilter.semester} onChange={e => setReportFilter(f => ({ ...f, semester: Number(e.target.value) }))} className="input">
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            </div>
            <button onClick={loadReport} disabled={reportLoading} className="btn-primary flex items-center gap-2">
              {reportLoading ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
              Generate Report
            </button>
          </div>

          {report.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {reportFilter.subject} — Attendance Report
                </h3>
                <div className="flex gap-2 text-xs">
                  <span className="badge-red">{report.filter(r => r.hasShortage).length} shortage</span>
                  <span className="badge-green">{report.filter(r => !r.hasShortage).length} safe</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Student</th>
                      <th className="px-4 py-3 text-center">Total</th>
                      <th className="px-4 py-3 text-center">Present</th>
                      <th className="px-4 py-3 text-center">Absent</th>
                      <th className="px-4 py-3 text-center">%</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {report.map((r, i) => (
                      <tr key={r._id} className={clsx('transition-colors',
                        r.status === 'critical' ? 'bg-red-50/50 dark:bg-red-900/5' :
                        r.status === 'warning' ? 'bg-yellow-50/50 dark:bg-yellow-900/5' : ''
                      )}>
                        <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                              {r.student?.name?.[0]?.toUpperCase() || 'S'}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{r.student?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm">{r.totalClasses}</td>
                        <td className="px-4 py-3 text-center text-sm text-green-600 dark:text-green-400 font-medium">{r.presentClasses}</td>
                        <td className="px-4 py-3 text-center text-sm text-red-500 font-medium">{r.absentClasses}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={clsx('font-bold text-sm',
                            r.attendancePercentage >= 75 ? 'text-green-600 dark:text-green-400' :
                            r.attendancePercentage >= 60 ? 'text-yellow-600' : 'text-red-600 dark:text-red-400'
                          )}>{r.attendancePercentage}%</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={clsx('badge text-xs',
                            r.status === 'good' ? 'badge-green' :
                            r.status === 'warning' ? 'badge-yellow' : 'badge-red'
                          )}>
                            {r.status === 'good' ? '✓ Safe' : r.status === 'warning' ? '⚠ Warning' : '✗ Shortage'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Summary */}
              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
                Class average: <strong className="text-gray-900 dark:text-white">
                  {Math.round(report.reduce((a, r) => a + r.attendancePercentage, 0) / report.length)}%
                </strong> •
                Students with shortage: <strong className="text-red-500">{report.filter(r => r.hasShortage).length}</strong>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;
