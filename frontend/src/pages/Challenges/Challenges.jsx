import { challengeApi } from '../../services/challengeApi.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Async, EmptyState, PageHeader } from '../../components/States.jsx';
import ChallengeCard from '../../components/ChallengeCard.jsx';

export default function Challenges() {
  const state = useAsync(() => challengeApi.today(), []);
  const { toast } = useToast();
  const start = async (c) => {
    try { await challengeApi.start(c._id); state.reload(); } catch (err) { toast(err.message, 'error'); }
  };
  return (
    <div className="space-y-6">
      <PageHeader badge="Daily" badgeClass="bg-amber-100 text-amber-700" title="Daily challenges" subtitle="Progress updates automatically when you finish the related activity. Each reward is paid once per day." />
      <Async state={state}>
        {({ challenges }) => {
          const done = challenges.filter((c) => c.status === 'completed').length;
          return challenges.length === 0 ? <EmptyState icon="🎯" title="No challenges today" /> : (
            <>
              <p className="text-xs font-bold text-slate-500">{done} of {challenges.length} completed today</p>
              <div className="space-y-4">{challenges.map((c) => <ChallengeCard key={c._id} challenge={c} onStart={start} />)}</div>
            </>
          );
        }}
      </Async>
    </div>
  );
}
