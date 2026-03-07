const express = require('express');
const router = express.Router();
const { getTeamMessages } = require('../controllers/teamMessageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:teamId', protect, getTeamMessages);

module.exports = router;
