import Phaser from "phaser";
import { Projectile } from "./Projectile";

export type BossPhase = 1 | 2 | 3;

export interface BossUpdateHooks {
  spawnProjectile: (projectile: Projectile) => void;
  spawnAdds: (phase: BossPhase) => void;
}

export class ArcaneBoss extends Phaser.Physics.Arcade.Sprite {
  private readonly anchorX: number;
  private readonly anchorY: number;

  private readonly maxHpValue: number;
  private hpValue: number;
  private nextShotAt = 0;
  private nextPhase3WindowAt = 0;
  private vulnerableUntil = 0;
  private stunnedUntil = 0;
  private deathTriggered = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "boss_core");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    this.setImmovable(true);
    this.setCircle(16);
    this.setScale(2.2);
    this.setDepth(12);

    this.anchorX = x;
    this.anchorY = y;

    this.maxHpValue = 2400;
    this.hpValue = this.maxHpValue;

    this.nextShotAt = scene.time.now + 1200;
    this.nextPhase3WindowAt = scene.time.now + 5000;
  }

  updateBehavior(time: number, player: Phaser.Physics.Arcade.Sprite, hooks: BossUpdateHooks): void {
    if (this.hpValue <= 0) {
      this.setVelocity(0, 0);
      return;
    }

    if (time < this.stunnedUntil) {
      this.setTint(0xbef6ff);
      this.setVelocity(0, 0);
      return;
    }

    this.clearTint();

    const phase = this.getPhase();
    const wave = Math.sin(time / 520);
    const bob = Math.cos(time / 830);
    this.setPosition(this.anchorX + wave * (phase === 1 ? 45 : 70), this.anchorY + bob * 44);

    if (phase === 3 && time >= this.nextPhase3WindowAt) {
      this.vulnerableUntil = time + 1400;
      this.nextPhase3WindowAt = time + 5200;
    }

    if (time >= this.nextShotAt) {
      this.shootPattern(phase, player, hooks.spawnProjectile);
      this.nextShotAt = time + (phase === 1 ? 980 : phase === 2 ? 720 : 520);
      if (phase >= 2 && Math.random() < 0.42) {
        hooks.spawnAdds(phase);
      }
    }

    if (phase === 3 && time < this.vulnerableUntil) {
      this.setTintFill(0xffffff);
    }
  }

  applyDamage(amount: number, time: number): boolean {
    if (this.hpValue <= 0) {
      return true;
    }

    const phase = this.getPhase();
    const effectiveDamage = phase === 3 && time > this.vulnerableUntil ? Math.floor(amount * 0.42) : amount;
    this.hpValue = Math.max(0, this.hpValue - Math.max(1, effectiveDamage));

    if (this.hpValue <= 0 && !this.deathTriggered) {
      this.deathTriggered = true;
      this.setTint(0xfff6b0);
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 450,
        onComplete: () => this.destroy(),
      });
    }

    return this.hpValue <= 0;
  }

  stun(durationMs: number, time: number): void {
    this.stunnedUntil = Math.max(this.stunnedUntil, time + durationMs);
  }

  getHpRatio(): number {
    return Phaser.Math.Clamp(this.hpValue / this.maxHpValue, 0, 1);
  }

  getHp(): number {
    return this.hpValue;
  }

  getMaxHp(): number {
    return this.maxHpValue;
  }

  getPhase(): BossPhase {
    const ratio = this.getHpRatio();
    if (ratio <= 0.33) {
      return 3;
    }
    if (ratio <= 0.66) {
      return 2;
    }
    return 1;
  }

  isAlive(): boolean {
    return this.hpValue > 0;
  }

  private shootPattern(
    phase: BossPhase,
    player: Phaser.Physics.Arcade.Sprite,
    spawnProjectile: (projectile: Projectile) => void,
  ): void {
    const speed = phase === 1 ? 270 : phase === 2 ? 340 : 420;

    if (phase === 1) {
      this.spawnSpreadTowardPlayer(player, speed, 4, 0.17, spawnProjectile);
      return;
    }

    if (phase === 2) {
      this.spawnSpreadTowardPlayer(player, speed, 6, 0.2, spawnProjectile);
      this.spawnRadial(8, speed * 0.82, spawnProjectile);
      return;
    }

    this.spawnSpreadTowardPlayer(player, speed, 8, 0.23, spawnProjectile);
    this.spawnRadial(12, speed, spawnProjectile);
  }

  private spawnSpreadTowardPlayer(
    player: Phaser.Physics.Arcade.Sprite,
    speed: number,
    count: number,
    spreadAngle: number,
    spawnProjectile: (projectile: Projectile) => void,
  ): void {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const baseAngle = Math.atan2(dy, dx);
    const center = (count - 1) / 2;

    for (let i = 0; i < count; i += 1) {
      const angle = baseAngle + (i - center) * spreadAngle;
      const projectile = new Projectile(
        this.scene,
        this.x,
        this.y,
        "predator",
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        16,
      );
      spawnProjectile(projectile);
    }
  }

  private spawnRadial(count: number, speed: number, spawnProjectile: (projectile: Projectile) => void): void {
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + this.scene.time.now / 1300;
      const projectile = new Projectile(
        this.scene,
        this.x,
        this.y,
        "wormhole",
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        18,
      );
      spawnProjectile(projectile);
    }
  }
}
