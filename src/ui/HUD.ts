import Phaser from "phaser";
import { HUD as HUD_CONFIG } from "../data/balance";
import { tokenLessons, type TokenLesson, type TokenLessonReason } from "../data/tokenLessons";
import { getDeviceProfile } from "../systems/deviceProfile";

interface TokenLabStatus {
  inputTokens: number;
  outputTokens: number;
  contextWindow: number;
  remainingTokens: number;
  masteryLabel: string;
}

interface LevelRecapNote {
  title: string;
  subtitle: string;
  body: string;
  takeaway: string;
  continueLabel?: string;
  minVisibleMs?: number;
  autoContinueMs?: number;
}

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
  private readonly tokenLabText: Phaser.GameObjects.Text;
  private readonly comboText: Phaser.GameObjects.Text;
  private readonly checkpointCostText: Phaser.GameObjects.Text;
  private readonly specialsText: Phaser.GameObjects.Text;

  private readonly bossBarBg: Phaser.GameObjects.Rectangle;
  private readonly bossBarFill: Phaser.GameObjects.Rectangle;
  private readonly bossLabel: Phaser.GameObjects.Text;

  private readonly tokenTutorContainer: Phaser.GameObjects.Container;
  private readonly tokenTutorShadow: Phaser.GameObjects.Rectangle;
  private readonly tokenTutorBg: Phaser.GameObjects.Rectangle;
  private readonly tokenTutorHeader: Phaser.GameObjects.Rectangle;
  private readonly tokenTutorTitle: Phaser.GameObjects.Text;
  private readonly tokenTutorBody: Phaser.GameObjects.Text;
  private readonly tokenTutorExample: Phaser.GameObjects.Text;
  private readonly tokenTutorHint: Phaser.GameObjects.Text;

  private readonly recapBackdrop: Phaser.GameObjects.Rectangle;
  private readonly recapContainer: Phaser.GameObjects.Container;
  private readonly recapShadow: Phaser.GameObjects.Rectangle;
  private readonly recapCard: Phaser.GameObjects.Rectangle;
  private readonly recapHeader: Phaser.GameObjects.Rectangle;
  private readonly recapHeaderText: Phaser.GameObjects.Text;
  private readonly recapTitle: Phaser.GameObjects.Text;
  private readonly recapSubtitle: Phaser.GameObjects.Text;
  private readonly recapBody: Phaser.GameObjects.Text;
  private readonly recapTakeaway: Phaser.GameObjects.Text;
  private readonly recapButtonBg: Phaser.GameObjects.Rectangle;
  private readonly recapButtonLabel: Phaser.GameObjects.Text;
  private readonly recapHint: Phaser.GameObjects.Text;

  private tokenTutorVisibleUntil = 0;
  private tokenTutorLastLessonId: string | null = null;
  private tokenTutorCooldownUntil = 0;
  private tokenTutorHideTimer: Phaser.Time.TimerEvent | null = null;
  private spaceDismissHandler: (() => void) | null = null;
  private enterContinueHandler: (() => void) | null = null;
  private spaceContinueHandler: (() => void) | null = null;
  private resizeHandler: (() => void) | null = null;

  private recapContinueHandler: (() => void) | null = null;
  private recapCanContinue = false;
  private recapGateTimer: Phaser.Time.TimerEvent | null = null;
  private recapAutoTimer: Phaser.Time.TimerEvent | null = null;
  private recapButtonPulseTween: Phaser.Tweens.Tween | null = null;
  private recapPanelWidth = 700;
  private recapPanelHeight = 340;

  private healthFillMaxWidth = 196;
  private bossBarWidth = 480;
  private bossFillMaxWidth = 476;
  private tokenTutorPanelWide = 590;
  private tokenTutorPanelTall = 176;
  private tokenTutorPanelShort = 150;
  private tokenTutorCompact = false;
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

    this.tokenLabText = scene.add.text(margin, margin + 160, "Token Lab: in 0 | out 0\nWindow left: -- | Style: --", {
      color: "#c8ffe6",
      fontSize: "14px",
      stroke: "#03170f",
      strokeThickness: 2,
      wordWrap: { width: 320 },
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

    const tutorPanelWidth = 590;
    const tutorPanelHeight = 176;
    this.tokenTutorShadow = scene.add
      .rectangle(0, 0, tutorPanelWidth + 8, tutorPanelHeight + 8, 0x00130f, 0.42)
      .setOrigin(0.5);
    this.tokenTutorBg = scene.add
      .rectangle(0, 0, tutorPanelWidth, tutorPanelHeight, 0x073127, 0.95)
      .setOrigin(0.5)
      .setStrokeStyle(3, 0x84f3d1, 0.95)
      .setInteractive({ useHandCursor: true });
    this.tokenTutorHeader = scene.add
      .rectangle(0, -tutorPanelHeight * 0.5 + 18, tutorPanelWidth - 10, 32, 0x0f4b3a, 0.96)
      .setOrigin(0.5);

    this.tokenTutorTitle = scene.add.text(-tutorPanelWidth * 0.5 + 16, -tutorPanelHeight * 0.5 + 6, "Token Tutor", {
      color: "#d9fff2",
      fontSize: "22px",
      fontStyle: "bold",
      stroke: "#03170f",
      strokeThickness: 3,
      wordWrap: { width: tutorPanelWidth - 32 },
    })
      .setOrigin(0, 0)
      .setLineSpacing(2);

    this.tokenTutorBody = scene.add.text(-tutorPanelWidth * 0.5 + 16, -32, "", {
      color: "#f2fff8",
      fontSize: "17px",
      stroke: "#03170f",
      strokeThickness: 2,
      wordWrap: { width: tutorPanelWidth - 32 },
    })
      .setOrigin(0, 0)
      .setLineSpacing(4);

    this.tokenTutorExample = scene.add.text(-tutorPanelWidth * 0.5 + 16, 24, "", {
      color: "#b7ffe3",
      fontSize: "16px",
      stroke: "#03170f",
      strokeThickness: 2,
      wordWrap: { width: tutorPanelWidth - 32 },
    })
      .setOrigin(0, 0)
      .setLineSpacing(3);
    this.tokenTutorHint = scene.add.text(-tutorPanelWidth * 0.5 + 16, tutorPanelHeight * 0.5 - 26, "Tap card or press Esc to dismiss", {
      color: "#8be9c6",
      fontSize: "13px",
      stroke: "#03170f",
      strokeThickness: 1,
      wordWrap: { width: tutorPanelWidth - 32 },
    }).setOrigin(0, 0);

    this.tokenTutorContainer = scene.add.container(scene.scale.width * 0.5, 110, [
      this.tokenTutorShadow,
      this.tokenTutorBg,
      this.tokenTutorHeader,
      this.tokenTutorTitle,
      this.tokenTutorBody,
      this.tokenTutorExample,
      this.tokenTutorHint,
    ]);
    this.tokenTutorContainer.setVisible(false);
    this.tokenTutorContainer.alpha = 0;
    this.tokenTutorContainer.setDepth(64);
    this.tokenTutorContainer.setScrollFactor(0);
    this.tokenTutorBg.on("pointerdown", () => this.dismissTokenLesson());

    this.recapBackdrop = scene.add
      .rectangle(0, 0, scene.scale.width, scene.scale.height, 0x010a07, 0.72)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(95)
      .setInteractive({ useHandCursor: true });
    this.recapBackdrop.on("pointerdown", () => this.tryContinueRecap());

    this.recapShadow = scene.add.rectangle(0, 0, 708, 348, 0x010a07, 0.45).setOrigin(0.5);
    this.recapCard = scene.add
      .rectangle(0, 0, 700, 340, 0x072e24, 0.97)
      .setOrigin(0.5)
      .setStrokeStyle(3, 0x85f2d2, 0.95);
    this.recapHeader = scene.add.rectangle(0, -152, 692, 38, 0x0f4a39, 0.98).setOrigin(0.5);
    this.recapHeaderText = scene.add.text(-330, -166, "Level Recap", {
      color: "#d9fff3",
      fontSize: "18px",
      fontStyle: "bold",
      stroke: "#03170f",
      strokeThickness: 2,
    }).setOrigin(0, 0);
    this.recapTitle = scene.add.text(-330, -126, "", {
      color: "#effff8",
      fontSize: "34px",
      fontStyle: "bold",
      stroke: "#03170f",
      strokeThickness: 4,
      wordWrap: { width: 660 },
    }).setOrigin(0, 0);
    this.recapSubtitle = scene.add.text(-330, -84, "", {
      color: "#aef4d8",
      fontSize: "18px",
      stroke: "#03170f",
      strokeThickness: 2,
      wordWrap: { width: 660 },
    }).setOrigin(0, 0);
    this.recapBody = scene.add.text(-330, -46, "", {
      color: "#dcfff3",
      fontSize: "21px",
      stroke: "#03170f",
      strokeThickness: 2,
      lineSpacing: 6,
      wordWrap: { width: 660 },
    }).setOrigin(0, 0);
    this.recapTakeaway = scene.add.text(-330, 92, "", {
      color: "#8df2cb",
      fontSize: "19px",
      fontStyle: "bold",
      stroke: "#03170f",
      strokeThickness: 2,
      lineSpacing: 4,
      wordWrap: { width: 660 },
    }).setOrigin(0, 0);
    this.recapButtonBg = scene.add
      .rectangle(0, 142, 300, 46, 0x8ff8d3, 1)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x041f17, 0.95)
      .setInteractive({ useHandCursor: true });
    this.recapButtonBg.on("pointerdown", () => this.tryContinueRecap());
    this.recapButtonLabel = scene.add.text(0, 142, "Continue", {
      color: "#052519",
      fontSize: "24px",
      fontStyle: "bold",
      stroke: "#d9fff2",
      strokeThickness: 1,
    }).setOrigin(0.5);
    this.recapHint = scene.add.text(0, 172, "Reviewing recap...", {
      color: "#a6f7d8",
      fontSize: "16px",
      stroke: "#03170f",
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.recapContainer = scene.add.container(scene.scale.width * 0.5, scene.scale.height * 0.5, [
      this.recapShadow,
      this.recapCard,
      this.recapHeader,
      this.recapHeaderText,
      this.recapTitle,
      this.recapSubtitle,
      this.recapBody,
      this.recapTakeaway,
      this.recapButtonBg,
      this.recapButtonLabel,
      this.recapHint,
    ]);
    this.recapContainer.setScrollFactor(0);
    this.recapContainer.setDepth(96);
    this.recapContainer.setVisible(false);
    this.recapContainer.alpha = 0;
    this.recapBackdrop.setVisible(false);

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
      this.tokenLabText,
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
      scene.input.keyboard.on("keydown-ESC", this.spaceDismissHandler);
      this.enterContinueHandler = () => this.tryContinueRecap();
      this.spaceContinueHandler = () => this.tryContinueRecap();
      scene.input.keyboard.on("keydown-ENTER", this.enterContinueHandler);
      scene.input.keyboard.on("keydown-SPACE", this.spaceContinueHandler);
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

  updateTokenLab(status: TokenLabStatus): void {
    this.tokenLabText.setText(
      `Token Lab: in ${status.inputTokens} | out ${status.outputTokens}\nWindow left: ${status.remainingTokens}/${status.contextWindow} | Style: ${status.masteryLabel}`,
    );

    if (status.remainingTokens < 0) {
      this.tokenLabText.setColor("#ffb6b6");
      return;
    }

    if (status.remainingTokens <= Math.round(status.contextWindow * 0.15)) {
      this.tokenLabText.setColor("#ffe6a8");
      return;
    }

    this.tokenLabText.setColor("#c8ffe6");
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
    const lesson = this.pickTokenLesson(reason);
    this.presentTokenLesson(lesson, nowMs, { respectCooldown: true, durationMs: 5600, cooldownMs: 9200 });
  }

  showTokenCurriculumNote(title: string, body: string, nowMs: number, example?: string, durationMs = 6800): void {
    this.presentTokenLesson(
      {
        id: `curriculum-${Math.floor(nowMs)}`,
        title,
        body,
        example,
      },
      nowMs,
      {
        respectCooldown: false,
        durationMs,
        cooldownMs: Math.max(3600, Math.round(durationMs * 0.85)),
      },
    );
  }

  showLevelRecap(note: LevelRecapNote, onContinue: () => void): void {
    if (this.recapGateTimer) {
      this.recapGateTimer.remove(false);
      this.recapGateTimer = null;
    }
    if (this.recapAutoTimer) {
      this.recapAutoTimer.remove(false);
      this.recapAutoTimer = null;
    }
    if (this.recapButtonPulseTween) {
      this.recapButtonPulseTween.stop();
      this.recapButtonPulseTween = null;
    }

    this.recapContinueHandler = onContinue;
    this.recapCanContinue = false;

    this.recapTitle.setText(note.title);
    this.recapSubtitle.setText(note.subtitle);
    this.recapBody.setText(note.body);
    this.recapTakeaway.setText(`Takeaway: ${note.takeaway}`);
    this.recapButtonLabel.setText(note.continueLabel ?? "Continue");
    this.recapHint.setText("Recap locked for a few seconds so players can read.");
    this.recapButtonBg.setFillStyle(0x4e7467, 1);
    this.recapButtonLabel.setColor("#d6ebe2");

    this.layoutRecapCard();

    this.recapBackdrop.setVisible(true);
    this.recapBackdrop.alpha = 0;
    this.recapContainer.setVisible(true);
    this.recapContainer.alpha = 0;
    this.scene.tweens.killTweensOf([this.recapBackdrop, this.recapContainer]);
    this.scene.tweens.add({
      targets: this.recapBackdrop,
      alpha: 1,
      duration: 160,
      ease: "Sine.Out",
    });
    this.scene.tweens.add({
      targets: this.recapContainer,
      alpha: 1,
      duration: 180,
      ease: "Sine.Out",
    });

    const minVisible = Math.max(1800, note.minVisibleMs ?? 5200);
    const autoContinue = Math.max(minVisible + 3000, note.autoContinueMs ?? 17000);

    this.recapGateTimer = this.scene.time.delayedCall(minVisible, () => {
      this.recapCanContinue = true;
      this.recapHint.setText("Press Enter/Space or click Continue");
      this.recapButtonBg.setFillStyle(0x8ff8d3, 1);
      this.recapButtonLabel.setColor("#052519");
      this.recapButtonPulseTween = this.scene.tweens.add({
        targets: this.recapButtonBg,
        scaleX: 1.03,
        scaleY: 1.03,
        duration: 680,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
      });
      this.recapGateTimer = null;
    });

    this.recapAutoTimer = this.scene.time.delayedCall(autoContinue, () => {
      this.tryContinueRecap(true);
      this.recapAutoTimer = null;
    });
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
    this.tokenTutorCompact = compact;
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
    this.tokenLabText
      .setFontSize(compact ? "12px" : "14px")
      .setStroke("#03170f", compact ? 1 : 2)
      .setWordWrapWidth(compact ? Phaser.Math.Clamp(Math.floor(width * 0.5), 160, 280) : 320)
      .setPosition(margin, leftTop + lineGap * 5 + (compact ? 2 : 4));

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

    this.tokenTutorPanelWide = compact ? Phaser.Math.Clamp(width - margin * 2, 300, 500) : Phaser.Math.Clamp(width * 0.48, 560, 700);
    this.tokenTutorPanelTall = compact ? 164 : 190;
    this.tokenTutorPanelShort = compact ? 136 : 158;
    this.tokenTutorShadow.setSize(this.tokenTutorPanelWide + 8, this.tokenTutorPanelTall + 8);
    this.tokenTutorBg.setSize(this.tokenTutorPanelWide, this.tokenTutorPanelTall);
    this.tokenTutorHeader.setSize(this.tokenTutorPanelWide - 10, compact ? 30 : 34);
    this.tokenTutorContainer.setPosition(width * 0.5, compact ? 106 : 122);

    this.tokenTutorTitle
      .setFontSize(compact ? "17px" : "24px")
      .setStroke("#03170f", compact ? 2 : 3)
      .setWordWrapWidth(this.tokenTutorPanelWide - 30);
    this.tokenTutorBody
      .setFontSize(compact ? "14px" : "18px")
      .setStroke("#03170f", compact ? 1 : 2)
      .setWordWrapWidth(this.tokenTutorPanelWide - 30)
      .setLineSpacing(compact ? 2 : 4);
    this.tokenTutorExample
      .setFontSize(compact ? "13px" : "17px")
      .setStroke("#03170f", compact ? 1 : 2)
      .setWordWrapWidth(this.tokenTutorPanelWide - 30)
      .setLineSpacing(compact ? 2 : 3);
    this.tokenTutorHint
      .setFontSize(compact ? "11px" : "13px")
      .setStroke("#03170f", compact ? 1 : 1)
      .setWordWrapWidth(this.tokenTutorPanelWide - 30);
    this.layoutTokenTutorText();
    this.applyTokenTutorHeight();

    this.recapPanelWidth = compact ? Phaser.Math.Clamp(width - 30, 320, 660) : Phaser.Math.Clamp(width * 0.66, 640, 860);
    this.recapBackdrop.setSize(width, height).setPosition(0, 0);
    this.recapContainer.setPosition(width * 0.5, height * 0.5 + (compact ? 12 : 0));
    this.recapTitle
      .setFontSize(compact ? "27px" : "34px")
      .setWordWrapWidth(this.recapPanelWidth - 40);
    this.recapSubtitle
      .setFontSize(compact ? "16px" : "19px")
      .setWordWrapWidth(this.recapPanelWidth - 40);
    this.recapBody
      .setFontSize(compact ? "16px" : "21px")
      .setWordWrapWidth(this.recapPanelWidth - 40)
      .setLineSpacing(compact ? 4 : 6);
    this.recapTakeaway
      .setFontSize(compact ? "15px" : "18px")
      .setWordWrapWidth(this.recapPanelWidth - 40);
    this.recapHeaderText
      .setFontSize(compact ? "15px" : "18px");
    this.recapHint
      .setFontSize(compact ? "13px" : "16px")
      .setWordWrapWidth(this.recapPanelWidth - 42);
    this.recapButtonLabel.setFontSize(compact ? "20px" : "24px");
    this.layoutRecapCard();

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

  private presentTokenLesson(
    lesson: TokenLesson,
    nowMs: number,
    options: { respectCooldown: boolean; durationMs: number; cooldownMs: number },
  ): void {
    if (options.respectCooldown && nowMs < this.tokenTutorCooldownUntil) {
      return;
    }
    if (options.respectCooldown && this.tokenTutorContainer.visible && nowMs < this.tokenTutorVisibleUntil) {
      return;
    }

    this.tokenTutorLastLessonId = lesson.id;
    this.tokenTutorVisibleUntil = nowMs + options.durationMs;
    this.tokenTutorCooldownUntil = nowMs + options.cooldownMs;

    this.tokenTutorTitle.setText(lesson.title);
    this.tokenTutorBody.setText(lesson.body);
    if (lesson.example) {
      this.tokenTutorExample.setVisible(true);
      this.tokenTutorExample.setText(lesson.example);
    } else {
      this.tokenTutorExample.setVisible(false);
      this.tokenTutorExample.setText("");
    }
    this.layoutTokenTutorText();
    this.applyTokenTutorHeight();

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

    this.tokenTutorHideTimer = this.scene.time.delayedCall(options.durationMs, () => this.dismissTokenLesson());
  }

  private applyTokenTutorHeight(): void {
    const hasExample = this.tokenTutorExample.visible && this.tokenTutorExample.text.length > 0;
    const top = this.tokenTutorTitle.y;
    const bodyBottom = this.tokenTutorBody.y + this.tokenTutorBody.displayHeight;
    const exampleBottom = hasExample ? this.tokenTutorExample.y + this.tokenTutorExample.displayHeight : bodyBottom;
    const hintBottom = this.tokenTutorHint.y + this.tokenTutorHint.displayHeight;
    const textBottom = Math.max(bodyBottom, exampleBottom, hintBottom);
    const desired = Math.ceil(textBottom - top + (this.tokenTutorCompact ? 28 : 38));
    const minHeight = hasExample ? this.tokenTutorPanelTall : this.tokenTutorPanelShort;
    const maxHeight = hasExample ? 340 : 250;
    const nextHeight = Phaser.Math.Clamp(desired, minHeight, maxHeight);
    this.tokenTutorBg.setSize(this.tokenTutorPanelWide, nextHeight);
    this.tokenTutorShadow.setSize(this.tokenTutorPanelWide + 8, nextHeight + 8);
    this.tokenTutorHeader.setPosition(0, -nextHeight * 0.5 + this.tokenTutorHeader.height * 0.5 + 4);
    this.layoutTokenTutorText();
  }

  private layoutTokenTutorText(): void {
    const panelLeft = -this.tokenTutorPanelWide * 0.5 + 14;
    const panelTop = -this.tokenTutorBg.height * 0.5;
    const titleY = panelTop + (this.tokenTutorCompact ? 7 : 10);
    const gap = this.tokenTutorCompact ? 6 : 9;

    this.tokenTutorTitle.setPosition(panelLeft, titleY);
    this.tokenTutorBody.setPosition(panelLeft, titleY + this.tokenTutorTitle.displayHeight + gap);
    this.tokenTutorExample.setPosition(panelLeft, this.tokenTutorBody.y + this.tokenTutorBody.displayHeight + gap);
    const anchorBottom = this.tokenTutorExample.visible
      ? this.tokenTutorExample.y + this.tokenTutorExample.displayHeight
      : this.tokenTutorBody.y + this.tokenTutorBody.displayHeight;
    this.tokenTutorHint.setPosition(panelLeft, anchorBottom + gap);
  }

  private layoutRecapCard(): void {
    const width = this.recapPanelWidth;
    const contentWidth = width - 44;
    this.recapTitle.setWordWrapWidth(contentWidth);
    this.recapSubtitle.setWordWrapWidth(contentWidth);
    this.recapBody.setWordWrapWidth(contentWidth);
    this.recapTakeaway.setWordWrapWidth(contentWidth);
    this.recapHint.setWordWrapWidth(contentWidth);

    const headerHeight = this.tokenTutorCompact ? 34 : 38;
    const topPadding = 14;
    const gap = this.tokenTutorCompact ? 8 : 10;
    const bottomPadding = 16;
    const buttonHeight = this.tokenTutorCompact ? 42 : 46;

    const desiredHeight = Math.ceil(
      headerHeight
        + topPadding
        + this.recapTitle.displayHeight
        + gap
        + this.recapSubtitle.displayHeight
        + gap
        + this.recapBody.displayHeight
        + gap
        + this.recapTakeaway.displayHeight
        + gap
        + buttonHeight
        + gap
        + this.recapHint.displayHeight
        + bottomPadding,
    );
    this.recapPanelHeight = Phaser.Math.Clamp(desiredHeight, this.tokenTutorCompact ? 300 : 330, this.tokenTutorCompact ? 560 : 610);

    this.recapShadow.setSize(width + 10, this.recapPanelHeight + 10);
    this.recapCard.setSize(width, this.recapPanelHeight);
    this.recapHeader.setSize(width - 10, headerHeight);

    const left = -width * 0.5 + 20;
    const top = -this.recapPanelHeight * 0.5;
    this.recapHeader.setPosition(0, top + headerHeight * 0.5 + 4);
    this.recapHeaderText.setPosition(left, top + 8);
    this.recapTitle.setPosition(left, this.recapHeaderText.y + this.recapHeaderText.displayHeight + 8);
    this.recapSubtitle.setPosition(left, this.recapTitle.y + this.recapTitle.displayHeight + gap);
    this.recapBody.setPosition(left, this.recapSubtitle.y + this.recapSubtitle.displayHeight + gap);
    this.recapTakeaway.setPosition(left, this.recapBody.y + this.recapBody.displayHeight + gap);
    this.recapButtonBg.setPosition(0, this.recapTakeaway.y + this.recapTakeaway.displayHeight + 28);
    this.recapButtonLabel.setPosition(this.recapButtonBg.x, this.recapButtonBg.y);
    this.recapHint.setPosition(0, this.recapButtonBg.y + 30);
  }

  private tryContinueRecap(force = false): void {
    if (!this.recapContainer.visible) {
      return;
    }
    if (!force && !this.recapCanContinue) {
      return;
    }
    const next = this.recapContinueHandler;
    this.hideRecap();
    if (next) {
      next();
    }
  }

  private hideRecap(): void {
    this.recapCanContinue = false;
    this.recapContinueHandler = null;
    if (this.recapGateTimer) {
      this.recapGateTimer.remove(false);
      this.recapGateTimer = null;
    }
    if (this.recapAutoTimer) {
      this.recapAutoTimer.remove(false);
      this.recapAutoTimer = null;
    }
    if (this.recapButtonPulseTween) {
      this.recapButtonPulseTween.stop();
      this.recapButtonPulseTween = null;
    }
    this.recapButtonBg.setScale(1);
    this.scene.tweens.killTweensOf([this.recapBackdrop, this.recapContainer]);
    this.recapBackdrop.setVisible(false);
    this.recapContainer.setVisible(false);
    this.recapBackdrop.alpha = 0;
    this.recapContainer.alpha = 0;
  }

  destroy(): void {
    this.hideRecap();
    if (this.resizeHandler) {
      this.scene.scale.off("resize", this.resizeHandler);
      this.resizeHandler = null;
    }
    if (this.spaceDismissHandler && this.scene.input.keyboard) {
      this.scene.input.keyboard.off("keydown-ESC", this.spaceDismissHandler);
      this.spaceDismissHandler = null;
    }
    if (this.enterContinueHandler && this.scene.input.keyboard) {
      this.scene.input.keyboard.off("keydown-ENTER", this.enterContinueHandler);
      this.enterContinueHandler = null;
    }
    if (this.spaceContinueHandler && this.scene.input.keyboard) {
      this.scene.input.keyboard.off("keydown-SPACE", this.spaceContinueHandler);
      this.spaceContinueHandler = null;
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
    this.tokenLabText.destroy();
    this.comboText.destroy();
    this.checkpointCostText.destroy();
    this.specialsText.destroy();
    this.checkpointText.destroy();
    this.bossBarBg.destroy();
    this.bossBarFill.destroy();
    this.bossLabel.destroy();
    this.recapBackdrop.destroy();
    this.recapContainer.destroy(true);
    this.tokenTutorContainer.destroy(true);
  }
}
