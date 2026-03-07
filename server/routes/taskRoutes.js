const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, getMyTasks } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my-tasks', protect, getMyTasks);

router.route('/')
    .post(protect, createTask);

router.route('/:projectId')
    .get(protect, getTasks);

router.route('/:id')
    .put(protect, updateTask);

module.exports = router;
