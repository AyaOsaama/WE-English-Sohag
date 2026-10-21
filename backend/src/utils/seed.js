require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Course = require('../models/Course');
const Unit = require('../models/Unit');
const Lesson = require('../models/Lesson');
const Vocabulary = require('../models/Vocabulary');
const SpeakingChallenge = require('../models/SpeakingChallenge');
const Challenge = require('../models/Challenge');
const Badge = require('../models/Badge');
const Announcement = require('../models/Announcement');
const data = require('./seedData');

// Development accounts (documented in README). Change/remove before any real deployment.
const USERS = [
  { name: 'Admin User', email: 'admin@example.com', password: 'Admin@12345', role: 'admin' },
  { name: 'Teacher Sara', email: 'teacher@example.com', password: 'Teacher@12345', role: 'teacher' },
  { name: 'Ahmed Mahmoud', email: 'student@example.com', password: 'Student@12345', role: 'student', studentId: 'WE-SHG-2024-0842', campus: 'Sohag', grade: 'Grade 2', specialization: 'Information Technology', englishLevel: 'B1', targetLevel: 'B2' },
];

async function seed() {
  const reset = process.argv.includes('--reset');
  if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force')) {
    throw new Error('Refusing to seed in production without --force');
  }
  await connectDB();

  if (reset) {
    await mongoose.connection.dropDatabase();
    console.log('Database dropped');
  } else if ((await Course.countDocuments()) > 0 || (await User.countDocuments()) > 0) {
    console.log('Database already has data. Run "npm run seed -- --reset" to wipe and reseed.');
    return mongoose.disconnect();
  }

  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));

  const users = {};
  for (const u of USERS) users[u.role] = await User.create(u); // password hashed by the model hook

  for (const [ci, c] of data.courses.entries()) {
    const course = await Course.create({ title: c.title, description: c.description, category: c.category, icon: c.icon, difficulty: c.difficulty, order: ci + 1, createdBy: users.teacher._id });
    for (const [ui, u] of c.units.entries()) {
      const unit = await Unit.create({ courseId: course._id, title: u.title, description: u.description, order: ui + 1 });
      for (const [li, l] of u.lessons.entries()) {
        await Lesson.create({ courseId: course._id, unitId: unit._id, title: l.title, content: l.content, skill: l.skill || null, quiz: l.quiz || [], order: li + 1, xpReward: 20 });
      }
    }
  }

  await Vocabulary.insertMany(data.vocabulary);
  await SpeakingChallenge.insertMany(data.speakingChallenges.map((s) => ({ ...s, createdBy: users.teacher._id })));
  await Challenge.insertMany(data.challenges.map((c) => ({ ...c, createdBy: users.teacher._id })));
  await Badge.insertMany(data.badges);
  await Announcement.create({ ...data.announcement, author: users.admin._id });

  console.log('Seeded:', {
    users: await User.countDocuments(), courses: await Course.countDocuments(), units: await Unit.countDocuments(),
    lessons: await Lesson.countDocuments(), vocabulary: await Vocabulary.countDocuments(),
    speakingChallenges: await SpeakingChallenge.countDocuments(), challenges: await Challenge.countDocuments(), badges: await Badge.countDocuments(),
  });
  console.log('Logins: admin@example.com / Admin@12345 | teacher@example.com / Teacher@12345 | student@example.com / Student@12345');
  await mongoose.disconnect();
}

seed().catch((e) => { console.error(e.message); process.exit(1); });
