/**
 * SSBT Courses Seeder
 * Run: node utils/ssbtSeeder.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const { SSBTCourse } = require('../models/SSBTCourse');
const User = require('../models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected...');
};

const engineeringCourses = [
  {
    name: 'Computer Engineering',
    shortName: 'CE',
    description: 'Bachelor of Engineering in Computer Engineering — 4 years, 8 semesters. Covers programming, algorithms, databases, networks, AI and software engineering.',
    duration: 4,
    totalSemesters: 8,
    color: 'from-blue-500 to-violet-600',
    icon: '💻',
    semesters: [
      {
        semesterNumber: 1, year: 1,
        subjects: [
          { name: 'Engineering Mathematics I', code: 'BTMA101', credits: 4, type: 'theory', professorName: 'Dr. R. K. Sharma', order: 1 },
          { name: 'Engineering Physics', code: 'BTPH101', credits: 4, type: 'theory', professorName: 'Dr. S. Patel', order: 2 },
          { name: 'Basic Electrical Engineering', code: 'BTEE101', credits: 3, type: 'theory', professorName: 'Prof. A. Gupta', order: 3 },
          { name: 'Engineering Graphics', code: 'BTME101', credits: 3, type: 'practical', professorName: 'Prof. M. Singh', order: 4 },
          { name: 'Programming in C', code: 'BTCS101', credits: 4, type: 'theory', professorName: 'Prof. K. Verma', order: 5 },
          { name: 'Communication Skills', code: 'BTHS101', credits: 2, type: 'theory', professorName: 'Prof. N. Joshi', order: 6 },
        ],
      },
      {
        semesterNumber: 2, year: 1,
        subjects: [
          { name: 'Engineering Mathematics II', code: 'BTMA201', credits: 4, type: 'theory', professorName: 'Dr. R. K. Sharma', order: 1 },
          { name: 'Engineering Chemistry', code: 'BTCH201', credits: 4, type: 'theory', professorName: 'Dr. P. Mehta', order: 2 },
          { name: 'Data Structures', code: 'BTCS201', credits: 4, type: 'theory', professorName: 'Prof. K. Verma', order: 3 },
          { name: 'Digital Logic Design', code: 'BTCS202', credits: 3, type: 'theory', professorName: 'Prof. R. Kumar', order: 4 },
          { name: 'Object Oriented Programming (Java)', code: 'BTCS203', credits: 4, type: 'theory', professorName: 'Prof. S. Mishra', order: 5 },
          { name: 'Workshop Practice', code: 'BTME201', credits: 2, type: 'practical', professorName: 'Prof. D. Rao', order: 6 },
        ],
      },
      {
        semesterNumber: 3, year: 2,
        subjects: [
          { name: 'Discrete Mathematics', code: 'BTMA301', credits: 4, type: 'theory', professorName: 'Dr. A. Tiwari', order: 1 },
          { name: 'Computer Organization & Architecture', code: 'BTCS301', credits: 4, type: 'theory', professorName: 'Prof. R. Kumar', order: 2 },
          { name: 'Database Management System', code: 'BTCS302', credits: 4, type: 'theory', professorName: 'Prof. V. Saxena', order: 3 },
          { name: 'Operating Systems', code: 'BTCS303', credits: 4, type: 'theory', professorName: 'Prof. S. Mishra', order: 4 },
          { name: 'Design & Analysis of Algorithms', code: 'BTCS304', credits: 4, type: 'theory', professorName: 'Prof. K. Verma', order: 5 },
          { name: 'DBMS Lab', code: 'BTCS3L1', credits: 2, type: 'practical', professorName: 'Prof. V. Saxena', order: 6 },
        ],
      },
      {
        semesterNumber: 4, year: 2,
        subjects: [
          { name: 'Theory of Computation', code: 'BTCS401', credits: 4, type: 'theory', professorName: 'Dr. A. Tiwari', order: 1 },
          { name: 'Computer Networks', code: 'BTCS402', credits: 4, type: 'theory', professorName: 'Prof. N. Sharma', order: 2 },
          { name: 'Software Engineering', code: 'BTCS403', credits: 4, type: 'theory', professorName: 'Prof. P. Gupta', order: 3 },
          { name: 'Microprocessors & Interfacing', code: 'BTCS404', credits: 3, type: 'theory', professorName: 'Prof. R. Kumar', order: 4 },
          { name: 'Web Technology', code: 'BTCS405', credits: 3, type: 'theory', professorName: 'Prof. S. Mishra', order: 5 },
          { name: 'Networks Lab', code: 'BTCS4L1', credits: 2, type: 'practical', professorName: 'Prof. N. Sharma', order: 6 },
        ],
      },
      {
        semesterNumber: 5, year: 3,
        subjects: [
          { name: 'Artificial Intelligence', code: 'BTCS501', credits: 4, type: 'theory', professorName: 'Dr. M. Jain', order: 1 },
          { name: 'Compiler Design', code: 'BTCS502', credits: 4, type: 'theory', professorName: 'Dr. A. Tiwari', order: 2 },
          { name: 'Information Security', code: 'BTCS503', credits: 3, type: 'theory', professorName: 'Prof. N. Sharma', order: 3 },
          { name: 'Mobile Application Development', code: 'BTCS504', credits: 3, type: 'theory', professorName: 'Prof. P. Gupta', order: 4 },
          { name: 'Elective I', code: 'BTCS5E1', credits: 3, type: 'elective', order: 5 },
          { name: 'AI Lab', code: 'BTCS5L1', credits: 2, type: 'practical', professorName: 'Dr. M. Jain', order: 6 },
        ],
      },
      {
        semesterNumber: 6, year: 3,
        subjects: [
          { name: 'Machine Learning', code: 'BTCS601', credits: 4, type: 'theory', professorName: 'Dr. M. Jain', order: 1 },
          { name: 'Cloud Computing', code: 'BTCS602', credits: 3, type: 'theory', professorName: 'Prof. P. Gupta', order: 2 },
          { name: 'Big Data Analytics', code: 'BTCS603', credits: 3, type: 'theory', professorName: 'Prof. V. Saxena', order: 3 },
          { name: 'Internet of Things', code: 'BTCS604', credits: 3, type: 'theory', professorName: 'Prof. R. Kumar', order: 4 },
          { name: 'Elective II', code: 'BTCS6E1', credits: 3, type: 'elective', order: 5 },
          { name: 'ML Lab', code: 'BTCS6L1', credits: 2, type: 'practical', professorName: 'Dr. M. Jain', order: 6 },
        ],
      },
      {
        semesterNumber: 7, year: 4,
        subjects: [
          { name: 'Deep Learning', code: 'BTCS701', credits: 4, type: 'theory', professorName: 'Dr. M. Jain', order: 1 },
          { name: 'Distributed Systems', code: 'BTCS702', credits: 3, type: 'theory', professorName: 'Prof. N. Sharma', order: 2 },
          { name: 'Elective III', code: 'BTCS7E1', credits: 3, type: 'elective', order: 3 },
          { name: 'Elective IV', code: 'BTCS7E2', credits: 3, type: 'elective', order: 4 },
          { name: 'Project Phase I', code: 'BTCS7P1', credits: 4, type: 'project', order: 5 },
          { name: 'Seminar', code: 'BTCS7S1', credits: 2, type: 'practical', order: 6 },
        ],
      },
      {
        semesterNumber: 8, year: 4,
        subjects: [
          { name: 'Elective V', code: 'BTCS8E1', credits: 3, type: 'elective', order: 1 },
          { name: 'Elective VI', code: 'BTCS8E2', credits: 3, type: 'elective', order: 2 },
          { name: 'Project Phase II', code: 'BTCS8P1', credits: 8, type: 'project', order: 3 },
          { name: 'Industrial Training', code: 'BTCS8IT', credits: 4, type: 'practical', order: 4 },
        ],
      },
    ],
  },
  {
    name: 'Mechanical Engineering',
    shortName: 'ME',
    description: 'Bachelor of Engineering in Mechanical Engineering — 4 years. Covers thermodynamics, fluid mechanics, machine design, manufacturing and more.',
    duration: 4,
    totalSemesters: 8,
    color: 'from-orange-500 to-red-600',
    icon: '⚙️',
    semesters: [
      {
        semesterNumber: 1, year: 1,
        subjects: [
          { name: 'Engineering Mathematics I', code: 'BTMA101', credits: 4, type: 'theory', order: 1 },
          { name: 'Engineering Physics', code: 'BTPH101', credits: 4, type: 'theory', order: 2 },
          { name: 'Basic Electrical Engineering', code: 'BTEE101', credits: 3, type: 'theory', order: 3 },
          { name: 'Engineering Graphics', code: 'BTME101', credits: 3, type: 'practical', order: 4 },
          { name: 'Workshop Technology', code: 'BTME102', credits: 3, type: 'practical', order: 5 },
          { name: 'Communication Skills', code: 'BTHS101', credits: 2, type: 'theory', order: 6 },
        ],
      },
      {
        semesterNumber: 2, year: 1,
        subjects: [
          { name: 'Engineering Mathematics II', code: 'BTMA201', credits: 4, type: 'theory', order: 1 },
          { name: 'Engineering Chemistry', code: 'BTCH201', credits: 4, type: 'theory', order: 2 },
          { name: 'Thermodynamics', code: 'BTME201', credits: 4, type: 'theory', order: 3 },
          { name: 'Strength of Materials', code: 'BTME202', credits: 4, type: 'theory', order: 4 },
          { name: 'Manufacturing Processes I', code: 'BTME203', credits: 3, type: 'theory', order: 5 },
          { name: 'Engineering Drawing', code: 'BTME204', credits: 2, type: 'practical', order: 6 },
        ],
      },
    ],
  },
  {
    name: 'Civil Engineering',
    shortName: 'CIV',
    description: 'Bachelor of Engineering in Civil Engineering — 4 years. Covers structural analysis, geotechnical engineering, transportation, water resources and construction management.',
    duration: 4,
    totalSemesters: 8,
    color: 'from-amber-500 to-yellow-600',
    icon: '🏗️',
    semesters: [
      {
        semesterNumber: 1, year: 1,
        subjects: [
          { name: 'Engineering Mathematics I', code: 'BTMA101', credits: 4, type: 'theory', order: 1 },
          { name: 'Engineering Physics', code: 'BTPH101', credits: 4, type: 'theory', order: 2 },
          { name: 'Basic Electrical Engineering', code: 'BTEE101', credits: 3, type: 'theory', order: 3 },
          { name: 'Engineering Graphics', code: 'BTME101', credits: 3, type: 'practical', order: 4 },
          { name: 'Building Materials', code: 'BTCV101', credits: 3, type: 'theory', order: 5 },
          { name: 'Communication Skills', code: 'BTHS101', credits: 2, type: 'theory', order: 6 },
        ],
      },
      {
        semesterNumber: 2, year: 1,
        subjects: [
          { name: 'Engineering Mathematics II', code: 'BTMA201', credits: 4, type: 'theory', order: 1 },
          { name: 'Engineering Mechanics', code: 'BTCV201', credits: 4, type: 'theory', order: 2 },
          { name: 'Surveying', code: 'BTCV202', credits: 4, type: 'theory', order: 3 },
          { name: 'Fluid Mechanics', code: 'BTCV203', credits: 4, type: 'theory', order: 4 },
          { name: 'Construction Materials Lab', code: 'BTCV2L1', credits: 2, type: 'practical', order: 5 },
        ],
      },
    ],
  },
  {
    name: 'Electronics & Telecommunication Engineering',
    shortName: 'ENTC',
    description: 'Bachelor of Engineering in Electronics & Telecommunication — 4 years. Covers analog/digital electronics, signal processing, communication systems and VLSI.',
    duration: 4,
    totalSemesters: 8,
    color: 'from-green-500 to-teal-600',
    icon: '📡',
    semesters: [
      {
        semesterNumber: 1, year: 1,
        subjects: [
          { name: 'Engineering Mathematics I', code: 'BTMA101', credits: 4, type: 'theory', order: 1 },
          { name: 'Engineering Physics', code: 'BTPH101', credits: 4, type: 'theory', order: 2 },
          { name: 'Basic Electronics', code: 'BTET101', credits: 3, type: 'theory', order: 3 },
          { name: 'Engineering Graphics', code: 'BTME101', credits: 3, type: 'practical', order: 4 },
          { name: 'Programming Fundamentals', code: 'BTCS101', credits: 3, type: 'theory', order: 5 },
          { name: 'Communication Skills', code: 'BTHS101', credits: 2, type: 'theory', order: 6 },
        ],
      },
      {
        semesterNumber: 2, year: 1,
        subjects: [
          { name: 'Engineering Mathematics II', code: 'BTMA201', credits: 4, type: 'theory', order: 1 },
          { name: 'Network Theory', code: 'BTET201', credits: 4, type: 'theory', order: 2 },
          { name: 'Electronic Devices & Circuits', code: 'BTET202', credits: 4, type: 'theory', order: 3 },
          { name: 'Digital Electronics', code: 'BTET203', credits: 4, type: 'theory', order: 4 },
          { name: 'Electronics Lab', code: 'BTET2L1', credits: 2, type: 'practical', order: 5 },
        ],
      },
    ],
  },
];

const seedSSBT = async () => {
  await connectDB();

  // Find admin user to set as creator
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.error('❌ No admin user found. Run the main seeder first: node utils/seeder.js');
    process.exit(1);
  }

  await SSBTCourse.deleteMany();
  console.log('🗑️  Cleared existing SSBT courses');

  const coursesWithAdmin = engineeringCourses.map(c => ({ ...c, createdBy: admin._id }));
  const created = await SSBTCourse.create(coursesWithAdmin);

  console.log(`\n✅ ${created.length} SSBT Engineering courses seeded:`);
  created.forEach(c => {
    const totalSubjects = c.semesters.reduce((a, s) => a + s.subjects.length, 0);
    console.log(`   📚 ${c.name} (${c.shortName}) — ${c.semesters.length} semesters, ${totalSubjects} subjects`);
  });

  console.log('\n🎉 SSBT Seeding Complete!');
  console.log('Login as teacher to add notes, videos and papers.');
  console.log('Login as student to view courses and attendance.');
  process.exit(0);
};

seedSSBT().catch(err => {
  console.error('SSBT Seeding failed:', err);
  process.exit(1);
});
