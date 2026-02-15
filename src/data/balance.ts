export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_BASE_SPEED = 330;
export const PLAYER_ACCEL = 1800;
export const PLAYER_DRAG = 120;
export const PLAYER_INVULN_MS = 900;

export const DAMAGE = {
  projectile: 14,
  blackHoleProjectile: 22,
  predatorContact: 18,
  hazardTouch: 16,
  wormholeCoreReset: 999,
} as const;

export const ABILITY_COOLDOWN_MS = {
  dash: 3200,
  glide: 2600,
  shockwave: 5000,
  phase_blink: 4200,
} as const;

export const CHECKPOINT_RESPAWN_HEALTH_RATIO = 0.6;

export const HUD = {
  margin: 16,
};
