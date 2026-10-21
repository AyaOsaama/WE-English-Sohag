import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { triggerConfetti } from '../utils/confetti.js';
import { playChime } from '../utils/speech.js';

// Turns the "learning event" part of any API result into feedback:
// XP toast, new badges, completed challenges, and a refreshed header (XP / streak).
export function useRewards() {
  const { toast } = useToast();
  const { refreshUser } = useAuth();

  return useCallback(
    (result = {}) => {
      if (result.xpAwarded > 0) toast(`+${result.xpAwarded} XP earned`, 'success');
      if (result.newlyMastered) toast('Word mastered! 🎓', 'success');
      let celebrate = false;
      (result.completedChallenges || []).forEach((c) => { toast(`Challenge complete: ${c.title} (+${c.xpReward} XP)`, 'success'); celebrate = true; });
      (result.newBadges || []).forEach((b) => { toast(`New badge: ${b.icon} ${b.name}`, 'success'); celebrate = true; });
      if (result.streak?.changed && result.streak.currentStreak > 1) toast(`🔥 ${result.streak.currentStreak}-day streak!`, 'success');
      if (celebrate) { triggerConfetti(); playChime('success'); }
      refreshUser();
    },
    [toast, refreshUser]
  );
}
