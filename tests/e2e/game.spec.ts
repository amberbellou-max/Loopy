import { expect, test } from "@playwright/test";

type LoopyDebug = {
  resetSave: () => void;
  startLevel: (level: number) => void;
  openWorldMap: (selectedLevel?: number) => void;
  getSave: () => {
    highestUnlockedLevel: number;
    levelBestScores: Record<number, number>;
  };
};

async function prepare(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("/?e2e=1");
  await page.waitForFunction(() => Boolean((window as Window & { loopyDebug?: LoopyDebug }).loopyDebug));
  await page.evaluate(() => {
    (window as Window & { loopyDebug?: LoopyDebug }).loopyDebug?.resetSave();
  });
}

async function startLevel(page: import("@playwright/test").Page, level: number): Promise<void> {
  await page.evaluate((targetLevel) => {
    (window as Window & { loopyDebug?: LoopyDebug }).loopyDebug?.startLevel(targetLevel);
  }, level);
  await page.waitForFunction(
    (expected) => document.body.dataset.loopyCurrentLevel === String(expected),
    level,
  );
}

async function completeLevelWithDebugKey(page: import("@playwright/test").Page, level: number): Promise<void> {
  await page.keyboard.press("N");
  await page.waitForFunction(
    (expected) => document.body.dataset.loopyLevelCompleted === String(expected),
    level,
  );
}

test("start run, finish level 1, unlock level 2", async ({ page }) => {
  await prepare(page);
  await startLevel(page, 1);
  await completeLevelWithDebugKey(page, 1);

  const unlocked = await page.evaluate(
    () => (window as Window & { loopyDebug?: LoopyDebug }).loopyDebug?.getSave().highestUnlockedLevel,
  );
  expect(unlocked).toBe(2);
});

test("checkpoint death respawns player at checkpoint", async ({ page }) => {
  await prepare(page);
  await startLevel(page, 1);

  await page.keyboard.press("C");
  await page.waitForFunction(() => Boolean(document.body.dataset.loopyLastCheckpointX));

  await page.keyboard.press("K");
  await page.waitForFunction(() => document.body.dataset.loopyRespawnCount === "1");
});

test("milestone completion unlocks ability", async ({ page }) => {
  await prepare(page);

  for (const level of [1, 2, 3, 4]) {
    await startLevel(page, level);
    await completeLevelWithDebugKey(page, level);
  }

  await page.waitForFunction(() => document.body.dataset.loopyAbilityUnlocked === "dash");

  const unlocked = await page.evaluate(
    () => (window as Window & { loopyDebug?: LoopyDebug }).loopyDebug?.getSave().highestUnlockedLevel,
  );
  expect(unlocked).toBe(5);
});

test("save persists after reload", async ({ page }) => {
  await prepare(page);
  await startLevel(page, 1);
  await completeLevelWithDebugKey(page, 1);

  await page.reload();
  await page.waitForFunction(() => Boolean((window as Window & { loopyDebug?: LoopyDebug }).loopyDebug));

  const unlocked = await page.evaluate(
    () => (window as Window & { loopyDebug?: LoopyDebug }).loopyDebug?.getSave().highestUnlockedLevel,
  );
  expect(unlocked).toBe(2);
});
