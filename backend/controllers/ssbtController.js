/**
 * SSBT Course Controller
 * Handles engineering courses, subjects, notes, videos, papers, attendance
 */

const { SSBTCourse, AttendanceSession, AttendanceSummary } = require('../models/SSBTCourse');
const { asyncHandler, AppError } = require('../middleware/error');

// ══════════════════════════════════════════════════════════
//  SSBT COURSE MANAGEMENT
// ══════════════════════════════════════════════════════════

/**
 * @desc    Get all SSBT courses
 * @route   GET /api/ssbt/courses
 * @access  Public
 */
const getCourses = asyncHandler(async (req, res) => {
  const courses = await SSBTCourse.find({ isActive: true })
    .select('-semesters.subjects.notes -semesters.subjects.videoLectures -semesters.subjects.previousPapers')
    .populate('createdBy', 'name')
    .sort('name');

  res.json({ success: true, courses });
});

/**
 * @desc    Get single SSBT course with all details
 * @route   GET /api/ssbt/courses/:id
 * @access  Private
 */
const getCourse = asyncHandler(async (req, res, next) => {
  const course = await SSBTCourse.findById(req.params.id)
    .populate('createdBy', 'name')
    .populate('enrolledStudents.student', 'name email avatar')
    .populate('teachers.teacher', 'name email');

  if (!course) return next(new AppError('Course not found', 404));
  res.json({ success: true, course });
});

/**
 * @desc    Create SSBT course
 * @route   POST /api/ssbt/courses
 * @access  Private (Admin/Teacher)
 */
const createCourse = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user.id;
  const course = await SSBTCourse.create(req.body);
  res.status(201).json({ success: true, course });
});

/**
 * @desc    Update SSBT course
 * @route   PUT /api/ssbt/courses/:id
 * @access  Private (Admin/Teacher)
 */
const updateCourse = asyncHandler(async (req, res, next) => {
  const course = await SSBTCourse.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!course) return next(new AppError('Course not found', 404));
  res.json({ success: true, course });
});

/**
 * @desc    Delete SSBT course
 * @route   DELETE /api/ssbt/courses/:id
 * @access  Private (Admin)
 */
const deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await SSBTCourse.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));
  await course.deleteOne();
  res.json({ success: true, message: 'Course deleted' });
});

/**
 * @desc    Enroll student in SSBT course
 * @route   POST /api/ssbt/courses/:id/enroll
 * @access  Private (Student)
 */
const enrollStudent = asyncHandler(async (req, res, next) => {
  const course = await SSBTCourse.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));

  const alreadyEnrolled = course.enrolledStudents.some(
    e => e.student.toString() === req.user.id
  );
  if (alreadyEnrolled) return next(new AppError('Already enrolled', 400));

  course.enrolledStudents.push({
    student: req.user.id,
    currentSemester: req.body.currentSemester || 1,
    rollNumber: req.body.rollNumber || '',
    division: req.body.division || 'A',
    batch: req.body.batch || '',
  });

  await course.save();
  res.json({ success: true, message: 'Enrolled successfully!' });
});

// ══════════════════════════════════════════════════════════
//  SEMESTER & SUBJECT MANAGEMENT
// ══════════════════════════════════════════════════════════

/**
 * @desc    Get subjects for a semester
 * @route   GET /api/ssbt/courses/:id/semester/:sem
 * @access  Private
 */
const getSemesterSubjects = asyncHandler(async (req, res, next) => {
  const course = await SSBTCourse.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));

  const semester = course.semesters.find(s => s.semesterNumber === parseInt(req.params.sem));
  if (!semester) return next(new AppError('Semester not found', 404));

  res.json({ success: true, semester });
});

/**
 * @desc    Add semester to course
 * @route   POST /api/ssbt/courses/:id/semester
 * @access  Private (Admin/Teacher)
 */
const addSemester = asyncHandler(async (req, res, next) => {
  const course = await SSBTCourse.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));

  const exists = course.semesters.find(s => s.semesterNumber === req.body.semesterNumber);
  if (exists) return next(new AppError('Semester already exists', 400));

  course.semesters.push(req.body);
  course.semesters.sort((a, b) => a.semesterNumber - b.semesterNumber);
  await course.save();

  res.status(201).json({ success: true, course });
});

/**
 * @desc    Add subject to a semester
 * @route   POST /api/ssbt/courses/:id/semester/:sem/subject
 * @access  Private (Admin/Teacher)
 */
const addSubject = asyncHandler(async (req, res, next) => {
  const course = await SSBTCourse.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));

  const semIndex = course.semesters.findIndex(s => s.semesterNumber === parseInt(req.params.sem));
  if (semIndex === -1) return next(new AppError('Semester not found', 404));

  course.semesters[semIndex].subjects.push(req.body);
  await course.save();

  res.status(201).json({ success: true, semester: course.semesters[semIndex] });
});

// ══════════════════════════════════════════════════════════
//  NOTES MANAGEMENT
// ══════════════════════════════════════════════════════════

/**
 * @desc    Add note to subject
 * @route   POST /api/ssbt/courses/:id/semester/:sem/subject/:subId/notes
 * @access  Private (Teacher/Admin)
 */
const addNote = asyncHandler(async (req, res, next) => {
  const course = await SSBTCourse.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));

  const semester = course.semesters.find(s => s.semesterNumber === parseInt(req.params.sem));
  if (!semester) return next(new AppError('Semester not found', 404));

  const subject = semester.subjects.id(req.params.subId);
  if (!subject) return next(new AppError('Subject not found', 404));

  subject.notes.push({ ...req.body, uploadedBy: req.user.id });
  await course.save();

  res.status(201).json({ success: true, notes: subject.notes });
});

/**
 * @desc    Delete note
 * @route   DELETE /api/ssbt/courses/:id/semester/:sem/subject/:subId/notes/:noteId
 * @access  Private (Teacher/Admin)
 */
const deleteNote = asyncHandler(async (req, res, next) => {
  const course = await SSBTCourse.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));

  const semester = course.semesters.find(s => s.semesterNumber === parseInt(req.params.sem));
  const subject = semester?.subjects.id(req.params.subId);
  if (!subject) return next(new AppError('Subject not found', 404));

  subject.notes = subject.notes.filter(n => n._id.toString() !== req.params.noteId);
  await course.save();

  res.json({ success: true, message: 'Note deleted' });
});

// ══════════════════════════════════════════════════════════
//  VIDEO LECTURES
// ══════════════════════════════════════════════════════════

/**
 * @desc    Add video lecture
 * @route   POST /api/ssbt/courses/:id/semester/:sem/subject/:subId/videos
 * @access  Private (Teacher/Admin)
 */
const addVideo = asyncHandler(async (req, res, next) => {
  const course = await SSBTCourse.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));

  const semester = course.semesters.find(s => s.semesterNumber === parseInt(req.params.sem));
  const subject = semester?.subjects.id(req.params.subId);
  if (!subject) return next(new AppError('Subject not found', 404));

  subject.videoLectures.push({ ...req.body, uploadedBy: req.user.id });
  await course.save();

  res.status(201).json({ success: true, videos: subject.videoLectures });
});

/**
 * @desc    Delete video lecture
 * @route   DELETE /api/ssbt/courses/:id/semester/:sem/subject/:subId/videos/:videoId
 * @access  Private (Teacher/Admin)
 */
const deleteVideo = asyncHandler(async (req, res, next) => {
  const course = await SSBTCourse.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));

  const semester = course.semesters.find(s => s.semesterNumber === parseInt(req.params.sem));
  const subject = semester?.subjects.id(req.params.subId);
  if (!subject) return next(new AppError('Subject not found', 404));

  subject.videoLectures = subject.videoLectures.filter(v => v._id.toString() !== req.params.videoId);
  await course.save();

  res.json({ success: true, message: 'Video deleted' });
});

// ══════════════════════════════════════════════════════════
//  PREVIOUS YEAR PAPERS
// ══════════════════════════════════════════════════════════

/**
 * @desc    Add previous year paper
 * @route   POST /api/ssbt/courses/:id/semester/:sem/subject/:subId/papers
 * @access  Private (Teacher/Admin)
 */
const addPaper = asyncHandler(async (req, res, next) => {
  const course = await SSBTCourse.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));

  const semester = course.semesters.find(s => s.semesterNumber === parseInt(req.params.sem));
  const subject = semester?.subjects.id(req.params.subId);
  if (!subject) return next(new AppError('Subject not found', 404));

  subject.previousPapers.push({ ...req.body, uploadedBy: req.user.id });
  await course.save();

  res.status(201).json({ success: true, papers: subject.previousPapers });
});

/**
 * @desc    Delete paper
 * @route   DELETE /api/ssbt/courses/:id/semester/:sem/subject/:subId/papers/:paperId
 * @access  Private (Teacher/Admin)
 */
const deletePaper = asyncHandler(async (req, res, next) => {
  const course = await SSBTCourse.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));

  const semester = course.semesters.find(s => s.semesterNumber === parseInt(req.params.sem));
  const subject = semester?.subjects.id(req.params.subId);
  if (!subject) return next(new AppError('Subject not found', 404));

  subject.previousPapers = subject.previousPapers.filter(p => p._id.toString() !== req.params.paperId);
  await course.save();

  res.json({ success: true, message: 'Paper deleted' });
});

// ══════════════════════════════════════════════════════════
//  ATTENDANCE MANAGEMENT
// ══════════════════════════════════════════════════════════

/**
 * @desc    Create attendance session (Teacher marks attendance)
 * @route   POST /api/ssbt/attendance
 * @access  Private (Teacher)
 */
const createAttendanceSession = asyncHandler(async (req, res, next) => {
  const { courseId, subject, subjectCode, semester, division, batch, date, lectureType, topic, students } = req.body;

  // Validate course exists
  const course = await SSBTCourse.findById(courseId);
  if (!course) return next(new AppError('Course not found', 404));

  // Build attendance array
  const attendanceRecords = students.map(s => ({
    student: s.studentId,
    studentName: s.name,
    rollNumber: s.rollNumber,
    status: s.status || 'absent',
    remark: s.remark || '',
  }));

  const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
  const absentCount = attendanceRecords.filter(a => a.status === 'absent').length;

  const session = await AttendanceSession.create({
    course: courseId,
    subject,
    subjectCode,
    semester,
    division,
    batch,
    teacher: req.user.id,
    date: new Date(date),
    lectureType,
    topic,
    attendance: attendanceRecords,
    totalStudents: students.length,
    presentCount,
    absentCount,
    isFinalized: true,
  });

  // Update attendance summary for each student
  for (const record of attendanceRecords) {
    await AttendanceSummary.findOneAndUpdate(
      { student: record.student, course: courseId, subject, semester },
      {
        $inc: {
          totalClasses: 1,
          presentClasses: record.status === 'present' ? 1 : 0,
          absentClasses: record.status === 'absent' ? 1 : 0,
          lateClasses: record.status === 'late' ? 1 : 0,
        },
        subjectCode,
        batch,
      },
      { upsert: true, new: true }
    );

    // Recalculate percentage
    const summary = await AttendanceSummary.findOne({ student: record.student, course: courseId, subject });
    if (summary) {
      summary.attendancePercentage = Math.round((summary.presentClasses / summary.totalClasses) * 100);
      await summary.save();
    }
  }

  res.status(201).json({ success: true, session });
});

/**
 * @desc    Get attendance sessions (Teacher view)
 * @route   GET /api/ssbt/attendance/sessions
 * @access  Private (Teacher)
 */
const getAttendanceSessions = asyncHandler(async (req, res) => {
  const { courseId, subject, semester, date } = req.query;
  const query = { teacher: req.user.id };

  if (courseId) query.course = courseId;
  if (subject) query.subject = subject;
  if (semester) query.semester = parseInt(semester);
  if (date) {
    const d = new Date(date);
    query.date = { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(d.setHours(23,59,59,999)) };
  }

  const sessions = await AttendanceSession.find(query)
    .populate('course', 'name shortName')
    .sort('-date')
    .limit(50);

  res.json({ success: true, sessions });
});

/**
 * @desc    Get single attendance session details
 * @route   GET /api/ssbt/attendance/sessions/:id
 * @access  Private (Teacher)
 */
const getAttendanceSession = asyncHandler(async (req, res, next) => {
  const session = await AttendanceSession.findById(req.params.id)
    .populate('course', 'name shortName')
    .populate('attendance.student', 'name email avatar');

  if (!session) return next(new AppError('Session not found', 404));
  res.json({ success: true, session });
});

/**
 * @desc    Update attendance session (edit present/absent)
 * @route   PUT /api/ssbt/attendance/sessions/:id
 * @access  Private (Teacher)
 */
const updateAttendanceSession = asyncHandler(async (req, res, next) => {
  const session = await AttendanceSession.findById(req.params.id);
  if (!session) return next(new AppError('Session not found', 404));
  if (session.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  const { students, topic } = req.body;
  if (topic) session.topic = topic;

  if (students) {
    session.attendance = students.map(s => ({
      student: s.studentId,
      studentName: s.name,
      rollNumber: s.rollNumber,
      status: s.status,
      remark: s.remark || '',
    }));
    session.presentCount = session.attendance.filter(a => a.status === 'present').length;
    session.absentCount = session.attendance.filter(a => a.status === 'absent').length;
  }

  await session.save();
  res.json({ success: true, session });
});

/**
 * @desc    Get student's own attendance summary
 * @route   GET /api/ssbt/attendance/my-attendance
 * @access  Private (Student)
 */
const getMyAttendance = asyncHandler(async (req, res) => {
  const { courseId, semester } = req.query;
  const query = { student: req.user.id };
  if (courseId) query.course = courseId;
  if (semester) query.semester = parseInt(semester);

  const summaries = await AttendanceSummary.find(query)
    .populate('course', 'name shortName')
    .sort('subject');

  res.json({ success: true, summaries });
});

/**
 * @desc    Get all students' attendance for a subject (Teacher view)
 * @route   GET /api/ssbt/attendance/subject-report
 * @access  Private (Teacher)
 */
const getSubjectAttendanceReport = asyncHandler(async (req, res) => {
  const { courseId, subject, semester, batch } = req.query;
  const query = {};
  if (courseId) query.course = courseId;
  if (subject) query.subject = subject;
  if (semester) query.semester = parseInt(semester);
  if (batch) query.batch = batch;

  const summaries = await AttendanceSummary.find(query)
    .populate('student', 'name email avatar')
    .sort('student');

  // Mark students below 75% as shortage
  const report = summaries.map(s => ({
    ...s.toObject(),
    hasShortage: s.attendancePercentage < 75,
    status: s.attendancePercentage >= 75 ? 'good' : s.attendancePercentage >= 60 ? 'warning' : 'critical',
  }));

  res.json({ success: true, report });
});

/**
 * @desc    Get students list for taking attendance
 * @route   GET /api/ssbt/courses/:id/students
 * @access  Private (Teacher)
 */
const getCourseStudents = asyncHandler(async (req, res, next) => {
  const { semester, division, batch } = req.query;
  const course = await SSBTCourse.findById(req.params.id)
    .populate('enrolledStudents.student', 'name email avatar');

  if (!course) return next(new AppError('Course not found', 404));

  let students = course.enrolledStudents;
  if (semester) students = students.filter(s => s.currentSemester === parseInt(semester));
  if (division) students = students.filter(s => s.division === division);
  if (batch) students = students.filter(s => s.batch === batch);

  res.json({ success: true, students });
});

/**
 * @desc    Get attendance statistics for dashboard
 * @route   GET /api/ssbt/attendance/stats
 * @access  Private
 */
const getAttendanceStats = asyncHandler(async (req, res) => {
  if (req.user.role === 'student') {
    // Student stats - their own attendance
    const summaries = await AttendanceSummary.find({ student: req.user.id });
    const avgPercentage = summaries.length
      ? Math.round(summaries.reduce((a, s) => a + s.attendancePercentage, 0) / summaries.length)
      : 0;
    const shortage = summaries.filter(s => s.attendancePercentage < 75).length;

    return res.json({ success: true, stats: { totalSubjects: summaries.length, avgPercentage, shortage, summaries } });
  }

  // Teacher stats
  const sessions = await AttendanceSession.find({ teacher: req.user.id });
  const totalSessions = sessions.length;
  const avgAttendance = sessions.length
    ? Math.round(sessions.reduce((a, s) => a + (s.presentCount / (s.totalStudents || 1)) * 100, 0) / sessions.length)
    : 0;

  res.json({ success: true, stats: { totalSessions, avgAttendance } });
});

module.exports = {
  getCourses, getCourse, createCourse, updateCourse, deleteCourse, enrollStudent,
  getSemesterSubjects, addSemester, addSubject,
  addNote, deleteNote,
  addVideo, deleteVideo,
  addPaper, deletePaper,
  createAttendanceSession, getAttendanceSessions, getAttendanceSession,
  updateAttendanceSession, getMyAttendance, getSubjectAttendanceReport,
  getCourseStudents, getAttendanceStats,
};
