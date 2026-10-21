import { useState } from 'react';
import { speakingApi } from '../../services/speakingApi.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useRewards } from '../../hooks/useRewards.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Async, EmptyState, PageHeader } from '../../components/States.jsx';
import SpeakingRecorder from '../../components/SpeakingRecorder.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import AudioPlayer from '../../components/AudioPlayer.jsx';
import { pct, timeAgo } from '../../utils/format.js';

const SCORES = [['pronunciationScore', 'Pronunciation'], ['fluencyScore', 'Fluency'], ['grammarScore', 'Grammar'], ['vocabularyScore', 'Vocabulary']];

function ScoreCard({ submission, xpAwarded }) {
  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-we-300 shadow-we-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-we-900">Your result</h3>
        <div className="text-right"><div className="text-3xl font-black text-we-600">{pct(submission.overallScore)}</div><div className="text-[11px] text-slate-400">Overall{xpAwarded > 0 ? ` • +${xpAwarded} XP` : ''}</div></div>
      </div>
      <div className="space-y-3">
        {SCORES.map(([key, label]) => (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-slate-700">{label}</span><span className="font-bold text-we-600">{submission[key] === null ? 'Not assessed' : `${submission[key]}%`}</span></div>
            {submission[key] !== null && <ProgressBar value={submission[key]} label={label} />}
          </div>
        ))}
      </div>
      <div className="bg-purple-50 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed"><div className="font-bold text-we-700 mb-1">Feedback</div>{submission.aiFeedback}</div>
      {submission.transcript && <div className="text-xs text-slate-500"><span className="font-bold">Transcript:</span> “{submission.transcript}”</div>}
    </div>
  );
}

export default function SpeakingLab() {
  const challenges = useAsync(() => speakingApi.challenges(), []);
  const history = useAsync(() => speakingApi.submissions(), []);
  const rewards = useRewards();
  const { toast } = useToast();
  const [selected, setSelected] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const onComplete = async ({ blob, durationSeconds, transcript }) => {
    if (!selected) return;
    if (durationSeconds < 3) return toast('Recording too short. Speak for at least a few seconds.', 'error');
    setProcessing(true);
    try {
      const res = await speakingApi.submit({ challengeId: selected._id, audioBlob: blob, durationSeconds, transcript });
      setResult(res);
      rewards(res);
      history.reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader badge="Assessment" badgeClass="bg-amber-100 text-amber-700" title="Speaking Lab" subtitle="Pick a topic, record your answer and receive scores and feedback. Your recording is saved to your account." />
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-we-900">Choose a challenge</h2>
          <Async state={challenges}>
            {({ challenges: list }) => list.length === 0 ? <EmptyState icon="🎙️" title="No speaking challenges yet" /> : list.map((c) => (
              <button key={c._id} onClick={() => { setSelected(c); setResult(null); }} className={`w-full text-left p-4 rounded-2xl border transition-all ${selected?._id === c._id ? 'bg-we-50 border-we-400' : 'bg-white border-slate-200 hover:border-we-300'}`}>
                <div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-800">{c.title}</span><span className="text-xs font-bold text-we-600">+{c.xpReward} XP</span></div>
                <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                <div className="text-[10px] text-slate-400 mt-1 uppercase">{c.difficulty} • {c.timeLimit}s</div>
              </button>
            ))}
          </Async>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {selected ? (
            <>
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-we-card">
                <div className="text-[11px] font-bold uppercase text-slate-400">Prompt</div>
                <h2 className="text-lg font-bold text-we-900 mt-1">{selected.prompt}</h2>
                <p className="text-xs text-slate-500 mt-1">{selected.description}</p>
                <SpeakingRecorder key={selected._id + (result ? 'r' : '')} timeLimit={selected.timeLimit} processing={processing} onComplete={onComplete} />
              </div>
              {result && <ScoreCard submission={result.submission} xpAwarded={result.xpAwarded} />}
            </>
          ) : <EmptyState icon="👈" title="Select a challenge to begin" />}

          <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-we-card">
            <h2 className="text-sm font-bold text-we-900 mb-3">Your recordings</h2>
            <Async state={history}>
              {({ submissions }) => submissions.length === 0 ? <p className="text-xs text-slate-500">No recordings yet.</p> : (
                <ul className="divide-y divide-slate-100">
                  {submissions.slice(0, 8).map((s) => (
                    <li key={s._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div><div className="text-xs font-bold text-slate-800">{s.challengeId?.title || 'Challenge'}</div><div className="text-[11px] text-slate-400">{timeAgo(s.createdAt)} • {pct(s.overallScore)}</div></div>
                      {s.audioKey !== undefined && <AudioPlayer submissionId={s._id} />}
                    </li>
                  ))}
                </ul>
              )}
            </Async>
          </section>
        </div>
      </div>
    </div>
  );
}
