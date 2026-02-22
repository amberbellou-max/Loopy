import Phaser from "phaser";
import { HUD as HUD_CONFIG } from "../data/balance";
import { tokenLessons, type TokenLesson, type TokenLessonReason } from "../data/tokenLessons";
import { getDeviceProfile } from "../systems/deviceProfile";

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
  private readonly specialsText: Phaser.GameObjects.Text;

  private readonly bossBarBg: Phaser.GameObjects.Rectangle;
  private readonly bossBarFill: Phaser.GameObjects.Rectangle;
  private readonly bossLabel: Phaser.GameObjects.Text;

  private readonly tokenTutorContainer: Phaser.GameObjects.Container;
  private readonly tokenTutorBg: Phaser.GameObjects.Rectangle;
  private readonly tokenTutorTitle: Phaser.GameObjects.Text;
  private readonly tokenTutorBody: Phaser.GameObjects.Text;
  private readonly tokenTutorExample: Phaser.GameObjects.Text;
  private tokenTutorVisibleUntil = 0;
  private tokenTutorLastLessonId: string | null = null;
  private tokenTutorCooldownUntil = 0;
  private tokenTutorHideTimer: Phaser.Time.TimerEvent | null = null;
  private spaceDismissHandler: (() => void) | null = null;
  private resizeHandler: (() => void) | null = null;
  private healthFillMaxWidth = 196;
  private bossBarWidth = 480;
  private bossFillMaxWidth = 476;
  private tokenTutorPanelWide = 560;
  private tokenTutorPanelTall = 126;
  private tokenTutorPanelShort = 102;
  private lastHealthRatio = 1;
  private bossVisible = false;
  private bossHpRatio = 1;
  private bossPhase = 1;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const margin = HUD_CONFIG.margin;

    this.healthBg = scene.add.rectangle(margin + 100, margin + 12, 200, 18, 0x1c3d35, 0.9).setOrigin(0, 0);
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

    this.comboText = scene.add.text(scene.scale.width - margin, margin + 12, "Combo: Hold fire", {
      color: "#f6fff0",
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

    this.specialsText = scene.add.text(scene.scale.width - margin, margin + 66, "Burst Charges: 0/0", {
      color: "#b8f3ff",
      fontSize: "16px",
      stroke: "#03170f",
      strokeThickness: 3,
    });
    this.specialsText.setOrigin(1, 0);

    this.checkpointText = scene.add.text(scene.scale.width * 0.5, margin + 14, "", {
      color: "#9dffdf",
      fontSize: "22px",
      fontStyle: "bold",
      stroke: "#03170f",
      strokeThickness: 4,
    });
    this.checkpointText.setOrigin(0.5, 0);

    const tutorPanelWidth = 560;
    const tutorPanelHeight = 126;
    this.tokenTutorBg = scene.add
      .rectangle(0, 0, tutorPanelWidth, tutorPanelHeight, 0x08221c, 0.92)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x79e8c3, 0.9)
      .setInteractive({ useHandCursor: true });

    this.tokenTutorTitle = scene.add.text(-tutorPanelWidth * 0.5 + 16, -46, "Token Tutor", {
      color: "#d9fff2",
      fontSize: "22px",
      fontStyle: "bold",
      stroke: "#03170f",
      strokeThickness: 3,
      wordWrap: { width: tutorPanelWidth - 32 },
    }).setOrigin(0, 0);

    this.tokenTutorBody = scene.add.text(-tutorPanelWidth * 0.5 + 16, -14, "", {
      color: "#f2fff8",
      fontSize: "17px",
      stroke: "#03170f",
      strokeThickness: 2,
      wordWrap: { width: tutorPanelWidth - 32 },
    }).setOrigin(0, 0);

    this.tokenTutorExample = scene.add.text(-tutorPanelWidth * 0.5 + 16, 32, "", {
      color: "#b7ffe3",
      fontSize: "16px",
      stroke: "#03170f",
      strokeThickness: 2,
      wordWrap: { width: tutorPanelWidth - 32 },
    }).setOrigin(0, 0);

    this.tokenTutorContainer = scene.add.container(scene.scale.width * 0.5, 110, [
      this.tokenTutorBg,
      this.tokenTutorTitle,
      this.tokenTutorBody,
      this.tokenTutorExample,
    ]);
    this.tokenTutorContainer.setVisible(false);
    this.tokenTutorContainer.alpha = 0;
    this.tokenTutorContainer.setDepth(58);
    this.tokenTutorContainer.setScrollFactor(0);
    this.tokenTutorBg.on("pointerdown", () => this.dismissTokenLesson());

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
      this.specialsText,
      this.checkpointText,
      this.bossBarBg,
      this.bossBarFill,
      this.bossLabel,
    ].forEach((entry) => {
      entry.setScrollFactor(0);
      entry.setDepth(50);
    });

    if (scene.input.keyboard) {
      this.spaceDismissHandler = () => {
        if (this.tokenTutorContainer.visible) {
          this.dismissTokenLesson();
        }
      };
      scene.input.keyboard.on("keydown-SPACE", this.spaceDismissHandler);
    }

    this.resizeHandler = () => this.applyLayout();
    scene.scale.on("resize", this.resizeHandler);
    this.applyLayout();
    this.updateBoss(false, 1, 1);
  }

  updateHealth(healthRatio: number): void {
    const safe = Phaser.Math.Clamp(healthRatio, 0, 1);
    this.lastHealthRatio = safe;
    this.healthFill.width = this.healthFillMaxWidth * safe;
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
    this.comboText.setText(taps > 0 ? `Combo: ${taps}x` : "Combo: Hold fire");
  }

  updateCheckpointCost(cost: number): void {
    this.checkpointCostText.setText(`Checkpoint: ${cost} seeds`);
  }

  updateSpecials(remaining: number, max: number): void {
    this.specialsText.setText(`Burst Charges: ${remaining}/${max}`);
    this.specialsText.setColor(remaining <= 0 ? "#ffb6b6" : remaining <= 1 ? "#ffe8a6" : "#b8f3ff");
  }

  updateBoss(visible: boolean, hpRatio: number, phase: number): void {
    this.bossVisible = visible;
    this.bossHpRatio = Phaser.Math.Clamp(hpRatio, 0, 1);
    this.bossPhase = phase;
    this.bossBarBg.setVisible(visible);
    this.bossBarFill.setVisible(visible);
    this.bossLabel.setVisible(visible);
    if (!visible) {
      return;
    }

    this.bossBarFill.width = this.bossFillMaxWidth * this.bossHpRatio;
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

  showTokenLesson(reason: TokenLessonReason, nowMs: number): void {
    if (nowMs < this.tokenTutorCooldownUntil) {
      return;
    }
    if (this.tokenTutorContainer.visible && nowMs < this.tokenTutorVisibleUntil) {
      return;
    }

    const lesson = this.pickTokenLesson(reason);
    this.tokenTutorLastLessonId = lesson.id;
    this.tokenTutorVisibleUntil = nowMs + 4000;
    this.tokenTutorCooldownUntil = nowMs + 8000;

    this.tokenTutorTitle.setText(lesson.title);
    this.tokenTutorBody.setText(lesson.body);
    if (lesson.example) {
      this.tokenTutorExample.setVisible(true);
      this.tokenTutorExample.setText(`Example: ${lesson.example}`);
      this.tokenTutorBg.height = this.tokenTutorPanelTall;
    } else {
      this.tokenTutorExample.setVisible(false);
      this.tokenTutorExample.setText("");
      this.tokenTutorBg.height = this.tokenTutorPanelShort;
    }

    this.scene.tweens.killTweensOf(this.tokenTutorContainer);
    if (this.tokenTutorHideTimer) {
      this.tokenTutorHideTimer.remove(false);
      this.tokenTutorHideTimer = null;
    }

    this.tokenTutorContainer.setVisible(true);
    this.tokenTutorContainer.alpha = 0;
    this.scene.tweens.add({
      targets: this.tokenTutorContainer,
      alpha: 1,
      duration: 140,
      ease: "Sine.Out",
    });

    this.tokenTutorHideTimer = this.scene.time.delayedCall(4000, () => this.dismissTokenLesson());
  }

  dismissTokenLesson(): void {
    if (!this.tokenTutorContainer.visible) {
      return;
    }

    this.tokenTutorVisibleUntil = 0;
    this.scene.tweens.killTweensOf(this.tokenTutorContainer);
    if (this.tokenTutorHideTimer) {
      this.tokenTutorHideTimer.remove(false);
      this.tokenTutorHideTimer = null;
    }

    this.scene.tweens.add({
      targets: this.tokenTutorContainer,
      alpha: 0,
      duration: 130,
      onComplete: () => {
        this.tokenTutorContainer.setVisible(false);
      },
    });
  }

  private applyLayout(): void {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const profile = getDeviceProfile(width, height);
    const compact = profile.isCompactHud || profile.isPhoneViewport;
    const margin = compact ? 10 : HUD_CONFIG.margin;

    const healthBarWidth = compact ? (width < 640 ? 150 : 170) : 200;
    const healthBarHeight = compact ? 14 : 18;
    this.healthFillMaxWidth = healthBarWidth - 4;
    this.healthBg.setPosition(margin, margin + 4).setSize(healthBarWidth, healthBarHeight);
    this.healthFill.setPosition(margin + 2, margin + 6).setSize(this.healthFillMaxWidth, healthBarHeight - 4);
    this.updateHealth(this.lastHealthRatio);

    const labelFont = compact ? "16px" : "20px";
    const infoFont = compact ? "14px" : "18px";
    const leftTop = margin + (compact ? 22 : 38);
    const lineGap = compact ? 20 : 24;

    this.quotaText.setFontSize(labelFont).setPosition(margin, leftTop);
    this.timerText.setFontSize(infoFont).setPosition(margin, leftTop + lineGap);
    this.livesText.setFontSize(infoFont).setPosition(margin, leftTop + lineGap * 2);
    this.seedsText.setFontSize(infoFont).setPosition(margin, leftTop + lineGap * 3);
    this.bloomText.setFontSize(infoFont).setPosition(margin, leftTop + lineGap * 4);

    this.comboText
      .setFontSize(compact ? "16px" : "20px")
      .setStroke("#03170f", compact ? 3 : 4)
      .setPosition(width - margin, margin + (compact ? 6 : 12));
    this.checkpointCostText
      .setFontSize(compact ? "13px" : "16px")
      .setStroke("#03170f", compact ? 2 : 3)
      .setPosition(width - margin, margin + (compact ? 30 : 42));
    this.specialsText
      .setFontSize(compact ? "13px" : "16px")
      .setStroke("#03170f", compact ? 2 : 3)
      .setPosition(width - margin, margin + (compact ? 48 : 66));

    if (compact && width < 620) {
      const stackedY = leftTop + lineGap * 5 + 6;
      this.comboText.setPosition(width - margin, stackedY);
      this.checkpointCostText.setPosition(width - margin, stackedY + 20);
      this.specialsText.setPosition(width - margin, stackedY + 38);
    }

    this.checkpointText
      .setFontSize(compact ? "18px" : "22px")
      .setStroke("#03170f", compact ? 3 : 4)
      .setPosition(width * 0.5, margin + 6);

    this.tokenTutorPanelWide = compact ? Phaser.Math.Clamp(width - margin * 2, 280, 460) : 560;
    this.tokenTutorPanelTall = compact ? 112 : 126;
    this.tokenTutorPanelShort = compact ? 92 : 102;
    const tutorHasExample = this.tokenTutorExample.visible && this.tokenTutorExample.text.length > 0;
    this.tokenTutorBg.setSize(this.tokenTutorPanelWide, tutorHasExample ? this.tokenTutorPanelTall : this.tokenTutorPanelShort);
    this.tokenTutorContainer.setPosition(width * 0.5, compact ? 94 : 110);

    const panelLeft = -this.tokenTutorPanelWide * 0.5 + 12;
    this.tokenTutorTitle
      .setFontSize(compact ? "18px" : "22px")
      .setStroke("#03170f", compact ? 2 : 3)
      .setWordWrapWidth(this.tokenTutorPanelWide - 24)
      .setPosition(panelLeft, compact ? -34 : -46);
    this.tokenTutorBody
      .setFontSize(compact ? "15px" : "17px")
      .setStroke("#03170f", compact ? 1 : 2)
      .setWordWrapWidth(this.tokenTutorPanelWide - 24)
      .setPosition(panelLeft, compact ? -8 : -14);
    this.tokenTutorExample
      .setFontSize(compact ? "14px" : "16px")
      .setStroke("#03170f", compact ? 1 : 2)
      .setWordWrapWidth(this.tokenTutorPanelWide - 24)
      .setPosition(panelLeft, compact ? 24 : 32);

    this.bossBarWidth = compact ? Phaser.Math.Clamp(Math.floor(width * 0.56), 220, 360) : 480;
    const bossBarHeight = compact ? 12 : 16;
    this.bossFillMaxWidth = this.bossBarWidth - 4;
    const bossTop = compact ? margin + 2 : 54;
    this.bossBarBg.setPosition(width * 0.5, bossTop).setSize(this.bossBarWidth, bossBarHeight);
    this.bossBarFill.setPosition(width * 0.5 - this.bossBarWidth * 0.5 + 2, bossTop + 2).setSize(this.bossFillMaxWidth, bossBarHeight - 4);
    this.bossLabel
      .setPosition(width * 0.5, bossTop - (compact ? 16 : 26))
      .setFontSize(compact ? "14px" : "18px")
      .setStroke("#1b1023", compact ? 2 : 3);
    this.updateBoss(this.bossVisible, this.bossHpRatio, this.bossPhase);
  }

  private pickTokenLesson(reason: TokenLessonReason): TokenLesson {
    const tagged = tokenLessons.filter((lesson) => !lesson.tags || lesson.tags.length === 0 || lesson.tags.includes(reason));
    const reasonPool = tagged.length > 0 ? tagged : tokenLessons;
    const nonRepeat = reasonPool.filter((lesson) => lesson.id !== this.tokenTutorLastLessonId);
    const finalPool = nonRepeat.length > 0 ? nonRepeat : reasonPool;
    const index = Phaser.Math.Between(0, finalPool.length - 1);
    return finalPool[index];
  }

  destroy(): void {
    if (this.resizeHandler) {
      this.scene.scale.off("resize", this.resizeHandler);
      this.resizeHandler = null;
    }
    if (this.spaceDismissHandler && this.scene.input.keyboard) {
      this.scene.input.keyboard.off("keydown-SPACE", this.spaceDismissHandler);
      this.spaceDismissHandler = null;
    }
    if (this.tokenTutorHideTimer) {
      this.tokenTutorHideTimer.remove(false);
      this.tokenTutorHideTimer = null;
    }
    this.healthBg.destroy();
    this.healthFill.destroy();
    this.quotaText.destroy();
    this.timerText.destroy();
    this.livesText.destroy();
    this.seedsText.destroy();
    this.bloomText.destroy();
    this.comboText.destroy();
    this.checkpointCostText.destroy();
    this.specialsText.destroy();
    this.checkpointText.destroy();
    this.bossBarBg.destroy();
    this.bossBarFill.destroy();
    this.bossLabel.destroy();
    this.tokenTutorContainer.destroy(true);
  }
}
