import { describe, expect, test } from "vitest";
import { calculateWormholePullVector } from "../../src/systems/wormholeMath";

describe("wormhole pull", () => {
  test("returns zero force outside radius", () => {
    const pull = calculateWormholePullVector(100, 100, 500, 500, 180, 700);
    expect(pull.intensity).toBe(0);
    expect(pull.x).toBe(0);
    expect(pull.y).toBe(0);
  });

  test("returns stronger pull for closer targets", () => {
    const far = calculateWormholePullVector(100, 100, 220, 100, 200, 700);
    const near = calculateWormholePullVector(100, 100, 140, 100, 200, 700);

    expect(near.intensity).toBeGreaterThan(far.intensity);
    expect(Math.abs(near.x)).toBeGreaterThan(Math.abs(far.x));
  });

  test("force points toward wormhole center", () => {
    const pull = calculateWormholePullVector(200, 200, 300, 200, 220, 600);
    expect(pull.x).toBeLessThan(0);
    expect(Math.abs(pull.y)).toBeLessThan(0.001);
  });
});
