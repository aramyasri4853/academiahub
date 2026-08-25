// Tab Switcher between Login and Register
function switchTab(tab) {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // Clear alerts
  hideAlerts();

  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  } else {
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    
    // Trigger department section selection setup
    onDepartmentSelectChange();
  }
}

// Map of sections per department
const sectionsMap = {
  'Computer Science': ['CSE-1', 'CSE-2', 'CSE-3'],
  'Electronics & Communication': ['ECE-1'],
  'Civil Engineering': ['CIVIL-1'],
  'Mechanical Engineering': ['MECH-1']
};

// Department selection via visual cards
function selectDepartment(dept) {
  // 1. Remove active state from all department cards
  document.querySelectorAll('.dept-card').forEach(card => card.classList.remove('active'));
  
  // 2. Add active class to corresponding card
  if (dept === 'Computer Science') document.getElementById('dept-cs').classList.add('active');
  if (dept === 'Electronics & Communication') document.getElementById('dept-ece').classList.add('active');
  if (dept === 'Civil Engineering') document.getElementById('dept-civil').classList.add('active');
  if (dept === 'Mechanical Engineering') document.getElementById('dept-mech').classList.add('active');
  
  // 3. Update department select dropdown in Registration form
  const regDeptSelect = document.getElementById('reg-dept');
  if (regDeptSelect) {
    regDeptSelect.value = dept;
    onDepartmentSelectChange();
  }
}

// Triggered when department select dropdown changes in registration form
function onDepartmentSelectChange() {
  const dept = document.getElementById('reg-dept').value;
  const classSelect = document.getElementById('reg-class');
  if (!classSelect) return;
  
  // Clear previous options
  classSelect.innerHTML = '';
  
  const sections = sectionsMap[dept] || [];
  sections.forEach(sec => {
    const opt = document.createElement('option');
    opt.value = sec;
    opt.textContent = sec;
    classSelect.appendChild(opt);
  });
}

// Show/Hide Role-Specific Fields in Registration Form
function toggleRoleFields() {
  const role = document.getElementById('reg-role').value;
  const studentFields = document.getElementById('student-fields');
  const facultyFields = document.getElementById('faculty-fields');

  const rollInput = document.getElementById('reg-roll');
  const classSelect = document.getElementById('reg-class');
  const facultyIdInput = document.getElementById('reg-faculty-id');

  if (role === 'student') {
    studentFields.style.display = 'block';
    facultyFields.style.display = 'none';
    rollInput.required = true;
    classSelect.required = true;
    facultyIdInput.required = false;
  } else {
    studentFields.style.display = 'none';
    facultyFields.style.display = 'block';
    rollInput.required = false;
    classSelect.required = false;
    facultyIdInput.required = true;
  }
}

// Alert utility helpers
function showAlert(type, message) {
  const alertEl = document.getElementById('auth-alert');
  const successEl = document.getElementById('auth-success');
  
  if (type === 'danger') {
    alertEl.textContent = message;
    alertEl.style.display = 'block';
    successEl.style.display = 'none';
  } else {
    successEl.textContent = message;
    successEl.style.display = 'block';
    alertEl.style.display = 'none';
  }
}

// Hide alerts
function hideAlerts() {
  document.getElementById('auth-alert').style.display = 'none';
  document.getElementById('auth-success').style.display = 'none';
}

// Handle Form Login Submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlerts();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const submitBtn = document.getElementById('btn-login-submit');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Authenticating...';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed.');
    }

    // Save token and user info
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showAlert('success', 'Login successful! Redirecting...');
    
    // Redirect based on role
    setTimeout(() => {
      if (data.user.role === 'student') {
        window.location.href = '/student.html';
      } else if (data.user.role === 'faculty') {
        window.location.href = '/faculty.html';
      }
    }, 1000);

  } catch (error) {
    showAlert('danger', error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
  }
});

// Handle Form Registration Submission
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlerts();

  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;
  const department = document.getElementById('reg-dept').value;
  const rollNumber = document.getElementById('reg-roll').value;
  const studentClass = document.getElementById('reg-class').value;
  const facultyId = document.getElementById('reg-faculty-id').value;
  const submitBtn = document.getElementById('btn-register-submit');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Registering...';

  try {
    const payload = { name, email, password, role, department };
    if (role === 'student') {
      payload.rollNumber = rollNumber;
      payload.studentClass = studentClass;
    } else {
      payload.facultyId = facultyId;
    }

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed.');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showAlert('success', 'Registration successful! Directing to dashboard...');

    setTimeout(() => {
      if (data.user.role === 'student') {
        window.location.href = '/student.html';
      } else if (data.user.role === 'faculty') {
        window.location.href = '/faculty.html';
      }
    }, 1000);

  } catch (error) {
    showAlert('danger', error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  }
});

// Handle Database Seeding
document.getElementById('btn-seed-db').addEventListener('click', async () => {
  const seedBtn = document.getElementById('btn-seed-db');
  seedBtn.disabled = true;
  seedBtn.textContent = 'Seeding...';
  
  try {
    const response = await fetch('/api/seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Database seeding failed.');
    }
    
    showAlert('success', 'Database seeded successfully! Try logging in with the seeded accounts.');
    
    // Log credentials to console for easy copy-paste
    console.log("Seeded Accounts Data:", data.credentials);
    
    // Auto-fill standard faculty profile for easy testing
    document.getElementById('login-email').value = data.credentials.faculty[0].email;
    document.getElementById('login-password').value = data.credentials.faculty[0].password;
    
    // Render credentials details underneath the button
    const container = document.getElementById('seed-helper');
    container.innerHTML = `
      <p style="font-size: 13px; color: var(--accent-success); font-weight: 700; margin-bottom: 8px;">Database Seeded! Select an Account to Auto-fill:</p>
      <div style="display: flex; flex-direction: column; gap: 6px; text-align: left; max-height: 250px; overflow-y: auto; padding-right: 4px;">
        <button onclick="autofill('alice@college.edu', 'password123')" class="btn-seed" style="background: var(--bg-tertiary); border: 1px solid var(--glass-border); text-align: left; width: 100%; color: white; padding: 6px 10px;">
          🔑 Faculty: Dr. Alice Vance (CSE)
        </button>
        <button onclick="autofill('george@college.edu', 'password123')" class="btn-seed" style="background: var(--bg-tertiary); border: 1px solid var(--glass-border); text-align: left; width: 100%; color: white; padding: 6px 10px;">
          🔑 Faculty: Prof. George Clark (ECE)
        </button>
        <button onclick="autofill('robert@college.edu', 'password123')" class="btn-seed" style="background: var(--bg-tertiary); border: 1px solid var(--glass-border); text-align: left; width: 100%; color: white; padding: 6px 10px;">
          🔑 Faculty: Prof. Robert Miller (Civil)
        </button>
        <button onclick="autofill('sarah@college.edu', 'password123')" class="btn-seed" style="background: var(--bg-tertiary); border: 1px solid var(--glass-border); text-align: left; width: 100%; color: white; padding: 6px 10px;">
          🔑 Faculty: Dr. Sarah Connor (Mech)
        </button>
        <button onclick="autofill('charlie@college.edu', 'password123')" class="btn-seed" style="background: var(--bg-tertiary); border: 1px solid var(--glass-border); text-align: left; width: 100%; color: white; padding: 6px 10px;">
          🔑 Student: Charlie Brown (CSE-1)
        </button>
        <button onclick="autofill('grace@college.edu', 'password123')" class="btn-seed" style="background: var(--bg-tertiary); border: 1px solid var(--glass-border); text-align: left; width: 100%; color: white; padding: 6px 10px;">
          🔑 Student: Grace Kelly (ECE-1)
        </button>
        <button onclick="autofill('arthur@college.edu', 'password123')" class="btn-seed" style="background: var(--bg-tertiary); border: 1px solid var(--glass-border); text-align: left; width: 100%; color: white; padding: 6px 10px;">
          🔑 Student: Arthur Pendragon (CIVIL-1)
        </button>
        <button onclick="autofill('sarah_s@college.edu', 'password123')" class="btn-seed" style="background: var(--bg-tertiary); border: 1px solid var(--glass-border); text-align: left; width: 100%; color: white; padding: 6px 10px;">
          🔑 Student: Sarah Connor (MECH-1)
        </button>
      </div>
      <p style="font-size: 10px; color: var(--text-muted); margin-top: 8px;">All passwords are "password123"</p>
    `;
    
  } catch (error) {
    showAlert('danger', error.message);
    seedBtn.disabled = false;
    seedBtn.textContent = 'Seed Database (Mock Data)';
  }
});

// Auto-fill function
function autofill(email, password) {
  document.getElementById('login-email').value = email;
  document.getElementById('login-password').value = password;
}

// Redirect if already logged in
window.onload = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  if (user && token) {
    if (user.role === 'student') {
      window.location.href = '/student.html';
    } else if (user.role === 'faculty') {
      window.location.href = '/faculty.html';
    }
  }
  
  // Setup fields initialization
  toggleRoleFields();
  onDepartmentSelectChange();
};
