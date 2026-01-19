const Session = require('../models/Session');

// @desc    Verify Passkey and Unlock Session
// @route   POST /api/sessions/verify
// @access  Private
const verifySessionPasskey = async (req, res) => {
    const { passkey } = req.body;

    const session = await Session.findOne({ passkey });

    if (!session) {
        return res.status(404).json({ message: 'Invalid Passkey' });
    }

    // Check if user is part of the session
    if (session.userA.toString() !== req.user._id.toString() &&
        session.userB.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized for this session' });
    }

    if (session.status !== 'active') {
        return res.status(400).json({ message: 'Session is inactive' });
    }

    res.json({ message: 'Access Granted', session });
};

// @desc    Get session details by ID
// @route   GET /api/sessions/:id
// @access  Private
const getSessionById = async (req, res) => {
    const session = await Session.findById(req.params.id)
        .populate('userA', 'name email')
        .populate('userB', 'name email');

    if (session) {
        // Verify user is participant
        if (session.userA._id.toString() !== req.user._id.toString() &&
            session.userB._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        res.json(session);
    } else {
        res.status(404).json({ message: 'Session not found' });
    }
};

const getMySessions = async (req, res) => {
    const sessions = await Session.find({
        $or: [
            { userA: req.user._id },
            { userB: req.user._id }
        ],
        status: 'active'
    }).sort({ createdAt: -1 });

    res.json(sessions);
};

module.exports = { verifySessionPasskey, getSessionById, getMySessions };
