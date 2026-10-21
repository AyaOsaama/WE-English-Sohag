const mongoose = require('mongoose');

// Scored results for skills that are not derived from another collection
// (grammar / reading / listening quizzes attached to lessons). Extensible: add new `skill` values here.
const skillResultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skill: { type: String, enum: ['grammar', 'reading', 'listening'], required: true },
    score: { type: Number, required: true, min: 0, max: 100 }, // percent
    source: { type: String, default: 'lesson' },
    referenceId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
skillResultSchema.index({ studentId: 1, skill: 1, source: 1, referenceId: 1 }, { unique: true });

module.exports = mongoose.model('SkillResult', skillResultSchema);
