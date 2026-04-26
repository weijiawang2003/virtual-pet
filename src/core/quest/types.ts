// Phase 26 — Quests are short, optional invitations the pet offers based on
// context: "walk 3000 steps", "sleep 7 hours", "go somewhere new". Reward
// is small Essence + Bond. Designed to feel like the pet asking, not the
// app demanding — declining is gentle, expiring is "expired" not "failed".

export type QuestType =
  | 'walk'
  | 'sleep'
  | 'idle'
  | 'visit_new_place'
  | 'play_with_pet'
  | 'feed_special';

export type QuestState =
  | 'offered'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'expired'
  | 'declined';

export interface Quest {
  readonly id: string;
  readonly type: QuestType;
  readonly threshold: number;
  readonly rewardEssence: number;
  readonly rewardBond: number;
  readonly expiresAt: number;
  readonly state: QuestState;
  // Cumulative progress; when ≥ threshold the reducer auto-completes.
  readonly progress: number;
  // Active pet at offer time. Phase 26 stores it for replay/audit; the
  // bond reward goes to whoever's active when the quest completes.
  readonly petId: string | null;
  readonly offeredAt: number;
  readonly acceptedAt: number | null;
  readonly completedAt: number | null;
}

export interface QuestStateContainer {
  readonly quests: Readonly<Record<string, Quest>>;
  readonly order: readonly string[];
}

export type QuestEvent =
  | { readonly type: 'quest_offer'; readonly quest: Quest }
  | { readonly type: 'quest_accept'; readonly questId: string; readonly now: number }
  | { readonly type: 'quest_decline'; readonly questId: string; readonly now: number }
  | {
      readonly type: 'quest_progress';
      readonly questId: string;
      readonly delta: number;
      readonly now: number;
    }
  | { readonly type: 'quest_expire_check'; readonly now: number }
  | { readonly type: 'quest_clear_completed' };
