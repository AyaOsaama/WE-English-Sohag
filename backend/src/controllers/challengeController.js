const Challenge = require('../models/Challenge');
const ChallengeProgress = require('../models/ChallengeProgress');
const challengeService = require('../services/challengeService');
const { ApiError, asyncHandler, ok } = require('../utils/ApiError');
const { requireFields, assertObjectId, pick } = require('../utils/validate');

const FIELDS = ['title', 'description', 'type', 'requirement', 'xpReward', 'activeDate', 'isActive'];

exports.today = asyncHandler(async (req, res) => {
  const challenges = await challengeService.getTodaysChallenges();
  const progress = await ChallengeProgress.find({ studentId: req.user._id, dayKey: challengeService.dayKeyOf(), challengeId: { $in: challenges.map((c) => c._id) } }).lean();
  const byId = new Map(progress.map((p) => [String(p.challengeId), p]));
  ok(res, {
    challenges: challenges.map((c) => {
      const p = byId.get(String(c._id));
      return { ...c.toObject(), progress: p?.progress || 0, status: p?.status || 'not_started', completedAt: p?.completedAt || null };
    }),
  });
});

exports.start = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const challenge = await Challenge.findById(req.params.id);
  if (!challenge || !challenge.isActive) throw new ApiError(404, 'Challenge not found');
  ok(res, { progress: await challengeService.startChallenge(req.user._id, challenge._id) });
});

exports.listAll = asyncHandler(async (_req, res) => ok(res, { challenges: await Challenge.find().sort({ createdAt: -1 }) }));

exports.create = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'type']);
  ok(res, { challenge: await Challenge.create({ ...pick(req.body, FIELDS), createdBy: req.user._id }) }, 201);
});

exports.update = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const challenge = await Challenge.findByIdAndUpdate(req.params.id, pick(req.body, FIELDS), { new: true, runValidators: true });
  if (!challenge) throw new ApiError(404, 'Challenge not found');
  ok(res, { challenge });
});

exports.remove = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const challenge = await Challenge.findByIdAndDelete(req.params.id);
  if (!challenge) throw new ApiError(404, 'Challenge not found');
  await ChallengeProgress.deleteMany({ challengeId: challenge._id });
  ok(res, { message: 'Challenge deleted' });
});
