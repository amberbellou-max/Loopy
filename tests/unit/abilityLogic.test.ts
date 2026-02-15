import { describe, expect, test } from "vitest";
import { canUseAbility, createCooldownMap, getCooldownRemainingMs } from "../../src/systems/abilityLogic";
import { getUnlockedAbilities } from "../../src/data/upgrades";
import type { AbilityType } from "../../src/types/gameTypes";

describe("ability logic", () => {
  test("unlocks abilities by milestone level", () => {
    expect(getUnlockedAbilities(1)).toEqual([]);
    expect(getUnlockedAbilities(4)).toEqual(["dash"]);
    expect(getUnlockedAbilities(8)).toEqual(["dash", "glide"]);
    expect(getUnlockedAbilities(12)).toEqual(["dash", "glide", "shockwave"]);
    expect(getUnlockedAbilities(16)).toEqual(["dash", "glide", "shockwave", "phase_blink"]);
  });

  test("cooldown and unlock gating for ability use", () => {
    const cooldowns = createCooldownMap();
    const unlocked = new Set<AbilityType>(["dash", "glide"]);

    cooldowns.dash = 4000;
    expect(canUseAbility("dash", unlocked, cooldowns, 3999)).toBe(false);
    expect(canUseAbility("dash", unlocked, cooldowns, 4000)).toBe(true);
    expect(canUseAbility("shockwave", unlocked, cooldowns, 7000)).toBe(false);
  });

  test("reports cooldown remaining", () => {
    const cooldowns = createCooldownMap();
    cooldowns.phase_blink = 5800;
    expect(getCooldownRemainingMs(cooldowns, "phase_blink", 5200)).toBe(600);
    expect(getCooldownRemainingMs(cooldowns, "phase_blink", 7000)).toBe(0);
  });
});
