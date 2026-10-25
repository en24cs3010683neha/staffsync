const mongoose = require('mongoose');
module.exports = mongoose.model('Announcement', new mongoose.Schema({
  title: { type: String, required: true }, message: String,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }));
