# 虚拟宠物项目 - Claude Code 启动包

> 这个文件是给 **Claude Code** 的启动指令,不是给人看的路线图。
> 用法见文件末尾「给人类的使用说明」。

---

## 指令开始

你好 Claude Code。这是一个全新的空仓库。你的任务是:**按照本文件后续的内容,把这些治理文件和文档一次性全部创建到磁盘上**,然后停下来等我进一步指令。

### 你要做的事(按顺序)

1. 确认你读到了这个文件的全部内容(文件很长,请先扫完再动手)。
2. **不要**自作主张添加额外文件或更改以下内容。严格按给定文本逐字创建。
3. 按下面列出的每一个 `FILE: <路径>` 段,把后面 ```` ``` ```` 代码块里的内容**原样**写入对应路径。
4. 如果目录不存在,先创建目录。
5. 所有文件创建完毕后,运行:
   ```bash
   git init
   git add .
   git commit -m "chore: init project constitution and agents"
   ```
6. 然后**停下**,输出这段话给我:

   > 治理文件已就位。我已读过 CLAUDE.md,了解项目边界与测试契约。
   > 准备进入 Phase 0(脚手架)。请确认后我将用 Plan Mode 产出方案等你审批。
   > 在那之前我不会修改或创建任何其他文件。

**不要**现在就开始 Phase 0。等我明确说 "GO Phase 0" 再继续。

---

## 文件清单(共 9 个文件)

需要创建的文件:

```
CLAUDE.md
.mcp.json
.gitignore
.claude/settings.json
.claude/agents/test-writer.md
.claude/agents/ios-debugger.md
.claude/agents/a11y-checker.md
.claude/agents/reviewer.md
.claude/skills/reducer-writing/SKILL.md
.claude/skills/expo-native-change/SKILL.md
docs/phases/00-scaffold.md
```

---

## FILE: CLAUDE.md

```markdown
# Virtual Pet — Project Constitution (CLAUDE.md)

> This file is the single source of truth for all Claude Code sessions on this repo.
> If something here conflicts with your instinct: **follow this file, ask me if unsure**.

## 1. Product goal (NEVER drift from this)
An iOS-only, 100% local, no-backend, no-cloud-AI virtual pet app (Tamagotchi-style).
The pet reacts to the user's real life — steps, sleep, HRV, location, weather, calendar,
lunar date, focus mode, screenshot behavior, battery. All inference is local.

## 2. Non-goals (stop-lights)
- NO backend / server / DB
- NO cloud LLM calls at runtime
- NO user accounts / auth
- NO Android in this milestone (iOS first)
- NO analytics SDKs that leak PII
- NO new third-party dependencies without an `ADR-xxx-*.md` written first and approved

## 3. Tech stack (LOCKED — do not swap)
- Expo SDK 54+, React Native 0.81+, React 19.1
- TypeScript strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`
- Zustand (state) + MMKV (persistence via `react-native-mmkv`)
- expo-notifications, expo-location + expo-task-manager (geofencing),
  expo-sensors, expo-battery, expo-calendar, expo-screen-capture,
  expo-media-library, expo-localization, expo-audio (NOT expo-av; expo-av is removed)
- @kingstinct/react-native-healthkit (Nitro Modules)
- lunisolar, SunCalc
- expo-sqlite (event log ring buffer)
- Jest + @testing-library/react-native + fast-check (property-based)
- Maestro (E2E)
- Widgets/Live Activities: @bacons/apple-targets
- ESLint (@react-native/eslint-config + typescript-eslint strict) + Prettier
- Husky + lint-staged + commitlint (Conventional Commits)

## 4. Architecture boundaries (enforced by folder layout)
```
src/
  core/                # pure TS, no RN imports — must be runnable in plain Node
    pet/               # reducer, state machine, life stages, invariants
    decay/             # time decay engine (pure, takes Clock)
    nudge/             # nudge selector (pure, takes Context)
  providers/           # side-effect adapters — interfaces + real + fake impls
    health/            # HealthKitProvider interface + real + InMemoryFake
    location/
    weather/
    clock/             # Clock interface: now(), schedule()
    permissions/       # PermissionProvider interface (granted/denied/limited/notDetermined)
    notifications/
  ui/                  # screens, components, hooks
  widgets/             # Apple target code (Swift). Only touch with human approval.
  app/                 # Expo Router routes
__tests__/             # integration tests
.maestro/              # E2E flows
```

**Rule**: Anything in `core/` must NOT import from `providers/` or RN.
Anything in `providers/` must NOT import from `ui/`.

## 5. Testing contract (STRICT — every PR)
Claude MUST pass all of these before marking a task done:
  1. `pnpm typecheck`  → 0 errors
  2. `pnpm lint`       → 0 errors, 0 warnings (warnings count as failure)
  3. `pnpm test -- --coverage` → core/** coverage ≥ 95% lines
  4. `pnpm test:virtual-time` → all time-based decay tests green
  5. For UI/integration tasks: `pnpm test:e2e:ios` (Maestro) green on iPhone 16 sim

If ANY of the above fails, STOP, REPORT the failure, do NOT iterate blindly more than
2 attempts. Ask me.

## 6. Coding style
- Functional components, hooks only; no classes.
- `const` over `let`, never `var`.
- Named exports preferred; default exports only for Expo Router route files.
- File naming: `kebab-case.ts` for files, `PascalCase` for components.
- Max file size 300 lines. Split when hit.
- No `any`, no `@ts-ignore` (use `@ts-expect-error` with a ticket ref).
- Discriminated unions with `assertNever(x: never): never` exhaustiveness.
- All async fns return `Result<T, E>` (fp-ts style) or throw typed errors — no mixed.

## 7. What Claude MUST do before saying "done"
- Run hooks checklist (see .claude/settings.json)
- Run `pnpm check-all` (typecheck + lint + test + coverage threshold)
- Produce a short changelog bullet in the PR description
- If a native file (ios/**, app.json ios.*, Info.plist) was touched:
  post a 🚨 NATIVE CHANGE block with reasons.

## 8. What Claude MUST NOT do
- Add a new npm/pod dependency without first proposing it (plan mode) and waiting for ✅
- Touch files in `src/widgets/` Swift code unless explicitly asked
- Modify `ios/` folder directly (use Expo prebuild instead)
- Downgrade strict TS flags
- Disable or skip tests (even temporarily)
- Use `console.log` (use `src/core/log.ts` with levels)
- Commit directly to `main` (always feature branch + PR)
- Run `rm -rf`, `git push --force`, or edit `.env*` files (a PreToolUse hook will block)

## 9. Commit convention
Conventional Commits. Examples:
  feat(pet): add teen stage with HRV-sensitive decay
  fix(decay): clamp stats at 0 instead of NaN
  test(nudge): add fast-check property for budget invariant
  chore(deps): pin lunisolar to 2.x
Each commit body ends with: `Refs: #<issue>` or `Phase: <phase-id>`.

## 10. Branching / PR
- `main` protected.
- Branch per Phase: `phase/01-scaffold`, `phase/02-state-machine`, ...
- PR template: goal, test evidence (paste `pnpm test --coverage` summary),
  screenshots from iOS Simulator (use ios-simulator-mcp), checklist.

## 11. When stuck
- Prefer reading more of the codebase over guessing API signatures.
- If an Expo/RN API is unfamiliar, fetch the official doc via WebFetch FIRST,
  don't invent signatures (hallucinated Expo APIs is a known Claude failure mode).
- Ask me via AskUserQuestion before making architectural choices not listed here.

## 12. Phase roadmap (overview)
See docs/phases/*.md. Current target: Phase 0 (scaffold). Do NOT skip ahead.
```

---

## FILE: .mcp.json

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "ios-simulator": {
      "command": "npx",
      "args": ["-y", "ios-simulator-mcp"],
      "env": {
        "IOS_SIMULATOR_MCP_FILTERED_TOOLS": "record_video,stop_recording",
        "IOS_SIMULATOR_MCP_DEFAULT_OUTPUT_DIR": "./tmp"
      }
    },
    "xcodebuild": {
      "command": "npx",
      "args": ["-y", "xcodebuildmcp@latest"]
    }
  }
}
```

> 注:github MCP 暂时不加,等你配好 `GITHUB_TOKEN` 再手动加入。

---

## FILE: .gitignore

```gitignore
# deps
node_modules/
.pnpm-store/

# expo
.expo/
dist/
web-build/
*.orig.*

# native
ios/Pods/
ios/build/
ios/*.xcworkspace
ios/*.xcodeproj
android/

# ide
.vscode/
.idea/
*.swp
.DS_Store

# env
.env
.env.*
!.env.example

# logs / tmp
*.log
tmp/
coverage/
.maestro/tmp/

# claude code local state (kept per-user)
.claude/local/
```

---

## FILE: .claude/settings.json

```json
{
  "enableAllProjectMcpServers": true,
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python3 -c \"import json,sys; d=json.load(sys.stdin); c=d.get('tool_input',{}).get('command',''); bad=['rm -rf /','rm -rf ~','git push --force','DROP TABLE']; sys.exit(2 if any(b in c for b in bad) else 0)\""
          }
        ]
      },
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "python3 -c \"import json,sys; d=json.load(sys.stdin); p=d.get('tool_input',{}).get('file_path',''); sys.exit(2 if any(x in p for x in ['.env','ios/Pods/','ios/build/','node_modules/']) else 0)\""
          }
        ]
      },
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "python3 -c \"import json,sys,os; d=json.load(sys.stdin); p=d.get('tool_input',{}).get('file_path',''); native=['ios/','android/','app.json','app.config.','Info.plist','.xcprivacy']; \nif any(x in p for x in native): print('🚨 NATIVE CHANGE detected in '+p+' — announce to human in your next message.', file=sys.stderr); sys.exit(0)\""
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'f=\"$CLAUDE_TOOL_INPUT_FILE_PATH\"; [ -f \"$f\" ] && npx --no-install prettier --write \"$f\" 2>/dev/null || true'"
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'echo \"{\\\"additionalContext\\\": \\\"Branch: $(git branch --show-current 2>/dev/null || echo none)\\\\nLast commit: $(git log -1 --oneline 2>/dev/null || echo none)\\\\nPhase docs: see docs/phases/\\\"}\"'"
          }
        ]
      }
    ]
  }
}
```

---

## FILE: .claude/agents/test-writer.md

```markdown
---
name: test-writer
description: Use PROACTIVELY when new core/** functions are added without tests, or when coverage drops below 95%. Writes Jest tests, fast-check properties, and virtual-time snapshots.
tools: Read, Write, Edit, Glob, Grep, Bash
model: sonnet
---
You are a principal test engineer for a React Native/Expo iOS app.

Rules:
1. Read CLAUDE.md first. Follow its testing contract (§5).
2. For any pure function in src/core/**, write (a) example-based tests,
   (b) at least one fast-check property, (c) a clock-driven test if time is involved.
3. Prefer InMemoryFake providers over Jest mocks for HealthKit, Location, Clock, Permissions.
4. Never modify the source file you're testing — if a bug is found, report it and stop.
5. After writing tests, run `pnpm test -- --coverage <file>` and return the exact coverage
   numbers + the exact command you ran + exit code.
```

---

## FILE: .claude/agents/ios-debugger.md

```markdown
---
name: ios-debugger
description: Invoke when an iOS build fails, a simulator screen is wrong, or HealthKit returns unexpected data. Uses ios-simulator-mcp and xcodebuildmcp to reproduce.
tools: mcp__ios-simulator__*, mcp__xcodebuild__*, Read, Bash, Grep
model: opus
---
Diagnose iOS-specific issues. Before proposing fixes:
1. Confirm with `xcrun simctl list` that a simulator is booted.
2. Take a screenshot via ios-simulator MCP.
3. Dump the UI hierarchy to confirm the problem.
4. Check Info.plist entries and entitlements for HealthKit / Location / Background Modes.
5. If a pod-install loop is suspected, run `cd ios && pod deintegrate && pod install --repo-update`.
Return: a diff proposal + a replay steps list + exact commands run with exit codes.
```

---

## FILE: .claude/agents/a11y-checker.md

```markdown
---
name: a11y-checker
description: Run after any UI task to verify accessibility: role, label, hint, minimum hit size, color contrast.
tools: Read, Grep, Glob, Bash
model: haiku
---
Check every Pressable/TouchableOpacity for accessibilityRole + accessibilityLabel.
Fail loudly if any interactive element lacks a label or hit area < 44×44.
Return a table: file | element | issue | suggested fix.
```

---

## FILE: .claude/agents/reviewer.md

```markdown
---
name: reviewer
description: Staff-engineer code reviewer. Challenge the diff. Use BEFORE marking a PR ready.
tools: Read, Grep, Glob, Bash
model: opus
---
Review as an adversarial staff engineer. For the current diff (`git diff main...HEAD`):
- Find at least 3 concrete concerns.
- Check for hallucinated APIs (especially Expo/RN — cross-check with node_modules types).
- Verify CLAUDE.md rules aren't violated (§4 layering, §6 style, §8 must-nots).
- Flag any test that looks like it was modified to pass instead of the code being fixed.
- Return verdict: BLOCK / REQUEST_CHANGES / APPROVE with concrete reasoning and file:line refs.
```

---

## FILE: .claude/skills/reducer-writing/SKILL.md

```markdown
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
```

---

## FILE: .claude/skills/expo-native-change/SKILL.md

```markdown
---
name: expo-native-change
description: Use when modifying app.json plugins, Info.plist keys, or entitlements. Guides through prebuild and dev-client rebuild.
---
# Procedure for changes that require a new Dev Client build

1. Update app.json or config plugin.
2. Run: `npx expo prebuild --clean -p ios`
3. Run: `cd ios && pod install && cd ..`
4. Rebuild dev client: `npx expo run:ios --device` (or `eas build -p ios --profile development`).
5. Reinstall on sim/device. Old JS-only reloads will NOT pick up native changes.
6. Add a 🚨 NATIVE CHANGE note in the PR body and commit message footer.
```

---

## FILE: docs/phases/00-scaffold.md

```markdown
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
```

---

## 指令结束

创建完所有 11 个文件后,执行 git init / add / commit,然后按开头说的输出确认信息并停下。

---

# 给人类的使用说明(Claude,这部分也读一下,理解用户的流程)

**你(人类)要做的三步:**

### 第 1 步(Mac 终端)

```bash
mkdir ~/virtual-pet && cd ~/virtual-pet
# 把下载的 KICKOFF.md 放进这个文件夹
mv ~/Downloads/KICKOFF.md .
```

### 第 2 步

```bash
claude
```

首次启动会要求登录 Anthropic 账户。登录后,粘贴这一句话:

> 请读取当前目录下的 KICKOFF.md,按里面的指令执行。

### 第 3 步

Claude Code 会:
1. 读懂这个文件
2. 创建全部 11 个治理文件
3. 跑 git init/commit
4. 停下等你

你确认它停得对(运行 `ls -la` 和 `cat CLAUDE.md` 抽查),然后输入:

> GO Phase 0

之后 Claude Code 就会进入 Plan Mode,给你一个 Phase 0 脚手架方案。你 review 后说"approved, execute",它开始真正写代码。

---

## 可能遇到的问题

**Q: Claude 启动后说没看到文件?**
A: 确认你在正确的目录 `cd ~/virtual-pet && ls`,应该能看到 KICKOFF.md。

**Q: `.claude/` 文件夹 Claude Code 不认?**
A: 首次启动后关掉 claude 再开一次,配置文件重新加载。

**Q: MCP 服务器启动失败?**
A: 第一次 ios-simulator-mcp 和 xcodebuildmcp 会从 npm 下载,需要网络。如果失败可以先把 .mcp.json 里那两块删掉,Phase 0-3 不需要它们。

**Q: 我想跳过治理文件,直接让 Claude 开始写代码?**
A: 不推荐。没有 CLAUDE.md 和 hooks,Claude 会在第 5 轮开始偏离架构,第 10 轮测试覆盖率掉到 60%,第 15 轮给你塞三个你没批准的 npm 包。治理文件是"慢启动、快到终点"的投资。

**Q: 怎么知道我该升级到 Max 订阅了?**
A: 如果看到"usage limit reached, retry in X hours"就该升级。Phase 0-3 用 Pro/Max 5× 都行;到 Phase 5 接 HealthKit 后建议 Max 20×。
