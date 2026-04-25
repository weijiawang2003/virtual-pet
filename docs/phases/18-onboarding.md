# Phase 18: Onboarding flow

**Goal**: First-launch wizard collects pet name + user birthday, persists
the user profile, and routes the user from Onboarding → Tabs once
complete. Birthday flows into `LifeContext.user.birthday` so the festival
accessory/bubble paths fire on the right day.

**Dependencies**: Phases 14–17.

## Deliverables

1. `src/ui/store/user-profile-store.ts` — Zustand+MMKV store for
   `{ name: string; birthday: { month, day } | null }`. Persisted.
2. `src/ui/hooks/use-life-context.ts` — wires `userProfile.birthday` into
   the synthesized context's `user` field.
3. `src/ui/screens/onboarding-screen.tsx` — three-step wizard:
   welcome → name → birthday → done. Final step writes profile + flips
   `settings.onboardingCompleted` true.
4. `src/ui/components/name-input.tsx` — themed text input.
5. `src/ui/components/birthday-picker.tsx` — month + day pill rows
   (no year — anniversaries are date-of-month events).
6. `app/_layout.tsx` — gate route by checking `settings.onboardingCompleted`.
   On false: redirect (`<Redirect />`) to `/onboarding`. On true: tabs.
7. `app/onboarding.tsx` — thin wrapper around `OnboardingScreen`.
8. `src/ui/screens/settings-screen.tsx` — "Reset onboarding" hidden under
   the Reset Pet flow so devs can replay the wizard.
9. Tests:
   - user-profile-store: defaults / setName / setBirthday / clear / persist
   - onboarding-screen smoke: renders welcome, name input, birthday picker
   - useLifeContext now passes profile birthday through

## Scope decisions

- **Name validation**: 1–24 chars after trimming. Empty disables Continue.
- **Birthday picker UI**: month [1..12] pill row + day [1..31] pill row.
  Trims invalid (month=2, day=30) silently to `min(day, daysInMonth(month))`
  — no calendar widget, no animations, MVP.
- **Optional skip**: a small "稍后再设" link lets users defer profile setup;
  flips `onboardingCompleted` true with `name=''` and `birthday=null`. The
  birthday-driven festival accessory falls back to off until set.
- **Settings layer**: a "Reset onboarding" button (devs-only label visible)
  flips both `onboardingCompleted` to false and clears the profile, sending
  the user back to the wizard on next launch.
- **No ADR**: no new deps. Pure UI work.

## Invariants

1. `onboardingCompleted: false` + opening the app → tabs hidden, only
   onboarding screen.
2. `onboardingCompleted: true` + opening the app → tabs visible, no
   onboarding flash.
3. A profile birthday set during onboarding flows into LifeContext after
   the next render.
4. `userProfile` survives kill-and-relaunch.
