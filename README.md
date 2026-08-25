# AcademiaHub - Premium College Management System

AcademiaHub is a modern, high-fidelity, full-stack college portal designed to manage class schedules, attendance tracking, and student grades. Built using **Node.js**, **Express**, **MongoDB (Mongoose)**, and **Vanilla HTML5/CSS3/JavaScript**, this application is optimized for lightweight execution and instant free cloud deployment (e.g., Render, Railway, Fly.io, MongoDB Atlas).

---

## 🌟 Key Features

### 🔐 Unified Authentication
- **Multi-Role Support**: Secure Sign-in and Registration for both **Students** and **Faculty Members**.
- **State Management**: Built on JSON Web Tokens (JWT) stored in secure HTTP-Only cookies or local storage.
- **Dynamic Portals**: Automatic redirection to roles-specific panels after validation.

### 👨‍🏫 Faculty Dashboard
- **Roll Call Attendance Manager**: Retrieve students by section, toggle statuses (Absent/Present) using custom sliding toggle switches, and save roll calls.
- **Timetable Scheduler**: Create lecture timetables specifying subjects, target class sections, room numbers, and start/end slots.
- **Academic Gradebook**: Assign and publish marks/grades for tests or midterm exams in bulk.

### 👨‍🎓 Student Dashboard
- **Analytics Overview**: View overall attendance percentages and grade averages in real-time.
- **Attendance Breakdown**: Track progress-bar progress for individual courses.
- **Timetable Schedule**: Chronological tracker of upcoming lectures and classroom locations.
- **Grades Transcript**: Instant access to review exam performance with grade progress markers.

### 🧪 Database Seeding Helper
- **One-Click Mock Setup**: Populate the database with sample faculty members, students, classes, timetables, and grades instantly via the login page.

---

## 📂 Project Architecture

```text
├── models/
│   ├── User.js          # User profiles (Student/Faculty metadata)
│   ├── Attendance.js    # Attendance logs
│   ├── Schedule.js      # Class schedules
│   └── Mark.js          # Exam and test grades
├── routes/
│   ├── auth.js          # Authentication endpoints
│   ├── attendance.js    # Attendance roll call reports
│   ├── marks.js         # Student grades assignment
│   ├── schedule.js      # Timetable scheduler
│   └── seed.js          # Database seed helper
├── middleware/
│   └── auth.js          # JWT & Role authorization middleware
├── public/
│   ├── css/
│   │   └── style.css    # Custom Glassmorphism CSS Design system
│   ├── js/
│   │   ├── auth.js      # Login and Registration handler
│   │   ├── student.js   # Student dashboard controller
│   │   └── faculty.js   # Faculty dashboard controller
│   ├── index.html       # Landing page (Gateways)
│   ├── student.html     # Student portal
│   └── faculty.html     # Faculty portal
├── .env.example         # Template for environment variables
├── .env                 # Local variables (git-ignored)
├── package.json         # Server dependency configurations
└── server.js            # Express app entry point
```

---

## 🚀 Local Installation & Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **MongoDB** (local server running on port `27017` OR a MongoDB Atlas cloud URI)

### Steps
1. **Clone or copy the directory** to your local workspace:
   ```bash
   cd "c:\Users\Dell\OneDrive\Desktop\college_management system"
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Open the `.env` file and verify or update the port and database connection URI:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/academiahub
   JWT_SECRET=super_secret_academiahub_key_12345
   NODE_ENV=development
   ```

4. **Run the Application**:
   - For production mode:
     ```bash
     npm start
     ```
   - For live-reload development mode:
     ```bash
     npm run dev
     ```

5. **Access Portal**:
   - Open your browser to [http://localhost:5000](http://localhost:5000).
   - Click **Seed Database (Mock Data)** to automatically populate the database and auto-fill login credentials.

---

## ☁️ Cloud Deployment Guide (Free Tier)

This application is ready for production cloud deployment. You can easily deploy the **backend server** (which serves the frontend public assets) to **Render** and link it to **MongoDB Atlas**.

### Phase 1: Setup MongoDB Atlas (Free Database)
1. Register for a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new project and provision a **Free M0 Shared Cluster** (choose AWS, GCP, or Azure).
3. In **Database Access**, create a user account with a username and password.
4. In **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`) so that cloud hosting services (like Render) can connect to it.
5. In your cluster dashboard, click **Connect** -> **Drivers** -> Copy the connection string (looks like `mongodb+srv://<username>:<password>@cluster0...`).

### Phase 2: Host the Application on Render (Free Hosting)
1. Push your project files to a **GitHub** repository.
2. Sign up on [Render.com](https://render.com) using your GitHub account.
3. In the Render Dashboard, click **New +** and select **Web Service**.
4. Connect your newly created GitHub repository.
5. Configure the Web Service settings:
   - **Name**: `academia-hub` (or any unique name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Select the **Free** plan.
6. Scroll down and click **Advanced** -> **Add Environment Variable**:
   - `MONGODB_URI` = *Paste your MongoDB Atlas connection string* (be sure to replace `<password>` with your database user's password)
   - `JWT_SECRET` = *Use a secure random string (e.g. `d398f4bbd05cf5253e6b12ea662ec872`)*
   - `NODE_ENV` = `production`
7. Click **Deploy Web Service**.
8. Once built, Render will supply a public URL (e.g., `https://academia-hub.onrender.com`). You can visit this URL to test your live, cloud-deployed site!
