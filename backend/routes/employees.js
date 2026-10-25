const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect, allow } = require('../middleware/auth');
router.use(protect);

router.get('/me', async (req, res) => res.json(await User.findById(req.user.id).select('-password')));
router.put('/me', async (req, res) => {
  const { name, phone, department, designation } = req.body;
  res.json(await User.findByIdAndUpdate(req.user.id, { name, phone, department, designation }, { new: true }).select('-password'));
});

router.get('/', allow('hr', 'manager'), async (req, res) => {
  const q = req.user.role === 'manager' ? { manager: req.user.id } : {};
  res.json(await User.find(q).select('-password').populate('manager', 'name').sort('-createdAt'));
});

router.post('/', allow('hr'), async (req, res) => {
  const b = req.body;
  const u = await User.create({ ...b, manager: b.manager || undefined, password: await bcrypt.hash(b.password || '123456', 10) });
  res.json({ id: u._id });
});

router.put('/:id', allow('hr'), async (req, res) => {
  const b = { ...req.body };
  if (b.password) b.password = await bcrypt.hash(b.password, 10); else delete b.password;
  if (!b.manager) delete b.manager;
  res.json(await User.findByIdAndUpdate(req.params.id, b, { new: true }).select('-password'));
});

router.delete('/:id', allow('hr'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});
module.exports = router;
