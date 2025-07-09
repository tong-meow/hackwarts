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

enum GameEngineState {
  START_SCREEN = "start_screen",
  PLAYING = "playing",
  WON = "won",
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private gameState: GameState;
  private spellSystem: SpellSystem;
  private statusEffectsSystem: StatusEffectsSystem;
  private renderer: Renderer;
  private voiceRecognition: VoiceRecognition;
  private gameUI: GameUI;
  private engineState: GameEngineState = GameEngineState.START_SCREEN;

  // Start screen elements
  private startScreenElement: HTMLImageElement | null = null;
  private startButtonElement: HTMLButtonElement | null = null;

  // Win screen elements
  private wonScreenElement: HTMLImageElement | null = null;

  // Background music
  private bgmAudio: HTMLAudioElement | null = null;

  // Frame rate control
  private readonly TARGET_FPS = 30;
  private readonly FRAME_TIME = 1000 / this.TARGET_FPS;
  private lastFrameTime = 0;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;

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
    this.initializeStartScreen();
    this.initializeWinScreen();
    this.initializeBackgroundMusic();
  }

  private initializeStartScreen(): void {
    // Create start screen overlay
    this.startScreenElement = new Image();
    this.startScreenElement.src = "/assets/start_end/title_page.svg";
    this.startScreenElement.style.position = "absolute";
    this.startScreenElement.style.top = "0";
    this.startScreenElement.style.left = "0";
    this.startScreenElement.style.width = "100%";
    this.startScreenElement.style.height = "100%";
    this.startScreenElement.style.pointerEvents = "none";
    this.startScreenElement.style.zIndex = "1000"; // Very high z-index to be on top of everything
    this.startScreenElement.style.display = "block";

    // Create start button
    this.startButtonElement = document.createElement("button");
    this.startButtonElement.textContent = "START GAME";
    this.startButtonElement.style.position = "absolute";
    this.startButtonElement.style.bottom = "15%";
    this.startButtonElement.style.left = "50%";
    this.startButtonElement.style.transform = "translateX(-50%)";
    this.startButtonElement.style.fontSize = "28px";
    this.startButtonElement.style.fontWeight = "bold";
    this.startButtonElement.style.fontFamily = "Arial, sans-serif";
    this.startButtonElement.style.padding = "20px 40px";
    this.startButtonElement.style.backgroundColor = "#8B4513";
    this.startButtonElement.style.color = "#FFD700";
    this.startButtonElement.style.border = "4px solid #FFD700";
    this.startButtonElement.style.borderRadius = "15px";
    this.startButtonElement.style.cursor = "pointer";
    this.startButtonElement.style.zIndex = "1001";
    this.startButtonElement.style.textShadow = "2px 2px 4px rgba(0,0,0,0.5)";
    this.startButtonElement.style.boxShadow = "0 6px 12px rgba(0,0,0,0.3)";
    this.startButtonElement.style.transition = "all 0.3s ease";

    // Add hover effects
    this.startButtonElement.addEventListener("mouseenter", () => {
      if (this.startButtonElement) {
        this.startButtonElement.style.backgroundColor = "#A0522D";
        this.startButtonElement.style.transform =
          "translateX(-50%) translateY(-5px)";
        this.startButtonElement.style.boxShadow = "0 8px 16px rgba(0,0,0,0.4)";
      }
    });

    this.startButtonElement.addEventListener("mouseleave", () => {
      if (this.startButtonElement) {
        this.startButtonElement.style.backgroundColor = "#8B4513";
        this.startButtonElement.style.transform =
          "translateX(-50%) translateY(0)";
        this.startButtonElement.style.boxShadow = "0 6px 12px rgba(0,0,0,0.3)";
      }
    });

    // Add click handler
    this.startButtonElement.addEventListener("click", () => {
      this.startGame();
    });

    // Add elements to DOM
    if (this.startScreenElement) {
      document.body.appendChild(this.startScreenElement);
    }
    if (this.startButtonElement) {
      document.body.appendChild(this.startButtonElement);
    }
  }

  private initializeWinScreen(): void {
    // Create win screen overlay
    this.wonScreenElement = new Image();
    this.wonScreenElement.src = "/assets/start_end/won_page.svg";
    this.wonScreenElement.style.position = "absolute";
    this.wonScreenElement.style.top = "0";
    this.wonScreenElement.style.left = "0";
    this.wonScreenElement.style.width = "100%";
    this.wonScreenElement.style.height = "100%";
    this.wonScreenElement.style.pointerEvents = "none";
    this.wonScreenElement.style.zIndex = "500"; // Above game elements but below start screen
    this.wonScreenElement.style.display = "none"; // Initially hidden

    // Add to DOM
    if (this.wonScreenElement) {
      document.body.appendChild(this.wonScreenElement);
    }
  }

  private showWinScreen(): void {
    if (this.wonScreenElement) {
      this.wonScreenElement.style.display = "block";
    }
    this.engineState = GameEngineState.WON;
    console.log("🎉 Win screen displayed!");
  }

  private hideWinScreen(): void {
    if (this.wonScreenElement) {
      this.wonScreenElement.style.display = "none";
    }
  }

  private async startGame(): Promise<void> {
    // Hide start screen
    if (this.startScreenElement) {
      this.startScreenElement.style.display = "none";
    }
    if (this.startButtonElement) {
      this.startButtonElement.style.display = "none";
    }

    // Change engine state
    this.engineState = GameEngineState.PLAYING;

    // Start background music (user interaction allows audio to play)
    await this.playBackgroundMusic();

    // Initialize voice recognition
    await this.initializeAlwaysListeningMagic();

    console.log("🎮 Game started!");
  }

  private setupEventHandlers(): void {
    // Voice recognition callbacks
    this.voiceRecognition.onSpellRecognized = (
      spell: string,
      confidence: number
    ) => {
      // Only handle spells when playing
      if (this.engineState === GameEngineState.PLAYING) {
        this.handleSpellCast(spell, confidence);
      }
    };

    this.voiceRecognition.onSpeechDetected = (
      transcript: string,
      _confidence: number
    ) => {
      // Only handle speech when playing
      if (this.engineState === GameEngineState.PLAYING) {
        this.gameUI.setLastSpoken(transcript);
      }
    };

    // Keyboard events for reset
    document.addEventListener("keydown", (event) => {
      if (event.key === "r" || event.key === "R") {
        if (
          this.engineState === GameEngineState.PLAYING ||
          this.engineState === GameEngineState.WON
        ) {
          this.resetGame();
        }
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
      this.gameState.activeTimeouts
    );

    // Trigger magic flow effect for any successful spell cast
    this.renderer.triggerMagicFlow();

    // Trigger incendio effect specifically for incendio spell
    if (spellName === "incendio") {
      this.renderer.triggerIncendio();
    }

    // Trigger bombarda effect specifically for bombarda spell
    if (spellName === "bombarda") {
      this.renderer.triggerBombarda();
    }

    // Trigger glacius effect specifically for glacius spell
    if (spellName === "glacius") {
      this.renderer.triggerGlacius();
    }

    // Trigger avada kedavra effect specifically for avada kedavra spell
    if (spellName === "avada kedavra") {
      this.renderer.triggerAvada();
    }

    // Magic increase now happens in individual enemy spell handlers when spells actually affect enemies
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

  private initializeBackgroundMusic(): void {
    // Create audio element for background music
    this.bgmAudio = new Audio("/assets/music/creepy-devil-dance-166764.mp3");
    this.bgmAudio.loop = true; // Loop the music continuously
    this.bgmAudio.volume = 0.5; // Set volume to 50%

    // Add error handling
    this.bgmAudio.addEventListener("error", (e) => {
      console.error("Background music failed to load:", e);
    });

    this.bgmAudio.addEventListener("canplaythrough", () => {
      console.log("🎵 Background music loaded successfully");
    });

    // Handle audio interruptions (try to resume)
    this.bgmAudio.addEventListener("pause", () => {
      // Only try to resume if the game is running and we didn't intentionally pause
      if (
        this.engineState === GameEngineState.PLAYING ||
        this.engineState === GameEngineState.WON
      ) {
        setTimeout(() => {
          if (this.bgmAudio && this.bgmAudio.paused) {
            this.bgmAudio.play().catch(console.error);
          }
        }, 500);
      }
    });

    // Handle page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (this.bgmAudio) {
        if (document.hidden) {
          // Page is hidden, pause music
          this.bgmAudio.pause();
        } else {
          // Page is visible again, resume music if game is running
          if (
            this.engineState === GameEngineState.PLAYING ||
            this.engineState === GameEngineState.WON
          ) {
            this.bgmAudio.play().catch(console.error);
          }
        }
      }
    });

    // Preload the audio
    this.bgmAudio.preload = "auto";
  }

  private async playBackgroundMusic(): Promise<void> {
    if (!this.bgmAudio) return;

    try {
      await this.bgmAudio.play();
      console.log("🎵 Background music started playing");
    } catch (error) {
      console.error("Failed to play background music:", error);
      // Try to play again after a short delay
      setTimeout(() => {
        if (this.bgmAudio) {
          this.bgmAudio.play().catch(console.error);
        }
      }, 1000);
    }
  }

  private stopBackgroundMusic(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      console.log("🎵 Background music stopped");
    }
  }

  private resumeBackgroundMusic(): void {
    if (this.bgmAudio && this.bgmAudio.paused) {
      if (
        this.engineState === GameEngineState.PLAYING ||
        this.engineState === GameEngineState.WON
      ) {
        this.bgmAudio.play().catch(console.error);
      }
    }
  }

  private checkEnemyDefeats(): void {
    // Check if spider is defeated
    if (this.gameState.spider && this.gameState.spider.currentHealth <= 0) {
      console.log("🕷️ Spider defeated!");
      this.gameState.spider.state = "dead";
      this.gameState.onEnemyDefeated(this.canvas, () => {
        this.renderer.hideSpiderWebOverlays();
        this.renderer.hidePoisonedEffects();
        this.renderer.hideVenomCastingOverlay();
        this.renderer.hideStunnedOverlay();
        this.renderer.hideSpiderName();
      });
    }

    // Check if troll is defeated
    if (this.gameState.troll && this.gameState.troll.currentHealth <= 0) {
      console.log("🧌 Troll defeated!");
      this.gameState.troll.state = "dead";
      this.gameState.onEnemyDefeated(this.canvas, () => {
        this.renderer.hideStoneThrowingOverlay();
        this.renderer.hideShieldOverlay();
        this.renderer.hideCrackOverlay();
        this.renderer.hideStunnedOverlay();
        this.renderer.hideTrollName();
      });
    }

    // Check if dementor is defeated
    if (this.gameState.dementor && this.gameState.dementor.currentHealth <= 0) {
      console.log("👻 Dementor defeated!");
      this.gameState.dementor.state = "dead";
      this.gameState.onEnemyDefeated(this.canvas, () => {
        this.renderer.hideMouthOverlay();
        this.renderer.hideNotAllowedOverlay();
        this.renderer.hideStunnedOverlay();
        this.renderer.hideDementorName();
      });
    }
  }

  private updateGame(): void {
    // Only update game when playing
    if (this.engineState !== GameEngineState.PLAYING) {
      return;
    }

    // Check for win condition first
    if (
      this.gameState.gameWon &&
      this.engineState === GameEngineState.PLAYING
    ) {
      this.showWinScreen();
      return; // Stop updating game logic once won
    }

    // Update player status effects
    this.statusEffectsSystem.updatePlayerStatusEffects(
      this.gameState.player,
      this.gameState.activeTimeouts,
      () => this.gameState.onGameOver(),
      () => this.renderer.triggerPlayerShake()
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
        () => this.gameState.onGameOver(),
        () => this.renderer.triggerPlayerShake()
      );
    }

    if (this.gameState.dementor) {
      updateDementorAI(
        this.gameState.dementor,
        this.gameState.player,
        this.gameState.activeTimeouts,
        this.gameState.gameOver,
        this.gameState.gameWon,
        () => this.gameState.onGameOver(),
        () => this.renderer.triggerPlayerShake()
      );
    }

    // Enhanced enemy defeat detection with debugging
    this.checkEnemyDefeats();
  }

  private renderGame(): void {
    // Always clear canvas
    this.renderer.clearCanvas();

    // Only render game when playing or won
    if (
      this.engineState !== GameEngineState.PLAYING &&
      this.engineState !== GameEngineState.WON
    ) {
      return;
    }

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

    // Update crack overlay
    this.renderer.updateCrackOverlay(this.gameState.troll);

    // Update mouth overlay
    this.renderer.updateMouthOverlay(
      this.gameState.dementor,
      this.gameState.player
    );

    // Update not allowed overlay
    this.renderer.updateNotAllowedOverlay(
      this.gameState.dementor,
      this.gameState.player
    );

    // Update player shield overlay
    this.renderer.updatePlayerShieldOverlay(this.gameState.player);

    // Update magic flow overlay
    this.renderer.updateMagicFlowOverlay();

    // Update incendio overlay
    this.renderer.updateIncendioOverlay();

    // Update bombarda overlay
    this.renderer.updateBombardaOverlay();

    // Update glacius overlay
    this.renderer.updateGlaciusOverlay();

    // Update avada overlay
    this.renderer.updateAvadaOverlay();

    // Update stunned overlay
    this.renderer.updateStunnedOverlay(
      this.gameState.spider,
      this.gameState.troll,
      this.gameState.dementor
    );

    // Update spider name display
    this.renderer.updateSpiderNameDisplay(this.gameState.spider);

    // Update troll name display
    this.renderer.updateTrollNameDisplay(this.gameState.troll);

    // Update dementor name display
    this.renderer.updateDementorNameDisplay(this.gameState.dementor);

    // Draw player (always visible)
    this.renderer.drawPlayer(this.gameState.player);

    // Draw current enemy (only when playing)
    if (this.engineState === GameEngineState.PLAYING) {
      this.renderer.drawCurrentEnemy(
        this.gameState.spider,
        this.gameState.troll,
        this.gameState.dementor
      );
    }

    // Draw health bars (only when playing, not when won)
    if (this.engineState === GameEngineState.PLAYING) {
      this.renderer.drawHealthBars(
        this.gameState.player,
        this.gameState.spider,
        this.gameState.troll,
        this.gameState.dementor
      );
    }

    // Draw enhanced status effects
    this.renderer.drawEnhancedStatusEffects(
      this.gameState.player,
      this.gameState.spider,
      this.gameState.troll,
      this.gameState.dementor
    );

    // Draw UI elements (only when playing)
    if (this.engineState === GameEngineState.PLAYING) {
      this.gameUI.drawInstructions();
    }

    // Draw game messages (only when playing)
    if (this.engineState === GameEngineState.PLAYING) {
      this.renderer.drawGameMessages(
        this.gameState.gameWon,
        this.gameState.gameOver,
        this.spellSystem.getLastSpellCast()
      );
    }
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
    // Hide win screen if it's showing
    this.hideWinScreen();

    // Reset engine state to playing
    this.engineState = GameEngineState.PLAYING;

    // Ensure background music is playing (in case it was paused)
    this.resumeBackgroundMusic();

    // Reset game state
    this.gameState.resetGame(this.canvas);
    this.spellSystem.resetStats();
    this.gameUI.setLastRecognizedSpell("");

    // Hide all renderer overlays
    this.renderer.hideSpiderWebOverlays(); // Hide spider web overlays on reset
    this.renderer.hidePoisonedEffects(); // Hide poisoned effects on reset
    this.renderer.hideVenomCastingOverlay(); // Hide venom casting overlay on reset
    this.renderer.hideStoneThrowingOverlay(); // Hide stone throwing overlay on reset
    this.renderer.hideShieldOverlay(); // Hide shield overlay on reset
    this.renderer.hideCrackOverlay(); // Hide crack overlay on reset
    this.renderer.hideMouthOverlay(); // Hide mouth overlay on reset
    this.renderer.hideNotAllowedOverlay(); // Hide not allowed overlay on reset
    this.renderer.hidePlayerShieldOverlay(); // Hide player shield overlay on reset
    this.renderer.hideMagicFlowOverlay(); // Hide magic flow overlay on reset
    this.renderer.hideIncendioOverlay(); // Hide incendio overlay on reset
    this.renderer.hideBombardaOverlay(); // Hide bombarda overlay on reset
    this.renderer.hideGlaciusOverlay(); // Hide glacius overlay on reset
    this.renderer.hideAvadaOverlay(); // Hide avada overlay on reset
    this.renderer.hideStunnedOverlay(); // Hide stunned overlay on reset
    this.renderer.hideSpiderName(); // Hide spider name on reset
    this.renderer.hideTrollName(); // Hide troll name on reset
    this.renderer.hideDementorName(); // Hide dementor name on reset
  }

  public start(): void {
    console.log("🎮 Starting Hackwarts game engine...");
    requestAnimationFrame(this.gameLoop);
  }

  public cleanup(): void {
    // Stop background music
    this.stopBackgroundMusic();

    // Clean up start screen elements
    if (
      this.startScreenElement &&
      document.body.contains(this.startScreenElement)
    ) {
      document.body.removeChild(this.startScreenElement);
    }
    if (
      this.startButtonElement &&
      document.body.contains(this.startButtonElement)
    ) {
      document.body.removeChild(this.startButtonElement);
    }

    // Clean up win screen elements
    if (
      this.wonScreenElement &&
      document.body.contains(this.wonScreenElement)
    ) {
      document.body.removeChild(this.wonScreenElement);
    }

    // Clean up audio
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.src = "";
      this.bgmAudio.load();
      this.bgmAudio = null;
    }

    // Clean up renderer
    this.renderer.cleanup();
  }
}
