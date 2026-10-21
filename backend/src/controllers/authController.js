const User = require('../models/User');
const { signToken } = require('../middleware/authMiddleware');
const { ApiError, asyncHandler, ok } = require('../utils/ApiError');
const { requireFields, assertEmail, assertPassword, pick } = require('../utils/validate');

// Public registration always creates a student. Role, XP and streak fields in the body are ignored.
exports.register = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'email', 'password']);
  assertEmail(req.body.email);
  assertPassword(req.body.password);
  const data = pick(req.body, ['name', 'email', 'password', 'studentId', 'grade', 'specialization', 'englishLevel', 'targetLevel', 'avatar']);
  const user = await User.create({ ...data, role: 'student' });
  ok(res, { user, token: signToken(user) }, 201);
});

// Login with email or WE student ID.
exports.login = asyncHandler(async (req, res) => {
  const identifier = String(req.body.identifier || req.body.email || '').trim();
  const { password } = req.body;
  if (!identifier || typeof password !== 'string') throw new ApiError(400, 'Email/Student ID and password are required');
  const user = await User.findOne({ $or: [{ email: identifier.toLowerCase() }, { studentId: identifier }] }).select('+password');
  // Same message for unknown user and wrong password so accounts cannot be enumerated.
  if (!user || !user.isActive || !(await user.comparePassword(password))) throw new ApiError(401, 'Invalid credentials');
  ok(res, { user, token: signToken(user) });
});

// JWTs are stateless: logout is acknowledged here and the client discards the token.
exports.logout = (_req, res) => ok(res, { message: 'Logged out' });

exports.me = asyncHandler(async (req, res) => ok(res, { user: req.user }));
