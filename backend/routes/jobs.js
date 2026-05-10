const express = require('express');
const router = express.Router();
const { getJobs, getJob, createJob, updateJob, deleteJob, applyJob } = require('../controllers/mainController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getJobs);
router.get('/:id', optionalAuth, getJob);
router.post('/', protect, authorize('admin', 'teacher'), createJob);
router.put('/:id', protect, authorize('admin'), updateJob);
router.delete('/:id', protect, authorize('admin'), deleteJob);
router.post('/:id/apply', protect, authorize('student'), applyJob);

module.exports = router;
