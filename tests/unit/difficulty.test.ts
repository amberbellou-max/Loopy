import { describe, expect, test } from "vitest";
import { checkpointSeedCost, getDifficultyParams, scaleQuota, scaleTimeLimit } from "../../src/systems/difficulty";

describe("difficulty scaling", () => {
  test("checkpoint seed cost scales with level", () => {
    expect(checkpointSeedCost(1)).toBe(2);
    expect(checkpointSeedCost(4)).toBe(4);
    expect(checkpointSeedCost(8)).toBe(6);
    expect(checkpointSeedCost(16)).toBe(10);
  });

  test("later levels are harder across key multipliers", () => {
    const early = getDifficultyParams(2);
    const late = getDifficultyParams(14);

    expect(late.predatorSpeedMultiplier).toBeGreaterThan(early.predatorSpeedMultiplier);
    expect(late.projectileSpeedMultiplier).toBeGreaterThan(early.projectileSpeedMultiplier);
    expect(late.wormholePullMultiplier).toBeGreaterThan(early.wormholePullMultiplier);
    expect(late.predatorShootIntervalMultiplier).toBeLessThan(early.predatorShootIntervalMultiplier);
    expect(late.extraPredators).toBeGreaterThanOrEqual(early.extraPredators);
  });

  test("quota and time scaling produce tighter objectives", () => {
    const mid = getDifficultyParams(8);
    expect(scaleQuota(12, mid)).toBeGreaterThan(12);
    expect(scaleTimeLimit(130, mid)).toBeLessThan(130);
    expect(scaleTimeLimit(undefined, mid)).toBeNull();
  });
});
