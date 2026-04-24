import { createFakeLocationProvider } from './fake';
import type { Coord, GeofenceEvent, Region } from './types';

const coord = (lat: number, lon: number, t = 1000): Coord => ({ lat, lon, timestampMs: t });

// San Francisco Ferry Building (approx).
const FERRY_BLDG: Region = { id: 'ferry', lat: 37.7955, lon: -122.3937, radiusMeters: 100 };

describe('createFakeLocationProvider — current position', () => {
  it('getCurrent returns null before setCurrent', async () => {
    const p = createFakeLocationProvider();
    expect(await p.getCurrent()).toBeNull();
  });

  it('setCurrent then getCurrent returns the coord', async () => {
    const p = createFakeLocationProvider();
    const c = coord(37.7955, -122.3937);
    p.setCurrent(c);
    expect(await p.getCurrent()).toEqual(c);
  });
});

describe('createFakeLocationProvider — geofence subscriptions', () => {
  it('emitGeofence is delivered to all subscribers', () => {
    const p = createFakeLocationProvider();
    const got: GeofenceEvent[] = [];
    p.subscribeGeofence((e) => got.push(e));
    p.subscribeGeofence((e) => got.push(e));
    p.emitGeofence({ type: 'enter', regionId: 'x', at: 1 });
    expect(got).toHaveLength(2);
  });

  it('disposer stops further delivery', () => {
    const p = createFakeLocationProvider();
    const got: GeofenceEvent[] = [];
    const dispose = p.subscribeGeofence((e) => got.push(e));
    p.emitGeofence({ type: 'enter', regionId: 'a', at: 1 });
    dispose();
    p.emitGeofence({ type: 'enter', regionId: 'b', at: 2 });
    expect(got.map((e) => e.regionId)).toEqual(['a']);
  });
});

describe('createFakeLocationProvider — watchRegion + auto enter/exit', () => {
  it('emits enter when setCurrent moves into the region', () => {
    const p = createFakeLocationProvider();
    const events: GeofenceEvent[] = [];
    p.subscribeGeofence((e) => events.push(e));
    p.watchRegion(FERRY_BLDG);

    // Start far away (Golden Gate Bridge ~8 km).
    p.setCurrent(coord(37.8199, -122.4783, 1000));
    expect(events).toEqual([]);

    // Move right onto the ferry building.
    p.setCurrent(coord(FERRY_BLDG.lat, FERRY_BLDG.lon, 2000));
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: 'enter', regionId: 'ferry', at: 2000 });
  });

  it('does not emit duplicate enter while still inside', () => {
    const p = createFakeLocationProvider();
    const events: GeofenceEvent[] = [];
    p.subscribeGeofence((e) => events.push(e));
    p.watchRegion(FERRY_BLDG);

    p.setCurrent(coord(FERRY_BLDG.lat, FERRY_BLDG.lon, 1000));
    p.setCurrent(coord(FERRY_BLDG.lat + 0.0001, FERRY_BLDG.lon + 0.0001, 2000)); // still within radius
    expect(events.filter((e) => e.type === 'enter')).toHaveLength(1);
  });

  it('emits exit when leaving the region', () => {
    const p = createFakeLocationProvider();
    const events: GeofenceEvent[] = [];
    p.subscribeGeofence((e) => events.push(e));
    p.watchRegion(FERRY_BLDG);

    p.setCurrent(coord(FERRY_BLDG.lat, FERRY_BLDG.lon, 1000));
    p.setCurrent(coord(37.8199, -122.4783, 2000));
    expect(events.map((e) => e.type)).toEqual(['enter', 'exit']);
    expect(events[1]!.at).toBe(2000);
  });

  it('watchRegion evaluates the current coord immediately (fires enter on setup if inside)', () => {
    const p = createFakeLocationProvider();
    p.setCurrent(coord(FERRY_BLDG.lat, FERRY_BLDG.lon, 500));
    const events: GeofenceEvent[] = [];
    p.subscribeGeofence((e) => events.push(e));
    p.watchRegion(FERRY_BLDG);
    expect(events).toEqual([{ type: 'enter', regionId: 'ferry', at: 500 }]);
  });

  it('disposer stops further enter/exit from that watcher', () => {
    const p = createFakeLocationProvider();
    const events: GeofenceEvent[] = [];
    p.subscribeGeofence((e) => events.push(e));
    const dispose = p.watchRegion(FERRY_BLDG);

    p.setCurrent(coord(FERRY_BLDG.lat, FERRY_BLDG.lon, 1000));
    dispose();
    p.setCurrent(coord(37.8199, -122.4783, 2000));
    expect(events).toEqual([{ type: 'enter', regionId: 'ferry', at: 1000 }]);
  });

  it('handles multiple watched regions independently', () => {
    const p = createFakeLocationProvider();
    const events: GeofenceEvent[] = [];
    p.subscribeGeofence((e) => events.push(e));
    p.watchRegion(FERRY_BLDG);
    p.watchRegion({ id: 'gg-bridge', lat: 37.8199, lon: -122.4783, radiusMeters: 200 });

    p.setCurrent(coord(FERRY_BLDG.lat, FERRY_BLDG.lon, 1000));
    expect(events.filter((e) => e.regionId === 'ferry')).toHaveLength(1);
    expect(events.filter((e) => e.regionId === 'gg-bridge')).toHaveLength(0);

    p.setCurrent(coord(37.8199, -122.4783, 2000));
    expect(events.filter((e) => e.type === 'enter' && e.regionId === 'gg-bridge')).toHaveLength(1);
    expect(events.filter((e) => e.type === 'exit' && e.regionId === 'ferry')).toHaveLength(1);
  });
});

describe('createFakeLocationProvider — reset', () => {
  it('clears watchers, subscribers, and current coord', async () => {
    const p = createFakeLocationProvider();
    const got: GeofenceEvent[] = [];
    p.subscribeGeofence((e) => got.push(e));
    p.watchRegion(FERRY_BLDG);
    p.setCurrent(coord(FERRY_BLDG.lat, FERRY_BLDG.lon, 1000));
    p.reset();

    expect(await p.getCurrent()).toBeNull();
    p.emitGeofence({ type: 'enter', regionId: 'x', at: 2 });
    expect(got).toHaveLength(1); // only the pre-reset enter
  });
});
