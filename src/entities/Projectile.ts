import Phaser from "phaser";

export type ProjectileSource = "predator" | "wormhole";
export type ProjectileOwner = "enemy" | "player";

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  readonly source: ProjectileSource;
  owner: ProjectileOwner;
  damage: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    source: ProjectileSource,
    velocityX: number,
    velocityY: number,
    damage: number,
    owner: ProjectileOwner = "enemy",
  ) {
    super(scene, x, y, source === "predator" ? "projectile_enemy" : "projectile_blackhole");
    this.source = source;
    this.damage = damage;
    this.owner = owner;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    this.setDepth(6);
    this.setCircle(source === "predator" ? 5 : 7);
    this.setVelocity(velocityX, velocityY);
  }

  reflectFrom(pointX: number, pointY: number, speedMultiplier = 1.15): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const dx = this.x - pointX;
    const dy = this.y - pointY;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const speed = Math.max(220, body.velocity.length() * speedMultiplier);

    this.setVelocity((dx / distance) * speed, (dy / distance) * speed);
    this.owner = "player";
    this.damage = Math.max(this.damage, 20);
    this.setTint(0x9cf7ff);
  }

  makePlayerOwned(): void {
    this.owner = "player";
    this.setTint(0x9cf7ff);
  }

  isOutOfBounds(levelWidth: number): boolean {
    return this.x < -100 || this.x > levelWidth + 100 || this.y < -100 || this.y > 820;
  }
}
