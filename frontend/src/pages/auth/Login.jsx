import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Zap, GraduationCap, Mail, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(form.email.trim())) {
      newErrors.email = 'Please enter a valid email (e.g. john@gmail.com)';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email.trim().toLowerCase(), form.password);
      const redirects = { student: '/student', teacher: '/teacher', admin: '/admin' };
      navigate(redirects[user.role] || '/student');
    } catch (err) {
      toast.error(err.message || 'Login failed');
      if (err.message?.includes('password')) {
        setErrors(e => ({ ...e, password: 'Incorrect password' }));
      } else if (err.message?.includes('email') || err.message?.includes('account')) {
        setErrors(e => ({ ...e, email: err.message }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-violet-950 flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-blue">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Future Bridge</h1>
          <p className="text-blue-300 mt-1">Smart Education System</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl animate-slide-up"
          style={{ animationDelay: '0.1s' }}>

          <h2 className="text-xl font-semibold text-white mb-6">Welcome back 👋</h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`w-full bg-white/10 border rounded-xl px-4 py-2.5 pl-9 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-400/60' : 'border-white/20'
                  }`}
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-xs">{errors.email}</p>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full bg-white/10 border rounded-xl px-4 py-2.5 pl-9 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-11 transition-all ${
                    errors.password ? 'border-red-400/60' : 'border-white/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-xs">{errors.password}</p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-violet-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-glow-blue mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Zap size={16} /> Sign In</>
              )}
            </button>
          </form>

          <p className="text-center text-white/60 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;