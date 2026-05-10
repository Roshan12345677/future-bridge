// ==================== routes/tasks.js ====================
const express = require('express');
const taskRouter = express.Router();
const { getTasks, createTask, updateTask, deleteTask, getTaskStats } = require('../controllers/mainController');
const { protect } = require('../middleware/auth');

taskRouter.use(protect);
taskRouter.get('/stats', getTaskStats);
taskRouter.get('/', getTasks);
taskRouter.post('/', createTask);
taskRouter.put('/:id', updateTask);
taskRouter.delete('/:id', deleteTask);

module.exports = taskRouter;

// ==================== routes/jobs.js ====================
// (exported separately below)
