// Main Game Engine for Hackwarts
import { VoiceRecognition } from "../systems/VoiceRecognition.js";
import { GameUI } from "../gameUI.js";
import { GameState } from "./GameState.js";
import { SpellSystem } from "../systems/SpellSystem.js";
import { StatusEffectsSystem } from "../systems/StatusEffects.js";
import { Renderer } from "../rendering/Renderer.js";
import { updateSpiderAI } from "../entities/enemies/Spider.js";
import { updateTrollAI } from "../entities/enemies/Troll.js";
import { updateDementorAI } from "../entities/enemies/Dementor.js";

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
        this.gameState.skipCurrentEnemy(this.canvas, () => {
          // Clean up spider-specific visual effects when skipping
          this.renderer.hideSpiderWebOverlays();
          this.renderer.hidePoisonedEffects();
          this.renderer.hideVenomCastingOverlay();
        });
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
      this.gameState.dementor,
      this.gameState.activeTimeouts,
      (success: boolean) => this.renderer.onSpiderWebCastComplete(success),
      () => this.renderer.hideVenomCastingOverlay()
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
        this.gameState.gameWon,
        (success: boolean) => this.renderer.onSpiderWebCastComplete(success)
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

    if (this.gameState.dementor) {
      updateDementorAI(
        this.gameState.dementor,
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

      // Hide spider web overlays when spider is defeated
      this.renderer.hideSpiderWebOverlays();
      // Hide poisoned effects when spider is defeated (poison source is gone)
      this.renderer.hidePoisonedEffects();
      // Hide venom casting overlay when spider is defeated
      this.renderer.hideVenomCastingOverlay();
      // Hide spider name when spider is defeated
      this.renderer.hideSpiderName();

      this.gameState.onEnemyDefeated(this.canvas, () => {
        // Additional cleanup when transitioning from spider to troll
        this.renderer.hideSpiderWebOverlays();
        this.renderer.hidePoisonedEffects();
        this.renderer.hideVenomCastingOverlay();
      });
      return; // Important: return after handling defeat to prevent multiple calls
    }

    // Check troll defeat
    if (this.gameState.troll && this.gameState.troll.state === "dead") {
      console.log(
        `🎉 Troll defeated! HP: ${this.gameState.troll.currentHealth}/${this.gameState.troll.maxHealth}, Total Damage: ${this.gameState.troll.totalDamageReceived}, State: ${this.gameState.troll.state}`
      );
      // Hide troll name when troll is defeated
      this.renderer.hideTrollName();
      // Hide stone throwing overlay when troll is defeated
      this.renderer.hideStoneThrowingOverlay();
      // Hide shield overlay when troll is defeated
      this.renderer.hideShieldOverlay();

      this.gameState.onEnemyDefeated(this.canvas);
      return; // Important: return after handling defeat to prevent multiple calls
    }

    // Check dementor defeat
    if (this.gameState.dementor && this.gameState.dementor.state === "dead") {
      console.log(
        `🎉 Dementor defeated! HP: ${this.gameState.dementor.currentHealth}/${this.gameState.dementor.maxHealth}, Total Damage: ${this.gameState.dementor.totalDamageReceived}, State: ${this.gameState.dementor.state}`
      );
      // Hide dementor name when dementor is defeated
      this.renderer.hideDementorName();

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
      this.gameState.dementor &&
      this.gameState.dementor.currentHealth <= 0 &&
      this.gameState.dementor.state !== "dead"
    ) {
      console.log(
        `🔧 Force-killing dementor with 0 HP. Current state: ${this.gameState.dementor.state}, HP: ${this.gameState.dementor.currentHealth}`
      );
      this.gameState.dementor.state = "dead";
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

    // Update animated backgrounds (always running)
    this.renderer.updateAnimatedBackgrounds();

    // Update spider web overlays
    this.renderer.updateSpiderWebOverlays(
      this.gameState.spider,
      this.gameState.player
    );

    // Update poisoned overlays
    this.renderer.updatePoisonedOverlays(this.gameState.player);

    // Update venom casting overlay
    this.renderer.updateVenomCastingOverlay(this.gameState.spider);

    // Update stone throwing overlay
    this.renderer.updateStoneThrowingOverlay(this.gameState.troll);

    // Update shield overlay
    this.renderer.updateShieldOverlay(this.gameState.troll);

    // Update spider name display
    this.renderer.updateSpiderNameDisplay(this.gameState.spider);

    // Update troll name display
    this.renderer.updateTrollNameDisplay(this.gameState.troll);

    // Update dementor name display
    this.renderer.updateDementorNameDisplay(this.gameState.dementor);

    // Draw player
    this.renderer.drawPlayer(this.gameState.player);

    // Draw current enemy
    this.renderer.drawCurrentEnemy(
      this.gameState.spider,
      this.gameState.troll,
      this.gameState.dementor
    );

    // Draw health bars
    this.renderer.drawHealthBars(
      this.gameState.player,
      this.gameState.spider,
      this.gameState.troll,
      this.gameState.dementor
    );

    // Draw enhanced status effects
    this.renderer.drawEnhancedStatusEffects(
      this.gameState.player,
      this.gameState.spider,
      this.gameState.troll,
      this.gameState.dementor
    );

    // Draw UI elements
    this.gameUI.drawInstructions();

    // Draw skip button
    this.renderer.drawSkipButton(this.skipButton);

    // Draw game messages
    this.renderer.drawGameMessages(
      this.gameState.gameWon,
      this.gameState.gameOver,
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
    this.renderer.hideSpiderWebOverlays(); // Hide spider web overlays on reset
    this.renderer.hidePoisonedEffects(); // Hide poisoned effects on reset
    this.renderer.hideVenomCastingOverlay(); // Hide venom casting overlay on reset
    this.renderer.hideStoneThrowingOverlay(); // Hide stone throwing overlay on reset
    this.renderer.hideShieldOverlay(); // Hide shield overlay on reset
    this.renderer.hideSpiderName(); // Hide spider name on reset
    this.renderer.hideTrollName(); // Hide troll name on reset
    this.renderer.hideDementorName(); // Hide dementor name on reset
  }

  public start(): void {
    console.log("🎮 Starting Hackwarts game engine...");
    requestAnimationFrame(this.gameLoop);
  }
}
