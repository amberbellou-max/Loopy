import Phaser from "phaser";

export class PauseScene extends Phaser.Scene {
  constructor() {
    super("PauseScene");
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width * 0.5, height * 0.5, width, height, 0x04130f, 0.6);

    this.add
      .text(width * 0.5, height * 0.5 - 80, "Paused", {
        fontSize: "72px",
        fontStyle: "bold",
        color: "#e6fff5",
      })
      .setOrigin(0.5);

    const resume = this.add
      .text(width * 0.5, height * 0.5 + 10, "Resume", {
        fontSize: "34px",
        color: "#052519",
        backgroundColor: "#89f6cf",
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const map = this.add
      .text(width * 0.5, height * 0.5 + 80, "World Map", {
        fontSize: "30px",
        color: "#052519",
        backgroundColor: "#d2ffec",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const resumeGame = (): void => {
      this.scene.stop();
      this.scene.resume("LevelScene");
    };

    resume.on("pointerdown", resumeGame);
    map.on("pointerdown", () => {
      this.scene.stop("LevelScene");
      this.scene.start("WorldMapScene");
    });

    this.input.keyboard?.once("keydown-P", resumeGame);
  }
}
