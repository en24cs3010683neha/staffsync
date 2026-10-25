const mongoose = require('mongoose');
module.exports = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['hr', 'manager', 'employee'], default: 'employee' },
  department: String, designation: String, phone: String,
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }));
