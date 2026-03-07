const express = require('express');
const router = express.Router();
const {
    createTeam,
    getTeams,
    addMembersToTeam,
    deleteTeam,
} = require('../controllers/teamController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getTeams)
    .post(protect, admin, createTeam);

router.route('/:id')
    .delete(protect, admin, deleteTeam);

router.route('/:id/members')
    .put(protect, admin, addMembersToTeam);

module.exports = router;
