import type { Coord, Disposer, GeofenceEvent, LocationProvider, Region } from './types';

export interface FakeLocationProvider extends LocationProvider {
  setCurrent(coord: Coord): void;
  emitGeofence(event: GeofenceEvent): void;
  reset(): void;
}

// Haversine distance in meters — good enough for geofence radii in the
// 10m–10km range we care about.
const EARTH_RADIUS_M = 6_371_000;
function haversineMeters(a: Coord, b: { lat: number; lon: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const sLat = Math.sin(dLat / 2);
  const sLon = Math.sin(dLon / 2);
  const h = sLat * sLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sLon * sLon;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function createFakeLocationProvider(): FakeLocationProvider {
  let current: Coord | null = null;
  const watchedRegions = new Map<string, Region>();
  // Per-region: whether the current coord is currently "inside" it.
  const insideByRegion = new Map<string, boolean>();
  const geofenceSubs = new Set<(e: GeofenceEvent) => void>();

  function deliver(event: GeofenceEvent): void {
    for (const cb of geofenceSubs) cb(event);
  }

  function evaluateRegionsAgainst(coord: Coord): void {
    for (const [id, region] of watchedRegions) {
      const wasInside = insideByRegion.get(id) ?? false;
      const nowInside = haversineMeters(coord, region) <= region.radiusMeters;
      if (nowInside && !wasInside) {
        insideByRegion.set(id, true);
        deliver({ type: 'enter', regionId: id, at: coord.timestampMs });
      } else if (!nowInside && wasInside) {
        insideByRegion.set(id, false);
        deliver({ type: 'exit', regionId: id, at: coord.timestampMs });
      }
    }
  }

  return {
    getCurrent: () => Promise.resolve(current),

    setCurrent: (coord: Coord) => {
      current = coord;
      evaluateRegionsAgainst(coord);
    },

    watchRegion: (region: Region): Disposer => {
      watchedRegions.set(region.id, region);
      insideByRegion.set(region.id, false);
      if (current !== null) evaluateRegionsAgainst(current);
      return () => {
        watchedRegions.delete(region.id);
        insideByRegion.delete(region.id);
      };
    },

    subscribeGeofence: (cb): Disposer => {
      geofenceSubs.add(cb);
      return () => geofenceSubs.delete(cb);
    },

    emitGeofence: (event: GeofenceEvent) => {
      deliver(event);
    },

    reset: () => {
      current = null;
      watchedRegions.clear();
      insideByRegion.clear();
      geofenceSubs.clear();
    },
  };
}
