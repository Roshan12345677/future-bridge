const express = require('express');
const router = express.Router();
const { getAssignments, createAssignment, submitAssignment, gradeAssignment } = require('../controllers/mainController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getAssignments);
router.post('/', authorize('teacher', 'admin'), createAssignment);
router.post('/:id/submit', authorize('student'), submitAssignment);
router.patch('/:id/submissions/:submissionId/grade', authorize('teacher', 'admin'), gradeAssignment);

module.exports = router;
