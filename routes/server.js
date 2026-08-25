const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch(err => {
    console.error('Database connection error:', err.message);
    console.log('Ensure you have configured MONGODB_URI in the .env file.');
  });

// API Routes
app.use('/api/auth', require('./auth'));
app.use('/api/attendance', require('./attendance'));
app.use('/api/marks', require('./marks'));
app.use('/api/schedule', require('./schedule'));
app.use('/api/seed', require('./seed'));

// Fallback to route all front-end requests to the landing/login page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AcademiaHub server is running on http://localhost:${PORT}`);
  console.log(`Use POST request to http://localhost:${PORT}/api/seed to initialize mock data.`);
});
