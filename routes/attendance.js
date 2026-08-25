const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Faculty: Get list of students in a class/section
router.get('/students', auth, requireRole(['faculty']), async (req, res) => {
  try {
    const { studentClass } = req.query;
    if (!studentClass) {
      return res.status(400).json({ error: 'studentClass query parameter is required.' });
    }
    const students = await User.find({ role: 'student', studentClass }).select('name email rollNumber studentClass');
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Faculty: Mark attendance for multiple students
router.post('/mark', auth, requireRole(['faculty']), async (req, res) => {
  try {
    const { subject, date, records } = req.body; // records: [{ studentId: '...', status: 'Present'/'Absent' }]
    
    if (!subject || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Missing required fields: subject, date, and records array.' });
    }

    const attendanceRecords = [];
    const errors = [];

    // Use bulk write or loop for simple transaction-like entry
    for (const record of records) {
      try {
        // Upsert attendance record: if it exists, update it, otherwise create new
        const updatedRecord = await Attendance.findOneAndUpdate(
          {
            student: record.studentId,
            subject: subject,
            date: new Date(date)
          },
          {
            status: record.status,
            markedBy: req.user._id
          },
          {
            upsert: true,
            new: true,
            runValidators: true
          }
        );
        attendanceRecords.push(updatedRecord);
      } catch (err) {
        errors.push({ studentId: record.studentId, error: err.message });
      }
    }

    res.status(200).json({
      message: 'Attendance saved successfully.',
      recordsSaved: attendanceRecords.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Student: Get their own attendance records and overview percentages
router.get('/my-attendance', auth, requireRole(['student']), async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.user._id })
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    // Calculate subject-wise percentages
    const subjectStats = {};
    attendance.forEach(record => {
      if (!subjectStats[record.subject]) {
        subjectStats[record.subject] = { total: 0, present: 0 };
      }
      subjectStats[record.subject].total++;
      if (record.status === 'Present') {
        subjectStats[record.subject].present++;
      }
    });

    const percentages = Object.keys(subjectStats).map(subject => {
      const { total, present } = subjectStats[subject];
      return {
        subject,
        totalClasses: total,
        classesAttended: present,
        percentage: Math.round((present / total) * 100)
      };
    });

    res.json({
      records: attendance,
      stats: percentages
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Faculty: Retrieve attendance record for a class, date and subject (to view/edit existing markings)
router.get('/report', auth, requireRole(['faculty']), async (req, res) => {
  try {
    const { studentClass, subject, date } = req.query;
    if (!studentClass || !subject || !date) {
      return res.status(400).json({ error: 'studentClass, subject, and date are required.' });
    }

    // Get all students in that class
    const students = await User.find({ role: 'student', studentClass }).select('_id name rollNumber');
    const studentIds = students.map(s => s._id);

    // Get attendance records for those students on that date & subject
    const attendanceRecords = await Attendance.find({
      student: { $in: studentIds },
      subject,
      date: new Date(date)
    });

    // Map status to student list
    const report = students.map(student => {
      const record = attendanceRecords.find(r => r.student.toString() === student._id.toString());
      return {
        studentId: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        status: record ? record.status : 'Not Marked' // Present, Absent or Not Marked
      };
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
