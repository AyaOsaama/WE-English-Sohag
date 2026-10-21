const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema(
  {
    word: { type: String, required: true, trim: true },
    phonetic: { type: String, default: '' },
    category: { type: String, default: 'GENERAL', index: true },
    definition: { type: String, required: true },
    arabicMeaning: { type: String, default: '' },
    example: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vocabulary', vocabularySchema);
