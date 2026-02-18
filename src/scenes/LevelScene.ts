import Phaser from "phaser";
import { DAMAGE } from "../data/balance";
import { getLevelById } from "../data/levels";
import { getUnlockedAbilities } from "../data/upgrades";
import { ArcaneBoss } from "../entities/ArcaneBoss";
import { FlashPredator } from "../entities/FlashPredator";
import { FoodItem } from "../entities/FoodItem";
import { GlitterShot } from "../entities/GlitterShot";
import { PlayerFishFairy } from "../entities/PlayerFishFairy";
import { Projectile } from "../entities/Projectile";
import { SeedPickup } from "../entities/SeedPickup";
import { Wormhole } from "../entities/Wormhole";
import { AudioSystem } from "../systems/AudioSystem";
import { GlitterComboSystem, tapsToAction, type GlitterComboAction } from "../systems/glitterCombo";
import { InputSystem } from "../systems/InputSystem";
import { SaveSystem } from "../systems/SaveSystem";
import { SpawnSystem } from "../systems/SpawnSystem";
import { checkpointSeedCost, getDifficultyParams, scaleQuota, scaleTimeLimit, type DifficultyParams } from "../systems/difficulty";
import type { LevelDefinition } from "../types/gameTypes";
import { GAME_EVENTS } from "../types/gameTypes";
import type { LevelDebugSnapshot } from "../types/debugTypes";
import { HUD } from "../ui/HUD";

interface LevelSceneData {
  levelId: number;
}

interface GlitterShotOptions {
  damage?: number;
  speed?: number;
  flashColor?: number;
  flashAlpha?: number;
  flashRadius?: number;
  flashDurationMs?: number;
  shotScale?: number;
  showFlash?: boolean;
  directionX?: number;
  directionY?: number;
}

export class LevelScene extends Phaser.Scene {
  private level!: LevelDefinition;
  private difficulty!: DifficultyParams;
  private levelWidth = 3000;

  private player!: PlayerFishFairy;
  private inputSystem!: InputSystem;
  private audioSystem!: AudioSystem;
  private hud!: HUD;
  private comboSystem!: GlitterComboSystem;

  private foods!: Phaser.Physics.Arcade.Group;
  private predators!: Phaser.Physics.Arcade.Group;
  private wormholes!: Phaser.Physics.Arcade.Group;
  private hazards!: Phaser.Physics.Arcade.StaticGroup;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private glitterShots!: Phaser.Physics.Arcade.Group;
  private pickups!: Phaser.Physics.Arcade.Group;
  private exitGate!: Phaser.Physics.Arcade.Sprite;

  private boss: ArcaneBoss | null = null;
  private bossSpawned = false;

  private collected = 0;
  private effectiveQuota = 0;
  private completed = false;
  private deaths = 0;

  private checkpointCursor = 0;
  private checkpointCost = 0;
  private currentCheckpoint = { x: 120, y: 360 };
  private lastHazardDamageAt = 0;
  private lastExitHintAt = 0;
  private lastCheckpointHintAt = 0;

  private livesRemaining = 3;
  private seedCount = 0;
  private universeSeedCount = 0;
  private bloomMeter = 0;
  private shieldUntil = 0;
  private bloomActiveUntil = 0;
  private nextHoldShotAt = 0;
  private holdShotIntervalMs = 140;
  private holdVolleyCharge = 0;
  private nextShieldPulseAt = 0;
  private nextTapShotAt = 0;
  private nextBombAt = 0;
  private nextShieldCastAt = 0;
  private nextCombatHintAt = 0;
  private nextShotFlashAt = 0;
  private shotFlashIntervalMs = 65;
  private maxEnemyProjectiles = 150;
  private maxGlitterShots = 90;
  private lastResolvedSpaceAction: GlitterComboAction | null = null;
  private lastResolvedSpaceActionAt = 0;
  private lastBlockedSpaceActionReason: string | null = null;
  private lastBlockedSpaceActionAt = 0;
  private debugMaxDeltaMs = 0;
  private debugLongFrameCount = 0;
  private debugUpdateCount = 0;
  private debugConsecutiveStallFrames = 0;
  private debugWorstConsecutiveStallFrames = 0;

  private timeLeftSec: number | null = null;

  constructor() {
    super("LevelScene");
  }

  create(data: LevelSceneData): void {
    const levelId = Phaser.Math.Clamp(data.levelId ?? 1, 1, 16);
    this.level = getLevelById(levelId);
    this.difficulty = getDifficultyParams(levelId);

    this.levelWidth = this.level.exitGateX + 320;
    this.effectiveQuota = scaleQuota(this.level.quota, this.difficulty);
    this.checkpointCost = checkpointSeedCost(levelId);
    this.timeLeftSec = scaleTimeLimit(this.level.timeLimitSec, this.difficulty);

    this.collected = 0;
    this.completed = false;
    this.deaths = 0;

    this.checkpointCursor = 0;
    this.currentCheckpoint = { x: this.level.playerStart.x, y: this.level.playerStart.y };
    this.lastHazardDamageAt = 0;
    this.lastExitHintAt = 0;
    this.lastCheckpointHintAt = 0;

    this.livesRemaining = 3;
    this.seedCount = 0;
    this.universeSeedCount = 0;
    this.bloomMeter = 0;
    this.shieldUntil = 0;
    this.bloomActiveUntil = 0;
    this.nextHoldShotAt = 0;
    this.holdVolleyCharge = 0;
    this.nextShieldPulseAt = 0;
    this.nextTapShotAt = 0;
    this.nextBombAt = 0;
    this.nextShieldCastAt = 0;
    this.nextCombatHintAt = 0;
    this.nextShotFlashAt = 0;
    this.shotFlashIntervalMs = Phaser.Math.Clamp(72 - this.level.id, 46, 72);
    this.holdShotIntervalMs = Phaser.Math.Clamp(180 - this.level.id * 5, 95, 150);
    this.maxEnemyProjectiles = Phaser.Math.Clamp(90 + this.level.id * 4, 105, 160);
    this.maxGlitterShots = Phaser.Math.Clamp(60 + this.level.id * 2, 74, 112);
    this.lastResolvedSpaceAction = null;
    this.lastResolvedSpaceActionAt = 0;
    this.lastBlockedSpaceActionReason = null;
    this.lastBlockedSpaceActionAt = 0;
    this.debugMaxDeltaMs = 0;
    this.debugLongFrameCount = 0;
    this.debugUpdateCount = 0;
    this.debugConsecutiveStallFrames = 0;
    this.debugWorstConsecutiveStallFrames = 0;

    this.boss = null;
    this.bossSpawned = false;

    this.createBackground(this.level.biome);

    this.physics.world.setBounds(0, 0, this.levelWidth, 660);
    this.cameras.main.setBounds(0, 0, this.levelWidth, 660);

    this.player = new PlayerFishFairy(this, this.level.playerStart.x, this.level.playerStart.y);
    this.player.setCollideWorldBounds(true);

    this.projectiles = this.physics.add.group();
    this.glitterShots = this.physics.add.group();
    this.pickups = this.physics.add.group();

    const spawnSystem = new SpawnSystem(this);
    const spawned = spawnSystem.spawnLevel(this.level, this.difficulty);
    this.foods = spawned.foods;
    this.predators = spawned.predators;
    this.wormholes = spawned.wormholes;
    this.hazards = spawned.hazards;
    this.exitGate = spawned.exitGate;

    this.cameras.main.startFollow(this.player, true, 0.06, 0.06);

    this.inputSystem = new InputSystem(this);
    this.audioSystem = new AudioSystem(this);
    this.hud = new HUD(this);
    this.comboSystem = new GlitterComboSystem();

    const save = SaveSystem.load();
    this.audioSystem.setVolumes(save.settings.musicVolume, save.settings.sfxVolume);
    this.audioSystem.startBiomeMusic(this.level.biome);

    this.player.setUnlockedAbilities(getUnlockedAbilities(Math.max(this.level.id, save.highestUnlockedLevel)));

    this.bindOverlaps();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.inputSystem.destroy();
      this.audioSystem.destroy();
      this.hud.destroy();
    });

    this.hud.updateQuota(this.collected, this.effectiveQuota);
    this.hud.updateHealth(this.player.getHealthRatio());
    this.hud.updateEconomy(this.livesRemaining, this.seedCount, this.universeSeedCount, this.bloomMeter);
    this.hud.updateCheckpointCost(this.checkpointCost);
    this.hud.flashCheckpoint(`Level ${this.level.id}: Eat ${this.effectiveQuota} food`);

    this.setDomFlag("loopyCurrentLevel", String(this.level.id));
    this.setDomFlag("loopyRespawnCount", "0");
    this.setDomFlag("loopyAbilityUnlocked", "");

    this.bindDebugHotkeys();
  }

  update(time: number, delta: number): void {
    if (this.completed) {
      return;
    }

    this.debugUpdateCount += 1;
    this.debugMaxDeltaMs = Math.max(this.debugMaxDeltaMs, delta);
    if (delta >= 34) {
      this.debugLongFrameCount += 1;
    }
    if (delta >= 120) {
      this.debugConsecutiveStallFrames += 1;
      this.debugWorstConsecutiveStallFrames = Math.max(this.debugWorstConsecutiveStallFrames, this.debugConsecutiveStallFrames);
    } else {
      this.debugConsecutiveStallFrames = 0;
    }

    const deltaSec = delta / 1000;

    const input = this.inputSystem.read();
    if (input.pausePressed) {
      this.scene.launch("PauseScene");
      this.scene.pause();
      return;
    }

    if (input.spaceTapped) {
      const tapCount = this.comboSystem.registerTap(time);
      this.executeComboAction(tapsToAction(tapCount), time);
      if (tapCount >= 3) {
        this.comboSystem.clear();
      }
    }
    this.comboSystem.expire(time);
    this.updateSpaceHoldFire(input.spaceHeld, input.spaceTapped, time);

    if (input.bloomPressed) {
      this.tryActivateUniverseBloom(time);
    }

    this.player.updateControl(input, deltaSec, time);

    if (time < this.shieldUntil) {
      this.player.setTint(0xa4f3ff);
      this.updateShieldAura(time);
    } else if (!this.player.isInvulnerable(time)) {
      this.player.clearTint();
    }

    this.foods.children.each((entry) => {
      (entry as FoodItem).update(time);
      return true;
    });

    this.predators.children.each((entry) => {
      const predator = entry as FlashPredator;
      predator.updateBehavior(time, this.player, (projectile) => {
        this.enqueueEnemyProjectile(projectile);
      });
      return true;
    });

    const bossPhasePullMultiplier = this.boss && this.boss.isAlive() ? (this.boss.getPhase() === 1 ? 1 : this.boss.getPhase() === 2 ? 1.35 : 1.75) : 1;
    const bloomPullMultiplier = time < this.bloomActiveUntil ? 0.22 : 1;
    this.wormholes.children.each((entry) => {
      const hole = entry as Wormhole;
      hole.setPullScale(this.difficulty.wormholePullMultiplier * bossPhasePullMultiplier * bloomPullMultiplier);
      if (time < this.bloomActiveUntil) {
        hole.suppressShots(this.bloomActiveUntil);
      }
      hole.updateBehavior(time, this.player, (projectile) => {
        this.enqueueEnemyProjectile(projectile);
        this.audioSystem.playWormholePulse();
      });
      hole.pullTarget(this.player, deltaSec);
      return true;
    });

    if (!this.bossSpawned) {
      this.trySpawnBoss();
    }

    if (this.boss && this.boss.isAlive()) {
      this.boss.updateBehavior(time, this.player, {
        spawnProjectile: (projectile) => this.enqueueEnemyProjectile(projectile),
        spawnAdds: (phase) => this.spawnBossAdds(phase),
      });
      this.hud.updateBoss(true, this.boss.getHpRatio(), this.boss.getPhase());
    } else {
      this.hud.updateBoss(false, 1, 1);
    }

    this.projectiles.children.each((entry) => {
      const projectile = entry as Projectile;
      if (projectile.isOutOfBounds(this.levelWidth)) {
        projectile.destroy();
      }
      return true;
    });

    this.glitterShots.children.each((entry) => {
      const shot = entry as GlitterShot;
      if (shot.isOutOfBounds(this.levelWidth)) {
        shot.destroy();
      }
      return true;
    });

    this.pickups.children.each((entry) => {
      const pickup = entry as SeedPickup;
      const expiresAt = Number(pickup.getData("expiresAt") ?? 0);
      if (expiresAt > 0 && time >= expiresAt) {
        pickup.destroy();
      }
      return true;
    });

    this.updateCheckpoints(time);
    this.updateExitGateVisual();

    this.hud.updateHealth(this.player.getHealthRatio());
    this.hud.updateQuota(this.collected, this.effectiveQuota);
    this.hud.updateEconomy(this.livesRemaining, this.seedCount, this.universeSeedCount, this.bloomMeter);
    this.hud.updateCheckpointCost(this.checkpointCost);
    this.hud.updateCombo(this.comboSystem.getPendingTapCount(time));

    if (this.timeLeftSec !== null) {
      this.timeLeftSec -= deltaSec;
      this.hud.updateTimer(this.timeLeftSec);
      if (this.timeLeftSec <= 0) {
        this.handleGameOver("Time expired");
      }
    } else {
      this.hud.updateTimer(null);
    }
  }

  getDebugSnapshot(): LevelDebugSnapshot {
    const now = this.time.now;
    const body = this.player.body as Phaser.Physics.Arcade.Body | null;

    let projectilesEnemy = 0;
    let projectilesPlayer = 0;
    this.projectiles.children.each((entry) => {
      const projectile = entry as Projectile;
      if (!projectile.active) {
        return true;
      }
      if (projectile.owner === "enemy") {
        projectilesEnemy += 1;
      } else {
        projectilesPlayer += 1;
      }
      return true;
    });

    const longFrameRatio = this.debugUpdateCount > 0 ? this.debugLongFrameCount / this.debugUpdateCount : 0;
    const sustainedStallDetected = this.debugWorstConsecutiveStallFrames >= 4 || longFrameRatio >= 0.35;

    return {
      coordinateSystem: "origin top-left, +x right, +y down",
      scene: "LevelScene",
      levelId: this.level.id,
      nowMs: now,
      completed: this.completed,
      player: {
        x: this.player.x,
        y: this.player.y,
        velocityX: body?.velocity.x ?? 0,
        velocityY: body?.velocity.y ?? 0,
        facingDirection: this.player.getFacingDirection(),
        health: this.player.health,
        maxHealth: this.player.maxHealth,
      },
      objective: {
        collected: this.collected,
        quota: this.effectiveQuota,
        timeLeftSec: this.timeLeftSec,
      },
      economy: {
        livesRemaining: this.livesRemaining,
        seedCount: this.seedCount,
        universeSeedCount: this.universeSeedCount,
        bloomMeter: this.bloomMeter,
        checkpointCost: this.checkpointCost,
        checkpointCursor: this.checkpointCursor,
        currentCheckpoint: {
          x: this.currentCheckpoint.x,
          y: this.currentCheckpoint.y,
        },
      },
      spaceCombat: {
        pendingComboTaps: this.comboSystem.getPendingTapCount(now),
        lastResolvedAction: this.lastResolvedSpaceAction,
        lastResolvedActionAt: this.lastResolvedSpaceActionAt,
        lastBlockedReason: this.lastBlockedSpaceActionReason,
        lastBlockedAt: this.lastBlockedSpaceActionAt,
        holdShotIntervalMs: this.holdShotIntervalMs,
        nextHoldShotInMs: Math.max(0, this.nextHoldShotAt - now),
      },
      entities: {
        foods: this.foods.countActive(true),
        predators: this.predators.countActive(true),
        wormholes: this.wormholes.countActive(true),
        projectilesEnemy,
        projectilesPlayer,
        projectilesTotal: projectilesEnemy + projectilesPlayer,
        glitterShots: this.glitterShots.countActive(true),
        pickups: this.pickups.countActive(true),
        bossAlive: Boolean(this.boss && this.boss.isAlive()),
        bossHpRatio: this.boss && this.boss.isAlive() ? this.boss.getHpRatio() : null,
        bossPhase: this.boss && this.boss.isAlive() ? this.boss.getPhase() : null,
      },
      statusWindows: {
        shieldRemainingMs: Math.max(0, this.shieldUntil - now),
        bloomRemainingMs: Math.max(0, this.bloomActiveUntil - now),
      },
      freezeDiagnostics: {
        maxDeltaMs: this.debugMaxDeltaMs,
        longFrameCount: this.debugLongFrameCount,
        updateCount: this.debugUpdateCount,
        consecutiveStallFrames: this.debugConsecutiveStallFrames,
        worstConsecutiveStallFrames: this.debugWorstConsecutiveStallFrames,
        sustainedStallDetected,
      },
      inputDebug: this.inputSystem.getDebugSnapshot(),
      audioDebug: this.audioSystem.getDebugSnapshot(),
    };
  }

  private bindOverlaps(): void {
    this.physics.add.overlap(this.player, this.foods, (_, target) => {
      const food = target as FoodItem;
      this.handleFoodCollected(food);
      food.destroy();
    });

    this.physics.add.overlap(this.player, this.hazards, (_, target) => {
      const hazard = target as Phaser.Physics.Arcade.Sprite;
      const damage = Number(hazard.getData("hazardDamage") ?? DAMAGE.hazardTouch);
      this.applyHazardDamage(damage);
    });

    this.physics.add.overlap(this.player, this.exitGate, () => {
      this.handleExitTouched();
    });

    this.physics.add.overlap(this.player, this.wormholes, (_, target) => {
      const wormhole = target as Wormhole;
      if (wormhole.isInsideCore(this.player)) {
        this.applyPlayerDamage(DAMAGE.wormholeCoreReset);
      }
    });

    this.physics.add.overlap(this.player, this.projectiles, (_, target) => {
      this.handleProjectileOnPlayer(target as Projectile);
    });

    this.physics.add.overlap(this.player, this.pickups, (_, target) => {
      const pickup = target as SeedPickup;
      this.collectPickup(pickup);
      pickup.destroy();
    });

    this.physics.add.overlap(this.glitterShots, this.predators, (shotObj, predatorObj) => {
      const shot = shotObj as GlitterShot;
      const predator = predatorObj as FlashPredator;
      const dead = predator.applyDamage(shot.damage);
      if (dead) {
        this.seedCount += 2;
      }
      shot.destroy();
    });

    this.physics.add.overlap(this.glitterShots, this.projectiles, (shotObj, projectileObj) => {
      const shot = shotObj as GlitterShot;
      const projectile = projectileObj as Projectile;
      if (projectile.owner !== "enemy") {
        return;
      }
      shot.destroy();
      projectile.destroy();
    });

    this.physics.add.overlap(this.glitterShots, this.wormholes, (shotObj) => {
      (shotObj as GlitterShot).destroy();
    });

    this.physics.add.overlap(this.projectiles, this.predators, (projectileObj, predatorObj) => {
      const projectile = projectileObj as Projectile;
      if (projectile.owner !== "player") {
        return;
      }
      const predator = predatorObj as FlashPredator;
      predator.applyDamage(Math.max(20, projectile.damage));
      projectile.destroy();
    });
  }

  private executeComboAction(action: GlitterComboAction, time: number): void {
    if (action === "shot") {
      if (time < this.nextTapShotAt) {
        this.lastBlockedSpaceActionReason = "shot_cooldown";
        this.lastBlockedSpaceActionAt = time;
        return;
      }
      this.nextTapShotAt = time + 80;
      this.fireGlitterShot();
      this.audioSystem.playGlitterShot();
      this.lastResolvedSpaceAction = "shot";
      this.lastResolvedSpaceActionAt = time;
      this.lastBlockedSpaceActionReason = null;
      return;
    }

    if (action === "bomb") {
      if (time < this.nextBombAt) {
        this.lastBlockedSpaceActionReason = "bomb_cooldown";
        this.lastBlockedSpaceActionAt = time;
        this.flashCombatHint("Bomb recharging", time);
        return;
      }
      this.nextBombAt = time + 620;
      this.triggerGlitterBomb(220, 48, 1400, time);
      this.hud.flashCheckpoint("Glitter Bomb");
      this.audioSystem.playAbility();
      this.cameras.main.shake(110, 0.0042);
      this.lastResolvedSpaceAction = "bomb";
      this.lastResolvedSpaceActionAt = time;
      this.lastBlockedSpaceActionReason = null;
      return;
    }

    if (time < this.nextShieldCastAt) {
      this.lastBlockedSpaceActionReason = "shield_cooldown";
      this.lastBlockedSpaceActionAt = time;
      this.flashCombatHint("Shield recharging", time);
      return;
    }
    this.nextShieldCastAt = time + 2600;
    this.activateShield(time);
    this.audioSystem.playAbility();
    this.cameras.main.shake(70, 0.0024);
    this.lastResolvedSpaceAction = "shield";
    this.lastResolvedSpaceActionAt = time;
    this.lastBlockedSpaceActionReason = null;
  }

  private flashCombatHint(label: string, time: number): void {
    if (time < this.nextCombatHintAt) {
      return;
    }
    this.nextCombatHintAt = time + 260;
    this.hud.flashCheckpoint(label);
  }

  private fireGlitterShot(options: GlitterShotOptions = {}): void {
    const damage = options.damage ?? 44;
    const speed = options.speed ?? 930;
    const flashColor = options.flashColor ?? 0xd4ffff;
    const flashAlpha = options.flashAlpha ?? 0.75;
    const flashRadius = options.flashRadius ?? 8;
    const flashDurationMs = options.flashDurationMs ?? 120;
    const shotScale = options.shotScale ?? 2;
    const showFlash = options.showFlash ?? true;

    let dirX = options.directionX ?? this.player.getFacingDirection();
    let dirY = options.directionY ?? 0;

    if (options.directionX === undefined || options.directionY === undefined) {
      const target = this.findNearestTarget();
      if (target) {
        const dx = target.x - this.player.x;
        const dy = target.y - this.player.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        dirX = dx / distance;
        dirY = dy / distance;
      }
    }

    const shot = new GlitterShot(
      this,
      this.player.x + dirX * 20,
      this.player.y + dirY * 12,
      dirX * speed,
      dirY * speed,
      damage,
    );
    shot.setScale(shotScale);
    this.ensureGroupCapacity(this.glitterShots, this.maxGlitterShots);
    this.glitterShots.add(shot);

    if (showFlash && this.time.now >= this.nextShotFlashAt) {
      this.nextShotFlashAt = this.time.now + this.shotFlashIntervalMs;
      const flash = this.add.circle(this.player.x + dirX * 10, this.player.y + dirY * 6, flashRadius, flashColor, flashAlpha);
      flash.setDepth(16);
      this.tweens.add({
        targets: flash,
        alpha: 0,
        scale: 2.1,
        duration: flashDurationMs,
        onComplete: () => flash.destroy(),
      });
    }
  }

  private updateSpaceHoldFire(spaceHeld: boolean, spaceTapped: boolean, time: number): void {
    if (!spaceHeld) {
      this.nextHoldShotAt = 0;
      this.holdVolleyCharge = 0;
      return;
    }

    if (spaceTapped) {
      this.nextHoldShotAt = time + this.holdShotIntervalMs;
      return;
    }

    if (this.nextHoldShotAt === 0) {
      this.nextHoldShotAt = time;
    }

    if (time < this.nextHoldShotAt) {
      return;
    }

    this.fireGlitterShot({
      damage: 26,
      speed: 860,
      shotScale: 1.7,
      showFlash: false,
    });
    this.audioSystem.playGlitterShot();

    this.holdVolleyCharge += 1;
    if (this.holdVolleyCharge >= 5) {
      this.fireArcVolley(20, 700, 0.24);
      this.holdVolleyCharge = 0;
    }
    this.nextHoldShotAt = time + this.holdShotIntervalMs;
  }

  private fireArcVolley(damage: number, speed: number, spread: number): void {
    const target = this.findNearestTarget();
    let baseX = this.player.getFacingDirection();
    let baseY = 0;
    if (target) {
      const dx = target.x - this.player.x;
      const dy = target.y - this.player.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      baseX = dx / distance;
      baseY = dy / distance;
    }

    const baseAngle = Math.atan2(baseY, baseX);
    for (const offset of [-spread, spread]) {
      const angle = baseAngle + offset;
      const dirX = Math.cos(angle);
      const dirY = Math.sin(angle);
      this.fireGlitterShot({
        damage,
        speed,
        shotScale: 1.55,
        showFlash: false,
        directionX: dirX,
        directionY: dirY,
      });
      const children = this.glitterShots.getChildren();
      const latestShot = (children[children.length - 1] as GlitterShot | undefined) ?? undefined;
      if (latestShot?.active) {
        latestShot.setVelocity(dirX * speed, dirY * speed);
      }
    }
  }

  private triggerGlitterBomb(radius: number, damage: number, stunMs: number, time: number): void {
    const x = this.player.x;
    const y = this.player.y;

    const ring = this.add.circle(x, y, 20, 0xb7f6ff, 0.2);
    ring.setStrokeStyle(4, 0xdbfbff, 0.8);
    ring.setDepth(20);
    this.tweens.add({
      targets: ring,
      radius,
      alpha: 0,
      duration: 220,
      onComplete: () => ring.destroy(),
    });

    let popped = 0;

    this.projectiles.children.each((entry) => {
      const projectile = entry as Projectile;
      if (projectile.owner !== "enemy") {
        return true;
      }
      const distance = Phaser.Math.Distance.Between(x, y, projectile.x, projectile.y);
      if (distance <= radius) {
        projectile.destroy();
        popped += 1;
      }
      return true;
    });

    this.predators.children.each((entry) => {
      const predator = entry as FlashPredator;
      const distance = Phaser.Math.Distance.Between(x, y, predator.x, predator.y);
      if (distance <= radius + 30) {
        predator.stun(stunMs, time);
        const dx = predator.x - x;
        const dy = predator.y - y;
        const len = Math.max(1, Math.hypot(dx, dy));
        const dead = predator.applyDamage(damage);
        if (!dead && predator.active) {
          predator.setVelocity((dx / len) * 330, (dy / len) * 330);
        }
      }
      return true;
    });

    if (this.boss && this.boss.isAlive()) {
      const distance = Phaser.Math.Distance.Between(x, y, this.boss.x, this.boss.y);
      if (distance <= radius + 70) {
        this.boss.stun(900, time);
        this.boss.applyDamage(220, time);
      }
    }

    if (popped > 0) {
      this.hud.flashCheckpoint(`Bomb popped ${popped}`);
    }
  }

  private activateShield(time: number): void {
    this.shieldUntil = Math.max(this.shieldUntil, time + 2300);
    this.nextShieldPulseAt = time;

    const x = this.player.x;
    const y = this.player.y;
    const radius = 210;
    let reflected = 0;

    const ring = this.add.circle(x, y, 20, 0xbdefff, 0.2);
    ring.setStrokeStyle(4, 0xe7fdff, 0.82);
    ring.setDepth(20);
    this.tweens.add({
      targets: ring,
      radius,
      alpha: 0,
      duration: 240,
      onComplete: () => ring.destroy(),
    });

    this.projectiles.children.each((entry) => {
      const projectile = entry as Projectile;
      if (projectile.owner !== "enemy") {
        return true;
      }
      const distance = Phaser.Math.Distance.Between(x, y, projectile.x, projectile.y);
      if (distance <= radius) {
        projectile.reflectFrom(x, y, 1.35);
        projectile.setData("shieldIgnoreUntil", time + 90);
        reflected += 1;
      }
      return true;
    });

    this.hud.flashCheckpoint(reflected > 0 ? `Glitter Shield reflected ${reflected}` : "Glitter Shield");
  }

  private tryActivateUniverseBloom(time: number): void {
    if (this.bloomMeter < 100) {
      this.hud.flashCheckpoint("Universe Bloom needs full meter");
      return;
    }

    this.bloomMeter = 0;
    this.bloomActiveUntil = time + 2300;
    this.shieldUntil = Math.max(this.shieldUntil, time + 1300);
    this.nextShieldPulseAt = Math.min(this.nextShieldPulseAt, time + 60);

    let cleared = 0;
    this.projectiles.children.each((entry) => {
      const projectile = entry as Projectile;
      if (projectile.owner === "enemy") {
        projectile.destroy();
        cleared += 1;
      }
      return true;
    });

    this.predators.children.each((entry) => {
      const predator = entry as FlashPredator;
      predator.stun(2200, time);
      predator.applyDamage(24);
      return true;
    });

    this.wormholes.children.each((entry) => {
      (entry as Wormhole).suppressShots(this.bloomActiveUntil);
      return true;
    });

    if (this.boss && this.boss.isAlive()) {
      this.boss.stun(1900, time);
      this.boss.applyDamage(520, time);
    }

    this.audioSystem.playAbility();
    this.hud.flashCheckpoint(`Universe Bloom! Cleared ${cleared}`);
  }

  private handleFoodCollected(food: FoodItem): void {
    this.collected += 1;
    this.seedCount += 1;
    this.bloomMeter = Math.min(100, this.bloomMeter + 1.8);

    this.events.emit(GAME_EVENTS.QUOTA_PROGRESS, {
      collected: this.collected,
      quota: this.effectiveQuota,
    });

    this.audioSystem.playEat();
    this.maybeDropPickup(food.x, food.y);
  }

  private maybeDropPickup(x: number, y: number): void {
    const roll = Math.random();
    let pickupType: SeedPickup["pickupType"] | null = null;
    if (roll < 0.03) {
      pickupType = "life";
    } else if (roll < 0.12) {
      pickupType = "universe_seed";
    } else if (roll < 0.46) {
      pickupType = "seed";
    }

    if (!pickupType) {
      return;
    }

    const pickup = new SeedPickup(
      this,
      x + Phaser.Math.Between(-20, 20),
      y + Phaser.Math.Between(-20, 20),
      pickupType,
    );
    pickup.setData("expiresAt", this.time.now + 14000);
    this.pickups.add(pickup);
  }

  private collectPickup(pickup: SeedPickup): void {
    if (pickup.pickupType === "seed") {
      this.seedCount += 3;
      this.hud.flashCheckpoint("+3 Seeds");
      return;
    }

    if (pickup.pickupType === "universe_seed") {
      this.universeSeedCount += 1;
      this.bloomMeter = Math.min(100, this.bloomMeter + 34);
      this.hud.flashCheckpoint("Universe Seed + Bloom");
      return;
    }

    this.livesRemaining = Math.min(9, this.livesRemaining + 1);
    this.hud.flashCheckpoint("+1 Life");
  }

  private handleProjectileOnPlayer(projectile: Projectile): void {
    if (projectile.owner === "player") {
      return;
    }

    if (this.time.now < this.shieldUntil) {
      const ignoreUntil = Number(projectile.getData("shieldIgnoreUntil") ?? 0);
      if (this.time.now < ignoreUntil) {
        return;
      }
      projectile.reflectFrom(this.player.x, this.player.y);
      projectile.setData("shieldIgnoreUntil", this.time.now + 90);
      return;
    }

    this.applyPlayerDamage(projectile.damage);
    projectile.destroy();
  }

  private applyHazardDamage(amount: number): void {
    const now = this.time.now;
    if (now - this.lastHazardDamageAt < 360) {
      return;
    }
    this.lastHazardDamageAt = now;
    this.applyPlayerDamage(amount);
  }

  private applyPlayerDamage(amount: number): void {
    const now = this.time.now;
    if (now < this.shieldUntil) {
      return;
    }

    const applied = this.player.takeDamage(amount, now);
    if (!applied) {
      return;
    }

    this.events.emit(GAME_EVENTS.PLAYER_DAMAGED, { amount, health: this.player.health });
    this.audioSystem.playHit();

    if (this.player.health <= 0 || amount >= DAMAGE.wormholeCoreReset) {
      this.livesRemaining -= 1;
      this.deaths += 1;

      if (this.livesRemaining <= 0) {
        this.handleGameOver("Out of lives");
        return;
      }

      this.player.respawnAt(this.currentCheckpoint.x, this.currentCheckpoint.y, now);
      this.shieldUntil = now + 1000;
      this.hud.flashCheckpoint(`Respawn! Lives left: ${this.livesRemaining}`);
      this.setDomFlag("loopyRespawnCount", String(this.deaths));
    }
  }

  private updateCheckpoints(time: number): void {
    const nextCheckpointX = this.level.checkpointX[this.checkpointCursor];
    if (!nextCheckpointX) {
      return;
    }

    if (this.player.x < nextCheckpointX) {
      return;
    }

    if (this.seedCount >= this.checkpointCost) {
      this.seedCount -= this.checkpointCost;
      this.currentCheckpoint = { x: nextCheckpointX, y: this.level.playerStart.y };
      this.checkpointCursor += 1;
      this.events.emit(GAME_EVENTS.CHECKPOINT_REACHED, {
        levelId: this.level.id,
        checkpointX: nextCheckpointX,
      });
      this.setDomFlag("loopyLastCheckpointX", String(nextCheckpointX));
      this.audioSystem.playCheckpoint();
      this.hud.flashCheckpoint(`Checkpoint purchased (-${this.checkpointCost})`);
      return;
    }

    if (time - this.lastCheckpointHintAt > 1200) {
      this.hud.flashCheckpoint(`Need ${this.checkpointCost} seeds for checkpoint`);
      this.lastCheckpointHintAt = time;
    }
  }

  private updateExitGateVisual(): void {
    const quotaReady = this.collected >= this.effectiveQuota;
    const bossReady = !this.bossSpawned || !this.boss || !this.boss.isAlive();

    if (quotaReady && bossReady) {
      this.exitGate.clearTint();
      this.exitGate.setAlpha(1);
    } else {
      this.exitGate.setAlpha(0.85);
      this.exitGate.setTint(0x666666);
    }
  }

  private handleExitTouched(): void {
    if (this.collected < this.effectiveQuota) {
      const now = this.time.now;
      if (now - this.lastExitHintAt > 1200) {
        const needed = this.effectiveQuota - this.collected;
        this.hud.flashCheckpoint(`Need ${needed} more food`);
        this.audioSystem.playPortalPulse();
        this.lastExitHintAt = now;
      }
      return;
    }

    if (this.bossSpawned && this.boss && this.boss.isAlive()) {
      this.hud.flashCheckpoint("Defeat the Arcane Boss core");
      return;
    }

    this.completeLevel();
  }

  private trySpawnBoss(): void {
    if (this.level.id !== 16 || this.bossSpawned) {
      return;
    }

    if (this.collected < Math.floor(this.effectiveQuota * 0.65)) {
      return;
    }

    this.bossSpawned = true;
    this.boss = new ArcaneBoss(this, this.level.exitGateX - 280, 220);
    this.hud.flashCheckpoint("Arcane Boss awakened");

    this.physics.add.overlap(this.player, this.boss, () => {
      this.applyPlayerDamage(DAMAGE.predatorContact + 10);
    });
    this.physics.add.overlap(this.glitterShots, this.boss, (shotObj, bossObj) => {
      const shot = shotObj as GlitterShot;
      const boss = bossObj as ArcaneBoss;
      boss.applyDamage(shot.damage, this.time.now);
      shot.destroy();
    });
    this.physics.add.overlap(this.projectiles, this.boss, (projectileObj, bossObj) => {
      const projectile = projectileObj as Projectile;
      if (projectile.owner !== "player") {
        return;
      }
      const boss = bossObj as ArcaneBoss;
      boss.applyDamage(Math.max(20, projectile.damage), this.time.now);
      projectile.destroy();
    });

    const supportHole = new Wormhole(this, this.level.exitGateX - 480, 300, {
      pullRadius: 230,
      pullStrength: Math.round(680 * this.difficulty.wormholePullMultiplier),
      shootIntervalMs: Math.round(1250 * this.difficulty.wormholeShootIntervalMultiplier),
      projectileSpeed: Math.round(300 * this.difficulty.projectileSpeedMultiplier),
    });
    this.wormholes.add(supportHole);
  }

  private spawnBossAdds(phase: 1 | 2 | 3): void {
    const addCount = phase === 2 ? 1 : 2;
    for (let i = 0; i < addCount; i += 1) {
      const enemy = new FlashPredator(this, this.level.exitGateX - 380 + i * 80, 180 + i * 80, {
        speed: Math.round(170 * this.difficulty.predatorSpeedMultiplier),
        shootIntervalMs: Math.max(300, Math.round(980 * this.difficulty.predatorShootIntervalMultiplier)),
        projectileSpeed: Math.round(360 * this.difficulty.projectileSpeedMultiplier),
        hp: 90,
        shotPattern: phase === 3 ? "burst" : "spread",
      });
      this.predators.add(enemy);
    }
  }

  private updateShieldAura(time: number): void {
    if (time < this.nextShieldPulseAt) {
      return;
    }
    this.nextShieldPulseAt = time + 220;

    const radius = 132;
    let reflected = 0;

    this.projectiles.children.each((entry) => {
      const projectile = entry as Projectile;
      if (projectile.owner !== "enemy") {
        return true;
      }
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, projectile.x, projectile.y) > radius) {
        return true;
      }
      projectile.reflectFrom(this.player.x, this.player.y, 1.22);
      projectile.setData("shieldIgnoreUntil", time + 90);
      reflected += 1;
      return true;
    });

    this.predators.children.each((entry) => {
      const predator = entry as FlashPredator;
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, predator.x, predator.y) <= radius + 16) {
        predator.stun(260, time);
        predator.applyDamage(6);
      }
      return true;
    });

    if (reflected > 0) {
      const pulse = this.add.circle(this.player.x, this.player.y, 12, 0xe7fdff, 0.2);
      pulse.setDepth(18);
      this.tweens.add({
        targets: pulse,
        radius,
        alpha: 0,
        duration: 180,
        onComplete: () => pulse.destroy(),
      });
    }
  }

  private enqueueEnemyProjectile(projectile: Projectile): void {
    this.ensureGroupCapacity(this.projectiles, this.maxEnemyProjectiles);
    this.projectiles.add(projectile);
  }

  private ensureGroupCapacity(group: Phaser.Physics.Arcade.Group, maxActive: number): void {
    let active = group.countActive(true);
    if (active < maxActive) {
      return;
    }

    const entries = group.getChildren();
    for (let i = 0; i < entries.length && active >= maxActive; i += 1) {
      const entry = entries[i] as Phaser.GameObjects.GameObject & { active: boolean; destroy: () => void };
      if (!entry.active) {
        continue;
      }
      entry.destroy();
      active -= 1;
    }
  }

  private findNearestTarget(): Phaser.GameObjects.Components.Transform | null {
    let nearest: Phaser.GameObjects.Components.Transform | null = null;
    let bestDistance = 900;

    this.predators.children.each((entry) => {
      const predator = entry as FlashPredator;
      if (!predator.active) {
        return true;
      }
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, predator.x, predator.y);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = predator;
      }
      return true;
    });

    if (this.boss && this.boss.isAlive()) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.boss.x, this.boss.y);
      if (distance < bestDistance) {
        return this.boss;
      }
    }

    return nearest;
  }

  private handleGameOver(reason: string): void {
    if (this.completed) {
      return;
    }

    this.completed = true;
    this.audioSystem.stopMusic();
    this.scene.start("GameOverScene", {
      levelId: this.level.id,
      reason,
    });
  }

  private completeLevel(): void {
    if (this.completed) {
      return;
    }
    this.completed = true;

    const base = this.collected * 110;
    const seedBonus = this.seedCount * 8 + this.universeSeedCount * 55;
    const timeBonus = Math.max(0, Math.floor((this.timeLeftSec ?? 0) * 12));
    const deathPenalty = this.deaths * 85;
    const score = Math.max(0, base + seedBonus + timeBonus - deathPenalty);

    const beforeSave = SaveSystem.load();
    const shouldUnlockAbility =
      this.level.milestone &&
      Boolean(this.level.unlocksAbility) &&
      beforeSave.highestUnlockedLevel <= this.level.id;

    const save = SaveSystem.mergeProgress(this.level.id, score, {
      seedsEarned: this.seedCount,
      universeSeedsEarned: this.universeSeedCount,
      bloomsCast: this.bloomActiveUntil > 0 ? 1 : 0,
    });

    if (shouldUnlockAbility && this.level.unlocksAbility) {
      this.events.emit(GAME_EVENTS.ABILITY_UNLOCKED, this.level.unlocksAbility);
      this.setDomFlag("loopyAbilityUnlocked", this.level.unlocksAbility);
    }

    this.events.emit(GAME_EVENTS.LEVEL_COMPLETED, {
      levelId: this.level.id,
      score,
    });
    this.setDomFlag("loopyLevelCompleted", String(this.level.id));

    this.audioSystem.stopMusic();

    this.time.delayedCall(900, () => {
      if (this.level.id >= 16) {
        const totalScore = Object.values(save.levelBestScores).reduce((acc, value) => acc + value, 0);
        this.scene.start("VictoryScene", { totalScore });
      } else {
        this.scene.start("WorldMapScene", { selectedLevel: Math.min(16, this.level.id + 1) });
      }
    });
  }

  private bindDebugHotkeys(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    keyboard.on("keydown-N", () => {
      this.collected = Math.max(this.collected, this.effectiveQuota);
      if (this.boss && this.boss.isAlive()) {
        this.boss.applyDamage(9_999, this.time.now);
      }
      this.completeLevel();
    });

    keyboard.on("keydown-K", () => {
      this.applyPlayerDamage(DAMAGE.wormholeCoreReset);
    });

    keyboard.on("keydown-C", () => {
      if (this.checkpointCursor >= this.level.checkpointX.length) {
        return;
      }
      const targetX = this.level.checkpointX[this.checkpointCursor];
      this.seedCount = Math.max(this.seedCount, this.checkpointCost);
      this.player.setPosition(targetX + 6, this.player.y);
      this.updateCheckpoints(this.time.now);
    });

    keyboard.on("keydown-B", () => {
      this.bloomMeter = 100;
      this.hud.flashCheckpoint("Universe Bloom charged");
    });
  }

  private createBackground(biome: "jungle" | "desert"): void {
    const skyColor = biome === "jungle" ? 0x1d7367 : 0xc9833a;
    const fogColor = biome === "jungle" ? 0x50d3a8 : 0xffcf7a;

    this.add.rectangle(this.levelWidth * 0.5, 330, this.levelWidth, 660, skyColor, 1).setDepth(-20);

    for (let i = 0; i < 10; i += 1) {
      const x = 220 + i * (this.levelWidth / 9);
      const y = 130 + (i % 3) * 78;
      const radius = 90 + (i % 4) * 24;
      this.add.circle(x, y, radius, fogColor, 0.24).setDepth(-15);
    }

    for (let i = 0; i < 80; i += 1) {
      const x = Phaser.Math.Between(20, this.levelWidth - 20);
      const y = Phaser.Math.Between(40, 260);
      const sparkleColor = biome === "jungle" ? 0xcffff2 : 0xfff0c3;
      this.add.rectangle(x, y, 2, 2, sparkleColor, 0.35).setDepth(-12);
    }

    const groundColor = biome === "jungle" ? 0x1d7f5b : 0xc58a47;
    this.add.rectangle(this.levelWidth * 0.5, 620, this.levelWidth, 80, groundColor, 0.9).setDepth(-5);

    for (let i = 0; i < 70; i += 1) {
      const x = i * (this.levelWidth / 70) + Phaser.Math.Between(-10, 10);
      const y = Phaser.Math.Between(560, 620);
      const color = biome === "jungle" ? 0x69f6a1 : 0xffd07f;
      this.add.rectangle(x, y, Phaser.Math.Between(4, 10), Phaser.Math.Between(16, 28), color, 0.82).setDepth(-2);
    }
  }

  private setDomFlag(key: string, value: string): void {
    if (typeof document === "undefined") {
      return;
    }
    document.body.dataset[key] = value;
  }
}
