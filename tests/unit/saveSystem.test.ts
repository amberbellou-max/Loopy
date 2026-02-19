import { beforeEach, describe, expect, test } from "vitest";
import { DEFAULT_SAVE, SaveSystem } from "../../src/systems/SaveSystem";

describe("SaveSystem", () => {
  const createLocalStorage = (): Storage => {
    const store = new Map<string, string>();
    return {
      get length() {
        return store.size;
      },
      clear: () => store.clear(),
      getItem: (key: string) => store.get(key) ?? null,
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      removeItem: (key: string) => {
        store.delete(key);
      },
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    };
  };

  beforeEach(() => {
    Object.defineProperty(globalThis, "window", {
      value: { localStorage: createLocalStorage() },
      configurable: true,
      writable: true,
    });
    window.localStorage.clear();
  });

  test("loads defaults when no save exists", () => {
    expect(SaveSystem.load()).toEqual(DEFAULT_SAVE);
  });

  test("sanitizes invalid save data", () => {
    window.localStorage.setItem(
      "loopy_save_v1",
      JSON.stringify({
        highestUnlockedLevel: 999,
        levelBestScores: { "1": 100, "25": 9999, "4": -2 },
        settings: { musicVolume: 7, sfxVolume: -3 },
      }),
    );

    const loaded = SaveSystem.load();
    expect(loaded.highestUnlockedLevel).toBe(19);
    expect(loaded.levelBestScores[1]).toBe(100);
    expect(loaded.levelBestScores[25]).toBeUndefined();
    expect(loaded.settings.musicVolume).toBe(1);
    expect(loaded.settings.sfxVolume).toBe(0);
  });

  test("merges new progress and stores best score", () => {
    SaveSystem.mergeProgress(3, 560, { seedsEarned: 8, universeSeedsEarned: 1, bloomsCast: 1 });
    SaveSystem.mergeProgress(3, 420, { seedsEarned: 3, universeSeedsEarned: 0, bloomsCast: 0 });

    const loaded = SaveSystem.load();
    expect(loaded.highestUnlockedLevel).toBe(4);
    expect(loaded.levelBestScores[3]).toBe(560);
    expect(loaded.totals.seeds).toBe(11);
    expect(loaded.totals.universeSeeds).toBe(1);
    expect(loaded.totals.bloomsCast).toBe(1);
  });
});
