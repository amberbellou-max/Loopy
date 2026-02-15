import Phaser from "phaser";
import { FoodItem } from "../entities/FoodItem";
import { FlashPredator } from "../entities/FlashPredator";
import { Wormhole } from "../entities/Wormhole";
import type { HazardRule, LevelDefinition } from "../types/gameTypes";
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
