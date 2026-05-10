/**
 * Task Controller
 */

const { Task, Job, ChatMessage, DSAProblem, DSAProgress, Assignment } = require('../models/index');
const { asyncHandler, AppError } = require('../middleware/error');

// ==================== TASK CONTROLLER ====================

const getTasks = asyncHandler(async (req, res) => {
  const { status, priority } = req.query;
  const query = { user: req.user.id };
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const tasks = await Task.find(query).sort('-createdAt');
  res.json({ success: true, tasks });
});

const createTask = asyncHandler(async (req, res) => {
  req.body.user = req.user.id;
  const task = await Task.create(req.body);
  res.status(201).json({ success: true, task });
});

const updateTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);
  if (!task) return next(new AppError('Task not found', 404));
  if (task.user.toString() !== req.user.id) return next(new AppError('Not authorized', 403));

  task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, task });
});

const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) return next(new AppError('Task not found', 404));
  if (task.user.toString() !== req.user.id) return next(new AppError('Not authorized', 403));
  await task.deleteOne();
  res.json({ success: true, message: 'Task deleted' });
});

const getTaskStats = asyncHandler(async (req, res) => {
  const stats = await Task.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  res.json({ success: true, stats });
});

// ==================== JOB CONTROLLER ====================

const getJobs = asyncHandler(async (req, res) => {
  const { type, category, search, page = 1, limit = 10 } = req.query;
  const query = { isActive: true };
  if (type) query.type = type;
  if (category) query.category = category;
  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { company: { $regex: search, $options: 'i' } },
    { skills: { $in: [new RegExp(search, 'i')] } },
  ];

  const total = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .populate('postedBy', 'name')
    .select('-applicants')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({ success: true, total, jobs });
});

const getJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id).populate('postedBy', 'name avatar');
  if (!job) return next(new AppError('Job not found', 404));
  res.json({ success: true, job });
});

const createJob = asyncHandler(async (req, res) => {
  req.body.postedBy = req.user.id;
  const job = await Job.create(req.body);
  res.status(201).json({ success: true, job });
});

const updateJob = asyncHandler(async (req, res, next) => {
  let job = await Job.findById(req.params.id);
  if (!job) return next(new AppError('Job not found', 404));
  job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, job });
});

const deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) return next(new AppError('Job not found', 404));
  await job.deleteOne();
  res.json({ success: true, message: 'Job deleted' });
});

const applyJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) return next(new AppError('Job not found', 404));
  if (!job.isActive) return next(new AppError('Job posting is closed', 400));

  const alreadyApplied = job.applicants.some((a) => a.user.toString() === req.user.id);
  if (alreadyApplied) return next(new AppError('Already applied to this job', 400));

  job.applicants.push({ user: req.user.id, ...req.body });
  await job.save();
  res.json({ success: true, message: 'Application submitted successfully' });
});

// ==================== DSA CONTROLLER ====================

const getDSAProblems = asyncHandler(async (req, res) => {
  const { topic, difficulty, company, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (topic) query.topic = topic;
  if (difficulty) query.difficulty = difficulty;
  if (company) query.companies = { $in: [new RegExp(company, 'i')] };
  if (search) query.title = { $regex: search, $options: 'i' };

  const total = await DSAProblem.countDocuments(query);
  const problems = await DSAProblem.find(query)
    .sort('order')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  // Get user progress if authenticated
  let progressMap = {};
  if (req.user) {
    const progress = await DSAProgress.find({ user: req.user.id });
    progress.forEach((p) => {
      progressMap[p.problem.toString()] = p.status;
    });
  }

  const problemsWithProgress = problems.map((p) => ({
    ...p.toObject(),
    userStatus: progressMap[p._id.toString()] || 'unsolved',
  }));

  res.json({ success: true, total, problems: problemsWithProgress });
});

const getDSAProblem = asyncHandler(async (req, res, next) => {
  const problem = await DSAProblem.findOne({ slug: req.params.slug });
  if (!problem) return next(new AppError('Problem not found', 404));

  let progress = null;
  if (req.user) {
    progress = await DSAProgress.findOne({ user: req.user.id, problem: problem._id });
  }

  res.json({ success: true, problem, progress });
});

const updateDSAProgress = asyncHandler(async (req, res) => {
  const { problemId, status, notes, solution, language } = req.body;

  const progress = await DSAProgress.findOneAndUpdate(
    { user: req.user.id, problem: problemId },
    {
      status,
      notes,
      solution,
      language,
      ...(status === 'solved' && { solvedAt: new Date() }),
      $inc: { attempts: 1 },
    },
    { upsert: true, new: true }
  );

  res.json({ success: true, progress });
});

const getDSAStats = asyncHandler(async (req, res) => {
  const stats = await DSAProgress.aggregate([
    { $match: { user: req.user._id, status: 'solved' } },
    {
      $lookup: {
        from: 'dsaproblems',
        localField: 'problem',
        foreignField: '_id',
        as: 'problemData',
      },
    },
    { $unwind: '$problemData' },
    {
      $group: {
        _id: '$problemData.difficulty',
        count: { $sum: 1 },
      },
    },
  ]);
  res.json({ success: true, stats });
});

const createDSAProblem = asyncHandler(async (req, res) => {
  // Auto-generate slug
  req.body.slug = req.body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const problem = await DSAProblem.create(req.body);
  res.status(201).json({ success: true, problem });
});

// ==================== CHAT CONTROLLER ====================

const getChatMessages = asyncHandler(async (req, res) => {
  const { room = 'general', page = 1, limit = 50 } = req.query;

  const messages = await ChatMessage.find({ room, isDeleted: false })
    .populate('sender', 'name avatar role')
    .populate('replyTo', 'message sender')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({ success: true, messages: messages.reverse() });
});

const sendMessage = asyncHandler(async (req, res) => {
  req.body.sender = req.user.id;
  const message = await ChatMessage.create(req.body);
  await message.populate('sender', 'name avatar role');

  // Emit to socket room
  const io = req.app.get('io');
  if (io) {
    io.to(message.room).emit('newMessage', message);
  }

  res.status(201).json({ success: true, message });
});

const deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await ChatMessage.findById(req.params.id);
  if (!message) return next(new AppError('Message not found', 404));

  if (message.sender.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  message.isDeleted = true;
  await message.save();
  res.json({ success: true, message: 'Message deleted' });
});

// ==================== ASSIGNMENT CONTROLLER ====================

const getAssignments = asyncHandler(async (req, res) => {
  try {
    const query = req.user.role === 'teacher' ? { teacher: req.user.id } : { isPublished: true };
    const assignments = await Assignment.find(query)
      .populate('teacher', 'name')
      .populate('course', 'title')
      .sort('-createdAt');
    res.json({ success: true, assignments });
  } catch (error) {
    console.error('getAssignments error:', error.message);
    res.json({ success: true, assignments: [] });
  }
});

const createAssignment = asyncHandler(async (req, res) => {
  req.body.teacher = req.user.id;
  const assignment = await Assignment.create(req.body);
  res.status(201).json({ success: true, assignment });
});

const submitAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return next(new AppError('Assignment not found', 404));

  const alreadySubmitted = assignment.submissions.some((s) => s.student.toString() === req.user.id);
  if (alreadySubmitted) return next(new AppError('Already submitted', 400));

  assignment.submissions.push({ student: req.user.id, ...req.body });
  await assignment.save();
  res.json({ success: true, message: 'Assignment submitted successfully' });
});

const gradeAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return next(new AppError('Assignment not found', 404));

  const submission = assignment.submissions.id(req.params.submissionId);
  if (!submission) return next(new AppError('Submission not found', 404));

  submission.score = req.body.score;
  submission.feedback = req.body.feedback;
  submission.status = 'graded';
  await assignment.save();

  res.json({ success: true, message: 'Assignment graded' });
});

module.exports = {
  getTasks, createTask, updateTask, deleteTask, getTaskStats,
  getJobs, getJob, createJob, updateJob, deleteJob, applyJob,
  getDSAProblems, getDSAProblem, updateDSAProgress, getDSAStats, createDSAProblem,
  getChatMessages, sendMessage, deleteMessage,
  getAssignments, createAssignment, submitAssignment, gradeAssignment,
};
