/**
 * scripts/terminal-pet.ts
 *
 * Terminal CLI demo of the virtual-pet core. Drives the reducer at 10 Hz
 * against a FakeClock, synthesizes a LifeContext with Beijing coordinates
 * and "today" as the user's birthday so the festival paths are always hot.
 *
 * Run:    pnpm pet:demo [-- --speed N]
 * Default speed: 1 (1 real second = 1 simulated minute).
 *
 * Not product code. Not covered by tests. Must still pass lint + typecheck.
 */
import * as readline from 'node:readline';

import { synthesizeContext } from '../src/core/context/synthesize';
import type { LifeContext, LifeContextInputs, PermissionsView } from '../src/core/context/types';
import { selectPhrase } from '../src/core/phrases/select';
import { createPet, reducer } from '../src/core/pet/reducer';
import { STAGE_ORDER, STAGE_THRESHOLDS_MS } from '../src/core/pet/stages';
import type { Event, LifeStage, Pet } from '../src/core/pet/types';
import { createFakeClock } from '../src/providers/clock/fake-clock';
import { compose } from '../src/core/visual/compose';
import type { BubbleKey } from '../src/core/visual/types';

const H = 60 * 60 * 1000;
const TICK_MS = 100;
const CST_OFFSET_MS = 8 * H;
const BEIJING = { lat: 39.9, lon: 116.4 };

const ALL_GRANTED: PermissionsView = Object.freeze({
  health: 'granted',
  location: 'granted',
  notifications: 'granted',
  calendar: 'granted',
  media: 'granted',
});

const STAGE_EMOJI: Record<LifeStage, string> = {
  egg: '🥚',
  baby: '🐣',
  child: '🐥',
  teen: '🐤',
  adult: '🐔',
};

// ---------- CLI ----------
function parseSpeed(args: readonly string[]): number {
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === undefined) continue;
    if (a === '--speed' && i + 1 < args.length) {
      const v = Number(args[i + 1]);
      if (Number.isFinite(v) && v > 0) return v;
    }
    if (a.startsWith('--speed=')) {
      const v = Number(a.slice('--speed='.length));
      if (Number.isFinite(v) && v > 0) return v;
    }
  }
  return 1;
}

// ---------- Mutable demo state ----------
let speed = parseSpeed(process.argv.slice(2));
const clock = createFakeClock(Date.UTC(2026, 3, 24, 2, 0, 0));
let pet: Pet = createPet(clock.now());
const recentPhrases: string[] = [];
let lastBubble: { key: BubbleKey; text: string } | null = null;
let flashMessage: string | null = null;
let flashUntil = 0;

function todayMonthDayCst(nowMs: number): { month: number; day: number } {
  const d = new Date(nowMs + CST_OFFSET_MS);
  return { month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}
const userBirthday = todayMonthDayCst(clock.now());

// ---------- Logic ----------
function elapsedPerTick(): number {
  // At speed=1: 100ms real → 6000ms simulated (i.e. 1 real sec → 60 sim sec = 1 min).
  return 6000 * speed;
}

function buildContext(): LifeContext {
  const nowMs = clock.now();
  const inputs: LifeContextInputs = {
    pet,
    nowMs,
    tzOffsetMs: CST_OFFSET_MS,
    health: { steps: [], sleep: [], hrv: [] },
    location: {
      current: { lat: BEIJING.lat, lon: BEIJING.lon, timestampMs: nowMs },
      events: [{ type: 'enter', regionId: 'home', at: nowMs - 10 * 60 * 1000 }],
    },
    permissions: ALL_GRANTED,
    user: { birthday: userBirthday },
  };
  return synthesizeContext(inputs);
}

function pickPhrase(key: BubbleKey): string {
  const seed = (pet.ageMs ^ Math.floor(clock.now() / 60_000)) | 0;
  const phrase = selectPhrase(key, seed, { recentlyUsed: recentPhrases });
  recentPhrases.unshift(phrase);
  if (recentPhrases.length > 3) recentPhrases.length = 3;
  return phrase;
}

function dispatch(event: Event): void {
  pet = reducer(pet, event);
}

function flash(msg: string): void {
  flashMessage = msg;
  flashUntil = Date.now() + 1500;
}

function resetPet(): void {
  pet = createPet(clock.now());
  recentPhrases.length = 0;
  lastBubble = null;
  flash('reset');
}

// ---------- Rendering ----------
function bar(value: number, max: number, width = 20): string {
  const pct = Math.max(0, Math.min(1, value / max));
  const filled = Math.round(pct * width);
  return '▓'.repeat(filled) + '░'.repeat(width - filled);
}

function nextStageThresholdMs(stage: LifeStage): number | null {
  const idx = STAGE_ORDER.indexOf(stage);
  if (idx === -1 || idx >= STAGE_ORDER.length - 1) return null;
  const nextStage = STAGE_ORDER[idx + 1];
  if (nextStage === undefined) return null;
  return STAGE_THRESHOLDS_MS[nextStage];
}

function render(): void {
  const ctx = buildContext();
  const v = compose(pet, ctx);

  // Refresh bubble only when bubble key changes — avoids thrashing phrases
  // every 100ms. New phrase is drawn once per transition.
  if (v.bubble !== null) {
    if (lastBubble === null || lastBubble.key !== v.bubble) {
      lastBubble = { key: v.bubble, text: pickPhrase(v.bubble) };
    }
  } else {
    lastBubble = null;
  }

  const bubbleText = lastBubble?.text ?? '';
  const nextMs = nextStageThresholdMs(pet.stage);
  const idx = STAGE_ORDER.indexOf(pet.stage);
  const nextName = idx >= 0 && idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : null;
  const ageBar = nextMs === null ? bar(1, 1) : bar(pet.ageMs, nextMs);
  const ageLabel =
    nextMs === null
      ? 'adult (terminal)'
      : `${Math.floor(pet.ageMs / H)}h / ${Math.floor(nextMs / H)}h → ${nextName ?? '?'}`;

  const moonPct = Math.round((ctx.solar?.moonIllumination ?? 0) * 100);
  const daylight = ctx.solar?.isDaylight === true ? '白天' : '夜晚';
  const tempStr =
    ctx.weather?.tempC !== null && ctx.weather?.tempC !== undefined
      ? `${ctx.weather.tempC}°C`
      : '-';
  const weather = ctx.weather !== null ? `${ctx.weather.condition} ${tempStr}` : '—';
  const solarTermStr = ctx.lunar.solarTerm !== null ? ` · ${ctx.lunar.solarTerm}` : '';
  const lunar = `${ctx.lunar.chineseLabel}${solarTermStr}`;
  const isoClock = new Date(clock.now()).toISOString();

  const lines: string[] = [
    '',
    `    ${STAGE_EMOJI[pet.stage]}   ${v.mood.padEnd(10)}${v.animation}`,
    `    ${bubbleText === '' ? '（不说话）' : `「${bubbleText}」`}`,
    '',
    `  饱  ${bar(pet.stats.satiety, 100)}  ${Math.round(pet.stats.satiety)}`,
    `  力  ${bar(pet.stats.energy, 100)}  ${Math.round(pet.stats.energy)}`,
    `  心  ${bar(pet.stats.happiness, 100)}  ${Math.round(pet.stats.happiness)}`,
    `  月  ${bar(moonPct, 100)}  ${moonPct}%`,
    `  命  ${ageBar}  ${ageLabel}`,
    '',
    `  阶段: ${pet.stage}   ·   背景: ${v.background}   ·   饰品: ${v.accessory ?? '无'}`,
    `  天气: ${weather}   ·   ${daylight}   ·   触感: ${v.hapticHint ?? '—'}`,
    `  农历: ${lunar}`,
    `  时钟: ${isoClock}   ·   速度: ×${speed}`,
    '',
    flashMessage !== null && Date.now() < flashUntil ? `  ⚠  ${flashMessage}` : '',
    '',
    '  [f]喂  [p]玩  [s]睡  [c]清(占位)  [r]重置  [+/-]速度  [q]退出',
  ];

  process.stdout.write('\x1b[H');
  for (const line of lines) {
    process.stdout.write(`${line}\x1b[K\n`);
  }
  process.stdout.write('\x1b[J');
}

// ---------- Input / lifecycle ----------
let intervalHandle: ReturnType<typeof setInterval> | null = null;

function setupTerminal(): void {
  process.stdout.write('\x1b[2J\x1b[H\x1b[?25l');
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  readline.emitKeypressEvents(process.stdin);
  process.stdin.resume();
}

function teardownTerminal(): void {
  process.stdout.write('\x1b[?25h\n');
  if (process.stdin.isTTY) process.stdin.setRawMode(false);
}

function cleanup(): void {
  if (intervalHandle !== null) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
  teardownTerminal();
}

function handleKey(ch: string): void {
  switch (ch) {
    case 'f':
      dispatch({ type: 'feed', nutrition: 15 });
      flash('fed');
      return;
    case 'p':
      dispatch({ type: 'play', minutes: 10 });
      flash('played');
      return;
    case 's':
      dispatch({ type: 'rest', minutes: 30 });
      flash('resting');
      return;
    case 'c':
      flash('clean — no reducer action (placeholder)');
      return;
    case 'r':
      resetPet();
      return;
    case '+':
    case '=':
      speed = Math.min(10_000, speed * 2);
      flash(`speed ×${speed}`);
      return;
    case '-':
    case '_':
      speed = Math.max(1, Math.floor(speed / 2));
      flash(`speed ×${speed}`);
      return;
    case 'q':
    case '':
      cleanup();
      process.exit(0);
      return;
    default:
      return;
  }
}

function tick(): void {
  const delta = elapsedPerTick();
  clock.advance(delta);
  dispatch({ type: 'tick', elapsedMs: delta });
  render();
}

interface KeypressEvent {
  readonly name?: string;
  readonly sequence?: string;
  readonly ctrl?: boolean;
}

function main(): void {
  setupTerminal();
  render();
  intervalHandle = setInterval(tick, TICK_MS);

  process.stdin.on('keypress', (_str: unknown, key: KeypressEvent | undefined) => {
    if (key === undefined) return;
    if (key.ctrl === true && key.name === 'c') {
      cleanup();
      process.exit(0);
    }
    const ch = key.sequence ?? '';
    handleKey(ch);
    render();
  });
}

process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

main();
