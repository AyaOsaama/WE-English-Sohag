# WE English Lab – WE Applied Technology School, Sohag

Gamified technical-English platform: React + Vite frontend, Node/Express REST API, MongoDB (Mongoose), JWT + bcrypt auth.

## Features
Auth (register/login/logout/me, persistent login), role-based access (student / teacher / admin), courses → units → lessons with quizzes, real course progress, vocabulary flashcards with spaced repetition, Speaking Lab (audio upload → speech-to-text → evaluation), AI Tutor (saved conversations), daily challenges, XP, streaks, badges, skill progress, dashboard, profile, announcements, staff console.

## Quick start
Requirements: Node 20+, MongoDB running locally (or an Atlas URI).

```bash
# 1. install
npm run install:all

# 2. configure
cp backend/.env.example backend/.env     # set JWT_SECRET (and MONGODB_URI if not local)

# 3. seed content
npm run seed                              # use: npm run seed -- --reset   to wipe + reseed

# 4. run (two terminals)
npm run dev:backend                       # http://localhost:5000
npm run dev:frontend                      # http://localhost:5173  (proxies /api to the backend)
```

### Development accounts (created by the seed – change before any real deployment)
| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | Admin@12345 |
| Teacher | teacher@example.com | Teacher@12345 |
| Student | student@example.com (or ID WE-SHG-2024-0842) | Student@12345 |

The seed creates content only (courses, lessons, vocabulary, challenges, badges, announcement). No fake student history.

## Tests
```bash
npm run test --prefix backend        # all tests (integration tests download a mongod binary via mongodb-memory-server on first run)
npm run test:unit --prefix backend   # pure business rules only, no database
```
Or set `TEST_MONGODB_URI` to use an existing MongoDB instead of the in-memory one.

## Architecture
```
backend/src
  models/        Mongoose schemas (+ Activity log, SkillResult)
  controllers/   thin HTTP handlers
  routes/        route + middleware wiring
  services/      business logic (xp, streak, badge, progress, vocabulary, challenge, speaking, ai, speech, storage)
  middleware/    auth (JWT), roles, errors, audio upload
  utils/rules.js pure rules (streak, spaced repetition, percentage, quiz grading, badge check)
frontend/src
  pages/ components/ services/ (API layer) context/ (Auth, Toast) hooks/ routes/
```

## Gamification rules (kept independent)
- **Course progress** = completed lessons / total lessons. Never uses XP.
- **XP**: every award goes through `awardXP()` and is stored as an `XPTransaction`. A unique index on (student, source, referenceId) makes awards idempotent, so a refresh or double submit cannot pay twice. Lesson +20 (once per lesson), correct vocabulary answer +5 (only when the card is due), speaking challenge reward (once per challenge per day), challenge reward once per day, badge bonus once.
- **Streak**: consecutive active calendar days (UTC). Same day = unchanged, yesterday = +1, otherwise reset to 1. Not related to XP.
- **Badges**: checked after every activity; unique (student, badge) index prevents duplicates.
- **Challenges**: progress updates automatically from activity type; reward paid once per day.
- **Vocabulary**: correct → mastery +1 and longer interval (1, 3, 7, 14, 30 days); wrong → mastery −1 and retry in 10 min. Mastered = level ≥ 4. Accuracy = correct / reviews.
- **Skill progress**: vocabulary = review accuracy, speaking = average evaluation score, grammar/reading/listening = average of lesson quiz results (first attempt only). No data → `null` ("No results yet"), never a made-up number.

## AI Tutor
`POST /api/ai/chat` → backend → `aiService` → provider. The key (`AI_API_KEY`) lives only in `backend/.env`. Without a key (non-production) a clearly labelled **development fallback** answers; in production a missing key returns 503. Add a provider by extending `providers` in `services/aiService.js`.

## Speaking flow
Browser records audio (MediaRecorder) → `POST /api/speaking/submissions` (multipart; type and size validated) → `speechService.transcribe` → `aiEvaluationService.evaluate` → `storageService.save` → submission saved → XP → streak → challenges → badges.
- `SPEECH_PROVIDER=openai` uses Whisper (needs `SPEECH_API_KEY`). `mock` is a **development fallback** that reuses the browser's Web Speech transcript; it is refused in production.
- Pronunciation cannot be judged from text, so it is `null` ("Not assessed") unless a provider supplies an acoustic score. The overall score only averages the scores that exist.
- Without `AI_API_KEY` a labelled text heuristic scores grammar/vocabulary/fluency (development only).
- Audio is never public: `GET /api/speaking/submissions/:id/audio` checks ownership (owner, teacher, admin).

## API overview
`/api/auth` register, login, logout, me · `/api/users` (me, list, admin CRUD, `/:id/progress`) · `/api/dashboard` · `/api/courses` (+`/:id/units`) · `/api/units` · `/api/lessons` (+`/:id/complete`) · `/api/vocabulary` (+`/queue`, `/summary`, `/:id/answer`) · `/api/speaking` (`/challenges`, `/submissions`) · `/api/ai` (`/chat`, `/conversations`) · `/api/challenges` (`/today`, `/:id/start`) · `/api/badges` · `/api/progress` (`/skills`, `/courses`, `/activity`) · `/api/xp` · `/api/announcements`.
Responses: `{ "success": true, "data": … }` or `{ "success": false, "message": "…" }`.

## Roles
- **Student**: all learning features, own progress/profile.
- **Teacher**: list students, view performance and speaking submissions, create/edit courses, units, lessons, vocabulary, speaking and daily challenges, announcements (own).
- **Admin**: everything above plus users, badges, any announcement.
Roles are enforced on the server from the database record, never from the client.

## Security
bcrypt (cost 12), JWT, role middleware, helmet, CORS allow-list, rate limits on login/register and AI chat, Mongo-operator sanitisation, input validation, protected fields (role/XP/streak/level cannot be changed by students), password hashes never returned.

## Deployment notes
- Set `NODE_ENV=production`, a long random `JWT_SECRET`, real `MONGODB_URI`, `CLIENT_URL` (the frontend origin), `AI_API_KEY`, `SPEECH_PROVIDER=openai` + `SPEECH_API_KEY`.
- Build the frontend with `npm run build` (set `VITE_API_URL` to the public API URL) and serve `frontend/dist` from any static host.
- Local audio storage is for development; implement an S3/GCS provider in `services/storageService.js` for production.
- Do not run the seed with the default passwords in production.

## Not included / known limits
- Listening has no content yet (structure ready: add lessons with `skill: "listening"` and a quiz).
- Teacher/admin course editing is available through the API; the staff console UI covers users, performance, speaking submissions and announcements.
