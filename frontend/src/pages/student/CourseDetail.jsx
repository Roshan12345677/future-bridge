import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../utils/api';
import { BookOpen, Clock, Users, Star, Play, CheckCircle, ChevronDown, ChevronUp, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await coursesAPI.getOne(id);
        setCourse(data.course);
      } catch (e) {
        toast.error('Course not found');
        navigate('/student/courses');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await coursesAPI.enroll(id);
      toast.success('Successfully enrolled! 🎉');
      const data = await coursesAPI.getOne(id);
      setCourse(data.course);
    } catch (e) {
      toast.error(e.message || 'Could not enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!course) return null;

  const categoryGradients = {
    academic: 'from-blue-500 to-cyan-500',
    competitive: 'from-violet-500 to-purple-600',
    placement: 'from-emerald-500 to-teal-600',
    dsa: 'from-orange-500 to-red-500',
    development: 'from-pink-500 to-rose-600',
    other: 'from-gray-500 to-gray-600',
  };
  const gradient = categoryGradients[course.category] || categoryGradients.other;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
        <ArrowLeft size={16} /> Back to Courses
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Hero */}
          <div className={`h-56 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="text-center text-white z-10">
              <BookOpen size={48} className="mx-auto mb-3 opacity-80" />
              <span className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full capitalize">{course.category} Course</span>
            </div>
          </div>

          {/* Title & Meta */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge-blue capitalize">{course.category}</span>
              <span className="badge-gray capitalize">{course.level}</span>
              {course.price === 0 && <span className="badge-green">Free</span>}
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">{course.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{course.description}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Star, value: course.rating?.toFixed(1) || '4.8', label: 'Rating', color: 'text-amber-500' },
              { icon: Clock, value: `${course.duration}h`, label: 'Duration', color: 'text-blue-500' },
              { icon: Users, value: course.enrollmentCount || 0, label: 'Students', color: 'text-violet-500' },
              { icon: Play, value: course.lessons?.length || 0, label: 'Lessons', color: 'text-emerald-500' },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="card p-3 text-center">
                <Icon size={18} className={`${color} mx-auto mb-1`} />
                <p className="font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          {course.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {course.tags.map(tag => (
                <span key={tag} className="badge-gray">{tag}</span>
              ))}
            </div>
          )}

          {/* Curriculum */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">Course Curriculum</h2>
              <p className="text-sm text-gray-500 mt-1">{course.lessons?.length || 0} lessons • {course.duration} hours total</p>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {course.lessons?.length > 0 ? course.lessons.sort((a, b) => a.order - b.order).map((lesson, i) => (
                <div key={lesson._id || i}>
                  <button
                    onClick={() => setExpandedLesson(expandedLesson === i ? -1 : i)}
                    className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{lesson.title}</p>
                      {lesson.duration && <p className="text-xs text-gray-400 mt-0.5">{lesson.duration} min</p>}
                    </div>
                    {lesson.isPreview ? <span className="badge-blue text-xs">Preview</span> : <span className="badge-gray text-xs flex items-center gap-1"><span>🔒</span> Enrolled</span>}
                    {expandedLesson === i ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                  </button>
                  {expandedLesson === i && lesson.description && (
                    <div className="px-5 pb-4 ml-10 animate-slide-up">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{lesson.description}</p>
                    </div>
                  )}
                </div>
              )) : (
                <div className="p-8 text-center text-gray-400 text-sm">Curriculum coming soon...</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Enroll Card */}
          <div className="card p-5 sticky top-20">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {course.price === 0 ? 'Free' : `₹${course.price}`}
            </div>
            {course.price > 0 && <p className="text-sm text-gray-500 mb-4">One-time payment</p>}

            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
            >
              {enrolling ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} className="fill-current" />}
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {[
                `${course.duration} hours of content`,
                `${course.lessons?.length || 0} lessons`,
                'Lifetime access',
                'Certificate on completion',
                'AI-powered learning',
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructor */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Instructor</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                {course.instructor?.name?.[0] || 'T'}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{course.instructor?.name || 'Instructor'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{course.instructor?.bio || 'Expert Educator'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
