import type { Clock } from './types';

export const realClock: Clock = {
  now: () => Date.now(),
};
