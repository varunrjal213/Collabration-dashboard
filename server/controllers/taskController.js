const Task = require('../models/taskModel');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    const { title, description, status, project, assignedTo, deadline } = req.body;

    const task = await Task.create({
        title,
        description,
        status,
        project,
        assignedTo,
        deadline,
    });

    res.status(201).json(task);
};

// @desc    Get tasks for a project
// @route   GET /api/tasks/:projectId
// @access  Private
const getTasks = async (req, res) => {
    const tasks = await Task.find({ project: req.params.projectId })
        .populate('assignedTo', 'username email');

    res.json(tasks);
};

// @desc    Update task status
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        task.status = req.body.status || task.status;
        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.assignedTo = req.body.assignedTo || task.assignedTo;

        const updatedTask = await task.save();
        res.json(updatedTask);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

module.exports = { createTask, getTasks, updateTask };
