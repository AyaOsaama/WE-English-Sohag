const User = require('../models/User');
const progressService = require('../services/progressService');
const badgeService = require('../services/badgeService');
const StudentBadge = require('../models/StudentBadge');
const { ApiError, asyncHandler, ok } = require('../utils/ApiError');
const { requireFields, assertEmail, assertPassword, assertObjectId, pick } = require('../utils/validate');

const SELF_EDITABLE = ['name', 'avatar', 'specialization', 'targetLevel'];
const ADMIN_EDITABLE = ['name', 'email', 'avatar', 'role', 'campus', 'grade', 'specialization', 'englishLevel', 'targetLevel', 'studentId', 'isActive'];

exports.updateMe = asyncHandler(async (req, res) => {
  Object.assign(req.user, pick(req.body, SELF_EDITABLE));
  if (req.body.password) {
    assertPassword(req.body.password);
    req.user.password = req.body.password;
  }
  await req.user.save();
  ok(res, { user: req.user });
});

exports.list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'teacher') filter.role = 'student'; // teachers only see students
  else if (req.query.role) filter.role = String(req.query.role);
  if (req.query.q) {
    const q = String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }, { studentId: new RegExp(q, 'i') }];
  }
  ok(res, { users: await User.find(filter).sort({ createdAt: -1 }).limit(200) });
});

exports.create = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'email', 'password']);
  assertEmail(req.body.email);
  assertPassword(req.body.password);
  const user = await User.create({ ...pick(req.body, [...ADMIN_EDITABLE, 'password']) });
  ok(res, { user }, 201);
});

exports.update = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  Object.assign(user, pick(req.body, ADMIN_EDITABLE));
  if (req.body.password) {
    assertPassword(req.body.password);
    user.password = req.body.password;
  }
  await user.save();
  ok(res, { user });
});

// Soft-delete keeps the learning history intact.
exports.deactivate = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  if (String(req.user._id) === req.params.id) throw new ApiError(400, 'You cannot deactivate your own account');
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  ok(res, { user });
});

// Teacher/admin view of one student's performance.
exports.studentProgress = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const student = await User.findOne({ _id: req.params.id, role: 'student' });
  if (!student) throw new ApiError(404, 'Student not found');
  const [courses, skills, activity, stats, badges] = await Promise.all([
    progressService.getCourseProgressList(student._id),
    progressService.getSkillProgress(student._id),
    progressService.getRecentActivity(student._id, 15),
    badgeService.getStats(student._id),
    StudentBadge.find({ studentId: student._id }).populate('badgeId').lean(),
  ]);
  ok(res, { student, courses, skills, recentActivity: activity, stats, badges });
});
