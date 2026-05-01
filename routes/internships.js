const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Internship = require('../models/Internship');

// @route   POST api/internships
// @desc    Create an internship
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: Admins only' });
  }

  try {
    const newInternship = new Internship(req.body);
    const internship = await newInternship.save();
    res.json(internship);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/internships
// @desc    Get all active internships
// @access  Public
router.get('/', async (req, res) => {
  try {
    const internships = await Internship.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(internships);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/internships/all
// @desc    Get all internships (active & inactive)
// @access  Private (Admin only)
router.get('/all', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: Admins only' });
  }
  try {
    const internships = await Internship.find().sort({ createdAt: -1 });
    res.json(internships);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/internships/:id
// @desc    Get internship by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ msg: 'Internship not found' });
    }
    res.json(internship);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Internship not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/internships/:id
// @desc    Update internship (e.g., toggle isActive)
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: Admins only' });
  }

  try {
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(internship);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
