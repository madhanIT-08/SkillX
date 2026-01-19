const express = require('express');
const router = express.Router();
const { addResource, getSessionResources } = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addResource);
router.get('/:sessionId', protect, getSessionResources);

module.exports = router;
