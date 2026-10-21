// Pure business-rule tests: no database needed.
const test = require('node:test');
const assert = require('node:assert/strict');
const { computeStreak, computeReview, accuracyOf, calcPercentage, meetsRequirement, gradeQuiz, MASTERED_LEVEL } = require('../src/utils/rules');

const day = (s) => new Date(`${s}T10:00:00Z`);

test('streak: first active day starts at 1', () => {
  const r = computeStreak({}, day('2026-10-11'));
  assert.equal(r.currentStreak, 1);
  assert.equal(r.longestStreak, 1);
});

test('streak: consecutive day increments', () => {
  const r = computeStreak({ currentStreak: 3, longestStreak: 3, lastActiveDate: day('2026-10-10') }, day('2026-10-11'));
  assert.equal(r.currentStreak, 4);
  assert.equal(r.longestStreak, 4);
});

test('streak: second activity on the same day does not increase it', () => {
  const r = computeStreak({ currentStreak: 3, longestStreak: 5, lastActiveDate: day('2026-10-11') }, day('2026-10-11'));
  assert.equal(r.currentStreak, 3);
  assert.equal(r.changed, false);
});

test('streak: a missed day resets to 1 but keeps the longest streak', () => {
  const r = computeStreak({ currentStreak: 6, longestStreak: 6, lastActiveDate: day('2026-10-08') }, day('2026-10-11'));
  assert.equal(r.currentStreak, 1);
  assert.equal(r.longestStreak, 6);
});

test('streak does not depend on XP amount (no xp input is read)', () => {
  const a = computeStreak({ currentStreak: 2, lastActiveDate: day('2026-10-10'), xp: 0 }, day('2026-10-11'));
  const b = computeStreak({ currentStreak: 2, lastActiveDate: day('2026-10-10'), xp: 99999 }, day('2026-10-11'));
  assert.equal(a.currentStreak, b.currentStreak);
});

test('vocabulary: correct answer updates counts, mastery and schedules a longer review', () => {
  const now = day('2026-10-11');
  const s = computeReview({}, true, now);
  assert.equal(s.reviewCount, 1);
  assert.equal(s.correctCount, 1);
  assert.equal(s.wrongCount, 0);
  assert.equal(s.masteryLevel, 1);
  assert.equal(s.nextReviewAt.getTime() - now.getTime(), 86400000);
});

test('vocabulary: wrong answer updates counts and schedules a quick retry', () => {
  const now = day('2026-10-11');
  const s = computeReview({ reviewCount: 2, correctCount: 2, masteryLevel: 2, consecutiveCorrect: 2 }, false, now);
  assert.equal(s.reviewCount, 3);
  assert.equal(s.wrongCount, 1);
  assert.equal(s.masteryLevel, 1);
  assert.equal(s.consecutiveCorrect, 0);
  assert.equal(s.nextReviewAt.getTime() - now.getTime(), 10 * 60000);
});

test('vocabulary: repeated correct answers lengthen the interval and reach mastery', () => {
  let state = {};
  let prevGap = 0;
  const now = day('2026-10-11');
  for (let i = 0; i < 5; i++) {
    state = computeReview(state, true, now);
    const gap = state.nextReviewAt - now;
    assert.ok(gap > prevGap, 'interval must grow');
    prevGap = gap;
  }
  assert.equal(state.masteryLevel, 5);
  assert.ok(state.masteryLevel >= MASTERED_LEVEL);
});

test('vocabulary: mastery never goes below 0 or above 5', () => {
  assert.equal(computeReview({ masteryLevel: 0 }, false).masteryLevel, 0);
  assert.equal(computeReview({ masteryLevel: 5 }, true).masteryLevel, 5);
});

test('vocabulary: accuracy = correct / reviews, null with no reviews', () => {
  assert.equal(accuracyOf({ reviewCount: 4, correctCount: 3 }), 75);
  assert.equal(accuracyOf({ reviewCount: 0, correctCount: 0 }), null);
});

test('course progress: 4 of 5 lessons = 80%', () => {
  assert.equal(calcPercentage(4, 5), 80);
  assert.equal(calcPercentage(0, 5), 0);
  assert.equal(calcPercentage(5, 5), 100);
  assert.equal(calcPercentage(0, 0), 0);
});

test('badges: requirement is met only when the stat reaches the value', () => {
  const badge = { requirementType: 'streak', requirementValue: 7 };
  assert.equal(meetsRequirement(badge, { streak: 6 }), false);
  assert.equal(meetsRequirement(badge, { streak: 7 }), true);
  assert.equal(meetsRequirement(badge, {}), false);
});

test('quiz grading is computed from the answers', () => {
  const lesson = { quiz: [{ correctIndex: 0 }, { correctIndex: 2 }] };
  assert.deepEqual(gradeQuiz(lesson, [0, 2]), { correct: 2, total: 2, score: 100 });
  assert.deepEqual(gradeQuiz(lesson, [0, 1]), { correct: 1, total: 2, score: 50 });
  assert.throws(() => gradeQuiz(lesson, [0]), /Answer every quiz question/);
  assert.equal(gradeQuiz({ quiz: [] }, []), null);
});
