// ==================== routes/auth.js ====================
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, verifyToken, checkEmail } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/check-email', checkEmail);
router.get('/me', protect, getMe);
router.get('/verify', protect, verifyToken);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
