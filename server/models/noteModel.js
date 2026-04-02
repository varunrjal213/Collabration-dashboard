const mongoose = require('mongoose');

const noteSchema = mongoose.Schema(
    {
        task: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Task',
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Project',
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

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
