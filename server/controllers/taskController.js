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
    let query = { project: req.params.projectId };

    // If not admin, only show tasks assigned to the user
    if (req.user.role !== 'admin') {
        query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
        .populate('assignedTo', 'username email');

    res.json(tasks);
};

// @desc    Update task status
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    // Role-based update restriction
    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.status = req.body.status || task.status;
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.assignedTo = req.body.assignedTo || task.assignedTo;

    const updatedTask = await task.save();
    res.json(updatedTask);
};

// @desc    Get tasks assigned to the current user
// @route   GET /api/tasks/my-tasks
// @access  Private
const getMyTasks = async (req, res) => {
    const tasks = await Task.find({ assignedTo: req.user._id })
        .populate('project', 'name startDate');

    res.json(tasks);
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
};

module.exports = { createTask, getTasks, updateTask, getMyTasks, deleteTask };
