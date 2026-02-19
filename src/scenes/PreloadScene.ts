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
      c: "#083a66",
      f: "#31f3ff",
      7: "#ff6ed0",
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
      b: "#1f86ff",
      9: "#bdeeff",
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
      g: "#3fa827",
      8: "#d2ff63",
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
      m: "#2dcf6a",
      6: "#88ffd0",
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
      y: "#ffbb28",
      5: "#fff56a",
    });

    this.drawPixelTexture("predator", [
      "..rrrr..",
      ".rr11rr.",
      "rr1111rr",
      "r111111r",
      "r111111r",
      "rr1111rr",
      ".rr11rr.",
      "..rrrr..",
    ], {
      r: "#ff3f6d",
      1: "#ffe8c8",
    });

    this.drawPixelTexture("enemy_rift_skimmer", [
      "...tt...",
      "..t22t..",
      ".t2222t.",
      "t22ff22t",
      "tt2ff2tt",
      ".tt22tt.",
      "..t..t..",
      ".t....t.",
    ], {
      t: "#1e66d9",
      2: "#57d7ff",
      f: "#e7fbff",
    });

    this.drawPixelTexture("enemy_arcane_totem", [
      "...uu...",
      "..u44u..",
      ".u4aa4u.",
      "u4a11a4u",
      "u4a11a4u",
      ".u4aa4u.",
      "..u44u..",
      "...uu...",
    ], {
      u: "#4f30ef",
      4: "#a08aff",
      a: "#ffdfff",
      1: "#0d1732",
    });

    this.drawPixelTexture("enemy_snake_head", [
      "..ssss..",
      ".s7777s.",
      "s77dd77s",
      "s7d11d7s",
      "s7d11d7s",
      "s77dd77s",
      ".s7777s.",
      "..ssss..",
    ], {
      s: "#2f9e43",
      7: "#a9ff4a",
      d: "#195829",
      1: "#0f170f",
    });

    this.drawPixelTexture("enemy_snake_segment", [
      "..gg..",
      ".g88g.",
      "g8888g",
      "g8888g",
      ".g88g.",
      "..gg..",
    ], {
      g: "#2c8e3e",
      8: "#8aff3a",
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
      p: "#3a1fd4",
      2: "#8f63ff",
      a: "#070513",
    });

    this.drawPixelTexture("wormhole_ocean_core", [
      "..qqqq..",
      ".q7777q.",
      "q77kk77q",
      "q7k00k7q",
      "q7k00k7q",
      "q77kk77q",
      ".q7777q.",
      "..qqqq..",
    ], {
      q: "#1168e9",
      7: "#6de2ff",
      k: "#0d2740",
      0: "#03060f",
    });

    this.drawPixelTexture("projectile_enemy", [
      "..oo..",
      ".oeeo.",
      "oeeeeo",
      "oeeeeo",
      ".oeeo.",
      "..oo..",
    ], {
      o: "#ff6f2d",
      e: "#ffd98e",
    });

    this.drawPixelTexture("projectile_blackhole", [
      "..kk..",
      ".k44k.",
      "k4444k",
      "k4444k",
      ".k44k.",
      "..kk..",
    ], {
      k: "#0d1220",
      4: "#7688ad",
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
      s: "#86f7ff",
      9: "#fff6c9",
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
      n: "#23bf5a",
      3: "#e4ff92",
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
      u: "#5939ff",
      4: "#f2b8ff",
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
      h: "#ff3e63",
      H: "#ffd0de",
    });

    this.drawPixelTexture("seed_fountain_ghost", [
      "...gg...",
      "..g66g..",
      ".g6ww6g.",
      "g6w11w6g",
      "g6wwww6g",
      ".g6ww6g.",
      "..g66g..",
      "...gg...",
    ], {
      g: "#70efff",
      6: "#bff8ff",
      w: "#f5feff",
      1: "#233f67",
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
      b: "#2f7bb0",
      8: "#90eeff",
      7: "#f0feff",
      a: "#8d6bff",
      1: "#101828",
    });

    this.drawRectTexture("hazard_vine", 32, 8, "#4fdc7b");
    this.drawRectTexture("hazard_spike", 32, 8, "#ffd186");

    this.drawRectTexture("exit_gate_jungle", 16, 40, "#98ffb8");
    this.drawRectTexture("exit_gate_desert", 16, 40, "#ffe39d");
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
