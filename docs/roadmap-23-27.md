# Roadmap — Phases 23 → 27 (forward contract, not yet implemented)

**Status**: Locked design. **DO NOT IMPLEMENT** any of the phases below
without an explicit per-phase prompt. This document is a contract between
the human and the agent for what comes after Phase 22.

**Last updated**: 2026-04-25 (Phase 21 prep)

## Design philosophy

- **Real life is the granary, the phone is the spending floor.**
- **No anxiety, no streak-shaming.** A neglected pet does not die. Worst
  case: it falls asleep more, says less, asks for less.
- **Long-term growth comes from accumulated bonds + gacha rarity +
  species unlocks.** Not from XP grinds.
- **The pet is a relationship, not a task list.** Quests are gentle
  invitations; refusal never costs anything.

## Phase 23 — Vitality system

A single bounded local resource. Replaces ad-hoc rate limiting on
manual actions.

- One bar, range `[0, 100]`. Cap is hard.
- **Passive recovery**: `+5 / hour` always.
- **Real-life production**:
  - 1000 steps → +10
  - One sleep session ≥ 7h good → +30
  - 60 min idle (`idle_no_phone`) → +5
  - Outdoor activity (workout outside) → +15
- **Manual interaction cost**:
  - Feed → −10
  - Play → −15
  - Clean → −5
  - Common-pool gacha pull → −20
- **UI**: top of Home, single bar above the stage badge. Action buttons
  visually disabled when balance < cost; haptic "deny" on press.
- **Intent**: passively rewards walking + sleeping; discourages
  thumb-mashing. The pet is genuinely _less_ available when the user
  hasn't been living.

## Phase 24 — Vault + species/element/rarity

The Memory tab evolves into a Vault. Every pet ever owned is preserved
as a record, even after stage transitions or eventual species swaps.

- **Active pet**: 1 at a time on Home.
- **Background pets**: every other vault entry stays alive at **5×**
  decay slowdown, so they never die even if neglected for months.
- **Per-pet attributes** (frozen at hatch):
  - `species: SpeciesKey` (Phase 27 will expand from 4 → 12+)
  - `rarity: 'N' | 'R' | 'SR' | 'SSR'`
  - `element: 'fire' | 'water' | 'grass' | 'crystal' | 'moon' | 'shadow' | 'gold' | 'void'`
  - `personality: PersonalityTag[]` (≥ 1, ≤ 3) — modifies decay rates
    and animation preferences
- **Personality examples**:
  - `glutton` → satiety decays 1.4×
  - `sleepy` → energy recovers 1.3× during rest events
  - `wanderer` → curious mood reachable on lower thresholds
  - `clingy` → bond grows faster on AppState foreground
- **Element × signal sensitivity**:
  - `fire` → strong reaction to `steps_delta`, `workout`
  - `moon` → strong reaction to `sleep_session`, `time_of_day` night
  - `water` → strong reaction to consistent stats (rewards rhythm)
  - `crystal` → strong reaction to outdoor / weather signals
- **Vault UI**: horizontal scroll of pet cards, long-press to swap
  active. Long-pressing a deceased / "elder" pet shows the lifetime
  summary and final phrase.

## Phase 25 — Gacha (双轨)

Twin pools so neither path dominates.

### Vitality pool (常驻, 易得)

- Cost: **20 Vitality** per pull
- Distribution: `N 65% / R 28% / SR 7% / SSR 0%`
- Available whenever Vitality ≥ 20

### Essence pool (硬保底, 稀有)

- Cost: **10 Essence** per pull
- Distribution: `N 0% / R 0% / SR 90% / SSR 10%`
- **Hard pity**: SSR guaranteed at 100 cumulative pulls without one

### Essence sources (all from real life)

- 7 consecutive days with `steps_delta ≥ 8000`/day → **+5**
- Lifetime cumulative steps crossing each 100km → **+10**
- Bond with one pet reaches **100** → **+20**
- Quest completion → **+1 ~ +3** depending on quest weight

### Implementation

- All probabilities + cost values in `src/core/gacha/pools.ts` as pure
  data tables. No code paths read inline magic numbers.
- Determinism: pulls use `mulberry32` seeded by
  `(timestamp >>> 0) ^ totalPullsSoFar` so the same Vault state +
  same instant produces the same draw — important for testing.
- **Animation**: pull surfaces an unhatched egg first (matches Phase 0
  `egg` SpriteKey reuse), then dramatically reveals.

## Phase 26 — Quests

Pets initiate quests via local notifications.

### Quest archetypes

- `walk_target` — "陪我走 3000 步" — checks `steps_delta` over the
  next N hours
- `sleep_window` — "今晚 23:30 前睡觉" — checks `sleep_session` start
  time
- `new_place` — "明天去个新地方" — checks `location_change` with
  `new_region: true`
- `phone_break` — "1 小时不碰手机" — checks `idle_no_phone` ≥ 60min

### Lifecycle

1. Pet generates a quest based on personality + recent signals.
2. Local notification proposes it ("陪我走 3000 步好不好?").
3. User: accept / decline / ignore. **All three are valid.**
4. On accept → quest is active for its window.
5. On completion → Essence + bond gain.
6. On expire-without-success → small bond gain (you tried);
   pet says nothing accusatory.
7. **Decline never costs anything.** Pet's response is "好,改天再说。"

### Implementation

- `src/core/quests/types.ts` — `Quest`, `QuestArchetype`,
  `QuestStatus`
- `src/core/quests/generator.ts` — pure `generateQuest(pet, history)`
  → `Quest | null`
- `src/core/quests/checker.ts` — pure `checkQuest(quest, signals)` →
  `'in_progress' | 'success' | 'expired'`
- `src/ui/quests/quest-store.ts` — Zustand+MMKV store of active +
  past quests

## Phase 27 — Species expansion (4 → 12+)

The current 4 stages × 8 moods = 32 sprite cells per species. Phase 27
expands species count and ships matching artwork.

### Species roster (target)

- `bean-sprout` (grass, current default)
- `flame-cub` (fire)
- `tide-pup` (water)
- `glass-mote` (crystal)
- `moonling` (moon)
- `shadowkin` (shadow)
- `gilded-mouse` (gold)
- `void-twin` (void)
- 4 hybrid / cross-element species (TBD)

### Per species

- 5 stages × ~5 mood variants (excited / hungry / sleepy / curious /
  happy as the high-coverage set; rest fall back to a happy default)
- ≈ 25 PNG cells per species, 12+ species → 300+ assets
- Generate in batches via Nano Banana Pro, locking the
  `bean-sprout/baby/happy.png` style as the master reference

### Implementation

- `src/ui/components/sprite-registry.ts` extended with a top-level
  `species` axis: `Partial<Record<SpeciesKey,
Partial<Record<SpriteKey, Partial<Record<MoodTag, SpriteAsset>>>>>>`
- Active pet's `species` selects the inner registry slice; missing
  cells fall back to current emoji path

## Cross-cutting principles

- **Existing 240+ core tests stay 100% covered** through every roadmap
  phase. No regression budget.
- **No new npm dependencies** beyond what's in CLAUDE.md §3 unless
  preceded by an ADR.
- **Tone of all written content**: companion, not coach. Phases 23–27
  introduce a _lot_ of text surface (quest text, gacha results, vault
  summaries) — they all follow the Phase 12 `phrases/pool.ts` voice
  guide: warm, specific, no judgment, no streak language, no emoji
  in the prose itself.
- **Determinism over surprise** for testing: every random draw or
  quest selection seeds from a deterministic source so tests can
  reproduce.

## Out of scope (unless explicitly added later)

- Cloud sync between devices.
- Trading pets between users.
- Push notifications from a server (every notification is local).
- IAP / paid currency. Vitality and Essence are real-life-earned only.
- Achievements / badges. Bond and Vault entries are the long-term
  record; we deliberately don't pile on extra trophy systems.
