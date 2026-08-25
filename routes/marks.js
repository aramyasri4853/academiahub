const express = require('express');
const Mark = require('../models/Mark');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Faculty: Assign or update marks for a student
router.post('/assign', auth, requireRole(['faculty']), async (req, res) => {
  try {
    const { studentId, subject, assessmentName, marksObtained, maxMarks } = req.body;

    if (!studentId || !subject || !assessmentName || marksObtained === undefined || !maxMarks) {
      return res.status(400).json({ error: 'All fields (studentId, subject, assessmentName, marksObtained, maxMarks) are required.' });
    }

    if (Number(marksObtained) > Number(maxMarks)) {
      return res.status(400).json({ error: 'Marks obtained cannot exceed maximum marks.' });
    }

    // Upsert the marks record
    const markRecord = await Mark.findOneAndUpdate(
      { student: studentId, subject, assessmentName },
      {
        marksObtained: Number(marksObtained),
        maxMarks: Number(maxMarks),
        gradedBy: req.user._id
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Marks assigned successfully.',
      record: markRecord
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Faculty: Bulk assign/save marks for multiple students
router.post('/assign-bulk', auth, requireRole(['faculty']), async (req, res) => {
  try {
    const { subject, assessmentName, maxMarks, grades } = req.body; // grades: [{ studentId, marksObtained }]
    
    if (!subject || !assessmentName || !maxMarks || !grades || !Array.isArray(grades)) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const savedMarks = [];
    const errors = [];

    for (const grade of grades) {
      try {
        if (Number(grade.marksObtained) > Number(maxMarks)) {
          errors.push({ studentId: grade.studentId, error: 'Marks obtained exceeds maximum marks.' });
          continue;
        }

        const markRecord = await Mark.findOneAndUpdate(
          { student: grade.studentId, subject, assessmentName },
          {
            marksObtained: Number(grade.marksObtained),
            maxMarks: Number(maxMarks),
            gradedBy: req.user._id
          },
          { upsert: true, new: true, runValidators: true }
        );
        savedMarks.push(markRecord);
      } catch (err) {
        errors.push({ studentId: grade.studentId, error: err.message });
      }
    }

    res.json({
      message: 'Bulk grades saved.',
      recordsSaved: savedMarks.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Student: Get their own grades
router.get('/my-marks', auth, requireRole(['student']), async (req, res) => {
  try {
    const marks = await Mark.find({ student: req.user._id })
      .populate('gradedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(marks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Faculty: Get class marks report for a specific subject and assessment
router.get('/report', auth, requireRole(['faculty']), async (req, res) => {
  try {
    const { studentClass, subject, assessmentName } = req.query;
    if (!studentClass || !subject || !assessmentName) {
      return res.status(400).json({ error: 'studentClass, subject, and assessmentName are required.' });
    }

    // Get all students in the class
    const students = await User.find({ role: 'student', studentClass }).select('_id name rollNumber');
    const studentIds = students.map(s => s._id);

    // Get mark records
    const markRecords = await Mark.find({
      student: { $in: studentIds },
      subject,
      assessmentName
    });

    const report = students.map(student => {
      const record = markRecords.find(m => m.student.toString() === student._id.toString());
      return {
        studentId: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        marksObtained: record ? record.marksObtained : '',
        maxMarks: record ? record.maxMarks : ''
      };
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
