import { MAX_LEVEL_ID } from "../data/levels";

export interface DifficultyParams {
  levelId: number;
  tier: number;
  quotaBonus: number;
  timePenaltySec: number;
  predatorSpeedMultiplier: number;
  predatorShootIntervalMultiplier: number;
  projectileSpeedMultiplier: number;
  wormholePullMultiplier: number;
  wormholeShootIntervalMultiplier: number;
  extraPredators: number;
  extraWormholes: number;
  extraHazards: number;
}

export function getDifficultyParams(levelId: number): DifficultyParams {
  const clampedLevel = Math.min(MAX_LEVEL_ID, Math.max(1, Math.floor(levelId)));
  const baseRampLevel = Math.min(16, clampedLevel);
  const t = (baseRampLevel - 1) / 15;
  const lateLevelBonus = Math.max(0, clampedLevel - 16);
  const tier = Math.floor((clampedLevel - 1) / 4);

  return {
    levelId: clampedLevel,
    tier,
    quotaBonus: Math.floor(t * 6) + lateLevelBonus * 2,
    timePenaltySec: Math.floor(t * 40) + lateLevelBonus * 4,
    predatorSpeedMultiplier: 1 + t * 0.95 + lateLevelBonus * 0.09,
    predatorShootIntervalMultiplier: Math.max(0.28, 1 - t * 0.58 - lateLevelBonus * 0.05),
    projectileSpeedMultiplier: 1 + t * 0.9 + lateLevelBonus * 0.08,
    wormholePullMultiplier: 1 + t * 1.15 + lateLevelBonus * 0.16,
    wormholeShootIntervalMultiplier: Math.max(0.34, 1 - t * 0.52 - lateLevelBonus * 0.05),
    extraPredators: tier + (clampedLevel >= 12 ? 2 : 0) + (clampedLevel >= 17 ? 1 : 0),
    extraWormholes: clampedLevel >= 9 ? Math.max(1, tier - 1) + (clampedLevel >= 18 ? 1 : 0) : 0,
    extraHazards: Math.max(0, tier - 1) + (clampedLevel >= 10 ? 1 : 0) + (clampedLevel >= 18 ? 1 : 0),
  };
}

export function scaleQuota(baseQuota: number, params: DifficultyParams): number {
  return Math.max(1, baseQuota + params.quotaBonus);
}

export function scaleTimeLimit(baseTimeLimitSec: number | undefined, params: DifficultyParams): number | null {
  if (baseTimeLimitSec === undefined) {
    return null;
  }
  return Math.max(45, baseTimeLimitSec - params.timePenaltySec);
}

export function checkpointSeedCost(levelId: number): number {
  return 2 + Math.floor(Math.min(MAX_LEVEL_ID, Math.max(1, levelId)) / 2);
}
