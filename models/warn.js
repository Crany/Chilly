const mongoose = require('mongoose');

const warnSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    reason: String,
    warnedId: String,
    warnerId: String,
    identifier: String,
});

module.exports = mongoose.model('Warn', warnSchema);