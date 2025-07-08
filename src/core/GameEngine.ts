// Main Game Engine for Hackwarts
import { VoiceRecognition } from "../systems/VoiceRecognition.js";
import { GameUI } from "../gameUI.js";
import { GameState } from "./GameState.js";
import { SpellSystem } from "../systems/SpellSystem.js";
import { StatusEffectsSystem } from "../systems/StatusEffects.js";
import { Renderer } from "../rendering/Renderer.js";
import { updateSpiderAI } from "../entities/enemies/Spider.js";
import { updateTrollAI } from "../entities/enemies/Troll.js";
import { updateSoulSuckerAI } from "../entities/enemies/SoulSucker.js";

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private gameState: GameState;
  private spellSystem: SpellSystem;
  private statusEffectsSystem: StatusEffectsSystem;
  private renderer: Renderer;
  private voiceRecognition: VoiceRecognition;
  private gameUI: GameUI;

  // Frame rate control
  private readonly TARGET_FPS = 30;
  private readonly FRAME_TIME = 1000 / this.TARGET_FPS;
  private lastFrameTime = 0;

  // Skip button
  private skipButton: {
    x: number;
    y: number;
    width: number;
    height: number;
    isHovered: boolean;
  };

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;

    // Initialize skip button
    this.skipButton = {
      x: this.canvas.width / 2 - 50,
      y: this.canvas.height - 60,
      width: 100,
      height: 40,
      isHovered: false,
    };

    // Initialize all systems
    this.gameState = new GameState(canvas);
    this.spellSystem = new SpellSystem();
    this.statusEffectsSystem = new StatusEffectsSystem();
    this.renderer = new Renderer(canvas, ctx);

    // Initialize voice recognition
    this.voiceRecognition = new VoiceRecognition({
      confidenceThreshold: 0.3, // Lower threshold for better responsiveness
      cooldownDuration: 1000, // Shorter cooldown for better flow
      restartDebounceMs: 1500, // Faster restart
      enableDebugMode: true,
    });

    // Initialize UI
    this.gameUI = new GameUI(canvas, ctx);

    this.setupEventHandlers();
    this.initializeAlwaysListeningMagic();
  }

  private setupEventHandlers(): void {
    // Voice recognition callbacks
    this.voiceRecognition.onSpellRecognized = (
      spell: string,
      confidence: number
    ) => {
      this.handleSpellCast(spell, confidence);
    };

    this.voiceRecognition.onSpeechDetected = (
      transcript: string,
      _confidence: number
    ) => {
      this.gameUI.setLastSpoken(transcript);
    };

    // Mouse events for skip button
    this.canvas.addEventListener("mousemove", (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.skipButton.isHovered = this.isPointInSkipButton(x, y);
    });

    this.canvas.addEventListener("click", (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (this.isPointInSkipButton(x, y)) {
        this.gameState.skipCurrentEnemy(this.canvas);
      }
    });

    // Keyboard events for reset
    document.addEventListener("keydown", (event) => {
      if (event.key === "r" || event.key === "R") {
        this.resetGame();
      }
    });
  }

  private handleSpellCast(spellName: string, confidence: number): void {
    this.gameUI.setLastRecognizedSpell(spellName);

    this.spellSystem.castSpell(
      spellName,
      confidence,
      this.gameState.player,
      this.gameState.spider,
      this.gameState.troll,
      this.gameState.soulSucker,
      this.gameState.activeTimeouts
    );

    this.spellSystem.createMagicalEffect(
      spellName,
      confidence,
      this.gameState.player,
      this.gameState.activeTimeouts
    );
  }

  private async initializeAlwaysListeningMagic(): Promise<void> {
    console.log("🎤 Initializing always-listening magic system...");

    try {
      const hasPermission =
        await this.voiceRecognition.requestMicrophonePermission();
      this.gameUI.setMicrophonePermission(hasPermission);

      if (hasPermission) {
        await this.voiceRecognition.startListening();
        console.log("🎤 Always-listening magic system activated!");
      }
    } catch (error) {
      console.error("Failed to initialize voice recognition:", error);
    }
  }

  private isPointInSkipButton(x: number, y: number): boolean {
    return (
      x >= this.skipButton.x &&
      x <= this.skipButton.x + this.skipButton.width &&
      y >= this.skipButton.y &&
      y <= this.skipButton.y + this.skipButton.height
    );
  }

  private updateGame(): void {
    // Update player status effects
    this.statusEffectsSystem.updatePlayerStatusEffects(
      this.gameState.player,
      this.gameState.activeTimeouts,
      () => this.gameState.onGameOver()
    );

    // Update enemy AI
    if (this.gameState.spider) {
      updateSpiderAI(
        this.gameState.spider,
        this.gameState.player,
        this.gameState.activeTimeouts,
        this.gameState.gameOver,
        this.gameState.gameWon
      );
    }

    if (this.gameState.troll) {
      updateTrollAI(
        this.gameState.troll,
        this.gameState.player,
        this.gameState.activeTimeouts,
        this.gameState.gameOver,
        this.gameState.gameWon,
        () => this.gameState.onGameOver()
      );
    }

    if (this.gameState.soulSucker) {
      updateSoulSuckerAI(
        this.gameState.soulSucker,
        this.gameState.player,
        this.gameState.activeTimeouts,
        this.gameState.gameOver,
        this.gameState.gameWon,
        () => this.gameState.onGameOver()
      );
    }

    // Enhanced enemy defeat detection with debugging
    this.checkEnemyDefeats();
  }

  private checkEnemyDefeats(): void {
    // Check spider defeat
    if (this.gameState.spider && this.gameState.spider.state === "dead") {
      console.log(
        `🎉 Spider defeated! HP: ${this.gameState.spider.currentHealth}, State: ${this.gameState.spider.state}`
      );
      this.gameState.onEnemyDefeated(this.canvas);
      return; // Important: return after handling defeat to prevent multiple calls
    }

    // Check troll defeat
    if (this.gameState.troll && this.gameState.troll.state === "dead") {
      console.log(
        `🎉 Troll defeated! HP: ${this.gameState.troll.currentHealth}/${this.gameState.troll.maxHealth}, Total Damage: ${this.gameState.troll.totalDamageReceived}, State: ${this.gameState.troll.state}`
      );
      this.gameState.onEnemyDefeated(this.canvas);
      return; // Important: return after handling defeat to prevent multiple calls
    }

    // Check soul sucker defeat
    if (
      this.gameState.soulSucker &&
      this.gameState.soulSucker.state === "dead"
    ) {
      console.log(
        `🎉 Soul Sucker defeated! HP: ${this.gameState.soulSucker.currentHealth}/${this.gameState.soulSucker.maxHealth}, Total Damage: ${this.gameState.soulSucker.totalDamageReceived}, State: ${this.gameState.soulSucker.state}`
      );
      this.gameState.onEnemyDefeated(this.canvas);
      return; // Important: return after handling defeat to prevent multiple calls
    }

    // Additional check: if current health is 0 but state isn't dead, force the death
    if (
      this.gameState.troll &&
      this.gameState.troll.currentHealth <= 0 &&
      this.gameState.troll.state !== "dead"
    ) {
      console.log(
        `🔧 Force-killing troll with 0 HP. Current state: ${this.gameState.troll.state}, HP: ${this.gameState.troll.currentHealth}`
      );
      this.gameState.troll.state = "dead";
    }

    if (
      this.gameState.soulSucker &&
      this.gameState.soulSucker.currentHealth <= 0 &&
      this.gameState.soulSucker.state !== "dead"
    ) {
      console.log(
        `🔧 Force-killing soul sucker with 0 HP. Current state: ${this.gameState.soulSucker.state}, HP: ${this.gameState.soulSucker.currentHealth}`
      );
      this.gameState.soulSucker.state = "dead";
    }

    if (
      this.gameState.spider &&
      this.gameState.spider.currentHealth <= 0 &&
      this.gameState.spider.state !== "dead"
    ) {
      console.log(
        `🔧 Force-killing spider with 0 HP. Current state: ${this.gameState.spider.state}, HP: ${this.gameState.spider.currentHealth}`
      );
      this.gameState.spider.state = "dead";
    }
  }

  private renderGame(): void {
    this.renderer.clearCanvas();

    // Show/hide spider decoration based on current enemy
    if (this.gameState.currentEnemyType === "spider") {
      this.renderer.showSpiderDecoration();
    } else {
      this.renderer.hideSpiderDecoration();
    }

    // Draw player
    this.renderer.drawPlayer(this.gameState.player);

    // Draw current enemy
    this.renderer.drawCurrentEnemy(
      this.gameState.spider,
      this.gameState.troll,
      this.gameState.soulSucker
    );

    // Draw health bars
    this.renderer.drawHealthBars(
      this.gameState.player,
      this.gameState.spider,
      this.gameState.troll,
      this.gameState.soulSucker
    );

    // Draw enhanced status effects
    this.renderer.drawEnhancedStatusEffects(
      this.gameState.player,
      this.gameState.spider,
      this.gameState.troll,
      this.gameState.soulSucker
    );

    // Draw UI elements
    this.gameUI.drawDebugSpeechDisplay();
    this.gameUI.drawSpellbook();
    this.gameUI.drawInstructions();

    // Draw skip button
    this.renderer.drawSkipButton(this.skipButton);

    // Draw game messages
    this.renderer.drawGameMessages(
      this.gameState.gameWon,
      this.gameState.gameOver,
      this.gameState.currentEnemyType,
      this.spellSystem.getSpellCastCount(),
      this.spellSystem.getLastSpellCast()
    );
  }

  public gameLoop = (currentTime: number): void => {
    // Frame rate control
    if (currentTime - this.lastFrameTime >= this.FRAME_TIME) {
      this.updateGame();
      this.renderGame();
      this.lastFrameTime = currentTime;
    }

    requestAnimationFrame(this.gameLoop);
  };

  public resetGame(): void {
    this.gameState.resetGame(this.canvas);
    this.spellSystem.resetStats();
    this.gameUI.setLastRecognizedSpell("");
  }

  public start(): void {
    console.log("🎮 Starting Hackwarts game engine...");
    requestAnimationFrame(this.gameLoop);
  }
}
