const Course = require('../models/Course');
const Unit = require('../models/Unit');
const Lesson = require('../models/Lesson');
const CourseProgress = require('../models/CourseProgress');
const progressService = require('../services/progressService');
const { ApiError, asyncHandler, ok } = require('../utils/ApiError');
const { requireFields, assertObjectId, pick } = require('../utils/validate');

const COURSE_FIELDS = ['title', 'description', 'category', 'icon', 'difficulty', 'order', 'isPublished'];
const UNIT_FIELDS = ['title', 'description', 'order'];

exports.list = asyncHandler(async (req, res) => {
  if (req.user.role === 'student') return ok(res, { courses: await progressService.getCourseProgressList(req.user._id) });
  const courses = await Course.find().sort({ order: 1 }).lean();
  ok(res, { courses: courses.map((course) => ({ course })) });
});

exports.get = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const course = await Course.findById(req.params.id).lean();
  if (!course || (!course.isPublished && req.user.role === 'student')) throw new ApiError(404, 'Course not found');
  const progress = await CourseProgress.findOne({ studentId: req.user._id, courseId: course._id }).lean();
  const total = await Lesson.countDocuments({ courseId: course._id });
  ok(res, {
    course,
    totalLessons: total,
    progress: progress ? { ...progress, percentage: progressService.calcPercentage(progress.completedLessons.length, total) } : null,
  });
});

// Units with their lessons and the student's completion flags.
exports.units = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const [units, lessons, progress] = await Promise.all([
    Unit.find({ courseId: req.params.id }).sort({ order: 1 }).lean(),
    Lesson.find({ courseId: req.params.id }).select('-content -quiz').sort({ order: 1 }).lean(),
    CourseProgress.findOne({ studentId: req.user._id, courseId: req.params.id }).lean(),
  ]);
  const done = new Set((progress?.completedLessons || []).map(String));
  const current = progress?.currentLesson ? String(progress.currentLesson) : null;
  ok(res, {
    units: units.map((u) => ({
      ...u,
      lessons: lessons
        .filter((l) => String(l.unitId) === String(u._id))
        .map((l) => ({ ...l, completed: done.has(String(l._id)), isCurrent: current === String(l._id) })),
    })),
    currentLessonId: current,
  });
});

exports.create = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title']);
  ok(res, { course: await Course.create({ ...pick(req.body, COURSE_FIELDS), createdBy: req.user._id }) }, 201);
});

exports.update = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const course = await Course.findByIdAndUpdate(req.params.id, pick(req.body, COURSE_FIELDS), { new: true, runValidators: true });
  if (!course) throw new ApiError(404, 'Course not found');
  ok(res, { course });
});

exports.remove = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found');
  await Promise.all([Unit.deleteMany({ courseId: course._id }), Lesson.deleteMany({ courseId: course._id }), CourseProgress.deleteMany({ courseId: course._id })]);
  ok(res, { message: 'Course deleted' });
});

// ---- Units ----
exports.createUnit = asyncHandler(async (req, res) => {
  requireFields(req.body, ['courseId', 'title']);
  assertObjectId(req.body.courseId, 'courseId');
  if (!(await Course.exists({ _id: req.body.courseId }))) throw new ApiError(404, 'Course not found');
  ok(res, { unit: await Unit.create({ courseId: req.body.courseId, ...pick(req.body, UNIT_FIELDS) }) }, 201);
});

exports.updateUnit = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const unit = await Unit.findByIdAndUpdate(req.params.id, pick(req.body, UNIT_FIELDS), { new: true, runValidators: true });
  if (!unit) throw new ApiError(404, 'Unit not found');
  ok(res, { unit });
});

exports.removeUnit = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const unit = await Unit.findByIdAndDelete(req.params.id);
  if (!unit) throw new ApiError(404, 'Unit not found');
  await Lesson.deleteMany({ unitId: unit._id });
  ok(res, { message: 'Unit deleted' });
});
