import Phaser from "phaser";
import type { Biome, SpinArenaRule } from "../types/gameTypes";

export class SpinArena {
  readonly radius: number;
  readonly seedSpinRate: number;
  readonly predatorSwirl: number;

  x: number;
  y: number;

  private readonly scene: Phaser.Scene;
  private readonly baseX: number;
  private readonly baseY: number;
  private readonly orbitRadius: number;
  private readonly orbitSpeed: number;
  private orbitAngle = 0;
  private markerAngle = 0;

  private readonly aura: Phaser.GameObjects.Arc;
  private readonly rim: Phaser.GameObjects.Arc;
  private readonly markers: Phaser.GameObjects.Rectangle[] = [];

  constructor(scene: Phaser.Scene, rule: SpinArenaRule, biome: Biome) {
    this.scene = scene;
    this.baseX = rule.x;
    this.baseY = rule.y;
    this.radius = rule.radius;
    this.orbitRadius = rule.orbitRadius;
    this.orbitSpeed = rule.orbitSpeed;
    this.seedSpinRate = rule.seedSpinRate;
    this.predatorSwirl = rule.predatorSwirl;
    this.orbitAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.markerAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);

    this.x = this.baseX;
    this.y = this.baseY;

    const fillColor = biome === "jungle" ? 0x83fff0 : 0xffd38f;
    const strokeColor = biome === "jungle" ? 0x57edff : 0xffb552;

    this.aura = this.scene.add.circle(this.x, this.y, this.radius, fillColor, 0.08);
    this.aura.setDepth(2);
    this.rim = this.scene.add.circle(this.x, this.y, this.radius, 0x000000, 0);
    this.rim.setStrokeStyle(2, strokeColor, 0.55);
    this.rim.setDepth(3);

    for (let i = 0; i < 10; i += 1) {
      const marker = this.scene.add.rectangle(this.x, this.y, 4, 4, strokeColor, 0.9);
      marker.setDepth(3);
      this.markers.push(marker);
    }
  }

  update(deltaSec: number): void {
    this.orbitAngle += this.orbitSpeed * deltaSec;
    this.markerAngle += this.seedSpinRate * deltaSec;

    this.x = this.baseX + Math.cos(this.orbitAngle) * this.orbitRadius;
    this.y = this.baseY + Math.sin(this.orbitAngle) * this.orbitRadius * 0.75;

    this.aura.setPosition(this.x, this.y);
    this.rim.setPosition(this.x, this.y);

    for (let i = 0; i < this.markers.length; i += 1) {
      const marker = this.markers[i];
      const angle = this.markerAngle + (i / this.markers.length) * Math.PI * 2;
      const markerRadius = this.radius - 8 + Math.sin(this.markerAngle * 1.3 + i) * 6;
      marker.setPosition(
        this.x + Math.cos(angle) * markerRadius,
        this.y + Math.sin(angle) * markerRadius,
      );
    }
  }

  contains(pointX: number, pointY: number): boolean {
    return Phaser.Math.Distance.Between(this.x, this.y, pointX, pointY) <= this.radius;
  }

  destroy(): void {
    this.aura.destroy();
    this.rim.destroy();
    for (const marker of this.markers) {
      marker.destroy();
    }
    this.markers.length = 0;
  }
}
