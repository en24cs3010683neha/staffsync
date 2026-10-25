const router = require('express').Router();
const Announcement = require('../models/Announcement');
const { protect, allow } = require('../middleware/auth');
router.use(protect);

router.get('/', async (req, res) => res.json(await Announcement.find().populate('postedBy', 'name').sort('-createdAt')));
router.post('/', allow('hr'), async (req, res) => res.json(await Announcement.create({ ...req.body, postedBy: req.user.id })));
router.put('/:id', allow('hr'), async (req, res) => res.json(await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete('/:id', allow('hr'), async (req, res) => { await Announcement.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); });
module.exports = router;
