# Phase 17: Provider runtime wiring

**Goal**: Plumb `HealthKitProvider` / `LocationProvider` / `PermissionProvider`
through the UI as injectable ports. Default impls are the existing Phase 7/8
fakes seeded with deterministic demo data so the LifeContext shows real-ish
health/location samples without native HealthKit. Real native providers slot
in by replacing one factory.

**Dependencies**: Phases 4 (permissions), 7 (health), 8 (location), 14–16.

## Deliverables

1. `src/ui/providers/runtime-providers.ts` — `RuntimeProviders` interface +
   `createRuntimeProviders()` factory returning the trio of providers.
   Default factory wires Phase-7/8 fakes seeded with sample data.
2. `src/ui/providers/runtime-providers-context.tsx` — React context that
   exposes the providers tree to hooks.
3. `src/ui/hooks/use-health-samples.ts` — subscribes to the health provider
   and returns the latest 24h of `{steps, sleep, hrv}` for use in
   `synthesizeContext`.
4. `src/ui/hooks/use-location-snapshot.ts` — subscribes to location provider;
   exposes current coord + last-seen geofence events.
5. `src/ui/hooks/use-permissions-snapshot.ts` — pulls a snapshot from the
   permission provider on mount + foreground.
6. **`useLifeContext` rewritten** to consume the three hooks above; no longer
   hardcodes empty health/location or "all granted" permissions.
7. `app/_layout.tsx` mounts a `<RuntimeProvidersProvider>` so the rest of
   the tree resolves the context.
8. `src/ui/providers/seed-fake-data.ts` — deterministic sample data
   generator: 8000 steps spread across 24h, one ~7h sleep block, ~hourly HRV
   readings, 1 active "home" geofence event.
9. Tests:
   - `runtime-providers.test.ts` — factory smoke + default seed assertions
   - `use-health-samples.test.ts` — pulls samples from a passed provider
   - `use-life-context.test.tsx` — shows non-empty health summary now
10. Updated Home snapshot reflecting the populated context.

## Scope decisions

- **Real native providers deferred**: this phase ships the wiring; the
  `realHealthKitProvider` / `realLocationProvider` stubs already throw with
  "TODO(Phase 10/wire)". Switching the factory to use them is a one-line
  change once the user is in front of a Dev Client and grants the permissions.
- **Single context, not React Query**: provider data here is local-only and
  small. A custom context + hooks is enough; no need for tanstack/react-query.
- **Subscription model**: hooks use `useEffect` + provider's `subscribe`
  callback. They re-render on each pushed sample. For the fake, we trigger
  sample emission via a tiny `setInterval` in tests; production-real
  providers will push from native events.
- **Permissions cache**: snapshot read once on mount, refreshed when a
  permission-relevant action would fail (deferred to a later phase that
  surfaces failures).

## Invariants

1. `useLifeContext()` returns a `LifeContext` whose `.health` reflects the
   data the runtime providers reported.
2. Changing the provider factory (e.g., swap fake → real) flips data without
   any UI change.
3. Existing core tests untouched; the contract between core & providers
   doesn't change in this phase.
