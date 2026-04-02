const Note = require('../models/noteModel');
const Task = require('../models/taskModel');

// @desc    Get notes for a task
// @route   GET /api/notes/:taskId
// @access  Private
const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ task: req.params.taskId })
            .populate('author', 'username email role')
            .sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
    try {
        const { content, taskId } = req.body;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const note = await Note.create({
            content,
            task: taskId,
            project: task.project,
            author: req.user._id,
        });

        const populatedNote = await Note.findById(note._id).populate('author', 'username email role');

        res.status(201).json(populatedNote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all notes for a project
// @route   GET /api/notes/project/:projectId
// @access  Private
const getProjectNotes = async (req, res) => {
    try {
        const notes = await Note.find({ project: req.params.projectId })
            .populate('author', 'username email role')
            .populate('task', 'title')
            .sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotes,
    createNote,
    getProjectNotes,
};
