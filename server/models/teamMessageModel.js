const mongoose = require('mongoose');

const teamMessageSchema = mongoose.Schema(
    {
        team: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Team',
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        content: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const TeamMessage = mongoose.model('TeamMessage', teamMessageSchema);

module.exports = TeamMessage;
