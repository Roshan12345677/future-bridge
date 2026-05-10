import React, { useState } from 'react';
import { aiAPI } from '../../utils/api';
import { Brain, FileText, Mail, Code2, Loader2, Send, Star, ChevronRight, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const tabs = [
  { id: 'interview', label: 'AI Interview Coach', icon: Brain, color: 'from-blue-500 to-violet-600' },
  { id: 'resume', label: 'Resume Generator', icon: FileText, color: 'from-emerald-500 to-cyan-600' },
  { id: 'cover-letter', label: 'Cover Letter', icon: Mail, color: 'from-orange-500 to-rose-600' },
  { id: 'code-review', label: 'Code Review', icon: Code2, color: 'from-violet-500 to-purple-600' },
];

const TOPICS = ['Arrays & Strings', 'Linked Lists', 'Trees & Graphs', 'Dynamic Programming', 'System Design', 'OOP Concepts', 'Database Design', 'JavaScript', 'React.js', 'Node.js', 'Python', 'Java Fundamentals'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const ROLES = ['Software Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'ML Engineer', 'DevOps Engineer'];

const MarkdownContent = ({ content }) => (
  <div className="prose prose-sm dark:prose-invert max-w-none">
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2 mt-4" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 mt-3" {...props} />,
        p: ({ node, ...props }) => <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed" {...props} />,
        ul: ({ node, ...props }) => <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-2 pl-4" {...props} />,
        li: ({ node, ...props }) => <li className="list-disc" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900 dark:text-white" {...props} />,
        code: ({ node, inline, ...props }) => inline
          ? <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400" {...props} />
          : <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs font-mono overflow-x-auto" {...props} />,
        pre: ({ node, ...props }) => <pre className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto mb-3" {...props} />,
        hr: () => <hr className="border-gray-200 dark:border-gray-700 my-4" />,
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

// ── Interview Coach ──────────────────────────────────────────────────
const InterviewCoach = () => {
  const [config, setConfig] = useState({ topic: 'Arrays & Strings', difficulty: 'medium', role: 'Software Developer' });
  const [question, setQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('config'); // config | answering | feedback

  const generateQuestion = async () => {
    setLoading(true);
    setFeedback('');
    try {
      const data = await aiAPI.interview({ topic: config.topic, difficulty: config.difficulty, role: config.role });
      setQuestion(data.response);
      setStep('answering');
      setUserAnswer('');
    } catch (e) { toast.error('Failed to generate question'); }
    finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return toast.error('Please write your answer first');
    setLoading(true);
    try {
      const data = await aiAPI.interview({ topic: config.topic, difficulty: config.difficulty, role: config.role, userAnswer });
      setFeedback(data.response);
      setStep('feedback');
    } catch (e) { toast.error('Failed to evaluate answer'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      {/* Config */}
      {step === 'config' && (
        <div className="card p-6 space-y-4 animate-slide-up">
          <h3 className="font-semibold text-gray-900 dark:text-white">Configure Your Mock Interview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Topic</label>
              <select value={config.topic} onChange={e => setConfig({ ...config, topic: e.target.value })} className="input">
                {TOPICS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Difficulty</label>
              <select value={config.difficulty} onChange={e => setConfig({ ...config, difficulty: e.target.value })} className="input capitalize">
                {DIFFICULTIES.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Target Role</label>
              <select value={config.role} onChange={e => setConfig({ ...config, role: e.target.value })} className="input">
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <button onClick={generateQuestion} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Generate Interview Question
          </button>
        </div>
      )}

      {/* Question */}
      {(step === 'answering' || step === 'feedback') && (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="badge-blue">{config.topic}</span>
              <span className="badge-gray capitalize">{config.difficulty}</span>
            </div>
            <button onClick={() => { setStep('config'); setQuestion(''); setFeedback(''); }} className="text-xs text-blue-500 hover:text-blue-600">New Question</button>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4">
            <MarkdownContent content={question} />
          </div>

          {step === 'answering' && (
            <>
              <label className="input-label">Your Answer</label>
              <textarea
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder="Write your answer here. Think out loud — explain your approach, time complexity, and any edge cases..."
                rows={8}
                className="input resize-none mb-3 font-mono text-sm"
              />
              <button onClick={submitAnswer} disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {loading ? 'Evaluating...' : 'Submit for AI Feedback'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Feedback */}
      {step === 'feedback' && feedback && (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-amber-500 fill-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Feedback</h3>
          </div>
          <MarkdownContent content={feedback} />
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button onClick={() => { setStep('answering'); setFeedback(''); }} className="btn-outline btn-sm">Try Again</button>
            <button onClick={generateQuestion} disabled={loading} className="btn-primary btn-sm flex items-center gap-1">
              <Sparkles size={14} /> Next Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Resume Generator ──────────────────────────────────────────────────
const ResumeGenerator = () => {
  const [form, setForm] = useState({
    personalInfo: { name: '', email: '', phone: '', linkedin: '', github: '' },
    targetRole: 'Software Engineer',
    education: [{ degree: '', institution: '', year: '', grade: '' }],
    experience: [{ title: '', company: '', duration: '', description: '' }],
    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
    projects: [{ name: '', tech: '', description: '' }],
  });
  const [resume, setResume] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const data = await aiAPI.generateResume(form);
      setResume(data.resume);
      toast.success('Resume generated! 🎉');
    } catch (e) { toast.error('Failed to generate resume'); }
    finally { setLoading(false); }
  };

  const copyResume = () => { navigator.clipboard.writeText(resume); toast.success('Resume copied!'); };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* Form */}
      <div className="space-y-4">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(form.personalInfo).map(key => (
              <div key={key} className={key === 'name' ? 'col-span-2' : ''}>
                <label className="input-label capitalize">{key}</label>
                <input value={form.personalInfo[key]} onChange={e => setForm({ ...form, personalInfo: { ...form.personalInfo, [key]: e.target.value } })} placeholder={key} className="input" />
              </div>
            ))}
          </div>
          <div className="mt-3">
            <label className="input-label">Target Role</label>
            <select value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })} className="input">
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Skills</h3>
          <textarea value={form.skills.join(', ')} onChange={e => setForm({ ...form, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="JavaScript, React, Node.js, Python..." rows={3} className="input resize-none text-sm" />
          <p className="text-xs text-gray-400 mt-1">Comma separated list of skills</p>
        </div>

        <button onClick={generate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? 'Generating Your Resume...' : 'Generate AI Resume'}
        </button>
      </div>

      {/* Output */}
      <div className="card p-5 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Generated Resume</h3>
          {resume && <button onClick={copyResume} className="btn-outline btn-sm text-xs">Copy</button>}
        </div>
        {resume ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 max-h-[600px] overflow-y-auto">
            <MarkdownContent content={resume} />
          </div>
        ) : (
          <div className="empty-state">
            <FileText size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
            <p className="text-sm text-gray-500">Fill in your details and click Generate</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Cover Letter ──────────────────────────────────────────────────────
const CoverLetterGenerator = () => {
  const [form, setForm] = useState({ personalInfo: { name: '', email: '' }, jobTitle: '', companyName: '', jobDescription: '', userBackground: '' });
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const data = await aiAPI.coverLetter(form);
      setLetter(data.coverLetter);
      toast.success('Cover letter generated! ✉️');
    } catch (e) { toast.error('Failed to generate cover letter'); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Your Details</h3>
          <div><label className="input-label">Full Name</label><input value={form.personalInfo.name} onChange={e => setForm({ ...form, personalInfo: { ...form.personalInfo, name: e.target.value } })} placeholder="John Doe" className="input" /></div>
          <div><label className="input-label">Email</label><input value={form.personalInfo.email} onChange={e => setForm({ ...form, personalInfo: { ...form.personalInfo, email: e.target.value } })} placeholder="you@example.com" className="input" /></div>
          <div><label className="input-label">Job Title Applying For</label><input value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} placeholder="Software Engineer" className="input" /></div>
          <div><label className="input-label">Company Name</label><input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} placeholder="Google" className="input" /></div>
          <div><label className="input-label">Job Description (paste key points)</label><textarea value={form.jobDescription} onChange={e => setForm({ ...form, jobDescription: e.target.value })} rows={4} placeholder="Key responsibilities and requirements..." className="input resize-none text-sm" /></div>
          <div><label className="input-label">Your Background</label><textarea value={form.userBackground} onChange={e => setForm({ ...form, userBackground: e.target.value })} rows={3} placeholder="Brief summary of your experience and skills..." className="input resize-none text-sm" /></div>
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
          {loading ? 'Writing Your Cover Letter...' : 'Generate Cover Letter'}
        </button>
      </div>
      <div className="card p-5 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Generated Cover Letter</h3>
          {letter && <button onClick={() => { navigator.clipboard.writeText(letter); toast.success('Copied!'); }} className="btn-outline btn-sm text-xs">Copy</button>}
        </div>
        {letter ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 max-h-[600px] overflow-y-auto">
            <MarkdownContent content={letter} />
          </div>
        ) : (
          <div className="empty-state">
            <Mail size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
            <p className="text-sm text-gray-500">Fill in the details to generate your cover letter</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Code Review ──────────────────────────────────────────────────────
const CodeReviewAI = () => {
  const [form, setForm] = useState({ code: '', language: 'javascript', problemTitle: '' });
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!form.code.trim()) return toast.error('Please paste your code');
    setLoading(true);
    try {
      const data = await aiAPI.codeReview(form);
      setReview(data.review);
    } catch (e) { toast.error('Failed to review code'); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Code to Review</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="input-label">Problem Title</label><input value={form.problemTitle} onChange={e => setForm({ ...form, problemTitle: e.target.value })} placeholder="e.g. Two Sum" className="input" /></div>
            <div><label className="input-label">Language</label>
              <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className="input">
                {['javascript', 'python', 'java', 'cpp', 'c'].map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
              </select>
            </div>
          </div>
          <div><label className="input-label">Paste Your Code</label><textarea value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} rows={14} placeholder="Paste your code here..." className="input resize-none font-mono text-sm" /></div>
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Code2 size={16} />}
          {loading ? 'Reviewing Code...' : 'Get AI Code Review'}
        </button>
      </div>
      <div className="card p-5 h-fit">
        <div className="flex items-center gap-2 mb-4">
          <Star size={18} className="text-amber-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Code Review</h3>
        </div>
        {review ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 max-h-[600px] overflow-y-auto">
            <MarkdownContent content={review} />
          </div>
        ) : (
          <div className="empty-state">
            <Code2 size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
            <p className="text-sm text-gray-500">Paste your code and get detailed AI feedback</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main AI Coach Page ──────────────────────────────────────────────
const AICoach = () => {
  const [activeTab, setActiveTab] = useState('interview');

  const components = { interview: InterviewCoach, resume: ResumeGenerator, 'cover-letter': CoverLetterGenerator, 'code-review': CodeReviewAI };
  const ActiveComponent = components[activeTab];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">AI Coach</h1>
        <p className="page-subtitle">Powered by Gemini AI — Practice interviews, generate resumes, get code reviews</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
              activeTab === id
                ? `bg-gradient-to-r ${color} text-white shadow-sm`
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <ActiveComponent />
    </div>
  );
};

export default AICoach;
