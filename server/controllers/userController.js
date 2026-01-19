const User = require('../models/User');

// @desc    Update user profile (Skills)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }

        if (req.body.skillsOffered) {
            user.skillsOffered = req.body.skillsOffered;
        }
        if (req.body.skillsNeeded) {
            user.skillsNeeded = req.body.skillsNeeded;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            skillsOffered: updatedUser.skillsOffered,
            skillsNeeded: updatedUser.skillsNeeded,
            token: req.headers.authorization.split(' ')[1] // return same token
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Search for users by skill
// @route   GET /api/users/search?skill=React
// @access  Private
const searchPeers = async (req, res) => {
    const { skill } = req.query;

    if (!skill) {
        return res.status(400).json({ message: 'Skill query parameter required' });
    }

    try {
        // Case-insensitive search for skillsOffered
        const users = await User.find({
            skillsOffered: { $regex: skill, $options: 'i' },
            _id: { $ne: req.user._id } // Exclude self
        }).select('-password');

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get specific user profile by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = { updateProfile, searchPeers, getUserById };
