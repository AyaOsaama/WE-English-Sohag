const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['student', 'teacher', 'admin'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    studentId: { type: String, unique: true, sparse: true, trim: true }, // e.g. WE-SHG-2024-0842
    password: { type: String, required: true, minlength: 8, select: false },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ROLES, default: 'student', index: true },
    campus: { type: String, default: 'Sohag' },
    grade: { type: String, default: '' },
    specialization: { type: String, default: '' },
    englishLevel: { type: String, enum: LEVELS, default: 'A2' },
    targetLevel: { type: String, enum: LEVELS, default: 'B2' },
    xp: { type: Number, default: 0, min: 0 },
    currentStreak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
    lastActiveDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
module.exports.LEVELS = LEVELS;
