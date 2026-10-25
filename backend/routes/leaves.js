const router = require('express').Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const { protect, allow } = require('../middleware/auth');
router.use(protect);

router.post('/', async (req, res) => {
  const { type, fromDate, toDate, reason } = req.body;
  if (new Date(toDate) < new Date(fromDate)) return res.status(400).json({ message: 'To date must be after From date' });
  res.json(await Leave.create({ type, fromDate, toDate, reason, employee: req.user.id }));
});

router.get('/mine', async (req, res) => res.json(await Leave.find({ employee: req.user.id }).sort('-createdAt')));

router.get('/', allow('hr', 'manager'), async (req, res) => {
  let q = {};
  if (req.user.role === 'manager') {
    const team = await User.find({ manager: req.user.id }).select('_id');
    q = { employee: { $in: team.map(t => t._id) } };
  }
  res.json(await Leave.find(q).populate('employee', 'name email department').sort('-createdAt'));
});

router.put('/:id/status', allow('hr', 'manager'), async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const leave = await Leave.findById(req.params.id).populate('employee');
  if (!leave) return res.status(404).json({ message: 'Not found' });
  if (req.user.role === 'manager' && String(leave.employee.manager) !== req.user.id)
    return res.status(403).json({ message: 'Not your team member' });
  leave.status = status; await leave.save();
  res.json(leave);
});
module.exports = router;
