export interface SolarInfo {
  readonly sunriseMs: number | null;
  readonly sunsetMs: number | null;
  readonly solarNoonMs: number | null;
  readonly moonPhase: number;
  readonly moonIllumination: number;
  readonly isDaylight: boolean;
}

export interface LunarInfo {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly isLeapMonth: boolean;
  readonly solarTerm: string | null;
  readonly chineseLabel: string;
}

export type WeatherCondition = 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'unknown';

export interface WeatherLite {
  readonly tempC: number | null;
  readonly feelsLikeC: number | null;
  readonly condition: WeatherCondition;
  readonly humidity: number | null;
  readonly observedAt: number;
}
