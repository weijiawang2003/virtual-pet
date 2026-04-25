# ADR-003: Add `tsx` for running TypeScript scripts without a build step

**Status**: Accepted (demo/terminal-runner)
**Date**: 2026-04-24
**Approver**: human (in chat, pre-authorizing with pin-exact)

## Context

We want to run one-off TypeScript scripts (starting with
`scripts/terminal-pet.ts`) that import from `src/core` and `src/providers`
without a compilation step. Options:

- `ts-node` — mature but slow, ESM support historically rocky.
- `tsx` — ESM-first, fast (esbuild-based), drop-in node replacement, zero
  config for TS path mapping.
- `bun`/`deno` — different runtime; changes the substrate.

## Decision

Add `tsx@4.21.0` as a **devDependency** (exact pin per CLAUDE.md §3).

## Consequences

- **+** `pnpm pet:demo` (and any future `scripts/*.ts`) runs with no build
  artifact and no watcher.
- **+** Matches Expo's own loose script conventions (tsx is recommended by
  Expo docs for `scripts/` utilities).
- **−** One more dev dep tree (esbuild). Build scripts for esbuild are
  ignored by pnpm default — no post-install code runs.
- **−** TS config for scripts stays the same strict `tsconfig.json`; the
  scripts must satisfy the same `noUncheckedIndexedAccess` /
  `exactOptionalPropertyTypes` flags as the rest of the codebase.

## Scope

- `scripts/` files may import from `src/core/**` and `src/providers/**`
  (they're the UI-layer substitute for demos). They must still pass
  `pnpm lint` and `pnpm typecheck`.
- `scripts/**` is **not** included in coverage collection (see
  `jest.config.js` `collectCoverageFrom`).
