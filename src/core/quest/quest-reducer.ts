import { assertNever } from '../util/assert-never';
import type { Quest, QuestEvent, QuestStateContainer } from './types';

export const INITIAL_STATE: QuestStateContainer = Object.freeze({
  quests: Object.freeze({}),
  order: Object.freeze([]),
});

function withQuest(
  state: QuestStateContainer,
  id: string,
  patch: (q: Quest) => Quest,
): QuestStateContainer {
  const q = state.quests[id];
  if (q === undefined) return state;
  return {
    ...state,
    quests: { ...state.quests, [id]: patch(q) },
  };
}

export function reducer(state: QuestStateContainer, event: QuestEvent): QuestStateContainer {
  switch (event.type) {
    case 'quest_offer': {
      if (state.quests[event.quest.id] !== undefined) return state;
      return {
        quests: { ...state.quests, [event.quest.id]: event.quest },
        order: [event.quest.id, ...state.order],
      };
    }
    case 'quest_accept':
      return withQuest(state, event.questId, (q) => {
        if (q.state !== 'offered') return q;
        return { ...q, state: 'accepted', acceptedAt: event.now };
      });
    case 'quest_decline':
      return withQuest(state, event.questId, (q) => {
        if (q.state !== 'offered') return q;
        return { ...q, state: 'declined' };
      });
    case 'quest_progress':
      return withQuest(state, event.questId, (q) => {
        if (q.state !== 'accepted' && q.state !== 'in_progress') return q;
        const newProgress = q.progress + event.delta;
        const completed = newProgress >= q.threshold;
        return {
          ...q,
          progress: newProgress,
          state: completed ? 'completed' : 'in_progress',
          completedAt: completed ? event.now : q.completedAt,
        };
      });
    case 'quest_expire_check': {
      // Mark any non-terminal quest past expiresAt as expired. Don't
      // touch completed / declined / already-expired ones.
      let mutated = false;
      const next: Record<string, Quest> = {};
      for (const id of state.order) {
        const q = state.quests[id]!;
        const isLive = q.state === 'offered' || q.state === 'accepted' || q.state === 'in_progress';
        if (isLive && event.now >= q.expiresAt) {
          next[id] = { ...q, state: 'expired' };
          mutated = true;
        } else {
          next[id] = q;
        }
      }
      if (!mutated) return state;
      return { ...state, quests: next };
    }
    case 'quest_clear_completed': {
      // Remove completed/declined/expired quests from the active list.
      const survivingIds: string[] = [];
      const next: Record<string, Quest> = {};
      for (const id of state.order) {
        const q = state.quests[id]!;
        const live = q.state === 'offered' || q.state === 'accepted' || q.state === 'in_progress';
        if (live) {
          survivingIds.push(id);
          next[id] = q;
        }
      }
      if (survivingIds.length === state.order.length) return state;
      return { quests: next, order: survivingIds };
    }
    default:
      return assertNever(event);
  }
}

export function getActiveQuest(state: QuestStateContainer): Quest | null {
  for (const id of state.order) {
    const q = state.quests[id]!;
    if (q.state === 'offered' || q.state === 'accepted' || q.state === 'in_progress') {
      return q;
    }
  }
  return null;
}
