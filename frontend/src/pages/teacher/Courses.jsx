import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../utils/api';
import { Plus, BookOpen, Users, Eye, EyeOff, Edit2, Trash2, Star, Clock, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/shared/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import clsx from 'clsx';

const emptyForm = { title: '', description: '', category: 'academic', level: 'beginner', tags: '', duration: '', price: 0, isPublished: false };

const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [lessonModal, setLessonModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', duration: 30, order: 1, isPreview: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await coursesAPI.getMyCourses();
      setCourses(data.courses || []);
    } catch (e) { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setForm(emptyForm); setEditCourse(null); setModalOpen(true); };
  const openEdit = (course) => {
    setForm({ title: course.title, description: course.description, category: course.category, level: course.level, tags: course.tags?.join(', ') || '', duration: course.duration || '', price: course.price || 0, isPublished: course.isPublished });
    setEditCourse(course);
    setModalOpen(true);
  };

  const saveCourse = async () => {
    if (!form.title || !form.description) return toast.error('Title and description required');
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [], duration: Number(form.duration) || 0 };
      if (editCourse) {
        await coursesAPI.update(editCourse._id, payload);
        toast.success('Course updated!');
      } else {
        await coursesAPI.create(payload);
        toast.success('Course created!');
      }
      setModalOpen(false);
      loadCourses();
    } catch (e) { toast.error(e.message || 'Failed to save course'); }
    finally { setSaving(false); }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course? This action cannot be undone.')) return;
    try {
      await coursesAPI.delete(id);
      toast.success('Course deleted');
      setCourses(prev => prev.filter(c => c._id !== id));
    } catch (e) { toast.error(e.message || 'Failed to delete'); }
  };

  const togglePublish = async (course) => {
    try {
      await coursesAPI.update(course._id, { isPublished: !course.isPublished });
      setCourses(prev => prev.map(c => c._id === course._id ? { ...c, isPublished: !c.isPublished } : c));
      toast.success(course.isPublished ? 'Course unpublished' : 'Course published! 🎉');
    } catch (e) { toast.error('Failed to update'); }
  };

  const addLesson = async () => {
    if (!lessonForm.title || !selectedCourse) return toast.error('Lesson title required');
    setSaving(true);
    try {
      await coursesAPI.addLesson(selectedCourse._id, lessonForm);
      toast.success('Lesson added!');
      setLessonModal(false);
      setLessonForm({ title: '', description: '', duration: 30, order: 1, isPreview: false });
      loadCourses();
    } catch (e) { toast.error('Failed to add lesson'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Courses</h1>
          <p className="page-subtitle">Create and manage your course content</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Create Course
        </button>
      </div>

      {loading ? <LoadingSpinner text="Loading courses..." /> : courses.length === 0 ? (
        <div className="card empty-state py-20">
          <BookOpen size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 font-medium">No courses yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first course to get started</p>
          <button onClick={openCreate} className="btn-primary btn-sm mt-4 flex items-center gap-1">
            <Plus size={14} /> Create Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map(course => (
            <div key={course._id} className="card overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center relative">
                <BookOpen size={32} className="text-white/40" />
                <div className="absolute top-3 right-3 flex gap-1">
                  <span className={clsx('badge text-xs', course.isPublished ? 'bg-green-500/90 text-white' : 'bg-gray-500/70 text-white')}>
                    {course.isPublished ? '✅ Live' : '⏳ Draft'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-2">
                  <span className="badge-blue capitalize text-xs">{course.category}</span>
                  <span className="badge-gray capitalize text-xs">{course.level}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">{course.title}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><Users size={11} />{course.enrolledStudents?.length || 0} students</span>
                  <span className="flex items-center gap-1"><BookOpen size={11} />{course.lessons?.length || 0} lessons</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{course.duration}h</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <button onClick={() => openEdit(course)} className="btn-outline btn-sm text-xs flex items-center gap-1">
                    <Edit2 size={11} /> Edit
                  </button>
                  <button onClick={() => { setSelectedCourse(course); setLessonForm(f => ({ ...f, order: (course.lessons?.length || 0) + 1 })); setLessonModal(true); }} className="btn-secondary btn-sm text-xs flex items-center gap-1">
                    <Plus size={11} /> Lesson
                  </button>
                  <button onClick={() => togglePublish(course)} className={clsx('btn-sm text-xs flex items-center gap-1', course.isPublished ? 'btn-secondary' : 'btn-success')}>
                    {course.isPublished ? <><EyeOff size={11} /> Unpublish</> : <><Eye size={11} /> Publish</>}
                  </button>
                  <button onClick={() => deleteCourse(course._id)} className="btn-icon text-red-400 hover:text-red-500 w-8 h-8">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCourse ? 'Edit Course' : 'Create New Course'} size="lg"
        footer={<div className="flex justify-end gap-2"><button onClick={() => setModalOpen(false)} className="btn-secondary btn-sm">Cancel</button><button onClick={saveCourse} disabled={saving} className="btn-primary btn-sm flex items-center gap-1.5">{saving && <Loader2 size={13} className="animate-spin" />}{editCourse ? 'Update' : 'Create'} Course</button></div>}
      >
        <div className="space-y-4">
          <div><label className="input-label">Course Title *</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Complete DSA Course" className="input" /></div>
          <div><label className="input-label">Description *</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} placeholder="Describe what students will learn..." className="input resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="input-label">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input capitalize">
                {['academic', 'competitive', 'placement', 'dsa', 'development', 'other'].map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div><label className="input-label">Level</label>
              <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className="input capitalize">
                {['beginner', 'intermediate', 'advanced'].map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="input-label">Duration (hours)</label><input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="40" className="input" min="0" /></div>
            <div><label className="input-label">Price (₹, 0 = Free)</label><input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" className="input" min="0" /></div>
          </div>
          <div><label className="input-label">Tags (comma separated)</label><input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="React, Node.js, MongoDB" className="input" /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Publish immediately</span>
          </label>
        </div>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal isOpen={lessonModal} onClose={() => setLessonModal(false)} title={`Add Lesson to "${selectedCourse?.title}"`} size="md"
        footer={<div className="flex justify-end gap-2"><button onClick={() => setLessonModal(false)} className="btn-secondary btn-sm">Cancel</button><button onClick={addLesson} disabled={saving} className="btn-primary btn-sm flex items-center gap-1.5">{saving && <Loader2 size={13} className="animate-spin" />}Add Lesson</button></div>}
      >
        <div className="space-y-4">
          <div><label className="input-label">Lesson Title *</label><input value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Introduction to Arrays" className="input" autoFocus /></div>
          <div><label className="input-label">Description</label><textarea value={lessonForm.description} onChange={e => setLessonForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="What will students learn in this lesson?" className="input resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="input-label">Duration (minutes)</label><input type="number" value={lessonForm.duration} onChange={e => setLessonForm(f => ({ ...f, duration: Number(e.target.value) }))} className="input" min="1" /></div>
            <div><label className="input-label">Order</label><input type="number" value={lessonForm.order} onChange={e => setLessonForm(f => ({ ...f, order: Number(e.target.value) }))} className="input" min="1" /></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={lessonForm.isPreview} onChange={e => setLessonForm(f => ({ ...f, isPreview: e.target.checked }))} className="w-4 h-4 rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Make available as free preview</span>
          </label>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherCourses;
