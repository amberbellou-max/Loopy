import Phaser from "phaser";

export class GlitterShot extends Phaser.Physics.Arcade.Sprite {
  readonly damage: number;

  constructor(scene: Phaser.Scene, x: number, y: number, velocityX: number, velocityY: number, damage = 26) {
    super(scene, x, y, "glitter_shot");
    this.damage = damage;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    this.setDepth(8);
    this.setCircle(4);
    this.setVelocity(velocityX, velocityY);
    this.setScale(2);
  }

  isOutOfBounds(levelWidth: number): boolean {
    return this.x < -120 || this.x > levelWidth + 120 || this.y < -120 || this.y > 840;
  }
}
