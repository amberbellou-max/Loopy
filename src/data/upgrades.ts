import type { AbilityType } from "../types/gameTypes";

export const ABILITY_UNLOCK_LEVEL: Record<AbilityType, number> = {
  dash: 4,
  glide: 8,
  shockwave: 12,
  phase_blink: 16,
};

export function getUnlockedAbilities(level: number): AbilityType[] {
  const ordered: AbilityType[] = ["dash", "glide", "shockwave", "phase_blink"];
  return ordered.filter((ability) => level >= ABILITY_UNLOCK_LEVEL[ability]);
}

export function getPrimaryAbilityForLevel(level: number): AbilityType | null {
  if (level >= 16) {
    return "phase_blink";
  }
  if (level >= 12) {
    return "shockwave";
  }
  if (level >= 8) {
    return "glide";
  }
  if (level >= 4) {
    return "dash";
  }
  return null;
}
