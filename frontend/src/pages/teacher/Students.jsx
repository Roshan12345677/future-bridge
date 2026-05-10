// Teacher Students Page
import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../utils/api';
import { Users, Search, BookOpen, TrendingUp, Mail } from 'lucide-react';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const TeacherStudents = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    coursesAPI.getMyCourses()
      .then(d => setCourses(d.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allStudents = courses.flatMap(c =>
    (c.enrolledStudents || []).map(s => ({ ...s, courseName: c.title, courseId: c._id }))
  );

  const uniqueStudents = Array.from(
    allStudents.reduce((map, s) => {
      if (!map.has(s._id)) map.set(s._id, { ...s, courses: [s.courseName] });
      else map.get(s._id).courses.push(s.courseName);
      return map;
    }, new Map()).values()
  );

  const filtered = uniqueStudents.filter(s => {
    const matchSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase());
    const matchCourse = selectedCourse === 'all' || s.courses?.some(c => c === courses.find(co => co._id === selectedCourse)?.title);
    return matchSearch && matchCourse;
  });

  if (loading) return <LoadingSpinner text="Loading students..." />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">My Students</h1>
        <p className="page-subtitle">{uniqueStudents.length} students enrolled across {courses.length} courses</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Students', value: uniqueStudents.length, icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Active Courses', value: courses.filter(c => c.isPublished).length, icon: BookOpen, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Avg. per Course', value: courses.length ? Math.round(uniqueStudents.length / courses.length) : 0, icon: TrendingUp, color: 'text-violet-500 bg-violet-50 dark:bg-violet-900/20' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.split(' ').slice(1).join(' ')}`}>
              <Icon size={18} className={color.split(' ')[0]} />
            </div>
            <div><p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
          </div>
        ))}
      </div>

      <div className="card p-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="input pl-9" />
        </div>
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="input w-48">
          <option value="all">All Courses</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state py-16">
          <Users size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
          <p className="text-gray-500">{uniqueStudents.length === 0 ? 'No students enrolled yet' : 'No students match your search'}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-left">Enrolled In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {filtered.map(student => (
                  <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {student.name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <span className="font-medium text-sm text-gray-900 dark:text-white">{student.name || 'Student'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-500 flex items-center gap-1"><Mail size={12} />{student.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {student.courses?.map(c => <span key={c} className="badge-blue text-xs truncate max-w-[140px]">{c}</span>)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;
