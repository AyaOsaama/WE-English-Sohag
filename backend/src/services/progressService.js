const Course = require('../models/Course');
const Unit = require('../models/Unit');
const Lesson = require('../models/Lesson');
const CourseProgress = require('../models/CourseProgress');
const SkillResult = require('../models/SkillResult');
const StudentVocabulary = require('../models/StudentVocabulary');
const SpeakingSubmission = require('../models/SpeakingSubmission');
const Activity = require('../models/Activity');
const { awardXP } = require('./xpService');
const { handleActivity } = require('./learningEventService');
const { ApiError } = require('../utils/ApiError');
const { calcPercentage, gradeQuiz } = require('../utils/rules');

// Lessons of a course in reading order (unit order, then lesson order).
async function getOrderedLessons(courseId) {
  const [units, lessons] = await Promise.all([
    Unit.find({ courseId }).sort({ order: 1 }).lean(),
    Lesson.find({ courseId }).sort({ order: 1 }).lean(),
  ]);
  const unitOrder = new Map(units.map((u) => [String(u._id), u.order]));
  return lessons.sort((a, b) => (unitOrder.get(String(a.unitId)) - unitOrder.get(String(b.unitId))) || a.order - b.order);
}

async function completeLesson(studentId, lessonId, answers) {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new ApiError(404, 'Lesson not found');

  const quizResult = gradeQuiz(lesson, answers);
  const ordered = await getOrderedLessons(lesson.courseId);

  let progress = await CourseProgress.findOne({ studentId, courseId: lesson.courseId });
  if (!progress) progress = new CourseProgress({ studentId, courseId: lesson.courseId });

  const alreadyCompleted = progress.completedLessons.some((id) => String(id) === String(lesson._id));
  if (!alreadyCompleted) progress.completedLessons.push(lesson._id);

  const completedSet = new Set(progress.completedLessons.map(String));
  progress.percentage = calcPercentage(completedSet.size, ordered.length);
  const next = ordered.find((l) => !completedSet.has(String(l._id)));
  progress.currentLesson = next ? next._id : null;
  progress.lastActivityAt = new Date();
  const courseJustCompleted = !progress.completedAt && ordered.length > 0 && completedSet.size === ordered.length;
  if (courseJustCompleted) progress.completedAt = new Date();
  await progress.save();

  // Skill result: first scored attempt only (unique index), so retries cannot inflate it.
  if (quizResult && lesson.skill) {
    await SkillResult.updateOne(
      { studentId, skill: lesson.skill, source: 'lesson', referenceId: String(lesson._id) },
      { $setOnInsert: { score: quizResult.score } },
      { upsert: true }
    );
  }

  // XP once per lesson (idempotent through the unique transaction key).
  const xp = await awardXP({
    studentId,
    amount: lesson.xpReward,
    reason: `Completed lesson: ${lesson.title}`,
    source: 'lesson',
    referenceId: lesson._id,
  });

  let events = { newBadges: [], completedChallenges: [], streak: null };
  if (!alreadyCompleted) {
    events = await handleActivity({
      studentId,
      type: 'lesson',
      title: `Completed lesson: ${lesson.title}`,
      referenceId: lesson._id,
      xp: xp.amount,
      types: courseJustCompleted ? ['lesson', 'course'] : ['lesson'],
    });
  }

  return {
    alreadyCompleted,
    xpAwarded: xp.amount,
    quiz: quizResult,
    courseProgress: {
      courseId: lesson.courseId,
      completedLessons: completedSet.size,
      totalLessons: ordered.length,
      percentage: progress.percentage,
      nextLessonId: progress.currentLesson,
      completed: !!progress.completedAt,
    },
    ...events,
  };
}

async function getCourseProgressList(studentId) {
  const [courses, progressDocs] = await Promise.all([
    Course.find({ isPublished: true }).sort({ order: 1 }).lean(),
    CourseProgress.find({ studentId }).lean(),
  ]);
  const lessonCounts = await Lesson.aggregate([{ $group: { _id: '$courseId', total: { $sum: 1 } } }]);
  const totals = new Map(lessonCounts.map((l) => [String(l._id), l.total]));
  const byCourse = new Map(progressDocs.map((p) => [String(p.courseId), p]));

  return courses.map((c) => {
    const p = byCourse.get(String(c._id));
    const total = totals.get(String(c._id)) || 0;
    return {
      course: c,
      totalLessons: total,
      completedLessons: p ? p.completedLessons.length : 0,
      percentage: p ? calcPercentage(p.completedLessons.length, total) : 0,
      currentLesson: p ? p.currentLesson : null,
      started: !!p,
      completed: !!(p && p.completedAt),
      lastActivityAt: p ? p.lastActivityAt : null,
    };
  });
}

// Skill progress is derived from real results. A skill with no results returns null (not a fake number).
async function getSkillProgress(studentId) {
  const [vocab, speaking, results] = await Promise.all([
    StudentVocabulary.find({ studentId }).lean(),
    SpeakingSubmission.find({ studentId, overallScore: { $ne: null } }).select('overallScore').lean(),
    SkillResult.find({ studentId }).lean(),
  ]);

  const reviews = vocab.reduce((n, v) => n + v.reviewCount, 0);
  const correct = vocab.reduce((n, v) => n + v.correctCount, 0);
  const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null);
  const fromResults = (skill) => {
    const rows = results.filter((r) => r.skill === skill);
    return { percentage: avg(rows.map((r) => r.score)), attempts: rows.length };
  };

  return [
    { skill: 'vocabulary', percentage: reviews ? Math.round((correct / reviews) * 100) : null, attempts: reviews, basis: 'correct answers / total reviews' },
    { skill: 'grammar', ...fromResults('grammar'), basis: 'average grammar quiz score' },
    { skill: 'speaking', percentage: avg(speaking.map((s) => s.overallScore)), attempts: speaking.length, basis: 'average speaking evaluation score' },
    { skill: 'reading', ...fromResults('reading'), basis: 'average reading quiz score' },
    { skill: 'listening', ...fromResults('listening'), basis: 'average listening quiz score' },
  ];
}

const getRecentActivity = (studentId, limit = 10) => Activity.find({ studentId }).sort({ createdAt: -1 }).limit(limit).lean();

module.exports = { calcPercentage, getOrderedLessons, completeLesson, getCourseProgressList, getSkillProgress, getRecentActivity };
