import { createFakeLocationProvider } from '../../location/fake';
import type { LifeSignal } from '../../../core/signals/types';
import { createLocationSignalSource } from '../location-signal-source';

describe('createLocationSignalSource', () => {
  function setup() {
    const emitted: LifeSignal[] = [];
    const location = createFakeLocationProvider();
    const source = createLocationSignalSource({
      location,
      emit: (s) => emitted.push(s),
    });
    return { emitted, location, source };
  }

  it('emits location_change new_region:true on home exit', () => {
    const { emitted, location, source } = setup();
    const stop = source.start();
    location.emitGeofence({ type: 'exit', regionId: 'home', at: 1_000_000 });
    expect(emitted).toEqual([{ type: 'location_change', new_region: true, at: 1_000_000 }]);
    stop();
  });

  it('does not emit on home enter', () => {
    const { emitted, location, source } = setup();
    source.start();
    location.emitGeofence({ type: 'enter', regionId: 'home', at: 1_000_000 });
    expect(emitted).toEqual([]);
  });

  it('does not emit on non-home region exit', () => {
    const { emitted, location, source } = setup();
    source.start();
    location.emitGeofence({ type: 'exit', regionId: 'work', at: 1_000_000 });
    expect(emitted).toEqual([]);
  });

  it('respects custom homeRegionId', () => {
    const emitted: LifeSignal[] = [];
    const location = createFakeLocationProvider();
    const source = createLocationSignalSource({
      location,
      emit: (s) => emitted.push(s),
      homeRegionId: 'apartment-3b',
    });
    const stop = source.start();
    location.emitGeofence({ type: 'exit', regionId: 'apartment-3b', at: 5 });
    expect(emitted).toHaveLength(1);
    stop();
  });

  it('stop() unsubscribes', () => {
    const { emitted, location, source } = setup();
    const stop = source.start();
    stop();
    location.emitGeofence({ type: 'exit', regionId: 'home', at: 1 });
    expect(emitted).toEqual([]);
  });
});
