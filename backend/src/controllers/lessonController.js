const Lesson = require('../models/Lesson');
const Unit = require('../models/Unit');
const CourseProgress = require('../models/CourseProgress');
const progressService = require('../services/progressService');
const { ApiError, asyncHandler, ok } = require('../utils/ApiError');
const { requireFields, assertObjectId, pick } = require('../utils/validate');

const FIELDS = ['title', 'content', 'skill', 'quiz', 'durationMinutes', 'xpReward', 'order'];

// Students never receive the correct answers or explanations before submitting.
const studentView = (lesson) => ({
  ...lesson,
  quiz: (lesson.quiz || []).map((q) => ({ _id: q._id, question: q.question, options: q.options })),
});

exports.get = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const lesson = await Lesson.findById(req.params.id).lean();
  if (!lesson) throw new ApiError(404, 'Lesson not found');
  const progress = await CourseProgress.findOne({ studentId: req.user._id, courseId: lesson.courseId }).lean();
  const completed = !!progress?.completedLessons.some((id) => String(id) === String(lesson._id));
  const ordered = await progressService.getOrderedLessons(lesson.courseId);
  const idx = ordered.findIndex((l) => String(l._id) === String(lesson._id));
  ok(res, {
    lesson: req.user.role === 'student' ? studentView(lesson) : lesson,
    completed,
    prevLessonId: idx > 0 ? ordered[idx - 1]._id : null,
    nextLessonId: idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1]._id : null,
  });
});

exports.complete = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  ok(res, await progressService.completeLesson(req.user._id, req.params.id, req.body.answers));
});

exports.create = asyncHandler(async (req, res) => {
  requireFields(req.body, ['unitId', 'title']);
  assertObjectId(req.body.unitId, 'unitId');
  const unit = await Unit.findById(req.body.unitId);
  if (!unit) throw new ApiError(404, 'Unit not found');
  ok(res, { lesson: await Lesson.create({ courseId: unit.courseId, unitId: unit._id, ...pick(req.body, FIELDS) }) }, 201);
});

exports.update = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const lesson = await Lesson.findByIdAndUpdate(req.params.id, pick(req.body, FIELDS), { new: true, runValidators: true });
  if (!lesson) throw new ApiError(404, 'Lesson not found');
  ok(res, { lesson });
});

exports.remove = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const lesson = await Lesson.findByIdAndDelete(req.params.id);
  if (!lesson) throw new ApiError(404, 'Lesson not found');
  ok(res, { message: 'Lesson deleted' });
});
