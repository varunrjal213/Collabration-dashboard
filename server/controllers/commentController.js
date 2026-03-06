const Comment = require('../models/commentModel');

const getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ task: req.params.taskId }).populate('user', 'username');
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addComment = async (req, res) => {
    try {
        const { text, taskId } = req.body;
        const comment = await Comment.create({
            text,
            task: taskId,
            user: req.user._id
        });
        const populated = await Comment.findById(comment._id).populate('user', 'username');
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getComments, addComment };
