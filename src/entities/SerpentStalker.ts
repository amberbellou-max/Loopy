import Phaser from "phaser";
import { DAMAGE } from "../data/balance";
import { FlashPredator, type PredatorConfig } from "./FlashPredator";
import { Projectile } from "./Projectile";

interface SerpentConfig extends PredatorConfig {
  tailSegments?: number;
  tailSpacing?: number;
}

export class SerpentStalker extends FlashPredator {
  private readonly chaseSpeed: number;
  private readonly venomIntervalMs: number;
  private readonly venomSpeed: number;
  private readonly tailSegments: Phaser.GameObjects.Image[] = [];
  private readonly history: Phaser.Math.Vector2[] = [];
  private readonly tailSpacing: number;
  private readonly historyCap: number;
  private readonly turnBlend: number;
  private tailBiteArmAt = 0;
  private tailBiteCooldownUntil = 0;
  private venomNextShotAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, config: SerpentConfig) {
    super(scene, x, y, {
      ...config,
      shotPattern: "single",
      hp: config.hp ?? 86,
    });

    this.chaseSpeed = Math.max(95, config.speed);
    this.venomIntervalMs = Math.max(780, Math.round(config.shootIntervalMs * 1.08));
    this.venomSpeed = Math.max(220, Math.round(config.projectileSpeed * 0.92));
    this.tailSpacing = config.tailSpacing ?? 6;
    const segmentCount = config.tailSegments ?? 7;
    this.historyCap = segmentCount * this.tailSpacing + 60;
    this.turnBlend = 0.09;
    this.tailBiteArmAt = scene.time.now + 1400;
    this.venomNextShotAt = scene.time.now + Phaser.Math.Between(850, 1650);

    this.setTexture("enemy_snake_head");
    this.setScale(2.2);
    this.setCircle(13);
    this.setDepth(7);

    for (let i = 0; i < segmentCount; i += 1) {
      const seg = scene.add.image(x, y, "enemy_snake_segment");
      seg.setScale(2);
      seg.setDepth(6.8 - i * 0.02);
      this.tailSegments.push(seg);
      this.history.push(new Phaser.Math.Vector2(x, y));
    }
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
      this.setTint(0xbde4b3);
      this.syncTailVisuals();
      return;
    }

    this.clearTint();

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (!body) {
      return;
    }

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const dirX = dx / distance;
    const dirY = dy / distance;

    const swayAngle = Math.atan2(dirY, dirX) + Math.sin(time * 0.003 + this.x * 0.01) * 0.25;
    const desiredVX = Math.cos(swayAngle) * this.chaseSpeed;
    const desiredVY = Math.sin(swayAngle) * this.chaseSpeed;

    body.velocity.x = Phaser.Math.Linear(body.velocity.x, desiredVX, this.turnBlend);
    body.velocity.y = Phaser.Math.Linear(body.velocity.y, desiredVY, this.turnBlend);

    this.rotation = Math.atan2(body.velocity.y, body.velocity.x);

    this.pushHistory();
    this.syncTailVisuals();
    this.tryTailBite(time);

    if (distance < 520 && time >= this.venomNextShotAt) {
      this.fireVenomAt(player, spawnProjectile);
      this.venomNextShotAt = time + this.venomIntervalMs;
    }
  }

  override destroy(fromScene?: boolean): void {
    for (const seg of this.tailSegments) {
      seg.destroy();
    }
    this.tailSegments.length = 0;
    this.history.length = 0;
    super.destroy(fromScene);
  }

  private pushHistory(): void {
    this.history.unshift(new Phaser.Math.Vector2(this.x, this.y));
    while (this.history.length > this.historyCap) {
      this.history.pop();
    }
  }

  private syncTailVisuals(): void {
    if (this.history.length === 0) {
      return;
    }

    for (let i = 0; i < this.tailSegments.length; i += 1) {
      const segment = this.tailSegments[i];
      const sampleIdx = Math.min(this.history.length - 1, (i + 1) * this.tailSpacing);
      const prevIdx = Math.min(this.history.length - 1, sampleIdx + 1);
      const point = this.history[sampleIdx];
      const prev = this.history[prevIdx] ?? point;
      segment.setPosition(point.x, point.y);
      segment.rotation = Math.atan2(point.y - prev.y, point.x - prev.x);
      segment.alpha = 0.95 - i * 0.06;
    }
  }

  private tryTailBite(time: number): void {
    if (time < this.tailBiteArmAt || time < this.tailBiteCooldownUntil) {
      return;
    }

    for (let i = 3; i < this.tailSegments.length; i += 1) {
      const segment = this.tailSegments[i];
      if (Phaser.Math.Distance.Between(this.x, this.y, segment.x, segment.y) < 16) {
        this.tailBiteCooldownUntil = time + 2000;
        this.stun(1200, time);
        this.scene.events.emit("SNAKE_TAIL_BITE", {
          x: this.x,
          y: this.y,
        });
        this.applyDamage(9_999, "generic");
        return;
      }
    }
  }

  private fireVenomAt(
    player: Phaser.Physics.Arcade.Sprite,
    spawnProjectile: (projectile: Projectile) => void,
  ): void {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const baseAngle = Math.atan2(dy, dx);
    const angle = baseAngle + Phaser.Math.FloatBetween(-0.14, 0.14);
    spawnProjectile(
      new Projectile(
        this.scene,
        this.x,
        this.y,
        "predator",
        Math.cos(angle) * this.venomSpeed,
        Math.sin(angle) * this.venomSpeed,
        DAMAGE.projectile + 2,
      ),
    );
  }
}
