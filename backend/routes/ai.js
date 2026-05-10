const express = require('express');
const router = express.Router();
const { generateInterviewQuestion, generateResume, generateCoverLetter, codeReview, aiChat } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/interview', generateInterviewQuestion);
router.post('/resume', generateResume);
router.post('/cover-letter', generateCoverLetter);
router.post('/code-review', codeReview);
router.post('/chat', aiChat);

module.exports = router;
