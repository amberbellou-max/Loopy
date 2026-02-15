export type GlitterComboAction = "shot" | "bomb" | "shield";

export const COMBO_WINDOW_MS = 450;

export class GlitterComboSystem {
  private taps = 0;
  private comboExpiresAt = 0;
  private readonly comboWindowMs: number;

  constructor(comboWindowMs = COMBO_WINDOW_MS) {
    this.comboWindowMs = comboWindowMs;
  }

  registerTap(now: number): number {
    if (this.taps === 0 || now > this.comboExpiresAt) {
      this.taps = 1;
      this.comboExpiresAt = now + this.comboWindowMs;
      return this.taps;
    }

    this.taps = Math.min(3, this.taps + 1);
    this.comboExpiresAt = now + this.comboWindowMs;
    return this.taps;
  }

  resolve(now: number): GlitterComboAction | null {
    if (this.taps === 0) {
      return null;
    }
    if (now < this.comboExpiresAt) {
      return null;
    }

    const action = tapsToAction(this.taps);
    this.taps = 0;
    this.comboExpiresAt = 0;
    return action;
  }

  getPendingTapCount(now: number): number {
    if (this.taps === 0) {
      return 0;
    }
    if (now > this.comboExpiresAt) {
      return 0;
    }
    return this.taps;
  }

  expire(now: number): void {
    if (this.taps > 0 && now >= this.comboExpiresAt) {
      this.clear();
    }
  }

  clear(): void {
    this.taps = 0;
    this.comboExpiresAt = 0;
  }
}

export function tapsToAction(taps: number): GlitterComboAction {
  if (taps >= 3) {
    return "shield";
  }
  if (taps === 2) {
    return "bomb";
  }
  return "shot";
}
