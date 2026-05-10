/**
 * Users Controller - Admin Management
 */

const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/error');

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/users
 */
const getUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({ success: true, total, users });
});

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 */
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('enrolledCourses', 'title category thumbnail');
  if (!user) return next(new AppError('User not found', 404));
  res.json({ success: true, user });
});

/**
 * @desc    Update user (Admin)
 * @route   PUT /api/users/:id
 */
const updateUser = asyncHandler(async (req, res, next) => {
  const allowedFields = ['name', 'email', 'role', 'isActive', 'bio', 'skills'];
  const updates = {};
  allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
  if (!user) return next(new AppError('User not found', 404));
  res.json({ success: true, user });
});

/**
 * @desc    Delete user (Admin)
 * @route   DELETE /api/users/:id
 */
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));
  if (user._id.toString() === req.user.id) return next(new AppError('Cannot delete your own account', 400));
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});

/**
 * @desc    Get platform stats (Admin)
 * @route   GET /api/users/stats
 */
const getPlatformStats = asyncHandler(async (req, res) => {
  const Course = require('../models/Course');
  const { Job, Task, ChatMessage, DSAProgress } = require('../models/index');

  const [
    totalUsers, students, teachers, admins,
    totalCourses, publishedCourses,
    totalJobs, activeJobs,
    totalMessages,
    solvedProblems,
    recentUsers
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'teacher' }),
    User.countDocuments({ role: 'admin' }),
    Course.countDocuments(),
    Course.countDocuments({ isPublished: true }),
    Job.countDocuments(),
    Job.countDocuments({ isActive: true }),
    ChatMessage.countDocuments({ isDeleted: false }),
    DSAProgress.countDocuments({ status: 'solved' }),
    User.find().sort('-createdAt').limit(5).select('name email role createdAt avatar'),
  ]);

  res.json({
    success: true,
    stats: {
      users: { total: totalUsers, students, teachers, admins },
      courses: { total: totalCourses, published: publishedCourses },
      jobs: { total: totalJobs, active: activeJobs },
      messages: totalMessages,
      solvedProblems,
    },
    recentUsers,
  });
});

/**
 * @desc    Toggle user active status
 * @route   PATCH /api/users/:id/toggle-status
 */
const toggleUserStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
});

module.exports = { getUsers, getUser, updateUser, deleteUser, getPlatformStats, toggleUserStatus };
