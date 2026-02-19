import Phaser from "phaser";

export class SeedFountainGhost extends Phaser.Physics.Arcade.Sprite {
  readonly rewardSeeds: 3 | 6 | 9;
  readonly expiresAt: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    rewardSeeds: 3 | 6 | 9,
    lifetimeMs: number,
  ) {
    super(scene, x, y, "seed_fountain_ghost");
    this.rewardSeeds = rewardSeeds;
    this.expiresAt = scene.time.now + lifetimeMs;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);

    this.setDepth(8);
    this.setScale(2.5);
    this.setCircle(6);

    scene.tweens.add({
      targets: this,
      alpha: { from: 0.28, to: 0.98 },
      yoyo: true,
      repeat: -1,
      duration: 130,
      ease: "Sine.InOut",
    });

    scene.tweens.add({
      targets: this,
      y: y - 8,
      yoyo: true,
      repeat: -1,
      duration: 520,
      ease: "Sine.InOut",
    });
  }
}
