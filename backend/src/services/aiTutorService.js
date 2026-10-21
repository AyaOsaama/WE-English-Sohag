const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const aiService = require('./aiService');
const { handleActivity } = require('./learningEventService');
const { ApiError } = require('../utils/ApiError');

const MAX_HISTORY = 20;
const TITLES = { conversation: 'Practice conversation', grammar: 'Grammar correction', arabic: 'Explain in Arabic', interview: 'Practice interview', technical: 'Technical English', quiz: 'Quiz' };

// React -> POST /api/ai/chat -> save user msg -> AI provider -> save AI reply -> return
async function chat({ student, conversationId, message, mode, level }) {
  let conversation;
  if (conversationId) {
    conversation = await Conversation.findOne({ _id: conversationId, studentId: student._id });
    if (!conversation) throw new ApiError(404, 'Conversation not found');
    if (level) conversation.level = level;
    if (mode) conversation.mode = mode;
  } else {
    conversation = new Conversation({
      studentId: student._id,
      mode: mode || 'conversation',
      level: level || 'Intermediate',
      title: TITLES[mode] || message.slice(0, 50),
    });
  }

  const history = await Message.find({ conversationId: conversation._id }).sort({ createdAt: -1 }).limit(MAX_HISTORY).lean();
  history.reverse();
  const messages = [...history.map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content })), { role: 'user', content: message }];

  // Call the provider first: if it fails nothing is persisted and the student can retry.
  const reply = await aiService.complete({ system: aiService.buildSystemPrompt(conversation), messages });

  await conversation.save();
  const userMsg = await Message.create({ conversationId: conversation._id, sender: 'user', content: message });
  const aiMsg = await Message.create({ conversationId: conversation._id, sender: 'ai', content: reply.text });

  const events = await handleActivity({
    studentId: student._id,
    type: 'ai',
    title: `AI Tutor: ${conversation.title}`,
    referenceId: conversation._id,
    log: history.length === 0, // one activity entry per conversation, not per message
  });

  return { conversation, userMessage: userMsg, aiMessage: aiMsg, provider: reply.provider, ...events };
}

module.exports = { chat };
