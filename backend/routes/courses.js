const express = require('express');
const router = express.Router();
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse, enrollCourse, getMyCourses, addLesson } = require('../controllers/courseController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getCourses);
router.get('/my-courses', protect, authorize('teacher', 'admin'), getMyCourses);
router.get('/:id', optionalAuth, getCourse);
router.post('/', protect, authorize('teacher', 'admin'), createCourse);
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);
router.post('/:id/enroll', protect, authorize('student'), enrollCourse);
router.post('/:id/lessons', protect, authorize('teacher', 'admin'), addLesson);

module.exports = router;
