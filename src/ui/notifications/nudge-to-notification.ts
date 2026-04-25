import { selectPhrase } from '../../core/phrases/select';
import type { Nudge, NudgeKind } from '../../core/nudge/types';
import type { BubbleKey } from '../../core/visual/types';
import type { NotificationRequest } from '../../providers/notifications/types';

// NudgeKind → BubbleKey lives at the UI layer per the do-not-touch-core
// constraint. Mapping table is exhaustive across NudgeKind.
const NUDGE_TO_BUBBLE: Record<NudgeKind, BubbleKey> = {
  feed: 'hungry',
  rest: 'tired',
  play: 'playful',
  bedtime: 'cozy',
  custom: 'happy',
};

export interface NudgeToNotificationOptions {
  readonly fireAtMs: number;
  readonly recentlyUsedPhrases?: readonly string[];
  readonly data?: Readonly<Record<string, unknown>>;
}

// Pure mapper: Nudge + fire-time → NotificationRequest. Phrase is picked
// deterministically from the seed (fireAtMs >> 16) so the same scheduling run
// produces consistent titles across re-evaluations within ~65s windows.
export function nudgeToNotificationRequest(
  nudge: Nudge,
  opts: NudgeToNotificationOptions,
): NotificationRequest {
  const bubble = NUDGE_TO_BUBBLE[nudge.kind];
  const seed = (opts.fireAtMs >>> 16) | 0;
  const title = selectPhrase(bubble, seed, {
    recentlyUsed: opts.recentlyUsedPhrases ?? [],
  });
  return {
    title,
    body: '',
    fireAt: opts.fireAtMs,
    ...(opts.data !== undefined ? { data: opts.data } : { data: { kind: nudge.kind } }),
  };
}
