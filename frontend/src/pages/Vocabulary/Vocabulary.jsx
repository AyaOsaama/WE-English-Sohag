import { useState } from 'react';
import { vocabularyApi } from '../../services/vocabularyApi.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useRewards } from '../../hooks/useRewards.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Async, EmptyState, PageHeader } from '../../components/States.jsx';
import VocabularyCard from '../../components/VocabularyCard.jsx';
import { readAloud } from '../../utils/speech.js';
import { pct } from '../../utils/format.js';

function Stat({ label, value }) {
  return <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-we-card text-center"><div className="text-2xl font-black text-we-900">{value}</div><div className="text-[11px] text-slate-500 font-semibold uppercase">{label}</div></div>;
}

function Deck({ initial }) {
  const rewards = useRewards();
  const { toast } = useToast();
  const [words] = useState(initial.words);
  const [summary, setSummary] = useState(initial.summary);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cardStats, setCardStats] = useState(null);

  const finished = index >= words.length;
  const word = words[index];

  const answer = async (correct) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await vocabularyApi.answer(word._id, correct);
      rewards(res);
      setCardStats(res.stats);
      setSummary(await vocabularyApi.summary().then((d) => d.summary));
      setFlipped(false);
      setTimeout(() => { setIndex((i) => i + 1); setCardStats(null); }, cardStats ? 0 : 350);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Mastered" value={summary.mastered} />
        <Stat label="Due for review" value={summary.dueForReview} />
        <Stat label="New words" value={summary.newWords} />
        <Stat label="Accuracy" value={pct(summary.accuracy)} />
      </div>

      {words.length === 0 ? (
        <EmptyState icon="🎉" title="You're all caught up">No cards are due right now. Come back later for your next review.</EmptyState>
      ) : finished ? (
        <EmptyState icon="✅" title="Session complete">You reviewed {words.length} card{words.length === 1 ? '' : 's'}. Reload the page for the next batch.</EmptyState>
      ) : (
        <>
          <div className="text-center text-xs font-bold text-slate-400">Card {index + 1} of {words.length}</div>
          <VocabularyCard word={word} flipped={flipped} onFlip={() => setFlipped((f) => !f)} onSpeak={() => readAloud(word.word)} />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button disabled={!flipped || busy} onClick={() => answer(false)} className="px-6 py-3 rounded-2xl bg-white border-2 border-rose-200 text-rose-600 font-bold text-sm hover:bg-rose-50 disabled:opacity-40">Practice again</button>
            <button disabled={!flipped || busy} onClick={() => answer(true)} className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 disabled:opacity-40 shadow-md shadow-emerald-600/20">I know it ✓</button>
          </div>
          {!flipped && <p className="text-center text-xs text-slate-400">Flip the card to see the meaning, then rate yourself honestly.</p>}
        </>
      )}
    </div>
  );
}

export default function Vocabulary() {
  const state = useAsync(() => vocabularyApi.queue(20), []);
  return (
    <div className="space-y-6">
      <PageHeader badge="Flashcards" title="Technical vocabulary" subtitle="Spaced repetition: words you know come back later, words you miss come back soon." />
      <Async state={state}>{(data) => <Deck initial={data} />}</Async>
    </div>
  );
}
