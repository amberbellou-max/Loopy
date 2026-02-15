# Loopy

Loopy is a Phaser 3 + TypeScript side-scrolling game with 16 handcrafted levels.

## Core Gameplay
- Play as a flying fish-fairy creature.
- Eat enough food to hit each level quota.
- Reach the exit gate after quota is complete.
- Avoid flash predators, projectile volleys, wormhole pull zones, and black-hole shots.
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
