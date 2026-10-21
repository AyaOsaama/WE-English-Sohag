const mongoose = require('mongoose');

const studentVocabularySchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vocabularyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vocabulary', required: true },
    reviewCount: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
    consecutiveCorrect: { type: Number, default: 0 },
    lastReviewedAt: { type: Date, default: null },
    nextReviewAt: { type: Date, default: Date.now },
    masteryLevel: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);
studentVocabularySchema.index({ studentId: 1, vocabularyId: 1 }, { unique: true });
studentVocabularySchema.index({ studentId: 1, nextReviewAt: 1 });

module.exports = mongoose.model('StudentVocabulary', studentVocabularySchema);
