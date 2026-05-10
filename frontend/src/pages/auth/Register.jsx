import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, GraduationCap, BookOpen, Mail, Lock, User, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const roles = [
  { value: 'student', label: 'Student', desc: 'Learn, code & grow', icon: GraduationCap },
  { value: 'teacher', label: 'Teacher', desc: 'Create & share knowledge', icon: BookOpen },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailStatus, setEmailStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [emailCheckTimer, setEmailCheckTimer] = useState(null);

  const validate = () => {
    const newErrors = {};

    // Name
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Full name is required';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s.\'-]+$/.test(trimmedName)) {
      newErrors.name = 'Name can only contain letters, spaces, dots and hyphens';
    }

    // Email
    const trimmedEmail = form.email.trim().toLowerCase();
    if (!trimmedEmail) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email (e.g. john@gmail.com)';
    } else if (emailStatus === 'taken') {
      newErrors.email = 'This email is already registered. Please login.';
    } else if (emailStatus === 'invalid') {
      newErrors.email = 'Please use a valid email address';
    }

    // Password
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (form.password.length > 50) {
      newErrors.password = 'Password cannot exceed 50 characters';
    } else if (!/(?=.*[a-zA-Z])/.test(form.password)) {
      newErrors.password = 'Password must contain at least one letter';
    }

    // Confirm Password
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real-time email check with debounce
  const checkEmailAvailability = useCallback(async (email) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !isValidEmail(trimmed)) {
      setEmailStatus(null);
      return;
    }

    setEmailStatus('checking');
    try {
      const data = await authAPI.checkEmail({ email: trimmed });
      if (data.available) {
        setEmailStatus('available');
      } else if (data.message === 'Invalid email format' || data.message === 'Disposable emails not allowed') {
        setEmailStatus('invalid');
      } else {
        setEmailStatus('taken');
      }
    } catch (e) {
      setEmailStatus(null);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));

    // Debounced email check
    if (name === 'email') {
      setEmailStatus(null);
      clearTimeout(emailCheckTimer);
      if (value.length > 5) {
        const timer = setTimeout(() => checkEmailAvailability(value), 700);
        setEmailCheckTimer(timer);
      }
    }

    // Live password match check
    if (name === 'confirmPassword' && errors.confirmPassword) {
      if (value === form.password) setErrors(e => ({ ...e, confirmPassword: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors below');
      return;
    }
    if (emailStatus === 'checking') {
      toast.error('Please wait while we verify your email');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });
      navigate(`/${user.role}`);
    } catch (err) {
      const message = err.message || 'Registration failed';
      toast.error(message);
      if (message.toLowerCase().includes('email')) {
        setErrors(e => ({ ...e, email: message }));
        setEmailStatus('taken');
      } else if (message.toLowerCase().includes('name')) {
        setErrors(e => ({ ...e, name: message }));
      } else if (message.toLowerCase().includes('password')) {
        setErrors(e => ({ ...e, password: message }));
      }
    } finally {
      setLoading(false);
    }
  };

  const getEmailIcon = () => {
    if (emailStatus === 'checking') return <Loader2 size={14} className="text-blue-400 animate-spin" />;
    if (emailStatus === 'available') return <CheckCircle2 size={14} className="text-green-400" />;
    if (emailStatus === 'taken' || emailStatus === 'invalid') return <AlertCircle size={14} className="text-red-400" />;
    return null;
  };

  const getPasswordStrength = () => {
    const pwd = form.password;
    if (!pwd) return null;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '20%' };
    if (score <= 2) return { label: 'Fair', color: 'bg-yellow-500', width: '40%' };
    if (score <= 3) return { label: 'Good', color: 'bg-blue-500', width: '65%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-violet-950 flex items-center justify-center p-4 py-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 animate-slide-up">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-glow-violet">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Join Future Bridge</h1>
          <p className="text-blue-300 text-sm mt-0.5">Start your learning journey today</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-7 shadow-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {roles.map(({ value, label, desc, icon: Icon }) => (
              <button key={value} type="button" onClick={() => setForm(f => ({ ...f, role: value }))}
                className={clsx('p-3 rounded-xl border text-left transition-all duration-200',
                  form.role === value ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'
                )}>
                <Icon size={18} className={form.role === value ? 'text-blue-400' : 'text-white/50'} />
                <p className={clsx('text-sm font-medium mt-1.5', form.role === value ? 'text-white' : 'text-white/70')}>{label}</p>
                <p className="text-xs text-white/40 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Full Name *</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="John Doe"
                  className={clsx('w-full bg-white/10 border rounded-xl px-4 py-2.5 pl-9 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm',
                    errors.name ? 'border-red-400/60' : 'border-white/20')} />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@gmail.com"
                  autoComplete="email"
                  className={clsx('w-full bg-white/10 border rounded-xl px-4 py-2.5 pl-9 pr-9 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm',
                    errors.email || emailStatus === 'taken' ? 'border-red-400/60' :
                    emailStatus === 'available' ? 'border-green-400/60' : 'border-white/20')} />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">{getEmailIcon()}</div>
              </div>
              {/* Email status messages */}
              {emailStatus === 'available' && !errors.email && (
                <p className="text-green-400 text-xs mt-1 flex items-center gap-1"><CheckCircle2 size={11} />Email is available</p>
              )}
              {emailStatus === 'taken' && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />Email already registered. <Link to="/login" className="underline">Login instead?</Link></p>
              )}
              {emailStatus === 'invalid' && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />Please use a valid email address</p>
              )}
              {errors.email && emailStatus !== 'taken' && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Password *</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder="Min 6 characters"
                  className={clsx('w-full bg-white/10 border rounded-xl px-4 py-2.5 pl-9 pr-11 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm',
                    errors.password ? 'border-red-400/60' : 'border-white/20')} />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {/* Password strength indicator */}
              {strength && (
                <div className="mt-1.5">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} rounded-full transition-all duration-300`} style={{ width: strength.width }} />
                  </div>
                  <p className={clsx('text-xs mt-0.5',
                    strength.label === 'Weak' ? 'text-red-400' :
                    strength.label === 'Fair' ? 'text-yellow-400' :
                    strength.label === 'Good' ? 'text-blue-400' : 'text-green-400'
                  )}>{strength.label} password</p>
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Confirm Password *</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                  placeholder="Re-enter password"
                  className={clsx('w-full bg-white/10 border rounded-xl px-4 py-2.5 pl-9 pr-11 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm',
                    errors.confirmPassword ? 'border-red-400/60' :
                    form.confirmPassword && form.confirmPassword === form.password ? 'border-green-400/60' : 'border-white/20')} />
                <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {form.confirmPassword && form.confirmPassword === form.password && !errors.confirmPassword && (
                <p className="text-green-400 text-xs mt-1 flex items-center gap-1"><CheckCircle2 size={11} />Passwords match</p>
              )}
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={loading || emailStatus === 'taken' || emailStatus === 'checking'}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-glow-blue mt-2 text-sm">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating Account...</> : 'Create Account 🚀'}
            </button>
          </form>

          <p className="text-center text-white/60 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
