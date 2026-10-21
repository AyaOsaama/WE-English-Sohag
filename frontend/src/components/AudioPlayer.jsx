import { useEffect, useState } from 'react';
import { speakingApi } from '../services/speakingApi.js';

// Audio is served by an authenticated endpoint, so fetch it as a blob instead of using a plain <audio src>.
export default function AudioPlayer({ submissionId }) {
  const [url, setUrl] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => url && URL.revokeObjectURL(url), [url]);

  const load = async () => {
    setBusy(true); setError('');
    try { setUrl(URL.createObjectURL(await speakingApi.audio(submissionId))); }
    catch { setError('Audio unavailable'); }
    finally { setBusy(false); }
  };

  if (url) return <audio controls src={url} className="h-8 w-full max-w-xs" autoPlay />;
  return (
    <button onClick={load} disabled={busy} className="text-[11px] font-bold text-we-600 hover:text-we-800 disabled:opacity-50">
      {busy ? 'Loading…' : error || '▶ Play recording'}
    </button>
  );
}
