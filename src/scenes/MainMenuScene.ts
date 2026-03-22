import Phaser from "phaser";
import { SaveSystem } from "../systems/SaveSystem";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width * 0.5, 110, "Loopy", {
        fontSize: "84px",
        fontStyle: "bold",
        color: "#c9ffe8",
      })
      .setOrigin(0.5);

    this.add
      .text(width * 0.5, 190, "Fish Fairy Side-Scroller", {
        fontSize: "28px",
        color: "#d4fff0",
      })
      .setOrigin(0.5);

    this.add
      .text(width * 0.5, 230, "AI Literacy Mode: learn token budgeting while you play", {
        fontSize: "20px",
        color: "#b8f1d7",
      })
      .setOrigin(0.5);

    const save = SaveSystem.load();

    const startButton = this.makeButton(width * 0.5, 330, "Start New Run", () => {
      SaveSystem.reset();
      this.scene.start("WorldMapScene", { selectedLevel: 1 });
    });

    const continueButton = this.makeButton(
      width * 0.5,
      410,
      `Continue (Level ${save.highestUnlockedLevel})`,
      () => {
        this.scene.start("WorldMapScene", { selectedLevel: save.highestUnlockedLevel });
      },
    );

    if (save.highestUnlockedLevel <= 1) {
      continueButton.setAlpha(0.5);
      continueButton.disableInteractive();
    }

    const academyButton = this.makeButton(width * 0.5, 490, "Token Academy", () => {
      this.scene.start("TokenAcademyScene", { returnScene: "MainMenuScene", startModuleId: 1 });
    });

    this.add
      .text(width * 0.5, height - 74, "Keyboard: WASD/Arrows, Space, Shift | Touch controls on mobile", {
        fontSize: "17px",
        color: "#b6d9ca",
      })
      .setOrigin(0.5);

    this.add
      .text(width * 0.5, height - 46, "HUD tracks input/output tokens and context window in each level.", {
        fontSize: "16px",
        color: "#9fd9c1",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: [startButton, continueButton, academyButton],
      y: "-=6",
      yoyo: true,
      duration: 1400,
      repeat: -1,
      ease: "Sine.InOut",
      delay: 120,
    });
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
    const button = this.add
      .text(x, y, label, {
        fontSize: "34px",
        color: "#052519",
        backgroundColor: "#86f5cc",
        padding: { x: 20, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on("pointerover", () => {
      button.setScale(1.03);
    });
    button.on("pointerout", () => {
      button.setScale(1);
    });
    button.on("pointerdown", onClick);

    return button;
  }
}
