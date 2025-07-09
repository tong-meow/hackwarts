// Centralized Game State Management for Hackwarts
import { Player } from "../entities/Player.js";
import { Spider, createSpider } from "../entities/enemies/Spider.js";
import { Troll, createTroll } from "../entities/enemies/Troll.js";
import { Dementor, createDementor } from "../entities/enemies/Dementor.js";

export type EnemyType = "spider" | "troll" | "dementor" | "none";

export class GameState {
  // Game state
  public gameWon: boolean = false;
  public gameOver: boolean = false;
  public currentEnemyType: EnemyType = "spider";

  // Enemies
  public spider: Spider | null = null;
  public troll: Troll | null = null;
  public dementor: Dementor | null = null;

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
    maxMagic: number;
    currentMagic: number;
  };

  constructor(canvas: HTMLCanvasElement) {
    this.ORIGINAL_PLAYER = {
      x: 50,
      y: canvas.height / 2 - 230,
      width: 500,
      height: 700,
      color: "#4a90e2",
      maxHealth: 100,
      currentHealth: 100,
      maxMagic: 160,
      currentMagic: 0,
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
      maxMagic: this.ORIGINAL_PLAYER.maxMagic,
      currentMagic: this.ORIGINAL_PLAYER.currentMagic,
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
        canvas.width - 830,
        canvas.height / 2 - 200
      );
      this.troll = null;
      this.dementor = null;
    } else if (this.currentEnemyType === "troll") {
      this.spider = null;
      this.troll = createTroll(1, canvas.width - 650, canvas.height / 2 - 320);
      this.dementor = null;
    } else if (this.currentEnemyType === "dementor") {
      this.spider = null;
      this.troll = null;
      this.dementor = createDementor(
        2,
        canvas.width - 650,
        canvas.height / 2 - 380
      );
    } else {
      this.spider = null;
      this.troll = null;
      this.dementor = null;
    }
  }

  public onEnemyDefeated(
    canvas: HTMLCanvasElement,
    cleanupCallback?: () => void
  ): void {
    console.log(`🔄 Enemy defeated! Current type: ${this.currentEnemyType}`);

    if (this.currentEnemyType === "spider") {
      console.log("🕷️ -> 🧌 Transitioning from Spider to Troll");
      this.currentEnemyType = "troll";

      // Clean up spider-specific visual effects when transitioning to troll
      if (cleanupCallback) {
        cleanupCallback();
      }

      this.initializeCurrentEnemy(canvas);
      console.log(
        `🧌 Troll initialized with HP: ${this.troll?.currentHealth}/${this.troll?.maxHealth}`
      );
    } else if (this.currentEnemyType === "troll") {
      console.log("🧌 -> 👻 Transitioning from Troll to Dementor");
      this.currentEnemyType = "dementor";
      this.initializeCurrentEnemy(canvas);
      console.log(
        `👻 Dementor initialized with HP: ${this.dementor?.currentHealth}/${this.dementor?.maxHealth}`
      );
    } else if (this.currentEnemyType === "dementor") {
      console.log("👻 -> 🎉 All enemies defeated! VICTORY!");
      this.currentEnemyType = "none";
      this.gameWon = true;
    }

    console.log(
      `🔄 Transition complete. New enemy type: ${this.currentEnemyType}`
    );
  }

  public skipCurrentEnemy(
    canvas: HTMLCanvasElement,
    cleanupCallback?: () => void
  ): void {
    if (this.isEnemyAlive(this.spider)) {
      this.spider!.state = "dead";
      this.spider!.currentHealth = 0;
      this.onEnemyDefeated(canvas, cleanupCallback);
    } else if (this.isEnemyAlive(this.troll)) {
      this.troll!.state = "dead";
      this.troll!.currentHealth = 0;
      if ("totalDamageReceived" in this.troll!) {
        this.troll!.totalDamageReceived = 120;
      }
      this.onEnemyDefeated(canvas, cleanupCallback);
    } else if (this.isEnemyAlive(this.dementor)) {
      this.dementor!.state = "dead";
      this.dementor!.currentHealth = 0;
      if ("totalDamageReceived" in this.dementor!) {
        this.dementor!.totalDamageReceived = 150;
      }
      this.onEnemyDefeated(canvas, cleanupCallback);
    }
  }

  public isEnemyAlive(enemy: Spider | Troll | Dementor | null): boolean {
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
    this.player.currentMagic = this.ORIGINAL_PLAYER.currentMagic;
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
