const express = require('express');
const router = express.Router();
const { executeCode, getTemplates } = require('../controllers/compilerController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/templates', getTemplates);
router.post('/execute', executeCode);

module.exports = router;
