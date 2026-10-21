const Vocabulary = require('../models/Vocabulary');
const StudentVocabulary = require('../models/StudentVocabulary');
const vocabularyService = require('../services/vocabularyService');
const { ApiError, asyncHandler, ok } = require('../utils/ApiError');
const { requireFields, assertObjectId, pick } = require('../utils/validate');

const FIELDS = ['word', 'phonetic', 'category', 'definition', 'arabicMeaning', 'example', 'difficulty'];

exports.list = asyncHandler(async (req, res) => {
  const filter = req.query.category ? { category: String(req.query.category) } : {};
  ok(res, { words: await Vocabulary.find(filter).sort({ word: 1 }) });
});

exports.queue = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const [words, summary] = await Promise.all([
    vocabularyService.getQueue(req.user._id, limit, req.query.category ? String(req.query.category) : undefined),
    vocabularyService.getSummary(req.user._id),
  ]);
  ok(res, { words, summary });
});

exports.summary = asyncHandler(async (req, res) => ok(res, { summary: await vocabularyService.getSummary(req.user._id) }));

exports.get = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const word = await Vocabulary.findById(req.params.id).lean();
  if (!word) throw new ApiError(404, 'Vocabulary item not found');
  const stats = await StudentVocabulary.findOne({ studentId: req.user._id, vocabularyId: word._id }).lean();
  ok(res, { word, stats: stats ? { ...stats, accuracy: vocabularyService.accuracyOf(stats) } : null });
});

exports.answer = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  if (typeof req.body.correct !== 'boolean') throw new ApiError(400, '"correct" must be true or false');
  ok(res, await vocabularyService.answer(req.user._id, req.params.id, req.body.correct));
});

exports.create = asyncHandler(async (req, res) => {
  requireFields(req.body, ['word', 'definition']);
  ok(res, { word: await Vocabulary.create(pick(req.body, FIELDS)) }, 201);
});

exports.update = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const word = await Vocabulary.findByIdAndUpdate(req.params.id, pick(req.body, FIELDS), { new: true, runValidators: true });
  if (!word) throw new ApiError(404, 'Vocabulary item not found');
  ok(res, { word });
});

exports.remove = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const word = await Vocabulary.findByIdAndDelete(req.params.id);
  if (!word) throw new ApiError(404, 'Vocabulary item not found');
  await StudentVocabulary.deleteMany({ vocabularyId: word._id });
  ok(res, { message: 'Vocabulary item deleted' });
});
