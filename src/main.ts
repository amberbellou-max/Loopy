import "./style.css";
import { createGame } from "./game/Game";
import { SaveSystem } from "./systems/SaveSystem";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Missing #app container");
}

const game = createGame("app");

declare global {
  interface Window {
    loopyDebug?: {
      resetSave: () => void;
      startLevel: (level: number) => void;
      openWorldMap: (selectedLevel?: number) => void;
      getSave: () => ReturnType<typeof SaveSystem.load>;
    };
  }
}

const shouldExposeDebugApi = import.meta.env.DEV || new URLSearchParams(window.location.search).has("e2e");
if (shouldExposeDebugApi) {
  window.loopyDebug = {
    resetSave: () => SaveSystem.reset(),
    startLevel: (level: number) => {
      game.scene.start("LevelScene", { levelId: level });
    },
    openWorldMap: (selectedLevel = 1) => {
      game.scene.start("WorldMapScene", { selectedLevel });
    },
    getSave: () => SaveSystem.load(),
  };
}
