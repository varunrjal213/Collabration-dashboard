const TeamMessage = require('../models/teamMessageModel');

// @desc    Get messages for a team
// @route   GET /api/team-messages/:teamId
// @access  Private
const getTeamMessages = async (req, res) => {
    try {
        const messages = await TeamMessage.find({ team: req.params.teamId })
            .populate('sender', 'username email')
            .sort({ createdAt: 1 }); // Oldest first for chat flow
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTeamMessages };
