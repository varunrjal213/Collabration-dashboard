const Team = require('../models/teamModel');
const User = require('../models/userModel');

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private/Admin
const createTeam = async (req, res) => {
    const { name, members } = req.body;

    const teamExists = await Team.findOne({ name });

    if (teamExists) {
        return res.status(400).json({ message: 'Team already exists' });
    }

    const team = await Team.create({
        name,
        members: members || [],
        createdBy: req.user._id,
    });

    if (team) {
        res.status(201).json(team);
    } else {
        res.status(400).json({ message: 'Invalid team data' });
    }
};

// @desc    Get all teams or user's team
// @route   GET /api/teams
// @access  Private
const getTeams = async (req, res) => {
    if (req.user.role === 'admin') {
        const teams = await Team.find({}).populate('members', 'username email role');
        res.json(teams);
    } else {
        const team = await Team.findOne({ members: req.user._id }).populate('members', 'username email role');
        res.json(team ? [team] : []);
    }
};

// @desc    Add members to team
// @route   PUT /api/teams/:id/members
// @access  Private/Admin
const addMembersToTeam = async (req, res) => {
    const { memberIds } = req.body;
    const team = await Team.findById(req.params.id);

    if (team) {
        // Add unique member IDs
        const uniqueMemberIds = [...new Set([...team.members.map(m => m.toString()), ...memberIds])];
        team.members = uniqueMemberIds;
        const updatedTeam = await team.save();
        res.json(updatedTeam);
    } else {
        res.status(404).json({ message: 'Team not found' });
    }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private/Admin
const deleteTeam = async (req, res) => {
    const team = await Team.findById(req.params.id);
    if (team) {
        await team.deleteOne();
        res.json({ message: 'Team removed' });
    } else {
        res.status(404).json({ message: 'Team not found' });
    }
};

module.exports = {
    createTeam,
    getTeams,
    addMembersToTeam,
    deleteTeam,
};
