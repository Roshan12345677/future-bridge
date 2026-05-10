import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ssbtAPI } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import {
  ArrowLeft, BookOpen, Play, FileText, Download, ExternalLink,
  ChevronDown, ChevronUp, Clock, Award, Youtube, File,
  BookMarked, Layers, GraduationCap, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import clsx from 'clsx';

const YEAR_LABELS = { 1: 'First Year', 2: 'Second Year', 3: 'Third Year', 4: 'Fourth Year' };
const SEM_COLORS = ['', 'bg-blue-500', 'bg-blue-600', 'bg-violet-500', 'bg-violet-600', 'bg-emerald-500', 'bg-emerald-600', 'bg-amber-500', 'bg-amber-600'];

// ── Resource Tab Component ────────────────────────────────────────────
const ResourceTab = ({ subject, courseId, semNumber, isTeacher }) => {
  const [activeTab, setActiveTab] = useState('notes');

  const tabs = [
    { id: 'notes', label: 'Notes', icon: FileText, count: subject.notes?.length || 0 },
    { id: 'videos', label: 'Video Lectures', icon: Play, count: subject.videoLectures?.length || 0 },
    { id: 'syllabus', label: 'Syllabus', icon: BookMarked, count: subject.syllabus?.units?.length || 0 },
    { id: 'papers', label: 'Previous Papers', icon: Award, count: subject.previousPapers?.length || 0 },
  ];

  const getYouTubeEmbed = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  return (
    <div className="mt-4 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
      {/* Tab buttons */}
      <div className="flex overflow-x-auto bg-gray-50 dark:bg-gray-800/50">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={clsx('flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2',
              activeTab === id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}>
            <Icon size={13} />
            {label}
            <span className={clsx('ml-1 px-1.5 py-0.5 rounded-full text-xs',
              activeTab === id ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            )}>{count}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4 bg-white dark:bg-gray-900">

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-2">
            {subject.notes?.length > 0 ? subject.notes.map(note => (
              <div key={note._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group">
                <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{note.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    {note.unit && <span className="badge-blue py-0">{note.unit}</span>}
                    <span>{new Date(note.uploadedAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                {note.fileUrl && (
                  <a href={note.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="btn-primary btn-sm text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download size={12} /> Download
                  </a>
                )}
              </div>
            )) : (
              <div className="empty-state py-8">
                <FileText size={32} className="text-gray-200 dark:text-gray-700 mb-2" />
                <p className="text-sm text-gray-400">No notes uploaded yet</p>
                {isTeacher && <p className="text-xs text-gray-400 mt-1">Go to Teacher portal to add notes</p>}
              </div>
            )}
          </div>
        )}

        {/* Video Lectures Tab */}
        {activeTab === 'videos' && (
          <div className="space-y-3">
            {subject.videoLectures?.length > 0 ? subject.videoLectures.map(video => (
              <div key={video._id} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                {/* Video embed */}
                {video.youtubeUrl && (
                  <div className="aspect-video bg-black">
                    <iframe
                      src={getYouTubeEmbed(video.youtubeUrl)}
                      title={video.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className="p-3">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{video.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    {video.professorName && <span className="flex items-center gap-1"><GraduationCap size={11} />{video.professorName}</span>}
                    {video.duration && <span className="flex items-center gap-1"><Clock size={11} />{video.duration}</span>}
                    {video.unit && <span className="badge-gray">{video.unit}</span>}
                  </div>
                  {video.description && <p className="text-xs text-gray-500 mt-1">{video.description}</p>}
                  {video.externalUrl && !video.youtubeUrl && (
                    <a href={video.externalUrl} target="_blank" rel="noopener noreferrer"
                      className="btn-primary btn-sm text-xs mt-2 flex items-center gap-1 w-fit">
                      <ExternalLink size={12} /> Watch Video
                    </a>
                  )}
                </div>
              </div>
            )) : (
              <div className="empty-state py-8">
                <Play size={32} className="text-gray-200 dark:text-gray-700 mb-2" />
                <p className="text-sm text-gray-400">No video lectures uploaded yet</p>
              </div>
            )}
          </div>
        )}

        {/* Syllabus Tab */}
        {activeTab === 'syllabus' && (
          <div>
            {subject.syllabus ? (
              <div className="space-y-3">
                {subject.syllabus.fileUrl && (
                  <a href={subject.syllabus.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="btn-primary btn-sm flex items-center gap-2 w-fit">
                    <Download size={14} /> Download Full Syllabus PDF
                  </a>
                )}
                {subject.syllabus.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{subject.syllabus.description}</p>
                )}
                {subject.syllabus.units?.length > 0 && (
                  <div className="space-y-2">
                    {subject.syllabus.units.map((unit, i) => (
                      <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{unit.unitNumber}</span>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{unit.title}</h4>
                          {unit.hours && <span className="ml-auto text-xs text-gray-400 flex items-center gap-1"><Clock size={11} />{unit.hours}h</span>}
                        </div>
                        {unit.topics?.length > 0 && (
                          <ul className="space-y-1 ml-8">
                            {unit.topics.map((topic, j) => (
                              <li key={j} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>{topic}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state py-8">
                <BookMarked size={32} className="text-gray-200 dark:text-gray-700 mb-2" />
                <p className="text-sm text-gray-400">Syllabus not uploaded yet</p>
              </div>
            )}
          </div>
        )}

        {/* Previous Papers Tab */}
        {activeTab === 'papers' && (
          <div className="space-y-2">
            {subject.previousPapers?.length > 0 ? subject.previousPapers.map(paper => (
              <div key={paper._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 group hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors">
                <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award size={16} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{paper.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <span className="badge-yellow py-0 capitalize">{paper.examType}</span>
                    <span>Year: {paper.year}</span>
                  </div>
                </div>
                <a href={paper.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="btn-sm bg-amber-500 hover:bg-amber-600 text-white text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download size={12} /> Download
                </a>
              </div>
            )) : (
              <div className="empty-state py-8">
                <Award size={32} className="text-gray-200 dark:text-gray-700 mb-2" />
                <p className="text-sm text-gray-400">No previous papers uploaded yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Course Detail Page ───────────────────────────────────────────
const SSBTCourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSemester, setActiveSemester] = useState(1);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [semesterData, setSemesterData] = useState(null);
  const [semLoading, setSemLoading] = useState(false);
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  useEffect(() => {
    ssbtAPI.getCourse(id)
      .then(d => { setCourse(d.course); })
      .catch(() => { toast.error('Course not found'); navigate(-1); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (!id) return;
    setSemLoading(true);
    setExpandedSubject(null);
    ssbtAPI.getSemester(id, activeSemester)
      .then(d => setSemesterData(d.semester))
      .catch(() => setSemesterData(null))
      .finally(() => setSemLoading(false));
  }, [id, activeSemester]);

  if (loading) return <LoadingSpinner text="Loading course..." />;
  if (!course) return null;

  const typeColors = { theory: 'badge-blue', practical: 'badge-green', elective: 'badge-violet', project: 'badge-yellow' };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft size={16} /> Back to SSBT Courses
      </button>

      {/* Course Header */}
      <div className={`rounded-2xl bg-gradient-to-br ${course.color || 'from-blue-500 to-violet-600'} p-6 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap size={18} className="text-white/70" />
              <span className="text-white/70 text-sm">SSBT College of Engineering & Technology</span>
            </div>
            <h1 className="text-2xl font-display font-bold">{course.name}</h1>
            <p className="text-white/80 mt-1 text-sm max-w-lg">{course.description}</p>
            <div className="flex gap-3 mt-3 text-sm">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">{course.duration} Years</span>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">{course.totalSemesters} Semesters</span>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                {course.semesters?.reduce((a, s) => a + (s.subjects?.length || 0), 0)} Subjects
              </span>
            </div>
          </div>
          <span className="text-6xl">{course.icon}</span>
        </div>
      </div>

      {/* Year Tabs */}
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map(year => (
          <div key={year} className="card p-3 text-center">
            <p className="text-xs text-gray-500 font-medium">{YEAR_LABELS[year]}</p>
            <div className="flex justify-center gap-1 mt-2">
              {[year * 2 - 1, year * 2].map(sem => (
                <button key={sem} onClick={() => setActiveSemester(sem)}
                  className={clsx('w-8 h-8 rounded-lg text-xs font-bold transition-all',
                    activeSemester === sem
                      ? `${SEM_COLORS[sem] || 'bg-blue-500'} text-white shadow-sm scale-105`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}>
                  {sem}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Semester Content */}
      <div className="card overflow-hidden">
        <div className={`px-5 py-4 bg-gradient-to-r ${SEM_COLORS[activeSemester] || 'bg-blue-500'} bg-opacity-10`}>
          <h2 className="font-bold text-gray-900 dark:text-white">
            Semester {activeSemester} — {YEAR_LABELS[Math.ceil(activeSemester / 2)]}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {semesterData?.subjects?.length || 0} subjects
          </p>
        </div>

        {semLoading ? (
          <LoadingSpinner text="Loading subjects..." />
        ) : !semesterData ? (
          <div className="empty-state py-12">
            <Layers size={32} className="text-gray-200 dark:text-gray-700 mb-2" />
            <p className="text-sm text-gray-400">No subjects added for this semester yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {semesterData.subjects?.sort((a, b) => a.order - b.order).map(subject => (
              <div key={subject._id} className="p-4">
                {/* Subject Header */}
                <button
                  onClick={() => setExpandedSubject(expandedSubject === subject._id ? null : subject._id)}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {subject.code?.slice(-3) || subject.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{subject.name}</h3>
                      <span className={clsx('badge text-xs capitalize', typeColors[subject.type] || 'badge-blue')}>{subject.type}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      <span>Code: {subject.code}</span>
                      <span>Credits: {subject.credits}</span>
                      {subject.professorName && <span className="flex items-center gap-1"><GraduationCap size={11} />{subject.professorName}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Resource count badges */}
                    {subject.notes?.length > 0 && <span className="badge-blue text-xs">{subject.notes.length} notes</span>}
                    {subject.videoLectures?.length > 0 && <span className="badge-red text-xs">{subject.videoLectures.length} videos</span>}
                    {subject.previousPapers?.length > 0 && <span className="badge-yellow text-xs">{subject.previousPapers.length} papers</span>}
                    {expandedSubject === subject._id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedSubject === subject._id && (
                  <div className="mt-3 animate-slide-up">
                    <ResourceTab
                      subject={subject}
                      courseId={id}
                      semNumber={activeSemester}
                      isTeacher={isTeacher}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SSBTCourseDetail;
