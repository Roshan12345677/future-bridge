/**
 * Authentication Controller
 * With email validation, duplicate check, role restrictions
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/error');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const isAllowedEmailDomain = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  const blockedDomains = [
    'tempmail.com','throwaway.email','guerrillamail.com','mailinator.com',
    'yopmail.com','trashmail.com','fakeinbox.com','sharklasers.com',
    'spam4.me','trashmail.me','dispostable.com','maildrop.cc',
  ];
  if (blockedDomains.includes(domain)) return false;
  const parts = domain?.split('.');
  if (!parts || parts.length < 2) return false;
  const tld = parts[parts.length - 1];
  if (tld.length < 2) return false;
  return true;
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      skills: user.skills,
      enrolledCourses: user.enrolledCourses,
      createdAt: user.createdAt,
    },
  });
};

const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email and password', 400));
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2) return next(new AppError('Name must be at least 2 characters long', 400));
  if (trimmedName.length > 50) return next(new AppError('Name cannot exceed 50 characters', 400));
  if (!/^[a-zA-Z\s.\'-]+$/.test(trimmedName)) return next(new AppError('Name can only contain letters, spaces, dots and hyphens', 400));

  const trimmedEmail = email.trim().toLowerCase();
  if (!isValidEmail(trimmedEmail)) return next(new AppError('Please enter a valid email address (e.g. john@gmail.com)', 400));
  if (!isAllowedEmailDomain(trimmedEmail)) return next(new AppError('Please use a valid email. Temporary/disposable emails are not allowed', 400));

  if (password.length < 6) return next(new AppError('Password must be at least 6 characters long', 400));
  if (password.length > 50) return next(new AppError('Password cannot exceed 50 characters', 400));

  if (role === 'admin') return next(new AppError('Admin accounts cannot be created through registration', 403));

  const allowedRoles = ['student', 'teacher'];
  const userRole = allowedRoles.includes(role) ? role : 'student';

  const existingUser = await User.findOne({ email: trimmedEmail });
  if (existingUser) {
    return next(new AppError(`Email "${trimmedEmail}" is already registered. Please login or use a different email.`, 400));
  }

  const user = await User.create({
    name: trimmedName,
    email: trimmedEmail,
    password,
    role: userRole,
    isActive: true,
  });

  console.log(`New ${userRole} registered: ${trimmedEmail}`);
  sendTokenResponse(user, 201, res);
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new AppError('Please provide email and password', 400));

  const trimmedEmail = email.trim().toLowerCase();

  if (!isValidEmail(trimmedEmail)) return next(new AppError('Please enter a valid email address', 400));

  const user = await User.findOne({ email: trimmedEmail }).select('+password');

  if (!user) {
    return next(new AppError(`No account found with email "${trimmedEmail}". Please register first.`, 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact the administrator.', 401));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError('Incorrect password. Please try again.', 401));
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  console.log(`User logged in: ${trimmedEmail} (${user.role})`);
  sendTokenResponse(user, 200, res);
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('enrolledCourses', 'title thumbnail category level')
    .populate('solvedProblems', 'title difficulty topic');
  res.json({ success: true, user });
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = ['name', 'bio', 'skills', 'avatar'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });
  if (updates.name) {
    updates.name = updates.name.trim();
    if (updates.name.length < 2) return next(new AppError('Name must be at least 2 characters', 400));
  }
  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
  res.json({ success: true, user });
});

const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return next(new AppError('Please provide current and new password', 400));
  if (newPassword.length < 6) return next(new AppError('New password must be at least 6 characters', 400));
  if (currentPassword === newPassword) return next(new AppError('New password must be different from current password', 400));
  const user = await User.findById(req.user.id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return next(new AppError('Current password is incorrect', 400));
  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

const verifyToken = asyncHandler(async (req, res) => {
  res.json({ success: true, valid: true, user: req.user });
});

const checkEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError('Email is required', 400));
  const trimmedEmail = email.trim().toLowerCase();
  if (!isValidEmail(trimmedEmail)) return res.json({ success: true, available: false, message: 'Invalid email format' });
  if (!isAllowedEmailDomain(trimmedEmail)) return res.json({ success: true, available: false, message: 'Disposable emails not allowed' });
  const exists = await User.findOne({ email: trimmedEmail });
  res.json({
    success: true,
    available: !exists,
    message: exists ? 'Email already registered' : 'Email is available',
  });
});

module.exports = { register, login, getMe, updateProfile, changePassword, verifyToken, checkEmail };
