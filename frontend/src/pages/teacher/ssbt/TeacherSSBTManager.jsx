import React, { useState, useEffect } from 'react';
import { ssbtAPI } from '../../../utils/api';
import {
  BookOpen, Plus, FileText, Play, Award, BookMarked,
  Trash2, ChevronDown, ChevronUp, Loader2, Save, Youtube,
  Link as LinkIcon, GraduationCap, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../../components/shared/Modal';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import clsx from 'clsx';

const TeacherSSBTManager = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [activeSem, setActiveSem] = useState(1);
  const [semData, setSemData] = useState(null);
  const [semLoading, setSemLoading] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [activeResourceTab, setActiveResourceTab] = useState('notes');

  // Modal states
  const [noteModal, setNoteModal] = useState({ open: false, subjectId: null });
  const [videoModal, setVideoModal] = useState({ open: false, subjectId: null });
  const [paperModal, setPaperModal] = useState({ open: false, subjectId: null });
  const [syllabusModal, setSyllabusModal] = useState({ open: false, subjectId: null });
  const [saving, setSaving] = useState(false);

  // Form states
  const [noteForm, setNoteForm] = useState({ title: '', description: '', fileUrl: '', unit: '' });
  const [videoForm, setVideoForm] = useState({ title: '', description: '', youtubeUrl: '', externalUrl: '', professorName: '', duration: '', unit: '' });
  const [paperForm, setPaperForm] = useState({ title: '', year: new Date().getFullYear(), examType: 'university', fileUrl: '' });

  useEffect(() => {
    ssbtAPI.getCourses()
      .then(d => setCourses(d.courses || []))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    loadSemester();
  }, [selectedCourse, activeSem]);

  const loadSemester = async () => {
    setSemLoading(true);
    setExpandedSubject(null);
    try {
      const data = await ssbtAPI.getSemester(selectedCourse, activeSem);
      setSemData(data.semester);
    } catch (e) {
      setSemData(null);
    } finally {
      setSemLoading(false);
    }
  };

  // ── Add Note ────────────────────────────────────────────
  const addNote = async () => {
    if (!noteForm.title || !noteForm.fileUrl) return toast.error('Title and file URL required');
    setSaving(true);
    try {
      await ssbtAPI.addNote(selectedCourse, activeSem, noteModal.subjectId, noteForm);
      toast.success('Note added!');
      setNoteModal({ open: false, subjectId: null });
      setNoteForm({ title: '', description: '', fileUrl: '', unit: '' });
      loadSemester();
    } catch (e) { toast.error('Failed to add note'); }
    finally { setSaving(false); }
  };

  // ── Add Video ───────────────────────────────────────────
  const addVideo = async () => {
    if (!videoForm.title) return toast.error('Video title required');
    if (!videoForm.youtubeUrl && !videoForm.externalUrl) return toast.error('YouTube URL or external URL required');
    setSaving(true);
    try {
      await ssbtAPI.addVideo(selectedCourse, activeSem, videoModal.subjectId, videoForm);
      toast.success('Video lecture added!');
      setVideoModal({ open: false, subjectId: null });
      setVideoForm({ title: '', description: '', youtubeUrl: '', externalUrl: '', professorName: '', duration: '', unit: '' });
      loadSemester();
    } catch (e) { toast.error('Failed to add video'); }
    finally { setSaving(false); }
  };

  // ── Add Paper ───────────────────────────────────────────
  const addPaper = async () => {
    if (!paperForm.title || !paperForm.fileUrl) return toast.error('Title and file URL required');
    setSaving(true);
    try {
      await ssbtAPI.addPaper(selectedCourse, activeSem, paperModal.subjectId, paperForm);
      toast.success('Previous paper added!');
      setPaperModal({ open: false, subjectId: null });
      setPaperForm({ title: '', year: new Date().getFullYear(), examType: 'university', fileUrl: '' });
      loadSemester();
    } catch (e) { toast.error('Failed to add paper'); }
    finally { setSaving(false); }
  };

  // ── Delete handlers ─────────────────────────────────────
  const deleteNote = async (subjectId, noteId) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await ssbtAPI.deleteNote(selectedCourse, activeSem, subjectId, noteId);
      toast.success('Note deleted');
      loadSemester();
    } catch (e) { toast.error('Failed'); }
  };

  const deleteVideo = async (subjectId, videoId) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await ssbtAPI.deleteVideo(selectedCourse, activeSem, subjectId, videoId);
      toast.success('Video deleted');
      loadSemester();
    } catch (e) { toast.error('Failed'); }
  };

  const deletePaper = async (subjectId, paperId) => {
    if (!window.confirm('Delete this paper?')) return;
    try {
      await ssbtAPI.deletePaper(selectedCourse, activeSem, subjectId, paperId);
      toast.success('Paper deleted');
      loadSemester();
    } catch (e) { toast.error('Failed'); }
  };

  if (loading) return <LoadingSpinner text="Loading SSBT manager..." />;

  const course = courses.find(c => c._id === selectedCourse);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">SSBT Content Manager</h1>
        <p className="page-subtitle">Add notes, video lectures, syllabus and previous year papers</p>
      </div>

      {/* Course Selector */}
      <div className="card p-5">
        <label className="input-label text-base font-semibold">Select Engineering Course</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          {courses.map(c => (
            <button key={c._id} onClick={() => { setSelectedCourse(c._id); setActiveSem(1); }}
              className={clsx('p-4 rounded-xl border-2 text-left transition-all',
                selectedCourse === c._id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800'
              )}>
              <span className="text-2xl">{c.icon}</span>
              <p className="font-semibold text-gray-900 dark:text-white text-sm mt-2">{c.shortName}</p>
              <p className="text-xs text-gray-500 truncate">{c.name}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedCourse && (
        <>
          {/* Semester Selector */}
          <div className="card p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Semester</p>
            <div className="flex gap-2 flex-wrap">
              {[1,2,3,4,5,6,7,8].map(sem => (
                <button key={sem} onClick={() => setActiveSem(sem)}
                  className={clsx('px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    activeSem === sem
                      ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}>
                  Semester {sem}
                  <span className="text-xs opacity-70 ml-1">
                    (Year {Math.ceil(sem / 2)})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Subjects */}
          {semLoading ? (
            <LoadingSpinner text="Loading subjects..." />
          ) : !semData ? (
            <div className="card empty-state py-12">
              <Layers size={32} className="text-gray-200 dark:text-gray-700 mb-2" />
              <p className="text-sm text-gray-400">No subjects in Semester {activeSem} yet</p>
              <p className="text-xs text-gray-400 mt-1">Contact admin to add subjects</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {course?.name} — Semester {activeSem} Subjects
              </h3>

              {semData.subjects?.sort((a, b) => a.order - b.order).map(subject => (
                <div key={subject._id} className="card overflow-hidden">
                  {/* Subject Header */}
                  <button
                    onClick={() => setExpandedSubject(expandedSubject === subject._id ? null : subject._id)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {subject.code?.slice(-3) || subject.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{subject.name}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {subject.code} • {subject.credits} credits • {subject.type}
                        {subject.professorName && ` • Prof. ${subject.professorName}`}
                      </p>
                    </div>
                    {/* Resource counts */}
                    <div className="flex gap-2 flex-shrink-0">
                      <span className="text-xs text-blue-500 flex items-center gap-0.5">
                        <FileText size={11} /> {subject.notes?.length || 0}
                      </span>
                      <span className="text-xs text-red-500 flex items-center gap-0.5">
                        <Play size={11} /> {subject.videoLectures?.length || 0}
                      </span>
                      <span className="text-xs text-amber-500 flex items-center gap-0.5">
                        <Award size={11} /> {subject.previousPapers?.length || 0}
                      </span>
                    </div>
                    {expandedSubject === subject._id
                      ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
                      : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                  </button>

                  {/* Expanded Panel */}
                  {expandedSubject === subject._id && (
                    <div className="border-t border-gray-100 dark:border-gray-800">
                      {/* Resource Tabs */}
                      <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                        {[
                          { id: 'notes', label: 'Notes', icon: FileText, count: subject.notes?.length },
                          { id: 'videos', label: 'Videos', icon: Play, count: subject.videoLectures?.length },
                          { id: 'papers', label: 'Papers', icon: Award, count: subject.previousPapers?.length },
                        ].map(({ id, label, icon: Icon, count }) => (
                          <button key={id} onClick={() => setActiveResourceTab(id)}
                            className={clsx('flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors',
                              activeResourceTab === id
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            )}>
                            <Icon size={13} /> {label}
                            <span className="ml-0.5 text-xs opacity-60">({count || 0})</span>
                          </button>
                        ))}
                      </div>

                      <div className="p-4">
                        {/* Notes Tab */}
                        {activeResourceTab === 'notes' && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center mb-3">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Study Notes</p>
                              <button
                                onClick={() => { setNoteModal({ open: true, subjectId: subject._id }); setNoteForm({ title: '', description: '', fileUrl: '', unit: '' }); }}
                                className="btn-primary btn-sm text-xs flex items-center gap-1">
                                <Plus size={13} /> Add Note
                              </button>
                            </div>
                            {subject.notes?.length > 0 ? subject.notes.map(note => (
                              <div key={note._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl group">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <FileText size={14} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{note.title}</p>
                                  <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                                    {note.unit && <span className="badge-blue py-0 text-xs">{note.unit}</span>}
                                    {note.fileUrl && <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View file</a>}
                                  </div>
                                </div>
                                <button onClick={() => deleteNote(subject._id, note._id)} className="btn-icon w-7 h-7 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )) : (
                              <div className="empty-state py-6">
                                <FileText size={28} className="text-gray-200 dark:text-gray-700 mb-2" />
                                <p className="text-sm text-gray-400">No notes yet. Click "Add Note" to upload.</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Videos Tab */}
                        {activeResourceTab === 'videos' && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center mb-3">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Video Lectures</p>
                              <button
                                onClick={() => { setVideoModal({ open: true, subjectId: subject._id }); setVideoForm({ title: '', description: '', youtubeUrl: '', externalUrl: '', professorName: '', duration: '', unit: '' }); }}
                                className="btn-primary btn-sm text-xs flex items-center gap-1">
                                <Plus size={13} /> Add Video
                              </button>
                            </div>
                            {subject.videoLectures?.length > 0 ? subject.videoLectures.map(video => (
                              <div key={video._id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl group">
                                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Youtube size={14} className="text-red-600 dark:text-red-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{video.title}</p>
                                  <div className="flex flex-wrap gap-2 text-xs text-gray-400 mt-0.5">
                                    {video.professorName && <span>👨‍🏫 {video.professorName}</span>}
                                    {video.duration && <span>⏱ {video.duration}</span>}
                                    {video.unit && <span className="badge-gray py-0">{video.unit}</span>}
                                    {video.youtubeUrl && <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">YouTube ↗</a>}
                                  </div>
                                </div>
                                <button onClick={() => deleteVideo(subject._id, video._id)} className="btn-icon w-7 h-7 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )) : (
                              <div className="empty-state py-6">
                                <Play size={28} className="text-gray-200 dark:text-gray-700 mb-2" />
                                <p className="text-sm text-gray-400">No videos yet. Click "Add Video" to add YouTube links.</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Papers Tab */}
                        {activeResourceTab === 'papers' && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center mb-3">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Previous Year Papers</p>
                              <button
                                onClick={() => { setPaperModal({ open: true, subjectId: subject._id }); setPaperForm({ title: '', year: new Date().getFullYear(), examType: 'university', fileUrl: '' }); }}
                                className="btn-primary btn-sm text-xs flex items-center gap-1">
                                <Plus size={13} /> Add Paper
                              </button>
                            </div>
                            {subject.previousPapers?.length > 0 ? subject.previousPapers.map(paper => (
                              <div key={paper._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl group">
                                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Award size={14} className="text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{paper.title}</p>
                                  <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                                    <span className="badge-yellow py-0 capitalize">{paper.examType}</span>
                                    <span>Year: {paper.year}</span>
                                    {paper.fileUrl && <a href={paper.fileUrl} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Download ↗</a>}
                                  </div>
                                </div>
                                <button onClick={() => deletePaper(subject._id, paper._id)} className="btn-icon w-7 h-7 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )) : (
                              <div className="empty-state py-6">
                                <Award size={28} className="text-gray-200 dark:text-gray-700 mb-2" />
                                <p className="text-sm text-gray-400">No papers yet. Click "Add Paper" to upload.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Add Note Modal ──────────────────────────────── */}
      <Modal isOpen={noteModal.open} onClose={() => setNoteModal({ open: false, subjectId: null })} title="Add Study Note" size="md"
        footer={<div className="flex justify-end gap-2"><button onClick={() => setNoteModal({ open: false, subjectId: null })} className="btn-secondary btn-sm">Cancel</button><button onClick={addNote} disabled={saving} className="btn-primary btn-sm flex items-center gap-1.5">{saving && <Loader2 size={13} className="animate-spin" />}Add Note</button></div>}>
        <div className="space-y-4">
          <div><label className="input-label">Note Title *</label><input value={noteForm.title} onChange={e => setNoteForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Unit 3 - Binary Trees Notes" className="input" autoFocus /></div>
          <div><label className="input-label">Description</label><textarea value={noteForm.description} onChange={e => setNoteForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description of the notes..." className="input resize-none" /></div>
          <div><label className="input-label">File URL * (Google Drive / OneDrive / Any link)</label><input value={noteForm.fileUrl} onChange={e => setNoteForm(f => ({ ...f, fileUrl: e.target.value }))} placeholder="https://drive.google.com/file/d/..." className="input" /></div>
          <div><label className="input-label">Unit</label><input value={noteForm.unit} onChange={e => setNoteForm(f => ({ ...f, unit: e.target.value }))} placeholder="e.g. Unit 1, Unit 2" className="input" /></div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-600 dark:text-blue-400">
            💡 Tip: Upload the file to Google Drive, set sharing to "Anyone with link can view", then paste the link here.
          </div>
        </div>
      </Modal>

      {/* ── Add Video Modal ─────────────────────────────── */}
      <Modal isOpen={videoModal.open} onClose={() => setVideoModal({ open: false, subjectId: null })} title="Add Video Lecture" size="md"
        footer={<div className="flex justify-end gap-2"><button onClick={() => setVideoModal({ open: false, subjectId: null })} className="btn-secondary btn-sm">Cancel</button><button onClick={addVideo} disabled={saving} className="btn-primary btn-sm flex items-center gap-1.5">{saving && <Loader2 size={13} className="animate-spin" />}Add Video</button></div>}>
        <div className="space-y-4">
          <div><label className="input-label">Video Title *</label><input value={videoForm.title} onChange={e => setVideoForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Lecture 5 - Dijkstra's Algorithm" className="input" autoFocus /></div>
          <div><label className="input-label">YouTube URL (paste the full YouTube video URL)</label>
            <div className="relative"><Youtube size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" /><input value={videoForm.youtubeUrl} onChange={e => setVideoForm(f => ({ ...f, youtubeUrl: e.target.value }))} placeholder="https://www.youtube.com/watch?v=..." className="input pl-9" /></div>
          </div>
          <div><label className="input-label">OR External Video URL</label><input value={videoForm.externalUrl} onChange={e => setVideoForm(f => ({ ...f, externalUrl: e.target.value }))} placeholder="https://any-other-video-link.com" className="input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="input-label">Professor Name</label><input value={videoForm.professorName} onChange={e => setVideoForm(f => ({ ...f, professorName: e.target.value }))} placeholder="Dr. John Smith" className="input" /></div>
            <div><label className="input-label">Duration</label><input value={videoForm.duration} onChange={e => setVideoForm(f => ({ ...f, duration: e.target.value }))} placeholder="45 mins" className="input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="input-label">Unit</label><input value={videoForm.unit} onChange={e => setVideoForm(f => ({ ...f, unit: e.target.value }))} placeholder="Unit 2" className="input" /></div>
            <div><label className="input-label">Description</label><input value={videoForm.description} onChange={e => setVideoForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" className="input" /></div>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-xs text-red-600 dark:text-red-400">
            💡 YouTube videos will be embedded directly in the course page for students to watch.
          </div>
        </div>
      </Modal>

      {/* ── Add Paper Modal ─────────────────────────────── */}
      <Modal isOpen={paperModal.open} onClose={() => setPaperModal({ open: false, subjectId: null })} title="Add Previous Year Paper" size="md"
        footer={<div className="flex justify-end gap-2"><button onClick={() => setPaperModal({ open: false, subjectId: null })} className="btn-secondary btn-sm">Cancel</button><button onClick={addPaper} disabled={saving} className="btn-primary btn-sm flex items-center gap-1.5">{saving && <Loader2 size={13} className="animate-spin" />}Add Paper</button></div>}>
        <div className="space-y-4">
          <div><label className="input-label">Paper Title *</label><input value={paperForm.title} onChange={e => setPaperForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. May 2023 University Exam Paper" className="input" autoFocus /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="input-label">Year *</label><input type="number" value={paperForm.year} onChange={e => setPaperForm(f => ({ ...f, year: Number(e.target.value) }))} min="2000" max="2030" className="input" /></div>
            <div><label className="input-label">Exam Type</label>
              <select value={paperForm.examType} onChange={e => setPaperForm(f => ({ ...f, examType: e.target.value }))} className="input capitalize">
                <option value="university">University Exam</option>
                <option value="internal">Internal Exam</option>
                <option value="mid-sem">Mid Semester</option>
                <option value="practical">Practical Exam</option>
              </select>
            </div>
          </div>
          <div><label className="input-label">File URL * (Google Drive PDF link)</label><input value={paperForm.fileUrl} onChange={e => setPaperForm(f => ({ ...f, fileUrl: e.target.value }))} placeholder="https://drive.google.com/file/d/..." className="input" /></div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-xs text-amber-600 dark:text-amber-400">
            💡 Upload the paper PDF to Google Drive, set sharing to "Anyone with link", then paste the link here.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherSSBTManager;
