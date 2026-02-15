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

export function createGame(parent: string): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,
    backgroundColor: "#04130f",
    render: {
      pixelArt: true,
      antialias: false,
      roundPixels: true,
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
