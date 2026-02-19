import { describe, expect, test } from "vitest";
import { checkpointSeedCost, getDifficultyParams, scaleQuota, scaleTimeLimit } from "../../src/systems/difficulty";

describe("difficulty scaling", () => {
  test("checkpoint seed cost scales with level", () => {
    expect(checkpointSeedCost(1)).toBe(2);
    expect(checkpointSeedCost(4)).toBe(4);
    expect(checkpointSeedCost(8)).toBe(6);
    expect(checkpointSeedCost(16)).toBe(10);
    expect(checkpointSeedCost(19)).toBe(11);
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

  test("levels above 16 keep increasing pressure", () => {
    const level16 = getDifficultyParams(16);
    const level19 = getDifficultyParams(19);

    expect(level19.predatorSpeedMultiplier).toBeGreaterThan(level16.predatorSpeedMultiplier);
    expect(level19.projectileSpeedMultiplier).toBeGreaterThan(level16.projectileSpeedMultiplier);
    expect(level19.wormholePullMultiplier).toBeGreaterThan(level16.wormholePullMultiplier);
    expect(level19.predatorShootIntervalMultiplier).toBeLessThan(level16.predatorShootIntervalMultiplier);
    expect(level19.extraPredators).toBeGreaterThanOrEqual(level16.extraPredators);
  });

  test("quota and time scaling produce tighter objectives", () => {
    const mid = getDifficultyParams(8);
    expect(scaleQuota(12, mid)).toBeGreaterThan(12);
    expect(scaleTimeLimit(130, mid)).toBeLessThan(130);
    expect(scaleTimeLimit(undefined, mid)).toBeNull();
  });
});
