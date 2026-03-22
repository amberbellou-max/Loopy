export type TokenMasteryTier = "efficient" | "balanced" | "verbose";

export interface TokenCurriculumPlan {
  contextWindow: number;
  milestoneBudgets: number[];
}

export interface TokenBudgetSnapshot {
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedTotalTokens: number;
  contextWindow: number;
  remainingTokens: number;
  outputToInputRatio: number;
  masteryTier: TokenMasteryTier;
  masteryLabel: string;
}

function clampWholeNumber(value: number, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.floor(value));
}

export function createTokenCurriculumPlan(levelId: number, quota: number): TokenCurriculumPlan {
  const safeLevelId = Math.max(1, clampWholeNumber(levelId, 1));
  const safeQuota = Math.max(1, clampWholeNumber(quota, 1));
  const contextWindow = Math.max(140, safeQuota * 10 + safeLevelId * 12);
  const milestoneBudgets = [
    Math.max(24, Math.round(contextWindow * 0.35)),
    Math.max(48, Math.round(contextWindow * 0.72)),
  ];
  return { contextWindow, milestoneBudgets };
}

export function evaluateTokenBudget(
  inputTokens: number,
  outputTokens: number,
  contextWindow: number,
): TokenBudgetSnapshot {
  const safeInputTokens = clampWholeNumber(inputTokens, 0);
  const safeOutputTokens = clampWholeNumber(outputTokens, 0);
  const safeContextWindow = Math.max(1, clampWholeNumber(contextWindow, 1));

  const estimatedTotalTokens = safeInputTokens + safeOutputTokens;
  const remainingTokens = safeContextWindow - estimatedTotalTokens;
  const outputToInputRatio = safeOutputTokens / Math.max(1, safeInputTokens);

  let masteryTier: TokenMasteryTier = "verbose";
  if (estimatedTotalTokens <= safeContextWindow * 0.72 && outputToInputRatio <= 1.2) {
    masteryTier = "efficient";
  } else if (estimatedTotalTokens <= safeContextWindow * 1.02 && outputToInputRatio <= 1.8) {
    masteryTier = "balanced";
  }

  const masteryLabel = masteryTier === "efficient" ? "Efficient" : masteryTier === "balanced" ? "Balanced" : "Verbose";

  return {
    estimatedInputTokens: safeInputTokens,
    estimatedOutputTokens: safeOutputTokens,
    estimatedTotalTokens,
    contextWindow: safeContextWindow,
    remainingTokens,
    outputToInputRatio,
    masteryTier,
    masteryLabel,
  };
}
