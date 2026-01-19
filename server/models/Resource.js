const mongoose = require('mongoose');

const resourceSchema = mongoose.Schema({
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    link: { type: String, required: true }, // URL or path
    type: { type: String, default: 'link' }, // 'link', 'video', 'document'
}, {
    timestamps: true
});

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
