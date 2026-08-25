// Check Authentication on Page Load
const token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user'));

if (!token || !user || user.role !== 'student') {
  localStorage.clear();
  window.location.href = '/index.html';
}

// Global data objects
let attendanceData = [];
let marksData = [];
let schedulesData = [];

// Fetch fresh user profile details
async function fetchProfile() {
  try {
    const response = await fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (response.ok && data.user) {
      user = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  } catch (error) {
    console.error('Failed to sync profile:', error);
  }
}

// Initialize Dashboard
window.onload = async () => {
  await fetchProfile();
  setupProfileUI();
  await Promise.all([
    fetchAttendance(),
    fetchMarks(),
    fetchSchedules()
  ]);
  calculateDashboardOverview();
};

// Set User Profile UI Components
function setupProfileUI() {
  document.getElementById('nav-user-name').textContent = user.name;
  document.getElementById('greeting-title').textContent = `Welcome back, ${user.name}!`;
  document.getElementById('nav-avatar').textContent = user.name.charAt(0).toUpperCase();
  document.getElementById('student-meta-subtitle').textContent = `Class: ${user.studentClass || 'N/A'} | Dept: ${user.department || 'N/A'} | Roll: ${user.rollNumber || 'N/A'}`;
  document.getElementById('stat-class-info').textContent = user.studentClass || 'N/A';
}

// Section Navigation Tab Switching
function switchSection(sectionId, element) {
  // Hide all sections
  const sections = document.querySelectorAll('.dashboard-section');
  sections.forEach(sec => sec.classList.remove('active'));

  // Show selected section
  document.getElementById(`${sectionId}-section`).classList.add('active');

  // Update active state of buttons
  const buttons = document.querySelectorAll('.sidebar-menu button');
  buttons.forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');
}

// Log Out Handler
async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (err) {
    console.error('Logout error:', err);
  }
  localStorage.clear();
  window.location.href = '/index.html';
}

// Fetch Student's Attendance Records
async function fetchAttendance() {
  try {
    const response = await fetch('/api/attendance/my-attendance', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    attendanceData = data;
    renderAttendanceUI();
  } catch (error) {
    console.error('Error fetching attendance:', error);
  }
}

// Render Attendance Section UI
function renderAttendanceUI() {
  const tbody = document.getElementById('attendance-records-tbody');
  const subjectGrid = document.getElementById('attendance-subject-grid');
  const overviewProgress = document.getElementById('overview-attendance-progress');

  tbody.innerHTML = '';
  subjectGrid.innerHTML = '';
  overviewProgress.innerHTML = '';

  // Render logs history
  if (!attendanceData.records || attendanceData.records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No attendance records found.</td></tr>`;
  } else {
    attendanceData.records.forEach(record => {
      const date = new Date(record.date).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
      });
      const badgeClass = record.status === 'Present' ? 'badge-present' : 'badge-absent';
      
      tbody.innerHTML += `
        <tr>
          <td>${date}</td>
          <td><strong>${record.subject}</strong></td>
          <td><span class="badge ${badgeClass}">${record.status}</span></td>
          <td>${record.markedBy ? record.markedBy.name : 'Faculty'}</td>
        </tr>
      `;
    });
  }

  // Render Subject stats summaries
  if (!attendanceData.stats || attendanceData.stats.length === 0) {
    subjectGrid.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted); text-align: center;">No subject summary available.</p>`;
    overviewProgress.innerHTML = `<p style="color: var(--text-muted); font-size: 14px;">No attendance summaries recorded.</p>`;
  } else {
    attendanceData.stats.forEach(stat => {
      // Card details for Attendance tab
      subjectGrid.innerHTML += `
        <div class="stat-card">
          <div class="stat-icon" style="font-size: 20px;">📚</div>
          <div class="stat-content">
            <div class="stat-label" style="font-size: 11px;">${stat.subject}</div>
            <div class="stat-value" style="font-size: 20px;">${stat.percentage}%</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
              Attended ${stat.classesAttended} of ${stat.totalClasses} classes
            </div>
          </div>
        </div>
      `;

      // Progress bars for Overview tab
      overviewProgress.innerHTML += `
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600;">
            <span>${stat.subject}</span>
            <span>${stat.percentage}% (${stat.classesAttended}/${stat.totalClasses})</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${stat.percentage}%"></div>
          </div>
        </div>
      `;
    });
  }
}

// Fetch Student's Exam Marks
async function fetchMarks() {
  try {
    const response = await fetch('/api/marks/my-marks', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    marksData = data;
    renderMarksUI();
  } catch (error) {
    console.error('Error fetching marks:', error);
  }
}

// Render Gradebook UI
function renderMarksUI() {
  const tbody = document.getElementById('grades-records-tbody');
  tbody.innerHTML = '';

  if (marksData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No marks entered in the database yet.</td></tr>`;
  } else {
    marksData.forEach(mark => {
      const percentage = Math.round((mark.marksObtained / mark.maxMarks) * 100);
      
      tbody.innerHTML += `
        <tr>
          <td><strong>${mark.subject}</strong></td>
          <td>${mark.assessmentName}</td>
          <td>${mark.marksObtained}</td>
          <td>${mark.maxMarks}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>${percentage}%</span>
              <div class="progress-bar-container" style="margin: 0; width: 60px; height: 6px;">
                <div class="progress-bar-fill" style="width: ${percentage}%"></div>
              </div>
            </div>
          </td>
          <td>${mark.gradedBy ? mark.gradedBy.name : 'Faculty'}</td>
        </tr>
      `;
    });
  }
}

// Fetch Class Schedules for the Student
async function fetchSchedules() {
  try {
    const response = await fetch('/api/schedule/student', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    schedulesData = data;
    renderSchedulesUI();
  } catch (error) {
    console.error('Error fetching schedules:', error);
  }
}

// Render Class Timetables
function renderSchedulesUI() {
  const overviewList = document.getElementById('overview-schedule-list');
  const timetableList = document.getElementById('schedule-timetable-list');

  overviewList.innerHTML = '';
  timetableList.innerHTML = '';

  if (schedulesData.length === 0) {
    const emptyMsg = `<p style="color: var(--text-muted); font-size: 14px; text-align: center;">No class schedules recorded for your group.</p>`;
    overviewList.innerHTML = emptyMsg;
    timetableList.innerHTML = emptyMsg;
    return;
  }

  schedulesData.forEach(sched => {
    const classDate = new Date(sched.date);
    const dateFormatted = classDate.toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });

    const cardHTML = `
      <div class="schedule-card">
        <div class="schedule-info">
          <div class="schedule-subject">${sched.subject}</div>
          <div class="schedule-meta">
            <span>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${dateFormatted} | ${sched.startTime} - ${sched.endTime}
            </span>
            <span>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              ${sched.faculty ? sched.faculty.name : 'Faculty'}
            </span>
          </div>
          ${sched.description ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">${sched.description}</p>` : ''}
        </div>
        <div class="schedule-room">${sched.room}</div>
      </div>
    `;

    timetableList.innerHTML += cardHTML;
    
    // Add to overview only if date is today or later
    const today = new Date();
    today.setHours(0,0,0,0);
    if (classDate >= today) {
      overviewList.innerHTML += cardHTML;
    }
  });

  if (overviewList.innerHTML === '') {
    overviewList.innerHTML = `<p style="color: var(--text-muted); font-size: 14px; text-align: center;">No classes scheduled for today or upcoming dates.</p>`;
  }
}

// Compute General GPA and Attendance rates for dashboard
function calculateDashboardOverview() {
  // Attendance Calculation
  if (attendanceData.records && attendanceData.records.length > 0) {
    const total = attendanceData.records.length;
    const present = attendanceData.records.filter(r => r.status === 'Present').length;
    const rate = Math.round((present / total) * 100);
    const rateEl = document.getElementById('stat-attendance-rate');
    rateEl.textContent = `${rate}%`;
    
    if (rate >= 75) {
      rateEl.style.color = 'var(--accent-success)';
    } else {
      rateEl.style.color = 'var(--accent-danger)';
    }
  } else {
    document.getElementById('stat-attendance-rate').textContent = 'N/A';
  }

  // GPA Calculation (Average percentage of graded marks)
  if (marksData.length > 0) {
    let totalPercent = 0;
    marksData.forEach(m => {
      totalPercent += (m.marksObtained / m.maxMarks) * 100;
    });
    const avg = Math.round(totalPercent / marksData.length);
    document.getElementById('stat-gpa').textContent = `${avg}%`;
  } else {
    document.getElementById('stat-gpa').textContent = 'N/A';
  }

  // Next Class Logic
  if (schedulesData.length > 0) {
    const today = new Date().toDateString();
    
    // Check if there is any class matching today's date
    const todayClasses = schedulesData.filter(s => new Date(s.date).toDateString() === today);
    
    if (todayClasses.length > 0) {
      const next = todayClasses[0]; // Sort order guarantees earlier classes first
      document.getElementById('stat-next-class').innerHTML = `
        <div style="font-weight: 700; color: white;">${next.subject}</div>
        <div style="font-size: 12px; color: var(--accent-primary);">${next.startTime} in ${next.room}</div>
      `;
    } else {
      // Find first future class
      const futureClasses = schedulesData.filter(s => new Date(s.date) > new Date());
      if (futureClasses.length > 0) {
        const next = futureClasses[0];
        const dateStr = new Date(next.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        document.getElementById('stat-next-class').innerHTML = `
          <div style="font-weight: 700; color: white;">${next.subject}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${dateStr} | ${next.startTime}</div>
        `;
      } else {
        document.getElementById('stat-next-class').textContent = 'None Scheduled';
      }
    }
  } else {
    document.getElementById('stat-next-class').textContent = 'No Schedule';
  }
}
