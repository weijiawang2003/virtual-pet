# Phase 19: Real iOS local notifications

**Goal**: Wire the existing nudge engine + phrase pool + notification provider
port into a real iOS local-notification system so the pet can ping the user
when the app is killed/backgrounded.

**Dependencies**: Phases 4 (permissions), 5 (NotificationProvider port),
6 (selectNudges), 12 (selectPhrase + pool), 17 (runtime providers),
18 (onboarding).

## Native dependency

`expo-notifications` is added in this phase (CLAUDE.md §3 lists it as
locked tech stack; ADR-005 documents the actual install). **Dev Client
rebuild required** before runtime test on device.

## Deliverables

1. `src/providers/notifications/real.ts` — full impl over expo-notifications.
2. `src/ui/notifications/nudge-to-notification.ts` — pure mapper; NudgeKind →
   BubbleKey → phrase via `selectPhrase`.
3. `src/ui/notifications/predict-and-schedule.ts` — pure planner; walks
   daily check-in hours, predicts pet via `applyDecay`, runs `selectNudges`.
4. `src/ui/notifications/scheduler-hook.ts` — AppState-driven cancel + plan
   - schedule cycle.
5. `src/ui/notifications/handler-setup.ts` — global setNotificationHandler
   (silent in foreground, badge yes) + tap-deep-link to Home.
6. `src/ui/screens/notifications-permission-screen.tsx` — modal screen.
7. `app/notifications-permission.tsx` — route wrapper.
8. Settings toggle "通知" + pending count.
9. Home screen one-shot trigger that pushes the permission modal once
   onboarding is complete and `notificationsAskedAt === null`.
10. `runtime-providers.ts` factory selects real vs fake by NODE_ENV.
11. Tests (mapping, planner, hook, permission screen, real provider).

## Architectural decisions

- **Provider port unchanged** — `NotificationProvider` interface stays
  identical to Phase 5; only the impl swap matters.
- **NudgeKind → BubbleKey lives in UI**, not core, per the
  do-not-touch-core constraint.
- **Date triggers only** — re-plan on each background. No calendar
  triggers in Phase 19.
- **Foreground policy**: silent banner, badge update only. No double-pinging
  user who's already in the app.
- **Tap → router.replace('/')**.
- **Sound gating**: real impl reads `useSettingsStore.getState().sound`.
- **Test env uses fake**: `runtime-providers` returns the fake when
  `process.env.NODE_ENV === 'test'`, so existing UI tests don't need an
  expo-notifications mock.

## Non-goals (Phase 19)

- Repeating calendar triggers
- Push notifications (cloud)
- Critical alerts / time-sensitive interruption levels
- Background fetch to extend schedule beyond 24h killed
