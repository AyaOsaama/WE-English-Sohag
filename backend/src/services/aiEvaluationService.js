const aiService = require('./aiService');
const { ApiError } = require('../utils/ApiError');

// Speaking evaluation abstraction: evaluate({ transcript, prompt, durationSeconds, timeLimit })
//   -> { pronunciationScore, grammarScore, vocabularyScore, fluencyScore, overallScore, feedback, provider }
// Pronunciation cannot be judged from text, so it is null unless a provider supplies an acoustic score.
// Null scores are shown as "not assessed" and are excluded from the overall score - never invented.

const TECH_TERMS = ['network', 'bandwidth', 'latency', 'router', 'switch', 'packet', 'protocol', 'fiber', 'optical', 'algorithm', 'data', 'server', 'security', 'encryption', 'firewall', 'artificial', 'intelligence', 'machine', 'learning', 'model', 'cloud', 'signal', 'telecom', 'software', 'programming', 'code', 'wireless', '5g', 'ip', 'dns'];
const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
const average = (arr) => { const v = arr.filter((x) => typeof x === 'number'); return v.length ? clamp(v.reduce((a, b) => a + b, 0) / v.length) : null; };

// Development heuristic: measurable text statistics only. Labelled "dev-heuristic".
function heuristic({ transcript, durationSeconds, timeLimit }) {
  const words = transcript.toLowerCase().match(/[a-z0-9']+/g) || [];
  const unique = new Set(words);
  const sentences = transcript.split(/[.!?]+/).filter((s) => s.trim()).length || 1;
  const techHits = [...unique].filter((w) => TECH_TERMS.includes(w)).length;
  const wpm = durationSeconds > 0 ? (words.length / durationSeconds) * 60 : words.length;
  const fluency = clamp(100 - Math.abs(wpm - 130) * 0.6);
  const lengthFactor = Math.min(1, words.length / Math.max(20, (timeLimit || 60) * 1.0));
  const vocabularyScore = clamp((techHits / 6) * 60 + (unique.size / Math.max(words.length, 1)) * 40);
  const grammarScore = clamp(60 + Math.min(sentences, 6) * 5 + (words.length / sentences > 6 ? 5 : 0));
  const fluencyScore = clamp(fluency * lengthFactor);
  return {
    pronunciationScore: null,
    grammarScore,
    vocabularyScore,
    fluencyScore,
    feedback: `[Development heuristic, not AI] ${words.length} words, ${unique.size} unique, ${techHits} technical terms. Set AI_API_KEY for real AI feedback.`,
    provider: 'dev-heuristic',
  };
}

async function aiEvaluate({ transcript, prompt, durationSeconds }) {
  const system = 'You are an English speaking examiner. Reply with ONLY a JSON object: {"grammarScore":0-100,"vocabularyScore":0-100,"fluencyScore":0-100,"feedback":"2-3 encouraging sentences"}. Judge from the transcript only; do not score pronunciation.';
  const { text } = await aiService.complete({
    system,
    messages: [{ role: 'user', content: `Prompt: ${prompt}\nSpeaking time: ${durationSeconds}s\nTranscript: ${transcript}` }],
    maxTokens: 400,
  });
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new ApiError(502, 'AI evaluation returned an unreadable result');
  const j = JSON.parse(match[0]);
  return {
    pronunciationScore: null,
    grammarScore: clamp(j.grammarScore),
    vocabularyScore: clamp(j.vocabularyScore),
    fluencyScore: clamp(j.fluencyScore),
    feedback: String(j.feedback || ''),
    provider: process.env.AI_PROVIDER || 'anthropic',
  };
}

async function evaluate(input) {
  if (!input.transcript || input.transcript.trim().split(/\s+/).length < 3) {
    throw new ApiError(422, 'No speech was detected. Please record again and speak clearly.');
  }
  let result;
  if (aiService.isConfigured()) result = await aiEvaluate(input);
  else if (process.env.NODE_ENV === 'production') throw new ApiError(503, 'Speaking evaluation is not configured on this server');
  else result = heuristic(input);

  result.overallScore = average([result.pronunciationScore, result.grammarScore, result.vocabularyScore, result.fluencyScore]);
  return result;
}

module.exports = { evaluate, heuristic, average };
