const Announcement = require('../models/Announcement');
const StudentBadge = require('../models/StudentBadge');
const ChallengeProgress = require('../models/ChallengeProgress');
const Lesson = require('../models/Lesson');
const progressService = require('../services/progressService');
const challengeService = require('../services/challengeService');
const badgeService = require('../services/badgeService');
const vocabularyService = require('../services/vocabularyService');
const { xpSince } = require('../services/xpService');
const { startOfDay, addDays } = require('../utils/dates');
const { asyncHandler, ok } = require('../utils/ApiError');

// Aggregates live data; there is no dashboard collection.
exports.get = asyncHandler(async (req, res) => {
  const student = req.user;
  const weekStart = addDays(startOfDay(), -6);

  const [courses, skills, recentActivity, badgeStats, vocab, challenges, earned, announcements, xpThisWeek] = await Promise.all([
    progressService.getCourseProgressList(student._id),
    progressService.getSkillProgress(student._id),
    progressService.getRecentActivity(student._id, 8),
    badgeService.getStats(student._id),
    vocabularyService.getSummary(student._id),
    challengeService.getTodaysChallenges(),
    StudentBadge.find({ studentId: student._id }).sort({ earnedAt: -1 }).limit(3).populate('badgeId').lean(),
    Announcement.find({ isActive: true, targetAudience: { $in: ['all', 'students'] }, publishedAt: { $lte: new Date() } }).sort({ publishedAt: -1 }).limit(3).populate('author', 'name').lean(),
    xpSince(student._id, weekStart),
  ]);

  const progressRows = await ChallengeProgress.find({ studentId: student._id, dayKey: challengeService.dayKeyOf(), challengeId: { $in: challenges.map((c) => c._id) } }).lean();
  const byId = new Map(progressRows.map((p) => [String(p.challengeId), p]));

  // "Continue learning": the in-progress course touched most recently, else the first unstarted one.
  const inProgress = courses.filter((c) => c.started && !c.completed).sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt))[0];
  const candidate = inProgress || courses.find((c) => !c.started && c.totalLessons > 0);
  let continueLearning = null;
  if (candidate) {
    const ordered = await progressService.getOrderedLessons(candidate.course._id);
    const nextId = candidate.currentLesson || ordered[0]?._id;
    const next = nextId ? await Lesson.findById(nextId).select('title').lean() : null;
    continueLearning = { ...candidate, nextLesson: next ? { _id: nextId, title: next.title } : null };
  }

  ok(res, {
    student,
    stats: {
      xp: student.xp,
      xpThisWeek,
      currentStreak: student.currentStreak,
      longestStreak: student.longestStreak,
      activeToday: !!student.lastActiveDate && startOfDay(student.lastActiveDate).getTime() === startOfDay().getTime(),
      lessonsCompleted: badgeStats.completedLessons,
      coursesCompleted: courses.filter((c) => c.completed).length,
      masteredVocabulary: vocab.mastered,
      vocabularyDue: vocab.dueForReview,
      badgesEarned: await StudentBadge.countDocuments({ studentId: student._id }),
    },
    continueLearning,
    courses,
    challenges: challenges.map((c) => {
      const p = byId.get(String(c._id));
      return { ...c.toObject(), progress: p?.progress || 0, status: p?.status || 'not_started' };
    }),
    badges: earned.map((e) => ({ ...e.badgeId, earnedAt: e.earnedAt })),
    skills,
    recentActivity,
    announcements,
  });
});
