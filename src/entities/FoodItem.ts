import Phaser from "phaser";
import type { FoodType } from "../types/gameTypes";

const FOOD_TEXTURE: Record<FoodType, string> = {
  river_fish: "food_river_fish",
  earth_hopper_fish: "food_earth_hopper_fish",
  grass_bite: "food_grass_bite",
  locust: "food_locust",
};

export class FoodItem extends Phaser.Physics.Arcade.Sprite {
  readonly foodType: FoodType;
  private readonly movement: "drift" | "hopper" | "swarm" | "static" | "orbit";
  private readonly baseX: number;
  private readonly baseY: number;
  private readonly seed: number;
  private readonly orbitRadius: number;
  private readonly orbitAngularSpeed: number;
  private readonly orbitPhase: number;
  private readonly carrierRadius: number;
  private readonly carrierAngularSpeed: number;
  private readonly carrierPhase: number;
  private readonly carrierAspectY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    foodType: FoodType,
    movement: "drift" | "hopper" | "swarm" | "static" | "orbit",
    movementConfig: {
      orbitRadius?: number;
      orbitAngularSpeed?: number;
      orbitPhase?: number;
      carrierRadius?: number;
      carrierAngularSpeed?: number;
      carrierPhase?: number;
      carrierAspectY?: number;
    } = {},
  ) {
    super(scene, x, y, FOOD_TEXTURE[foodType]);
    this.foodType = foodType;
    this.movement = movement;
    this.baseX = x;
    this.baseY = y;
    this.seed = Math.random() * Math.PI * 2;
    this.orbitRadius = movementConfig.orbitRadius ?? Phaser.Math.Between(24, 56);
    this.orbitAngularSpeed = movementConfig.orbitAngularSpeed ?? Phaser.Math.FloatBetween(1.1, 2);
    this.orbitPhase = movementConfig.orbitPhase ?? this.seed;
    this.carrierRadius = movementConfig.carrierRadius ?? Phaser.Math.Between(22, 70);
    this.carrierAngularSpeed = movementConfig.carrierAngularSpeed ?? Phaser.Math.FloatBetween(0.35, 0.8);
    this.carrierPhase = movementConfig.carrierPhase ?? this.seed * 0.7;
    this.carrierAspectY = movementConfig.carrierAspectY ?? 0.74;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(4);
    this.setCircle(10);
    this.setImmovable(true);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
  }

  update(time: number): void {
    const t = time / 1000;
    switch (this.movement) {
      case "drift": {
        const offsetY = Math.sin(t * 1.9 + this.seed) * 14;
        const offsetX = Math.cos(t * 1.2 + this.seed) * 10;
        this.setPosition(this.baseX + offsetX, this.baseY + offsetY);
        break;
      }
      case "hopper": {
        const hop = Math.max(0, Math.sin(t * 3 + this.seed));
        this.setPosition(this.baseX + Math.sin(t + this.seed) * 16, this.baseY - hop * 24);
        break;
      }
      case "swarm": {
        const offsetX = Math.sin(t * 5 + this.seed) * 18 + Math.cos(t * 3 + this.seed) * 8;
        const offsetY = Math.cos(t * 6 + this.seed) * 14;
        this.setPosition(this.baseX + offsetX, this.baseY + offsetY);
        break;
      }
      case "orbit": {
        const centerX = this.baseX + Math.cos(t * this.carrierAngularSpeed + this.carrierPhase) * this.carrierRadius;
        const centerY = this.baseY + Math.sin(t * this.carrierAngularSpeed + this.carrierPhase) * this.carrierRadius * this.carrierAspectY;
        const x = centerX + Math.cos(t * this.orbitAngularSpeed + this.orbitPhase) * this.orbitRadius;
        const y = centerY + Math.sin(t * this.orbitAngularSpeed + this.orbitPhase) * this.orbitRadius * 0.86;
        this.setPosition(x, y);
        break;
      }
      case "static":
      default: {
        this.setPosition(this.baseX, this.baseY + Math.sin(t * 1.1 + this.seed) * 3);
        break;
      }
    }
  }
}
