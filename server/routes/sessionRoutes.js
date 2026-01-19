const express = require('express');
const router = express.Router();
const { verifySessionPasskey, getSessionById, getMySessions } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMySessions);
router.post('/verify', protect, verifySessionPasskey);
router.get('/:id', protect, getSessionById);

module.exports = router;
