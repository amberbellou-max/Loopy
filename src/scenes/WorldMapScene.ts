import Phaser from "phaser";
import { SaveSystem } from "../systems/SaveSystem";
import { MAX_LEVEL_ID } from "../data/levels";

interface WorldMapData {
  selectedLevel?: number;
}

export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super("WorldMapScene");
  }

  create(data: WorldMapData): void {
    const save = SaveSystem.load();
    const selectedLevel = Phaser.Math.Clamp(data.selectedLevel ?? save.highestUnlockedLevel, 1, MAX_LEVEL_ID);
    const { width, height } = this.scale;

    this.add
      .text(width * 0.5, 70, "World Map", {
        fontSize: "56px",
        fontStyle: "bold",
        color: "#d8ffef",
      })
      .setOrigin(0.5);

    this.add
      .text(width * 0.5, 122, `Highest unlocked level: ${save.highestUnlockedLevel}`, {
        fontSize: "22px",
        color: "#c4e6da",
      })
      .setOrigin(0.5);

    const cols = MAX_LEVEL_ID > 16 ? 5 : 4;
    const spacingX = cols === 5 ? 200 : 240;
    const spacingY = cols === 5 ? 96 : 120;
    const startX = width * 0.5 - ((cols - 1) * spacingX) / 2;
    const startY = cols === 5 ? 180 : 210;

    for (let level = 1; level <= MAX_LEVEL_ID; level += 1) {
      const col = (level - 1) % cols;
      const row = Math.floor((level - 1) / cols);
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      const unlocked = level <= save.highestUnlockedLevel;
      const isSelected = level === selectedLevel;
      const bestScore = save.levelBestScores[level] ?? 0;

      const node = this.add
        .text(x, y, `${level}`, {
          fontSize: "38px",
          fontStyle: "bold",
          color: unlocked ? "#052519" : "#3c5950",
          backgroundColor: unlocked ? (isSelected ? "#8dffd5" : "#74d9b5") : "#2d3d38",
          padding: { x: 20, y: 12 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: unlocked });

      if (unlocked) {
        node.on("pointerdown", () => {
          this.scene.start("LevelScene", { levelId: level });
        });
      }

      this.add
        .text(x, y + 42, unlocked ? `Best: ${bestScore}` : "Locked", {
          fontSize: "16px",
          color: unlocked ? "#d8ffef" : "#839a92",
        })
        .setOrigin(0.5);
    }

    const menuButton = this.add
      .text(width * 0.5, height - 42, "Main Menu", {
        fontSize: "28px",
        color: "#052519",
        backgroundColor: "#8ef3cd",
        padding: { x: 20, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    menuButton.on("pointerdown", () => {
      this.scene.start("MainMenuScene");
    });
  }
}
