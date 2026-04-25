# Phase 14: iOS UI foundation (no pet artwork yet)

**Goal**: Dev Client boots to a three-tab app with theme + persistence +
placeholder Home screen. Pet sprite artwork, animations, and provider wiring
are later phases.

**Dependencies**: Phases 0 – 13. **Adds native deps** — first phase that
requires a Dev Client rebuild.

## Deliverables

1. New runtime deps (via `npx expo install`, pinned by Expo SDK 54 matrix):
   `react-native-mmkv`, `expo-haptics`, `expo-audio`, `expo-image`,
   `expo-sensors`, `zustand`. Existing `react-native-reanimated`,
   `react-native-worklets`, `react-native-gesture-handler`,
   `react-native-safe-area-context` may get minor upgrades.
2. `babel.config.js` — Expo preset + `react-native-worklets/plugin` (must be
   LAST plugin for Reanimated v4).
3. `app.json` — add `assetBundlePatterns`, `icon` / `splash` placeholder paths,
   keep `newArchEnabled: true`.
4. `app/(tabs)/_layout.tsx` — Expo Router **NativeTabs** (SDK 54) with three
   tabs Home / Memory / Settings; light haptic on tab switch.
5. `app/(tabs)/index.tsx`, `memory.tsx`, `settings.tsx` — thin route files
   re-exporting screens from `src/ui/screens/`.
6. `src/ui/theme/*` — Light/Dark palette tables + `BackgroundKey → tint` map;
   `ThemeProvider` honors settings and system color scheme.
7. `src/ui/store/*` — single MMKV instance + hand-rolled Zustand persist
   adapter + two stores (`settings-store`, `pet-snapshot-store`).
8. `src/ui/haptics/use-haptics.ts` — wraps `expo-haptics`, gated by
   `settings.haptics`.
9. `src/ui/screens/home-screen.tsx` — SafeAreaView, stage badge, 240×240
   placeholder labeled "PET HERE", 4 stat ring placeholders, 4 action
   buttons (feed/play/clean/sleep) 56×56 each with `accessibilityLabel`
   and `Light` haptic on press.
10. `src/ui/screens/settings-screen.tsx` — toggles for haptics/sound/theme,
    "Reset pet" row (placeholder action), "About" link.
11. `src/ui/screens/memory-screen.tsx` — placeholder text for future phase.
12. `src/ui/components/*` — pet-placeholder, stage-badge,
    stat-ring-placeholder, action-button, setting-row, themed-view.
13. Jest `ui` project (jsdom) + `jest-setup.ts` wiring for RN + MMKV mock.
14. Tests: Zustand+MMKV persistence round-trip, settings defaults + toggles,
    `useHaptics` respects the setting, Home screen layout snapshot.

## Decisions taken in advance

- **No `zustand-mmkv-storage` package** — hand-rolled ~20-line adapter in
  `src/ui/store/zustand-mmkv.ts`. Fewer dependencies, fully typed, trivial to
  audit.
- **No `expo-pixel-perfect`** — not a real package I could locate. Use
  `PixelRatio.roundToNearestPixel` where needed. If you meant something else,
  raise it after Phase 14 ships.
- **`app/` at project root** per ADR-001. `src/ui/` for everything else.
- **UI coverage ≠ 100%** — `collectCoverageFrom` stays `src/core/**`. UI
  render paths have too many branches for forced 100% to be meaningful.

## Strict boundaries

- **No touch to `src/core/**`\*\*. 240 existing tests must stay green.
- No cloud / network / analytics code.
- No custom native code in `ios/` — Expo prebuild does the integration.
- No provider wiring beyond swapping `Fake*` into stores for Phase 15+.

## Testing contract

- `pnpm typecheck` / `pnpm lint` / `pnpm test:coverage` all green.
- Core coverage stays at 100% lines/branches/funcs.
- New `ui` Jest project runs UI-focused tests.

## Phase 14 NATIVE CHANGE

After `npx expo install` completes **the Dev Client must be rebuilt**
before the app can launch. Expo Go is no longer supported for this repo.

- `eas build:dev --profile development-simulator --platform ios` (10–20 min)
- Or `npx expo run:ios --device` for a local build.

## Non-goals (Phase 14)

- Real pet artwork (sprite art is a separate asset phase).
- HealthKit / location / notifications runtime wiring.
- Onboarding flow (just stores the flag; no UI for first-run).
- Animations beyond RN's `Animated` defaults on the placeholder.
