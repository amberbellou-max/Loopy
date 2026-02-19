export type Biome = "jungle" | "desert";

export type FoodType = "river_fish" | "earth_hopper_fish" | "grass_bite" | "locust";

export type AbilityType = "dash" | "glide" | "shockwave" | "phase_blink";

export interface FoodSpawnRule {
  foodType: FoodType;
  x: number;
  y: number;
  count: number;
  spreadX: number;
  spreadY: number;
  movement: "drift" | "hopper" | "swarm" | "static" | "orbit";
}

export interface PredatorSpawnRule {
  x: number;
  y: number;
  count: number;
  spacing: number;
  speed: number;
  shootIntervalMs: number;
  projectileSpeed: number;
}

export interface WormholeRule {
  x: number;
  y: number;
  pullRadius: number;
  pullStrength: number;
  shootIntervalMs: number;
  projectileSpeed: number;
}

export interface HazardRule {
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
  type: "vine" | "sand_spike";
}

export interface SeedDrainRule {
  intervalMs: number;
  amount: number;
  radius: number;
  consumePickups?: boolean;
}

export interface SeedFountainGhostRule {
  triggerX: number;
  x: number;
  y: number;
  rewardSeeds: 3 | 6 | 9;
  visibleMs?: number;
}

export interface LevelDefinition {
  id: number;
  biome: Biome;
  quota: number;
  timeLimitSec?: number;
  checkpointX: number[];
  exitGateX: number;
  playerStart: { x: number; y: number };
  foods: FoodSpawnRule[];
  predators: PredatorSpawnRule[];
  wormholes: WormholeRule[];
  hazards: HazardRule[];
  seedDrain?: SeedDrainRule;
  seedFountainGhosts?: SeedFountainGhostRule[];
  milestone: boolean;
  unlocksAbility?: AbilityType;
}

export interface SaveData {
  highestUnlockedLevel: number;
  levelBestScores: Record<number, number>;
  totals: {
    seeds: number;
    universeSeeds: number;
    bloomsCast: number;
  };
  settings: {
    musicVolume: number;
    sfxVolume: number;
  };
}

export const GAME_EVENTS = {
  PLAYER_DAMAGED: "PLAYER_DAMAGED",
  QUOTA_PROGRESS: "QUOTA_PROGRESS",
  CHECKPOINT_REACHED: "CHECKPOINT_REACHED",
  LEVEL_COMPLETED: "LEVEL_COMPLETED",
  ABILITY_UNLOCKED: "ABILITY_UNLOCKED",
} as const;

export type GameEventKey = (typeof GAME_EVENTS)[keyof typeof GAME_EVENTS];
