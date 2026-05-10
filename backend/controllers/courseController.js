/**
 * Course Controller
 */

const Course = require('../models/Course');
const { asyncHandler, AppError } = require('../middleware/error');

/**
 * @desc    Get all published courses
 * @route   GET /api/courses
 * @access  Public
 */
const getCourses = asyncHandler(async (req, res) => {
  const { category, level, search, page = 1, limit = 12 } = req.query;
  
  const query = { isPublished: true };
  if (category) query.category = category;
  if (level) query.level = level;
  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
    { tags: { $in: [new RegExp(search, 'i')] } },
  ];

  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('instructor', 'name avatar')
    .select('-lessons.content')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({
    success: true,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    courses,
  });
});

/**
 * @desc    Get single course
 * @route   GET /api/courses/:id
 * @access  Public
 */
const getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name avatar bio')
    .populate('enrolledStudents', 'name avatar');

  if (!course) return next(new AppError('Course not found', 404));

  res.json({ success: true, course });
});

/**
 * @desc    Create course (Teacher/Admin)
 * @route   POST /api/courses
 * @access  Private (Teacher, Admin)
 */
const createCourse = asyncHandler(async (req, res) => {
  req.body.instructor = req.user.id;
  const course = await Course.create(req.body);
  res.status(201).json({ success: true, course });
});

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private (Teacher owner, Admin)
 */
const updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));

  // Only instructor or admin can update
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this course', 403));
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, course });
});

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private (Teacher owner, Admin)
 */
const deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));

  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  await course.deleteOne();
  res.json({ success: true, message: 'Course deleted successfully' });
});

/**
 * @desc    Enroll in a course
 * @route   POST /api/courses/:id/enroll
 * @access  Private (Student)
 */
const enrollCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));
  if (!course.isPublished) return next(new AppError('Course not available', 400));

  if (course.enrolledStudents.includes(req.user.id)) {
    return next(new AppError('Already enrolled in this course', 400));
  }

  course.enrolledStudents.push(req.user.id);
  await course.save();

  // Update user's enrolled courses
  const User = require('../models/User');
  await User.findByIdAndUpdate(req.user.id, {
    $addToSet: { enrolledCourses: course._id },
  });

  res.json({ success: true, message: 'Successfully enrolled in course' });
});

/**
 * @desc    Get teacher's courses
 * @route   GET /api/courses/my-courses
 * @access  Private (Teacher)
 */
const getMyCourses = asyncHandler(async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .sort('-createdAt');

    res.json({ success: true, courses });
  } catch (error) {
    console.error('getMyCourses error:', error.message);
    res.json({ success: true, courses: [] });
  }
});

/**
 * @desc    Add lesson to course
 * @route   POST /api/courses/:id/lessons
 * @access  Private (Teacher)
 */
const addLesson = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));

  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  course.lessons.push(req.body);
  await course.save();

  res.status(201).json({ success: true, course });
});

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse, enrollCourse, getMyCourses, addLesson };
