const { ApiError } = require('../utils/ApiError');

// Chat abstraction used by AI Tutor and by aiEvaluationService.
//   complete({ system, messages, maxTokens }) -> { text, provider }
// Providers: "anthropic" (real, needs AI_API_KEY). When no key is set a labelled DEVELOPMENT FALLBACK
// answers outside production; in production a missing key returns 503 rather than faking a tutor.
const MODE_PROMPTS = {
  conversation: 'Hold a natural English practice conversation. Ask one follow-up question at a time.',
  grammar: 'Correct the student\'s grammar. Show the corrected sentence, then explain the rule briefly.',
  arabic: 'Explain the topic in simple English and then give a clear Arabic (Egyptian-friendly Modern Standard) explanation.',
  interview: 'Run a mock junior network technician job interview at Telecom Egypt. Ask one question at a time and give brief feedback on each answer.',
  technical: 'Teach technical English for telecom, networking, programming, cybersecurity and AI with short example sentences.',
  quiz: 'Give a short multiple-choice quiz one question at a time, then explain the answer.',
};
const LEVEL_HINT = { Beginner: 'CEFR A2: very simple words and short sentences.', Intermediate: 'CEFR B1: clear everyday and technical English.', Advanced: 'CEFR B2/C1: natural, precise technical English.' };

const buildSystemPrompt = ({ mode, level }) =>
  `You are the WE English Lab AI Tutor for Egyptian students at WE Applied Technology School, Sohag. ${MODE_PROMPTS[mode] || MODE_PROMPTS.conversation} Student level: ${LEVEL_HINT[level] || LEVEL_HINT.Intermediate} Keep answers concise.`;

const isConfigured = () => Boolean(process.env.AI_API_KEY);

const providers = {
  anthropic: async ({ system, messages, maxTokens }) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.AI_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.AI_MODEL || 'claude-sonnet-5-5', max_tokens: maxTokens, system, messages }),
    });
    if (!res.ok) throw new ApiError(502, 'AI provider request failed');
    const data = await res.json();
    return (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  },
};

function devFallback({ messages }) {
  const last = messages[messages.length - 1]?.content || '';
  return `[Development fallback - no AI_API_KEY configured, this is not a real AI reply]\nYou said: "${last.slice(0, 200)}"\nSet AI_API_KEY in backend/.env to enable the real AI Tutor.`;
}

async function complete({ system, messages, maxTokens = 700 }) {
  if (!isConfigured()) {
    if (process.env.NODE_ENV === 'production') throw new ApiError(503, 'AI Tutor is not configured on this server');
    return { text: devFallback({ messages }), provider: 'dev-fallback' };
  }
  const name = process.env.AI_PROVIDER || 'anthropic';
  const provider = providers[name];
  if (!provider) throw new ApiError(500, `Unknown AI_PROVIDER "${name}"`);
  return { text: await provider({ system, messages, maxTokens }), provider: name };
}

module.exports = { complete, buildSystemPrompt, isConfigured };
