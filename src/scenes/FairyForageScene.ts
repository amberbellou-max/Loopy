import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../data/balance";

type GamePhase = "menu" | "playing" | "levelComplete" | "gameOver";
type PlantState = "seed" | "sprout" | "tree" | "fruit";

interface SeedPlot {
  id: number;
  x: number;
  y: number;
  plantedAt: number;
  state: PlantState;
  sprite: Phaser.GameObjects.Sprite;
  halo: Phaser.GameObjects.Arc;
}

interface Bunny {
  id: number;
  sprite: Phaser.GameObjects.Sprite;
  speed: number;
  targetPlotId: number | null;
  wanderTarget: Phaser.Math.Vector2;
  nextWanderAt: number;
}

interface EagleState {
  sprite: Phaser.GameObjects.Sprite;
  hp: number;
  maxHp: number;
  speed: number;
  lastHitAt: number;
}

interface LevelSettings {
  startingBunnies: number;
  offspringPerFruit: number;
  feedGoal: number;
  growMs: number;
  plantCooldownMs: number;
  maxPlots: number;
  maxBunnies: number;
  bunnySpeed: number;
  famineMaxMs: number;
  eagleEnabled: boolean;
  eagleHp: number;
  eagleSpeed: number;
  eagleRespawnMs: number;
  magicRadius: number;
  magicCooldownMs: number;
}

export interface FairyForageSnapshot {
  phase: GamePhase;
  level: number;
  fedCount: number;
  feedGoal: number;
  bunnies: number;
  ripeFruit: number;
  plots: number;
  fairyHealth: number;
  famineRemainingMs: number;
  eagleHp: number | null;
}

const PLAY_BOUNDS = new Phaser.Geom.Rectangle(44, 104, GAME_WIDTH - 88, GAME_HEIGHT - 154);

export class FairyForageScene extends Phaser.Scene {
  private phase: GamePhase = "menu";
  private level = 1;
  private settings!: LevelSettings;
  private plots: SeedPlot[] = [];
  private bunnies: Bunny[] = [];
  private eagle: EagleState | null = null;
  private fairy!: Phaser.GameObjects.Sprite;
  private nextPlotId = 1;
  private nextBunnyId = 1;
  private nextPlantAt = 0;
  private nextMagicAt = 0;
  private nextEagleSpawnAt = 0;
  private fedCount = 0;
  private fairyHealth = 3;
  private famineRemainingMs = 8000;
  private levelText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private famineText!: Phaser.GameObjects.Text;
  private controlsText!: Phaser.GameObjects.Text;
  private bannerText!: Phaser.GameObjects.Text;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private keys: Record<string, Phaser.Input.Keyboard.Key> = {};

  constructor() {
    super("FairyForageScene");
  }

  create(): void {
    this.createGeneratedTextures();
    this.cursors = this.input.keyboard?.createCursorKeys() ?? null;

    if (this.input.keyboard) {
      this.keys = {
        w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        e: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        enter: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
        shift: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
        space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      };
    }

    this.input.on("pointerdown", this.handlePointerDown, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off("pointerdown", this.handlePointerDown, this);
    });

    this.showMenu();
    document.body.dataset.fairyReady = "true";

    const params = new URLSearchParams(window.location.search);
    const requestedLevel = Number(params.get("level") ?? "1");
    if (params.get("autostart") === "1" && Number.isFinite(requestedLevel)) {
      this.time.delayedCall(0, () => {
        this.startLevel(Phaser.Math.Clamp(Math.floor(requestedLevel), 1, 99));
      });
    }
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(delta, 50);
    const now = this.time.now;

    if (this.phase === "menu") {
      if (this.justDown(this.keys.space) || this.justDown(this.keys.enter)) {
        this.startLevel(1);
      }
      return;
    }

    if (this.phase === "levelComplete") {
      if (this.justDown(this.keys.space) || this.justDown(this.keys.enter)) {
        this.startLevel(this.level + 1);
      }
      return;
    }

    if (this.phase === "gameOver") {
      if (this.justDown(this.keys.space) || this.justDown(this.keys.enter)) {
        this.startLevel(1);
      }
      return;
    }

    this.handleMovement(dt);
    this.handlePlantingInput(now);
    this.handleMagicInput(now);
    this.updatePlants(now);
    this.updateBunnies(now, dt);
    this.updateEagle(now, dt);
    this.updateFamine(dt);
    this.updateHud();
  }

  startDebugGame(level = 1): void {
    this.startLevel(Phaser.Math.Clamp(Math.floor(level), 1, 99));
  }

  debugPlantAt(x: number, y: number): boolean {
    return this.plantSeedAt(x, y, this.time.now, true);
  }

  debugCastMagic(): void {
    this.castMagic(this.time.now, true);
  }

  forceFruit(count = 1): void {
    if (this.phase !== "playing") {
      this.startLevel(this.level);
    }

    for (let i = 0; i < count; i += 1) {
      const x = Phaser.Math.Between(PLAY_BOUNDS.left + 40, PLAY_BOUNDS.right - 40);
      const y = Phaser.Math.Between(PLAY_BOUNDS.top + 40, PLAY_BOUNDS.bottom - 40);
      const plot = this.createPlot(x, y, this.time.now - this.settings.growMs - 1);
      this.setPlotState(plot, "fruit");
    }
    this.updateHud();
  }

  getDebugSnapshot(): FairyForageSnapshot {
    return {
      phase: this.phase,
      level: this.level,
      fedCount: this.fedCount,
      feedGoal: this.settings?.feedGoal ?? 0,
      bunnies: this.bunnies.length,
      ripeFruit: this.getRipePlots().length,
      plots: this.plots.length,
      fairyHealth: this.fairyHealth,
      famineRemainingMs: Math.max(0, this.famineRemainingMs),
      eagleHp: this.eagle?.hp ?? null,
    };
  }

  private showMenu(): void {
    this.resetSceneObjects();
    this.phase = "menu";
    this.createBackground();

    this.add
      .text(GAME_WIDTH * 0.5, 104, "Bunny Bloom", {
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: "78px",
        fontStyle: "bold",
        color: "#fff7ce",
        stroke: "#3c1f2d",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH * 0.5,
        182,
        "Plant seeds, grow fruit, feed multiplying bunnies, and dodge the eagle.",
        {
          fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
          fontSize: "24px",
          color: "#fffef5",
          align: "center",
        },
      )
      .setOrigin(0.5);

    const button = this.add
      .text(GAME_WIDTH * 0.5, 334, "Start Meadow Run", {
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: "36px",
        fontStyle: "bold",
        color: "#20170f",
        backgroundColor: "#ffd86f",
        padding: { x: 24, y: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on("pointerover", () => button.setScale(1.04));
    button.on("pointerout", () => button.setScale(1));
    button.on("pointerdown", () => this.startLevel(1));

    this.add
      .text(
        GAME_WIDTH * 0.5,
        456,
        "Move: WASD or arrows    Plant: Space or click/tap    Magic burst: Shift or E",
        {
          fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
          fontSize: "21px",
          color: "#38261a",
          backgroundColor: "#fff6d9",
          padding: { x: 18, y: 10 },
        },
      )
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH * 0.5,
        524,
        "If the bunnies empty the orchard, the food timer runs out and the fairy falls.",
        {
          fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
          fontSize: "22px",
          color: "#4d2b25",
          align: "center",
        },
      )
      .setOrigin(0.5);

    this.writeDataAttributes();
  }

  private startLevel(level: number): void {
    this.resetSceneObjects();
    this.phase = "playing";
    this.level = level;
    this.settings = this.getSettingsForLevel(level);
    this.fedCount = 0;
    this.fairyHealth = 3;
    this.famineRemainingMs = this.settings.famineMaxMs;
    this.nextPlantAt = 0;
    this.nextMagicAt = 0;
    this.nextEagleSpawnAt = this.time.now + (this.settings.eagleEnabled ? 4200 : Number.POSITIVE_INFINITY);

    this.createBackground();
    this.createHud();

    this.fairy = this.add.sprite(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.55, "ff-fairy");
    this.fairy.setDepth(15);

    for (let i = 0; i < this.settings.startingBunnies; i += 1) {
      this.createBunny(
        Phaser.Math.Between(PLAY_BOUNDS.left + 80, PLAY_BOUNDS.right - 80),
        Phaser.Math.Between(PLAY_BOUNDS.top + 70, PLAY_BOUNDS.bottom - 70),
      );
    }

    this.bannerText.setText(`Level ${level}: offspring per fruit x${this.settings.offspringPerFruit}`);
    this.time.delayedCall(2000, () => {
      if (this.phase === "playing") {
        this.bannerText.setText("");
      }
    });

    this.updateHud();
  }

  private resetSceneObjects(): void {
    this.time.removeAllEvents();
    this.tweens.killAll();
    this.children.removeAll(true);
    this.plots = [];
    this.bunnies = [];
    this.eagle = null;
    this.nextPlotId = 1;
    this.nextBunnyId = 1;
  }

  private createHud(): void {
    this.add.rectangle(GAME_WIDTH * 0.5, 39, GAME_WIDTH, 78, 0x20170f, 0.82).setDepth(50);
    this.add.rectangle(GAME_WIDTH * 0.5, 82, GAME_WIDTH, 4, 0xffd86f, 0.9).setDepth(51);

    const textStyle = {
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
      fontSize: "20px",
      color: "#fffef5",
    };

    this.levelText = this.add.text(22, 14, "", textStyle).setDepth(52);
    this.statusText = this.add.text(22, 44, "", textStyle).setDepth(52);
    this.famineText = this.add
      .text(GAME_WIDTH - 22, 18, "", {
        ...textStyle,
        fontSize: "24px",
        fontStyle: "bold",
        align: "right",
      })
      .setOrigin(1, 0)
      .setDepth(52);
    this.controlsText = this.add
      .text(GAME_WIDTH - 22, 52, "Space/click plants | Shift/E magic", {
        ...textStyle,
        fontSize: "16px",
        color: "#ffe9a6",
      })
      .setOrigin(1, 0)
      .setDepth(52);
    this.bannerText = this.add
      .text(GAME_WIDTH * 0.5, 112, "", {
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#fff7ce",
        stroke: "#3c1f2d",
        strokeThickness: 4,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(60);
  }

  private createBackground(): void {
    this.add.rectangle(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.5, GAME_WIDTH, GAME_HEIGHT, 0xb7e6ff);
    this.add.rectangle(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.62, GAME_WIDTH, GAME_HEIGHT * 0.76, 0x77bd68);
    this.add.ellipse(212, 130, 330, 82, 0xffffff, 0.42);
    this.add.ellipse(1024, 146, 280, 70, 0xffffff, 0.36);
    this.add.circle(1120, 102, 38, 0xffd86f, 0.85);

    for (let i = 0; i < 42; i += 1) {
      const x = Phaser.Math.Between(PLAY_BOUNDS.left, PLAY_BOUNDS.right);
      const y = Phaser.Math.Between(PLAY_BOUNDS.top + 35, PLAY_BOUNDS.bottom);
      const flowerColor = Phaser.Math.RND.pick([0xff8fb8, 0xfff1a6, 0xaee6ff, 0xf3f7fa]) as number;
      this.add.circle(x, y, Phaser.Math.Between(2, 4), flowerColor, 0.9).setDepth(1);
    }

    this.add.rectangle(
      PLAY_BOUNDS.centerX,
      PLAY_BOUNDS.centerY,
      PLAY_BOUNDS.width,
      PLAY_BOUNDS.height,
      0xffffff,
      0,
    )
      .setStrokeStyle(2, 0xfff6d9, 0.42)
      .setDepth(2);
  }

  private createGeneratedTextures(): void {
    if (this.textures.exists("ff-fairy")) {
      return;
    }

    const graphics = this.make.graphics({ x: 0, y: 0 }, false);

    graphics.clear();
    graphics.fillStyle(0xffd7ef, 1);
    graphics.fillEllipse(10, 18, 18, 24);
    graphics.fillEllipse(24, 18, 18, 24);
    graphics.fillStyle(0xfff7ce, 1);
    graphics.fillCircle(17, 18, 10);
    graphics.fillStyle(0x73448c, 1);
    graphics.fillCircle(14, 15, 2);
    graphics.fillCircle(20, 15, 2);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(17, 7, 4);
    graphics.generateTexture("ff-fairy", 34, 36);

    graphics.clear();
    graphics.fillStyle(0xf4f0e7, 1);
    graphics.fillEllipse(18, 20, 30, 18);
    graphics.fillCircle(28, 14, 10);
    graphics.fillStyle(0xf4f0e7, 1);
    graphics.fillEllipse(24, 5, 7, 18);
    graphics.fillEllipse(33, 6, 7, 17);
    graphics.fillStyle(0x2f241d, 1);
    graphics.fillCircle(31, 13, 2);
    graphics.fillStyle(0xff8fb8, 1);
    graphics.fillCircle(35, 16, 2);
    graphics.generateTexture("ff-bunny", 42, 32);

    graphics.clear();
    graphics.fillStyle(0x8d5832, 1);
    graphics.fillEllipse(12, 12, 12, 8);
    graphics.fillStyle(0x4b2b19, 1);
    graphics.fillCircle(15, 10, 2);
    graphics.generateTexture("ff-seed", 24, 24);

    graphics.clear();
    graphics.lineStyle(3, 0x2d7b34, 1);
    graphics.lineBetween(14, 24, 14, 8);
    graphics.fillStyle(0x47b85a, 1);
    graphics.fillEllipse(8, 12, 12, 7);
    graphics.fillEllipse(20, 10, 13, 8);
    graphics.generateTexture("ff-sprout", 28, 28);

    graphics.clear();
    graphics.fillStyle(0x79512e, 1);
    graphics.fillRect(14, 22, 9, 18);
    graphics.fillStyle(0x3f9d4a, 1);
    graphics.fillCircle(18, 17, 18);
    graphics.fillCircle(8, 20, 12);
    graphics.fillCircle(30, 21, 13);
    graphics.generateTexture("ff-tree", 42, 44);

    graphics.clear();
    graphics.fillStyle(0x79512e, 1);
    graphics.fillRect(14, 22, 9, 18);
    graphics.fillStyle(0x3f9d4a, 1);
    graphics.fillCircle(18, 17, 18);
    graphics.fillCircle(8, 20, 12);
    graphics.fillCircle(30, 21, 13);
    graphics.fillStyle(0xff5464, 1);
    graphics.fillCircle(10, 14, 4);
    graphics.fillCircle(24, 9, 4);
    graphics.fillCircle(29, 22, 4);
    graphics.fillStyle(0xfff1a6, 1);
    graphics.fillCircle(10, 13, 1);
    graphics.fillCircle(24, 8, 1);
    graphics.fillCircle(29, 21, 1);
    graphics.generateTexture("ff-tree-fruit", 42, 44);

    graphics.clear();
    graphics.fillStyle(0x7b4932, 1);
    graphics.fillTriangle(32, 5, 6, 28, 32, 22);
    graphics.fillTriangle(32, 5, 58, 28, 32, 22);
    graphics.fillStyle(0x3a2418, 1);
    graphics.fillEllipse(32, 22, 18, 28);
    graphics.fillStyle(0xffd86f, 1);
    graphics.fillTriangle(30, 30, 34, 30, 32, 36);
    graphics.generateTexture("ff-eagle", 64, 44);

    graphics.destroy();
  }

  private getSettingsForLevel(level: number): LevelSettings {
    return {
      startingBunnies: Math.min(10, 2 + Math.floor(level / 2)),
      offspringPerFruit: Math.min(5, 1 + Math.floor((level - 1) / 2)),
      feedGoal: 7 + level * 4,
      growMs: Math.max(2300, 3900 - level * 130),
      plantCooldownMs: Math.max(260, 460 - level * 12),
      maxPlots: Math.min(44, 18 + level * 3),
      maxBunnies: Math.min(88, 14 + level * 8),
      bunnySpeed: Math.min(158, 68 + level * 7),
      famineMaxMs: Math.max(4300, 8600 - level * 260),
      eagleEnabled: level >= 2,
      eagleHp: 2 + Math.floor(level / 3),
      eagleSpeed: Math.min(250, 126 + level * 12),
      eagleRespawnMs: Math.max(4800, 9800 - level * 260),
      magicRadius: 178,
      magicCooldownMs: Math.max(1050, 1850 - level * 50),
    };
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.phase === "playing") {
      this.plantSeedAt(pointer.x, pointer.y, this.time.now);
      return;
    }

    if (this.phase === "levelComplete") {
      this.startLevel(this.level + 1);
      return;
    }

    if (this.phase === "gameOver") {
      this.startLevel(1);
    }
  }

  private handleMovement(deltaMs: number): void {
    const dt = deltaMs / 1000;
    let dx = 0;
    let dy = 0;

    if (this.cursors?.left.isDown || this.isDown(this.keys.a)) {
      dx -= 1;
    }
    if (this.cursors?.right.isDown || this.isDown(this.keys.d)) {
      dx += 1;
    }
    if (this.cursors?.up.isDown || this.isDown(this.keys.w)) {
      dy -= 1;
    }
    if (this.cursors?.down.isDown || this.isDown(this.keys.s)) {
      dy += 1;
    }

    if (dx !== 0 || dy !== 0) {
      const length = Math.hypot(dx, dy);
      dx /= length;
      dy /= length;
    }

    const speed = 284;
    this.fairy.x = Phaser.Math.Clamp(this.fairy.x + dx * speed * dt, PLAY_BOUNDS.left, PLAY_BOUNDS.right);
    this.fairy.y = Phaser.Math.Clamp(this.fairy.y + dy * speed * dt, PLAY_BOUNDS.top, PLAY_BOUNDS.bottom);
    this.fairy.rotation = dx * 0.16;
  }

  private handlePlantingInput(now: number): void {
    if (this.isDown(this.keys.space)) {
      this.plantSeedAt(this.fairy.x, this.fairy.y + 24, now);
    }
  }

  private handleMagicInput(now: number): void {
    if (this.justDown(this.keys.shift) || this.justDown(this.keys.e)) {
      this.castMagic(now);
    }
  }

  private plantSeedAt(x: number, y: number, now: number, force = false): boolean {
    if (this.phase !== "playing") {
      return false;
    }

    if (!force && now < this.nextPlantAt) {
      return false;
    }

    if (!force && this.plots.length >= this.settings.maxPlots) {
      this.showFloatingText("orchard full", this.fairy.x, this.fairy.y - 30, "#ffe9a6");
      return false;
    }

    const clampedX = Phaser.Math.Clamp(x, PLAY_BOUNDS.left + 16, PLAY_BOUNDS.right - 16);
    const clampedY = Phaser.Math.Clamp(y, PLAY_BOUNDS.top + 16, PLAY_BOUNDS.bottom - 16);
    const tooClose = this.plots.some((plot) => Phaser.Math.Distance.Between(plot.x, plot.y, clampedX, clampedY) < 34);
    if (!force && tooClose) {
      return false;
    }

    const plot = this.createPlot(clampedX, clampedY, now);
    this.showFloatingText("seed", plot.x, plot.y - 22, "#fff7ce");
    this.nextPlantAt = now + this.settings.plantCooldownMs;
    this.updateHud();
    return true;
  }

  private createPlot(x: number, y: number, plantedAt: number): SeedPlot {
    const halo = this.add.circle(x, y + 5, 20, 0xfff1a6, 0.16).setDepth(4);
    const sprite = this.add.sprite(x, y, "ff-seed").setDepth(8);
    const plot: SeedPlot = {
      id: this.nextPlotId,
      x,
      y,
      plantedAt,
      state: "seed",
      sprite,
      halo,
    };
    this.nextPlotId += 1;
    this.plots.push(plot);
    return plot;
  }

  private updatePlants(now: number): void {
    for (const plot of this.plots) {
      const age = now - plot.plantedAt;
      if (age >= this.settings.growMs) {
        this.setPlotState(plot, "fruit");
      } else if (age >= this.settings.growMs * 0.62) {
        this.setPlotState(plot, "tree");
      } else if (age >= this.settings.growMs * 0.3) {
        this.setPlotState(plot, "sprout");
      }
    }
  }

  private setPlotState(plot: SeedPlot, state: PlantState): void {
    if (plot.state === state) {
      return;
    }

    plot.state = state;
    const textureByState: Record<PlantState, string> = {
      seed: "ff-seed",
      sprout: "ff-sprout",
      tree: "ff-tree",
      fruit: "ff-tree-fruit",
    };
    plot.sprite.setTexture(textureByState[state]);

    const scaleByState: Record<PlantState, number> = {
      seed: 0.9,
      sprout: 1,
      tree: 1,
      fruit: 1.08,
    };
    plot.sprite.setScale(scaleByState[state]);

    if (state === "fruit") {
      plot.halo.setFillStyle(0xffd86f, 0.28);
      this.tweens.add({
        targets: plot.sprite,
        scale: 1.18,
        duration: 360,
        yoyo: true,
        ease: "Sine.InOut",
      });
    }
  }

  private createBunny(x: number, y: number): Bunny {
    const bunny: Bunny = {
      id: this.nextBunnyId,
      sprite: this.add.sprite(x, y, "ff-bunny").setDepth(12),
      speed: this.settings.bunnySpeed + Phaser.Math.Between(-8, 12),
      targetPlotId: null,
      wanderTarget: this.randomPointInBounds(),
      nextWanderAt: this.time.now + Phaser.Math.Between(300, 1300),
    };
    bunny.sprite.setScale(0.88);
    this.tweens.add({
      targets: bunny.sprite,
      scale: 1,
      duration: 380,
      ease: "Back.Out",
    });
    this.nextBunnyId += 1;
    this.bunnies.push(bunny);
    return bunny;
  }

  private updateBunnies(now: number, deltaMs: number): void {
    const dt = deltaMs / 1000;

    for (const bunny of [...this.bunnies]) {
      const target = this.resolveBunnyTarget(bunny);

      if (target) {
        this.moveToward(bunny.sprite, target.x, target.y, bunny.speed, dt);
        bunny.sprite.flipX = target.x < bunny.sprite.x;

        if (Phaser.Math.Distance.Between(bunny.sprite.x, bunny.sprite.y, target.x, target.y) < 26) {
          this.handleFruitEaten(target, bunny);
        }
        continue;
      }

      if (now >= bunny.nextWanderAt || Phaser.Math.Distance.Between(
        bunny.sprite.x,
        bunny.sprite.y,
        bunny.wanderTarget.x,
        bunny.wanderTarget.y,
      ) < 18) {
        bunny.wanderTarget = this.randomPointInBounds();
        bunny.nextWanderAt = now + Phaser.Math.Between(900, 2100);
      }

      this.moveToward(bunny.sprite, bunny.wanderTarget.x, bunny.wanderTarget.y, bunny.speed * 0.42, dt);
      bunny.sprite.flipX = bunny.wanderTarget.x < bunny.sprite.x;
    }
  }

  private resolveBunnyTarget(bunny: Bunny): SeedPlot | null {
    const existingTarget = bunny.targetPlotId === null
      ? null
      : this.plots.find((plot) => plot.id === bunny.targetPlotId && plot.state === "fruit") ?? null;

    if (existingTarget) {
      return existingTarget;
    }

    const target = this.getNearestRipePlot(bunny.sprite.x, bunny.sprite.y);
    bunny.targetPlotId = target?.id ?? null;
    return target;
  }

  private handleFruitEaten(plot: SeedPlot, bunny: Bunny): void {
    if (this.phase !== "playing") {
      return;
    }

    this.destroyPlot(plot);
    bunny.targetPlotId = null;
    this.fedCount += 1;
    this.showFloatingText("+ fruit", plot.x, plot.y - 32, "#fff7ce");

    const room = Math.max(0, this.settings.maxBunnies - this.bunnies.length);
    const babies = Math.min(room, this.settings.offspringPerFruit);
    for (let i = 0; i < babies; i += 1) {
      this.createBunny(
        Phaser.Math.Clamp(bunny.sprite.x + Phaser.Math.Between(-42, 42), PLAY_BOUNDS.left, PLAY_BOUNDS.right),
        Phaser.Math.Clamp(bunny.sprite.y + Phaser.Math.Between(-32, 32), PLAY_BOUNDS.top, PLAY_BOUNDS.bottom),
      );
    }

    if (babies > 0) {
      this.showFloatingText(`+${babies} bunnies`, bunny.sprite.x, bunny.sprite.y - 28, "#ffd86f");
    }

    if (this.fedCount >= this.settings.feedGoal) {
      this.completeLevel();
    }
  }

  private destroyPlot(plot: SeedPlot): void {
    plot.sprite.destroy();
    plot.halo.destroy();
    this.plots = this.plots.filter((candidate) => candidate.id !== plot.id);
  }

  private updateFamine(deltaMs: number): void {
    const ripeFruit = this.getRipePlots().length;
    if (ripeFruit === 0 && this.bunnies.length > 0) {
      const pressure = 1 + this.bunnies.length * 0.08 + this.level * 0.05;
      this.famineRemainingMs -= deltaMs * pressure;
      if (this.famineRemainingMs <= 0) {
        this.gameOver("The bunnies ran out of food.");
      }
      return;
    }

    this.famineRemainingMs = Math.min(this.settings.famineMaxMs, this.famineRemainingMs + deltaMs * 0.82);
  }

  private updateEagle(now: number, deltaMs: number): void {
    if (!this.settings.eagleEnabled) {
      return;
    }

    if (!this.eagle && now >= this.nextEagleSpawnAt) {
      this.spawnEagle();
    }

    if (!this.eagle) {
      return;
    }

    const dt = deltaMs / 1000;
    const eagle = this.eagle;
    const driftX = Math.sin(now / 360) * 70;
    this.moveToward(eagle.sprite, this.fairy.x + driftX, this.fairy.y - 8, eagle.speed, dt);
    eagle.sprite.rotation = Phaser.Math.Angle.Between(eagle.sprite.x, eagle.sprite.y, this.fairy.x, this.fairy.y) + Math.PI / 2;

    const distance = Phaser.Math.Distance.Between(eagle.sprite.x, eagle.sprite.y, this.fairy.x, this.fairy.y);
    if (distance < 36 && now - eagle.lastHitAt > 1200) {
      eagle.lastHitAt = now;
      this.fairyHealth -= 1;
      this.cameras.main.shake(130, 0.006);
      this.showFloatingText("-1 heart", this.fairy.x, this.fairy.y - 44, "#ff8f8f");
      this.tweens.add({
        targets: this.fairy,
        alpha: 0.35,
        duration: 90,
        yoyo: true,
        repeat: 4,
      });
      if (this.fairyHealth <= 0) {
        this.gameOver("The eagle caught the fairy.");
      }
    }
  }

  private spawnEagle(): void {
    const x = Phaser.Math.Between(PLAY_BOUNDS.left, PLAY_BOUNDS.right);
    const sprite = this.add.sprite(x, PLAY_BOUNDS.top - 48, "ff-eagle").setDepth(16);
    this.eagle = {
      sprite,
      hp: this.settings.eagleHp,
      maxHp: this.settings.eagleHp,
      speed: this.settings.eagleSpeed,
      lastHitAt: 0,
    };
    this.showFloatingText("eagle!", x, PLAY_BOUNDS.top + 20, "#5a241e");
  }

  private castMagic(now: number, force = false): void {
    if (this.phase !== "playing") {
      return;
    }

    if (!force && now < this.nextMagicAt) {
      return;
    }

    this.nextMagicAt = now + this.settings.magicCooldownMs;
    const burst = this.add.circle(this.fairy.x, this.fairy.y, 26, 0xffd7ef, 0.34).setDepth(14);
    burst.setStrokeStyle(3, 0xffffff, 0.75);
    this.tweens.add({
      targets: burst,
      radius: this.settings.magicRadius,
      alpha: 0,
      duration: 330,
      ease: "Sine.Out",
      onComplete: () => burst.destroy(),
    });

    if (!this.eagle) {
      this.showFloatingText("no eagle", this.fairy.x, this.fairy.y - 38, "#fff7ce");
      return;
    }

    const distance = Phaser.Math.Distance.Between(this.fairy.x, this.fairy.y, this.eagle.sprite.x, this.eagle.sprite.y);
    if (distance > this.settings.magicRadius) {
      this.showFloatingText("too far", this.fairy.x, this.fairy.y - 38, "#fff7ce");
      return;
    }

    this.eagle.hp -= 1;
    this.eagle.sprite.setTint(0xffd7ef);
    this.time.delayedCall(120, () => this.eagle?.sprite.clearTint());
    this.showFloatingText(`eagle ${this.eagle.hp}/${this.eagle.maxHp}`, this.eagle.sprite.x, this.eagle.sprite.y - 32, "#ffffff");

    const knockback = new Phaser.Math.Vector2(this.eagle.sprite.x - this.fairy.x, this.eagle.sprite.y - this.fairy.y)
      .normalize()
      .scale(74);
    this.eagle.sprite.x = Phaser.Math.Clamp(this.eagle.sprite.x + knockback.x, PLAY_BOUNDS.left, PLAY_BOUNDS.right);
    this.eagle.sprite.y = Phaser.Math.Clamp(this.eagle.sprite.y + knockback.y, PLAY_BOUNDS.top - 30, PLAY_BOUNDS.bottom);

    if (this.eagle.hp <= 0) {
      this.defeatEagle();
    }
  }

  private defeatEagle(): void {
    if (!this.eagle) {
      return;
    }

    const eagleX = this.eagle.sprite.x;
    const eagleY = this.eagle.sprite.y;
    this.tweens.add({
      targets: this.eagle.sprite,
      angle: 240,
      alpha: 0,
      y: eagleY + 90,
      duration: 430,
      ease: "Quad.In",
      onComplete: () => this.eagle?.sprite.destroy(),
    });

    const removed = this.removeBunniesNear(eagleX, eagleY, 2 + this.level);
    this.showFloatingText(`eagle crash cleared ${removed}`, eagleX, eagleY, "#ffd86f");
    this.eagle = null;
    this.nextEagleSpawnAt = this.time.now + this.settings.eagleRespawnMs;
  }

  private removeBunniesNear(x: number, y: number, requestedCount: number): number {
    const removable = [...this.bunnies]
      .sort((left, right) => {
        const leftDistance = Phaser.Math.Distance.Between(left.sprite.x, left.sprite.y, x, y);
        const rightDistance = Phaser.Math.Distance.Between(right.sprite.x, right.sprite.y, x, y);
        return leftDistance - rightDistance;
      })
      .slice(0, Math.max(0, Math.min(requestedCount, this.bunnies.length - 1)));

    for (const bunny of removable) {
      bunny.sprite.destroy();
      this.bunnies = this.bunnies.filter((candidate) => candidate.id !== bunny.id);
    }

    return removable.length;
  }

  private completeLevel(): void {
    if (this.phase !== "playing") {
      return;
    }

    this.phase = "levelComplete";
    this.add.rectangle(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.5, GAME_WIDTH, GAME_HEIGHT, 0x20170f, 0.58).setDepth(80);
    this.add
      .text(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.44, `Level ${this.level} fed`, {
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: "54px",
        fontStyle: "bold",
        color: "#fff7ce",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(81);
    this.add
      .text(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.56, "Press Space or click for the next meadow.", {
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: "26px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(81);
    this.writeDataAttributes();
  }

  private gameOver(reason: string): void {
    if (this.phase !== "playing") {
      return;
    }

    this.phase = "gameOver";
    this.add.rectangle(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.5, GAME_WIDTH, GAME_HEIGHT, 0x2b1517, 0.66).setDepth(90);
    this.add
      .text(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.42, "The meadow went quiet", {
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: "50px",
        fontStyle: "bold",
        color: "#fff7ce",
      })
      .setOrigin(0.5)
      .setDepth(91);
    this.add
      .text(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.52, reason, {
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: "26px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(91);
    this.add
      .text(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.61, "Press Space or click to restart.", {
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: "24px",
        color: "#ffd86f",
      })
      .setOrigin(0.5)
      .setDepth(91);
    this.writeDataAttributes();
  }

  private updateHud(): void {
    if (this.phase !== "playing") {
      this.writeDataAttributes();
      return;
    }

    const ripeFruit = this.getRipePlots().length;
    const plantReady = Math.max(0, this.nextPlantAt - this.time.now);
    const magicReady = Math.max(0, this.nextMagicAt - this.time.now);
    const eagleLabel = this.eagle ? ` | Eagle HP ${this.eagle.hp}/${this.eagle.maxHp}` : this.settings.eagleEnabled ? " | Eagle incoming" : "";

    this.levelText.setText(
      `Level ${this.level} | Fed ${this.fedCount}/${this.settings.feedGoal} | Bunnies ${this.bunnies.length}/${this.settings.maxBunnies}${eagleLabel}`,
    );
    this.statusText.setText(
      `Fruit ready ${ripeFruit} | Growing ${this.plots.length - ripeFruit} | Plant ${plantReady <= 0 ? "ready" : `${(plantReady / 1000).toFixed(1)}s`} | Magic ${magicReady <= 0 ? "ready" : `${(magicReady / 1000).toFixed(1)}s`}`,
    );

    const famineSeconds = Math.max(0, this.famineRemainingMs / 1000);
    this.famineText.setColor(ripeFruit === 0 ? "#ffb1a6" : "#c8ffd2");
    this.famineText.setText(`Food timer ${famineSeconds.toFixed(1)}s\nHearts ${this.fairyHealth}`);
    this.controlsText.setText(`Grow ${(this.settings.growMs / 1000).toFixed(1)}s | Fruit spawns +${this.settings.offspringPerFruit}`);
    this.writeDataAttributes();
  }

  private writeDataAttributes(): void {
    const snapshot = this.getDebugSnapshot();
    document.body.dataset.fairyPhase = snapshot.phase;
    document.body.dataset.fairyLevel = String(snapshot.level);
    document.body.dataset.fairyFed = String(snapshot.fedCount);
    document.body.dataset.fairyBunnies = String(snapshot.bunnies);
    document.body.dataset.fairyRipeFruit = String(snapshot.ripeFruit);
    document.body.dataset.fairyHealth = String(snapshot.fairyHealth);
  }

  private getRipePlots(): SeedPlot[] {
    return this.plots.filter((plot) => plot.state === "fruit");
  }

  private getNearestRipePlot(x: number, y: number): SeedPlot | null {
    let nearest: SeedPlot | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const plot of this.getRipePlots()) {
      const distance = Phaser.Math.Distance.Between(x, y, plot.x, plot.y);
      if (distance < nearestDistance) {
        nearest = plot;
        nearestDistance = distance;
      }
    }

    return nearest;
  }

  private moveToward(
    sprite: Phaser.GameObjects.Sprite,
    targetX: number,
    targetY: number,
    speed: number,
    dt: number,
  ): void {
    const vector = new Phaser.Math.Vector2(targetX - sprite.x, targetY - sprite.y);
    if (vector.lengthSq() <= 1) {
      return;
    }

    vector.normalize().scale(speed * dt);
    sprite.x = Phaser.Math.Clamp(sprite.x + vector.x, PLAY_BOUNDS.left, PLAY_BOUNDS.right);
    sprite.y = Phaser.Math.Clamp(sprite.y + vector.y, PLAY_BOUNDS.top - 42, PLAY_BOUNDS.bottom);
  }

  private randomPointInBounds(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      Phaser.Math.Between(PLAY_BOUNDS.left + 20, PLAY_BOUNDS.right - 20),
      Phaser.Math.Between(PLAY_BOUNDS.top + 20, PLAY_BOUNDS.bottom - 20),
    );
  }

  private showFloatingText(text: string, x: number, y: number, color: string): void {
    const label = this.add
      .text(x, y, text, {
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: "18px",
        fontStyle: "bold",
        color,
        stroke: "#24160f",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(70);

    this.tweens.add({
      targets: label,
      y: y - 34,
      alpha: 0,
      duration: 840,
      ease: "Sine.Out",
      onComplete: () => label.destroy(),
    });
  }

  private isDown(key: Phaser.Input.Keyboard.Key | undefined): boolean {
    return Boolean(key?.isDown);
  }

  private justDown(key: Phaser.Input.Keyboard.Key | undefined): boolean {
    return key ? Phaser.Input.Keyboard.JustDown(key) : false;
  }
}
