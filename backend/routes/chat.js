const express = require('express');
const router = express.Router();
const { getChatMessages, sendMessage, deleteMessage } = require('../controllers/mainController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getChatMessages);
router.post('/', sendMessage);
router.delete('/:id', deleteMessage);

module.exports = router;
