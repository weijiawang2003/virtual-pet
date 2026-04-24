# Virtual Pet — Project Constitution (CLAUDE.md)

> This file is the single source of truth for all Claude Code sessions on this repo.
> If something here conflicts with your instinct: **follow this file, ask me if unsure**.

## 1. Product goal (NEVER drift from this)
An iOS-only, 100% local, no-backend, no-cloud-AI virtual pet app (Tamagotchi-style).
The pet reacts to the user's real life — steps, sleep, HRV, location, weather, calendar,
lunar date, focus mode, screenshot behavior, battery. All inference is local.

## 2. Non-goals (stop-lights)
- NO backend / server / DB
- NO cloud LLM calls at runtime
- NO user accounts / auth
- NO Android in this milestone (iOS first)
- NO analytics SDKs that leak PII
- NO new third-party dependencies without an `ADR-xxx-*.md` written first and approved

## 3. Tech stack (LOCKED — do not swap)
- Expo SDK 54+, React Native 0.81+, React 19.1
- TypeScript strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`
- Zustand (state) + MMKV (persistence via `react-native-mmkv`)
- expo-notifications, expo-location + expo-task-manager (geofencing),
  expo-sensors, expo-battery, expo-calendar, expo-screen-capture,
  expo-media-library, expo-localization, expo-audio (NOT expo-av; expo-av is removed)
- @kingstinct/react-native-healthkit (Nitro Modules)
- lunisolar, SunCalc
- expo-sqlite (event log ring buffer)
- Jest + @testing-library/react-native + fast-check (property-based)
- Maestro (E2E)
- Widgets/Live Activities: @bacons/apple-targets
- ESLint (@react-native/eslint-config + typescript-eslint strict) + Prettier
- Husky + lint-staged + commitlint (Conventional Commits)

## 4. Architecture boundaries (enforced by folder layout)
```
src/
  core/                # pure TS, no RN imports — must be runnable in plain Node
    pet/               # reducer, state machine, life stages, invariants
    decay/             # time decay engine (pure, takes Clock)
    nudge/             # nudge selector (pure, takes Context)
  providers/           # side-effect adapters — interfaces + real + fake impls
    health/            # HealthKitProvider interface + real + InMemoryFake
    location/
    weather/
    clock/             # Clock interface: now(), schedule()
    permissions/       # PermissionProvider interface (granted/denied/limited/notDetermined)
    notifications/
  ui/                  # screens, components, hooks
  widgets/             # Apple target code (Swift). Only touch with human approval.
  app/                 # Expo Router routes
__tests__/             # integration tests
.maestro/              # E2E flows
```

**Rule**: Anything in `core/` must NOT import from `providers/` or RN.
Anything in `providers/` must NOT import from `ui/`.

## 5. Testing contract (STRICT — every PR)
Claude MUST pass all of these before marking a task done:
  1. `pnpm typecheck`  → 0 errors
  2. `pnpm lint`       → 0 errors, 0 warnings (warnings count as failure)
  3. `pnpm test -- --coverage` → core/** coverage ≥ 95% lines
  4. `pnpm test:virtual-time` → all time-based decay tests green
  5. For UI/integration tasks: `pnpm test:e2e:ios` (Maestro) green on iPhone 16 sim

If ANY of the above fails, STOP, REPORT the failure, do NOT iterate blindly more than
2 attempts. Ask me.

## 6. Coding style
- Functional components, hooks only; no classes.
- `const` over `let`, never `var`.
- Named exports preferred; default exports only for Expo Router route files.
- File naming: `kebab-case.ts` for files, `PascalCase` for components.
- Max file size 300 lines. Split when hit.
- No `any`, no `@ts-ignore` (use `@ts-expect-error` with a ticket ref).
- Discriminated unions with `assertNever(x: never): never` exhaustiveness.
- All async fns return `Result<T, E>` (fp-ts style) or throw typed errors — no mixed.

## 7. What Claude MUST do before saying "done"
- Run hooks checklist (see .claude/settings.json)
- Run `pnpm check-all` (typecheck + lint + test + coverage threshold)
- Produce a short changelog bullet in the PR description
- If a native file (ios/**, app.json ios.*, Info.plist) was touched:
  post a 🚨 NATIVE CHANGE block with reasons.

## 8. What Claude MUST NOT do
- Add a new npm/pod dependency without first proposing it (plan mode) and waiting for ✅
- Touch files in `src/widgets/` Swift code unless explicitly asked
- Modify `ios/` folder directly (use Expo prebuild instead)
- Downgrade strict TS flags
- Disable or skip tests (even temporarily)
- Use `console.log` (use `src/core/log.ts` with levels)
- Commit directly to `main` (always feature branch + PR)
- Run `rm -rf`, `git push --force`, or edit `.env*` files (a PreToolUse hook will block)

## 9. Commit convention
Conventional Commits. Examples:
  feat(pet): add teen stage with HRV-sensitive decay
  fix(decay): clamp stats at 0 instead of NaN
  test(nudge): add fast-check property for budget invariant
  chore(deps): pin lunisolar to 2.x
Each commit body ends with: `Refs: #<issue>` or `Phase: <phase-id>`.

## 10. Branching / PR
- `main` protected.
- Branch per Phase: `phase/01-scaffold`, `phase/02-state-machine`, ...
- PR template: goal, test evidence (paste `pnpm test --coverage` summary),
  screenshots from iOS Simulator (use ios-simulator-mcp), checklist.

## 11. When stuck
- Prefer reading more of the codebase over guessing API signatures.
- If an Expo/RN API is unfamiliar, fetch the official doc via WebFetch FIRST,
  don't invent signatures (hallucinated Expo APIs is a known Claude failure mode).
- Ask me via AskUserQuestion before making architectural choices not listed here.

## 12. Phase roadmap (overview)
See docs/phases/*.md. Current target: Phase 0 (scaffold). Do NOT skip ahead.
