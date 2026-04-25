# ADR-004: UI foundation native dependencies

**Status**: Accepted (Phase 14)
**Date**: 2026-04-24
**Approver**: human (authorized the list verbatim in Phase 14 prompt)

## Context

Phase 14 introduces the first UI layer. CLAUDE.md §3 lists the canonical
tech stack, and §2 requires an ADR for any dep add. This ADR covers the
Phase 14 set, pinned by `npx expo install` to SDK 54's matrix.

## Decision — runtime deps added

| Package             | Purpose                                               | CLAUDE.md §3 listed?   |
| ------------------- | ----------------------------------------------------- | ---------------------- |
| `react-native-mmkv` | Key-value persistence backing Zustand stores          | Yes                    |
| `expo-haptics`      | iOS impact haptics on button press + tab switch       | Yes                    |
| `expo-audio`        | SFX playback (wiring lands Phase 16)                  | Yes                    |
| `expo-image`        | Fast image rendering (for sprite work in later phase) | Implicit (sprite work) |
| `expo-sensors`      | Ambient light + motion (Phase 15+)                    | Yes                    |
| `zustand`           | State container (pairs with MMKV persist)             | Yes                    |

These upgrade to Expo-selected versions:

| Package                          | Upgraded | Why                                 |
| -------------------------------- | -------- | ----------------------------------- |
| `react-native-reanimated`        | Possibly | Reanimated v4 + Worklets v0.5 stack |
| `react-native-worklets`          | Possibly |                                     |
| `react-native-gesture-handler`   | Possibly | Peer dep of NativeTabs              |
| `react-native-safe-area-context` | Possibly | SafeAreaView in Home screen         |

All versions pinned exact (no `^` / `~`) after install.

## Rejected

- **`zustand-mmkv-storage`** — extra dep for ~20 lines of glue. Hand-rolled
  adapter in `src/ui/store/zustand-mmkv.ts` is trivial, fully typed, and
  easier to audit than a 1-contributor npm package.
- **`expo-pixel-perfect`** — could not locate a package by this exact name
  on npm. `PixelRatio.roundToNearestPixel` from RN core is sufficient.
  Revisit if an authoritative source surfaces.

## Consequences

- **+** SDK 54 matrix keeps the entire RN-side version graph consistent.
- **+** MMKV is synchronous — Zustand hydration runs in the same tick, no
  loading spinner on cold launch.
- **−** Expo Go is dead for this repo. Every dev needs a Dev Client build
  (`eas build:dev --profile development-simulator --platform ios`, ~15 min).
- **−** Jest setup gets more complex (jsdom + RN mocks + MMKV mock). New
  `ui` Jest project lands in Phase 14.

## Verification

- `pnpm install` + `npx expo install --check` reports no mismatches.
- `npx expo-doctor` passes.
- `pnpm typecheck` / `pnpm lint` / `pnpm test:coverage` stay green, core at 100%.
- Cold launch of Dev Client reaches Home screen with placeholder.
