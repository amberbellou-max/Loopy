import { describe, expect, test } from "vitest";
import { LEVELS } from "../../src/data/levels";

const milestoneIds = [4, 8, 12, 16];

describe("level data", () => {
  test("contains 19 levels with contiguous IDs", () => {
    expect(LEVELS).toHaveLength(19);
    const ids = LEVELS.map((level) => level.id);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
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

  test("biome split is 8 jungle + 11 desert", () => {
    const jungle = LEVELS.filter((level) => level.biome === "jungle");
    const desert = LEVELS.filter((level) => level.biome === "desert");
    expect(jungle).toHaveLength(8);
    expect(desert).toHaveLength(11);
  });

  test("seed drain pressure is configured on late challenge levels", () => {
    const seedDrainLevels = LEVELS.filter((level) => level.seedDrain).map((level) => level.id);
    expect(seedDrainLevels).toEqual([17, 18, 19]);
  });

  test("seed fountain ghost events exist in both early and late chapters", () => {
    const ghostLevels = LEVELS.filter((level) => (level.seedFountainGhosts?.length ?? 0) > 0).map((level) => level.id);
    expect(ghostLevels.some((id) => id <= 12)).toBe(true);
    expect(ghostLevels.some((id) => id >= 17)).toBe(true);
  });

  test("seed fountain ghost rewards are fixed burst tiers", () => {
    for (const level of LEVELS) {
      for (const ghostEvent of level.seedFountainGhosts ?? []) {
        expect([3, 6, 9]).toContain(ghostEvent.rewardSeeds);
      }
    }
  });

  test("spin arenas appear in early and late chapters", () => {
    const spinLevels = LEVELS.filter((level) => (level.spinArenas?.length ?? 0) > 0).map((level) => level.id);
    expect(spinLevels.some((id) => id <= 11)).toBe(true);
    expect(spinLevels.some((id) => id >= 17)).toBe(true);
  });
});
