const express = require('express');
const router = express.Router();
const { submitFeedback, getUserFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitFeedback);
router.get('/:userId', getUserFeedback);

module.exports = router;
