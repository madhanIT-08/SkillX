const Request = require('../models/Request');
const Session = require('../models/Session');
const User = require('../models/User');

// Helper to generate Session Passkey
const generatePasskey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let passkey = 'SKX-';
    for (let i = 0; i < 5; i++) {
        passkey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return passkey;
};

// @desc    Send a skill exchange request
// @route   POST /api/requests
// @access  Private
const sendRequest = async (req, res) => {
    const { receiverId, skillName, message } = req.body;

    // Check if request already exists
    const existingRequest = await Request.findOne({
        sender: req.user._id,
        receiver: receiverId,
        skillName,
        status: 'pending'
    });

    if (existingRequest) {
        return res.status(400).json({ message: 'Request already sent' });
    }

    const request = await Request.create({
        sender: req.user._id,
        receiver: receiverId,
        skillName,
        message
    });

    res.status(201).json(request);
};

// @desc    Get my received requests
// @route   GET /api/requests/received
// @access  Private
const getReceivedRequests = async (req, res) => {
    const requests = await Request.find({ receiver: req.user._id })
        .populate('sender', 'name email skillsOffered reputation')
        .sort({ createdAt: -1 });
    res.json(requests);
};

// @desc    Get my sent requests
// @route   GET /api/requests/sent
// @access  Private
const getSentRequests = async (req, res) => {
    const requests = await Request.find({ sender: req.user._id })
        .populate('receiver', 'name email skillsOffered reputation')
        .sort({ createdAt: -1 });
    res.json(requests);
};

// @desc    Accept or Reject a request
// @route   PUT /api/requests/:id
// @access  Private
const updateRequestStatus = async (req, res) => {
    const { status } = req.body; // 'accepted' or 'rejected'
    const request = await Request.findById(req.params.id);

    if (!request) {
        return res.status(404).json({ message: 'Request not found' });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    request.status = status;
    await request.save();

    if (status === 'accepted') {
        // Create a Session automatically
        const passkey = generatePasskey();

        const session = await Session.create({
            userA: request.sender,
            userB: request.receiver,
            skillName: request.skillName,
            passkey: passkey,
            status: 'active'
        });

        return res.json({ message: 'Request accepted, session created', session });
    }

    res.json(request);
};

module.exports = { sendRequest, getReceivedRequests, getSentRequests, updateRequestStatus };
