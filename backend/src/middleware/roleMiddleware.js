const { ApiError } = require('../utils/ApiError');

const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new ApiError(401, 'Authentication required'));
  if (!roles.includes(req.user.role)) return next(new ApiError(403, 'You do not have permission to do this'));
  next();
};

const staff = authorize('teacher', 'admin');
const adminOnly = authorize('admin');
const studentOnly = authorize('student');

module.exports = { authorize, staff, adminOnly, studentOnly };
