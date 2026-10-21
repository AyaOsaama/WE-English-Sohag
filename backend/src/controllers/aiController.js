const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const aiTutorService = require('../services/aiTutorService');
const { MODES } = require('../models/Conversation');
const { ApiError, asyncHandler, ok } = require('../utils/ApiError');
const { requireFields, assertObjectId } = require('../utils/validate');

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

exports.chat = asyncHandler(async (req, res) => {
  requireFields(req.body, ['message']);
  const message = String(req.body.message).trim();
  if (!message) throw new ApiError(400, 'message is required');
  if (message.length > 2000) throw new ApiError(400, 'Message is too long (max 2000 characters)');
  if (req.body.mode && !MODES.includes(req.body.mode)) throw new ApiError(400, 'Invalid mode');
  if (req.body.level && !LEVELS.includes(req.body.level)) throw new ApiError(400, 'Invalid level');
  if (req.body.conversationId) assertObjectId(req.body.conversationId, 'conversationId');
  ok(res, await aiTutorService.chat({ student: req.user, conversationId: req.body.conversationId, message, mode: req.body.mode, level: req.body.level }));
});

exports.listConversations = asyncHandler(async (req, res) => {
  ok(res, { conversations: await Conversation.find({ studentId: req.user._id }).sort({ updatedAt: -1 }).limit(50) });
});

exports.getConversation = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const conversation = await Conversation.findOne({ _id: req.params.id, studentId: req.user._id });
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  ok(res, { conversation, messages: await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 }) });
});

exports.removeConversation = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id);
  const conversation = await Conversation.findOneAndDelete({ _id: req.params.id, studentId: req.user._id });
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  await Message.deleteMany({ conversationId: conversation._id });
  ok(res, { message: 'Conversation deleted' });
});
