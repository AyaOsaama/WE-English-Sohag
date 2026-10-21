const mongoose = require('mongoose');

const MODES = ['conversation', 'grammar', 'arabic', 'interview', 'technical', 'quiz'];

const conversationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'New conversation' },
    mode: { type: String, enum: MODES, default: 'conversation' },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);
module.exports.MODES = MODES;
