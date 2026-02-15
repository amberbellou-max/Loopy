import Phaser from "phaser";
import { DAMAGE } from "../data/balance";
import { Projectile } from "./Projectile";

export type PredatorShotPattern = "single" | "spread" | "burst";

export interface PredatorConfig {
  speed: number;
  shootIntervalMs: number;
  projectileSpeed: number;
  hp?: number;
  shotPattern?: PredatorShotPattern;
}

export class FlashPredator extends Phaser.Physics.Arcade.Sprite {
  private readonly speed: number;
  private readonly shootIntervalMs: number;
  private readonly projectileSpeed: number;
  private readonly shotPattern: PredatorShotPattern;
  private hp: number;
  private nextShotAt = 0;
  private stunnedUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, config: PredatorConfig) {
    super(scene, x, y, "predator");
    this.speed = config.speed;
    this.shootIntervalMs = config.shootIntervalMs;
    this.projectileSpeed = config.projectileSpeed;
    this.hp = config.hp ?? 64;
    this.shotPattern = config.shotPattern ?? "single";

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    this.setDepth(5);
    this.setCircle(16);
    this.nextShotAt = scene.time.now + Phaser.Math.Between(700, 1400);
  }

  updateBehavior(
    time: number,
    player: Phaser.Physics.Arcade.Sprite,
    spawnProjectile: (projectile: Projectile) => void,
  ): void {
    if (!this.active || this.hp <= 0) {
      return;
    }

    if (time < this.stunnedUntil) {
      this.setVelocity(0, 0);
      this.setTint(0xaadfff);
      return;
    }

    this.clearTint();

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.max(1, Math.hypot(dx, dy));

    const vx = (dx / distance) * this.speed;
    const vy = (dy / distance) * this.speed;

    this.setVelocity(vx, vy);

    const timeToShot = this.nextShotAt - time;
    if (timeToShot < 220) {
      this.setTintFill(0xffffff);
    } else {
      this.clearTint();
    }

    if (time >= this.nextShotAt) {
      this.firePattern(dx / distance, dy / distance, spawnProjectile);
      this.nextShotAt = time + this.shootIntervalMs;
    }
  }

  applyDamage(amount: number): boolean {
    this.hp = Math.max(0, this.hp - amount);
    this.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => this.clearTint());
    if (this.hp <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }

  stun(durationMs: number, now: number): void {
    this.stunnedUntil = Math.max(this.stunnedUntil, now + durationMs);
  }

  isStunned(now: number): boolean {
    return now < this.stunnedUntil;
  }

  private firePattern(dirX: number, dirY: number, spawnProjectile: (projectile: Projectile) => void): void {
    if (this.shotPattern === "spread") {
      const baseAngle = Math.atan2(dirY, dirX);
      for (const offset of [-0.18, 0, 0.18]) {
        const angle = baseAngle + offset;
        spawnProjectile(
          new Projectile(
            this.scene,
            this.x,
            this.y,
            "predator",
            Math.cos(angle) * this.projectileSpeed,
            Math.sin(angle) * this.projectileSpeed,
            DAMAGE.projectile,
          ),
        );
      }
      return;
    }

    if (this.shotPattern === "burst") {
      for (let i = 0; i < 3; i += 1) {
        this.scene.time.delayedCall(i * 110, () => {
          if (!this.active) {
            return;
          }
          const jitter = Phaser.Math.FloatBetween(-0.1, 0.1);
          const angle = Math.atan2(dirY, dirX) + jitter;
          spawnProjectile(
            new Projectile(
              this.scene,
              this.x,
              this.y,
              "predator",
              Math.cos(angle) * this.projectileSpeed,
              Math.sin(angle) * this.projectileSpeed,
              DAMAGE.projectile,
            ),
          );
        });
      }
      return;
    }

    spawnProjectile(
      new Projectile(
        this.scene,
        this.x,
        this.y,
        "predator",
        dirX * this.projectileSpeed,
        dirY * this.projectileSpeed,
        DAMAGE.projectile,
      ),
    );
  }
}
