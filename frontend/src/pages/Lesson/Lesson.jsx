import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { courseApi } from '../../services/courseApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useRewards } from '../../hooks/useRewards.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Async } from '../../components/States.jsx';
import Markdown from '../../utils/Markdown.jsx';

export default function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const rewards = useRewards();
  const { toast } = useToast();
  const state = useAsync(() => courseApi.lesson(id), [id]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setAnswers({}); setResult(null); }, [id]);

  const isStudent = user.role === 'student';

  const complete = async (lesson) => {
    const quiz = lesson.quiz || [];
    if (quiz.length && Object.keys(answers).length < quiz.length) return toast('Answer every quiz question first.', 'error');
    setBusy(true);
    try {
      const res = await courseApi.completeLesson(id, quiz.length ? quiz.map((_, i) => answers[i]) : undefined);
      setResult(res);
      rewards(res);
      state.setData((d) => ({ ...d, completed: true }));
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Async state={state}>
      {({ lesson, completed, nextLessonId, prevLessonId }) => {
        const quiz = lesson.quiz || [];
        const done = completed || !!result;
        return (
          <article className="max-w-3xl mx-auto space-y-6">
            <Link to={`/courses/${lesson.courseId}`} className="text-xs font-bold text-we-600 hover:underline">← Back to course</Link>
            <header className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-we-card">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded-full bg-we-100 text-we-700">{lesson.durationMinutes} min</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">+{lesson.xpReward} XP</span>
                {done && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Completed ✓</span>}
              </div>
              <h1 className="text-2xl font-bold text-we-900 mt-2">{lesson.title}</h1>
            </header>

            <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-we-card text-sm text-slate-700 leading-relaxed">
              <Markdown text={lesson.content || 'No content yet.'} />
            </section>

            {quiz.length > 0 && isStudent && (
              <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-we-card space-y-5" aria-label="Lesson quiz">
                <h2 className="text-base font-bold text-we-900">Check your understanding</h2>
                {quiz.map((q, qi) => (
                  <fieldset key={q._id || qi} disabled={!!result}>
                    <legend className="text-sm font-semibold text-slate-800 mb-2">{qi + 1}. {q.question}</legend>
                    <div className="grid gap-2">
                      {q.options.map((opt, oi) => (
                        <label key={oi} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm cursor-pointer transition-all ${answers[qi] === oi ? 'border-we-600 bg-we-50 font-semibold' : 'border-slate-200 hover:border-we-300'}`}>
                          <input type="radio" name={`q${qi}`} checked={answers[qi] === oi} onChange={() => setAnswers((a) => ({ ...a, [qi]: oi }))} className="accent-we-600" />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
                {result?.quiz && <p className="text-sm font-bold text-we-700 bg-we-50 rounded-xl px-4 py-3">Quiz score: {result.quiz.correct} / {result.quiz.total} ({result.quiz.score}%)</p>}
              </section>
            )}

            <footer className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                {prevLessonId && <Link to={`/lessons/${prevLessonId}`} className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-we-400">← Previous</Link>}
              </div>
              <div className="flex gap-2">
                {isStudent && !done && <button onClick={() => complete(lesson)} disabled={busy} className="px-6 py-2.5 rounded-xl bg-we-600 hover:bg-we-700 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-we-600/20">{busy ? 'Saving…' : 'Mark as completed'}</button>}
                {nextLessonId ? (
                  <button onClick={() => navigate(`/lessons/${nextLessonId}`)} className={`px-5 py-2.5 rounded-xl text-xs font-bold ${done ? 'bg-we-600 text-white hover:bg-we-700' : 'bg-white border border-slate-200 text-slate-700 hover:border-we-400'}`}>Next lesson →</button>
                ) : done && <Link to={`/courses/${lesson.courseId}`} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold">Back to course ✓</Link>}
              </div>
            </footer>
            {result?.courseProgress && <p className="text-center text-xs text-slate-500">Course progress: <strong className="text-we-600">{result.courseProgress.percentage}%</strong> ({result.courseProgress.completedLessons}/{result.courseProgress.totalLessons} lessons){result.courseProgress.completed && ' — course complete! 🏁'}</p>}
          </article>
        );
      }}
    </Async>
  );
}
