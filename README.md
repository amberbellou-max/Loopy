# Loopy

Loopy is a Phaser 3 + TypeScript side-scrolling game with 19 handcrafted levels.

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
- Seed Fountain Ghosts now blink in on selected chapters, vanish quickly, and drop burst seed showers (`3/6/9`) if caught in time.
- Spin Arena zones now appear in select chapters: the zone itself orbits, nearby seed pickups spin, and predators spiral while still chasing you.
- `Ocean Wormhole` hazard: if it grabs you, the HUD prompts a breakaway event.
  - Escape rule: press `Space` while steering away with arrows/WASD.
  - You must tap `Space` and move away from its dark center to break free.
- Manage seeds for checkpoint purchases and lives.
- Chain Space taps for magical glitter combat combos.
- Charge and trigger Universe Bloom (`Q`) for screen-clearing power.

## Progression
- 19 levels total.
- Jungle arc: levels 1-8.
- Desert arc: levels 9-19.
- Milestone challenges: levels 4, 8, 12, 16.
- Abilities unlock by milestones: `dash -> glide -> shockwave -> phase_blink`.
- Final challenge stretch (levels 17-19): enemies consume seed resources by stealing nearby seeds and devouring seed pickups.

## Controls
- Keyboard
  - Move: `WASD` or arrow keys
  - Glitter Combat: hold `Space` for rapid fire, tap combo on `Space` (1x shot, 2x Star Burst, 3x shield + 2s enemy freeze)
  - Universe Bloom: `Q` (requires full meter)
  - Dash trigger: `Shift`
  - Pause: `P`
- Touch
  - Left virtual pad: drag for analog movement.
  - Right action buttons: `SPACE` (glitter), `DASH`, `BLOOM`.
  - Touch controls auto-enable on touch devices and stay hidden on laptop/desktop.

## New Systems
- Combo window: 450ms Space multi-tap resolver.
- Economy:
  - Food gives seeds and Bloom charge.
  - Rare pickups: seed, universe seed, and extra life.
  - Checkpoints require seeds (cost scales by level).
- Lives: each level starts with 3 lives; death consumes one life.
- Space special budget per level:
  - Levels 1-5: `4` Star Bursts
  - Levels 6-10: `3` Star Bursts
  - Levels 11-19: `2` Star Bursts
  - Budget is spent only by the double-tap (`2x`) Star Burst.
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

## Deployment
- Primary (recommended): GitHub Pages source set to `GitHub Actions`.
- Fallback (branch mode): the main deploy workflow also publishes built files to `gh-pages`.
- Root-branch safety net: `/index.html` loads `/Loopy/assets/index.js` outside localhost, so branch-root Pages still boots if assets are present.
- Refresh root fallback assets after gameplay updates:
  - `npm run build:pages-root`
- If the site ever serves `/src/main.ts` again, set Pages to:
  - Source: `Deploy from a branch`
  - Branch: `gh-pages` / `root`
- Live URL: `https://amberbellou-max.github.io/Loopy/`

## iPhone App (App Store)
- This repo is wired for Capacitor iOS packaging.
- Required tools on your Mac:
  - Xcode (full app, not just command-line tools)
  - CocoaPods (`pod`) and Ruby setup that supports your macOS/Xcode stack
- Install and initialize native iOS shell:
  - `npm install`
  - `npm run ios:add` (first time only)
- Sync game updates into iOS shell:
  - `npm run ios:sync`
- Open in Xcode:
  - `npm run ios:open`
- In Xcode:
  - Set your Apple Team in Signing & Capabilities
  - Confirm Bundle Identifier (`com.amberbelloumax.loopy`) or change to your own
  - Set app version/build number
  - Add app icons and launch assets
  - Set required Privacy keys in `Info.plist` if you add features that need them
  - Product -> Archive -> Distribute App -> App Store Connect
- In App Store Connect:
  - Create app record (name, bundle id, SKU)
  - Add screenshots, description, age rating, and metadata
  - Submit for review

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
