const File = require('../models/fileModel');

const getFiles = async (req, res) => {
    try {
        const files = await File.find({ task: req.params.taskId }).populate('uploadedBy', 'username');
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const uploadFileMetadata = async (req, res) => {
    try {
        const { name, url, type, size, taskId } = req.body;
        const file = await File.create({
            name, url, type, size,
            task: taskId,
            uploadedBy: req.user._id
        });
        res.status(201).json(file);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getFiles, uploadFileMetadata };
