const express = require('express');
const router = express.Router();
const { updateProfile, searchPeers, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateProfile);
router.get('/search', protect, searchPeers);
router.get('/:id', protect, getUserById);

module.exports = router;
