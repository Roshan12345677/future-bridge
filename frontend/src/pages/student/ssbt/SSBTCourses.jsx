import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ssbtAPI } from '../../../utils/api';
import { BookOpen, Users, Clock, ChevronRight, GraduationCap, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import clsx from 'clsx';

const SSBTCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [enrollModal, setEnrollModal] = useState({ open: false, course: null });
  const [enrollForm, setEnrollForm] = useState({ currentSemester: 1, rollNumber: '', division: 'A', batch: '2021-2025' });

  useEffect(() => {
    ssbtAPI.getCourses()
      .then(d => setCourses(d.courses || []))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  const handleEnroll = async () => {
    if (!enrollModal.course) return;
    setEnrollingId(enrollModal.course._id);
    try {
      await ssbtAPI.enrollStudent(enrollModal.course._id, enrollForm);
      toast.success('Enrolled successfully! 🎉');
      setEnrollModal({ open: false, course: null });
    } catch (e) {
      toast.error(e.message || 'Enrollment failed');
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading SSBT courses..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap size={22} className="text-cyan-200" />
            <span className="text-cyan-100 font-medium text-sm">SSBT College of Engineering & Technology</span>
          </div>
          <h1 className="text-3xl font-display font-bold">SSBT Academic Courses</h1>
          <p className="text-blue-100 mt-1">Engineering courses with notes, video lectures, syllabus & previous papers</p>
          <div className="flex gap-4 mt-4 text-sm">
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">📚 {courses.length} Programs</span>
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">🎓 4 Years / 8 Semesters</span>
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">✅ University Affiliated</span>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {courses.map(course => (
          <div key={course._id} className="card-hover overflow-hidden">
            {/* Color Banner */}
            <div className={`h-24 bg-gradient-to-br ${course.color || 'from-blue-500 to-violet-600'} flex items-center justify-between px-6`}>
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">B.E. Program</p>
                <h3 className="text-white font-bold text-xl">{course.shortName}</h3>
              </div>
              <span className="text-5xl">{course.icon}</span>
            </div>

            <div className="p-5">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">{course.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">{course.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{course.duration}</p>
                  <p className="text-xs text-gray-500">Years</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{course.totalSemesters}</p>
                  <p className="text-xs text-gray-500">Semesters</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {course.semesters?.reduce((a, s) => a + (s.subjects?.length || 0), 0) || 0}
                  </p>
                  <p className="text-xs text-gray-500">Subjects</p>
                </div>
              </div>

              {/* Semester pills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {Array.from({ length: course.totalSemesters }, (_, i) => i + 1).map(sem => (
                  <span key={sem} className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',
                    sem <= 2 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    sem <= 4 ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' :
                    sem <= 6 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  )}>
                    Sem {sem}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/student/ssbt/${course._id}`}
                  className="btn-primary flex-1 text-center text-sm flex items-center justify-center gap-1.5"
                >
                  <BookOpen size={15} /> View Course
                </Link>
                <button
                  onClick={() => setEnrollModal({ open: true, course })}
                  className="btn-outline text-sm px-4"
                >
                  Enroll
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="card empty-state py-20">
          <GraduationCap size={48} className="text-gray-200 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 font-medium">No SSBT courses available yet</p>
          <p className="text-sm text-gray-400 mt-1">Run the SSBT seeder to populate courses</p>
        </div>
      )}

      {/* Enroll Modal */}
      {enrollModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEnrollModal({ open: false, course: null })}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Enroll in {enrollModal.course?.name}</h3>
            <div className="space-y-3">
              <div>
                <label className="input-label">Current Semester</label>
                <select value={enrollForm.currentSemester} onChange={e => setEnrollForm(f => ({ ...f, currentSemester: Number(e.target.value) }))} className="input">
                  {Array.from({ length: enrollModal.course?.totalSemesters || 8 }, (_, i) => i + 1).map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Roll Number</label>
                <input value={enrollForm.rollNumber} onChange={e => setEnrollForm(f => ({ ...f, rollNumber: e.target.value }))} placeholder="e.g. CE2101" className="input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Division</label>
                  <select value={enrollForm.division} onChange={e => setEnrollForm(f => ({ ...f, division: e.target.value }))} className="input">
                    {['A', 'B', 'C', 'D'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Batch</label>
                  <input value={enrollForm.batch} onChange={e => setEnrollForm(f => ({ ...f, batch: e.target.value }))} placeholder="2021-2025" className="input" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEnrollModal({ open: false, course: null })} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleEnroll} disabled={!!enrollingId} className="btn-primary flex-1 flex items-center justify-center gap-1.5">
                {enrollingId ? <Loader2 size={15} className="animate-spin" /> : <GraduationCap size={15} />}
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SSBTCourses;
