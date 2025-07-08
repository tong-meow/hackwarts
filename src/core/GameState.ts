// Centralized Game State Management for Hackwarts
import { Player } from "../entities/Player.js";
import { Spider, createSpider } from "../entities/enemies/Spider.js";
import { Troll, createTroll } from "../entities/enemies/Troll.js";
import {
  SoulSucker,
  createSoulSucker,
} from "../entities/enemies/SoulSucker.js";

export type EnemyType = "spider" | "troll" | "soulsucker" | "none";

export class GameState {
  // Game state
  public gameWon: boolean = false;
  public gameOver: boolean = false;
  public currentEnemyType: EnemyType = "spider";

  // Enemies
  public spider: Spider | null = null;
  public troll: Troll | null = null;
  public soulSucker: SoulSucker | null = null;

  // Player
  public player: Player;

  // Active timeouts for cleanup
  public activeTimeouts: NodeJS.Timeout[] = [];

  // Original player data for reset
  private ORIGINAL_PLAYER: {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    maxHealth: number;
    currentHealth: number;
  };

  constructor(canvas: HTMLCanvasElement) {
    this.ORIGINAL_PLAYER = {
      x: 100,
      y: canvas.height / 2 - 75,
      width: 60,
      height: 150,
      color: "#4a90e2",
      maxHealth: 100,
      currentHealth: 100,
    };

    // Create player character with silence support
    this.player = {
      x: this.ORIGINAL_PLAYER.x,
      y: this.ORIGINAL_PLAYER.y,
      width: this.ORIGINAL_PLAYER.width,
      height: this.ORIGINAL_PLAYER.height,
      color: this.ORIGINAL_PLAYER.color,
      maxHealth: this.ORIGINAL_PLAYER.maxHealth,
      currentHealth: this.ORIGINAL_PLAYER.currentHealth,
      originalX: this.ORIGINAL_PLAYER.x,
      originalY: this.ORIGINAL_PLAYER.y,
      originalColor: this.ORIGINAL_PLAYER.color,
      isImmobilized: false,
      isPoisoned: false,
      isProtected: false,
      protectionEndTime: 0,
      poisonDamage: 0,
      poisonEndTime: 0,
      immobilizedEndTime: 0,
      lastPoisonTick: 0,
      isSilenced: false,
      silenceEndTime: 0,
    };

    this.initializeCurrentEnemy(canvas);
  }

  private initializeCurrentEnemy(canvas: HTMLCanvasElement): void {
    if (this.currentEnemyType === "spider") {
      this.spider = createSpider(
        0,
        canvas.width - 520,
        canvas.height / 2 - 120
      );
      this.troll = null;
      this.soulSucker = null;
    } else if (this.currentEnemyType === "troll") {
      this.spider = null;
      this.troll = createTroll(1, canvas.width - 200, canvas.height / 2 - 50);
      this.soulSucker = null;
    } else if (this.currentEnemyType === "soulsucker") {
      this.spider = null;
      this.troll = null;
      this.soulSucker = createSoulSucker(
        2,
        canvas.width - 200,
        canvas.height / 2 - 50
      );
    } else {
      this.spider = null;
      this.troll = null;
      this.soulSucker = null;
    }
  }

  public onEnemyDefeated(canvas: HTMLCanvasElement): void {
    console.log(`🔄 Enemy defeated! Current type: ${this.currentEnemyType}`);

    if (this.currentEnemyType === "spider") {
      console.log("🕷️ -> 🧌 Transitioning from Spider to Troll");
      this.currentEnemyType = "troll";
      this.initializeCurrentEnemy(canvas);
      console.log(
        `🧌 Troll initialized with HP: ${this.troll?.currentHealth}/${this.troll?.maxHealth}`
      );
    } else if (this.currentEnemyType === "troll") {
      console.log("🧌 -> 👻 Transitioning from Troll to Soul Sucker");
      this.currentEnemyType = "soulsucker";
      this.initializeCurrentEnemy(canvas);
      console.log(
        `👻 Soul Sucker initialized with HP: ${this.soulSucker?.currentHealth}/${this.soulSucker?.maxHealth}`
      );
    } else if (this.currentEnemyType === "soulsucker") {
      console.log("👻 -> 🎉 All enemies defeated! VICTORY!");
      this.currentEnemyType = "none";
      this.gameWon = true;
    }

    console.log(
      `🔄 Transition complete. New enemy type: ${this.currentEnemyType}`
    );
  }

  public skipCurrentEnemy(canvas: HTMLCanvasElement): void {
    if (this.isEnemyAlive(this.spider)) {
      this.spider!.state = "dead";
      this.spider!.currentHealth = 0;
      this.onEnemyDefeated(canvas);
    } else if (this.isEnemyAlive(this.troll)) {
      this.troll!.state = "dead";
      this.troll!.currentHealth = 0;
      if ("totalDamageReceived" in this.troll!) {
        this.troll!.totalDamageReceived = 100;
      }
      this.onEnemyDefeated(canvas);
    } else if (this.isEnemyAlive(this.soulSucker)) {
      this.soulSucker!.state = "dead";
      this.soulSucker!.currentHealth = 0;
      if ("totalDamageReceived" in this.soulSucker!) {
        this.soulSucker!.totalDamageReceived = 150;
      }
      this.onEnemyDefeated(canvas);
    }
  }

  public isEnemyAlive(enemy: Spider | Troll | SoulSucker | null): boolean {
    const alive = enemy !== null && enemy.state !== "dead";
    if (enemy && enemy.state === "dead") {
      console.log(`💀 Enemy ${enemy.id} is dead (state: ${enemy.state})`);
    }
    return alive;
  }

  public onGameOver(): void {
    this.gameOver = true;
  }

  public resetGame(canvas: HTMLCanvasElement): void {
    console.log("🔄 Resetting game...");

    // Clear all active timeouts
    this.activeTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.activeTimeouts = [];

    // Reset game state
    this.gameWon = false;
    this.gameOver = false;
    this.currentEnemyType = "spider";

    // Reset player
    this.player.x = this.ORIGINAL_PLAYER.x;
    this.player.y = this.ORIGINAL_PLAYER.y;
    this.player.color = this.ORIGINAL_PLAYER.color;
    this.player.currentHealth = this.ORIGINAL_PLAYER.currentHealth;
    this.player.isImmobilized = false;
    this.player.isPoisoned = false;
    this.player.isProtected = false;
    this.player.protectionEndTime = 0;
    this.player.poisonDamage = 0;
    this.player.poisonEndTime = 0;
    this.player.immobilizedEndTime = 0;
    this.player.lastPoisonTick = 0;
    this.player.isSilenced = false;
    this.player.silenceEndTime = 0;

    // Reset enemies
    this.initializeCurrentEnemy(canvas);

    console.log("🔄 Game reset complete!");
  }

  public createClearableTimeout(
    callback: () => void,
    delay: number
  ): NodeJS.Timeout {
    const timeout = setTimeout(callback, delay);
    this.activeTimeouts.push(timeout);
    return timeout;
  }
}
