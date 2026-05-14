import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../data/balance";
import { FairyForageScene } from "../scenes/FairyForageScene";

interface CreateGameOptions {
  forceCanvas?: boolean;
}

export function createGame(parent: string, options: CreateGameOptions = {}): Phaser.Game {
  return new Phaser.Game({
    type: options.forceCanvas ? Phaser.CANVAS : Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,
    backgroundColor: "#b7e6ff",
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
    scene: [FairyForageScene],
  });
}
