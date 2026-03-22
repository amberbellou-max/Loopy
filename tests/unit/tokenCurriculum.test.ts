import { describe, expect, test } from "vitest";
import { createTokenCurriculumPlan, evaluateTokenBudget } from "../../src/systems/tokenCurriculum";

describe("token curriculum", () => {
  test("plan scales context window with level and quota", () => {
    const early = createTokenCurriculumPlan(1, 12);
    const late = createTokenCurriculumPlan(12, 26);

    expect(late.contextWindow).toBeGreaterThan(early.contextWindow);
    expect(early.milestoneBudgets).toHaveLength(2);
    expect(early.milestoneBudgets[0]).toBeLessThan(early.milestoneBudgets[1]);
    expect(early.milestoneBudgets[1]).toBeLessThan(early.contextWindow);
  });

  test("marks efficient mastery for concise token usage", () => {
    const snapshot = evaluateTokenBudget(40, 32, 160);

    expect(snapshot.estimatedTotalTokens).toBe(72);
    expect(snapshot.masteryTier).toBe("efficient");
    expect(snapshot.masteryLabel).toBe("Efficient");
    expect(snapshot.remainingTokens).toBe(88);
  });

  test("marks balanced mastery near full-window usage", () => {
    const snapshot = evaluateTokenBudget(28, 44, 90);

    expect(snapshot.estimatedTotalTokens).toBe(72);
    expect(snapshot.masteryTier).toBe("balanced");
    expect(snapshot.masteryLabel).toBe("Balanced");
  });

  test("marks verbose mastery when output dominates or budget overflows", () => {
    const snapshot = evaluateTokenBudget(20, 82, 80);

    expect(snapshot.estimatedTotalTokens).toBe(102);
    expect(snapshot.masteryTier).toBe("verbose");
    expect(snapshot.masteryLabel).toBe("Verbose");
    expect(snapshot.remainingTokens).toBe(-22);
  });

  test("coerces invalid values into safe non-negative numbers", () => {
    const snapshot = evaluateTokenBudget(Number.NaN, Number.POSITIVE_INFINITY, 0);

    expect(snapshot.estimatedInputTokens).toBe(0);
    expect(snapshot.estimatedOutputTokens).toBe(0);
    expect(snapshot.contextWindow).toBe(1);
    expect(snapshot.remainingTokens).toBe(1);
  });
});
