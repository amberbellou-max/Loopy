import type { AbilityType } from "../types/gameTypes";

export type CooldownMap = Record<AbilityType, number>;

export function createCooldownMap(): CooldownMap {
  return {
    dash: 0,
    glide: 0,
    shockwave: 0,
    phase_blink: 0,
  };
}

export function canUseAbility(
  ability: AbilityType,
  unlockedAbilities: ReadonlySet<AbilityType>,
  cooldowns: CooldownMap,
  now: number,
): boolean {
  return unlockedAbilities.has(ability) && now >= cooldowns[ability];
}

export function getCooldownRemainingMs(cooldowns: CooldownMap, ability: AbilityType, now: number): number {
  return Math.max(0, cooldowns[ability] - now);
}
