const express = require('express');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Schedule = require('../models/Schedule');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    // DO NOT CLEAR DATA! Preserve existing students, faculty, schedules, attendance, and marks.
    // Instead, we only insert records if they do not exist.

    // 1. Helper function to upsert a Faculty Member
    const upsertFaculty = async (facultyData) => {
      let f = await User.findOne({ email: facultyData.email });
      if (!f) {
        f = new User(facultyData);
        await f.save();
      }
      return f;
    };

    const faculty1 = await upsertFaculty({
      name: 'Dr. Alice Vance',
      email: 'alice@college.edu',
      password: 'password123',
      role: 'faculty',
      department: 'Computer Science',
      facultyId: 'FAC001'
    });

    const faculty2 = await upsertFaculty({
      name: 'Prof. George Clark',
      email: 'george@college.edu',
      password: 'password123',
      role: 'faculty',
      department: 'Electronics & Communication',
      facultyId: 'FAC002'
    });

    const faculty3 = await upsertFaculty({
      name: 'Prof. Robert Miller',
      email: 'robert@college.edu',
      password: 'password123',
      role: 'faculty',
      department: 'Civil Engineering',
      facultyId: 'FAC003'
    });

    const faculty4 = await upsertFaculty({
      name: 'Dr. Sarah Connor',
      email: 'sarah@college.edu',
      password: 'password123',
      role: 'faculty',
      department: 'Mechanical Engineering',
      facultyId: 'FAC004'
    });

    // 2. Helper function to upsert a Student
    const upsertStudent = async (studentData, department) => {
      let s = await User.findOne({ email: studentData.email });
      if (!s) {
        s = new User({ ...studentData, password: 'password123', role: 'student', department });
        await s.save();
      }
      return s;
    };

    // 10 Students in CSE (divided across 3 sections: CSE-1, CSE-2, CSE-3)
    const cseStudentsData = [
      { name: 'Charlie Brown', email: 'charlie@college.edu', rollNumber: '1A201', studentClass: 'CSE-1' },
      { name: 'Daisy Ridley', email: 'daisy@college.edu', rollNumber: '1A202', studentClass: 'CSE-1' },
      { name: 'Ethan Hunt', email: 'ethan@college.edu', rollNumber: '1A203', studentClass: 'CSE-1' },
      { name: 'Fiona Gallagher', email: 'fiona@college.edu', rollNumber: '1A204', studentClass: 'CSE-1' },
      { name: 'Gary Oldman', email: 'gary@college.edu', rollNumber: '1A205', studentClass: 'CSE-2' },
      { name: 'Hannah Abbott', email: 'hannah@college.edu', rollNumber: '1A206', studentClass: 'CSE-2' },
      { name: 'Ian Malcolm', email: 'ian@college.edu', rollNumber: '1A207', studentClass: 'CSE-2' },
      { name: 'Julia Roberts', email: 'julia@college.edu', rollNumber: '1A208', studentClass: 'CSE-3' },
      { name: 'Kevin Bacon', email: 'kevin@college.edu', rollNumber: '1A209', studentClass: 'CSE-3' },
      { name: 'Liam Neeson', email: 'liam@college.edu', rollNumber: '1A210', studentClass: 'CSE-3' }
    ];

    // 10 Students in ECE (ECE-1)
    const eceStudentsData = [
      { name: 'Grace Kelly', email: 'grace@college.edu', rollNumber: '2A101', studentClass: 'ECE-1' },
      { name: 'Harry Potter', email: 'harry@college.edu', rollNumber: '2A102', studentClass: 'ECE-1' },
      { name: 'Isabella Swan', email: 'isabella@college.edu', rollNumber: '2A103', studentClass: 'ECE-1' },
      { name: 'Jack Sparrow', email: 'jack@college.edu', rollNumber: '2A104', studentClass: 'ECE-1' },
      { name: 'Katniss Everdeen', email: 'katniss@college.edu', rollNumber: '2A105', studentClass: 'ECE-1' },
      { name: 'Luke Skywalker', email: 'luke@college.edu', rollNumber: '2A106', studentClass: 'ECE-1' },
      { name: 'Mona Lisa', email: 'mona@college.edu', rollNumber: '2A107', studentClass: 'ECE-1' },
      { name: 'Neville Longbottom', email: 'neville@college.edu', rollNumber: '2A108', studentClass: 'ECE-1' },
      { name: 'Olivia Pope', email: 'olivia@college.edu', rollNumber: '2A109', studentClass: 'ECE-1' },
      { name: 'Peter Parker', email: 'peter@college.edu', rollNumber: '2A110', studentClass: 'ECE-1' }
    ];

    // 10 Students in CIVIL (CIVIL-1)
    const civilStudentsData = [
      { name: 'Arthur Pendragon', email: 'arthur@college.edu', rollNumber: '3A301', studentClass: 'CIVIL-1' },
      { name: 'Bruce Wayne', email: 'bruce@college.edu', rollNumber: '3A302', studentClass: 'CIVIL-1' },
      { name: 'Clark Kent', email: 'clark@college.edu', rollNumber: '3A303', studentClass: 'CIVIL-1' },
      { name: 'Diana Prince', email: 'diana@college.edu', rollNumber: '3A304', studentClass: 'CIVIL-1' },
      { name: 'Emma Watson', email: 'emma@college.edu', rollNumber: '3A305', studentClass: 'CIVIL-1' },
      { name: 'Frodo Baggins', email: 'frodo@college.edu', rollNumber: '3A306', studentClass: 'CIVIL-1' },
      { name: 'Gandalf Grey', email: 'gandalf@college.edu', rollNumber: '3A307', studentClass: 'CIVIL-1' },
      { name: 'Hermione Granger', email: 'hermione@college.edu', rollNumber: '3A308', studentClass: 'CIVIL-1' },
      { name: 'Indiana Jones', email: 'indiana@college.edu', rollNumber: '3A309', studentClass: 'CIVIL-1' },
      { name: 'Jon Snow', email: 'jon@college.edu', rollNumber: '3A310', studentClass: 'CIVIL-1' }
    ];

    // 10 Students in MECH (MECH-1)
    const mechStudentsData = [
      { name: 'Sarah Connor Student', email: 'sarah_s@college.edu', rollNumber: '4A401', studentClass: 'MECH-1' },
      { name: 'Tony Stark', email: 'tony@college.edu', rollNumber: '4A402', studentClass: 'MECH-1' },
      { name: 'Ulysses Klaw', email: 'ulysses@college.edu', rollNumber: '4A403', studentClass: 'MECH-1' },
      { name: 'Victor Stone', email: 'victor@college.edu', rollNumber: '4A404', studentClass: 'MECH-1' },
      { name: 'Wanda Maximoff', email: 'wanda@college.edu', rollNumber: '4A405', studentClass: 'MECH-1' },
      { name: 'Xavier Charles', email: 'xavier@college.edu', rollNumber: '4A406', studentClass: 'MECH-1' },
      { name: 'Ygritte Wild', email: 'ygritte@college.edu', rollNumber: '4A407', studentClass: 'MECH-1' },
      { name: 'Zack Snyder', email: 'zack@college.edu', rollNumber: '4A408', studentClass: 'MECH-1' },
      { name: 'Abigail Sciuto', email: 'abigail@college.edu', rollNumber: '4A409', studentClass: 'MECH-1' },
      { name: 'Bobby Singer', email: 'bobby@college.edu', rollNumber: '4A410', studentClass: 'MECH-1' }
    ];

    const cseStudents = [];
    const eceStudents = [];
    const civilStudents = [];
    const mechStudents = [];

    for (const student of cseStudentsData) {
      const s = await upsertStudent(student, 'Computer Science');
      cseStudents.push(s);
    }
    for (const student of eceStudentsData) {
      const s = await upsertStudent(student, 'Electronics & Communication');
      eceStudents.push(s);
    }
    for (const student of civilStudentsData) {
      const s = await upsertStudent(student, 'Civil Engineering');
      civilStudents.push(s);
    }
    for (const student of mechStudentsData) {
      const s = await upsertStudent(student, 'Mechanical Engineering');
      mechStudents.push(s);
    }

    // 3. Helper function to upsert Class Schedules
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const upsertSchedule = async (scheduleData) => {
      let s = await Schedule.findOne({
        subject: scheduleData.subject,
        studentClass: scheduleData.studentClass,
        date: scheduleData.date
      });
      if (!s) {
        s = new Schedule(scheduleData);
        await s.save();
      }
      return s;
    };

    await upsertSchedule({
      subject: 'Data Structures & Algorithms',
      date: today,
      startTime: '09:00',
      endTime: '10:30',
      room: 'Seminar Hall 1',
      faculty: faculty1._id,
      studentClass: 'CSE-1',
      description: 'Introduction to tree and graph data structures.'
    });

    await upsertSchedule({
      subject: 'Digital Signal Processing',
      date: today,
      startTime: '11:00',
      endTime: '12:30',
      room: 'ECE Lab 2',
      faculty: faculty2._id,
      studentClass: 'ECE-1',
      description: 'Z-transforms and Fourier series analysis.'
    });

    await upsertSchedule({
      subject: 'Structural Analysis',
      date: tomorrow,
      startTime: '10:00',
      endTime: '11:30',
      room: 'Civil Drafting Room',
      faculty: faculty3._id,
      studentClass: 'CIVIL-1',
      description: 'Beams bending moments calculations.'
    });

    await upsertSchedule({
      subject: 'Thermodynamics',
      date: tomorrow,
      startTime: '13:30',
      endTime: '15:00',
      room: 'Mechanical Hall A',
      faculty: faculty4._id,
      studentClass: 'MECH-1',
      description: 'First law of thermodynamics and Carnot cycle.'
    });

    // 4. Helper function to upsert Attendance
    const upsertAttendance = async (attData) => {
      let a = await Attendance.findOne({
        student: attData.student,
        subject: attData.subject,
        date: attData.date
      });
      if (!a) {
        a = new Attendance(attData);
        await a.save();
      }
      return a;
    };

    await upsertAttendance({ student: cseStudents[0]._id, subject: 'Data Structures & Algorithms', date: today, status: 'Present', markedBy: faculty1._id });
    await upsertAttendance({ student: cseStudents[1]._id, subject: 'Data Structures & Algorithms', date: today, status: 'Absent', markedBy: faculty1._id });
    await upsertAttendance({ student: eceStudents[0]._id, subject: 'Digital Signal Processing', date: today, status: 'Present', markedBy: faculty2._id });
    await upsertAttendance({ student: civilStudents[0]._id, subject: 'Structural Analysis', date: tomorrow, status: 'Present', markedBy: faculty3._id });
    await upsertAttendance({ student: mechStudents[0]._id, subject: 'Thermodynamics', date: tomorrow, status: 'Present', markedBy: faculty4._id });

    // 5. Helper function to upsert Marks
    const upsertMark = async (markData) => {
      let m = await Mark.findOne({
        student: markData.student,
        subject: markData.subject,
        assessmentName: markData.assessmentName
      });
      if (!m) {
        m = new Mark(markData);
        await m.save();
      }
      return m;
    };

    await upsertMark({ student: cseStudents[0]._id, subject: 'Data Structures & Algorithms', assessmentName: 'Midterm Exam', marksObtained: 88, maxMarks: 100, gradedBy: faculty1._id });
    await upsertMark({ student: eceStudents[0]._id, subject: 'Digital Signal Processing', assessmentName: 'Midterm Exam', marksObtained: 94, maxMarks: 100, gradedBy: faculty2._id });
    await upsertMark({ student: civilStudents[0]._id, subject: 'Structural Analysis', assessmentName: 'Midterm Exam', marksObtained: 79, maxMarks: 100, gradedBy: faculty3._id });
    await upsertMark({ student: mechStudents[0]._id, subject: 'Thermodynamics', assessmentName: 'Midterm Exam', marksObtained: 85, maxMarks: 100, gradedBy: faculty4._id });

    res.status(200).json({
      message: 'Database seeded successfully without erasing custom data!',
      credentials: {
        faculty: [
          { email: 'alice@college.edu', password: 'password123', name: 'Dr. Alice Vance (CS)' },
          { email: 'george@college.edu', password: 'password123', name: 'Prof. George Clark (ECE)' },
          { email: 'robert@college.edu', password: 'password123', name: 'Prof. Robert Miller (Civil)' },
          { email: 'sarah@college.edu', password: 'password123', name: 'Dr. Sarah Connor (Mech)' }
        ],
        students: [
          { email: 'charlie@college.edu', password: 'password123', name: 'Charlie Brown (CSE-1)' },
          { email: 'grace@college.edu', password: 'password123', name: 'Grace Kelly (ECE-1)' },
          { email: 'arthur@college.edu', password: 'password123', name: 'Arthur Pendragon (CIVIL-1)' },
          { email: 'sarah_s@college.edu', password: 'password123', name: 'Sarah Connor (MECH-1)' }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
