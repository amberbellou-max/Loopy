import Phaser from "phaser";
import { ArcaneTotem } from "../entities/ArcaneTotem";
import { FoodItem } from "../entities/FoodItem";
import { FlashPredator } from "../entities/FlashPredator";
import { OceanWormhole } from "../entities/OceanWormhole";
import { RiftSkimmer } from "../entities/RiftSkimmer";
import { SerpentStalker } from "../entities/SerpentStalker";
import { Wormhole } from "../entities/Wormhole";
import type { FoodSpawnRule, HazardRule, LevelDefinition } from "../types/gameTypes";
import type { DifficultyParams } from "./difficulty";

export interface SpawnedLevelObjects {
  foods: Phaser.Physics.Arcade.Group;
  predators: Phaser.Physics.Arcade.Group;
  wormholes: Phaser.Physics.Arcade.Group;
  hazards: Phaser.Physics.Arcade.StaticGroup;
  exitGate: Phaser.Physics.Arcade.Sprite;
}

export class SpawnSystem {
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  spawnLevel(level: LevelDefinition, difficulty: DifficultyParams): SpawnedLevelObjects {
    const foods = this.scene.physics.add.group();
    for (const rule of level.foods) {
      if (rule.movement === "orbit") {
        this.spawnOrbitFoodRule(foods, rule);
        continue;
      }
      for (let i = 0; i < rule.count; i += 1) {
        const x = rule.x + Phaser.Math.Between(-rule.spreadX, rule.spreadX);
        const y = rule.y + Phaser.Math.Between(-rule.spreadY, rule.spreadY);
        const item = new FoodItem(this.scene, x, y, rule.foodType, rule.movement);
        foods.add(item);
      }
    }

    const predators = this.scene.physics.add.group();
    let remainingExtraPredators = difficulty.extraPredators;
    for (const rule of level.predators) {
      const extraForRule = remainingExtraPredators > 0 ? 1 : 0;
      remainingExtraPredators = Math.max(0, remainingExtraPredators - extraForRule);
      const totalCount = rule.count + extraForRule;
      for (let i = 0; i < totalCount; i += 1) {
        const pattern = difficulty.levelId >= 13 ? (i % 2 === 0 ? "burst" : "spread") : difficulty.levelId >= 9 ? "spread" : "single";
        const enemy = new FlashPredator(this.scene, rule.x + i * rule.spacing, rule.y, {
          speed: Math.round(rule.speed * difficulty.predatorSpeedMultiplier),
          shootIntervalMs: Math.max(360, Math.round(rule.shootIntervalMs * difficulty.predatorShootIntervalMultiplier)),
          projectileSpeed: Math.round(rule.projectileSpeed * difficulty.projectileSpeedMultiplier),
          hp: 56 + difficulty.levelId * 8,
          shotPattern: pattern,
        });
        predators.add(enemy);
      }
    }

    while (remainingExtraPredators > 0) {
      remainingExtraPredators -= 1;
      const spawnX = Phaser.Math.Between(600, level.exitGateX - 260);
      const spawnY = Phaser.Math.Between(170, 460);
      predators.add(
        new FlashPredator(this.scene, spawnX, spawnY, {
          speed: Math.round(130 * difficulty.predatorSpeedMultiplier),
          shootIntervalMs: Math.max(320, Math.round(1200 * difficulty.predatorShootIntervalMultiplier)),
          projectileSpeed: Math.round(320 * difficulty.projectileSpeedMultiplier),
          hp: 60 + difficulty.levelId * 8,
          shotPattern: difficulty.levelId >= 12 ? "burst" : "spread",
        }),
      );
    }

    const skimmerCount = level.id >= 3 ? Math.min(3, 1 + Math.floor((level.id - 3) / 4)) : 0;
    for (let i = 0; i < skimmerCount; i += 1) {
      const baseRatio = 0.36 + i * 0.2;
      const x = Phaser.Math.Clamp(level.exitGateX * baseRatio, 760, level.exitGateX - 430);
      const y = 200 + (i % 2) * 120;
      predators.add(
        new RiftSkimmer(this.scene, x, y, {
          speed: Math.round(120 * difficulty.predatorSpeedMultiplier),
          shootIntervalMs: Math.max(500, Math.round(1600 * difficulty.predatorShootIntervalMultiplier)),
          projectileSpeed: Math.round(315 * difficulty.projectileSpeedMultiplier),
          hp: 64 + difficulty.levelId * 9,
          shotPattern: "spread",
        }),
      );
    }

    const totemCount = level.id >= 4 ? 1 + (level.id >= 10 ? 1 : 0) + (level.id >= 15 ? 1 : 0) : 0;
    for (let i = 0; i < totemCount; i += 1) {
      const baseRatio = 0.5 + i * 0.16;
      const x = Phaser.Math.Clamp(level.exitGateX * baseRatio, 1050, level.exitGateX - 260);
      const y = 240 + (i % 2) * 120;
      const totemHp = level.id <= 6 ? 78 + difficulty.levelId * 6 : 96 + difficulty.levelId * 10;
      const totemShootBase = level.id <= 6 ? 2050 : 1700;
      const totemShootFloor = level.id <= 6 ? 760 : 560;
      predators.add(
        new ArcaneTotem(this.scene, x, y, {
          speed: 0,
          shootIntervalMs: Math.max(totemShootFloor, Math.round(totemShootBase * difficulty.predatorShootIntervalMultiplier)),
          projectileSpeed: Math.round((level.id <= 6 ? 255 : 280) * difficulty.projectileSpeedMultiplier),
          hp: totemHp,
          shotPattern: "single",
        }),
      );
    }

    const snakeCount = level.id >= 5 ? 1 + (level.id >= 10 ? 1 : 0) + (level.id >= 14 ? 1 : 0) : 0;
    for (let i = 0; i < snakeCount; i += 1) {
      const x = Phaser.Math.Clamp(level.exitGateX * (0.28 + i * 0.23), 820, level.exitGateX - 360);
      const y = 220 + (i % 2) * 110;
      predators.add(
        new SerpentStalker(this.scene, x, y, {
          speed: Math.round(150 * difficulty.predatorSpeedMultiplier),
          shootIntervalMs: Math.max(680, Math.round(1800 * difficulty.predatorShootIntervalMultiplier)),
          projectileSpeed: Math.round(300 * difficulty.projectileSpeedMultiplier),
          hp: 72 + difficulty.levelId * 9,
          tailSegments: 6 + difficulty.tier,
          tailSpacing: 6,
          shotPattern: "single",
        }),
      );
    }

    const wormholes = this.scene.physics.add.group();
    for (const rule of level.wormholes) {
      const hole = new Wormhole(this.scene, rule.x, rule.y, {
        pullRadius: rule.pullRadius,
        pullStrength: Math.round(rule.pullStrength * difficulty.wormholePullMultiplier),
        shootIntervalMs: Math.max(700, Math.round(rule.shootIntervalMs * difficulty.wormholeShootIntervalMultiplier)),
        projectileSpeed: Math.round(rule.projectileSpeed * difficulty.projectileSpeedMultiplier),
      });
      wormholes.add(hole);

      const aura = this.scene.add.circle(rule.x, rule.y, rule.pullRadius, 0x6d5df6, 0.07);
      aura.setDepth(2);
      this.scene.tweens.add({
        targets: aura,
        alpha: { from: 0.05, to: 0.15 },
        duration: 1100,
        yoyo: true,
        loop: -1,
      });
    }

    const oceanWormholeCount = level.id >= 3 ? 1 + (level.id >= 9 ? 1 : 0) + (level.id >= 15 ? 1 : 0) : 0;
    for (let i = 0; i < oceanWormholeCount; i += 1) {
      const x = Phaser.Math.Clamp(level.exitGateX * (0.44 + i * 0.2), 960, level.exitGateX - 300);
      const y = 240 + (i % 2) * 120;
      const pullRadius = Phaser.Math.Clamp(190 + difficulty.tier * 15, 190, 260);
      const oceanHole = new OceanWormhole(this.scene, x, y, {
        pullRadius,
        pullStrength: Math.round((680 + difficulty.levelId * 24) * difficulty.wormholePullMultiplier),
        shootIntervalMs: Math.max(760, Math.round(2050 * difficulty.wormholeShootIntervalMultiplier)),
        projectileSpeed: Math.round(260 * difficulty.projectileSpeedMultiplier),
        trapRadius: Math.round(pullRadius * 0.48),
        escapeTapGoal: 3 + difficulty.tier + (level.id >= 10 ? 1 : 0),
      });
      wormholes.add(oceanHole);

      const aura = this.scene.add.circle(x, y, pullRadius, 0x2f8eff, 0.09);
      aura.setDepth(2);
      this.scene.tweens.add({
        targets: aura,
        alpha: { from: 0.06, to: 0.2 },
        duration: 760,
        yoyo: true,
        loop: -1,
      });
    }

    if (difficulty.extraWormholes > 0) {
      for (let i = 0; i < difficulty.extraWormholes; i += 1) {
        const x = Phaser.Math.Between(900, level.exitGateX - 260);
        const y = Phaser.Math.Between(210, 460);
        const pullRadius = Phaser.Math.Between(170, 220);
        const hole = new Wormhole(this.scene, x, y, {
          pullRadius,
          pullStrength: Math.round((560 + difficulty.levelId * 20) * difficulty.wormholePullMultiplier),
          shootIntervalMs: Math.max(700, Math.round(2100 * difficulty.wormholeShootIntervalMultiplier)),
          projectileSpeed: Math.round(240 * difficulty.projectileSpeedMultiplier),
        });
        wormholes.add(hole);

        const aura = this.scene.add.circle(x, y, pullRadius, 0x6d5df6, 0.07);
        aura.setDepth(2);
        this.scene.tweens.add({
          targets: aura,
          alpha: { from: 0.05, to: 0.14 },
          duration: 920,
          yoyo: true,
          loop: -1,
        });
      }
    }

    const hazards = this.scene.physics.add.staticGroup();
    for (const rule of level.hazards) {
      const sprite = this.spawnHazard(rule);
      hazards.add(sprite);
    }
    for (let i = 0; i < difficulty.extraHazards; i += 1) {
      const x = Phaser.Math.Between(850, level.exitGateX - 240);
      const y = Phaser.Math.Between(180, 500);
      const width = Phaser.Math.Between(120, 210);
      const height = Phaser.Math.Between(20, 34);
      const type = level.biome === "jungle" ? "vine" : "sand_spike";
      const sprite = this.spawnHazard({
        type,
        x,
        y,
        width,
        height,
        damage: 16 + difficulty.tier * 4,
      });
      hazards.add(sprite);
    }

    const gateKey = level.biome === "jungle" ? "exit_gate_jungle" : "exit_gate_desert";
    const exitGate = this.scene.physics.add.sprite(level.exitGateX, 350, gateKey);
    exitGate.setScale(3);
    exitGate.setImmovable(true);
    exitGate.body.setAllowGravity(false);
    exitGate.setDepth(4);
    exitGate.setTint(0x666666);

    return {
      foods,
      predators,
      wormholes,
      hazards,
      exitGate,
    };
  }

  private spawnOrbitFoodRule(foods: Phaser.Physics.Arcade.Group, rule: FoodSpawnRule): void {
    const orbitCount = Math.max(3, rule.count);
    const baseRadius = Phaser.Math.Clamp(Math.max(28, Math.min(rule.spreadX, rule.spreadY) * 0.55), 28, 96);
    const carrierRadius = Phaser.Math.Clamp(Math.max(30, Math.max(rule.spreadX, rule.spreadY) * 0.42), 30, 120);
    const carrierAngularSpeed = Phaser.Math.FloatBetween(0.42, 0.86);
    const carrierPhase = Phaser.Math.FloatBetween(0, Math.PI * 2);

    for (let i = 0; i < orbitCount; i += 1) {
      const orbitPhase = (i / orbitCount) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.16, 0.16);
      const orbitRadius = Phaser.Math.Clamp(baseRadius + Phaser.Math.Between(-9, 9), 24, 104);
      const x = rule.x + Math.cos(orbitPhase) * orbitRadius;
      const y = rule.y + Math.sin(orbitPhase) * orbitRadius * 0.82;
      const item = new FoodItem(this.scene, x, y, rule.foodType, "orbit", {
        orbitRadius,
        orbitAngularSpeed: Phaser.Math.FloatBetween(1.35, 2.25),
        orbitPhase,
        carrierRadius,
        carrierAngularSpeed,
        carrierPhase,
        carrierAspectY: 0.74,
      });
      foods.add(item);
    }
  }

  private spawnHazard(rule: HazardRule): Phaser.Physics.Arcade.Sprite {
    const key = rule.type === "vine" ? "hazard_vine" : "hazard_spike";
    const sprite = this.scene.physics.add.staticSprite(rule.x, rule.y, key);
    sprite.setDisplaySize(rule.width, rule.height);
    sprite.setData("hazardDamage", rule.damage);
    sprite.refreshBody();
    sprite.setDepth(4);
    return sprite;
  }
}
