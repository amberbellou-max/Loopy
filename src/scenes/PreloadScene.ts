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
      c: "#34b7a9",
      f: "#8bffe0",
      7: "#f4fff8",
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
      b: "#4aa5ff",
      9: "#d2f3ff",
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
      g: "#5fba3f",
      8: "#ccff7a",
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
      m: "#43c96f",
      6: "#b6ffd7",
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
      y: "#ffc74c",
      5: "#fff78a",
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
      r: "#ff5c6c",
      1: "#ffd2b1",
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
      t: "#46a2ff",
      2: "#b3ecff",
      f: "#f2fbff",
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
      u: "#6c57ff",
      4: "#c9b8ff",
      a: "#f3f0ff",
      1: "#15203b",
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
      s: "#57cd66",
      7: "#bcff8c",
      d: "#2f7f3b",
      1: "#17211a",
    });

    this.drawPixelTexture("enemy_snake_segment", [
      "..gg..",
      ".g88g.",
      "g8888g",
      "g8888g",
      ".g88g.",
      "..gg..",
    ], {
      g: "#3aaa4c",
      8: "#9eff7a",
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
      p: "#5f3cff",
      2: "#9a7aff",
      a: "#0d0a1f",
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
      q: "#2f8cff",
      7: "#7ddcff",
      k: "#17314e",
      0: "#050910",
    });

    this.drawPixelTexture("projectile_enemy", [
      "..oo..",
      ".oeeo.",
      "oeeeeo",
      "oeeeeo",
      ".oeeo.",
      "..oo..",
    ], {
      o: "#ff8f3e",
      e: "#fff0ab",
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
      4: "#4d5a77",
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
      s: "#6de6ff",
      9: "#fffbe9",
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
      n: "#43c769",
      3: "#c5ffd2",
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
      u: "#6e5bff",
      4: "#dbc4ff",
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
      h: "#c9415a",
      H: "#ffb7c0",
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
      g: "#88f6ff",
      6: "#cbfbff",
      w: "#f5feff",
      1: "#2d4972",
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
      8: "#87e4ff",
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
