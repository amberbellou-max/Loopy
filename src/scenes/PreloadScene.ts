import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  create(): void {
    this.createTextures();
    this.scene.start("MainMenuScene");
  }

  private createTextures(): void {
    this.drawPixelTexture("player", [
      "..cccc..",
      ".cffffc.",
      "cff77ffc",
      "cf7777fc",
      "cf7777fc",
      "cff77ffc",
      ".cffffc.",
      "..cccc..",
    ], {
      c: "#2b8f73",
      f: "#7be8c0",
      7: "#d8fff0",
    });

    this.drawPixelTexture("food_river_fish", [
      "...bb...",
      "..bbbb..",
      ".bb99bb.",
      ".b9999b.",
      ".bb99bb.",
      "..bbbb..",
      "...bb...",
      "........",
    ], {
      b: "#3d87d5",
      9: "#8dd9ff",
    });

    this.drawPixelTexture("food_earth_hopper_fish", [
      "........",
      "..gggg..",
      ".gg88gg.",
      ".g8888g.",
      ".gg88gg.",
      "..gggg..",
      "..g..g..",
      ".g....g.",
    ], {
      g: "#4b8d34",
      8: "#a9f46d",
    });

    this.drawPixelTexture("food_grass_bite", [
      "...mm...",
      "..mmmm..",
      ".mm66mm.",
      "..mmmm..",
      "...mm...",
      "........",
      "........",
      "........",
    ], {
      m: "#2f9950",
      6: "#6af9a6",
    });

    this.drawPixelTexture("food_locust", [
      "...yy...",
      "..yyyy..",
      ".yy55yy.",
      ".y5555y.",
      ".yy55yy.",
      "..y..y..",
      ".y....y.",
      "........",
    ], {
      y: "#b3952f",
      5: "#f3ea73",
    });

    this.drawPixelTexture("predator", [
      "..rrrr..",
      ".rr111rr.",
      "rr1111rr",
      "r111111r",
      "r111111r",
      "rr1111rr",
      ".rr111rr.",
      "..rrrr..",
    ], {
      r: "#9e4020",
      1: "#ff8f65",
    });

    this.drawPixelTexture("wormhole_core", [
      "...pp...",
      "..p22p..",
      ".p2222p.",
      "p22aa22p",
      "p22aa22p",
      ".p2222p.",
      "..p22p..",
      "...pp...",
    ], {
      p: "#3f329a",
      2: "#6d5df6",
      a: "#101828",
    });

    this.drawPixelTexture("projectile_enemy", [
      "..oo..",
      ".oeeo.",
      "oeeeeo",
      "oeeeeo",
      ".oeeo.",
      "..oo..",
    ], {
      o: "#a8651c",
      e: "#ffd078",
    });

    this.drawPixelTexture("projectile_blackhole", [
      "..kk..",
      ".k44k.",
      "k4444k",
      "k4444k",
      ".k44k.",
      "..kk..",
    ], {
      k: "#101828",
      4: "#2f3a49",
    });

    this.drawPixelTexture("glitter_shot", [
      "....s...",
      "...sss..",
      "..sssss.",
      ".ss9ssss",
      "..sssss.",
      "...sss..",
      "....s...",
      "........",
    ], {
      s: "#3eb0d4",
      9: "#c8ffff",
    });

    this.drawPixelTexture("pickup_seed", [
      "........",
      "...nn...",
      "..n33n..",
      "..n33n..",
      "...nn...",
      "....n...",
      "....n...",
      "........",
    ], {
      n: "#2f9e50",
      3: "#7ce68f",
    });

    this.drawPixelTexture("pickup_universe_seed", [
      "........",
      "...uu...",
      "..u44u..",
      "..u44u..",
      "...uu...",
      "...u.u..",
      "..u...u.",
      "........",
    ], {
      u: "#4f3da8",
      4: "#ad95ff",
    });

    this.drawPixelTexture("pickup_life", [
      "........",
      ".hh..hh.",
      "hHHHHHHh",
      "hHHHHHHh",
      ".hHHHHh.",
      "..hHHh..",
      "...hh...",
      "........",
    ], {
      h: "#8f2d36",
      H: "#ff7a86",
    });

    this.drawPixelTexture("boss_core", [
      "...bbbb...",
      "..b8778b..",
      ".b8777778b.",
      "b877aa7778b",
      "b77a11a77b",
      "b877aa7778b",
      ".b8777778b.",
      "..b8778b..",
      "...bbbb...",
      "....bb....",
    ], {
      b: "#1e4b63",
      8: "#66d5ff",
      7: "#d7fbff",
      a: "#6d5df6",
      1: "#101828",
    });

    this.drawRectTexture("hazard_vine", 32, 8, "#2f8f4e");
    this.drawRectTexture("hazard_spike", 32, 8, "#c8a263");

    this.drawRectTexture("exit_gate_jungle", 16, 40, "#74d89d");
    this.drawRectTexture("exit_gate_desert", 16, 40, "#e2c679");
  }

  private drawRectTexture(key: string, width: number, height: number, color: string): void {
    const texture = this.textures.createCanvas(key, width, height);
    if (!texture) {
      return;
    }
    const ctx = texture.context;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    texture.refresh();
  }

  private drawPixelTexture(key: string, pattern: string[], palette: Record<string, string>): void {
    const height = pattern.length;
    const width = pattern[0]?.length ?? 1;
    const texture = this.textures.createCanvas(key, width, height);
    if (!texture) {
      return;
    }
    const ctx = texture.context;

    ctx.clearRect(0, 0, width, height);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const code = pattern[y][x];
        if (code === ".") {
          continue;
        }
        const color = palette[code];
        if (!color) {
          continue;
        }
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    texture.refresh();
  }
}
