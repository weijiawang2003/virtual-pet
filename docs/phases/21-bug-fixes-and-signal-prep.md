# Phase 21: Bug fixes + signal interface bedding

**Goal**: Three fronts in one phase — fill remaining baby sprite cells,
silence the egg stage visually + verbally, and lay the contract Phase 22
will use to push HealthKit/Location/AppState signals into the reducer.

**Dependencies**: Phases 1, 2, 11, 16, 20.

## Deliverables

### Part A — sprite registry fill

- `src/ui/components/sprite-registry.ts` — register the 4 missing cells
  (`baby-idle` × {curious, cozy, dirty} → `baby/happy.png`; `baby-low` ×
  `low` → `baby/sleepy.png`). Helper `assignAll(moods, asset)` to keep
  declarations declarative.
- No change to `pet-sprite.tsx`: the real-PNG branch already does _not_
  layer the mood emoji overlay — only the emoji-fallback branch does.

### Part B — egg silence

- `src/core/visual/select-animation.ts` — top guard `if (pet.stage ===
'egg') return 'idle';`
- `src/core/visual/select-bubble.ts` — top guard `if (pet.stage === 'egg')
return null;`

### Part C — signal interface bedding

- `src/core/pet/types.ts`:
  - `PetEventSource = 'manual' | 'health' | 'inferred' | 'system'`
  - `source: PetEventSource` required on every Event variant
  - 3 new variants: `mood_adjust`, `bond_gain`, `curiosity_hint`
  - 2 optional Pet fields: `pendingBondGain?: number`,
    `curiosityHintUntil?: number`
- `src/core/pet/reducer.ts` — handles the 3 new variants; existing 4
  ignore the metadata `source` field.
- `src/core/signals/types.ts` — `LifeSignal` discriminated union (7
  variants: `steps_delta` / `sleep_session` / `activity_classified` /
  `idle_no_phone` / `heavy_phone_use` / `workout` / `location_change`).
- `src/core/signals/translator.ts` — pure `translateSignal(signal,
pet) → readonly Event[]` per the decision table.
- `src/ui/hooks/use-pet-actions.ts` — stamp `'manual'`.
- `src/ui/store/pet-snapshot-store.ts` — stamp `'system'` on tick.

### Tests

- `src/core/signals/translator.test.ts` — case-by-case + fast-check
  no-throw + source-classification.
- New egg-silence properties in `select-animation.test.ts` and
  `select-bubble.test.ts`.
- New sprite-registry hit assertions for the 4 new cells.
- Mechanical `source:` stamping across ~12 existing test files.

## Decisions

- Required `source` field, not optional — compile-time enforcement.
- `mood_adjust` is multi-field (`happiness?/energy?/satiety?` deltas)
  — single variant prevents enum sprawl.
- `bond_gain` accumulates into `Pet.pendingBondGain`. Phase 23 drains.
- `curiosity_hint` uses `max(existing, until)` so overlapping hints
  extend rather than clobber.
- Egg-silence guards live in the individual selectors (compose stays
  dumb).

## Out of scope (Phase 22)

- Real HealthKit / Location / AppState providers
- SignalBus that wires providers → translator → dispatch
- Settings & onboarding for real-life signal toggles
