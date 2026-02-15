import Phaser from "phaser";

interface GameOverData {
  levelId: number;
  reason: string;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  create(data: GameOverData): void {
    const { width } = this.scale;

    this.add
      .text(width * 0.5, 160, "Game Over", {
        fontSize: "78px",
        fontStyle: "bold",
        color: "#ffe4dc",
      })
      .setOrigin(0.5);

    this.add
      .text(width * 0.5, 250, `Level ${data.levelId}`, {
        fontSize: "28px",
        color: "#ffe4dc",
      })
      .setOrigin(0.5);

    this.add
      .text(width * 0.5, 300, data.reason, {
        fontSize: "24px",
        color: "#ffd5c8",
      })
      .setOrigin(0.5);

    const retry = this.makeButton(width * 0.5, 390, "Retry", () => {
      this.scene.start("LevelScene", { levelId: data.levelId });
    });

    const map = this.makeButton(width * 0.5, 470, "World Map", () => {
      this.scene.start("WorldMapScene", { selectedLevel: data.levelId });
    });

    this.tweens.add({
      targets: [retry, map],
      scale: { from: 1, to: 1.02 },
      yoyo: true,
      repeat: -1,
      duration: 900,
    });
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
    const button = this.add
      .text(x, y, label, {
        fontSize: "32px",
        color: "#270c07",
        backgroundColor: "#ffc2ad",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on("pointerdown", onClick);
    return button;
  }
}
