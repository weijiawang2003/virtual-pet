# ADR-005: Add `expo-notifications` for local push

**Status**: Accepted (Phase 19)
**Date**: 2026-04-24
**Approver**: human (Phase 19 prompt explicitly authorized; CLAUDE.md §3
already lists `expo-notifications` in the locked tech stack)

## Context

Phase 5 established a `NotificationProvider` port with a fake impl; Phase 6
the nudge selector; Phase 12 the phrase pool. Phase 19 ships the real
runtime so the pet can ping the user via iOS local notifications when the
app is killed/backgrounded. That requires `expo-notifications`.

Despite CLAUDE.md §3 listing the package, Phase 14's actual `npx expo
install` only added `react-native-mmkv`, `expo-haptics`, `expo-audio`,
`expo-image`, `expo-sensors`, `zustand`. Notifications was missed. This
ADR closes the gap.

## Decision

Add `expo-notifications` as a runtime dependency. Pinned exact per
CLAUDE.md §3 (no `~`/`^`). Version is whatever `npx expo install` selects
from the SDK 54 matrix.

## Consequences

- **+** Real local-notification scheduling on iOS Dev Client and prod.
- **+** Permission API (`requestPermissionsAsync`, `getPermissionsAsync`)
  available — feeds Phase 4's PermissionProvider on real device.
- **−** Dev Client rebuild required before runtime test (matches Phase 14
  pattern). Expo Go was already dead for this repo, so no new gate for
  Expo Go users.
- **−** One more native module surface to track for security advisories.
  `expo-notifications` is maintained by Expo team and follows their
  release cadence.

## Scope

- Added to `dependencies` (not dev) since notifications run at runtime.
- Config plugin auto-registers when `npx expo install` runs.
- iOS Info.plist usage strings (UNUserNotificationCenter etc.) handled
  by Expo's plugin defaults; no manual Info.plist edits needed.
- No Android wiring this phase (project is iOS-only per CLAUDE.md §2).

## Verification

- `pnpm install` succeeds.
- `pnpm typecheck` / `pnpm lint` / `pnpm test:coverage` stay green.
- After Dev Client rebuild: cold-launch app, complete onboarding, ~3s
  later the permission modal shows; iOS native dialog appears on tap.
