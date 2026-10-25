const mongoose = require('mongoose');
module.exports = mongoose.model('Leave', new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Casual', 'Sick', 'Earned', 'Other'], default: 'Casual' },
  fromDate: { type: Date, required: true }, toDate: { type: Date, required: true },
  reason: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true }));
