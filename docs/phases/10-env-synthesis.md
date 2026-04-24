# Phase 10: Environmental synthesis (solar + lunar + weather)

**Goal**: Fill in the `weather` / `lunar` / `solar` fields that Phase 9 left as
`null`. Real WeatherKit wiring is still deferred (Phase 12+); weather here is a
deterministic mock so tests remain hermetic.

**Dependencies**: Phase 9. Adds `suncalc`, `lunisolar` runtime deps
(see [ADR-002](../adr/ADR-002-env-deps.md)).

## Deliverables

1. `src/core/env/types.ts` — `SolarInfo`, `LunarInfo`, `WeatherLite`,
   `WeatherCondition`.
2. `src/core/env/solar.ts` — `computeSolar(date, lat, lon)` using SunCalc.
3. `src/core/env/lunar.ts` — `computeLunar(date)` using lunisolar.
4. `src/core/env/weather.ts` — `mockWeather(lat, lon, nowMs)` deterministic
   fake. WeatherKit adapter is a future phase.
5. Updated `src/core/context/synthesize.ts`:
   - `lunar` is always populated (doesn't need coord).
   - `solar` / `weather` populated if `location.current` is non-null, else `null`.
6. Updated `src/core/context/types.ts` — `weather` / `lunar` / `solar` fields.
7. Unit tests for each env module.
8. Regenerated snapshot test for LifeContext.

## Scope decisions

- **Solar requires coord**; lunar does not. Weather also requires coord (so it
  can query location-specific in Phase 12+).
- **`moonPhase`** exposed as raw SunCalc value ∈ [0, 1); `moonIllumination`
  is the fraction ∈ [0, 1]. UI layers can derive names ("waxing gibbous" etc).
- **`isDaylight`** is a convenience flag: `nowMs ∈ [sunrise, sunset]`.
- **Mock weather** is keyed to `dayOfYear`, `lat`, `lon` so tests are stable
  and different locations yield different conditions. Temperature follows a
  sinusoid (5 °C … 25 °C).
- **Polar / high-lat edge case**: if SunCalc returns Invalid Date for
  sunrise/sunset, we emit `null`. `isDaylight` defaults to `false` in that case.

## Invariants

1. `computeLunar(d)` is pure — same `d` → deep-equal output.
2. `computeSolar(d, lat, lon).moonPhase ∈ [0, 1)`, `moonIllumination ∈ [0, 1]`.
3. `synthesizeContext(inputs)` never throws, even with edge-case lat/lon
   (polar, equatorial, antimeridian).
4. When `location.current` is `null`: `ctx.solar === null && ctx.weather === null`.
5. `ctx.lunar` is always a populated `LunarInfo`, never null.
