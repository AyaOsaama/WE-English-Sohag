// Pure business rules (no database access). Services call these; unit tests exercise them directly.
const { startOfDay, diffInDays } = require('./dates');
const { ApiError } = require('./ApiError');

const MASTERED_LEVEL = 4; // vocabulary masteryLevel at which a term counts as "mastered"
const MINUTE = 60000;
const DAY = 86400000;
// Review interval after a correct answer, indexed by the new mastery level (1..5).
const INTERVALS_MS = [0, 1 * DAY, 3 * DAY, 7 * DAY, 14 * DAY, 30 * DAY];
const WRONG_RETRY_MS = 10 * MINUTE;

// Streak = consecutive active calendar days. Independent of XP.
function computeStreak({ currentStreak = 0, longestStreak = 0, lastActiveDate = null }, now = new Date()) {
  const today = startOfDay(now);
  let next;
  let changed = true;
  if (!lastActiveDate) {
    next = 1;
  } else {
    const gap = diffInDays(today, lastActiveDate);
    if (gap === 0) { next = Math.max(currentStreak, 1); changed = false; }
    else if (gap === 1) next = currentStreak + 1;
    else next = 1; // missed at least one full day -> restart
  }
  return { currentStreak: next, longestStreak: Math.max(longestStreak, next), lastActiveDate: today, changed };
}

// Spaced repetition: correct -> mastery +1 and a longer interval; wrong -> mastery -1 and retry in 10 minutes.
function computeReview(state, correct, now = new Date()) {
  const s = {
    reviewCount: state.reviewCount || 0,
    correctCount: state.correctCount || 0,
    wrongCount: state.wrongCount || 0,
    consecutiveCorrect: state.consecutiveCorrect || 0,
    masteryLevel: state.masteryLevel || 0,
  };
  s.reviewCount += 1;
  s.lastReviewedAt = now;
  if (correct) {
    s.correctCount += 1;
    s.consecutiveCorrect += 1;
    s.masteryLevel = Math.min(5, s.masteryLevel + 1);
    s.nextReviewAt = new Date(now.getTime() + INTERVALS_MS[s.masteryLevel]);
  } else {
    s.wrongCount += 1;
    s.consecutiveCorrect = 0;
    s.masteryLevel = Math.max(0, s.masteryLevel - 1);
    s.nextReviewAt = new Date(now.getTime() + WRONG_RETRY_MS);
  }
  return s;
}

const accuracyOf = (s) => (s.reviewCount ? Math.round((s.correctCount / s.reviewCount) * 100) : null);

// Course progress = completed lessons / total lessons (never XP).
const calcPercentage = (completed, total) => (total > 0 ? Math.round((completed / total) * 100) : 0);

const meetsRequirement = (badge, stats) => (stats[badge.requirementType] ?? 0) >= badge.requirementValue;

function gradeQuiz(lesson, answers) {
  const quiz = lesson.quiz || [];
  if (!quiz.length) return null;
  if (!Array.isArray(answers) || answers.length !== quiz.length) throw new ApiError(400, 'Answer every quiz question');
  const correct = quiz.filter((q, i) => Number(answers[i]) === q.correctIndex).length;
  return { correct, total: quiz.length, score: Math.round((correct / quiz.length) * 100) };
}

module.exports = { MASTERED_LEVEL, INTERVALS_MS, WRONG_RETRY_MS, computeStreak, computeReview, accuracyOf, calcPercentage, meetsRequirement, gradeQuiz };
