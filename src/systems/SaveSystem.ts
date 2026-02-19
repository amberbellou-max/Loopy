import type { SaveData } from "../types/gameTypes";
import { MAX_LEVEL_ID } from "../data/levels";

const SAVE_KEY = "loopy_save_v1";

const DEFAULT_SAVE: SaveData = {
  highestUnlockedLevel: 1,
  levelBestScores: {},
  totals: {
    seeds: 0,
    universeSeeds: 0,
    bloomsCast: 0,
  },
  settings: {
    musicVolume: 0.45,
    sfxVolume: 0.55,
  },
};

function sanitizeSaveData(value: unknown): SaveData {
  if (!value || typeof value !== "object") {
    return structuredClone(DEFAULT_SAVE);
  }

  const candidate = value as Partial<SaveData>;
  const highestUnlockedLevel = Number(candidate.highestUnlockedLevel ?? DEFAULT_SAVE.highestUnlockedLevel);
  const safeHighestUnlocked = Number.isFinite(highestUnlockedLevel)
    ? Math.min(MAX_LEVEL_ID, Math.max(1, Math.floor(highestUnlockedLevel)))
    : DEFAULT_SAVE.highestUnlockedLevel;

  const rawScores = candidate.levelBestScores;
  const levelBestScores: Record<number, number> = {};
  if (rawScores && typeof rawScores === "object") {
    for (const [key, score] of Object.entries(rawScores)) {
      const level = Number(key);
      const valueScore = Number(score);
      if (Number.isInteger(level) && level >= 1 && level <= MAX_LEVEL_ID && Number.isFinite(valueScore) && valueScore >= 0) {
        levelBestScores[level] = Math.floor(valueScore);
      }
    }
  }

  const settings = candidate.settings;
  const musicVolume = Number(settings?.musicVolume ?? DEFAULT_SAVE.settings.musicVolume);
  const sfxVolume = Number(settings?.sfxVolume ?? DEFAULT_SAVE.settings.sfxVolume);
  const totals = candidate.totals;
  const seeds = Number(totals?.seeds ?? 0);
  const universeSeeds = Number(totals?.universeSeeds ?? 0);
  const bloomsCast = Number(totals?.bloomsCast ?? 0);

  return {
    highestUnlockedLevel: safeHighestUnlocked,
    levelBestScores,
    totals: {
      seeds: Number.isFinite(seeds) ? Math.max(0, Math.floor(seeds)) : 0,
      universeSeeds: Number.isFinite(universeSeeds) ? Math.max(0, Math.floor(universeSeeds)) : 0,
      bloomsCast: Number.isFinite(bloomsCast) ? Math.max(0, Math.floor(bloomsCast)) : 0,
    },
    settings: {
      musicVolume: clamp01(musicVolume),
      sfxVolume: clamp01(sfxVolume),
    },
  };
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0.5;
  }
  return Math.min(1, Math.max(0, value));
}

export class SaveSystem {
  static load(): SaveData {
    if (typeof window === "undefined" || !window.localStorage) {
      return structuredClone(DEFAULT_SAVE);
    }
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) {
        return structuredClone(DEFAULT_SAVE);
      }
      const parsed = JSON.parse(raw) as unknown;
      return sanitizeSaveData(parsed);
    } catch {
      return structuredClone(DEFAULT_SAVE);
    }
  }

  static save(data: SaveData): void {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    const safe = sanitizeSaveData(data);
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(safe));
  }

  static reset(): void {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(SAVE_KEY);
  }

  static mergeProgress(
    levelId: number,
    score: number,
    economy?: { seedsEarned?: number; universeSeedsEarned?: number; bloomsCast?: number },
  ): SaveData {
    const existing = SaveSystem.load();
    existing.highestUnlockedLevel = Math.max(existing.highestUnlockedLevel, Math.min(MAX_LEVEL_ID, levelId + 1));
    const best = existing.levelBestScores[levelId] ?? 0;
    existing.levelBestScores[levelId] = Math.max(best, Math.floor(score));
    existing.totals.seeds += Math.max(0, Math.floor(economy?.seedsEarned ?? 0));
    existing.totals.universeSeeds += Math.max(0, Math.floor(economy?.universeSeedsEarned ?? 0));
    existing.totals.bloomsCast += Math.max(0, Math.floor(economy?.bloomsCast ?? 0));
    SaveSystem.save(existing);
    return existing;
  }
}

export { DEFAULT_SAVE, SAVE_KEY };
