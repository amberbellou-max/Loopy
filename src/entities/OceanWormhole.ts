import Phaser from "phaser";
import { Wormhole, type WormholeConfig } from "./Wormhole";

export interface OceanWormholeConfig extends WormholeConfig {
  trapRadius?: number;
  escapeTapGoal?: number;
  trapCooldownMs?: number;
}

export class OceanWormhole extends Wormhole {
  private readonly trapRadius: number;
  private readonly escapeTapGoal: number;
  private readonly trapCooldownMs: number;
  private trapCooldownUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, config: OceanWormholeConfig) {
    super(scene, x, y, config);

    this.trapRadius = config.trapRadius ?? Math.max(54, Math.round(config.pullRadius * 0.44));
    this.escapeTapGoal = config.escapeTapGoal ?? 4;
    this.trapCooldownMs = config.trapCooldownMs ?? 1800;

    this.setTexture("wormhole_ocean_core");
    this.setScale(2.35);
    this.setDepth(4);
  }

  canTrap(target: Phaser.Physics.Arcade.Sprite, now: number): boolean {
    if (now < this.trapCooldownUntil) {
      return false;
    }
    return Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y) <= this.trapRadius;
  }

  getTrapRadius(): number {
    return this.trapRadius;
  }

  getEscapeTapGoal(): number {
    return this.escapeTapGoal;
  }

  markTrapReleased(now: number): void {
    this.trapCooldownUntil = Math.max(this.trapCooldownUntil, now + this.trapCooldownMs);
  }

  override isInsideCore(target: Phaser.Physics.Arcade.Sprite): boolean {
    const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
    return distance < 18;
  }
}
