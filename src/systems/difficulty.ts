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
  const clampedLevel = Math.min(16, Math.max(1, Math.floor(levelId)));
  const t = (clampedLevel - 1) / 15;
  const tier = Math.floor((clampedLevel - 1) / 4);

  return {
    levelId: clampedLevel,
    tier,
    quotaBonus: Math.floor(t * 6),
    timePenaltySec: Math.floor(t * 40),
    predatorSpeedMultiplier: 1 + t * 0.95,
    predatorShootIntervalMultiplier: Math.max(0.38, 1 - t * 0.58),
    projectileSpeedMultiplier: 1 + t * 0.9,
    wormholePullMultiplier: 1 + t * 1.15,
    wormholeShootIntervalMultiplier: Math.max(0.45, 1 - t * 0.52),
    extraPredators: tier + (clampedLevel >= 12 ? 2 : 0),
    extraWormholes: clampedLevel >= 9 ? Math.max(1, tier - 1) : 0,
    extraHazards: Math.max(0, tier - 1) + (clampedLevel >= 10 ? 1 : 0),
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
  return 2 + Math.floor(Math.min(16, Math.max(1, levelId)) / 2);
}
