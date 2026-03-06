const Project = require('../models/projectModel');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
    const { name, description, members } = req.body;

    const project = await Project.create({
        name,
        description,
        members,
        createdBy: req.user._id,
    });

    res.status(201).json(project);
};

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    const projects = await Project.find({
        $or: [
            { createdBy: req.user._id },
            { members: req.user._id },
        ]
    }).populate('members', 'username email');

    res.json(projects);
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
    const project = await Project.findById(req.params.id)
        .populate('members', 'username email')
        .populate('createdBy', 'username email');

    if (project) {
        res.json(project);
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
};

module.exports = { createProject, getProjects, getProjectById };
