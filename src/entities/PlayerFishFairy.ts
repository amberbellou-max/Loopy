import Phaser from "phaser";
import { ABILITY_COOLDOWN_MS, CHECKPOINT_RESPAWN_HEALTH_RATIO, PLAYER_BASE_SPEED, PLAYER_DRAG, PLAYER_INVULN_MS, PLAYER_MAX_HEALTH } from "../data/balance";
import type { AbilityType } from "../types/gameTypes";
import type { InputSnapshot } from "../systems/InputSystem";
import { canUseAbility, createCooldownMap, getCooldownRemainingMs } from "../systems/abilityLogic";

export class PlayerFishFairy extends Phaser.Physics.Arcade.Sprite {
  health = PLAYER_MAX_HEALTH;
  readonly maxHealth = PLAYER_MAX_HEALTH;
  private invulnerableUntil = 0;

  private cooldowns = createCooldownMap();

  private unlockedAbilities = new Set<AbilityType>();
  private primaryAbility: AbilityType | null = null;
  private glideActiveUntil = 0;
  private facingDirection = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(7);
    this.setCircle(12);
    this.arcadeBody.setAllowGravity(false);
    this.setDrag(PLAYER_DRAG, PLAYER_DRAG);
    this.setMaxVelocity(PLAYER_BASE_SPEED, PLAYER_BASE_SPEED);
  }

  setUnlockedAbilities(abilities: AbilityType[]): void {
    this.unlockedAbilities = new Set(abilities);
    this.primaryAbility = abilities.length > 0 ? abilities[abilities.length - 1] : null;
  }

  unlockAbility(ability: AbilityType): void {
    this.unlockedAbilities.add(ability);
    this.primaryAbility = ability;
  }

  getUnlockedAbilities(): AbilityType[] {
    return [...this.unlockedAbilities.values()];
  }

  getPrimaryAbility(): AbilityType | null {
    return this.primaryAbility;
  }

  updateControl(input: InputSnapshot, deltaSec: number, now: number): void {
    const glideActive = now < this.glideActiveUntil;
    const maxSpeed = glideActive ? PLAYER_BASE_SPEED * 0.82 : PLAYER_BASE_SPEED;
    const body = this.arcadeBody;

    const inputMagnitude = Math.hypot(input.moveX, input.moveY);
    const normX = inputMagnitude > 0 ? input.moveX / inputMagnitude : 0;
    const normY = inputMagnitude > 0 ? input.moveY / inputMagnitude : 0;

    // Snappier velocity steering feels better than slow acceleration buildup for arcade controls.
    const steerLerp = 1 - Math.exp(-deltaSec * (glideActive ? 12 : 20));
    const releaseLerp = 1 - Math.exp(-deltaSec * 28);

    if (inputMagnitude > 0) {
      body.velocity.x = Phaser.Math.Linear(body.velocity.x, normX * maxSpeed, steerLerp);
      body.velocity.y = Phaser.Math.Linear(body.velocity.y, normY * maxSpeed, steerLerp);
    } else {
      body.velocity.x = Phaser.Math.Linear(body.velocity.x, 0, releaseLerp);
      body.velocity.y = Phaser.Math.Linear(body.velocity.y, 0, releaseLerp);
    }

    body.acceleration.set(0, 0);

    this.setMaxVelocity(maxSpeed, maxSpeed);

    if (body.velocity.x > 2) {
      this.facingDirection = 1;
    } else if (body.velocity.x < -2) {
      this.facingDirection = -1;
    }

    if (input.dashPressed) {
      this.tryDash(now);
    }

    if (glideActive) {
      body.velocity.y -= 30 * deltaSec;
    }
  }

  takeDamage(amount: number, now: number): boolean {
    if (now < this.invulnerableUntil) {
      return false;
    }
    this.health = Math.max(0, this.health - amount);
    this.invulnerableUntil = now + PLAYER_INVULN_MS;
    this.setTint(0xff7f7f);
    this.scene.time.delayedCall(120, () => this.clearTint());
    return true;
  }

  isInvulnerable(now: number): boolean {
    return now < this.invulnerableUntil;
  }

  respawnAt(x: number, y: number, now: number): void {
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.health = Math.max(Math.floor(this.maxHealth * CHECKPOINT_RESPAWN_HEALTH_RATIO), this.health);
    this.invulnerableUntil = now + 800;
  }

  getCooldownRemainingMs(ability: AbilityType, now: number): number {
    return getCooldownRemainingMs(this.cooldowns, ability, now);
  }

  getHealthRatio(): number {
    return Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);
  }

  getFacingDirection(): number {
    return this.facingDirection;
  }

  private tryDash(now: number): void {
    if (!canUseAbility("dash", this.unlockedAbilities, this.cooldowns, now)) {
      return;
    }

    this.cooldowns.dash = now + ABILITY_COOLDOWN_MS.dash;
    const dashSpeed = 470;
    this.setVelocity(this.facingDirection * dashSpeed, this.arcadeBody.velocity.y * 0.3);
  }

  private get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }
}
