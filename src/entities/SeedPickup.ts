import Phaser from "phaser";

export type PickupType = "seed" | "universe_seed" | "life";

const PICKUP_TEXTURE: Record<PickupType, string> = {
  seed: "pickup_seed",
  universe_seed: "pickup_universe_seed",
  life: "pickup_life",
};

export class SeedPickup extends Phaser.Physics.Arcade.Sprite {
  readonly pickupType: PickupType;

  constructor(scene: Phaser.Scene, x: number, y: number, pickupType: PickupType) {
    super(scene, x, y, PICKUP_TEXTURE[pickupType]);
    this.pickupType = pickupType;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);

    this.setDepth(7);
    this.setScale(2);
    this.setCircle(4);

    scene.tweens.add({
      targets: this,
      y: y - 10,
      yoyo: true,
      repeat: -1,
      duration: 680,
      ease: "Sine.InOut",
    });
  }
}
