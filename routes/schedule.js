const express = require('express');
const Schedule = require('../models/Schedule');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Faculty: Create a class schedule
router.post('/create', auth, requireRole(['faculty']), async (req, res) => {
  try {
    const { subject, date, startTime, endTime, room, studentClass, description } = req.body;

    if (!subject || !date || !startTime || !endTime || !room || !studentClass) {
      return res.status(400).json({ error: 'All fields (subject, date, startTime, endTime, room, studentClass) are required.' });
    }

    const schedule = new Schedule({
      subject,
      date: new Date(date),
      startTime,
      endTime,
      room,
      faculty: req.user._id,
      studentClass,
      description
    });

    await schedule.save();
    res.status(201).json({ message: 'Class scheduled successfully.', schedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Student: Get class schedule for their specific student class (ordered by date and time)
router.get('/student', auth, requireRole(['student']), async (req, res) => {
  try {
    const schedules = await Schedule.find({ studentClass: req.user.studentClass })
      .populate('faculty', 'name email department')
      .sort({ date: 1, startTime: 1 });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Faculty: Get class schedules created by the logged-in faculty
router.get('/faculty', auth, requireRole(['faculty']), async (req, res) => {
  try {
    const schedules = await Schedule.find({ faculty: req.user._id })
      .sort({ date: 1, startTime: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Faculty: Delete a class schedule
router.delete('/:id', auth, requireRole(['faculty']), async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndDelete({ _id: req.params.id, faculty: req.user._id });
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found or unauthorized.' });
    }
    res.json({ message: 'Schedule deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
