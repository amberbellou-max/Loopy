import Phaser from "phaser";
import type { Biome } from "../types/gameTypes";
import type { AudioDebugSnapshot } from "../types/debugTypes";

export class AudioSystem {
  private readonly scene: Phaser.Scene;
  private context: AudioContext | null = null;
  private musicEvent: Phaser.Time.TimerEvent | null = null;
  private musicVolume = 0.45;
  private sfxVolume = 0.55;
  private activeVoices = 0;
  private readonly maxVoices = 32;
  private lastAbilityAt = 0;
  private lastGlitterShotAt = 0;
  private droppedToneCount = 0;
  private lastDroppedToneAt = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scene.input.once("pointerdown", () => {
      this.ensureContext();
    });
  }

  setVolumes(musicVolume: number, sfxVolume: number): void {
    this.musicVolume = Phaser.Math.Clamp(musicVolume, 0, 1);
    this.sfxVolume = Phaser.Math.Clamp(sfxVolume, 0, 1);
  }

  startBiomeMusic(biome: Biome): void {
    this.stopMusic();
    const pattern = biome === "jungle" ? [220, 277, 329] : [146, 174, 220];
    let noteIndex = 0;

    this.musicEvent = this.scene.time.addEvent({
      delay: 780,
      loop: true,
      callback: () => {
        this.playTone(pattern[noteIndex % pattern.length], 0.32, this.musicVolume * 0.32, "triangle");
        noteIndex += 1;
      },
    });
  }

  stopMusic(): void {
    if (this.musicEvent) {
      this.musicEvent.remove(false);
      this.musicEvent = null;
    }
  }

  playEat(): void {
    this.playTone(660, 0.08, this.sfxVolume * 0.5, "sine");
  }

  playHit(): void {
    this.playTone(120, 0.18, this.sfxVolume * 0.65, "sawtooth");
  }

  playAbility(): void {
    const now = this.scene.time.now;
    if (now - this.lastAbilityAt < 80) {
      return;
    }
    this.lastAbilityAt = now;
    this.playTone(400, 0.12, this.sfxVolume * 0.65, "square");
    this.playTone(800, 0.08, this.sfxVolume * 0.5, "triangle");
  }

  playGlitterShot(): void {
    const now = this.scene.time.now;
    if (now - this.lastGlitterShotAt < 55) {
      return;
    }
    this.lastGlitterShotAt = now;
    this.playTone(970, 0.05, this.sfxVolume * 0.3, "triangle");
  }

  playCheckpoint(): void {
    this.playTone(520, 0.12, this.sfxVolume * 0.5, "triangle");
    this.playTone(780, 0.1, this.sfxVolume * 0.45, "triangle");
  }

  playPortalPulse(): void {
    this.playTone(90, 0.25, this.sfxVolume * 0.45, "sine");
  }

  playWormholePulse(): void {
    this.playTone(70, 0.24, this.sfxVolume * 0.5, "sawtooth");
  }

  destroy(): void {
    this.stopMusic();
  }

  getDebugSnapshot(): AudioDebugSnapshot {
    return {
      activeVoices: this.activeVoices,
      maxVoices: this.maxVoices,
      droppedToneCount: this.droppedToneCount,
      lastDroppedToneAt: this.lastDroppedToneAt,
      lastAbilityAt: this.lastAbilityAt,
      lastGlitterShotAt: this.lastGlitterShotAt,
    };
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") {
      return null;
    }
    if (!this.context) {
      const AudioCtx = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        return null;
      }
      this.context = new AudioCtx();
    }
    if (this.context.state === "suspended") {
      void this.context.resume();
    }
    return this.context;
  }

  private playTone(frequency: number, durationSec: number, volume: number, type: OscillatorType): void {
    const context = this.ensureContext();
    if (!context) {
      return;
    }
    if (this.activeVoices >= this.maxVoices) {
      this.droppedToneCount += 1;
      this.lastDroppedToneAt = this.scene.time.now;
      return;
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.value = 0.0001;

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    const now = context.currentTime;
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    this.activeVoices += 1;
    oscillator.onended = () => {
      this.activeVoices = Math.max(0, this.activeVoices - 1);
    };
    oscillator.start(now);
    oscillator.stop(now + durationSec + 0.02);
  }
}
