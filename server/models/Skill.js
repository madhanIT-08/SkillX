const mongoose = require('mongoose');

const skillSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: { type: String, default: 'General' },
});

const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill;
