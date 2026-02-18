import Phaser from "phaser";
import { DAMAGE } from "../data/balance";
import { FlashPredator, type PredatorConfig } from "./FlashPredator";
import { Projectile } from "./Projectile";

export class RiftSkimmer extends FlashPredator {
  private readonly anchorY: number;
  private readonly strafeSpeed: number;
  private readonly hoverAmplitude: number;
  private readonly hoverFrequency: number;
  private readonly volleyIntervalMs: number;
  private readonly shotVelocity: number;
  private readonly driftSeed: number;
  private nextVolleyAt = 0;
  private nextDashAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, config: PredatorConfig) {
    super(scene, x, y, {
      ...config,
      shotPattern: "spread",
    });

    this.anchorY = y;
    this.strafeSpeed = Math.max(95, config.speed * 1.14);
    this.hoverAmplitude = Phaser.Math.Between(26, 48);
    this.hoverFrequency = Phaser.Math.FloatBetween(0.0028, 0.0042);
    this.volleyIntervalMs = Math.max(420, Math.round(config.shootIntervalMs * 0.86));
    this.shotVelocity = Math.round(config.projectileSpeed * 1.1);
    this.driftSeed = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.nextVolleyAt = scene.time.now + Phaser.Math.Between(650, 1200);
    this.nextDashAt = scene.time.now + Phaser.Math.Between(1400, 2200);

    this.setTexture("enemy_rift_skimmer");
    this.setScale(2.4);
    this.setCircle(13);
  }

  override updateBehavior(
    time: number,
    player: Phaser.Physics.Arcade.Sprite,
    spawnProjectile: (projectile: Projectile) => void,
  ): void {
    if (!this.active) {
      return;
    }

    if (this.isStunned(time)) {
      this.setVelocity(0, 0);
      this.setTint(0xaee6ff);
      return;
    }

    this.clearTint();

    const desiredY = this.anchorY + Math.sin(this.driftSeed + time * this.hoverFrequency) * this.hoverAmplitude;
    const horizontalDir = player.x >= this.x ? 1 : -1;
    const yDelta = desiredY - this.y;

    this.setVelocity(horizontalDir * this.strafeSpeed, Phaser.Math.Clamp(yDelta * 4.2, -200, 200));

    if (time >= this.nextDashAt && Math.abs(player.x - this.x) < 320) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      this.setVelocity((dx / distance) * this.strafeSpeed * 1.6, (dy / distance) * this.strafeSpeed * 1.3);
      this.nextDashAt = time + Phaser.Math.Between(1600, 2550);
    }

    if (this.nextVolleyAt - time < 180) {
      this.setTintFill(0xffffff);
    }

    if (time >= this.nextVolleyAt) {
      this.fireSkimmerSpread(player, spawnProjectile);
      this.nextVolleyAt = time + this.volleyIntervalMs;
    }
  }

  private fireSkimmerSpread(player: Phaser.Physics.Arcade.Sprite, spawnProjectile: (projectile: Projectile) => void): void {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const baseAngle = Math.atan2(dy, dx);
    for (const offset of [-0.2, 0.2]) {
      const angle = baseAngle + offset;
      spawnProjectile(
        new Projectile(
          this.scene,
          this.x,
          this.y,
          "predator",
          Math.cos(angle) * this.shotVelocity,
          Math.sin(angle) * this.shotVelocity,
          DAMAGE.projectile + 3,
        ),
      );
    }
  }
}
