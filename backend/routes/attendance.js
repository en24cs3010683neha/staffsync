const router = require('express').Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, allow } = require('../middleware/auth');
router.use(protect);
const today = () => new Date().toISOString().slice(0, 10);

router.post('/checkin', async (req, res) => {
  const exists = await Attendance.findOne({ employee: req.user.id, date: today() });
  if (exists) return res.status(400).json({ message: 'Already checked in today' });
  res.json(await Attendance.create({ employee: req.user.id, date: today(), checkIn: new Date() }));
});

router.post('/checkout', async (req, res) => {
  const a = await Attendance.findOne({ employee: req.user.id, date: today() });
  if (!a) return res.status(400).json({ message: 'Check in first' });
  if (a.checkOut) return res.status(400).json({ message: 'Already checked out' });
  a.checkOut = new Date(); await a.save();
  res.json(a);
});

router.get('/mine', async (req, res) => res.json(await Attendance.find({ employee: req.user.id }).sort('-date').limit(60)));

router.get('/', allow('hr', 'manager'), async (req, res) => {
  let q = {};
  if (req.user.role === 'manager') {
    const team = await User.find({ manager: req.user.id }).select('_id');
    q = { employee: { $in: team.map(t => t._id) } };
  }
  res.json(await Attendance.find(q).populate('employee', 'name department').sort('-date').limit(200));
});
module.exports = router;
