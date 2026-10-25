const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = u => jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
const pub = u => ({ id: u._id, name: u.name, email: u.email, role: u.role });

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'name, email, password required' });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role });
  res.json({ message: 'User created', token: sign(user), user: pub(user) });
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password)))
    return res.status(400).json({ message: 'Invalid credentials' });
  res.json({ token: sign(user), user: pub(user) });
});

router.get('/me', protect, async (req, res) => res.json(await User.findById(req.user.id).select('-password')));
module.exports = router;
