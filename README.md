# Bunny Bloom

Bunny Bloom is a Phaser 3 + TypeScript browser game about a fairy trying to keep a meadow alive. Plant seeds, wait a few seconds for trees to grow fruit, and keep multiplying bunnies fed before the orchard runs empty. Later levels increase bunny multiplication and add an eagle that hunts the fairy; stunning the eagle with magic can clear some bunnies and buy time.

## Gameplay
- Move the fairy around the meadow.
- Plant seeds with `Space`, click, or tap.
- Seeds grow through seed, sprout, tree, and fruit stages over a few seconds.
- Bunnies eat ripe fruit. Every fruit eaten adds more bunnies, with higher levels multiplying faster.
- If there is no ripe fruit, the food timer drains. When it reaches zero, the run ends.
- Starting on level 2, an eagle chases the fairy. If it hits the fairy three times, the run ends.
- Cast a magic burst with `Shift` or `E`. If the eagle is close enough, the burst damages it. Defeating the eagle clears nearby bunnies and gives the player breathing room.
- Reach each level's feed goal to advance to the next meadow.

## Controls
- Move: `WASD` or arrow keys
- Plant seed: `Space`, click, or tap
- Magic burst: `Shift` or `E`
- Continue/restart screens: `Space`, `Enter`, or click

## Development
1. Install Node.js 20+.
2. Install dependencies: `npm install`.
3. Start dev server: `npm run dev`.
4. Run unit tests: `npm run test`.
5. Run E2E tests: `npm run test:e2e`.
6. Build for hosting: `npm run build`.

## Deployment
- The repo is configured for GitHub Pages via `.github/workflows/deploy-pages.yml`.
- Primary setup: GitHub Pages source set to `GitHub Actions`.
- The Vite base path is derived from `GITHUB_REPOSITORY` during GitHub Actions builds, so the same build can work under the repository's GitHub Pages path.
- Current remote inspected locally: `https://github.com/amberbellou-max/Loopy.git`.
- Existing Pages-style URL for that remote: `https://amberbellou-max.github.io/Loopy/`.

## Project Layout
- `src/scenes/FairyForageScene.ts`: the main game loop, generated sprites, planting, bunny feeding, levels, eagle pressure, HUD, and debug hooks.
- `src/game/Game.ts`: Phaser game configuration and scene registration.
- `src/main.ts`: app bootstrap and E2E/debug bridge.
- `tests/e2e/game.spec.ts`: Playwright smoke tests for starting, feeding, multiplication, and eagle pressure.
- `_codex_build/`: run logs, build map, final product blueprint, and current gaps.

## E2E Debug Hooks
Debug hooks are available in dev mode and `?e2e=1`:
- `?autostart=1&level=2` starts directly on a chosen level.
- `window.fairyForageDebug.startGame(level)`
- `window.fairyForageDebug.plantAt(x, y)`
- `window.fairyForageDebug.forceFruit(count)`
- `window.fairyForageDebug.castMagic()`
- `window.fairyForageDebug.getSnapshot()`
- `window.render_game_to_text()`
