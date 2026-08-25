const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  assessmentName: {
    type: String, // e.g. 'Quiz 1', 'Mid-Term', 'Final Exam'
    required: true,
    trim: true
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 1
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Avoid duplicate grading for the same student, subject, and assessmentName
markSchema.index({ student: 1, subject: 1, assessmentName: 1 }, { unique: true });

module.exports = mongoose.model('Mark', markSchema);
