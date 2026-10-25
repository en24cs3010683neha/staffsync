const router = require('express').Router();
const Training = require('../models/Training');
const { protect, allow } = require('../middleware/auth');
router.use(protect);

router.get('/', async (req, res) => {
  const q = req.user.role === 'employee' ? { assignedTo: req.user.id }
          : req.user.role === 'manager' ? { createdBy: req.user.id } : {};
  res.json(await Training.find(q).populate('assignedTo', 'name').populate('createdBy', 'name').sort('-date'));
});
router.post('/', allow('manager'), async (req, res) => res.json(await Training.create({ ...req.body, createdBy: req.user.id })));
router.delete('/:id', allow('manager'), async (req, res) => { await Training.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id }); res.json({ message: 'Deleted' }); });
module.exports = router;
