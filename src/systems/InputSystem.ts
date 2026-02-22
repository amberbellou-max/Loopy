import Phaser from "phaser";
import type { InputDebugSnapshot } from "../types/debugTypes";
import { isLikelyTouchDevice } from "./deviceProfile";

export interface InputSnapshot {
  moveX: number;
  moveY: number;
  spaceTapped: boolean;
  spaceHeld: boolean;
  dashPressed: boolean;
  bloomPressed: boolean;
  pausePressed: boolean;
}

type TouchState = {
  ability: boolean;
  dash: boolean;
  bloom: boolean;
};

type TouchActionKey = keyof TouchState;

export class InputSystem {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly keys: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    q: Phaser.Input.Keyboard.Key;
    shift: Phaser.Input.Keyboard.Key;
    p: Phaser.Input.Keyboard.Key;
    esc: Phaser.Input.Keyboard.Key;
  };

  private touchState: TouchState = {
    ability: false,
    dash: false,
    bloom: false,
  };
  private readonly touchControlsEnabled: boolean;
  private readonly touchMove = new Phaser.Math.Vector2(0, 0);
  private touchPadEl: HTMLDivElement | null = null;
  private touchPadKnobEl: HTMLDivElement | null = null;
  private touchPadPointerId: number | null = null;
  private touchPadRadius = 42;
  private readonly touchActionPointerIds: Partial<Record<TouchActionKey, number>> = {};

  private touchAbilityPressedFrame = false;
  private touchDashPressedFrame = false;
  private touchBloomPressedFrame = false;
  private touchControlsEl: HTMLElement | null = null;
  private keyboardSpaceWasDown = false;
  private debugReadCount = 0;
  private debugSpaceTapCount = 0;
  private debugSpaceDownTransitions = 0;
  private debugSpaceUpTransitions = 0;
  private debugTouchAbilityTapCount = 0;
  private onWindowBlur: (() => void) | null = null;
  private onDocumentVisibilityChange: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    this.cursors = keyboard?.createCursorKeys() ?? ({} as Phaser.Types.Input.Keyboard.CursorKeys);
    this.keys = keyboard?.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      q: Phaser.Input.Keyboard.KeyCodes.Q,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      p: Phaser.Input.Keyboard.KeyCodes.P,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
    }) as InputSystem["keys"];

    keyboard?.addCapture([
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.S,
      Phaser.Input.Keyboard.KeyCodes.D,
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.SHIFT,
      Phaser.Input.Keyboard.KeyCodes.Q,
      Phaser.Input.Keyboard.KeyCodes.P,
      Phaser.Input.Keyboard.KeyCodes.ESC,
    ]);

    this.touchControlsEnabled = isLikelyTouchDevice();
    if (this.touchControlsEnabled) {
      this.mountTouchControls();
    }

    if (typeof window !== "undefined") {
      this.onWindowBlur = () => this.resetTouchState();
      window.addEventListener("blur", this.onWindowBlur);
    }
    if (typeof document !== "undefined") {
      this.onDocumentVisibilityChange = () => {
        if (document.hidden) {
          this.resetTouchState();
        }
      };
      document.addEventListener("visibilitychange", this.onDocumentVisibilityChange);
    }
  }

  read(): InputSnapshot {
    this.debugReadCount += 1;

    const left = this.isDown(this.cursors.left) || this.isDown(this.keys.a);
    const right = this.isDown(this.cursors.right) || this.isDown(this.keys.d);
    const up = this.isDown(this.cursors.up) || this.isDown(this.keys.w);
    const down = this.isDown(this.cursors.down) || this.isDown(this.keys.s);

    const keyboardSpaceDown = this.isDown(this.keys.space);
    if (keyboardSpaceDown && !this.keyboardSpaceWasDown) {
      this.debugSpaceDownTransitions += 1;
    } else if (!keyboardSpaceDown && this.keyboardSpaceWasDown) {
      this.debugSpaceUpTransitions += 1;
    }
    const spaceTappedKeyboard = keyboardSpaceDown && !this.keyboardSpaceWasDown;
    this.keyboardSpaceWasDown = keyboardSpaceDown;
    const dashPressedKeyboard = Phaser.Input.Keyboard.JustDown(this.keys.shift);
    const bloomPressedKeyboard = Phaser.Input.Keyboard.JustDown(this.keys.q);
    const pausePressed = Phaser.Input.Keyboard.JustDown(this.keys.p) || Phaser.Input.Keyboard.JustDown(this.keys.esc);

    const moveX = Phaser.Math.Clamp(Number(right) - Number(left) + this.touchMove.x, -1, 1);
    const moveY = Phaser.Math.Clamp(Number(down) - Number(up) + this.touchMove.y, -1, 1);

    const snapshot: InputSnapshot = {
      moveX,
      moveY,
      spaceTapped: spaceTappedKeyboard || this.touchAbilityPressedFrame,
      spaceHeld: keyboardSpaceDown || this.touchState.ability,
      dashPressed: dashPressedKeyboard || this.touchDashPressedFrame,
      bloomPressed: bloomPressedKeyboard || this.touchBloomPressedFrame,
      pausePressed,
    };

    if (snapshot.spaceTapped) {
      this.debugSpaceTapCount += 1;
    }

    this.touchAbilityPressedFrame = false;
    this.touchDashPressedFrame = false;
    this.touchBloomPressedFrame = false;

    return snapshot;
  }

  destroy(): void {
    if (this.touchControlsEl?.parentElement) {
      this.touchControlsEl.parentElement.removeChild(this.touchControlsEl);
    }
    this.touchControlsEl = null;
    this.touchPadEl = null;
    this.touchPadKnobEl = null;

    if (this.onWindowBlur && typeof window !== "undefined") {
      window.removeEventListener("blur", this.onWindowBlur);
      this.onWindowBlur = null;
    }

    if (this.onDocumentVisibilityChange && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.onDocumentVisibilityChange);
      this.onDocumentVisibilityChange = null;
    }
  }

  getDebugSnapshot(): InputDebugSnapshot {
    return {
      readCount: this.debugReadCount,
      keyboardSpaceWasDown: this.keyboardSpaceWasDown,
      spaceTapCount: this.debugSpaceTapCount,
      spaceDownTransitions: this.debugSpaceDownTransitions,
      spaceUpTransitions: this.debugSpaceUpTransitions,
      touchAbilityTapCount: this.debugTouchAbilityTapCount,
      touchAbilityHeld: this.touchState.ability,
      touchMoveX: Number(this.touchMove.x.toFixed(3)),
      touchMoveY: Number(this.touchMove.y.toFixed(3)),
      touchControlsMounted: this.touchControlsEnabled,
    };
  }

  isTouchControlsEnabled(): boolean {
    return this.touchControlsEnabled;
  }

  private isDown(key: Phaser.Input.Keyboard.Key | undefined): boolean {
    return Boolean(key?.isDown);
  }

  private mountTouchControls(): void {
    if (typeof document === "undefined") {
      return;
    }
    const root = document.createElement("div");
    root.id = "touch-controls";
    root.dataset.enabled = "true";

    const movement = document.createElement("div");
    movement.className = "touch-cluster touch-cluster--move";
    const pad = document.createElement("div");
    pad.className = "touch-pad";
    const knob = document.createElement("div");
    knob.className = "touch-pad-knob";
    pad.appendChild(knob);
    movement.append(pad);
    this.touchPadEl = pad;
    this.touchPadKnobEl = knob;
    this.bindTouchPad();

    const actions = document.createElement("div");
    actions.className = "touch-cluster touch-cluster--actions";

    const ability = this.makeTouchButton("SPACE", "ability", true);
    ability.classList.add("touch-btn--primary");
    const dash = this.makeTouchButton("DASH", "dash", true);
    const bloom = this.makeTouchButton("BLOOM", "bloom", true);
    actions.append(ability, dash, bloom);
    root.append(movement, actions);
    document.body.appendChild(root);

    this.touchControlsEl = root;
  }

  private makeTouchButton(label: string, key: TouchActionKey, actionButton = false): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = "touch-btn";
    button.textContent = label;
    button.setAttribute("aria-label", label);

    const activate = (pointerId: number): void => {
      this.touchActionPointerIds[key] = pointerId;
      this.touchState[key] = true;
      if (actionButton && key === "ability") {
        this.touchAbilityPressedFrame = true;
        this.debugTouchAbilityTapCount += 1;
      }
      if (actionButton && key === "dash") {
        this.touchDashPressedFrame = true;
      }
      if (actionButton && key === "bloom") {
        this.touchBloomPressedFrame = true;
      }
    };

    const deactivate = (pointerId: number): void => {
      if (this.touchActionPointerIds[key] !== undefined && this.touchActionPointerIds[key] !== pointerId) {
        return;
      }
      delete this.touchActionPointerIds[key];
      this.touchState[key] = false;
    };

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      activate(event.pointerId);
    });
    button.addEventListener("pointerup", (event) => {
      event.preventDefault();
      deactivate(event.pointerId);
    });
    button.addEventListener("pointercancel", (event) => {
      event.preventDefault();
      deactivate(event.pointerId);
    });
    button.addEventListener("lostpointercapture", (event) => {
      deactivate(event.pointerId);
    });
    button.addEventListener("pointerleave", (event) => {
      deactivate(event.pointerId);
    });

    return button;
  }

  private bindTouchPad(): void {
    if (!this.touchPadEl) {
      return;
    }

    const updateFromEvent = (event: PointerEvent): void => {
      if (!this.touchPadEl) {
        return;
      }
      const rect = this.touchPadEl.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;

      const rawX = (event.clientX - centerX) / this.touchPadRadius;
      const rawY = (event.clientY - centerY) / this.touchPadRadius;
      const magnitude = Math.hypot(rawX, rawY);
      const clampedMagnitude = Phaser.Math.Clamp(magnitude, 0, 1);
      const deadZone = 0.14;
      const scaledMagnitude = clampedMagnitude <= deadZone
        ? 0
        : (clampedMagnitude - deadZone) / (1 - deadZone);

      const unitX = magnitude > 0 ? rawX / magnitude : 0;
      const unitY = magnitude > 0 ? rawY / magnitude : 0;
      this.touchMove.set(unitX * scaledMagnitude, unitY * scaledMagnitude);
      this.updateTouchPadKnob(this.touchMove.x, this.touchMove.y);
    };

    const resetPad = (): void => {
      this.touchPadPointerId = null;
      this.touchMove.set(0, 0);
      this.updateTouchPadKnob(0, 0);
    };

    this.touchPadEl.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      this.touchPadPointerId = event.pointerId;
      this.touchPadEl?.setPointerCapture(event.pointerId);
      updateFromEvent(event);
    });

    this.touchPadEl.addEventListener("pointermove", (event) => {
      if (this.touchPadPointerId !== event.pointerId) {
        return;
      }
      event.preventDefault();
      updateFromEvent(event);
    });

    this.touchPadEl.addEventListener("pointerup", (event) => {
      if (this.touchPadPointerId !== event.pointerId) {
        return;
      }
      event.preventDefault();
      resetPad();
    });

    this.touchPadEl.addEventListener("pointercancel", (event) => {
      if (this.touchPadPointerId !== event.pointerId) {
        return;
      }
      event.preventDefault();
      resetPad();
    });

    this.touchPadEl.addEventListener("lostpointercapture", () => {
      resetPad();
    });
  }

  private updateTouchPadKnob(x: number, y: number): void {
    if (!this.touchPadKnobEl) {
      return;
    }
    const offsetX = Math.round(x * this.touchPadRadius);
    const offsetY = Math.round(y * this.touchPadRadius);
    this.touchPadKnobEl.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  }

  private resetTouchState(): void {
    this.touchState.ability = false;
    this.touchState.dash = false;
    this.touchState.bloom = false;
    this.touchMove.set(0, 0);
    this.touchAbilityPressedFrame = false;
    this.touchDashPressedFrame = false;
    this.touchBloomPressedFrame = false;
    this.touchPadPointerId = null;
    this.updateTouchPadKnob(0, 0);
    delete this.touchActionPointerIds.ability;
    delete this.touchActionPointerIds.dash;
    delete this.touchActionPointerIds.bloom;
  }
}
