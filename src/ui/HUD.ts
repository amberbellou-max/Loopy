import Phaser from "phaser";
import { HUD as HUD_CONFIG } from "../data/balance";

export class HUD {
  private readonly scene: Phaser.Scene;
  private readonly healthBg: Phaser.GameObjects.Rectangle;
  private readonly healthFill: Phaser.GameObjects.Rectangle;
  private readonly quotaText: Phaser.GameObjects.Text;
  private readonly timerText: Phaser.GameObjects.Text;
  private readonly checkpointText: Phaser.GameObjects.Text;

  private readonly livesText: Phaser.GameObjects.Text;
  private readonly seedsText: Phaser.GameObjects.Text;
  private readonly bloomText: Phaser.GameObjects.Text;
  private readonly comboText: Phaser.GameObjects.Text;
  private readonly checkpointCostText: Phaser.GameObjects.Text;

  private readonly bossBarBg: Phaser.GameObjects.Rectangle;
  private readonly bossBarFill: Phaser.GameObjects.Rectangle;
  private readonly bossLabel: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const margin = HUD_CONFIG.margin;

    this.healthBg = scene.add.rectangle(margin + 100, margin + 12, 200, 18, 0x122920, 0.9).setOrigin(0, 0);
    this.healthFill = scene.add.rectangle(margin + 102, margin + 14, 196, 14, 0x56dfb3, 0.95).setOrigin(0, 0);

    this.quotaText = scene.add.text(margin, margin + 38, "Quota: 0/0", {
      color: "#eefcf5",
      fontSize: "20px",
      fontStyle: "bold",
    });

    this.timerText = scene.add.text(margin, margin + 64, "Time: --", {
      color: "#f6ffd3",
      fontSize: "18px",
    });

    this.livesText = scene.add.text(margin, margin + 88, "Lives: 3", {
      color: "#ffe2e2",
      fontSize: "18px",
    });

    this.seedsText = scene.add.text(margin, margin + 112, "Seeds: 0 | U-Seeds: 0", {
      color: "#cbffd8",
      fontSize: "18px",
    });

    this.bloomText = scene.add.text(margin, margin + 136, "Bloom: 0/100", {
      color: "#d6d8ff",
      fontSize: "18px",
    });

    this.comboText = scene.add.text(scene.scale.width - margin, margin + 12, "Combo: -", {
      color: "#d7f7ff",
      fontSize: "20px",
      fontStyle: "bold",
      stroke: "#03170f",
      strokeThickness: 4,
    });
    this.comboText.setOrigin(1, 0);

    this.checkpointCostText = scene.add.text(scene.scale.width - margin, margin + 42, "Checkpoint: 0 seeds", {
      color: "#ffd7a5",
      fontSize: "16px",
      stroke: "#03170f",
      strokeThickness: 3,
    });
    this.checkpointCostText.setOrigin(1, 0);

    this.checkpointText = scene.add.text(scene.scale.width * 0.5, margin + 14, "", {
      color: "#9dffdf",
      fontSize: "22px",
      fontStyle: "bold",
      stroke: "#03170f",
      strokeThickness: 4,
    });
    this.checkpointText.setOrigin(0.5, 0);

    this.bossBarBg = scene.add.rectangle(scene.scale.width * 0.5, 54, 480, 16, 0x1a1d2f, 0.92).setOrigin(0.5, 0);
    this.bossBarFill = scene.add.rectangle(scene.scale.width * 0.5 - 238, 56, 476, 12, 0xea5f8c, 0.95).setOrigin(0, 0);
    this.bossLabel = scene.add.text(scene.scale.width * 0.5, 28, "Boss Phase 1", {
      color: "#ffd4ef",
      fontSize: "18px",
      fontStyle: "bold",
      stroke: "#1b1023",
      strokeThickness: 3,
    }).setOrigin(0.5, 0);

    [
      this.healthBg,
      this.healthFill,
      this.quotaText,
      this.timerText,
      this.livesText,
      this.seedsText,
      this.bloomText,
      this.comboText,
      this.checkpointCostText,
      this.checkpointText,
      this.bossBarBg,
      this.bossBarFill,
      this.bossLabel,
    ].forEach((entry) => {
      entry.setScrollFactor(0);
      entry.setDepth(50);
    });

    this.updateBoss(false, 1, 1);
  }

  updateHealth(healthRatio: number): void {
    const safe = Phaser.Math.Clamp(healthRatio, 0, 1);
    this.healthFill.width = 196 * safe;
    if (safe > 0.55) {
      this.healthFill.fillColor = 0x56dfb3;
    } else if (safe > 0.3) {
      this.healthFill.fillColor = 0xe3b546;
    } else {
      this.healthFill.fillColor = 0xec6e6e;
    }
  }

  updateQuota(collected: number, quota: number): void {
    this.quotaText.setText(`Quota: ${collected}/${quota}`);
  }

  updateTimer(secondsLeft: number | null): void {
    if (secondsLeft === null) {
      this.timerText.setText("Time: --");
      return;
    }
    this.timerText.setText(`Time: ${Math.max(0, Math.ceil(secondsLeft))}`);
  }

  updateEconomy(lives: number, seeds: number, universeSeeds: number, bloomMeter: number): void {
    this.livesText.setText(`Lives: ${lives}`);
    this.seedsText.setText(`Seeds: ${seeds} | U-Seeds: ${universeSeeds}`);
    this.bloomText.setText(`Bloom (Q): ${Math.floor(bloomMeter)}/100`);
  }

  updateCombo(taps: number): void {
    this.comboText.setText(taps > 0 ? `Combo: ${taps}x` : "Combo: -");
  }

  updateCheckpointCost(cost: number): void {
    this.checkpointCostText.setText(`Checkpoint: ${cost} seeds`);
  }

  updateBoss(visible: boolean, hpRatio: number, phase: number): void {
    this.bossBarBg.setVisible(visible);
    this.bossBarFill.setVisible(visible);
    this.bossLabel.setVisible(visible);
    if (!visible) {
      return;
    }

    const safe = Phaser.Math.Clamp(hpRatio, 0, 1);
    this.bossBarFill.width = 476 * safe;
    this.bossLabel.setText(`Boss Phase ${phase}`);
    this.bossBarFill.fillColor = phase === 1 ? 0xea5f8c : phase === 2 ? 0xf27a5c : 0xfdca65;
  }

  flashCheckpoint(label = "Checkpoint reached"): void {
    this.checkpointText.setText(label);
    this.scene.tweens.killTweensOf(this.checkpointText);
    this.checkpointText.alpha = 1;
    this.scene.tweens.add({
      targets: this.checkpointText,
      alpha: 0,
      delay: 500,
      duration: 1100,
    });
  }

  destroy(): void {
    this.healthBg.destroy();
    this.healthFill.destroy();
    this.quotaText.destroy();
    this.timerText.destroy();
    this.livesText.destroy();
    this.seedsText.destroy();
    this.bloomText.destroy();
    this.comboText.destroy();
    this.checkpointCostText.destroy();
    this.checkpointText.destroy();
    this.bossBarBg.destroy();
    this.bossBarFill.destroy();
    this.bossLabel.destroy();
  }
}
