const mongoose = require('mongoose');

const speakingSubmissionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'SpeakingChallenge', required: true, index: true },
    audioUrl: { type: String, default: '' },
    audioKey: { type: String, default: '' }, // storage-provider key, used for ownership-checked playback
    durationSeconds: { type: Number, default: 0 },
    transcript: { type: String, default: '' },
    pronunciationScore: { type: Number, min: 0, max: 100, default: null },
    grammarScore: { type: Number, min: 0, max: 100, default: null },
    vocabularyScore: { type: Number, min: 0, max: 100, default: null },
    fluencyScore: { type: Number, min: 0, max: 100, default: null },
    overallScore: { type: Number, min: 0, max: 100, default: null },
    aiFeedback: { type: String, default: '' },
    evaluationProvider: { type: String, default: '' }, // which provider produced the scores (e.g. "mock-dev")
    xpEarned: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('SpeakingSubmission', speakingSubmissionSchema);
