import React, { useState, useEffect, useCallback } from 'react';
import { jobsAPI } from '../../utils/api';
import { Briefcase, Plus, Trash2, Edit2, Users, ToggleLeft, ToggleRight, Loader2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/shared/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import clsx from 'clsx';

const emptyForm = { title: '', company: '', location: '', type: 'full-time', description: '', requirements: '', skills: '', salary: '', category: 'software', experienceLevel: 'entry', deadline: '' };

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await jobsAPI.getAll({ limit: 50 });
      setJobs(data.jobs || []);
    } catch (e) { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const openCreate = () => { setForm(emptyForm); setEditJob(null); setModalOpen(true); };
  const openEdit = (job) => {
    setForm({ title: job.title, company: job.company, location: job.location, type: job.type, description: job.description, requirements: job.requirements?.join('\n') || '', skills: job.skills?.join(', ') || '', salary: job.salary || '', category: job.category, experienceLevel: job.experienceLevel, deadline: job.deadline ? job.deadline.slice(0, 10) : '' });
    setEditJob(job);
    setModalOpen(true);
  };

  const saveJob = async () => {
    if (!form.title || !form.company || !form.description) return toast.error('Fill required fields');
    setSaving(true);
    try {
      const payload = { ...form, requirements: form.requirements ? form.requirements.split('\n').filter(Boolean) : [], skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [] };
      if (editJob) { await jobsAPI.update(editJob._id, payload); toast.success('Job updated!'); }
      else { await jobsAPI.create(payload); toast.success('Job posted!'); }
      setModalOpen(false);
      loadJobs();
    } catch (e) { toast.error(e.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const deleteJob = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    try { await jobsAPI.delete(id); setJobs(prev => prev.filter(j => j._id !== id)); toast.success('Job deleted'); }
    catch (e) { toast.error('Failed'); }
  };

  const toggleActive = async (job) => {
    try {
      await jobsAPI.update(job._id, { isActive: !job.isActive });
      setJobs(prev => prev.map(j => j._id === job._id ? { ...j, isActive: !j.isActive } : j));
      toast.success(job.isActive ? 'Job closed' : 'Job activated!');
    } catch (e) { toast.error('Failed'); }
  };

  const typeColors = { 'full-time': 'badge-blue', 'internship': 'badge-violet', 'contract': 'badge-yellow', 'remote': 'badge-cyan', 'part-time': 'badge-gray' };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Job Portal Management</h1>
          <p className="page-subtitle">{jobs.length} job postings managed</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={16} /> Post Job</button>
      </div>

      {loading ? <LoadingSpinner text="Loading jobs..." /> : jobs.length === 0 ? (
        <div className="card empty-state py-20">
          <Briefcase size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
          <p className="text-gray-500">No jobs posted yet</p>
          <button onClick={openCreate} className="btn-primary btn-sm mt-4 flex items-center gap-1"><Plus size={14} /> Post First Job</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map(job => (
            <div key={job._id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{job.company[0]}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{job.title}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} />{job.company} • {job.location}</p>
                  </div>
                </div>
                <span className={clsx('badge text-xs', job.isActive ? 'badge-green' : 'badge-red')}>{job.isActive ? 'Active' : 'Closed'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={clsx('badge text-xs capitalize', typeColors[job.type] || 'badge-gray')}>{job.type}</span>
                <span className="badge-gray capitalize text-xs">{job.category}</span>
                <span className="badge-gray capitalize text-xs">{job.experienceLevel}-level</span>
              </div>
              {job.salary && <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-3">💰 {job.salary}</p>}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-1"><Users size={11} />{job.applicants?.length || 0} applicants</span>
                <div className="flex gap-1">
                  <button onClick={() => toggleActive(job)} className="btn-icon w-8 h-8 text-gray-400 hover:text-blue-500" title={job.isActive ? 'Close' : 'Activate'}>
                    {job.isActive ? <ToggleRight size={16} className="text-green-500" /> : <ToggleLeft size={16} />}
                  </button>
                  <button onClick={() => openEdit(job)} className="btn-icon w-8 h-8 text-gray-400 hover:text-blue-500"><Edit2 size={14} /></button>
                  <button onClick={() => deleteJob(job._id)} className="btn-icon w-8 h-8 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editJob ? 'Edit Job' : 'Post New Job'} size="lg"
        footer={<div className="flex justify-end gap-2"><button onClick={() => setModalOpen(false)} className="btn-secondary btn-sm">Cancel</button><button onClick={saveJob} disabled={saving} className="btn-primary btn-sm flex items-center gap-1.5">{saving && <Loader2 size={13} className="animate-spin" />}{editJob ? 'Update' : 'Post'} Job</button></div>}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="input-label">Job Title *</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Software Engineer" className="input" /></div>
            <div><label className="input-label">Company *</label><input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Google" className="input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="input-label">Location *</label><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Bangalore, India" className="input" /></div>
            <div><label className="input-label">Salary</label><input value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} placeholder="18-24 LPA" className="input" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="input-label">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input capitalize">
                {['full-time', 'part-time', 'internship', 'contract', 'remote'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="input-label">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input capitalize">
                {['software', 'data', 'design', 'marketing', 'finance', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="input-label">Level</label>
              <select value={form.experienceLevel} onChange={e => setForm(f => ({ ...f, experienceLevel: e.target.value }))} className="input capitalize">
                {['entry', 'mid', 'senior', 'lead'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div><label className="input-label">Description *</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} placeholder="Job description and responsibilities..." className="input resize-none" /></div>
          <div><label className="input-label">Requirements (one per line)</label><textarea value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} rows={4} placeholder="B.Tech in CS&#10;2+ years experience&#10;Strong DSA skills" className="input resize-none font-mono text-sm" /></div>
          <div><label className="input-label">Required Skills (comma separated)</label><input value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} placeholder="Java, Spring Boot, MySQL, AWS" className="input" /></div>
          <div><label className="input-label">Application Deadline</label><input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="input" /></div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminJobs;
