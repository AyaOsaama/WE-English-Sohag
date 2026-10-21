const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    // Optional skill tag: when a score is submitted on completion it feeds that skill's progress.
    skill: { type: String, enum: ['reading', 'grammar', 'listening', null], default: null },
    // Optional quiz. Answers are graded on the server; correctIndex is never sent to students.
    quiz: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctIndex: { type: Number, required: true },
        explanation: { type: String, default: '' },
      },
    ],
    durationMinutes: { type: Number, default: 10 },
    xpReward: { type: Number, default: 20 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lesson', lessonSchema);
