// Admin Courses - reuses teacher view with admin powers
import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../utils/api';
import { BookOpen, Eye, EyeOff, Trash2, Users, Star, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import clsx from 'clsx';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesAPI.getAll({ limit: 50 })
      .then(d => setCourses(d.courses || []))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  const togglePublish = async (course) => {
    try {
      await coursesAPI.update(course._id, { isPublished: !course.isPublished });
      setCourses(prev => prev.map(c => c._id === course._id ? { ...c, isPublished: !c.isPublished } : c));
      toast.success(course.isPublished ? 'Course unpublished' : 'Course published!');
    } catch (e) { toast.error('Failed'); }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await coursesAPI.delete(id);
      setCourses(prev => prev.filter(c => c._id !== id));
      toast.success('Course deleted');
    } catch (e) { toast.error(e.message || 'Failed'); }
  };

  if (loading) return <LoadingSpinner text="Loading courses..." />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Course Management</h1>
        <p className="page-subtitle">{courses.length} total courses on the platform</p>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Course</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Instructor</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Students</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {courses.map(course => (
                <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <BookOpen size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{course.title}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Star size={10} className="text-amber-400 fill-amber-400" />{course.rating?.toFixed(1) || '4.8'} • <Clock size={10} />{course.duration}h</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-500">{course.instructor?.name || 'N/A'}</td>
                  <td className="px-4 py-3"><span className="badge-blue capitalize text-xs">{course.category}</span></td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400"><Users size={12} />{course.enrollmentCount || 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('badge text-xs', course.isPublished ? 'badge-green' : 'badge-gray')}>{course.isPublished ? 'Published' : 'Draft'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => togglePublish(course)} className="btn-icon w-8 h-8 text-gray-400 hover:text-blue-500" title={course.isPublished ? 'Unpublish' : 'Publish'}>
                        {course.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => deleteCourse(course._id)} className="btn-icon w-8 h-8 text-gray-400 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {courses.length === 0 && <div className="empty-state py-12"><BookOpen size={32} className="text-gray-200 dark:text-gray-700 mb-2" /><p className="text-sm text-gray-500">No courses found</p></div>}
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;
