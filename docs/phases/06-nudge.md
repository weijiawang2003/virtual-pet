# Phase 6: Nudge selector + daily budget

**Goal**: Deterministic, pure nudge selection. Given a Pet state, current hour,
recent notification history, and a permission snapshot, return an ordered list
of Nudges that respects a per-day budget cap.

**Dependencies**: Phase 1 (Pet types), Phase 4 (PermissionSnapshot).

## Deliverables

1. `src/core/nudge/types.ts` — `NudgeKind`, `Nudge`, `NudgeRule` (discriminated
   union), `NudgeContext`, `RecentNotification`.
2. `src/core/nudge/selector.ts` — pure `selectNudges(ctx, rules, opts): Nudge[]`.
3. `src/core/nudge/default-rules.ts` — a small out-of-the-box rule set covering
   hunger, low energy, low happiness, night-time calm-down.
4. `src/core/nudge/selector.test.ts` — example-based behavior.
5. `src/core/nudge/selector.properties.test.ts` — **fast-check**: total notifs
   scheduled per rolling 24h window ≤ `dailyBudget`.

## Scope decisions

- **`NudgeRule` is data-driven**, not code. Keeps the rule set serializable
  (future use: tune from a remote config if we ever add one behind an ADR).
  Two initial shapes: `stat-threshold` and `hour-window`.
- **Budget is enforced by the selector**, not by the caller. `selectNudges`
  returns at most `dailyBudget - recentCount` nudges (clamped ≥ 0), where
  `recentCount` is notifications fired/scheduled within the last 24h.
- **Permission gating**: nudges that require `notifications: granted` are
  filtered out if permission is not granted. Non-notification rules pass through.
- **Tiebreaker**: rules are evaluated in declaration order; equal-priority
  nudges preserve that order (stable sort).

## Invariants (property-tested)

1. For any `recentNotifications` array and any `dailyBudget`,
   `selectNudges(...).length <= max(0, dailyBudget - recentWithin24h)`.
2. Over a simulated day of ticks + notification firings, the total fired in any
   rolling 24h window never exceeds `dailyBudget`.
3. `selectNudges` is pure: same inputs → deep-equal outputs.
4. Every returned `Nudge` has a non-empty message and a numeric priority.
