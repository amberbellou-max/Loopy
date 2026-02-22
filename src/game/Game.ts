import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../data/balance";
import { BootScene } from "../scenes/BootScene";
import { GameOverScene } from "../scenes/GameOverScene";
import { LevelScene } from "../scenes/LevelScene";
import { MainMenuScene } from "../scenes/MainMenuScene";
import { PauseScene } from "../scenes/PauseScene";
import { PreloadScene } from "../scenes/PreloadScene";
import { VictoryScene } from "../scenes/VictoryScene";
import { WorldMapScene } from "../scenes/WorldMapScene";

interface CreateGameOptions {
  forceCanvas?: boolean;
}

export function createGame(parent: string, options: CreateGameOptions = {}): Phaser.Game {
  return new Phaser.Game({
    type: options.forceCanvas ? Phaser.CANVAS : Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,
    backgroundColor: "#0d2b22",
    render: {
      pixelArt: true,
      antialias: false,
      roundPixels: true,
    },
    input: {
      activePointers: 6,
      touch: {
        capture: true,
      },
    },
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [
      BootScene,
      PreloadScene,
      MainMenuScene,
      WorldMapScene,
      LevelScene,
      PauseScene,
      GameOverScene,
      VictoryScene,
    ],
  });
}
