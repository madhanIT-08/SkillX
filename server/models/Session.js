const mongoose = require('mongoose');

const sessionSchema = mongoose.Schema({
    userA: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userB: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillName: { type: String, required: true },
    passkey: { type: String, required: true, unique: true }, // The Shared Session Passkey
    status: { type: String, enum: ['active', 'inactive', 'completed'], default: 'active' },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
}, {
    timestamps: true
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
