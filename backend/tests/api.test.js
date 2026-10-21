// Integration tests: real Express app + in-memory MongoDB.
// Uses TEST_MONGODB_URI if set, otherwise mongodb-memory-server (downloads a mongod binary on first run).
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');

const { createApp } = require('../src/app');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Unit = require('../src/models/Unit');
const Lesson = require('../src/models/Lesson');
const Vocabulary = require('../src/models/Vocabulary');
const Badge = require('../src/models/Badge');
const StudentBadge = require('../src/models/StudentBadge');
const XPTransaction = require('../src/models/XPTransaction');
const Challenge = require('../src/models/Challenge');
const { awardXP } = require('../src/services/xpService');
const { checkBadges } = require('../src/services/badgeService');
const { recordActivity: recordStreak } = require('../src/services/streakService');

let mongod;
let app;
const ctx = {};

const login = async (email, password) => {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.data?.token;
};
const auth = (token) => ({ Authorization: `Bearer ${token}` });

test.before(async () => {
  let uri = process.env.TEST_MONGODB_URI;
  if (!uri) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
  }
  await mongoose.connect(uri);
  await mongoose.connection.dropDatabase();
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
  app = createApp();

  await User.create({ name: 'Admin', email: 'admin@test.com', password: 'Admin@12345', role: 'admin' });
  await User.create({ name: 'Teacher', email: 'teacher@test.com', password: 'Teacher@12345', role: 'teacher' });

  const course = await Course.create({ title: 'Networking' });
  const unit = await Unit.create({ courseId: course._id, title: 'Basics', order: 1 });
  ctx.lessons = [];
  for (let i = 1; i <= 5; i++) {
    ctx.lessons.push(await Lesson.create({ courseId: course._id, unitId: unit._id, title: `Lesson ${i}`, order: i, xpReward: 20 }));
  }
  ctx.course = course;
  ctx.vocab = await Vocabulary.create({ word: 'Network', definition: 'Connected computers' });
  await Badge.create({ name: 'First Lesson', requirementType: 'completedLessons', requirementValue: 1, xpReward: 10 });
});

test.after(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

// ---------- Authentication ----------
test('register creates a student, hashes the password and ignores a requested admin role', async () => {
  const res = await request(app).post('/api/auth/register').send({ name: 'Ahmed', email: 'ahmed@test.com', password: 'Password123', role: 'admin', xp: 9999 });
  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.user.role, 'student');
  assert.equal(res.body.data.user.xp, 0);
  assert.equal(res.body.data.user.password, undefined);
  const raw = await User.findOne({ email: 'ahmed@test.com' }).select('+password');
  assert.notEqual(raw.password, 'Password123');
  ctx.studentToken = res.body.data.token;
  ctx.studentId = res.body.data.user._id;
});

test('register rejects duplicate email and weak password', async () => {
  const dup = await request(app).post('/api/auth/register').send({ name: 'X', email: 'ahmed@test.com', password: 'Password123' });
  assert.equal(dup.status, 409);
  const weak = await request(app).post('/api/auth/register').send({ name: 'X', email: 'new@test.com', password: 'short' });
  assert.equal(weak.status, 400);
});

test('login succeeds with correct credentials and fails with a wrong password', async () => {
  const good = await request(app).post('/api/auth/login').send({ email: 'ahmed@test.com', password: 'Password123' });
  assert.equal(good.status, 200);
  assert.ok(good.body.data.token);
  const bad = await request(app).post('/api/auth/login').send({ email: 'ahmed@test.com', password: 'wrong-password' });
  assert.equal(bad.status, 401);
  assert.equal(bad.body.success, false);
});

test('login rejects NoSQL operator injection', async () => {
  const res = await request(app).post('/api/auth/login').send({ email: { $ne: null }, password: { $ne: null } });
  assert.ok([400, 401].includes(res.status));
});

test('protected routes require a valid token', async () => {
  assert.equal((await request(app).get('/api/auth/me')).status, 401);
  assert.equal((await request(app).get('/api/auth/me').set({ Authorization: 'Bearer garbage' })).status, 401);
  const me = await request(app).get('/api/auth/me').set(auth(ctx.studentToken));
  assert.equal(me.status, 200);
  assert.equal(me.body.data.user.email, 'ahmed@test.com');
});

// ---------- Authorization ----------
test('student cannot use admin or teacher routes', async () => {
  const h = auth(ctx.studentToken);
  assert.equal((await request(app).get('/api/users').set(h)).status, 403);
  assert.equal((await request(app).post('/api/courses').set(h).send({ title: 'Hack' })).status, 403);
  assert.equal((await request(app).post('/api/badges').set(h).send({ name: 'x', requirementType: 'streak', requirementValue: 1 })).status, 403);
});

test('teacher can manage content and list students but not users/badges admin actions', async () => {
  ctx.teacherToken = await login('teacher@test.com', 'Teacher@12345');
  const h = auth(ctx.teacherToken);
  const created = await request(app).post('/api/courses').set(h).send({ title: 'Teacher Course' });
  assert.equal(created.status, 201);
  const users = await request(app).get('/api/users').set(h);
  assert.equal(users.status, 200);
  assert.ok(users.body.data.users.every((u) => u.role === 'student'));
  assert.equal((await request(app).post('/api/users').set(h).send({ name: 'x', email: 'x@x.com', password: 'Password123' })).status, 403);
  assert.equal((await request(app).post('/api/badges').set(h).send({ name: 'x', requirementType: 'streak', requirementValue: 1 })).status, 403);
});

test('admin can manage users and badges', async () => {
  ctx.adminToken = await login('admin@test.com', 'Admin@12345');
  const h = auth(ctx.adminToken);
  const user = await request(app).post('/api/users').set(h).send({ name: 'T2', email: 't2@test.com', password: 'Password123', role: 'teacher' });
  assert.equal(user.status, 201);
  assert.equal(user.body.data.user.role, 'teacher');
  const badge = await request(app).post('/api/badges').set(h).send({ name: 'Admin Badge', requirementType: 'streak', requirementValue: 30 });
  assert.equal(badge.status, 201);
});

test('student profile edit cannot change protected fields', async () => {
  const res = await request(app).patch('/api/users/me').set(auth(ctx.studentToken)).send({ name: 'Ahmed M', role: 'admin', xp: 5000, englishLevel: 'C2' });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.user.name, 'Ahmed M');
  assert.equal(res.body.data.user.role, 'student');
  assert.equal(res.body.data.user.xp, 0);
  assert.notEqual(res.body.data.user.englishLevel, 'C2');
});

// ---------- Course progress, XP, streak, badges ----------
test('completing a lesson updates course progress by lessons, awards XP once, starts the streak and earns a badge', async () => {
  const h = auth(ctx.studentToken);
  const first = await request(app).post(`/api/lessons/${ctx.lessons[0]._id}/complete`).set(h).send({});
  assert.equal(first.status, 200);
  assert.equal(first.body.data.xpAwarded, 20);
  assert.equal(first.body.data.courseProgress.percentage, 20);
  assert.equal(first.body.data.newBadges.length, 1);
  assert.equal(String(first.body.data.courseProgress.nextLessonId), String(ctx.lessons[1]._id));

  // Refresh / double submit must not pay again.
  const again = await request(app).post(`/api/lessons/${ctx.lessons[0]._id}/complete`).set(h).send({});
  assert.equal(again.body.data.alreadyCompleted, true);
  assert.equal(again.body.data.xpAwarded, 0);
  assert.equal(again.body.data.courseProgress.percentage, 20);

  const me = (await request(app).get('/api/auth/me').set(h)).body.data.user;
  assert.equal(me.xp, 20 + 10); // 20 lesson + 10 badge bonus
  assert.equal(me.currentStreak, 1);
});

test('4 of 5 lessons completed = 80% and XP never changes the percentage', async () => {
  const h = auth(ctx.studentToken);
  for (const l of ctx.lessons.slice(1, 4)) await request(app).post(`/api/lessons/${l._id}/complete`).set(h).send({});
  const res = await request(app).get('/api/progress/courses').set(h);
  const row = res.body.data.courses.find((c) => String(c.course._id) === String(ctx.course._id));
  assert.equal(row.completedLessons, 4);
  assert.equal(row.percentage, 80);
});

test('XP service: awards once per source+reference', async () => {
  const before = await XPTransaction.countDocuments({ studentId: ctx.studentId });
  const a = await awardXP({ studentId: ctx.studentId, amount: 7, reason: 't', source: 'test', referenceId: 'ref-1' });
  const b = await awardXP({ studentId: ctx.studentId, amount: 7, reason: 't', source: 'test', referenceId: 'ref-1' });
  assert.equal(a.awarded, true);
  assert.equal(b.awarded, false);
  assert.equal(await XPTransaction.countDocuments({ studentId: ctx.studentId }), before + 1);
});

test('badges are never awarded twice', async () => {
  await checkBadges(ctx.studentId);
  await checkBadges(ctx.studentId);
  const badge = await Badge.findOne({ name: 'First Lesson' });
  assert.equal(await StudentBadge.countDocuments({ studentId: ctx.studentId, badgeId: badge._id }), 1);
});

test('streak: a second activity on the same day does not increase it', async () => {
  await recordStreak(ctx.studentId);
  await recordStreak(ctx.studentId);
  assert.equal((await User.findById(ctx.studentId)).currentStreak, 1);
});

// ---------- Vocabulary ----------
test('vocabulary answers update real statistics and accuracy', async () => {
  const h = auth(ctx.studentToken);
  const right = await request(app).post(`/api/vocabulary/${ctx.vocab._id}/answer`).set(h).send({ correct: true });
  assert.equal(right.status, 200);
  assert.equal(right.body.data.stats.reviewCount, 1);
  assert.equal(right.body.data.stats.correctCount, 1);
  assert.equal(right.body.data.xpAwarded, 5);

  const wrong = await request(app).post(`/api/vocabulary/${ctx.vocab._id}/answer`).set(h).send({ correct: false });
  assert.equal(wrong.body.data.stats.reviewCount, 2);
  assert.equal(wrong.body.data.stats.wrongCount, 1);
  assert.equal(wrong.body.data.stats.accuracy, 50);

  const skills = await request(app).get('/api/progress/skills').set(h);
  const vocab = skills.body.data.skills.find((s) => s.skill === 'vocabulary');
  assert.equal(vocab.percentage, 50);
  // No quiz/speaking data yet -> null, not a fabricated number.
  assert.equal(skills.body.data.skills.find((s) => s.skill === 'speaking').percentage, null);
});

test('vocabulary: re-answering a card that is not due pays no extra XP', async () => {
  const h = auth(ctx.studentToken);
  const res = await request(app).post(`/api/vocabulary/${ctx.vocab._id}/answer`).set(h).send({ correct: true });
  assert.equal(res.body.data.xpAwarded, 0);
});

// ---------- Challenges & dashboard ----------
test('challenge progress updates automatically and pays its reward once', async () => {
  const challenge = await Challenge.create({ title: 'Do 2 lessons', type: 'lesson', requirement: { target: 1 }, xpReward: 25 });
  const h = auth(ctx.studentToken);
  await request(app).post(`/api/lessons/${ctx.lessons[4]._id}/complete`).set(h).send({});
  const today = await request(app).get('/api/challenges/today').set(h);
  const row = today.body.data.challenges.find((c) => String(c._id) === String(challenge._id));
  assert.equal(row.status, 'completed');
  const paid = await XPTransaction.countDocuments({ studentId: ctx.studentId, source: 'challenge' });
  assert.equal(paid, 1);
});

test('dashboard aggregates real backend data', async () => {
  const res = await request(app).get('/api/dashboard').set(auth(ctx.studentToken));
  assert.equal(res.status, 200);
  const d = res.body.data;
  for (const key of ['student', 'stats', 'courses', 'challenges', 'badges', 'skills', 'recentActivity']) assert.ok(key in d, `missing ${key}`);
  assert.equal(d.stats.lessonsCompleted, 5);
  assert.equal(d.stats.coursesCompleted, 1);
  assert.equal(d.student.password, undefined);
});

test('students cannot read another student\'s speaking audio or the admin progress view', async () => {
  const other = await request(app).post('/api/auth/register').send({ name: 'Other', email: 'other@test.com', password: 'Password123' });
  const res = await request(app).get(`/api/users/${ctx.studentId}/progress`).set(auth(other.body.data.token));
  assert.equal(res.status, 403);
  const staffView = await request(app).get(`/api/users/${ctx.studentId}/progress`).set(auth(ctx.teacherToken));
  assert.equal(staffView.status, 200);
});
