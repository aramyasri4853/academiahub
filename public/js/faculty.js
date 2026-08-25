// Check Authentication on Page Load
const token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user'));

if (!token || !user || user.role !== 'faculty') {
  localStorage.clear();
  window.location.href = '/index.html';
}

// Global state variables
let schedulesCreated = [];
let loadedStudents = [];

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

// Initialize Page
window.onload = async () => {
  await fetchProfile();
  setupProfileUI();
  await fetchFacultySchedules();
  
  // Set default dates to today's date in search filters
  const todayISO = new Date().toISOString().split('T')[0];
  document.getElementById('att-date').value = todayISO;
  document.getElementById('sched-date').value = todayISO;
};

// Set User Profile UI Components
function setupProfileUI() {
  document.getElementById('nav-user-name').textContent = user.name;
  document.getElementById('greeting-title').textContent = `Welcome, ${user.name}!`;
  document.getElementById('nav-avatar').textContent = user.name.charAt(0).toUpperCase();
  document.getElementById('faculty-meta-subtitle').textContent = `ID: ${user.facultyId || 'N/A'} | Dept: ${user.department || 'N/A'}`;
  
  // Setup Overview stats cards
  document.getElementById('stat-faculty-id').textContent = user.facultyId || 'N/A';
  document.getElementById('stat-department').textContent = user.department || 'N/A';
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

// Fetch Schedules Created by this Faculty Member
async function fetchFacultySchedules() {
  try {
    const response = await fetch('/api/schedule/faculty', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    schedulesCreated = data;
    renderSchedulesUI();
    
    // Update Overview Stats Card
    document.getElementById('stat-class-count').textContent = schedulesCreated.length;
  } catch (err) {
    console.error('Error fetching schedules:', err);
  }
}

// Render Timetable Schedules
function renderSchedulesUI() {
  const overviewList = document.getElementById('overview-schedule-list');
  const timetableList = document.getElementById('faculty-timetable-list');

  overviewList.innerHTML = '';
  timetableList.innerHTML = '';

  if (schedulesCreated.length === 0) {
    const emptyMsg = `<p style="color: var(--text-muted); font-size: 14px; text-align: center;">No scheduled lectures found.</p>`;
    overviewList.innerHTML = emptyMsg;
    timetableList.innerHTML = emptyMsg;
    return;
  }

  schedulesCreated.forEach(sched => {
    const classDate = new Date(sched.date);
    const dateFormatted = classDate.toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });

    const cardHTML = `
      <div class="schedule-card" id="sched-card-${sched._id}">
        <div class="schedule-info">
          <div class="schedule-subject">${sched.subject} <span class="badge badge-schedule" style="margin-left: 8px;">${sched.studentClass}</span></div>
          <div class="schedule-meta">
            <span>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${dateFormatted} | ${sched.startTime} - ${sched.endTime}
            </span>
            <span>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              ${sched.room}
            </span>
          </div>
          ${sched.description ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">${sched.description}</p>` : ''}
        </div>
        <button class="btn-delete-schedule" onclick="deleteSchedule('${sched._id}')" title="Delete Schedule">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </div>
    `;

    timetableList.innerHTML += cardHTML;
    
    // Add to overview list if date is today or upcoming
    const today = new Date();
    today.setHours(0,0,0,0);
    if (classDate >= today) {
      overviewList.innerHTML += cardHTML;
    }
  });

  if (overviewList.innerHTML === '') {
    overviewList.innerHTML = `<p style="color: var(--text-muted); font-size: 14px; text-align: center;">No scheduled lectures for today or upcoming dates.</p>`;
  }
}

// Delete a Timetable Class Event
async function deleteSchedule(id) {
  if (!confirm('Are you sure you want to delete this schedule?')) return;

  try {
    const response = await fetch(`/api/schedule/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    // Remove element from DOM and state
    document.getElementById(`sched-card-${id}`).remove();
    schedulesCreated = schedulesCreated.filter(s => s._id !== id);
    fetchFacultySchedules(); // Refresh lists
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// Create a Class Schedule
document.getElementById('schedule-creator-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const alertEl = document.getElementById('sched-alert');
  const successEl = document.getElementById('sched-success');
  alertEl.style.display = 'none';
  successEl.style.display = 'none';

  const subject = document.getElementById('sched-subject').value;
  const studentClass = document.getElementById('sched-class').value;
  const room = document.getElementById('sched-room').value;
  const date = document.getElementById('sched-date').value;
  const startTime = document.getElementById('sched-start').value;
  const endTime = document.getElementById('sched-end').value;
  const description = document.getElementById('sched-desc').value;

  try {
    const response = await fetch('/api/schedule/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ subject, studentClass, room, date, startTime, endTime, description })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    successEl.textContent = 'Class scheduled successfully!';
    successEl.style.display = 'block';
    
    document.getElementById('schedule-creator-form').reset();
    
    // Refresh schedule data lists
    await fetchFacultySchedules();
  } catch (err) {
    alertEl.textContent = err.message;
    alertEl.style.display = 'block';
  }
});


// --- ATTENDANCE SYSTEM CONTROLLERS ---

let currentAttSubject = '';
let currentAttDate = '';

// Load Students list for Roll Call marking
document.getElementById('attendance-filter-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const studentClass = document.getElementById('att-class').value;
  currentAttSubject = document.getElementById('att-subject').value;
  currentAttDate = document.getElementById('att-date').value;

  document.getElementById('att-alert').style.display = 'none';
  document.getElementById('att-success').style.display = 'none';

  try {
    // Load student list combined with their recorded attendance if already existing
    const response = await fetch(`/api/attendance/report?studentClass=${studentClass}&subject=${currentAttSubject}&date=${currentAttDate}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    loadedStudents = data;
    renderAttendanceRollCall(studentClass);
  } catch (err) {
    alert('Failed to load student list: ' + err.message);
  }
});

// Render student list with toggles
function renderAttendanceRollCall(studentClass) {
  const panel = document.getElementById('attendance-roll-panel');
  const title = document.getElementById('attendance-roll-title');
  const tbody = document.getElementById('attendance-students-tbody');

  title.textContent = `${studentClass} | ${currentAttSubject} | ${new Date(currentAttDate).toLocaleDateString()}`;
  tbody.innerHTML = '';

  if (loadedStudents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">No students registered in class "${studentClass}".</td></tr>`;
    document.getElementById('btn-save-attendance').style.display = 'none';
  } else {
    document.getElementById('btn-save-attendance').style.display = 'inline-flex';
    
    loadedStudents.forEach(student => {
      // Default status to Present if not marked, or toggle true/false based on status
      const isChecked = student.status === 'Absent' ? '' : 'checked';
      
      tbody.innerHTML += `
        <tr>
          <td>${student.rollNumber}</td>
          <td><strong>${student.name}</strong></td>
          <td>
            <label class="toggle-switch">
              <input type="checkbox" class="attendance-toggle" data-id="${student.studentId}" ${isChecked}>
              <span class="toggle-slider">
                <span class="label-present">PRESENT</span>
                <span class="label-absent">ABSENT</span>
              </span>
            </label>
          </td>
        </tr>
      `;
    });
  }

  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth' });
}

// Submit Attendance List to Server
document.getElementById('btn-save-attendance').addEventListener('click', async () => {
  const saveBtn = document.getElementById('btn-save-attendance');
  const successEl = document.getElementById('att-success');
  const alertEl = document.getElementById('att-alert');

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  successEl.style.display = 'none';
  alertEl.style.display = 'none';

  const records = [];
  const toggles = document.querySelectorAll('.attendance-toggle');
  toggles.forEach(chk => {
    records.push({
      studentId: chk.getAttribute('data-id'),
      status: chk.checked ? 'Present' : 'Absent'
    });
  });

  try {
    const response = await fetch('/api/attendance/mark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        subject: currentAttSubject,
        date: currentAttDate,
        records
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    successEl.textContent = 'Attendance saved successfully!';
    successEl.style.display = 'block';
  } catch (err) {
    alertEl.textContent = err.message;
    alertEl.style.display = 'block';
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Attendance Records';
  }
});


// --- GRADES SYSTEM CONTROLLERS ---

let currentMarksClass = '';
let currentMarksSubject = '';
let currentMarksAssessment = '';
let currentMarksMax = 100;

// Fetch Student lists for grading
document.getElementById('marks-filter-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  currentMarksClass = document.getElementById('marks-class').value;
  currentMarksSubject = document.getElementById('marks-subject').value;
  currentMarksAssessment = document.getElementById('marks-assessment').value;
  currentMarksMax = document.getElementById('marks-max').value;

  document.getElementById('marks-alert').style.display = 'none';
  document.getElementById('marks-success').style.display = 'none';

  try {
    const response = await fetch(`/api/marks/report?studentClass=${currentMarksClass}&subject=${currentMarksSubject}&assessmentName=${currentMarksAssessment}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    loadedStudents = data;
    renderGradingRoll(currentMarksClass);
  } catch (err) {
    alert('Failed to load grade list: ' + err.message);
  }
});

// Render student list with marks input forms
function renderGradingRoll(studentClass) {
  const panel = document.getElementById('marks-input-panel');
  const title = document.getElementById('marks-roll-title');
  const labelMax = document.getElementById('marks-label-max');
  const tbody = document.getElementById('marks-students-tbody');

  title.textContent = `${studentClass} | ${currentMarksSubject} | ${currentMarksAssessment}`;
  labelMax.textContent = currentMarksMax;
  tbody.innerHTML = '';

  if (loadedStudents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">No students registered in class "${studentClass}".</td></tr>`;
    document.getElementById('btn-save-marks').style.display = 'none';
  } else {
    document.getElementById('btn-save-marks').style.display = 'inline-flex';

    loadedStudents.forEach(student => {
      tbody.innerHTML += `
        <tr>
          <td>${student.rollNumber}</td>
          <td><strong>${student.name}</strong></td>
          <td>
            <input type="number" 
                   class="form-input student-marks-input" 
                   data-id="${student.studentId}" 
                   style="width: 120px; padding-left: 12px;" 
                   placeholder="Score" 
                   min="0" 
                   max="${currentMarksMax}" 
                   value="${student.marksObtained}"
                   required>
          </td>
        </tr>
      `;
    });
  }

  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth' });
}

// Publish Grades
document.getElementById('btn-save-marks').addEventListener('click', async () => {
  const saveBtn = document.getElementById('btn-save-marks');
  const successEl = document.getElementById('marks-success');
  const alertEl = document.getElementById('marks-alert');

  saveBtn.disabled = true;
  saveBtn.textContent = 'Publishing...';
  successEl.style.display = 'none';
  alertEl.style.display = 'none';

  const grades = [];
  const inputs = document.querySelectorAll('.student-marks-input');
  
  let validationError = false;
  inputs.forEach(input => {
    const marksObtained = input.value;
    if (marksObtained === '') {
      validationError = 'All students must have a grade value entered.';
      return;
    }
    if (Number(marksObtained) > Number(currentMarksMax)) {
      validationError = 'Grades entered cannot exceed the max marks allowed.';
      return;
    }
    
    grades.push({
      studentId: input.getAttribute('data-id'),
      marksObtained: Number(marksObtained)
    });
  });

  if (validationError) {
    alertEl.textContent = validationError;
    alertEl.style.display = 'block';
    saveBtn.disabled = false;
    saveBtn.textContent = 'Publish Grade Records';
    return;
  }

  try {
    const response = await fetch('/api/marks/assign-bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        subject: currentMarksSubject,
        assessmentName: currentMarksAssessment,
        maxMarks: Number(currentMarksMax),
        grades
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    successEl.textContent = 'Grades published and student records updated successfully!';
    successEl.style.display = 'block';
  } catch (err) {
    alertEl.textContent = err.message;
    alertEl.style.display = 'block';
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Publish Grade Records';
  }
});
