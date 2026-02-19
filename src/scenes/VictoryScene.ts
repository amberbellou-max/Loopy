import Phaser from "phaser";
import { MAX_LEVEL_ID } from "../data/levels";

interface VictoryData {
  totalScore: number;
}

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super("VictoryScene");
  }

  create(data: VictoryData): void {
    const { width, height } = this.scale;

    this.add
      .text(width * 0.5, 130, `You Cleared All ${MAX_LEVEL_ID} Levels`, {
        fontSize: "56px",
        fontStyle: "bold",
        color: "#ddffef",
      })
      .setOrigin(0.5);

    this.add
      .text(width * 0.5, 220, "The fish fairy mastered the storm of predators and wormholes.", {
        fontSize: "24px",
        color: "#c7f3df",
      })
      .setOrigin(0.5);

    this.add
      .text(width * 0.5, 280, `Final score: ${data.totalScore}`, {
        fontSize: "34px",
        color: "#f7ffe8",
      })
      .setOrigin(0.5);

    const map = this.makeButton(width * 0.5, height * 0.5 + 70, "World Map", () => {
      this.scene.start("WorldMapScene", { selectedLevel: MAX_LEVEL_ID });
    });

    const menu = this.makeButton(width * 0.5, height * 0.5 + 145, "Main Menu", () => {
      this.scene.start("MainMenuScene");
    });

    this.tweens.add({
      targets: [map, menu],
      y: "-=4",
      yoyo: true,
      repeat: -1,
      duration: 1200,
      ease: "Sine.InOut",
    });
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
    const button = this.add
      .text(x, y, label, {
        fontSize: "32px",
        color: "#052519",
        backgroundColor: "#8af5cf",
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on("pointerdown", onClick);
    return button;
  }
}
