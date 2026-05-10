/**
 * SSBT Academic Course Routes
 */

const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  getCourses, getCourse, createCourse, updateCourse, deleteCourse, enrollStudent,
  getSemesterSubjects, addSemester, addSubject,
  addNote, deleteNote,
  addVideo, deleteVideo,
  addPaper, deletePaper,
  createAttendanceSession, getAttendanceSessions, getAttendanceSession,
  updateAttendanceSession, getMyAttendance, getSubjectAttendanceReport,
  getCourseStudents, getAttendanceStats,
} = require('../controllers/ssbtController');

// ── Course Routes ──────────────────────────────────────────
router.get('/courses', optionalAuth, getCourses);
router.get('/courses/:id', protect, getCourse);
router.post('/courses', protect, authorize('admin', 'teacher'), createCourse);
router.put('/courses/:id', protect, authorize('admin', 'teacher'), updateCourse);
router.delete('/courses/:id', protect, authorize('admin'), deleteCourse);
router.post('/courses/:id/enroll', protect, authorize('student'), enrollStudent);
router.get('/courses/:id/students', protect, authorize('teacher', 'admin'), getCourseStudents);

// ── Semester & Subject Routes ──────────────────────────────
router.get('/courses/:id/semester/:sem', protect, getSemesterSubjects);
router.post('/courses/:id/semester', protect, authorize('admin', 'teacher'), addSemester);
router.post('/courses/:id/semester/:sem/subject', protect, authorize('admin', 'teacher'), addSubject);

// ── Notes Routes ───────────────────────────────────────────
router.post('/courses/:id/semester/:sem/subject/:subId/notes', protect, authorize('admin', 'teacher'), addNote);
router.delete('/courses/:id/semester/:sem/subject/:subId/notes/:noteId', protect, authorize('admin', 'teacher'), deleteNote);

// ── Video Lecture Routes ───────────────────────────────────
router.post('/courses/:id/semester/:sem/subject/:subId/videos', protect, authorize('admin', 'teacher'), addVideo);
router.delete('/courses/:id/semester/:sem/subject/:subId/videos/:videoId', protect, authorize('admin', 'teacher'), deleteVideo);

// ── Previous Papers Routes ─────────────────────────────────
router.post('/courses/:id/semester/:sem/subject/:subId/papers', protect, authorize('admin', 'teacher'), addPaper);
router.delete('/courses/:id/semester/:sem/subject/:subId/papers/:paperId', protect, authorize('admin', 'teacher'), deletePaper);

// ── Attendance Routes ──────────────────────────────────────
router.get('/attendance/stats', protect, getAttendanceStats);
router.get('/attendance/my-attendance', protect, authorize('student'), getMyAttendance);
router.get('/attendance/subject-report', protect, authorize('teacher', 'admin'), getSubjectAttendanceReport);
router.get('/attendance/sessions', protect, authorize('teacher', 'admin'), getAttendanceSessions);
router.get('/attendance/sessions/:id', protect, getAttendanceSession);
router.post('/attendance', protect, authorize('teacher', 'admin'), createAttendanceSession);
router.put('/attendance/sessions/:id', protect, authorize('teacher', 'admin'), updateAttendanceSession);

module.exports = router;
