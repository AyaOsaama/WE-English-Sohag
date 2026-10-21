const SpeakingChallenge = require('../models/SpeakingChallenge');
const SpeakingSubmission = require('../models/SpeakingSubmission');
const speakingService = require('../services/speakingService');
const storage = require('../services/storageService');
const { ApiError, asyncHandler, ok } = require('../utils/ApiError');
const { requireFields, assertObjectId, pick } = require('../utils/validate');

const FIELDS = ['title', 'description', 'prompt', 'timeLimit', 'xpReward', 'difficulty', 'active'];

exports.listChallenges = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'student' ? { active: true } : {};
  ok(res, { challenges: await SpeakingChallenge.find(filter).sort({ createdAt: 1 }) });
});

exports.createChallenge = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'prompt']);
  ok(res, { challenge: await SpeakingChallenge.create({ ...pick(req.body, FIELDS), createdBy: req.user._id }) }, 201);
});

exports.updateChallenge = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const challenge = await SpeakingChallenge.findByIdAndUpdate(req.params.id, pick(req.body, FIELDS), { new: true, runValidators: true });
  if (!challenge) throw new ApiError(404, 'Speaking challenge not found');
  ok(res, { challenge });
});

exports.removeChallenge = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const challenge = await SpeakingChallenge.findByIdAndDelete(req.params.id);
  if (!challenge) throw new ApiError(404, 'Speaking challenge not found');
  ok(res, { message: 'Speaking challenge deleted' });
});

exports.submit = asyncHandler(async (req, res) => {
  requireFields(req.body, ['challengeId']);
  assertObjectId(req.body.challengeId, 'challengeId');
  const result = await speakingService.submit({
    student: req.user,
    challengeId: req.body.challengeId,
    file: req.file,
    durationSeconds: req.body.durationSeconds,
    clientTranscript: req.body.transcript,
  });
  ok(res, result, 201);
});

// Students see their own submissions; teachers/admins can see everyone's (optionally per student).
exports.listSubmissions = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') filter.studentId = req.user._id;
  else if (req.query.studentId) {
    assertObjectId(req.query.studentId, 'studentId');
    filter.studentId = req.query.studentId;
  }
  if (req.query.challengeId) filter.challengeId = req.query.challengeId;
  const submissions = await SpeakingSubmission.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('challengeId', 'title')
    .populate('studentId', 'name email');
  ok(res, { submissions });
});

// Ownership-checked audio playback (audio files are never served from a public folder).
exports.audio = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const submission = await SpeakingSubmission.findById(req.params.id);
  if (!submission) throw new ApiError(404, 'Submission not found');
  const isOwner = String(submission.studentId) === String(req.user._id);
  if (!isOwner && req.user.role === 'student') throw new ApiError(403, 'You do not have permission to do this');
  if (!submission.audioKey) throw new ApiError(404, 'No audio stored for this submission');
  const data = await storage.read(submission.audioKey);
  res.set('Content-Type', storage.contentTypeFor(submission.audioKey));
  res.send(data);
});
