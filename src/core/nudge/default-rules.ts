import type { NudgeRule } from './types';

// Order here is the tiebreaker for equal-priority nudges (stable sort).
export const DEFAULT_NUDGE_RULES: readonly NudgeRule[] = [
  {
    type: 'stat-threshold',
    kind: 'feed',
    stat: 'satiety',
    below: 20,
    priority: 90,
    message: 'Your pet is starving — feed it soon.',
    requiresNotificationPermission: true,
    suggestedAction: 'feed',
  },
  {
    type: 'stat-threshold',
    kind: 'rest',
    stat: 'energy',
    below: 20,
    priority: 70,
    message: 'Your pet is exhausted — let it rest.',
    requiresNotificationPermission: true,
    suggestedAction: 'rest',
  },
  {
    type: 'stat-threshold',
    kind: 'play',
    stat: 'happiness',
    below: 20,
    priority: 70,
    message: 'Your pet is bored — play a bit.',
    requiresNotificationPermission: true,
    suggestedAction: 'play',
  },
  {
    type: 'hour-window',
    kind: 'bedtime',
    hours: [22, 23, 0, 1, 2, 3, 4, 5, 6],
    priority: 30,
    message: 'Late hours — wind down with your pet.',
    requiresNotificationPermission: false,
  },
];

export const MS_PER_DAY = 24 * 60 * 60 * 1000;
