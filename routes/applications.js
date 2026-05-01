const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @route   POST api/applications
// @desc    Apply for an internship
// @access  Private (Student)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ msg: 'Access denied: Students only' });
  }

  const { internshipId, resumeLink, notes } = req.body;

  try {
    let application = await Application.findOne({
      student: req.user.id,
      internship: internshipId
    });

    if (application) {
      return res.status(400).json({ msg: 'You have already applied for this internship' });
    }

    application = new Application({
      student: req.user.id,
      internship: internshipId,
      resumeLink,
      notes
    });

    await application.save();

    // Fetch internship and user details for the email
    const internshipDetails = await Internship.findById(internshipId);
    const userDetails = await User.findById(req.user.id);

    // Send confirmation email asynchronously without blocking the response
    try {
      await sendEmail({
        email: userDetails.email,
        subject: `Application Submitted successfully: ${internshipDetails.title} at ${internshipDetails.company}`,
        message: `Hello ${userDetails.name},\n\nYou have successfully submitted your application for the ${internshipDetails.title} position at ${internshipDetails.company}.\n\nWe will review your resume and any attached notes, and get back to you shortly.\n\nBest regards,\nThe Internship Portal Team`
      });
    } catch (err) {
      console.error('Email dispatch failed:', err);
    }

    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/applications/my
// @desc    Get current student's applications
// @access  Private (Student)
router.get('/my', auth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ msg: 'Access denied' });
  }

  try {
    const applications = await Application.find({ student: req.user.id })
      .populate('internship', ['title', 'company'])
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/applications
// @desc    Get all applications
// @access  Private (Admin)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied' });
  }

  try {
    const applications = await Application.find()
      .populate('student', ['name', 'email'])
      .populate('internship', ['title', 'company'])
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/applications/:id/status
// @desc    Update application status (Approve/Reject)
// @access  Private (Admin)
router.patch('/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied' });
  }

  const { status } = req.body;

  if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid status' });
  }

  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    ).populate('student', ['name', 'email']).populate('internship', ['title', 'company']);
    
    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    // Send status update email asynchronously
    try {
      await sendEmail({
        email: application.student.email,
        subject: `Application Status Update: ${application.internship.title} at ${application.internship.company}`,
        message: `Hello ${application.student.name},\n\nYour application for the ${application.internship.title} position at ${application.internship.company} has been ${status}.\n\nBest regards,\nThe Internship Portal Team`
      });
    } catch (err) {
      console.error('Email dispatch failed:', err);
    }

    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
