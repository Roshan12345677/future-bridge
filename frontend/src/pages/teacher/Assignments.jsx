// Teacher Assignments Page
import React, { useState, useEffect } from 'react';
import { assignmentsAPI, coursesAPI } from '../../utils/api';
import { Plus, ClipboardList, Clock, Users, CheckCircle, Loader2, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/shared/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [gradeModal, setGradeModal] = useState({ open: false, assignment: null, submission: null });
  const [form, setForm] = useState({ title: '', description: '', course: '', dueDate: '', maxScore: 100 });
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [aRes, cRes] = await Promise.all([assignmentsAPI.getAll(), coursesAPI.getMyCourses()]);
      setAssignments(aRes.assignments || []);
      setCourses(cRes.courses || []);
    } catch (e) { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const createAssignment = async () => {
    if (!form.title || !form.dueDate) return toast.error('Title and due date required');
    setSaving(true);
    try {
      await assignmentsAPI.create({ ...form, maxScore: Number(form.maxScore) });
      toast.success('Assignment created!');
      setModalOpen(false);
      setForm({ title: '', description: '', course: '', dueDate: '', maxScore: 100 });
      load();
    } catch (e) { toast.error('Failed to create'); }
    finally { setSaving(false); }
  };

  const submitGrade = async () => {
    const { assignment, submission } = gradeModal;
    if (!gradeForm.score) return toast.error('Score required');
    setSaving(true);
    try {
      await assignmentsAPI.grade(assignment._id, submission._id, { score: Number(gradeForm.score), feedback: gradeForm.feedback });
      toast.success('Assignment graded!');
      setGradeModal({ open: false, assignment: null, submission: null });
      setGradeForm({ score: '', feedback: '' });
      load();
    } catch (e) { toast.error('Failed to grade'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner text="Loading assignments..." />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-subtitle">Create assignments and review student submissions</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Assignment
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="card empty-state py-20">
          <ClipboardList size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 font-medium">No assignments yet</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary btn-sm mt-4">
            <Plus size={14} className="mr-1" /> Create Assignment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map(asgn => {
            const pending = asgn.submissions?.filter(s => s.status === 'pending').length || 0;
            const graded = asgn.submissions?.filter(s => s.status === 'graded').length || 0;
            const total = asgn.submissions?.length || 0;
            const isOverdue = new Date(asgn.dueDate) < new Date();
            return (
              <div key={asgn._id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{asgn.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{asgn.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge text-xs ${isOverdue ? 'badge-red' : 'badge-blue'}`}>
                      <Clock size={10} className="mr-1" />
                      {isOverdue ? 'Overdue' : `Due ${new Date(asgn.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                    </span>
                    <span className="badge-gray">Max: {asgn.maxScore} pts</span>
                  </div>
                </div>
                <div className="flex gap-3 mb-4">
                  <span className="badge-blue">{total} submissions</span>
                  {pending > 0 && <span className="badge-yellow">{pending} pending review</span>}
                  {graded > 0 && <span className="badge-green">{graded} graded</span>}
                </div>
                {/* Submissions list */}
                {asgn.submissions?.length > 0 && (
                  <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Submissions</p>
                    {asgn.submissions.slice(0, 3).map(sub => (
                      <div key={sub._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                            {sub.student?.name?.[0] || 'S'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{sub.student?.name || 'Student'}</p>
                            <p className="text-xs text-gray-400">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {sub.status === 'graded' ? (
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{sub.score}/{asgn.maxScore}</span>
                          ) : (
                            <button onClick={() => { setGradeModal({ open: true, assignment: asgn, submission: sub }); setGradeForm({ score: '', feedback: '' }); }} className="btn-primary btn-sm text-xs flex items-center gap-1">
                              <Award size={12} /> Grade
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {asgn.submissions.length > 3 && <p className="text-xs text-gray-400 text-center">+{asgn.submissions.length - 3} more submissions</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Assignment" size="md"
        footer={<div className="flex justify-end gap-2"><button onClick={() => setModalOpen(false)} className="btn-secondary btn-sm">Cancel</button><button onClick={createAssignment} disabled={saving} className="btn-primary btn-sm flex items-center gap-1.5">{saving && <Loader2 size={13} className="animate-spin" />}Create</button></div>}
      >
        <div className="space-y-4">
          <div><label className="input-label">Title *</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Assignment title" className="input" autoFocus /></div>
          <div><label className="input-label">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Assignment instructions..." className="input resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="input-label">Related Course</label>
              <select value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} className="input">
                <option value="">No specific course</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
            <div><label className="input-label">Max Score</label><input type="number" value={form.maxScore} onChange={e => setForm(f => ({ ...f, maxScore: e.target.value }))} className="input" min="1" /></div>
          </div>
          <div><label className="input-label">Due Date *</label><input type="datetime-local" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="input" /></div>
        </div>
      </Modal>

      {/* Grade Modal */}
      <Modal isOpen={gradeModal.open} onClose={() => setGradeModal({ open: false, assignment: null, submission: null })} title="Grade Submission" size="sm"
        footer={<div className="flex justify-end gap-2"><button onClick={() => setGradeModal({ open: false, assignment: null, submission: null })} className="btn-secondary btn-sm">Cancel</button><button onClick={submitGrade} disabled={saving} className="btn-primary btn-sm flex items-center gap-1.5">{saving && <Loader2 size={13} className="animate-spin" />}Submit Grade</button></div>}
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm">
            <p className="font-medium text-blue-700 dark:text-blue-400">{gradeModal.assignment?.title}</p>
            <p className="text-blue-500 text-xs mt-0.5">Max Score: {gradeModal.assignment?.maxScore} points</p>
          </div>
          <div><label className="input-label">Score *</label><input type="number" value={gradeForm.score} onChange={e => setGradeForm(f => ({ ...f, score: e.target.value }))} placeholder={`0 - ${gradeModal.assignment?.maxScore}`} min="0" max={gradeModal.assignment?.maxScore} className="input" autoFocus /></div>
          <div><label className="input-label">Feedback</label><textarea value={gradeForm.feedback} onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))} rows={4} placeholder="Provide constructive feedback to the student..." className="input resize-none" /></div>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherAssignments;
