/**
 * Task Model
 */

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: { type: String, maxlength: [1000] },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'completed'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: Date,
    tags: [String],
    completedAt: Date,
  },
  { timestamps: true }
);

// Auto-set completedAt when status changes
taskSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.completedAt = new Date();
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);

/**
 * Job Model
 */
const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'contract', 'remote'],
      default: 'full-time',
    },
    description: { type: String, required: true },
    requirements: [String],
    salary: { type: String },
    skills: [String],
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    applicants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        appliedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['pending', 'reviewed', 'accepted', 'rejected'], default: 'pending' },
        resumeUrl: String,
        coverLetter: String,
      },
    ],
    deadline: Date,
    isActive: { type: Boolean, default: true },
    category: {
      type: String,
      enum: ['software', 'data', 'design', 'marketing', 'finance', 'other'],
      default: 'software',
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead'],
      default: 'entry',
    },
  },
  { timestamps: true }
);

const Job = mongoose.model('Job', jobSchema);

/**
 * Chat Message Model
 */
const chatMessageSchema = new mongoose.Schema(
  {
    room: { type: String, required: true, default: 'general' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, maxlength: 2000 },
    messageType: {
      type: String,
      enum: ['text', 'code', 'image', 'file'],
      default: 'text',
    },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage' },
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: String,
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

/**
 * DSA Problem Model
 */
const dsaProblemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    topic: {
      type: String,
      enum: [
        'array', 'string', 'linked-list', 'tree', 'graph', 'dynamic-programming',
        'binary-search', 'sorting', 'recursion', 'stack', 'queue', 'heap',
        'hash-map', 'two-pointers', 'sliding-window', 'backtracking', 'greedy', 'math'
      ],
      required: true,
    },
    companies: [String],
    description: { type: String, required: true },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    constraints: [String],
    hints: [String],
    solutionApproach: String,
    timeComplexity: String,
    spaceComplexity: String,
    leetcodeUrl: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const DSAProblem = mongoose.model('DSAProblem', dsaProblemSchema);

/**
 * DSA Progress Model (per user)
 */
const dsaProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'DSAProblem', required: true },
    status: {
      type: String,
      enum: ['unsolved', 'attempted', 'solved', 'bookmarked'],
      default: 'unsolved',
    },
    notes: String,
    solution: String,
    language: String,
    solvedAt: Date,
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

dsaProgressSchema.index({ user: 1, problem: 1 }, { unique: true });

const DSAProgress = mongoose.model('DSAProgress', dsaProgressSchema);

/**
 * Assignment Model
 */
const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    maxScore: { type: Number, default: 100 },
    submissions: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: String,
        fileUrl: String,
        submittedAt: { type: Date, default: Date.now },
        score: Number,
        feedback: String,
        status: { type: String, enum: ['pending', 'graded'], default: 'pending' },
      },
    ],
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = { Task, Job, ChatMessage, DSAProblem, DSAProgress, Assignment };
