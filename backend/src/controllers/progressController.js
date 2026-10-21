const progressService = require('../services/progressService');
const badgeService = require('../services/badgeService');
const { asyncHandler, ok } = require('../utils/ApiError');

exports.overview = asyncHandler(async (req, res) => {
  const [courses, skills, recentActivity, stats] = await Promise.all([
    progressService.getCourseProgressList(req.user._id),
    progressService.getSkillProgress(req.user._id),
    progressService.getRecentActivity(req.user._id, 15),
    badgeService.getStats(req.user._id),
  ]);
  ok(res, {
    overall: {
      totalXP: req.user.xp,
      currentStreak: req.user.currentStreak,
      longestStreak: req.user.longestStreak,
      coursesCompleted: courses.filter((c) => c.completed).length,
      lessonsCompleted: stats.completedLessons,
    },
    courses,
    skills,
    recentActivity,
  });
});

exports.skills = asyncHandler(async (req, res) => ok(res, { skills: await progressService.getSkillProgress(req.user._id) }));
exports.courses = asyncHandler(async (req, res) => ok(res, { courses: await progressService.getCourseProgressList(req.user._id) }));
exports.activity = asyncHandler(async (req, res) => ok(res, { recentActivity: await progressService.getRecentActivity(req.user._id, 30) }));
