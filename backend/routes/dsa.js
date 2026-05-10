const express = require('express');
const router = express.Router();
const { getDSAProblems, getDSAProblem, updateDSAProgress, getDSAStats, createDSAProblem } = require('../controllers/mainController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getDSAProblems);
router.get('/stats', protect, getDSAStats);
router.get('/:slug', optionalAuth, getDSAProblem);
router.post('/', protect, authorize('admin', 'teacher'), createDSAProblem);
router.post('/progress', protect, updateDSAProgress);

module.exports = router;
