const mongoose = require('mongoose');
module.exports = mongoose.model('Attendance', new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  checkIn: Date, checkOut: Date,
  status: { type: String, default: 'present' }
}, { timestamps: true }));
