import { useCallback, useEffect, useRef, useState } from 'react';
import { fmtDuration } from '../utils/format.js';

const SpeechRecognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

// Records real audio with MediaRecorder. If the browser supports the Web Speech API it also produces a live
// transcript, which the backend may use as a development fallback when no speech provider is configured.
export default function SpeakingRecorder({ timeLimit = 60, processing = false, onComplete, onStateChange }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const chunksRef = useRef([]);
  const secondsRef = useRef(0);
  const transcriptRef = useRef('');
  const stopRef = useRef(() => {});

  const cleanup = useCallback(() => {
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
  }, []);

  const stop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    cleanup();
    setRecording(false);
  }, [cleanup]);
  stopRef.current = stop;

  useEffect(() => () => { cleanup(); }, [cleanup]);
  useEffect(() => { onStateChange?.(processing ? 'processing' : recording ? 'recording' : 'idle'); }, [recording, processing, onStateChange]);

  const start = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Audio recording is not supported in this browser. Try Chrome, Edge or Safari.');
      return;
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Microphone access was denied. Allow the microphone in your browser settings and try again.');
      return;
    }
    streamRef.current = stream;
    chunksRef.current = [];
    secondsRef.current = 0;
    transcriptRef.current = '';
    setSeconds(0);
    setTranscript('');

    const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((t) => MediaRecorder.isTypeSupported?.(t)) || '';
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      onComplete?.({ blob, durationSeconds: secondsRef.current, transcript: transcriptRef.current.trim() });
    };
    recorderRef.current = recorder;
    recorder.start();

    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        rec.onresult = (event) => {
          let text = '';
          for (let i = 0; i < event.results.length; i++) text += event.results[i][0].transcript;
          transcriptRef.current = text;
          setTranscript(text);
        };
        rec.onerror = () => {};
        rec.start();
        recognitionRef.current = rec;
      } catch { /* live transcript is optional */ }
    }

    setRecording(true);
    timerRef.current = setInterval(() => {
      secondsRef.current += 1;
      setSeconds(secondsRef.current);
      if (secondsRef.current >= timeLimit) stopRef.current();
    }, 1000);
  };

  const busy = processing;
  return (
    <div className="w-full flex flex-col items-center">
      <div className="my-6 relative">
        {recording && <div className="absolute inset-0 -m-4 rounded-full border-4 border-we-magenta/40 animate-ping pointer-events-none" aria-hidden="true" />}
        <button
          type="button"
          onClick={recording ? stop : start}
          disabled={busy}
          aria-pressed={recording}
          className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full text-white flex flex-col items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 ${recording ? 'bg-gradient-to-tr from-rose-600 to-pink-600 shadow-rose-600/30' : 'bg-gradient-to-tr from-we-600 to-we-magenta shadow-we-600/30'}`}
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          <span className="text-[11px] font-bold mt-1 tracking-wider uppercase">{busy ? 'Scoring…' : recording ? 'Stop & Score' : 'Tap to Speak'}</span>
        </button>
      </div>

      <div className={`h-10 flex items-center justify-center gap-1.5 transition-opacity ${recording ? 'opacity-100' : 'opacity-20'}`} aria-hidden="true">
        {['bg-we-600', 'bg-we-magenta', 'bg-we-600', 'bg-indigo-500', 'bg-we-600', 'bg-we-magenta', 'bg-we-600'].map((c, i) => <span key={i} className={`w-1.5 ${c} rounded-full ${recording ? 'wave-bar' : ''}`} style={{ height: 8 }} />)}
      </div>

      {error && <p className="mt-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2" role="alert">{error}</p>}

      <div className="w-full mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400 mb-1">
          <span>Live Transcript {SpeechRecognition ? '' : '(not supported in this browser)'}</span>
          <span className="font-mono text-we-600">{fmtDuration(seconds)} / {fmtDuration(timeLimit)}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 min-h-[48px] italic">{transcript || 'Click the purple microphone and speak your response in English…'}</p>
      </div>
    </div>
  );
}
