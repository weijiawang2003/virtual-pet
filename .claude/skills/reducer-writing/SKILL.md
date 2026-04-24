---
name: reducer-writing
description: Use when writing a new pure reducer or state-machine step function under src/core/**. Ensures immutability, discriminated unions, assertNever exhaustiveness, and tests.
---
# Rules for writing reducers in this project

1. Reducer signature: `(state: S, event: E) => S`. Pure. No side effects.
2. `E` must be a discriminated union with `type` as discriminator.
3. Inside switch, `default: return assertNever(event)` (see src/core/util/assertNever.ts).
4. Clamp all numeric stats to [0, 100] before return.
5. Never mutate; use object spread. Immer is allowed only in UI stores, NOT in core.
6. After writing, invoke the `test-writer` subagent to author tests.
7. Run `pnpm test -- --coverage <reducer-file>` and confirm coverage ≥ 95%.
