# Loopy

Loopy is a Phaser 3 + TypeScript side-scrolling game with 16 handcrafted levels.

## Core Gameplay
- Play as a flying fish-fairy creature.
- Eat enough food to hit each level quota.
- New hunt pattern: rotating food rings ("orbit circles") whose whole center also moves.
- Reach the exit gate after quota is complete.
- Avoid flash predators, projectile volleys, wormhole pull zones, and black-hole shots.
- Watch for newer enemy archetypes:
  - `Rift Skimmer`: strafes and dive-charges while firing angled shots.
  - `Arcane Totem`: armored sentry that only takes damage from direct glitter shots.
  - `Serpent Stalker`: snake-like hunter with a trailing body. Bait it into its own tail to make it self-destruct.
- You can still use Space-bar combat on serpents (shots/bomb/shield), but tail-trap kills are rewarded.
- `Ocean Wormhole` hazard: if it grabs you, the HUD prompts a breakaway event.
  - Escape rule: press `Space` while steering away with arrows/WASD.
  - You must tap `Space` and move away from its dark center to break free.
- Manage seeds for checkpoint purchases and lives.
- Chain Space taps for magical glitter combat combos.
- Charge and trigger Universe Bloom (`Q`) for screen-clearing power.

## Progression
- 16 levels total.
- Jungle arc: levels 1-8.
- Desert arc: levels 9-16.
- Milestone challenges: levels 4, 8, 12, 16.
- Abilities unlock by milestones: `dash -> glide -> shockwave -> phase_blink`.

## Controls
- Keyboard
  - Move: `WASD` or arrow keys
  - Glitter Combat: hold `Space` for rapid fire, tap combo on `Space` (1x shot, 2x bomb, 3x shield)
  - Universe Bloom: `Q` (requires full meter)
  - Dash trigger: `Shift`
  - Pause: `P`
- Touch
  - On-screen movement and action buttons are generated automatically (`A`, `DS`, `Q`).

## New Systems
- Combo window: 450ms Space multi-tap resolver.
- Economy:
  - Food gives seeds and Bloom charge.
  - Rare pickups: seed, universe seed, and extra life.
  - Checkpoints require seeds (cost scales by level).
- Lives: each level starts with 3 lives; death consumes one life.
- Universe Bloom:
  - Full meter required.
  - Clears enemy bullets, stuns enemies, suppresses wormhole pressure, damages boss.
- Difficulty ramp:
  - Higher enemy speed and projectile speed.
  - Lower shoot intervals (denser bullets).
  - Stronger wormhole pull.
  - Extra predators/wormholes/hazards in later levels.
  - Moving orbit-food circles appear early, then return later while enemies chase you.
- Boss:
  - Level 16 Arcane Boss with 3 phases and heavy bullet pressure.

## Pixel Style
- Pixel-art rendering enabled (`pixelArt`, `roundPixels`, `antialias=false`).
- Placeholder textures are generated as small pixel sprites and scaled in-game.

## Development
1. Install Node.js 20+.
2. Install dependencies: `npm install`.
3. Start dev server: `npm run dev`.
4. Run unit tests: `npm run test`.
5. Run E2E tests: `npm run test:e2e`.

## E2E Debug Hooks
- Hooks are enabled only in `?e2e=1` mode.
- Query params:
  - `?e2e=1`
  - `?e2e=1&autolevel=8`
  - `?e2e=1&autolevel=16`
- Exposed globals in E2E mode:
  - `window.advanceTime(ms)`: deterministic fixed-step game stepping at 60 FPS.
  - `window.render_game_to_text()`: concise JSON text snapshot of active game state.

## Stress Loop Commands
1. Export skill paths:
   - `export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"`
   - `export WEB_GAME_CLIENT="$CODEX_HOME/skills/develop-web-game/scripts/web_game_playwright_client.js"`
   - `export WEB_GAME_ACTIONS="$CODEX_HOME/skills/develop-web-game/references/action_payloads.json"`
2. Start dev server:
   - `npm run dev -- --host 127.0.0.1 --port 5173`
3. Level 8 Space stress:
   - `node "$WEB_GAME_CLIENT" --url "http://127.0.0.1:5173/?e2e=1&autolevel=8" --actions-file "/Users/abelsanchez/Documents/GAMES/Loopy/tests/playwright-actions/space-stress-level8.json" --iterations 8 --pause-ms 300 --screenshot-dir "/Users/abelsanchez/Documents/GAMES/Loopy/output/web-game/l8"`
4. Level 16 Space stress:
   - `node "$WEB_GAME_CLIENT" --url "http://127.0.0.1:5173/?e2e=1&autolevel=16" --actions-file "/Users/abelsanchez/Documents/GAMES/Loopy/tests/playwright-actions/space-stress-level16.json" --iterations 10 --pause-ms 350 --screenshot-dir "/Users/abelsanchez/Documents/GAMES/Loopy/output/web-game/l16"`
5. Combo verification:
   - `node "$WEB_GAME_CLIENT" --url "http://127.0.0.1:5173/?e2e=1&autolevel=8" --actions-file "/Users/abelsanchez/Documents/GAMES/Loopy/tests/playwright-actions/space-combo-check.json" --iterations 4 --pause-ms 250 --screenshot-dir "/Users/abelsanchez/Documents/GAMES/Loopy/output/web-game/combo"`

## Project Layout
- `src/scenes`: Phaser scene flow and level runtime.
- `src/entities`: game entities (player, predators, wormholes, projectiles, foods).
- `src/systems`: save, input, spawn, collision, audio, and ability logic.
- `src/data`: level definitions, balance values, unlock tables.
- `src/ui`: in-game HUD.
- `tests/unit`: Vitest coverage for data and logic.
- `tests/e2e`: Playwright smoke flows.

## Debug Hotkeys (for testing)
- `N`: force-complete current level.
- `C`: force next checkpoint trigger.
- `K`: force death/respawn.
- `B`: fully charge Universe Bloom.
