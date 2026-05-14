import { expect, test } from "@playwright/test";

type FairyForageSnapshot = {
  phase: string;
  level: number;
  fedCount: number;
  feedGoal: number;
  bunnies: number;
  ripeFruit: number;
  plots: number;
  fairyHealth: number;
  famineRemainingMs: number;
  eagleHp: number | null;
};

type FairyForageDebug = {
  startGame: (level?: number) => void;
  plantAt: (x: number, y: number) => boolean;
  forceFruit: (count?: number) => void;
  castMagic: () => void;
  getSnapshot: () => FairyForageSnapshot;
};

declare global {
  interface Window {
    fairyForageDebug?: FairyForageDebug;
  }
}

async function prepare(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("/?e2e=1");
  await page.waitForFunction(() => Boolean(window.fairyForageDebug && document.body.dataset.fairyReady));
}

test("starts the playable fairy forage loop", async ({ page }) => {
  await prepare(page);
  await page.evaluate(() => window.fairyForageDebug?.startGame(1));
  await page.waitForFunction(() => document.body.dataset.fairyPhase === "playing");

  const snapshot = await page.evaluate(() => window.fairyForageDebug?.getSnapshot());
  expect(snapshot?.level).toBe(1);
  expect(snapshot?.bunnies).toBeGreaterThanOrEqual(2);
  expect(snapshot?.feedGoal).toBeGreaterThan(0);
});

test("plants fruit and bunnies multiply after eating", async ({ page }) => {
  await prepare(page);
  await page.evaluate(() => {
    window.fairyForageDebug?.startGame(1);
    window.fairyForageDebug?.forceFruit(3);
  });

  await page.waitForFunction(() => {
    const snapshot = window.fairyForageDebug?.getSnapshot();
    return Boolean(snapshot && snapshot.fedCount >= 1 && snapshot.bunnies > 2);
  });

  const snapshot = await page.evaluate(() => window.fairyForageDebug?.getSnapshot());
  expect(snapshot?.fedCount).toBeGreaterThanOrEqual(1);
  expect(snapshot?.bunnies).toBeGreaterThan(2);
});

test("higher levels increase bunny multiplication and enable eagle pressure", async ({ page }) => {
  await prepare(page);
  await page.evaluate(() => {
    window.fairyForageDebug?.startGame(3);
    window.fairyForageDebug?.forceFruit(1);
  });

  await page.waitForFunction(() => {
    const snapshot = window.fairyForageDebug?.getSnapshot();
    return Boolean(snapshot && snapshot.fedCount >= 1);
  });

  const snapshot = await page.evaluate(() => window.fairyForageDebug?.getSnapshot());
  expect(snapshot?.level).toBe(3);
  expect(snapshot?.bunnies).toBeGreaterThanOrEqual(5);

  await page.waitForFunction(() => {
    const snapshot = window.fairyForageDebug?.getSnapshot();
    return snapshot?.eagleHp !== null;
  });
});
