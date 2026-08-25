const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // HH:MM
    required: true
  },
  endTime: {
    type: String, // HH:MM
    required: true
  },
  room: {
    type: String,
    required: true,
    trim: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentClass: {
    type: String, // Target class e.g. 'CS-A'
    required: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Schedule', scheduleSchema);
