import "./style.css";
import Phaser from "phaser";
import { createGame } from "./game/Game";
import { SaveSystem } from "./systems/SaveSystem";
import { MAX_LEVEL_ID } from "./data/levels";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Missing #app container");
}

const searchParams = new URLSearchParams(window.location.search);
const isE2EMode = searchParams.get("e2e") === "1" || searchParams.has("e2e");
const game = createGame("app", { forceCanvas: isE2EMode });

type DebugSnapshotScene = Phaser.Scene & {
  getDebugSnapshot?: () => unknown;
};

declare global {
  interface Window {
    loopyDebug?: {
      resetSave: () => void;
      startLevel: (level: number) => void;
      openWorldMap: (selectedLevel?: number) => void;
      getSave: () => ReturnType<typeof SaveSystem.load>;
    };
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => void;
  }
}

function renderGameToText(): string {
  const activeScenes = game.scene.getScenes(true, false) as DebugSnapshotScene[];
  const activeSceneKeys = activeScenes.map((scene) => scene.scene.key);
  const activeLevelScene = activeScenes.find((scene) => scene.scene.key === "LevelScene");

  const payload = {
    coordinateSystem: "origin top-left, +x right, +y down",
    nowMs: Date.now(),
    activeSceneKeys,
    mode: activeLevelScene ? "level" : "ui",
    level: activeLevelScene?.getDebugSnapshot?.() ?? null,
    save: SaveSystem.load(),
  };
  return JSON.stringify(payload);
}

const shouldExposeDebugApi = import.meta.env.DEV || isE2EMode;

if (shouldExposeDebugApi) {
  window.loopyDebug = {
    resetSave: () => SaveSystem.reset(),
    startLevel: (level: number) => {
      const activeScenes = game.scene.getScenes(true, false);
      activeScenes.forEach((scene) => {
        if (scene.scene.key !== "LevelScene") {
          game.scene.stop(scene.scene.key);
        }
      });
      game.scene.start("LevelScene", { levelId: level });
    },
    openWorldMap: (selectedLevel = 1) => {
      game.scene.start("WorldMapScene", { selectedLevel });
    },
    getSave: () => SaveSystem.load(),
  };
}

if (isE2EMode) {
  let simulatedNow = performance.now();
  const fixedStepMs = 1000 / 60;
  let manualStepEnabled = false;

  window.advanceTime = (ms: number): void => {
    if (!manualStepEnabled) {
      if (!game.scene.isBooted) {
        return;
      }
      game.loop.sleep();
      manualStepEnabled = true;
    }

    const safeMs = Number.isFinite(ms) ? Math.max(0, ms) : fixedStepMs;
    const steps = Math.max(1, Math.round(safeMs / fixedStepMs));
    for (let i = 0; i < steps; i += 1) {
      simulatedNow += fixedStepMs;
      game.step(simulatedNow, fixedStepMs);
    }
  };

  window.render_game_to_text = () => renderGameToText();

  const requestedLevel = Number(searchParams.get("autolevel"));
  if (Number.isFinite(requestedLevel)) {
    const levelId = Phaser.Math.Clamp(Math.floor(requestedLevel), 1, MAX_LEVEL_ID);
    const startRequestedLevel = (): void => {
      if (game.scene.isBooted) {
        const activeScenes = game.scene.getScenes(true, false);
        activeScenes.forEach((scene) => {
          if (scene.scene.key !== "LevelScene") {
            game.scene.stop(scene.scene.key);
          }
        });
        game.scene.start("LevelScene", { levelId });
        return;
      }
      window.setTimeout(startRequestedLevel, 16);
    };
    startRequestedLevel();
  }
}
