import Phaser from "phaser";
import { DAMAGE } from "../data/balance";
import { FlashPredator, type EnemyDamageSource, type PredatorConfig } from "./FlashPredator";
import { Projectile } from "./Projectile";

export class ArcaneTotem extends FlashPredator {
  private readonly anchorX: number;
  private readonly anchorY: number;
  private readonly volleyIntervalMs: number;
  private readonly shotVelocity: number;
  private readonly driftSeed: number;
  private nextVolleyAt = 0;
  private immuneFlashUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, config: PredatorConfig) {
    super(scene, x, y, {
      ...config,
      speed: 0,
      shotPattern: "single",
      hp: config.hp ?? 130,
    });

    this.anchorX = x;
    this.anchorY = y;
    this.volleyIntervalMs = Math.max(520, Math.round(config.shootIntervalMs * 0.92));
    this.shotVelocity = Math.round(config.projectileSpeed * 0.95);
    this.driftSeed = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.nextVolleyAt = scene.time.now + Phaser.Math.Between(900, 1400);

    this.setTexture("enemy_arcane_totem");
    this.setScale(2.6);
    this.setCircle(17);
    this.setData("requiresSpaceShot", true);
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
      this.setTint(0xb5c7ff);
      return;
    }

    const targetX = this.anchorX + Math.sin(this.driftSeed + time * 0.0019) * 14;
    const targetY = this.anchorY + Math.cos(this.driftSeed + time * 0.0023) * 10;
    this.setVelocity((targetX - this.x) * 7, (targetY - this.y) * 7);

    if (time < this.immuneFlashUntil) {
      this.setTint(0x7f8cff);
    } else {
      this.clearTint();
    }

    if (this.nextVolleyAt - time < 200) {
      this.setTintFill(0xfff0c4);
    }

    if (time >= this.nextVolleyAt) {
      this.fireTotemVolley(player, spawnProjectile);
      this.nextVolleyAt = time + this.volleyIntervalMs;
    }
  }

  override applyDamage(amount: number, source: EnemyDamageSource = "generic"): boolean {
    if (source !== "glitter") {
      this.immuneFlashUntil = this.scene.time.now + 130;
      this.setTint(0x7f8cff);
      this.scene.time.delayedCall(110, () => {
        if (this.active && this.scene.time.now >= this.immuneFlashUntil) {
          this.clearTint();
        }
      });
      return false;
    }

    return super.applyDamage(amount, source);
  }

  private fireTotemVolley(player: Phaser.Physics.Arcade.Sprite, spawnProjectile: (projectile: Projectile) => void): void {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const baseAngle = Math.atan2(dy, dx);

    for (const offset of [-0.28, 0, 0.28]) {
      const angle = baseAngle + offset;
      spawnProjectile(
        new Projectile(
          this.scene,
          this.x,
          this.y,
          "predator",
          Math.cos(angle) * this.shotVelocity,
          Math.sin(angle) * this.shotVelocity,
          DAMAGE.projectile + 5,
        ),
      );
    }
  }
}
