// Demo users banata hai:  npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({ email: { $in: ['hr@test.com', 'manager@test.com', 'employee@test.com'] } });
  const pw = await bcrypt.hash('123456', 10);
  await User.create({ name: 'Test HR', email: 'hr@test.com', password: pw, role: 'hr', department: 'HR', designation: 'HR Executive' });
  const m = await User.create({ name: 'Test Manager', email: 'manager@test.com', password: pw, role: 'manager', department: 'IT', designation: 'Team Lead' });
  await User.create({ name: 'Test Employee', email: 'employee@test.com', password: pw, role: 'employee', department: 'IT', designation: 'Developer', manager: m._id });
  console.log('Seed done. Login: hr@test.com / manager@test.com / employee@test.com  (password: 123456)');
  process.exit();
})();
