export interface Coord {
  readonly lat: number;
  readonly lon: number;
  readonly accuracyMeters?: number;
  readonly timestampMs: number;
}

export interface Region {
  readonly id: string;
  readonly lat: number;
  readonly lon: number;
  readonly radiusMeters: number;
  readonly name?: string;
}

export interface GeofenceEvent {
  readonly type: 'enter' | 'exit';
  readonly regionId: string;
  readonly at: number;
}

export type Disposer = () => void;

export interface LocationProvider {
  getCurrent(): Promise<Coord | null>;
  watchRegion(region: Region): Disposer;
  subscribeGeofence(cb: (event: GeofenceEvent) => void): Disposer;
}
