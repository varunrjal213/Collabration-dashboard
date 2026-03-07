const mongoose = require('mongoose');

const teamSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
