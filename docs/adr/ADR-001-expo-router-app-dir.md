# ADR-001: Use project-root `app/` for Expo Router (not `src/app/`)

**Status**: Accepted (Phase 0)
**Date**: 2026-04-24

## Context

CLAUDE.md §4 sketches the source tree as:

```
src/
  app/    # Expo Router routes
  core/
  providers/
  ui/
```

However, Expo Router's convention (see https://docs.expo.dev/router/introduction/) is
that routes live in a **project-root** `app/` directory. The router is wired to this path
via the `expo-router/entry` main field and cannot be trivially relocated without custom
Metro resolver config.

## Decision

Place Expo Router routes in **`./app/`** (project root), not `./src/app/`.

All other directories in CLAUDE.md §4 remain under `src/` as described:

- `src/core/` — pure TS domain logic
- `src/providers/` — side-effect adapters
- `src/ui/` — screens, components, hooks consumed _by_ the routes in `app/`
- `src/widgets/` — Apple target code

A thin route file in `app/` typically does one thing: import a screen from `src/ui/` and
re-export it as the default. This preserves CLAUDE.md §4's intent (core → providers → ui
unidirectional graph) — the `app/` layer sits above `ui/` and imports downward.

## Consequences

- **+** Expo Router works out of the box (no custom Metro resolver config).
- **+** File-system routing conventions stay discoverable for future contributors.
- **−** `app/` appearing at project root is not obvious from CLAUDE.md §4 alone;
  readers must cross-reference this ADR. Mitigation: CLAUDE.md §4 will be updated to
  note the exception once this ADR is accepted.

## Rejected alternatives

- **Move routes under `src/app/`** with a custom Metro resolver: adds complexity for
  zero functional gain.
- **Skip Expo Router, use `@react-navigation` directly in a custom root**: CLAUDE.md §3
  locks `expo-router` implicitly (Expo SDK 54 default), and file-system routing reduces
  boilerplate for every new screen.
