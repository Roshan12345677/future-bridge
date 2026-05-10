import React, { useState, useEffect, useCallback } from 'react';
import { jobsAPI } from '../../utils/api';
import { Briefcase, MapPin, Clock, DollarSign, Search, Filter, ChevronDown, ExternalLink, Send, Building2, Users, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import Modal from '../../components/shared/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const typeConfig = {
  'full-time': { class: 'badge-blue', label: 'Full-time' },
  'part-time': { class: 'badge-gray', label: 'Part-time' },
  'internship': { class: 'badge-violet', label: 'Internship' },
  'contract': { class: 'badge-yellow', label: 'Contract' },
  'remote': { class: 'badge-cyan', label: 'Remote' },
};

const TYPES = ['all', 'full-time', 'internship', 'contract', 'remote'];
const CATEGORIES = ['all', 'software', 'data', 'design', 'marketing', 'finance', 'other'];

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyModal, setApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [filters, setFilters] = useState({ type: 'all', category: 'all', search: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [applyForm, setApplyForm] = useState({ coverLetter: '', resumeUrl: '' });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.search) params.search = filters.search;
      const data = await jobsAPI.getAll(params);
      setJobs(data.jobs || []);
    } catch (e) { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const openJob = (job) => setSelectedJob(job);

  const applyToJob = async () => {
    if (!selectedJob) return;
    setApplying(true);
    try {
      await jobsAPI.apply(selectedJob._id, applyForm);
      setAppliedJobs(prev => new Set([...prev, selectedJob._id]));
      setApplyModal(false);
      setApplyForm({ coverLetter: '', resumeUrl: '' });
      toast.success('Application submitted! 🎉 Good luck!');
    } catch (e) { toast.error(e.message || 'Failed to apply'); }
    finally { setApplying(false); }
  };

  const isApplied = (jobId) => appliedJobs.has(jobId);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">Jobs & Internships</h1>
        <p className="page-subtitle">Discover opportunities from top companies worldwide</p>
      </div>

      {/* Search & Filter */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} placeholder="Search jobs, companies, skills..." className="input pl-9" />
          </div>
          <button onClick={() => setShowFilters(s => !s)} className="btn-outline flex items-center gap-2 whitespace-nowrap">
            <Filter size={16} /> Filters <ChevronDown size={14} className={clsx('transition-transform', showFilters && 'rotate-180')} />
          </button>
        </div>
        {showFilters && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-slide-up">
            <div>
              <label className="input-label">Job Type</label>
              <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })} className="input capitalize">
                {TYPES.map(t => <option key={t} value={t} className="capitalize">{t === 'all' ? 'All Types' : t}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Category</label>
              <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} className="input capitalize">
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c === 'all' ? 'All Categories' : c}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Job Count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">{jobs.length} opportunities found</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Job List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? <LoadingSpinner text="Loading jobs..." /> : jobs.length === 0 ? (
            <div className="card empty-state">
              <Briefcase size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
              <p className="text-gray-500">No jobs found</p>
            </div>
          ) : jobs.map(job => (
            <button
              key={job._id}
              onClick={() => openJob(job)}
              className={clsx(
                'card-hover w-full text-left p-4 transition-all',
                selectedJob?._id === job._id && 'ring-2 ring-blue-500 border-blue-200 dark:border-blue-800'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {job.company[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{job.title}</h3>
                    {isApplied(job._id) && <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{job.company}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={clsx('badge', typeConfig[job.type]?.class)}>{typeConfig[job.type]?.label || job.type}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><MapPin size={10} />{job.location}</span>
                  </div>
                  {job.salary && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                      <DollarSign size={11} />{job.salary}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Job Detail */}
        <div className="lg:col-span-3">
          {selectedJob ? (
            <div className="card p-6 sticky top-20 animate-slide-up">
              {/* Header */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {selectedJob.company[0]}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedJob.title}</h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400"><Building2 size={13} />{selectedJob.company}</span>
                    <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400"><MapPin size={13} />{selectedJob.location}</span>
                    <span className={clsx('badge', typeConfig[selectedJob.type]?.class)}>{typeConfig[selectedJob.type]?.label}</span>
                  </div>
                  {selectedJob.salary && (
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm mt-1 flex items-center gap-1">
                      <DollarSign size={14} /> {selectedJob.salary}
                    </p>
                  )}
                </div>
              </div>

              {/* Skills */}
              {selectedJob.skills?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Skills Required</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map(skill => (
                      <span key={skill} className="badge-blue">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="divider my-4" />

              {/* Description */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">About the Role</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedJob.description}</p>
              </div>

              {/* Requirements */}
              {selectedJob.requirements?.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Requirements</h4>
                  <ul className="space-y-1.5">
                    {selectedJob.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-blue-500 mt-0.5 flex-shrink-0">→</span>{req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Apply */}
              {isApplied(selectedJob._id) ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-700 dark:text-green-400 text-sm font-medium">
                  <CheckCircle2 size={16} /> Application Submitted!
                </div>
              ) : (
                <button onClick={() => setApplyModal(true)} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Send size={16} /> Apply Now
                </button>
              )}

              {selectedJob.deadline && (
                <p className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                  <Clock size={11} /> Deadline: {new Date(selectedJob.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          ) : (
            <div className="card empty-state h-64">
              <Briefcase size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
              <p className="text-gray-500">Select a job to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <Modal isOpen={applyModal} onClose={() => setApplyModal(false)} title={`Apply to ${selectedJob?.company}`} size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setApplyModal(false)} className="btn-secondary btn-sm">Cancel</button>
            <button onClick={applyToJob} disabled={applying} className="btn-primary btn-sm flex items-center gap-1.5">
              {applying && <Loader2 size={13} className="animate-spin" />}
              Submit Application
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">{selectedJob?.title} at {selectedJob?.company}</p>
            <p className="text-xs text-blue-500 mt-0.5">{selectedJob?.location}</p>
          </div>
          <div>
            <label className="input-label">Resume URL (Google Drive / LinkedIn)</label>
            <input value={applyForm.resumeUrl} onChange={e => setApplyForm({ ...applyForm, resumeUrl: e.target.value })} placeholder="https://drive.google.com/your-resume" className="input" />
          </div>
          <div>
            <label className="input-label">Cover Letter (Optional)</label>
            <textarea value={applyForm.coverLetter} onChange={e => setApplyForm({ ...applyForm, coverLetter: e.target.value })} rows={5} placeholder="Why are you interested in this position? What makes you a great fit?" className="input resize-none text-sm" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Jobs;
