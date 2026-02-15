import Phaser from "phaser";
import { DAMAGE } from "../data/balance";
import { Projectile } from "./Projectile";
import { calculateWormholePullVector } from "../systems/wormholeMath";

export interface WormholeConfig {
  pullRadius: number;
  pullStrength: number;
  shootIntervalMs: number;
  projectileSpeed: number;
}

export class Wormhole extends Phaser.Physics.Arcade.Sprite {
  readonly pullRadius: number;
  readonly pullStrength: number;
  private readonly shootIntervalMs: number;
  private readonly projectileSpeed: number;
  private nextShotAt = 0;
  private pullScale = 1;
  private shotsSuppressedUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, config: WormholeConfig) {
    super(scene, x, y, "wormhole_core");
    this.pullRadius = config.pullRadius;
    this.pullStrength = config.pullStrength;
    this.shootIntervalMs = config.shootIntervalMs;
    this.projectileSpeed = config.projectileSpeed;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    this.setCircle(18);
    this.setImmovable(true);
    this.setDepth(3);

    this.nextShotAt = scene.time.now + Phaser.Math.Between(1200, 2500);
  }

  updateBehavior(
    time: number,
    player: Phaser.Physics.Arcade.Sprite,
    spawnProjectile: (projectile: Projectile) => void,
  ): void {
    this.rotation += 0.03;

    if (time < this.shotsSuppressedUntil) {
      return;
    }

    if (time >= this.nextShotAt) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const projectile = new Projectile(
        this.scene,
        this.x,
        this.y,
        "wormhole",
        (dx / distance) * this.projectileSpeed,
        (dy / distance) * this.projectileSpeed,
        DAMAGE.blackHoleProjectile,
      );
      spawnProjectile(projectile);
      this.nextShotAt = time + this.shootIntervalMs;
    }
  }

  pullTarget(target: Phaser.Physics.Arcade.Sprite, deltaSec: number): number {
    const targetBody = target.body as Phaser.Physics.Arcade.Body | null;
    if (!targetBody) {
      return 0;
    }

    const pull = calculateWormholePullVector(
      this.x,
      this.y,
      target.x,
      target.y,
      this.pullRadius,
      this.pullStrength * this.pullScale,
    );

    if (pull.intensity <= 0) {
      return 0;
    }

    target.setVelocity(targetBody.velocity.x + pull.x * deltaSec, targetBody.velocity.y + pull.y * deltaSec);
    return pull.intensity;
  }

  setPullScale(scale: number): void {
    this.pullScale = Math.max(0, scale);
  }

  suppressShots(until: number): void {
    this.shotsSuppressedUntil = Math.max(this.shotsSuppressedUntil, until);
  }

  isInsideCore(target: Phaser.Physics.Arcade.Sprite): boolean {
    const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
    return distance < 22;
  }
}
