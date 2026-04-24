import { createPet } from '../pet/reducer';
import { synthesizeContext } from './synthesize';
import type { LifeContextInputs, PermissionsView } from './types';

const H = 60 * 60 * 1000;
const DAY = 24 * H;

const ALL_GRANTED: PermissionsView = {
  health: 'granted',
  location: 'granted',
  notifications: 'granted',
  calendar: 'limited',
  media: 'denied',
};

/**
 * Full-output snapshot. Pins the exact wire format of LifeContext so downstream
 * rules and UI can depend on it. Update intentionally when the shape changes.
 */
describe('synthesizeContext — full snapshot', () => {
  it('produces the frozen Phase 9 shape for a realistic fixture', () => {
    const nowMs = 10 * DAY + 15 * H; // exact instant; tz-adjusted below
    const inputs: LifeContextInputs = {
      pet: {
        ...createPet(0),
        ageMs: 30 * H,
        stage: 'teen',
        stats: { satiety: 42, energy: 58, happiness: 71 },
      },
      nowMs,
      tzOffsetMs: 8 * H, // UTC+8
      health: {
        steps: [
          { startAt: nowMs - 6 * H, endAt: nowMs - 5 * H, value: 1200 },
          { startAt: nowMs - 2 * H, endAt: nowMs - H, value: 800 },
          { startAt: nowMs - 30 * H, endAt: nowMs - 29 * H, value: 9999 }, // stale
        ],
        sleep: [{ startAt: nowMs - 10 * H, endAt: nowMs - 3 * H, stage: 'deep' }],
        hrv: [
          { startAt: nowMs - 20 * H, endAt: nowMs - 19 * H, sdnnMs: 45 },
          { startAt: nowMs - 4 * H, endAt: nowMs - 3 * H, sdnnMs: 55 },
        ],
      },
      location: {
        current: { lat: 31.23, lon: 121.47, timestampMs: nowMs },
        events: [
          { type: 'enter', regionId: 'home', at: nowMs - 2 * H },
          { type: 'enter', regionId: 'work', at: nowMs - 10 * H },
          { type: 'exit', regionId: 'work', at: nowMs - 5 * H },
        ],
      },
      permissions: ALL_GRANTED,
    };

    expect(synthesizeContext(inputs)).toMatchSnapshot();
  });
});
