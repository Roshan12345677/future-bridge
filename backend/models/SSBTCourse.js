/**
 * SSBT Academic Courses Models
 * Engineering courses, subjects, notes, videos, syllabus, papers, attendance
 */

const mongoose = require('mongoose');

// ── Subject Schema (embedded in Course) ─────────────────────────────
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  fileUrl: String,       // Google Drive / external link
  unit: String,          // Unit 1, Unit 2 etc
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
});

const videoLectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  youtubeUrl: String,    // YouTube embed link
  externalUrl: String,   // Any other video link
  professorName: String,
  duration: String,      // e.g. "45 mins"
  unit: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
});

const previousPaperSchema = new mongoose.Schema({
  title: { type: String, required: true },   // e.g. "May 2023 University Exam"
  year: { type: Number, required: true },
  examType: {
    type: String,
    enum: ['university', 'internal', 'mid-sem', 'practical'],
    default: 'university',
  },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
});

const syllabusSchema = new mongoose.Schema({
  fileUrl: String,
  description: String,
  units: [
    {
      unitNumber: Number,
      title: String,
      topics: [String],
      hours: Number,
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },           // e.g. "Engineering Mathematics I"
  code: { type: String, required: true },           // e.g. "BTMA101"
  credits: { type: Number, default: 4 },
  type: {
    type: String,
    enum: ['theory', 'practical', 'elective', 'project'],
    default: 'theory',
  },
  professorName: String,
  professorEmail: String,
  syllabus: syllabusSchema,
  notes: [noteSchema],
  videoLectures: [videoLectureSchema],
  previousPapers: [previousPaperSchema],
  order: { type: Number, default: 0 },
});

// ── SSBT Course Schema ───────────────────────────────────────────────
const ssbtCourseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },          // e.g. "Computer Engineering"
    shortName: { type: String, required: true },     // e.g. "CE"
    description: String,
    duration: { type: Number, default: 4 },          // 4 years
    totalSemesters: { type: Number, default: 8 },
    thumbnail: String,
    color: { type: String, default: 'from-blue-500 to-violet-600' },
    icon: { type: String, default: '💻' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Semesters with subjects
    semesters: [
      {
        semesterNumber: { type: Number, required: true },  // 1-8
        year: { type: Number, required: true },            // 1-4
        subjects: [subjectSchema],
      },
    ],

    // Enrolled students
    enrolledStudents: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        enrolledAt: { type: Date, default: Date.now },
        currentSemester: { type: Number, default: 1 },
        rollNumber: String,
        division: String,     // A, B, C
        batch: String,        // e.g. "2021-2025"
      },
    ],

    // Teachers assigned
    teachers: [
      {
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        subject: String,
        semester: Number,
      },
    ],
  },
  { timestamps: true }
);

const SSBTCourse = mongoose.model('SSBTCourse', ssbtCourseSchema);

// ── Attendance Schema ────────────────────────────────────────────────
const attendanceSessionSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'SSBTCourse', required: true },
    subject: { type: String, required: true },        // Subject name
    subjectCode: String,
    semester: { type: Number, required: true },
    division: String,                                  // A, B, C
    batch: String,                                     // e.g. "2021-2025"
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    lectureType: {
      type: String,
      enum: ['lecture', 'practical', 'tutorial'],
      default: 'lecture',
    },
    topic: String,                                     // Topic taught that day

    // Attendance records for each student
    attendance: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        studentName: String,
        rollNumber: String,
        status: {
          type: String,
          enum: ['present', 'absent', 'late', 'excused'],
          default: 'absent',
        },
        remark: String,
      },
    ],

    totalStudents: { type: Number, default: 0 },
    presentCount: { type: Number, default: 0 },
    absentCount: { type: Number, default: 0 },
    isFinalized: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);

// ── Student Attendance Summary (aggregated per student per subject) ──
const attendanceSummarySchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'SSBTCourse', required: true },
    subject: { type: String, required: true },
    subjectCode: String,
    semester: Number,
    batch: String,
    totalClasses: { type: Number, default: 0 },
    presentClasses: { type: Number, default: 0 },
    absentClasses: { type: Number, default: 0 },
    lateClasses: { type: Number, default: 0 },
    attendancePercentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

attendanceSummarySchema.index({ student: 1, course: 1, subject: 1 }, { unique: true });

const AttendanceSummary = mongoose.model('AttendanceSummary', attendanceSummarySchema);

module.exports = { SSBTCourse, AttendanceSession, AttendanceSummary };
