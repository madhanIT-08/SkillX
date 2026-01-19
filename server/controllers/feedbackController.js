const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Session = require('../models/Session');

// @desc    Submit feedback for a session
// @route   POST /api/feedback
// @access  Private
const submitFeedback = async (req, res) => {
    const { sessionId, toUserId, rating, comment } = req.body;

    try {
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const feedback = await Feedback.create({
            session: sessionId,
            fromUser: req.user._id,
            toUser: toUserId,
            rating,
            comment
        });

        // Update target user reputation
        const feedbacks = await Feedback.find({ toUser: toUserId });
        const avgRating = feedbacks.reduce((acc, item) => item.rating + acc, 0) / feedbacks.length;

        await User.findByIdAndUpdate(toUserId, { reputation: avgRating.toFixed(1) });

        res.status(201).json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get feedback for a user
// @route   GET /api/feedback/:userId
// @access  Public
const getUserFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ toUser: req.params.userId })
            .populate('fromUser', 'name')
            .sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { submitFeedback, getUserFeedback };
