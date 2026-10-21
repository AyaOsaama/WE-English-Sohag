const Announcement = require('../models/Announcement');
const { ApiError, asyncHandler, ok } = require('../utils/ApiError');
const { requireFields, assertObjectId, pick } = require('../utils/validate');

const FIELDS = ['title', 'content', 'targetAudience', 'publishedAt', 'isActive'];

exports.list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') Object.assign(filter, { isActive: true, targetAudience: { $in: ['all', 'students'] }, publishedAt: { $lte: new Date() } });
  else if (req.user.role === 'teacher') Object.assign(filter, { isActive: true, targetAudience: { $in: ['all', 'students', 'teachers'] } });
  ok(res, { announcements: await Announcement.find(filter).sort({ publishedAt: -1 }).limit(50).populate('author', 'name') });
});

exports.create = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'content']);
  ok(res, { announcement: await Announcement.create({ ...pick(req.body, FIELDS), author: req.user._id }) }, 201);
});

// Teachers can change only their own announcements; admins can change any.
async function findEditable(req) {
  assertObjectId(req.params.id);
  const a = await Announcement.findById(req.params.id);
  if (!a) throw new ApiError(404, 'Announcement not found');
  if (req.user.role !== 'admin' && String(a.author) !== String(req.user._id)) throw new ApiError(403, 'You can only manage your own announcements');
  return a;
}

exports.update = asyncHandler(async (req, res) => {
  const a = await findEditable(req);
  Object.assign(a, pick(req.body, FIELDS));
  await a.save();
  ok(res, { announcement: a });
});

exports.remove = asyncHandler(async (req, res) => {
  const a = await findEditable(req);
  await a.deleteOne();
  ok(res, { message: 'Announcement deleted' });
});
