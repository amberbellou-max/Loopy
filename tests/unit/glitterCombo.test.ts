import { describe, expect, test } from "vitest";
import { GlitterComboSystem, tapsToAction } from "../../src/systems/glitterCombo";

describe("glitter combo", () => {
  test("maps tap counts to actions", () => {
    expect(tapsToAction(1)).toBe("shot");
    expect(tapsToAction(2)).toBe("bomb");
    expect(tapsToAction(3)).toBe("shield");
    expect(tapsToAction(7)).toBe("shield");
  });

  test("resolves single tap after combo window", () => {
    const combo = new GlitterComboSystem(450);
    combo.registerTap(1000);

    expect(combo.resolve(1400)).toBeNull();
    expect(combo.resolve(1450)).toBe("shot");
  });

  test("resolves triple tap within combo window", () => {
    const combo = new GlitterComboSystem(450);
    combo.registerTap(1000);
    combo.registerTap(1200);
    combo.registerTap(1390);

    expect(combo.getPendingTapCount(1600)).toBe(3);
    expect(combo.resolve(1841)).toBe("shield");
  });
});
