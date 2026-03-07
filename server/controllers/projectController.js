const Project = require('../models/projectModel');
const Task = require('../models/taskModel');

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
    let projects;

    if (req.user.role === 'admin') {
        projects = await Project.find({}).populate('members', 'username email');
    } else {
        // Find tasks assigned to this member
        const assignedTasks = await Task.find({ assignedTo: req.user._id });
        const projectIds = [...new Set(assignedTasks.map(task => task.project.toString()))];

        projects = await Project.find({
            _id: { $in: projectIds }
        }).populate('members', 'username email');
    }

    res.json(projects);
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
    const project = await Project.findById(req.params.id)
        .populate('members', 'username email')
        .populate('createdBy', 'username email');

    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    // Restriction for members
    if (req.user.role !== 'admin') {
        const taskCount = await Task.countDocuments({
            project: project._id,
            assignedTo: req.user._id
        });

        if (taskCount === 0) {
            return res.status(403).json({ message: 'Not authorized to view this project' });
        }
    }

    res.json(project);
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (project) {
        await Task.deleteMany({ project: project._id });
        await project.deleteOne();
        res.json({ message: 'Project and its tasks removed' });
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
};

module.exports = { createProject, getProjects, getProjectById, deleteProject };
