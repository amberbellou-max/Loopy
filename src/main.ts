import "./style.css";
import { createGame } from "./game/Game";
import type { FairyForageScene, FairyForageSnapshot } from "./scenes/FairyForageScene";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Missing #app container");
}

const searchParams = new URLSearchParams(window.location.search);
const isE2EMode = searchParams.get("e2e") === "1" || searchParams.has("e2e");
const game = createGame("app", { forceCanvas: isE2EMode });

declare global {
  interface Window {
    fairyForageDebug?: {
      startGame: (level?: number) => void;
      plantAt: (x: number, y: number) => boolean;
      forceFruit: (count?: number) => void;
      castMagic: () => void;
      getSnapshot: () => FairyForageSnapshot;
    };
    render_game_to_text?: () => string;
  }
}

function renderGameToText(): string {
  const activeScenes = game.scene.getScenes(true, false);
  const activeSceneKeys = activeScenes.map((scene) => scene.scene.key);
  const forageScene = game.scene.getScene("FairyForageScene") as FairyForageScene;

  const payload = {
    coordinateSystem: "origin top-left, +x right, +y down",
    nowMs: Date.now(),
    activeSceneKeys,
    game: forageScene.getDebugSnapshot(),
  };
  return JSON.stringify(payload);
}

const shouldExposeDebugApi = import.meta.env.DEV || isE2EMode;

if (shouldExposeDebugApi) {
  const getForageScene = (): FairyForageScene => game.scene.getScene("FairyForageScene") as FairyForageScene;

  window.fairyForageDebug = {
    startGame: (level = 1) => getForageScene().startDebugGame(level),
    plantAt: (x: number, y: number) => getForageScene().debugPlantAt(x, y),
    forceFruit: (count = 1) => getForageScene().forceFruit(count),
    castMagic: () => getForageScene().debugCastMagic(),
    getSnapshot: () => getForageScene().getDebugSnapshot(),
  };
  window.render_game_to_text = () => renderGameToText();
}
