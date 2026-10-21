const Vocabulary = require('../models/Vocabulary');
const StudentVocabulary = require('../models/StudentVocabulary');
const { awardXP } = require('./xpService');
const { handleActivity } = require('./learningEventService');
const { ApiError } = require('../utils/ApiError');
const { MASTERED_LEVEL, computeReview, accuracyOf } = require('../utils/rules');

const CORRECT_XP = 5;

async function answer(studentId, vocabularyId, correct) {
  const vocab = await Vocabulary.findById(vocabularyId);
  if (!vocab) throw new ApiError(404, 'Vocabulary item not found');
  const now = new Date();

  let record = await StudentVocabulary.findOne({ studentId, vocabularyId });
  if (!record) record = new StudentVocabulary({ studentId, vocabularyId });

  // Only cards that are actually due pay XP, so re-flipping one card cannot farm points.
  const wasDue = !record.lastReviewedAt || record.nextReviewAt <= now;
  const wasMastered = record.masteryLevel >= MASTERED_LEVEL;

  Object.assign(record, computeReview(record, correct, now));
  await record.save();

  let xp = { awarded: false, amount: 0 };
  if (correct && wasDue) {
    xp = await awardXP({
      studentId,
      amount: CORRECT_XP,
      reason: `Correct answer: ${vocab.word}`,
      source: 'vocabulary',
      referenceId: `${vocabularyId}:${record.reviewCount}`,
    });
  }

  const events = await handleActivity({
    studentId,
    type: 'vocabulary',
    title: `Reviewed "${vocab.word}" (${correct ? 'correct' : 'needs practice'})`,
    referenceId: vocabularyId,
    xp: xp.amount,
  });

  return {
    stats: {
      reviewCount: record.reviewCount,
      correctCount: record.correctCount,
      wrongCount: record.wrongCount,
      accuracy: accuracyOf(record),
      masteryLevel: record.masteryLevel,
      mastered: record.masteryLevel >= MASTERED_LEVEL,
      nextReviewAt: record.nextReviewAt,
    },
    newlyMastered: !wasMastered && record.masteryLevel >= MASTERED_LEVEL,
    xpAwarded: xp.amount,
    ...events,
  };
}

// Deck summary built only from real attempts.
async function getSummary(studentId) {
  const [total, records] = await Promise.all([Vocabulary.countDocuments(), StudentVocabulary.find({ studentId })]);
  const now = new Date();
  const reviews = records.reduce((n, r) => n + r.reviewCount, 0);
  const correct = records.reduce((n, r) => n + r.correctCount, 0);
  return {
    totalWords: total,
    seen: records.length,
    mastered: records.filter((r) => r.masteryLevel >= MASTERED_LEVEL).length,
    dueForReview: records.filter((r) => r.nextReviewAt <= now).length,
    newWords: Math.max(0, total - records.length),
    totalReviews: reviews,
    accuracy: reviews ? Math.round((correct / reviews) * 100) : null,
  };
}

// Study queue: due cards first (oldest due first), then never-seen cards.
async function getQueue(studentId, limit = 20, category) {
  const filter = category ? { category } : {};
  const words = await Vocabulary.find(filter).lean();
  const records = await StudentVocabulary.find({ studentId }).lean();
  const byVocab = new Map(records.map((r) => [String(r.vocabularyId), r]));
  const now = new Date();
  const due = [];
  const fresh = [];
  for (const w of words) {
    const r = byVocab.get(String(w._id));
    if (!r) fresh.push({ ...w, stats: null });
    else if (r.nextReviewAt <= now) due.push({ ...w, stats: { ...r, accuracy: accuracyOf(r) } });
  }
  due.sort((a, b) => new Date(a.stats.nextReviewAt) - new Date(b.stats.nextReviewAt));
  return [...due, ...fresh].slice(0, limit);
}

module.exports = { accuracyOf, answer, getSummary, getQueue, CORRECT_XP };
