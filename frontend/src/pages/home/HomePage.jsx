import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap, Brain, Code2, Trophy, Users, BookOpen,
  ChevronRight, Star, Quote, Send, Mail, Phone, MapPin,
  Menu, X, ArrowRight, Zap, Shield, TrendingUp, Award,
  MessageCircle, Minimize2, Maximize2, RotateCcw,
  CheckCircle, Play, Linkedin, Twitter, Github, Instagram,
  ChevronDown, Sparkles, Briefcase, Clock, Globe,
} from 'lucide-react';

// ── Animated Counter ─────────────────────────────────────────────────
const Counter = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ── AI Chatbot ───────────────────────────────────────────────────────
const AIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm BridgeBot 🎓 How can I help you today? Ask me about our courses, features, or admissions!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickReplies = ['Tell me about courses', 'How to enroll?', 'AI features', 'Fee structure'];

  const getBotResponse = (msg) => {
    const m = msg.toLowerCase();
    if (m.includes('course') || m.includes('subject')) return "We offer courses in 4 categories: 🎓 Academic (SSBT Engineering), 🏆 Competitive Programming, 💼 Placement Prep, and 🧩 DSA Practice. Each course includes video lectures, notes, and previous year papers!";
    if (m.includes('enroll') || m.includes('join') || m.includes('register')) return "Enrolling is easy! Click the 'Get Started Free' button → Create your account → Choose Student or Teacher → Start learning instantly. No fee for basic access! 🚀";
    if (m.includes('ai') || m.includes('artificial')) return "Our AI features include: 🤖 AI Interview Coach (practice with real questions), 📄 Resume Generator, ✉️ Cover Letter Writer, and 🔍 Code Review. All powered by Google Gemini 2.5!";
    if (m.includes('fee') || m.includes('cost') || m.includes('price') || m.includes('free')) return "Future Bridge offers a FREE tier with access to all core features! Premium plans for advanced AI features and unlimited code execution. Start free, upgrade anytime. 💰";
    if (m.includes('dsa') || m.includes('algorithm') || m.includes('leetcode')) return "Our LeetNext DSA Sheet has 200+ problems organized by topic and company. Track your progress, mark problems solved, and filter by difficulty. Problems from Amazon, Google, Microsoft and more! 💻";
    if (m.includes('attendance')) return "Our Attendance Management System lets teachers mark attendance digitally. Students can track their attendance percentage in real-time. Automatic alerts for students below 75%! 📊";
    if (m.includes('teacher') || m.includes('professor')) return "Teachers can: create and publish courses, add notes & video lectures, manage assignments, grade submissions, mark attendance, and interact with students in the forum. Full-featured teacher portal! 👨‍🏫";
    if (m.includes('job') || m.includes('internship') || m.includes('placement')) return "Our Job Portal features opportunities from top companies! Browse full-time jobs, internships, and remote positions. Apply directly, track applications, and use AI to generate your cover letter! 💼";
    if (m.includes('hello') || m.includes('hi') || m.includes('hey')) return "Hello! 👋 Welcome to Future Bridge! I'm here to help you explore our platform. What would you like to know about? Courses, AI features, or getting started?";
    if (m.includes('contact') || m.includes('support') || m.includes('help')) return "You can reach us at: 📧 support@futurebridge.com | 📞 +91-9876543210 | Or fill the contact form on this page. We typically respond within 24 hours! 🕐";
    return "That's a great question! 😊 Future Bridge is a complete education platform for engineering students. We offer AI-powered learning, DSA practice, code editor, job portal, and much more. Would you like to know more about any specific feature?";
  };

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msgText }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setMessages(prev => [...prev, { role: 'bot', text: getBotResponse(msgText) }]);
    setLoading(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {open && (
        <div className="mb-4 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Brain size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">BridgeBot</p>
                <p className="text-blue-100 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  Online
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && (
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <Brain size={12} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-tr-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <Brain size={12} className="text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-2 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-3 py-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {quickReplies.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full whitespace-nowrap hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-100 dark:border-blue-800">
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none border border-gray-100 dark:border-gray-700"
            />
            <button onClick={() => sendMessage()}
              className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity flex-shrink-0">
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 bg-gradient-to-br from-blue-600 to-violet-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all duration-200 shadow-glow-blue"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
      {!open && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg border border-gray-100 dark:border-gray-800 whitespace-nowrap animate-bounce">
          Chat with BridgeBot! 👋
        </div>
      )}
    </div>
  );
};

// ── Main HomePage ────────────────────────────────────────────────────
const HomePage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactSent(true);
    setTimeout(() => setContactSent(false), 4000);
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const navLinks = [
    { label: 'Home', id: 'hero' },
    { label: 'About', id: 'about' },
    { label: 'Features', id: 'features' },
    { label: 'Achievements', id: 'achievements' },
    { label: 'Blog', id: 'blog' },
    { label: 'Contact', id: 'contact' },
  ];

  const features = [
    { icon: Brain, title: 'AI Interview Coach', desc: 'Practice with AI-powered mock interviews. Get real-time feedback, scoring, and improvement tips powered by Gemini AI.', color: 'from-violet-500 to-purple-600', badge: 'AI Powered' },
    { icon: Code2, title: 'Code Editor & Compiler', desc: 'Write and execute code in C++, Java, Python, JavaScript directly in your browser with real-time output.', color: 'from-blue-500 to-cyan-600', badge: 'Multi-language' },
    { icon: BookOpen, title: 'SSBT Engineering Courses', desc: 'Complete semester-wise study material with notes, video lectures, syllabus and previous year papers.', color: 'from-emerald-500 to-teal-600', badge: 'SSBT Official' },
    { icon: TrendingUp, title: 'LeetNext DSA Sheet', desc: '200+ curated DSA problems organized by topic and company. Track your progress with visual dashboards.', color: 'from-orange-500 to-red-600', badge: '200+ Problems' },
    { icon: CheckCircle, title: 'Attendance Management', desc: 'Digital attendance tracking for teachers. Students see real-time percentage with shortage alerts.', color: 'from-pink-500 to-rose-600', badge: 'Smart Tracking' },
    { icon: Briefcase, title: 'Job & Internship Portal', desc: 'Discover opportunities from top companies. AI-generated resumes and cover letters included.', color: 'from-amber-500 to-yellow-600', badge: 'Top Companies' },
  ];

  const achievements = [
    { number: 5000, suffix: '+', label: 'Students Enrolled', icon: Users },
    { number: 200, suffix: '+', label: 'DSA Problems', icon: Code2 },
    { number: 50, suffix: '+', label: 'Expert Teachers', icon: GraduationCap },
    { number: 95, suffix: '%', label: 'Placement Rate', icon: Trophy },
  ];

  const testimonials = [
    { name: 'Arjun Sharma', role: 'Software Engineer at Amazon', avatar: 'A', rating: 5, text: 'Future Bridge completely transformed my preparation. The AI Interview Coach helped me crack Amazon\'s coding round. The DSA sheet is simply the best resource I\'ve found online!', college: 'SSBT College of Engineering' },
    { name: 'Priya Singh', role: 'Frontend Developer at Microsoft', avatar: 'P', rating: 5, text: 'The Resume Generator saved me hours of work. I got 3 interview calls in a week after using it. The SSBT course materials with video lectures made my semester preparation so much easier!', college: 'SSBT College of Engineering' },
    { name: 'Rahul Verma', role: 'Full Stack Developer at Flipkart', avatar: 'R', rating: 5, text: 'The code editor with multiple language support is incredible. I practiced hundreds of problems here. The real-time chat with teachers made doubt solving instant and effective.', college: 'SSBT College of Engineering' },
    { name: 'Ananya Patel', role: 'Data Engineer at Google', avatar: 'AN', rating: 5, text: 'The attendance management system made tracking so effortless as a teacher. And the analytics dashboard gives perfect insights into student performance. Highly recommend!', college: 'SSBT College of Engineering', isTeacher: true },
  ];

  const blogs = [
    { title: 'How to Crack Top Tech Company Interviews in 2025', category: 'Career', date: 'Jan 15, 2025', readTime: '8 min read', emoji: '💼', desc: 'A comprehensive guide to preparing for FAANG interviews with the right mindset, preparation strategy, and resources.' },
    { title: 'Master Dynamic Programming: From Zero to Hero', category: 'DSA', date: 'Jan 28, 2025', readTime: '12 min read', emoji: '🧠', desc: 'Learn the fundamentals of Dynamic Programming with 10 must-know patterns that cover 80% of DP problems.' },
    { title: 'SSBT Semester Exam Preparation Strategy', category: 'Academics', date: 'Feb 5, 2025', readTime: '6 min read', emoji: '📚', desc: 'Smart study techniques and time management tips for scoring 80%+ in university examinations.' },
    { title: 'Building Your First Full Stack Project with MERN', category: 'Development', date: 'Feb 18, 2025', readTime: '15 min read', emoji: '🚀', desc: 'Step-by-step tutorial to build a production-ready application using MongoDB, Express, React and Node.js.' },
    { title: 'Top 50 System Design Questions Asked in 2025', category: 'Career', date: 'Mar 1, 2025', readTime: '10 min read', emoji: '⚙️', desc: 'Prepare for system design interviews with the most frequently asked questions and detailed model answers.' },
    { title: 'AI Tools Every Engineering Student Must Know', category: 'AI', date: 'Mar 12, 2025', readTime: '7 min read', emoji: '🤖', desc: 'Discover how AI tools can 10x your productivity — from code generation to research and documentation.' },
  ];

  const faqs = [
    { q: 'Is Future Bridge completely free to use?', a: 'Yes! The core features including DSA problems, SSBT courses, code editor, and job portal are completely free. Premium AI features are available with advanced plans.' },
    { q: 'How do I access SSBT engineering course materials?', a: 'After registering as a student, click "SSBT Courses" in the sidebar. You can browse all 4 engineering branches, select your semester, and access notes, videos, and previous papers for each subject.' },
    { q: 'Can teachers add their own course content?', a: 'Absolutely! Teachers can upload notes (via Google Drive links), add YouTube video lectures, upload previous year papers, and manage student attendance — all from the Teacher Dashboard.' },
    { q: 'How does the AI Interview Coach work?', a: 'The AI Coach is powered by Google Gemini. You select a topic, difficulty, and target role. The AI generates realistic interview questions, evaluates your answers, and provides detailed feedback with a score.' },
    { q: 'What programming languages does the Code Editor support?', a: 'The Code Editor supports C++, Java, Python, JavaScript, C, TypeScript, Go, and Rust. Code is executed via JDoodle API with real-time output.' },
    { q: 'How is attendance tracked?', a: 'Teachers can select a course, subject, and date, then mark each student as Present/Absent/Late/Excused. Students see their live attendance percentage with alerts when they fall below 75%.' },
  ];

  const categoryColors = {
    'Career': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'DSA': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    'Academics': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Development': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'AI': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans">

      {/* ── NAVBAR ──────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg shadow-sm border-b border-gray-100 dark:border-gray-800' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-glow-blue">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-gray-900 dark:text-white text-sm leading-tight">Future Bridge</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium leading-tight">Smart Education</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, id }) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                {label}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"
              className="px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
              Login
            </Link>
            <Link to="/register"
              className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl hover:opacity-90 transition-all shadow-sm flex items-center gap-1.5">
              Get Started Free <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(o => !o)} className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-400">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-4 space-y-1 animate-slide-up">
            {navLinks.map(({ label, id }) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                {label}
              </button>
            ))}
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1 text-center py-2.5 text-sm font-semibold text-blue-600 border border-blue-200 rounded-xl">Login</Link>
              <Link to="/register" className="flex-1 text-center py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-blue-950 to-violet-950" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl animate-pulse-slow" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6 animate-fade-in">
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">AI-Powered Education Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6 animate-slide-up">
              Bridge the Gap
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Between Learning
              </span>
              <span className="block text-white">& Success</span>
            </h1>

            <p className="text-lg text-blue-100/80 mb-8 max-w-lg mx-auto lg:mx-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Complete education platform for engineering students — AI coaching, DSA practice, SSBT courses, code editor, attendance tracking, and placement preparation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/register"
                className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold rounded-2xl hover:opacity-90 transition-all shadow-glow-blue flex items-center justify-center gap-2 text-sm">
                <Zap size={16} className="fill-current" /> Start Learning Free
              </Link>
              <button onClick={() => scrollTo('features')}
                className="px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm">
                <Play size={16} className="fill-current" /> See Features
              </button>
            </div>

            {/* Stats Row */}
            <div className="flex gap-6 justify-center lg:justify-start mt-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {[
                { value: '5000+', label: 'Students' },
                { value: '200+', label: 'Problems' },
                { value: '50+', label: 'Teachers' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs text-blue-300">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard Preview Card */}
          <div className="relative animate-float hidden lg:block">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
              {/* Mock dashboard */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <GraduationCap size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Student Dashboard</p>
                  <p className="text-blue-300 text-xs">Welcome back, Arjun! 👋</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Problems Solved', value: '142', icon: '🎯', color: 'from-blue-500/20 to-blue-600/20' },
                  { label: 'Courses Enrolled', value: '4', icon: '📚', color: 'from-violet-500/20 to-violet-600/20' },
                  { label: 'Tasks Done', value: '28', icon: '✅', color: 'from-emerald-500/20 to-emerald-600/20' },
                  { label: 'Streak Days', value: '15🔥', icon: '⚡', color: 'from-amber-500/20 to-amber-600/20' },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className={`bg-gradient-to-br ${color} border border-white/10 rounded-2xl p-3`}>
                    <p className="text-lg font-bold text-white">{value}</p>
                    <p className="text-xs text-white/60">{label}</p>
                  </div>
                ))}
              </div>
              {/* Mini progress bars */}
              <div className="space-y-2">
                {[
                  { label: 'DSA Progress', pct: 71, color: 'bg-blue-500' },
                  { label: 'Attendance', pct: 88, color: 'bg-emerald-500' },
                  { label: 'Placement Ready', pct: 65, color: 'bg-violet-500' },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>{label}</span><span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
              🎉 Problem Solved!
            </div>
            <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              🤖 AI Powered
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button onClick={() => scrollTo('about')} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white/80 transition-colors animate-bounce">
          <ChevronDown size={28} />
        </button>
      </section>

      {/* ── ABOUT ───────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                <Globe size={14} /> About Future Bridge
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Empowering Engineers to
                <span className="block gradient-text">Build Tomorrow</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                Future Bridge is a comprehensive smart education platform built specifically for engineering students and educators. We combine cutting-edge AI technology with quality academic content to create the most effective learning experience.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                Founded by engineering graduates who felt the gap between academic learning and industry requirements, Future Bridge bridges exactly that — from first-year fundamentals to final-year placements.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Brain, label: 'AI-Powered Learning', desc: 'Gemini AI for interviews, resumes & code review' },
                  { icon: Shield, label: 'University Aligned', desc: 'SSBT syllabus and exam pattern focused' },
                  { icon: Award, label: 'Industry Ready', desc: 'Real company problems and job opportunities' },
                  { icon: Users, label: 'Community Driven', desc: 'Learn and grow with 5000+ students' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={15} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/register" className="btn-primary inline-flex items-center gap-2">
                Join Future Bridge <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right — Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-violet-700 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-8" />
                <div className="relative z-10">
                  <p className="text-blue-200 text-sm font-medium mb-2">Our Mission</p>
                  <h3 className="text-2xl font-display font-bold mb-4">"Making quality education accessible to every engineering student"</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">We believe every student deserves access to world-class education, AI tools, and career guidance — regardless of their college tier or background.</p>
                </div>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { emoji: '🎓', label: '4 Branches', sub: 'Engineering' },
                  { emoji: '🤖', label: 'Gemini AI', sub: 'Powered' },
                  { emoji: '💼', label: '100+ Jobs', sub: 'Posted' },
                ].map(({ emoji, label, sub }) => (
                  <div key={label} className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-center">
                    <p className="text-2xl mb-1">{emoji}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              <Zap size={14} /> Platform Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to
              <span className="block gradient-text">Succeed in Engineering</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From first-year academics to final-year placements — one platform for your entire engineering journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color, badge }) => (
              <div key={title} className="card-hover p-6 group">
                <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                  <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">{badge}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
                <button className="mt-4 text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                  Learn more <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/register" className="btn-primary inline-flex items-center gap-2">
              Explore All Features <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── ACHIEVEMENTS ────────────────────────────────────── */}
      <section id="achievements" className="py-20 bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-32 translate-x-32" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              <Trophy size={14} /> Our Achievements
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              Numbers That Speak
            </h2>
            <p className="text-blue-100 max-w-xl mx-auto">
              Join thousands of students who have already transformed their engineering careers with Future Bridge.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {achievements.map(({ number, suffix, label, icon: Icon }) => (
              <div key={label} className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Icon size={22} className="text-white" />
                </div>
                <p className="text-4xl font-display font-bold text-white mb-1">
                  <Counter end={number} suffix={suffix} />
                </p>
                <p className="text-blue-100 text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* Achievement Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🏆', title: 'Best EdTech Platform 2024', desc: 'Awarded by Maharashtra Engineering Association for innovation in technical education', year: '2024' },
              { icon: '🎯', title: '95% Placement Success', desc: 'Our students secured positions at Amazon, Google, Microsoft, Flipkart and 50+ companies', year: '2024' },
              { icon: '⭐', title: '4.9/5 Student Rating', desc: 'Consistently rated as the most helpful platform by our engineering student community', year: '2024' },
            ].map(({ icon, title, desc, year }) => (
              <div key={title} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 text-white">
                <div className="text-4xl mb-3">{icon}</div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg">{title}</h3>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{year}</span>
                </div>
                <p className="text-blue-100 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              <Star size={14} /> Student Stories
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              What Our Students Say
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Real stories from real students and teachers who transformed their careers with Future Bridge.
            </p>
          </div>

          {/* Featured Testimonial */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="card p-8 text-center relative">
              <Quote size={40} className="text-blue-100 dark:text-blue-900 absolute top-6 left-6" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  {testimonials[activeTestimonial].avatar}
                </div>
                <div className="flex justify-center gap-0.5 mb-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed italic mb-6">
                  "{testimonials[activeTestimonial].text}"
                </p>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{testimonials[activeTestimonial].name}</p>
                  <p className="text-blue-600 dark:text-blue-400 text-sm">{testimonials[activeTestimonial].role}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{testimonials[activeTestimonial].college}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeTestimonial ? 'bg-blue-600 w-6' : 'bg-gray-200 dark:bg-gray-700'}`} />
            ))}
          </div>

          {/* All testimonial cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonials.map((t, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`card-hover p-4 text-left transition-all ${i === activeTestimonial ? 'ring-2 ring-blue-500' : ''}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{t.name}</p>
                    <p className="text-xs text-gray-500 truncate">{t.role}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">{t.text}</p>
                <div className="flex gap-0.5 mt-2">
                  {Array(5).fill(0).map((_, j) => <Star key={j} size={10} className="text-amber-400 fill-amber-400" />)}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG ────────────────────────────────────────────── */}
      <section id="blog" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              <BookOpen size={14} /> Blog & Resources
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Learn From Our Experts
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Tutorials, career guides, and technical deep-dives written by industry professionals and toppers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <article key={blog.title} className="card-hover overflow-hidden group">
                {/* Thumbnail */}
                <div className="h-44 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
                  <span className="text-6xl group-hover:scale-110 transition-transform">{blog.emoji}</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[blog.category] || 'bg-gray-100 text-gray-700'}`}>
                    {blog.category}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                    <span className="flex items-center gap-1"><Clock size={11} />{blog.readTime}</span>
                    <span>{blog.date}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed line-clamp-2 mb-4">{blog.desc}</p>
                  <button className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                    Read Article <ChevronRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-10">
            <button className="btn-outline">View All Articles</button>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Everything you need to know about Future Bridge</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm pr-4">{faq.q}</span>
                  <ChevronDown size={18} className={`text-gray-400 flex-shrink-0 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-5 animate-slide-up">
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ─────────────────────────────────────────── */}
      <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              <Mail size={14} /> Get In Touch
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Let's Connect</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Whether you're a student with questions, a teacher wanting to join, or a company looking to post jobs — we're here to help!
                </p>
              </div>

              {[
                { icon: Mail, label: 'Email', value: 'support@futurebridge.com', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
                { icon: Phone, label: 'Phone', value: '+91 98765 43210', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
                { icon: MapPin, label: 'Address', value: 'SSBT College Campus, Jalgaon, Maharashtra', color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' },
                { icon: Clock, label: 'Support Hours', value: 'Mon - Sat: 9 AM to 6 PM', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{value}</p>
                  </div>
                </div>
              ))}

              {/* Social Links */}
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Follow Us</p>
                <div className="flex gap-3">
                  {[
                    { icon: Twitter, color: 'hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-500' },
                    { icon: Linkedin, color: 'hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-600' },
                    { icon: Github, color: 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white' },
                    { icon: Instagram, color: 'hover:bg-pink-100 dark:hover:bg-pink-900/20 hover:text-pink-600' },
                  ].map(({ icon: Icon, color }, i) => (
                    <button key={i} className={`w-10 h-10 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 transition-all ${color}`}>
                      <Icon size={17} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="card p-6">
                {contactSent ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Message Sent! 🎉</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">Your Name *</label>
                        <input value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="John Doe" className="input" required />
                      </div>
                      <div>
                        <label className="input-label">Email Address *</label>
                        <input type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="you@example.com" className="input" required />
                      </div>
                    </div>
                    <div>
                      <label className="input-label">Subject</label>
                      <input value={contactForm.subject} onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))}
                        placeholder="How can we help you?" className="input" />
                    </div>
                    <div>
                      <label className="input-label">Message *</label>
                      <textarea value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                        rows={5} placeholder="Tell us more about your inquiry..." className="input resize-none" required />
                    </div>
                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                      <Send size={16} /> Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-violet-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '25px 25px' }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Join 5000+ engineering students who are already learning smarter, coding better, and landing their dream jobs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-8 py-3.5 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-lg flex items-center justify-center gap-2">
              <GraduationCap size={18} /> Get Started Free
            </Link>
            <Link to="/login" className="px-8 py-3.5 bg-white/10 border border-white/30 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              Login to Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center">
                  <GraduationCap size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-display font-bold text-white text-sm">Future Bridge</p>
                  <p className="text-xs text-blue-400">Smart Education System</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-500 mb-4">
                Bridging the gap between academic learning and industry requirements for engineering students.
              </p>
              <div className="flex gap-2">
                {[Twitter, Linkedin, Github, Instagram].map((Icon, i) => (
                  <button key={i} className="w-8 h-8 bg-gray-800 hover:bg-blue-600 text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-all">
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Home', action: () => scrollTo('hero') },
                  { label: 'About Us', action: () => scrollTo('about') },
                  { label: 'Features', action: () => scrollTo('features') },
                  { label: 'Blog', action: () => scrollTo('blog') },
                  { label: 'Contact', action: () => scrollTo('contact') },
                ].map(({ label, action }) => (
                  <li key={label}>
                    <button onClick={action} className="text-sm text-gray-500 hover:text-blue-400 transition-colors">
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Students */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">For Students</h4>
              <ul className="space-y-2">
                {['SSBT Courses', 'DSA Sheet', 'Code Editor', 'AI Coach', 'Job Portal', 'Attendance Tracker'].map(item => (
                  <li key={item}>
                    <Link to="/register" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Teachers */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">For Teachers</h4>
              <ul className="space-y-2 mb-6">
                {['Create Courses', 'Upload Study Material', 'Mark Attendance', 'Grade Assignments', 'Forum & Discussion', 'Student Analytics'].map(item => (
                  <li key={item}>
                    <Link to="/register" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 text-center sm:text-left">
              © 2025 Future Bridge. All rights reserved. Made with ❤️ for SSBT Engineers.
            </p>
            <div className="flex gap-4 text-sm text-gray-600">
              <button className="hover:text-gray-400 transition-colors">Privacy Policy</button>
              <button className="hover:text-gray-400 transition-colors">Terms of Service</button>
              <button className="hover:text-gray-400 transition-colors">Cookie Policy</button>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
};

export default HomePage;
