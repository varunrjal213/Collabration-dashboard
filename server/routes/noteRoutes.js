const express = require('express');
const router = express.Router();
const { getNotes, createNote, getProjectNotes } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createNote);
router.route('/:taskId').get(protect, getNotes);
router.route('/project/:projectId').get(protect, getProjectNotes);

module.exports = router;
