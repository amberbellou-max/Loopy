import Phaser from "phaser";

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
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  ability: boolean;
  dash: boolean;
  bloom: boolean;
};

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
    left: false,
    right: false,
    up: false,
    down: false,
    ability: false,
    dash: false,
    bloom: false,
  };

  private touchAbilityPressedFrame = false;
  private touchDashPressedFrame = false;
  private touchBloomPressedFrame = false;
  private touchControlsEl: HTMLElement | null = null;

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

    this.mountTouchControls();
  }

  read(): InputSnapshot {
    const left = this.isDown(this.cursors.left) || this.isDown(this.keys.a) || this.touchState.left;
    const right = this.isDown(this.cursors.right) || this.isDown(this.keys.d) || this.touchState.right;
    const up = this.isDown(this.cursors.up) || this.isDown(this.keys.w) || this.touchState.up;
    const down = this.isDown(this.cursors.down) || this.isDown(this.keys.s) || this.touchState.down;

    const spaceTappedKeyboard = Phaser.Input.Keyboard.JustDown(this.keys.space);
    const dashPressedKeyboard = Phaser.Input.Keyboard.JustDown(this.keys.shift);
    const bloomPressedKeyboard = Phaser.Input.Keyboard.JustDown(this.keys.q);
    const pausePressed = Phaser.Input.Keyboard.JustDown(this.keys.p) || Phaser.Input.Keyboard.JustDown(this.keys.esc);

    const moveX = Number(right) - Number(left);
    const moveY = Number(down) - Number(up);

    const snapshot: InputSnapshot = {
      moveX,
      moveY,
      spaceTapped: spaceTappedKeyboard || this.touchAbilityPressedFrame,
      spaceHeld: this.isDown(this.keys.space) || this.touchState.ability,
      dashPressed: dashPressedKeyboard || this.touchDashPressedFrame,
      bloomPressed: bloomPressedKeyboard || this.touchBloomPressedFrame,
      pausePressed,
    };

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

    const movement = document.createElement("div");
    movement.className = "touch-cluster";

    const actions = document.createElement("div");
    actions.className = "touch-cluster";

    const left = this.makeTouchButton("L", "left");
    const right = this.makeTouchButton("R", "right");
    const up = this.makeTouchButton("U", "up");
    const down = this.makeTouchButton("D", "down");

    const ability = this.makeTouchButton("A", "ability", true);
    const dash = this.makeTouchButton("DS", "dash", true);
    const bloom = this.makeTouchButton("Q", "bloom", true);

    movement.append(left, right, up, down);
    actions.append(ability, dash, bloom);
    root.append(movement, actions);
    document.body.appendChild(root);

    this.touchControlsEl = root;
  }

  private makeTouchButton(label: string, key: keyof TouchState, actionButton = false): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = "touch-btn";
    button.textContent = label;

    const activate = (): void => {
      this.touchState[key] = true;
      if (actionButton && key === "ability") {
        this.touchAbilityPressedFrame = true;
      }
      if (actionButton && key === "dash") {
        this.touchDashPressedFrame = true;
      }
      if (actionButton && key === "bloom") {
        this.touchBloomPressedFrame = true;
      }
    };

    const deactivate = (): void => {
      this.touchState[key] = false;
    };

    button.addEventListener("touchstart", (event) => {
      event.preventDefault();
      activate();
    });
    button.addEventListener("touchend", (event) => {
      event.preventDefault();
      deactivate();
    });
    button.addEventListener("touchcancel", (event) => {
      event.preventDefault();
      deactivate();
    });

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      activate();
    });
    button.addEventListener("pointerup", (event) => {
      event.preventDefault();
      deactivate();
    });
    button.addEventListener("pointerleave", () => {
      deactivate();
    });

    return button;
  }
}
