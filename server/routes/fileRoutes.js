const express = require('express');
const router = express.Router();
const { getFiles, uploadFileMetadata } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:taskId').get(protect, getFiles);
router.route('/').post(protect, uploadFileMetadata);

module.exports = router;
