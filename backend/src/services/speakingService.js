const SpeakingChallenge = require('../models/SpeakingChallenge');
const SpeakingSubmission = require('../models/SpeakingSubmission');
const storage = require('./storageService');
const speechService = require('./speechService');
const aiEvaluationService = require('./aiEvaluationService');
const { awardXP } = require('./xpService');
const { handleActivity } = require('./learningEventService');
const { dayKeyOf } = require('./challengeService');
const { ApiError } = require('../utils/ApiError');

// Flow: validate -> store audio -> speech-to-text -> evaluate -> save -> XP -> streak/challenges/badges
async function submit({ student, challengeId, file, durationSeconds, clientTranscript }) {
  const challenge = await SpeakingChallenge.findById(challengeId);
  if (!challenge || !challenge.active) throw new ApiError(404, 'Speaking challenge not found');
  if (!file) throw new ApiError(400, 'Audio recording is required');

  const duration = Math.min(Math.max(Number(durationSeconds) || 0, 0), challenge.timeLimit + 5);

  const stt = await speechService.transcribe({ buffer: file.buffer, mimetype: file.mimetype, clientTranscript });
  const evaluation = await aiEvaluationService.evaluate({
    transcript: stt.transcript,
    prompt: challenge.prompt,
    durationSeconds: duration,
    timeLimit: challenge.timeLimit,
  });

  const { key } = await storage.save(file.buffer, { ownerId: String(student._id), mimetype: file.mimetype });

  const submission = await SpeakingSubmission.create({
    studentId: student._id,
    challengeId: challenge._id,
    audioKey: key,
    durationSeconds: duration,
    transcript: stt.transcript,
    pronunciationScore: evaluation.pronunciationScore,
    grammarScore: evaluation.grammarScore,
    vocabularyScore: evaluation.vocabularyScore,
    fluencyScore: evaluation.fluencyScore,
    overallScore: evaluation.overallScore,
    aiFeedback: evaluation.feedback,
    evaluationProvider: `${stt.provider} + ${evaluation.provider}`,
  });
  submission.audioUrl = `/api/speaking/submissions/${submission._id}/audio`;

  // XP once per challenge per day, so repeated recordings do not farm points.
  const xp = await awardXP({
    studentId: student._id,
    amount: challenge.xpReward,
    reason: `Speaking: ${challenge.title}`,
    source: 'speaking',
    referenceId: `${challenge._id}:${dayKeyOf()}`,
  });
  submission.xpEarned = xp.amount;
  await submission.save();

  const events = await handleActivity({
    studentId: student._id,
    type: 'speaking',
    title: `Speaking challenge: ${challenge.title}`,
    referenceId: submission._id,
    xp: xp.amount,
  });

  return { submission, xpAwarded: xp.amount, ...events };
}

module.exports = { submit };
