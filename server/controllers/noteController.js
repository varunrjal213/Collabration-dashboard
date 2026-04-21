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

const createNote = async (req, res) => {
    try {
        const { content, taskId, projectId, date } = req.body;

        let noteData = {
            content,
            author: req.user._id,
            date: date || Date.now(),
        };

        if (taskId) {
            const task = await Task.findById(taskId);
            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }
            noteData.task = taskId;
            noteData.project = task.project;
        } else if (projectId) {
            noteData.project = projectId;
        } else {
            return res.status(400).json({ message: "Task ID or Project ID is required" });
        }

        const note = await Note.create(noteData);

        const populatedNote = await Note.findById(note._id)
            .populate('author', 'username email role')
            .populate('task', 'title');

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
