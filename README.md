# Virtual Pet

iOS-only, 100% local, no-backend virtual pet. The single source of truth for
architecture, tech stack, testing contract, and coding style is [CLAUDE.md](./CLAUDE.md).

Phase roadmap lives in [docs/phases/](./docs/phases). Current phase: **Phase 0 — Scaffold**.

## Requirements

- Node 20+ (see [.nvmrc](./.nvmrc))
- pnpm 9+
- macOS with Xcode 16+ (for iOS Simulator — needed from Phase 2 onward)

## Setup

```bash
pnpm install
pnpm prepare        # installs husky git hooks
```

## Run on iOS Simulator

```bash
pnpm ios
```

Phase 0 shows a blank screen with the text "Virtual Pet — Phase 0".

## Test

```bash
pnpm typecheck            # TypeScript strict
pnpm lint                 # ESLint — 0 warnings allowed
pnpm test                 # Jest (core + ui + virtual-time projects)
pnpm test:virtual-time    # only time-based decay tests
pnpm test:e2e:ios         # Maestro E2E on iOS simulator
pnpm check-all            # typecheck + lint + test --coverage, run this before every PR
```

`pnpm test` on a fresh Phase 0 checkout is expected to show **one** failing test
(`src/core/pet/reducer.test.ts`). That test is intentionally red — it seeds
Phase 1 (state machine) for TDD.

## Layout

See [CLAUDE.md §4](./CLAUDE.md#4-architecture-boundaries-enforced-by-folder-layout).
Unidirectional dependency graph: `core → providers → ui`.
Violations are lint errors (see [eslint.config.js](./eslint.config.js)).

## Contributing

- Conventional Commits. Husky runs `commitlint` on every commit.
- Branch per phase: `phase/NN-<name>`.
- Before opening a PR: `pnpm check-all` must pass.
