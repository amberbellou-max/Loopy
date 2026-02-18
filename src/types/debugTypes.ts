import type { GlitterComboAction } from "../systems/glitterCombo";

export interface InputDebugSnapshot {
  readCount: number;
  keyboardSpaceWasDown: boolean;
  spaceTapCount: number;
  spaceDownTransitions: number;
  spaceUpTransitions: number;
  touchAbilityTapCount: number;
  touchAbilityHeld: boolean;
}

export interface AudioDebugSnapshot {
  activeVoices: number;
  maxVoices: number;
  droppedToneCount: number;
  lastDroppedToneAt: number;
  lastAbilityAt: number;
  lastGlitterShotAt: number;
}

export interface LevelFreezeDiagnostics {
  maxDeltaMs: number;
  longFrameCount: number;
  updateCount: number;
  consecutiveStallFrames: number;
  worstConsecutiveStallFrames: number;
  sustainedStallDetected: boolean;
}

export interface LevelDebugSnapshot {
  coordinateSystem: "origin top-left, +x right, +y down";
  scene: "LevelScene";
  levelId: number;
  nowMs: number;
  completed: boolean;
  player: {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    facingDirection: number;
    health: number;
    maxHealth: number;
  };
  objective: {
    collected: number;
    quota: number;
    timeLeftSec: number | null;
  };
  economy: {
    livesRemaining: number;
    seedCount: number;
    universeSeedCount: number;
    bloomMeter: number;
    checkpointCost: number;
    checkpointCursor: number;
    currentCheckpoint: { x: number; y: number };
  };
  spaceCombat: {
    pendingComboTaps: number;
    lastResolvedAction: GlitterComboAction | null;
    lastResolvedActionAt: number;
    lastBlockedReason: string | null;
    lastBlockedAt: number;
    holdShotIntervalMs: number;
    nextHoldShotInMs: number;
  };
  entities: {
    foods: number;
    predators: number;
    wormholes: number;
    projectilesEnemy: number;
    projectilesPlayer: number;
    projectilesTotal: number;
    glitterShots: number;
    pickups: number;
    bossAlive: boolean;
    bossHpRatio: number | null;
    bossPhase: 1 | 2 | 3 | null;
  };
  statusWindows: {
    shieldRemainingMs: number;
    bloomRemainingMs: number;
    oceanTrapActive: boolean;
    oceanEscapeProgress: number;
    oceanEscapeGoal: number;
    oceanEscapeSpaceHits: number;
  };
  freezeDiagnostics: LevelFreezeDiagnostics;
  inputDebug: InputDebugSnapshot;
  audioDebug: AudioDebugSnapshot;
}
