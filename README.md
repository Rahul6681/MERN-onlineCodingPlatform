# CodeArena — Full MERN Online Coding & Assessment Platform

CodeArena is a production-ready, LeetCode / HackerRank / CodeChef style online coding platform built using MongoDB, Express.js, React.js 18, and Node.js. It features an in-browser Monaco Code Editor, Judge0 code execution engine, BullMQ asynchronous hidden test-case evaluation, Socket.IO real-time contest leaderboards, OpenAI coding assistance, recruiter candidate assessments, and role-based analytics dashboards.

---

## 🚀 Key Features & Modules

1. **Authentication & Multi-Role Security**: Student, Trainer, Recruiter, Admin with JWT tokens, refresh token cookies, Passport Google OAuth 2.0, and rate limiting.
2. **Online Code Editor (Monaco)**: Support for JavaScript, Python, C++, Java with dark/light themes and custom testcase runner.
3. **Sandbox Code Execution (Judge0 + Fallback VM)**: Supports RapidAPI Judge0 sandbox with automatic fallback to isolated in-memory VMs if API keys are absent.
4. **Asynchronous Hidden Test Evaluation**: BullMQ worker queue handles submission testing without blocking request threads under load.
5. **Real-time Contest Leaderboard**: Socket.IO live score updates with 10-minute final leaderboard freeze rule (competitive-programming standard).
6. **Interview Preparation (Module 17)**: Company-tagged problem sets (Amazon, Google, Microsoft, Meta), pattern collections (Sliding Window, Two Pointers, etc.), and simulated 45-minute timed mock assessments.
7. **Recruiter Coding Assessments**: Timed test links, candidate invitations, auto-scoring, and proctoring violation logs (tab-switches & copy-paste events).
8. **AI Coding Assistant (OpenAI)**: Progressive hints, Big-O time & space complexity estimation, code quality reviews, bug location debugging, and weak-tag problem recommendations.
9. **Role-Tailored Analytics**: Visualized Chart.js dashboards customized for Student, Trainer, Recruiter, and Platform Admin.

---

## 🛠️ Quick Start (Local Setup)

### Option 1: One-Command Docker Setup
```bash
docker-compose up --build
```
Access the application at `http://localhost:5173`.

### Option 2: Manual Development Setup
```bash
# 1. Install all monorepo dependencies
npm run install:all

# 2. Seed database with demo users, 20 DSA problems, contests, and badges
npm run seed

# 3. Start backend & frontend concurrently
npm run dev
```

---

## 👥 Demo User Credentials

| Role | Email | Password |
|---|---|---|
| Student | `student@codearena.dev` | `password123` |
| Trainer | `trainer@codearena.dev` | `password123` |
| Recruiter | `recruiter@codearena.dev` | `password123` |
| Admin | `admin@codearena.dev` | `password123` |

---

## 🧪 Running Tests

```bash
# Run backend Jest unit & integration tests
npm run test:backend

# Run frontend Vitest tests
npm run test:frontend
```

---

## 📖 Documentation
- [API Contract & Socket Reference](docs/API_CONTRACT.md)
- [MongoDB Schema & Database Relationships](docs/DB_SCHEMA.md)
- [Deployment Guide (Vercel, Render, Mongo Atlas, Upstash)](DEPLOYMENT.md)
