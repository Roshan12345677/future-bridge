import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../../utils/api';
import { BookOpen, Search, Star, Clock, Users, Filter, ChevronDown, Play, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const CATEGORIES = ['all', 'academic', 'competitive', 'placement', 'dsa', 'development', 'other'];
const LEVELS = ['all', 'beginner', 'intermediate', 'advanced'];

const categoryGradients = {
  academic: 'from-blue-500 to-cyan-500',
  competitive: 'from-violet-500 to-purple-600',
  placement: 'from-emerald-500 to-teal-600',
  dsa: 'from-orange-500 to-red-500',
  development: 'from-pink-500 to-rose-600',
  other: 'from-gray-500 to-gray-600',
};

const levelConfig = {
  beginner: { class: 'badge-green', label: 'Beginner' },
  intermediate: { class: 'badge-yellow', label: 'Intermediate' },
  advanced: { class: 'badge-red', label: 'Advanced' },
};

const CourseCard = ({ course, onEnroll, enrolling }) => {
  const gradient = categoryGradients[course.category] || categoryGradients.other;

  return (
    <div className="card-hover overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div className={`h-40 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
        <BookOpen size={40} className="text-white/40" />
        <div className="absolute top-3 left-3">
          <span className="badge bg-white/20 text-white capitalize backdrop-blur-sm">{course.category}</span>
        </div>
        {course.price === 0 && (
          <div className="absolute top-3 right-3">
            <span className="badge bg-green-500 text-white">Free</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className={clsx('badge', levelConfig[course.level]?.class)}>{levelConfig[course.level]?.label}</span>
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">{course.title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{course.description}</p>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
            {course.instructor?.name?.[0] || 'T'}
          </div>
          <span className="text-xs text-gray-500">{course.instructor?.name || 'Instructor'}</span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1"><Star size={11} className="text-amber-400 fill-amber-400" />{course.rating?.toFixed(1) || '4.8'}</span>
          <span className="flex items-center gap-1"><Clock size={11} />{course.duration}h</span>
          <span className="flex items-center gap-1"><Users size={11} />{course.enrollmentCount || 0}</span>
        </div>

        <div className="mt-auto flex gap-2">
          <Link to={`/student/courses/${course._id}`} className="btn-outline btn-sm flex-1 text-center text-xs">View Details</Link>
          <button
            onClick={() => onEnroll(course._id)}
            disabled={enrolling === course._id}
            className="btn-primary btn-sm flex-1 text-xs flex items-center justify-center gap-1"
          >
            <Play size={11} className="fill-current" />
            Enroll
          </button>
        </div>
      </div>
    </div>
  );
};

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: 'all', level: 'all', search: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [enrolling, setEnrolling] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.level !== 'all') params.level = filters.level;
      if (filters.search) params.search = filters.search;
      const data = await coursesAPI.getAll(params);
      setCourses(data.courses || []);
      setTotalPages(data.pages || 1);
    } catch (e) { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);
  useEffect(() => { setPage(1); }, [filters]);

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      await coursesAPI.enroll(courseId);
      toast.success('Successfully enrolled! 🎉');
    } catch (e) { toast.error(e.message || 'Could not enroll'); }
    finally { setEnrolling(null); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Course Library</h1>
        <p className="page-subtitle">Explore academic, competitive, and placement courses</p>
      </div>

      {/* Search & Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} placeholder="Search courses..." className="input pl-9" />
          </div>
          <button onClick={() => setShowFilters(s => !s)} className="btn-outline flex items-center gap-2">
            <Filter size={16} /> Filters <ChevronDown size={14} className={clsx('transition-transform', showFilters && 'rotate-180')} />
          </button>
        </div>
        {showFilters && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-3 animate-slide-up">
            <div>
              <label className="input-label">Category</label>
              <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} className="input capitalize">
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c === 'all' ? 'All Categories' : c}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Level</label>
              <select value={filters.level} onChange={e => setFilters({ ...filters, level: e.target.value })} className="input capitalize">
                {LEVELS.map(l => <option key={l} value={l} className="capitalize">{l === 'all' ? 'All Levels' : l}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Category Quick Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilters({ ...filters, category: cat })}
            className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap capitalize transition-colors',
              filters.category === cat ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800'
            )}>
            {cat === 'all' ? '🎯 All' : cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? <LoadingSpinner text="Loading courses..." /> : courses.length === 0 ? (
        <div className="card empty-state py-20">
          <BookOpen size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 font-medium">No courses found</p>
          <p className="text-sm text-gray-400 mt-1">Try different filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map(course => (
            <CourseCard key={course._id} course={course} onEnroll={handleEnroll} enrolling={enrolling} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline btn-sm">Previous</button>
          <span className="btn-secondary btn-sm cursor-default">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-outline btn-sm">Next</button>
        </div>
      )}
    </div>
  );
};

export default Courses;
