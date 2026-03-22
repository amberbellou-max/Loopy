import Phaser from "phaser";
import { getLearningTopicForLevel } from "../data/levelLearningTopics";
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
    const compact = width < 920;

    this.add
      .text(width * 0.5, 70, "World Map", {
        fontSize: "56px",
        fontStyle: "bold",
        color: "#d8ffef",
      })
      .setOrigin(0.5);

    const progressLabelY = compact ? 114 : 108;
    this.add
      .text(width * 0.5, progressLabelY, `Highest unlocked level: ${save.highestUnlockedLevel}`, {
        fontSize: "22px",
        color: "#c4e6da",
      })
      .setOrigin(0.5);

    const focusTopic = getLearningTopicForLevel(selectedLevel);
    const focusTrackLabel = focusTopic.track === "tokens" ? "Tokens" : "Neural Nets";
    const tokenPanelWidth = Phaser.Math.Clamp(width - 56, 340, 980);
    const tokenPanelHeight = compact ? 94 : 106;
    const tokenPanelY = compact ? 174 : 170;

    this.add
      .rectangle(width * 0.5, tokenPanelY, tokenPanelWidth, tokenPanelHeight, 0x0a3025, 0.9)
      .setStrokeStyle(2, 0x79e8c3, 0.86);
    this.add
      .text(width * 0.5, tokenPanelY - (compact ? 26 : 30), `AI Focus (${focusTrackLabel}, Level ${selectedLevel}): ${focusTopic.title}`, {
        fontSize: compact ? "20px" : "24px",
        color: "#dfffee",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(
        width * 0.5,
        tokenPanelY + 6,
        `Core idea: ${focusTopic.coreIdea}\nTakeaway: ${focusTopic.takeaway}`,
        {
          fontSize: compact ? "14px" : "17px",
          color: "#bcf6df",
          align: "center",
          wordWrap: { width: tokenPanelWidth - 26 },
          lineSpacing: compact ? 3 : 5,
        },
      )
      .setOrigin(0.5);

    const cols = MAX_LEVEL_ID > 16 ? 5 : 4;
    const rows = Math.ceil(MAX_LEVEL_ID / cols);
    const maxGridWidth = width - 120;
    const spacingXTarget = cols === 5 ? 200 : 240;
    const spacingX = cols > 1 ? Phaser.Math.Clamp(Math.floor(maxGridWidth / (cols - 1)), 112, spacingXTarget) : 0;
    const gridTop = tokenPanelY + tokenPanelHeight * 0.5 + 32;
    const gridBottom = height - 130;
    const maxGridHeight = Math.max(0, gridBottom - gridTop);
    const spacingYTarget = cols === 5 ? 96 : 120;
    const spacingY = rows > 1 ? Phaser.Math.Clamp(Math.floor(maxGridHeight / (rows - 1)), 72, spacingYTarget) : 0;
    const startX = width * 0.5 - ((cols - 1) * spacingX) / 2;
    const startY = gridTop;

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

    const academyButton = this.add
      .text(compact ? width * 0.5 : width * 0.5 - 140, compact ? height - 76 : height - 42, "Token Academy", {
        fontSize: compact ? "24px" : "26px",
        color: "#052519",
        backgroundColor: "#b8f8df",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const menuButton = this.add
      .text(compact ? width * 0.5 : width * 0.5 + 140, compact ? height - 34 : height - 42, "Main Menu", {
        fontSize: compact ? "24px" : "26px",
        color: "#052519",
        backgroundColor: "#8ef3cd",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    academyButton.on("pointerdown", () => {
      this.scene.start("TokenAcademyScene", { returnScene: "WorldMapScene", startModuleId: selectedLevel });
    });
    menuButton.on("pointerdown", () => {
      this.scene.start("MainMenuScene");
    });
  }
}
