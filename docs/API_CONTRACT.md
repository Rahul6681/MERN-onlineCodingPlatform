# CodeArena API Contract & Specification

All HTTP API responses return a standardized JSON envelope:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

---

## 1. Authentication (`/api/auth`)
- `POST /api/auth/register` — Body: `{ name, email, password, role }`
- `POST /api/auth/login` — Body: `{ email, password }` → Returns access token & sets HTTP-only `refreshToken` cookie.
- `POST /api/auth/google` — Body: `{ credential }` (Google OAuth token)
- `POST /api/auth/refresh` — Cookie: `refreshToken` → Rotates access token.
- `POST /api/auth/forgot-password` — Body: `{ email }`
- `POST /api/auth/reset-password` — Body: `{ token, newPassword }`
- `POST /api/auth/logout` — Clears HTTP-only `refreshToken` cookie.

## 2. Profile & User Management (`/api/profile` & `/api/admin/users`)
- `GET /api/profile/me` — Authenticated user profile + stats
- `PUT /api/profile/me` — Body: `{ university, skills, githubProfile, bio, languagesKnown }`
- `GET /api/profile/:userId` — Public user portfolio & stats
- `GET /api/admin/users` — [Admin] Query user accounts (pagination, role filter)
- `PATCH /api/admin/users/:id/ban` — [Admin] Toggle user ban status

## 3. Problems (`/api/problems`)
- `GET /api/problems` — Query params: `difficulty`, `tags`, `company`, `search`, `page`, `limit`
- `GET /api/problems/:slug` — Fetch problem details + starter code + sample test cases
- `POST /api/problems` — [Trainer/Admin] Create problem
- `PUT /api/problems/:id` — [Trainer/Admin] Update problem details
- `DELETE /api/problems/:id` — [Admin] Delete problem
- `POST /api/problems/:id/testcases` — [Trainer/Admin] Add/update test cases (sample/public/hidden)

## 4. Submissions (`/api/submissions`)
- `POST /api/submissions/run` — Synchronous code run against sample test cases
- `POST /api/submissions/submit` — Asynchronous code submission evaluated via BullMQ worker
- `GET /api/submissions/me` — Fetch user's submission history
- `GET /api/submissions/:id` — Fetch submission execution results & code

## 5. Contests (`/api/contests`)
- `GET /api/contests` — List active, upcoming, and past contests
- `GET /api/contests/:id` — Contest details and problem set
- `POST /api/contests` — [Trainer/Admin] Create contest
- `POST /api/contests/:id/join` — Join contest flow
- `GET /api/contests/:id/leaderboard` — Contest live/frozen leaderboard

## 6. Leaderboard (`/api/leaderboard`)
- `GET /api/leaderboard/global` — Global ELO rating rankings
- `GET /api/leaderboard/contest/:id` — Contest standings snapshot

## 7. Assessments (`/api/assessments`)
- `POST /api/assessments` — [Recruiter] Create recruiter coding assessment
- `POST /api/assessments/:id/invite` — [Recruiter] Invite candidate emails
- `GET /api/assessments/:id/results` — [Recruiter] View test scores & proctoring violation logs
- `POST /api/assessments/:id/attempt` — [Candidate] Submit timed assessment attempt

## 8. Discussion (`/api/discuss`)
- `GET /api/discuss/:problemId` — Problem community discussion threads
- `POST /api/discuss/:problemId` — Add comment or post
- `POST /api/discuss/:problemId/:commentId/upvote` — Upvote comment

## 9. Interview Preparation (`/api/interview-prep`)
- `GET /api/interview-prep/companies` — Company-tagged sets (Amazon, Google, Microsoft, Meta)
- `GET /api/interview-prep/patterns` — Curated DSA pattern tracks (Sliding Window, Two Pointers, Dynamic Programming, etc.)
- `POST /api/interview-prep/mock-assessment` — Generate private timed mock interview session

## 10. Learning Paths (`/api/learning-paths`)
- `GET /api/learning-paths` — List curated learning paths
- `GET /api/learning-paths/:id` — Details & progress breakdown

## 11. Achievements (`/api/achievements`)
- `GET /api/achievements/me` — Earned badges & progress criteria

## 12. Notifications (`/api/notifications`)
- `GET /api/notifications` — Fetch user in-app notifications
- `PATCH /api/notifications/:id/read` — Mark notification read

## 13. Analytics (`/api/analytics`)
- `GET /api/analytics/student/:id` — Student stats (solved by difficulty donut, rating chart)
- `GET /api/analytics/trainer/:id` — Trainer metrics (problems created, student performance, contest participation)
- `GET /api/analytics/recruiter/:id` — Recruiter metrics (assessments, candidate results, top scores)
- `GET /api/analytics/platform` — [Admin] Platform analytics (DAU, submissions, language distribution)

## 14. AI Assistant (`/api/ai`)
- `POST /api/ai/hint` — Progressive hints without full code dump
- `POST /api/ai/review` — Code quality & clean code review
- `POST /api/ai/complexity` — Big-O time and space complexity estimate
- `POST /api/ai/debug` — Bug location detector & explanation
- `POST /api/ai/recommend` — Recommend next problems based on weak tags

---

## Socket.IO Events
- `contest:join` — Join contest room for live ticks & leaderboard updates
- `contest:leaderboardUpdate` — Broadcast updated scores to contest room
- `submission:statusUpdate` — Real-time notification when BullMQ finishes evaluation
- `contest:timerTick` — Broadcast remaining time in active contest
- `notification:new` — Push in-app alert to user room
