import Phaser from "phaser";
import { academyModules } from "../data/academyModules";
import {
  tokenAssumptionLedger,
  tokenMissingInputs,
  tokenOneLever,
  tokenPromptFlow,
  tokenReversibleNextStep,
  tokenSafeguard,
} from "../data/tokenModules";

interface TokenAcademyData {
  returnScene?: "MainMenuScene" | "PauseScene" | "WorldMapScene";
  startModuleId?: number;
}

type AcademyFilter = "tokens" | "neural-nets" | "all";

export class TokenAcademyScene extends Phaser.Scene {
  private moduleIndex = 0;
  private returnScene: "MainMenuScene" | "PauseScene" | "WorldMapScene" = "MainMenuScene";
  private currentFilter: AcademyFilter = "all";
  private filteredModuleIndices: number[] = [];
  private filterButtons!: Record<AcademyFilter, Phaser.GameObjects.Text>;

  private moduleCounterText!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private contentText!: Phaser.GameObjects.Text;

  constructor() {
    super("TokenAcademyScene");
  }

  create(data: TokenAcademyData): void {
    const { width, height } = this.scale;
    const compact = width < 960 || height < 700;

    this.returnScene = data.returnScene ?? "MainMenuScene";
    this.moduleIndex = Phaser.Math.Clamp((data.startModuleId ?? 1) - 1, 0, academyModules.length - 1);

    this.add.rectangle(width * 0.5, height * 0.5, width, height, 0x062319, 1);
    this.add
      .rectangle(width * 0.5, compact ? 58 : 66, width - 28, compact ? 88 : 100, 0x0d3a2a, 0.9)
      .setStrokeStyle(2, 0x7df4cb, 0.8);

    this.add
      .text(width * 0.5, compact ? 44 : 48, "Token Academy", {
        fontSize: compact ? "42px" : "52px",
        fontStyle: "bold",
        color: "#d7fff0",
      })
      .setOrigin(0.5);

    this.add
      .text(width * 0.5, compact ? 78 : 92, "Optional curriculum content: browse modules anytime", {
        fontSize: compact ? "16px" : "20px",
        color: "#b8f3dd",
      })
      .setOrigin(0.5);

    const filterY = compact ? 126 : 146;
    this.add
      .text(width * 0.5, filterY - (compact ? 22 : 24), "Browse Track", {
        fontSize: compact ? "14px" : "17px",
        color: "#b8f3dd",
      })
      .setOrigin(0.5);

    this.filterButtons = {
      tokens: this.makeFilterButton(width * 0.27, filterY, "Tokens", () => this.applyFilter("tokens")),
      "neural-nets": this.makeFilterButton(width * 0.5, filterY, "Neural Nets", () => this.applyFilter("neural-nets")),
      all: this.makeFilterButton(width * 0.73, filterY, "All", () => this.applyFilter("all")),
    };

    const cardTop = compact ? 166 : 202;
    const cardBottomPadding = compact ? 168 : 196;
    const cardWidth = Math.min(980, width - 42);
    const cardHeight = Math.max(compact ? 220 : 260, height - cardTop - cardBottomPadding);
    this.add
      .rectangle(width * 0.5, cardTop + cardHeight * 0.5, cardWidth, cardHeight, 0x082c20, 0.94)
      .setStrokeStyle(2, 0x7deac6, 0.85);

    const left = width * 0.5 - cardWidth * 0.5 + 16;
    const wrap = cardWidth - 32;

    this.moduleCounterText = this.add.text(left, cardTop + 10, "", {
      fontSize: compact ? "15px" : "18px",
      color: "#a8f0d3",
    });

    this.titleText = this.add.text(left, cardTop + 34, "", {
      fontSize: compact ? "28px" : "34px",
      fontStyle: "bold",
      color: "#eafff6",
      wordWrap: { width: wrap },
    });

    this.contentText = this.add.text(left, cardTop + (compact ? 80 : 92), "", {
      fontSize: compact ? "16px" : "20px",
      color: "#cffff0",
      wordWrap: { width: wrap },
      lineSpacing: compact ? 5 : 7,
    });

    this.add
      .text(width * 0.5, height - (compact ? 106 : 124), this.buildCourseNotesText(), {
        fontSize: compact ? "12px" : "14px",
        color: "#bdeeda",
        align: "center",
        wordWrap: { width: width - 52 },
        lineSpacing: compact ? 2 : 3,
      })
      .setOrigin(0.5);

    this.makeButton(width * 0.5 - 210, height - 42, "Prev", () => this.moveModule(-1));
    this.makeButton(width * 0.5 - 42, height - 42, "Next", () => this.moveModule(1));
    this.makeButton(width * 0.5 + 198, height - 42, this.getBackLabel(), () => this.goBack());

    this.input.keyboard?.on("keydown-LEFT", this.handlePrev);
    this.input.keyboard?.on("keydown-RIGHT", this.handleNext);
    this.input.keyboard?.on("keydown-ESC", this.handleBack);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off("keydown-LEFT", this.handlePrev);
      this.input.keyboard?.off("keydown-RIGHT", this.handleNext);
      this.input.keyboard?.off("keydown-ESC", this.handleBack);
    });

    this.applyFilter("all", true);
  }

  private readonly handlePrev = (): void => this.moveModule(-1);
  private readonly handleNext = (): void => this.moveModule(1);
  private readonly handleBack = (): void => this.goBack();

  private buildCourseNotesText(): string {
    return [
      `Assumptions: ${tokenAssumptionLedger.join(", ")}`,
      `Missing Inputs: ${tokenMissingInputs.join(", ")}`,
      `One Lever: ${tokenOneLever}`,
      `Reversible Next Step: ${tokenReversibleNextStep}`,
      `Safeguard: ${tokenSafeguard}`,
      `A->I->G->G->V: ${tokenPromptFlow.join(" | ")}`,
    ].join("\n");
  }

  private getBackLabel(): string {
    if (this.returnScene === "PauseScene") {
      return "Back to Pause";
    }
    if (this.returnScene === "WorldMapScene") {
      return "Back to Map";
    }
    return "Back to Menu";
  }

  private makeButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): Phaser.GameObjects.Text {
    const button = this.add
      .text(x, y, label, {
        fontSize: "24px",
        color: "#032116",
        backgroundColor: "#95f8d3",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on("pointerover", () => button.setScale(1.03));
    button.on("pointerout", () => button.setScale(1));
    button.on("pointerdown", onClick);
    return button;
  }

  private makeFilterButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): Phaser.GameObjects.Text {
    const button = this.add
      .text(x, y, label, {
        fontSize: "20px",
        color: "#cffff0",
        backgroundColor: "#1b5541",
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on("pointerover", () => button.setScale(1.03));
    button.on("pointerout", () => button.setScale(1));
    button.on("pointerdown", onClick);
    return button;
  }

  private applyFilter(nextFilter: AcademyFilter, keepCurrent = false): void {
    this.currentFilter = nextFilter;
    this.rebuildFilteredModuleIndices();

    if (!keepCurrent || !this.filteredModuleIndices.includes(this.moduleIndex)) {
      this.moduleIndex = this.filteredModuleIndices[0] ?? 0;
    }

    this.updateFilterButtons();
    this.renderModule();
  }

  private rebuildFilteredModuleIndices(): void {
    this.filteredModuleIndices = academyModules
      .map((_, index) => index)
      .filter((index) => {
        if (this.currentFilter === "all") {
          return true;
        }
        return academyModules[index].track === this.currentFilter;
      });

    if (this.filteredModuleIndices.length === 0) {
      this.filteredModuleIndices = academyModules.map((_, index) => index);
    }
  }

  private updateFilterButtons(): void {
    const setButtonState = (button: Phaser.GameObjects.Text, active: boolean): void => {
      button.setColor(active ? "#032116" : "#cffff0");
      button.setBackgroundColor(active ? "#95f8d3" : "#1b5541");
      button.setScale(active ? 1.03 : 1);
    };

    setButtonState(this.filterButtons.tokens, this.currentFilter === "tokens");
    setButtonState(this.filterButtons["neural-nets"], this.currentFilter === "neural-nets");
    setButtonState(this.filterButtons.all, this.currentFilter === "all");
  }

  private moveModule(delta: -1 | 1): void {
    if (this.filteredModuleIndices.length === 0) {
      return;
    }
    let currentPos = this.filteredModuleIndices.indexOf(this.moduleIndex);
    if (currentPos < 0) {
      currentPos = 0;
    }
    const nextPos = Phaser.Math.Wrap(currentPos + delta, 0, this.filteredModuleIndices.length);
    this.moduleIndex = this.filteredModuleIndices[nextPos];
    this.renderModule();
  }

  private renderModule(): void {
    const module = academyModules[this.moduleIndex];
    const trackLabel = module.track === "tokens" ? "Tokens" : "Neural Nets";
    const taughtLabel = module.taughtInLevel ? `Taught in Level ${module.taughtInLevel}` : "Academy Extension";
    const filterLabel =
      this.currentFilter === "all" ? "All" : this.currentFilter === "tokens" ? "Tokens" : "Neural Nets";
    const filteredPos = this.filteredModuleIndices.indexOf(this.moduleIndex);
    const filteredCounter = filteredPos >= 0 ? `${filteredPos + 1}/${this.filteredModuleIndices.length}` : `1/${this.filteredModuleIndices.length}`;
    this.moduleCounterText.setText(
      `Module ${module.id}/${academyModules.length} | ${trackLabel} | ${taughtLabel}\nView: ${filterLabel} (${filteredCounter})`,
    );
    this.titleText.setText(module.title);
    this.contentText.setText(
      [
        `Core idea: ${module.definition}`,
        `Key idea: ${module.keyIdea}`,
        "Examples:",
        `- ${module.examples[0]}`,
        `- ${module.examples[1]}`,
        `Takeaway: ${module.takeaway}`,
      ].join("\n"),
    );
  }

  private goBack(): void {
    this.scene.start(this.returnScene);
  }
}
