# 🎓 Future Bridge – Smart Education System

> A production-ready, full-stack education platform with AI coaching, real-time chat, DSA practice, code execution, and role-based dashboards.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue) ![AI](https://img.shields.io/badge/AI-Gemini-orange) ![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Quick Start (Local)](#quick-start-local)
5. [Environment Variables](#environment-variables)
6. [API Reference](#api-reference)
7. [Demo Accounts](#demo-accounts)
8. [Deployment](#deployment)
9. [Docker Setup](#docker-setup)

---

## ✨ Features

### 🎓 Student Dashboard
- Browse academic, competitive & placement courses
- **LeetNext DSA Sheet** — topic/company-wise problems with progress tracking
- **Code Editor & Compiler** — Monaco editor + Judge0 API (C++, Java, Python, JS)
- **AI Interview Coach** — Gemini-powered mock interviews with scoring
- **Resume Generator** — AI-generated ATS-optimized resumes
- **Cover Letter Generator** — Personalized letters for any company
- **AI Code Review** — Complexity analysis and suggestions
- **Real-time Chat** — Socket.io powered discussion forum with rooms
- **Job Portal** — Browse & apply to curated internships/jobs
- **Task Manager** — Kanban-style productivity tracker

### 👨‍🏫 Teacher Dashboard
- Create and manage courses with lessons
- Create & grade assignments
- Track student enrollments
- Forum participation

### 🛡️ Admin Dashboard
- Full user management (CRUD + role control)
- Platform-wide analytics and charts
- Manage all courses and jobs
- Real-time activity monitoring

---

## 🛠️ Tech Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| Frontend    | React 18, Tailwind CSS, React Router 6  |
| Backend     | Node.js, Express.js, Socket.io          |
| Database    | MongoDB, Mongoose ORM                   |
| Auth        | JWT (JSON Web Tokens), bcryptjs          |
| AI          | Google Gemini API (REST)                |
| Code Exec   | Judge0 API (via RapidAPI)               |
| Editor      | Monaco Editor (@monaco-editor/react)    |
| Charts      | Recharts                                |
| Realtime    | Socket.io                               |
| Deployment  | Vercel (FE), Render/Railway (BE), MongoDB Atlas |

---

## 📁 Project Structure

```
future-bridge/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Login, register, profile
│   │   ├── courseController.js    # Course CRUD + enrollment
│   │   ├── mainController.js      # Tasks, Jobs, DSA, Chat, Assignments
│   │   ├── userController.js      # Admin user management
│   │   ├── aiController.js        # Gemini AI features
│   │   └── compilerController.js  # Judge0 code execution
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + authorize
│   │   └── error.js               # Error handler + AppError
│   ├── models/
│   │   ├── User.js                # User schema (student/teacher/admin)
│   │   ├── Course.js              # Course + lessons schema
│   │   └── index.js               # Task, Job, Chat, DSA, Assignment models
│   ├── routes/
│   │   ├── auth.js                # /api/auth/*
│   │   ├── users.js               # /api/users/* (admin)
│   │   ├── courses.js             # /api/courses/*
│   │   ├── tasks.js               # /api/tasks/*
│   │   ├── jobs.js                # /api/jobs/*
│   │   ├── dsa.js                 # /api/dsa/*
│   │   ├── chat.js                # /api/chat/*
│   │   ├── compiler.js            # /api/compiler/*
│   │   ├── ai.js                  # /api/ai/*
│   │   └── assignments.js         # /api/assignments/*
│   ├── utils/
│   │   ├── socketHandler.js       # Socket.io event logic
│   │   └── seeder.js              # Database seeder
│   ├── .env                       # Environment variables
│   ├── server.js                  # Main entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── shared/
│   │   │   │   ├── Sidebar.jsx    # Role-aware navigation
│   │   │   │   ├── Header.jsx     # Top bar with search
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── Modal.jsx      # Reusable modal
│   │   │   └── dashboard/
│   │   │       ├── StudentLayout.jsx
│   │   │       ├── TeacherLayout.jsx
│   │   │       └── AdminLayout.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Auth state + JWT
│   │   │   └── ThemeContext.jsx   # Dark/Light toggle
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx      # Login with demo buttons
│   │   │   │   └── Register.jsx   # Role selection + signup
│   │   │   ├── student/
│   │   │   │   ├── Dashboard.jsx  # Stats, charts, quick actions
│   │   │   │   ├── Courses.jsx    # Browse & enroll courses
│   │   │   │   ├── CourseDetail.jsx
│   │   │   │   ├── DSASheet.jsx   # LeetNext problem tracker
│   │   │   │   ├── CodeEditor.jsx # Monaco + Judge0 compiler
│   │   │   │   ├── AICoach.jsx    # Interview/Resume/Cover letter
│   │   │   │   ├── Jobs.jsx       # Job portal + apply
│   │   │   │   ├── Chat.jsx       # Socket.io real-time chat
│   │   │   │   ├── Tasks.jsx      # Task manager
│   │   │   │   └── Profile.jsx    # Edit profile + change password
│   │   │   ├── teacher/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Courses.jsx    # Create/manage courses
│   │   │   │   ├── Assignments.jsx# Create + grade assignments
│   │   │   │   ├── Students.jsx   # View enrolled students
│   │   │   │   └── Forum.jsx      # Discussion forum
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx  # Platform overview
│   │   │       ├── Users.jsx      # User management
│   │   │       ├── Courses.jsx    # All courses
│   │   │       ├── Jobs.jsx       # Post/manage jobs
│   │   │       └── Analytics.jsx  # Charts & insights
│   │   ├── utils/
│   │   │   └── api.js             # Axios instance + all API calls
│   │   ├── App.js                 # Router + protected routes
│   │   ├── index.js               # React entry point
│   │   └── index.css              # Tailwind + custom styles
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js v18+ 
- MongoDB (local or Atlas)
- npm or yarn

---

### Step 1 — Clone the repo
```bash
git clone https://github.com/yourname/future-bridge.git
cd future-bridge
```

---

### Step 2 — Backend Setup

```bash
cd backend
npm install
```

Copy and edit your `.env`:
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and keys
```

Start the backend:
```bash
# Development (with hot-reload)
npm run dev

# Production
npm start
```

The API will be running at: **http://localhost:5000**
Health check: **http://localhost:5000/health**

---

### Step 3 — Seed the Database (Optional but Recommended)

```bash
cd backend
node utils/seeder.js
```

This creates:
- 5 demo users (admin, 2 teachers, 2 students)
- 5 sample courses
- 5 job postings
- 16 curated DSA problems

To clear all data:
```bash
node utils/seeder.js --clear
```

---

### Step 4 — Frontend Setup

```bash
cd ../frontend
npm install
```

Edit `.env` if your backend runs on a different port:
```bash
# frontend/.env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

Start the frontend:
```bash
npm start
```

App will open at: **http://localhost:3000**

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable           | Required | Description                              |
|--------------------|----------|------------------------------------------|
| `PORT`             | No       | Server port (default: 5000)              |
| `MONGO_URI`        | **Yes**  | MongoDB connection string                |
| `JWT_SECRET`       | **Yes**  | Secret key for JWT signing               |
| `JWT_EXPIRE`       | No       | Token expiry (default: 7d)               |
| `GEMINI_API_KEY`   | No       | Google Gemini API key (for AI features)  |
| `JUDGE0_API_KEY`   | No       | RapidAPI key (for code execution)        |
| `JUDGE0_API_HOST`  | No       | judge0-ce.p.rapidapi.com                 |
| `CLIENT_URL`       | No       | Frontend URL for CORS                    |

> **Note:** The app works in **demo mode** without Gemini and Judge0 keys — mock responses are returned.

### Getting API Keys

**Gemini API (Free):**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a free API key
3. Add to `GEMINI_API_KEY`

**Judge0 (Code Execution):**
1. Go to [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Subscribe to the free tier
3. Copy your RapidAPI key to `JUDGE0_API_KEY`

---

## 📡 API Reference

### Auth Routes
| Method | Route                    | Access  | Description              |
|--------|--------------------------|---------|--------------------------|
| POST   | `/api/auth/register`     | Public  | Register new user         |
| POST   | `/api/auth/login`        | Public  | Login and get JWT         |
| GET    | `/api/auth/me`           | Private | Get current user          |
| PUT    | `/api/auth/profile`      | Private | Update profile            |
| PUT    | `/api/auth/change-password` | Private | Change password        |
| GET    | `/api/auth/verify`       | Private | Verify JWT token          |

### Course Routes
| Method | Route                        | Access            | Description         |
|--------|------------------------------|-------------------|---------------------|
| GET    | `/api/courses`               | Public            | List all courses     |
| GET    | `/api/courses/:id`           | Public            | Get course detail    |
| POST   | `/api/courses`               | Teacher/Admin     | Create course        |
| PUT    | `/api/courses/:id`           | Teacher/Admin     | Update course        |
| DELETE | `/api/courses/:id`           | Teacher/Admin     | Delete course        |
| POST   | `/api/courses/:id/enroll`    | Student           | Enroll in course     |
| GET    | `/api/courses/my-courses`    | Teacher/Admin     | Get teacher courses  |
| POST   | `/api/courses/:id/lessons`   | Teacher/Admin     | Add lesson           |

### DSA Routes
| Method | Route                   | Access  | Description               |
|--------|-------------------------|---------|---------------------------|
| GET    | `/api/dsa`              | Public  | List problems (filterable) |
| GET    | `/api/dsa/:slug`        | Public  | Get problem detail         |
| GET    | `/api/dsa/stats`        | Private | User's solve stats         |
| POST   | `/api/dsa/progress`     | Private | Update solve status        |
| POST   | `/api/dsa`              | Admin   | Create problem             |

### Jobs Routes
| Method | Route                  | Access        | Description       |
|--------|------------------------|---------------|-------------------|
| GET    | `/api/jobs`            | Public        | List jobs          |
| GET    | `/api/jobs/:id`        | Public        | Job details        |
| POST   | `/api/jobs`            | Admin/Teacher | Post job           |
| PUT    | `/api/jobs/:id`        | Admin         | Update job         |
| DELETE | `/api/jobs/:id`        | Admin         | Delete job         |
| POST   | `/api/jobs/:id/apply`  | Student       | Apply to job       |

### AI Routes
| Method | Route                   | Access  | Description             |
|--------|-------------------------|---------|-------------------------|
| POST   | `/api/ai/interview`     | Private | Generate/evaluate Q&A   |
| POST   | `/api/ai/resume`        | Private | Generate resume          |
| POST   | `/api/ai/cover-letter`  | Private | Generate cover letter    |
| POST   | `/api/ai/code-review`   | Private | AI code review           |
| POST   | `/api/ai/chat`          | Private | AI assistant chat        |

### Compiler Route
| Method | Route                    | Access  | Description          |
|--------|--------------------------|---------|----------------------|
| POST   | `/api/compiler/execute`  | Private | Execute code         |
| GET    | `/api/compiler/templates`| Private | Get code templates   |

---

## 👥 Demo Accounts

After running the seeder, use these accounts:

| Role    | Email                          | Password     |
|---------|--------------------------------|--------------|
| Admin   | admin@futurebridge.com         | admin123     |
| Teacher | teacher@futurebridge.com       | teacher123   |
| Student | student@futurebridge.com       | student123   |
| Student | priya@futurebridge.com         | student123   |

> These are also auto-filled on the Login page via quick-access buttons.

---

## 🌐 Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build

# Deploy via Vercel CLI
npm i -g vercel
vercel --prod
```

In Vercel settings, add environment variables:
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
REACT_APP_SOCKET_URL=https://your-backend.onrender.com
```

### Backend → Render

1. Push code to GitHub
2. Create new **Web Service** on [Render](https://render.com)
3. Connect your GitHub repo
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Add all environment variables from `backend/.env`

### Database → MongoDB Atlas

1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist all IPs (`0.0.0.0/0`) for production
4. Copy the connection string and set as `MONGO_URI`

---

## 🐳 Docker Setup

### Run with Docker Compose

```bash
# Clone repo
git clone https://github.com/yourname/future-bridge.git
cd future-bridge

# (Optional) Set API keys
export GEMINI_API_KEY=your_key_here
export JUDGE0_API_KEY=your_key_here

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Services:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

---

## 🔌 Socket.io Events

| Event           | Direction       | Description                    |
|-----------------|-----------------|--------------------------------|
| `joinRoom`      | Client → Server | Join a chat room               |
| `leaveRoom`     | Client → Server | Leave a chat room              |
| `sendMessage`   | Client → Server | Send a message via socket      |
| `newMessage`    | Server → Client | Receive a new message          |
| `typing`        | Client → Server | Emit typing status             |
| `userTyping`    | Server → Client | Broadcast typing indicator     |
| `onlineUsers`   | Server → Client | List of online user IDs        |
| `codeUpdate`    | Client → Server | Live code sharing (rooms)      |

---

## 🎨 Customization

### Themes
The app supports dark/light mode with Tailwind CSS. Toggle via the sidebar button.

### Adding DSA Problems
```bash
# Via API (Admin token required)
POST /api/dsa
{
  "title": "Merge Sort",
  "difficulty": "medium",
  "topic": "sorting",
  "companies": ["Amazon", "Google"],
  "description": "...",
  "timeComplexity": "O(n log n)",
  "spaceComplexity": "O(n)"
}

# Or edit seeder.js and re-run:
node utils/seeder.js --clear && node utils/seeder.js
```

### Adding New Chat Rooms
Edit `ROOMS` array in `src/pages/student/Chat.jsx`.

---

## 🧪 Tech Choices & Architecture

- **MVC Pattern** — Clean separation of Models, Views (React), Controllers
- **JWT Auth** — Stateless auth, stored in localStorage, attached via axios interceptor
- **Socket.io** — Authenticated WebSocket connections with room-based chat
- **Demo Mode** — All AI and compiler features work without API keys (mock responses)
- **Error Handling** — Global Express error handler + Axios response interceptor
- **Rate Limiting** — 100 requests/15min per IP on all API routes
- **Security** — Helmet.js, CORS whitelist, bcrypt (salt rounds 12), input validation

---

## 📄 License

MIT License — Free to use, modify, and distribute.

---

## 🙌 Made with ❤️ by Future Bridge Team

> "Bridging the gap between learning and opportunity."
