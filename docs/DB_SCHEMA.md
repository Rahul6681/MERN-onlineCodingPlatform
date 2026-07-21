# CodeArena Database Schema Documentation

MongoDB database collections built as Mongoose Schemas with strict field validation, compound indexes, and automatic timestamps (`createdAt`, `updatedAt`).

---

## Collections & Schema Definitions

### 1. `users`
- `name`: String (Required)
- `email`: String (Required, Unique, Indexed)
- `password`: String (Hashed via bcrypt, select: false)
- `role`: Enum [`student`, `trainer`, `recruiter`, `admin`] (Default: `student`)
- `authProvider`: Enum [`local`, `google`] (Default: `local`)
- `googleId`: String (Nullable)
- `avatarUrl`: String
- `profile`: `{ university, skills: [String], githubProfile, bio, languagesKnown: [String] }`
- `stats`: `{ problemsSolved, contestRating (Default: 1200), globalRank, acceptanceRate, streakCount, longestStreak }`
- `isVerified`: Boolean (Default: false)
- `isBanned`: Boolean (Default: false)
- `refreshTokens`: `[String]`

### 2. `problems`
- `title`: String (Required)
- `slug`: String (Required, Unique, Indexed)
- `description`: String (Markdown text)
- `difficulty`: Enum [`Easy`, `Medium`, `Hard`]
- `tags`: `[String]` (Indexed)
- `constraints`: `[String]`
- `examples`: `[{ input, output, explanation }]`
- `starterCode`: `{ java, javascript, python, cpp, c, go, csharp, php }`
- `timeLimitMs`: Number (Default: 2000)
- `memoryLimitKb`: Number (Default: 128000)
- `companies`: `[String]` (e.g. Amazon, Google, Microsoft)
- `stats`: `{ totalSubmissions, acceptedSubmissions, acceptanceRate, likes, dislikes }`
- `createdBy`: ObjectId (ref: `User`)
- `isPublished`: Boolean (Default: true)

### 3. `testCases`
- `problem`: ObjectId (ref: `Problem`, Required, Indexed)
- `type`: Enum [`sample`, `public`, `hidden`]
- `input`: String (Required)
- `expectedOutput`: String (Required)
- `isEdgeCase`: Boolean (Default: false)
- `order`: Number

### 4. `submissions`
- `user`: ObjectId (ref: `User`, Required, Compound Index: `[user, problem]`)
- `problem`: ObjectId (ref: `Problem`, Required)
- `contest`: ObjectId (ref: `Contest`, Nullable)
- `language`: String (Required)
- `code`: String (Required)
- `status`: Enum [`Pending`, `Accepted`, `WrongAnswer`, `RuntimeError`, `CompilationError`, `TimeLimitExceeded`, `MemoryLimitExceeded`]
- `executionTimeMs`: Number
- `memoryUsedKb`: Number
- `testCaseResults`: `[{ testCase: ObjectId, passed: Boolean, actualOutput: String, runtimeMs: Number }]`
- `score`: Number
- `submittedAt`: Date (Default: Date.now)

### 5. `contests`
- `name`: String (Required)
- `description`: String
- `type`: Enum [`Weekly`, `Monthly`, `University`, `Hiring`]
- `problems`: `[ObjectId ref Problem]`
- `startTime`: Date (Required)
- `endTime`: Date (Required)
- `durationMinutes`: Number
- `participants`: `[{ user: ObjectId, joinedAt: Date, score: Number, rank: Number, penaltyMinutes: Number }]`
- `createdBy`: ObjectId (ref: `User`)
- `isLive`: Boolean
- `isPublished`: Boolean

### 6. `leaderboards`
- `scope`: Enum [`global`, `contest`]
- `contest`: ObjectId (ref: `Contest`, Nullable)
- `entries`: `[{ user: ObjectId, rating: Number, rank: Number, problemsSolved: Number, contestsAttended: Number }]` (Indexed on rank)

### 7. `assessments`
- `title`: String (Required)
- `createdBy`: ObjectId (ref: `User:recruiter/admin`, Required)
- `problems`: `[ObjectId ref Problem]`
- `durationMinutes`: Number
- `candidates`: `[{ user: ObjectId, email: String, status: Enum['Invited', 'InProgress', 'Completed'], score: Number, proctoringFlags: [String] }]`
- `randomizeQuestions`: Boolean
- `proctoringEnabled`: Boolean
- `resultSummary`: `{ avgScore: Number, topCandidates: [ObjectId] }`
- `startDate`: Date
- `endDate`: Date
- `isActive`: Boolean

### 8. `badges`
- `name`: String (Required, Unique)
- `description`: String
- `iconUrl`: String
- `criteria`: `{ category: String, threshold: Number }`

### 9. `achievements`
- `user`: ObjectId (ref: `User`, Required, Indexed)
- `badge`: ObjectId (ref: `Badge`, Required)
- `earnedAt`: Date (Default: Date.now)

### 10. `discussions`
- `problem`: ObjectId (ref: `Problem`, Required, Indexed)
- `user`: ObjectId (ref: `User`, Required)
- `title`: String
- `content`: String
- `upvotes`: `[ObjectId ref User]`
- `comments`: `[{ user: ObjectId, content: String, createdAt: Date }]`

### 11. `learningPaths`
- `title`: String (Required)
- `description`: String
- `problems`: `[{ problem: ObjectId ref Problem, dayOrder: Number }]`
- `category`: String
- `difficulty`: String

### 12. `notifications`
- `user`: ObjectId (ref: `User`, Required, Indexed)
- `type`: Enum [`ContestStarted`, `SubmissionAccepted`, `NewProblemAdded`, `BadgeEarned`]
- `message`: String
- `channel`: Enum [`email`, `push`, `inApp`]
- `isRead`: Boolean (Default: false)

### 13. `analytics`
- `scope`: Enum [`student`, `trainer`, `recruiter`, `platform`]
- `refId`: ObjectId (Nullable)
- `metrics`: Object (Flexible metrics per scope)
- `date`: Date (Indexed)
