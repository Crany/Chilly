const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    reason: String,
    reportedTag: String,
    identifier: String,
})

module.exports = mongoose.model('Report', reportSchema);