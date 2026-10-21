const { ApiError } = require('../utils/ApiError');

// Speech-to-text abstraction: transcribe({ buffer, mimetype, clientTranscript }) -> { transcript, provider, confidence }
//
// Providers:
//  - openai : real transcription (Whisper API). Requires SPEECH_API_KEY.
//  - mock   : DEVELOPMENT FALLBACK ONLY. It does not listen to the audio; it reuses the transcript the
//             browser produced with the Web Speech API. Disabled when NODE_ENV=production.
const providers = {
  openai: {
    name: 'openai-whisper',
    async transcribe({ buffer, mimetype }) {
      const form = new FormData();
      form.append('file', new Blob([buffer], { type: mimetype }), 'speech.webm');
      form.append('model', 'whisper-1');
      form.append('language', 'en');
      const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.SPEECH_API_KEY}` },
        body: form,
      });
      if (!res.ok) throw new ApiError(502, 'Speech-to-text provider failed');
      const data = await res.json();
      return { transcript: data.text || '', confidence: null };
    },
  },
  mock: {
    name: 'dev-fallback:browser-transcript',
    async transcribe({ clientTranscript }) {
      return { transcript: (clientTranscript || '').trim(), confidence: null };
    },
  },
};

async function transcribe(input) {
  const wanted = process.env.SPEECH_PROVIDER || 'mock';
  if (wanted === 'mock' && process.env.NODE_ENV === 'production') {
    throw new ApiError(503, 'Speech-to-text is not configured on this server');
  }
  const provider = providers[wanted];
  if (!provider) throw new ApiError(500, `Unknown SPEECH_PROVIDER "${wanted}"`);
  const result = await provider.transcribe(input);
  return { ...result, provider: provider.name };
}

module.exports = { transcribe };
