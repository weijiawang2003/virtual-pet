# ADR-002: Add `suncalc` and `lunisolar` for environmental context

**Status**: Accepted (Phase 10)
**Date**: 2026-04-24
**Approver**: human (in chat, authorizing the two packages with pin-exact)

## Context

Phase 9's `LifeContext` reserved `solar` / `lunar` / `weather` fields as `null`
placeholders. CLAUDE.md §3 lists `lunisolar` and `SunCalc` in the locked tech
stack, but §2 requires an ADR for any dependency add. This ADR documents the
authorization and the design.

## Decision

Add two runtime dependencies, pinned exactly:

- `suncalc@1.9.0` — sunrise / sunset / solar noon + moon phase & illumination.
  Zero runtime deps; ~3 KB minified. Maintainer is mostly inactive but the
  algorithm is pure astronomical computation, no backend.
- `lunisolar@2.6.0` — Chinese lunar date + 24 solar terms (节气) + 干支 / 四柱.
  No network access; fully deterministic from a `Date`.

Dev dependency:

- `@types/suncalc@1.9.2` (suncalc ships no types).

All three pinned exact (no `^`, no `~`) per CLAUDE.md §3.

## Alternatives rejected

- **Compute sunrise/sunset ourselves**: astronomy is not core expertise; suncalc
  is battle-tested in many RN apps.
- **Roll our own lunar calendar**: lunisolar has localized Chinese output,
  leap-month handling, and 24 solar terms — too much surface to rebuild.
- **Add a third-party weather SDK now**: Phase 10 keeps weather as a
  deterministic mock. WeatherKit integration is deferred to Phase 12+ (requires
  Dev Client + Apple Developer capabilities).

## Consequences

- **+** `core/env/*` can compute solar and lunar contexts purely from
  `(date, lat, lon)` — still satisfies CLAUDE.md §4 ("core must be runnable in
  plain Node"), since both libs are pure JS.
- **+** Tests are deterministic (no wall-clock or network access).
- **−** Two more packages to security-audit. Both have clean histories and
  small surface.
- **−** `suncalc` has no built-in types; we import `@types/suncalc`.
  `lunisolar` ships types, but their API has version drift — a future upgrade
  will require care.

## Verification

- `pnpm typecheck` / `pnpm lint` pass.
- Phase 10 branch adds ≥ 100 % coverage on `src/core/env/*`.
- Snapshot test in `core/context/synthesize.snapshot.test.ts` now captures
  populated `solar` / `lunar` / `weather` fields.
