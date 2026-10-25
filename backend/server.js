require('dotenv').config();
require('express-async-errors');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('StaffSync API running'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/training', require('./routes/training'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.code === 11000 ? 400 : 500).json({ message: err.code === 11000 ? 'Email already exists' : err.message });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log('MongoDB connected'); app.listen(PORT, () => console.log('Server running on port ' + PORT)); })
  .catch(err => console.log('DB error:', err.message));
