import { describe, expect, test } from "vitest";
import { LEVELS } from "../../src/data/levels";

const milestoneIds = [4, 8, 12, 16];

describe("level data", () => {
  test("contains 16 levels with contiguous IDs", () => {
    expect(LEVELS).toHaveLength(16);
    const ids = LEVELS.map((level) => level.id);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });

  test("milestones are configured at every 4th level", () => {
    const actual = LEVELS.filter((level) => level.milestone).map((level) => level.id);
    expect(actual).toEqual(milestoneIds);
  });

  test("each level has valid objective and spawn data", () => {
    for (const level of LEVELS) {
      expect(level.quota).toBeGreaterThan(0);
      expect(level.exitGateX).toBeGreaterThan(level.playerStart.x);
      expect(level.foods.length).toBeGreaterThan(0);
      expect(level.checkpointX.length).toBeGreaterThan(0);
      expect(level.checkpointX.every((x) => x < level.exitGateX)).toBe(true);
    }
  });

  test("biome split is 8 jungle + 8 desert", () => {
    const jungle = LEVELS.filter((level) => level.biome === "jungle");
    const desert = LEVELS.filter((level) => level.biome === "desert");
    expect(jungle).toHaveLength(8);
    expect(desert).toHaveLength(8);
  });
});
