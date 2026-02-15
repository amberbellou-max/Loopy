import Phaser from "phaser";
import { FoodItem } from "../entities/FoodItem";
import { Projectile } from "../entities/Projectile";
import { Wormhole } from "../entities/Wormhole";
import { PlayerFishFairy } from "../entities/PlayerFishFairy";
import { DAMAGE } from "../data/balance";

export interface CollisionHooks {
  onFoodCollected: (food: FoodItem) => void;
  onPlayerDamaged: (amount: number) => void;
  onHazardTouched: (amount: number) => void;
  onExitTouched: () => void;
}

export interface CollisionGroupRefs {
  player: PlayerFishFairy;
  foods: Phaser.Physics.Arcade.Group;
  projectiles: Phaser.Physics.Arcade.Group;
  predators: Phaser.Physics.Arcade.Group;
  wormholes: Phaser.Physics.Arcade.Group;
  hazards: Phaser.Physics.Arcade.StaticGroup;
  exitGate: Phaser.Physics.Arcade.Sprite;
}

export class CollisionSystem {
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  bind(groups: CollisionGroupRefs, hooks: CollisionHooks): void {
    this.scene.physics.add.overlap(groups.player, groups.foods, (_, target) => {
      const food = target as FoodItem;
      hooks.onFoodCollected(food);
      food.destroy();
    });

    this.scene.physics.add.overlap(groups.player, groups.projectiles, (_, target) => {
      const projectile = target as Projectile;
      hooks.onPlayerDamaged(projectile.damage);
      projectile.destroy();
    });

    this.scene.physics.add.overlap(groups.player, groups.predators, () => {
      hooks.onPlayerDamaged(DAMAGE.predatorContact);
    });

    this.scene.physics.add.overlap(groups.player, groups.wormholes, (_, target) => {
      const wormhole = target as Wormhole;
      if (wormhole.isInsideCore(groups.player)) {
        hooks.onPlayerDamaged(999);
      }
    });

    this.scene.physics.add.overlap(groups.player, groups.hazards, (_, target) => {
      const hazard = target as Phaser.Physics.Arcade.Sprite;
      const damage = Number(hazard.getData("hazardDamage") ?? 14);
      hooks.onHazardTouched(damage);
    });

    this.scene.physics.add.overlap(groups.player, groups.exitGate, () => {
      hooks.onExitTouched();
    });
  }
}
