# Phase 0: Project Scaffold

**Goal**: Produce a minimal, testable, type-strict Expo SDK 54 project skeleton
that runs on iOS Simulator with a blank home screen, and has all test infrastructure
wired up and green.

**Dependencies**: none (this is the first phase).

## Deliverables

1. `package.json` with:
   - Expo SDK 54+, React Native 0.81+, React 19.1, TypeScript 5.5+
   - Dev deps: jest, jest-expo, @testing-library/react-native, fast-check,
     eslint, @typescript-eslint/*, prettier, husky, lint-staged, @commitlint/cli,
     @commitlint/config-conventional
   - Exact versions (no `^`, no `~`)
   - Scripts: `start`, `ios`, `typecheck`, `lint`, `lint:fix`, `test`,
     `test:virtual-time`, `test:e2e:ios`, `check-all`, `prepare`

2. `tsconfig.json`: strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes
   (see CLAUDE.md §6 for full list).

3. `app.json`: iOS-only initially, bundleIdentifier `com.<placeholder>.virtualpet`,
   newArchEnabled true, leave `ios.icon` blank for now.

4. Folder skeleton exactly per CLAUDE.md §4. Each folder gets a `.gitkeep` OR
   a single `index.ts` re-export placeholder.

5. Jest config with 3 projects: `core`, `ui`, `virtual-time` (per CLAUDE.md §5).

6. ESLint + Prettier configs matching CLAUDE.md §6 and §7.2 of the reference manual.

7. Husky + lint-staged hooks: pre-commit runs `pnpm lint-staged`;
   commit-msg runs `commitlint`.

8. Maestro directory `.maestro/` with one placeholder `cold-launch.yaml`.

9. **One intentionally failing smoke test** at `src/core/pet/reducer.test.ts`
   that imports `createPet` from `./reducer` (file doesn't exist yet).
   This primes Phase 1 for red→green→refactor.

10. `README.md` with: setup commands, how to run tests, how to run on simulator,
    link to CLAUDE.md.

## Success criteria (must ALL be true before closing Phase 0)

- [ ] `pnpm install` succeeds from clean checkout
- [ ] `pnpm typecheck` → exit 0
- [ ] `pnpm lint` → exit 0, 0 warnings
- [ ] `pnpm test` → all pass EXCEPT the one intentional failing smoke test for Phase 1
- [ ] `npx expo start` launches Metro without error
- [ ] Folder structure matches CLAUDE.md §4 exactly
- [ ] Git hooks fire on a test commit (verify by making a bad commit message)

## Non-goals for Phase 0

- No pet logic (that's Phase 1).
- No native deps beyond what Expo default template ships with.
- No custom UI components beyond the default Expo Router starter route.
- No HealthKit / location / notifications yet (those need Dev Client; Phase 4+).

## Plan mode required

Before writing ANY file for Phase 0, enter Plan Mode and output:
1. Exact shell commands in order
2. Each file to create with 1-line purpose
3. Exact scripts block for package.json
4. The 5 success-criteria commands you will run to verify
5. Questions for me (if any) via AskUserQuestion

Wait for my explicit "GO Phase 0" before executing.
