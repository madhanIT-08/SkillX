const express = require('express');
const router = express.Router();
const { sendRequest, getReceivedRequests, getSentRequests, updateRequestStatus } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, sendRequest);
router.get('/received', protect, getReceivedRequests);
router.get('/sent', protect, getSentRequests);
router.put('/:id', protect, updateRequestStatus);

module.exports = router;
