// Centralized Rendering System for Hackwarts
import { Player } from "../entities/Player.js";
import { Spider, drawSpider } from "../entities/enemies/Spider.js";
import { Troll, drawTroll } from "../entities/enemies/Troll.js";
import { Dementor, drawDementor } from "../entities/enemies/Dementor.js";

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // Spider web overlays
  private spiderWebElements: HTMLImageElement[] = [];
  private isShowingWebsForImmobilization: boolean = false;
  private isWebFadingOut: boolean = false;
  private webFadeOutStartTime: number = 0;
  private webFadeOutDuration: number = 1000; // 1 second fade-out

  // Poisoned overlay system
  private poisonedElements: HTMLImageElement[] = [];
  private isShowingPoisonedEffects: boolean = false;
  private poisonedAnimationStartTime: number = 0;

  // Venom casting overlay system
  private venomElement: HTMLImageElement | null = null;
  private isShowingVenomCasting: boolean = false;

  // Stone throwing overlay system
  private stoneElements: HTMLImageElement[] = [];
  private eyeElement: HTMLImageElement | null = null;
  private isShowingStoneThrowing: boolean = false;

  // Shield overlay system
  private shieldElement: HTMLImageElement | null = null;
  private isShowingShield: boolean = false;

  // Crack overlay system (for troll stomp)
  private crackElements: HTMLImageElement[] = [];
  private isShowingCracks: boolean = false;

  // Mouth overlay system (for dementor soul drain)
  private mouthElements: HTMLImageElement[] = [];
  private isShowingMouths: boolean = false;

  // Not allowed overlay system (for dementor voice silencing)
  private notAllowedElement: HTMLImageElement | null = null;
  private isShowingNotAllowed: boolean = false;

  // Player protego shield overlay system
  private playerShieldElement: HTMLImageElement | null = null;
  private isShowingPlayerShield: boolean = false;

  // Magic flow overlay system (for spell casting)
  private magicFlowElement: HTMLImageElement | null = null;
  private isShowingMagicFlow: boolean = false;
  private magicFlowStartTime: number = 0;
  private magicFlowDuration: number = 500; // 0.5 seconds

  // Incendio overlay system (for incendio spell casting)
  private incendioElement: HTMLImageElement | null = null;
  private isShowingIncendio: boolean = false;
  private incendioStartTime: number = 0;
  private incendioDuration: number = 500; // 0.5 seconds

  // Bombarda overlay system (for bombarda spell casting)
  private bombardaElement: HTMLImageElement | null = null;
  private isShowingBombarda: boolean = false;
  private bombardaStartTime: number = 0;
  private bombardaDuration: number = 1000; // 1 second

  // Glacius overlay system (for glacius spell casting)
  private glaciusElement: HTMLImageElement | null = null;
  private isShowingGlacius: boolean = false;
  private glaciusStartTime: number = 0;
  private glaciusDuration: number = 1000; // 1 second

  // Avada Kedavra overlay system (for avada kedavra spell casting)
  private avadaElement: HTMLImageElement | null = null;
  private avadaGlowElement: HTMLDivElement | null = null;
  private isShowingAvada: boolean = false;
  private avadaStartTime: number = 0;
  private avadaDuration: number = 1800; // 1.8 seconds total (lightning 0.8s, glow continues for 1s more)

  // Stunned overlay system (for stunned enemies)
  private stunnedElement: HTMLImageElement | null = null;
  private isShowingStunned: boolean = false;
  private stunnedAnimationStartTime: number = 0;

  // Player shake system (for damage feedback)
  private isPlayerShaking: boolean = false;
  private shakeStartTime: number = 0;
  private shakeDuration: number = 500; // 500ms shake duration
  private shakeIntensity: number = 8; // Maximum shake offset in pixels

  // Animated background system
  private backgroundElements: HTMLImageElement[] = [];
  private backgroundAnimationStartTime: number = 0;

  // Spider name display system
  private spiderNameElement: HTMLImageElement | null = null;

  // Troll name display system
  private trollNameElement: HTMLImageElement | null = null;

  // Dementor name display system
  private dementorNameElement: HTMLImageElement | null = null;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.initializeSpiderWebOverlays();
    this.initializePoisonedOverlays();
    this.initializeVenomOverlay();
    this.initializeStoneThrowingOverlay();
    this.initializeShieldOverlay();
    this.initializeCrackOverlay();
    this.initializeMouthOverlay();
    this.initializeNotAllowedOverlay();
    this.initializePlayerShieldOverlay();
    this.initializeMagicFlowOverlay();
    this.initializeIncendioOverlay();
    this.initializeBombardaOverlay();
    this.initializeGlaciusOverlay();
    this.initializeAvadaOverlay();
    this.initializeStunnedOverlay();
    this.initializeAnimatedBackgrounds();
    this.initializeSpiderName();
    this.initializeTrollName();
    this.initializeDementorName();
  }

  private initializeSpiderWebOverlays(): void {
    // Only use spider web images 1, 4, 5, 6 (skip 2 and 3)
    const webNumbers = [1, 4, 5, 6];

    for (let i = 0; i < webNumbers.length; i++) {
      const webNumber = webNumbers[i];
      const webElement = new Image();
      webElement.src = `/assets/visual_effect/spider_${webNumber}.svg`;
      webElement.style.position = "absolute";
      webElement.style.top = "0";
      webElement.style.left = "0";
      webElement.style.width = "100%";
      webElement.style.height = "100%";
      webElement.style.pointerEvents = "none";
      webElement.style.display = "none";

      // Set z-index: 1 and 4 below canvas (-1), 5 and 6 above canvas (1)
      webElement.style.zIndex = webNumber <= 4 ? "-1" : "1";

      this.spiderWebElements.push(webElement);
    }
  }

  private initializePoisonedOverlays(): void {
    for (let i = 1; i <= 4; i++) {
      const poisonedElement = new Image();
      poisonedElement.src = `/assets/visual_effect/poisoned_${i}.svg`;
      poisonedElement.style.position = "absolute";
      poisonedElement.style.top = "0";
      poisonedElement.style.left = "0";
      poisonedElement.style.width = "100%";
      poisonedElement.style.height = "100%";
      poisonedElement.style.pointerEvents = "none";
      poisonedElement.style.display = "none";

      // All poisoned effects display above canvas
      poisonedElement.style.zIndex = "1";

      this.poisonedElements.push(poisonedElement);
    }
  }

  private initializeVenomOverlay(): void {
    const venomElement = new Image();
    venomElement.src = `/assets/visual_effect/venom_1.svg`;
    venomElement.style.position = "absolute";
    venomElement.style.top = "0";
    venomElement.style.left = "0";
    venomElement.style.width = "100%";
    venomElement.style.height = "100%";
    venomElement.style.pointerEvents = "none";
    venomElement.style.display = "none";
    venomElement.style.zIndex = "1"; // Above canvas

    this.venomElement = venomElement;
  }

  private initializeStoneThrowingOverlay(): void {
    for (let i = 1; i <= 3; i++) {
      const stoneElement = new Image();
      stoneElement.src = `/assets/visual_effect/stone_${i}.svg`;
      stoneElement.style.position = "absolute";
      stoneElement.style.top = "0";
      stoneElement.style.left = "0";
      stoneElement.style.width = "100%"; // Full size like background
      stoneElement.style.height = "100%"; // Full size like background
      stoneElement.style.pointerEvents = "none";
      stoneElement.style.display = "none";
      stoneElement.style.zIndex = "1"; // Above canvas

      this.stoneElements.push(stoneElement);
    }
    this.eyeElement = new Image();
    this.eyeElement.src = `/assets/visual_effect/eye_1.svg`;
    this.eyeElement.style.position = "absolute";
    this.eyeElement.style.top = "0";
    this.eyeElement.style.left = "0";
    this.eyeElement.style.width = "100%";
    this.eyeElement.style.height = "100%";
    this.eyeElement.style.pointerEvents = "none";
    this.eyeElement.style.display = "none";
    this.eyeElement.style.zIndex = "1"; // Above canvas
  }

  private initializeShieldOverlay(): void {
    const shieldElement = new Image();
    shieldElement.src = `/assets/visual_effect/shield_1.svg`;
    shieldElement.style.position = "absolute";
    shieldElement.style.top = "0";
    shieldElement.style.left = "0";
    shieldElement.style.width = "100%";
    shieldElement.style.height = "100%";
    shieldElement.style.pointerEvents = "none";
    shieldElement.style.display = "none";
    shieldElement.style.zIndex = "1"; // Above canvas

    this.shieldElement = shieldElement;
  }

  private initializeCrackOverlay(): void {
    for (let i = 1; i <= 2; i++) {
      const crackElement = new Image();
      crackElement.src = `/assets/visual_effect/crack_${i}.svg`;
      crackElement.style.position = "absolute";
      crackElement.style.top = "0";
      crackElement.style.left = "0";
      crackElement.style.width = "100%";
      crackElement.style.height = "100%";
      crackElement.style.pointerEvents = "none";
      crackElement.style.display = "none";
      crackElement.style.zIndex = "1"; // Above canvas

      this.crackElements.push(crackElement);
    }
  }

  private initializeMouthOverlay(): void {
    for (let i = 1; i <= 3; i++) {
      const mouthElement = new Image();
      mouthElement.src = `/assets/visual_effect/mouth_${i}.svg`;
      mouthElement.style.position = "absolute";
      mouthElement.style.top = "0";
      mouthElement.style.left = "0";
      mouthElement.style.width = "100%";
      mouthElement.style.height = "100%";
      mouthElement.style.pointerEvents = "none";
      mouthElement.style.display = "none";
      mouthElement.style.zIndex = "1"; // Above canvas

      this.mouthElements.push(mouthElement);
    }
  }

  private initializeNotAllowedOverlay(): void {
    const notAllowedElement = new Image();
    notAllowedElement.src = `/assets/visual_effect/not_allowed_1.svg`;
    notAllowedElement.style.position = "absolute";
    notAllowedElement.style.top = "0";
    notAllowedElement.style.left = "0";
    notAllowedElement.style.width = "100%";
    notAllowedElement.style.height = "100%";
    notAllowedElement.style.pointerEvents = "none";
    notAllowedElement.style.display = "none";
    notAllowedElement.style.zIndex = "1"; // Above canvas

    this.notAllowedElement = notAllowedElement;
  }

  private initializePlayerShieldOverlay(): void {
    const playerShieldElement = new Image();
    playerShieldElement.src = `/assets/visual_effect/shield_3.svg`;
    playerShieldElement.style.position = "absolute";
    playerShieldElement.style.top = "0";
    playerShieldElement.style.left = "0";
    playerShieldElement.style.width = "100%";
    playerShieldElement.style.height = "100%";
    playerShieldElement.style.pointerEvents = "none";
    playerShieldElement.style.display = "none";
    playerShieldElement.style.zIndex = "-1"; // Behind canvas (behind player)

    this.playerShieldElement = playerShieldElement;
  }

  private initializeMagicFlowOverlay(): void {
    const magicFlowElement = new Image();
    magicFlowElement.src = `/assets/visual_effect/magic_1.svg`;
    magicFlowElement.style.position = "absolute";
    magicFlowElement.style.top = "0";
    magicFlowElement.style.left = "0";
    magicFlowElement.style.width = "100%";
    magicFlowElement.style.height = "100%";
    magicFlowElement.style.pointerEvents = "none";
    magicFlowElement.style.display = "none";
    magicFlowElement.style.zIndex = "1"; // Above canvas

    this.magicFlowElement = magicFlowElement;
  }

  private initializeIncendioOverlay(): void {
    const incendioElement = new Image();
    incendioElement.src = `/assets/visual_effect/incendio_4.svg`;
    incendioElement.style.position = "absolute";
    incendioElement.style.top = "0";
    incendioElement.style.left = "0";
    incendioElement.style.width = "100%";
    incendioElement.style.height = "100%";
    incendioElement.style.pointerEvents = "none";
    incendioElement.style.display = "none";
    incendioElement.style.zIndex = "1"; // Above canvas

    this.incendioElement = incendioElement;
  }

  private initializeBombardaOverlay(): void {
    const bombardaElement = new Image();
    bombardaElement.src = `/assets/visual_effect/bombada_1.svg`;
    bombardaElement.style.position = "absolute";
    bombardaElement.style.top = "0";
    bombardaElement.style.left = "0";
    bombardaElement.style.width = "100%";
    bombardaElement.style.height = "100%";
    bombardaElement.style.pointerEvents = "none";
    bombardaElement.style.display = "none";
    bombardaElement.style.zIndex = "1"; // Above canvas

    this.bombardaElement = bombardaElement;
  }

  private initializeGlaciusOverlay(): void {
    const glaciusElement = new Image();
    glaciusElement.src = `/assets/visual_effect/glaciar_1.svg`;
    glaciusElement.style.position = "absolute";
    glaciusElement.style.top = "0";
    glaciusElement.style.left = "0";
    glaciusElement.style.width = "100%";
    glaciusElement.style.height = "100%";
    glaciusElement.style.pointerEvents = "none";
    glaciusElement.style.display = "none";
    glaciusElement.style.zIndex = "1"; // Above canvas

    this.glaciusElement = glaciusElement;
  }

  private initializeAvadaOverlay(): void {
    const avadaElement = new Image();
    avadaElement.src = `/assets/visual_effect/avada_1.svg`;
    avadaElement.style.position = "absolute";
    avadaElement.style.top = "0";
    avadaElement.style.left = "0";
    avadaElement.style.width = "100%";
    avadaElement.style.height = "100%";
    avadaElement.style.pointerEvents = "none";
    avadaElement.style.display = "none";
    avadaElement.style.zIndex = "1"; // Above canvas

    this.avadaElement = avadaElement;

    // Create green glow overlay for screen effect
    const avadaGlowElement = document.createElement("div");
    avadaGlowElement.style.position = "absolute";
    avadaGlowElement.style.top = "0";
    avadaGlowElement.style.left = "0";
    avadaGlowElement.style.width = "100%";
    avadaGlowElement.style.height = "100%";
    avadaGlowElement.style.backgroundColor = "rgba(0, 255, 0, 0.3)"; // Green glow
    avadaGlowElement.style.pointerEvents = "none";
    avadaGlowElement.style.display = "none";
    avadaGlowElement.style.zIndex = "0"; // Below the lightning but above canvas
    avadaGlowElement.style.boxShadow = "inset 0 0 100px rgba(0, 255, 0, 0.5)"; // Inner glow effect

    this.avadaGlowElement = avadaGlowElement;
  }

  private initializeStunnedOverlay(): void {
    const stunnedElement = new Image();
    stunnedElement.src = `/assets/visual_effect/stunned_1.svg`;
    stunnedElement.style.position = "absolute";
    stunnedElement.style.top = "0";
    stunnedElement.style.left = "0";
    stunnedElement.style.width = "100%";
    stunnedElement.style.height = "100%";
    stunnedElement.style.pointerEvents = "none";
    stunnedElement.style.display = "none";
    stunnedElement.style.zIndex = "1"; // Above canvas

    this.stunnedElement = stunnedElement;
  }

  private initializeAnimatedBackgrounds(): void {
    for (let i = 1; i <= 4; i++) {
      const bgElement = new Image();
      bgElement.src = `/assets/background/bg_${i}.svg`;
      bgElement.style.position = "absolute";
      bgElement.style.top = "0";
      bgElement.style.left = "0";
      bgElement.style.width = "100%";
      bgElement.style.height = "100%";
      bgElement.style.pointerEvents = "none";
      bgElement.style.display = "block"; // Always visible

      // All backgrounds behind canvas
      bgElement.style.zIndex = "-2";

      // Add to DOM immediately since they're always visible
      document.body.appendChild(bgElement);

      this.backgroundElements.push(bgElement);
    }

    this.backgroundAnimationStartTime = Date.now();
  }

  private initializeSpiderName(): void {
    const spiderNameElement = new Image();
    spiderNameElement.src = `/assets/names/spider.png`;
    spiderNameElement.style.position = "absolute";
    spiderNameElement.style.width = "480px"; // Half the width of spider image (960px / 2)
    spiderNameElement.style.height = "120px"; // Proportional height (240px / 2)
    spiderNameElement.style.right = "120px"; // Move left by increasing right value
    spiderNameElement.style.bottom = "180px"; // Move up by increasing bottom value
    spiderNameElement.style.pointerEvents = "none";
    spiderNameElement.style.display = "none";
    spiderNameElement.style.zIndex = "10"; // High z-index to be above all other images

    this.spiderNameElement = spiderNameElement;
  }

  private initializeTrollName(): void {
    const trollNameElement = new Image();
    trollNameElement.src = `/assets/names/troll.png`;
    trollNameElement.style.position = "absolute";
    trollNameElement.style.width = "340px"; // Half the width of troll image (960px / 2)
    trollNameElement.style.height = "120px"; // Proportional height (240px / 2)
    trollNameElement.style.right = "180px";
    trollNameElement.style.bottom = "170px";
    trollNameElement.style.pointerEvents = "none";
    trollNameElement.style.display = "none";
    trollNameElement.style.zIndex = "10"; // High z-index to be above all other images

    this.trollNameElement = trollNameElement;
  }

  private initializeDementorName(): void {
    const dementorNameElement = new Image();
    dementorNameElement.src = `/assets/names/dementor.png`;
    dementorNameElement.style.position = "absolute";
    dementorNameElement.style.width = "400px"; // Half the width of troll image (960px / 2)
    dementorNameElement.style.height = "120px"; // Proportional height (240px / 2)
    dementorNameElement.style.right = "180px";
    dementorNameElement.style.bottom = "170px";
    dementorNameElement.style.pointerEvents = "none";
    dementorNameElement.style.display = "none";
    dementorNameElement.style.zIndex = "10"; // High z-index to be above all other images

    this.dementorNameElement = dementorNameElement;
  }

  public updateSpiderNameDisplay(spider: Spider | null): void {
    if (spider && spider.state !== "dead") {
      // Show spider name
      if (
        this.spiderNameElement &&
        !document.body.contains(this.spiderNameElement)
      ) {
        document.body.appendChild(this.spiderNameElement);
      }
      if (this.spiderNameElement) {
        this.spiderNameElement.style.display = "block";
      }
    } else {
      // Hide spider name
      if (this.spiderNameElement) {
        this.spiderNameElement.style.display = "none";
      }
    }
  }

  public hideSpiderName(): void {
    if (this.spiderNameElement) {
      this.spiderNameElement.style.display = "none";
    }
  }

  public updateTrollNameDisplay(troll: Troll | null): void {
    if (troll && troll.state !== "dead") {
      // Show troll name
      if (
        this.trollNameElement &&
        !document.body.contains(this.trollNameElement)
      ) {
        document.body.appendChild(this.trollNameElement);
      }
      if (this.trollNameElement) {
        this.trollNameElement.style.display = "block";
      }
    } else {
      // Hide troll name
      if (this.trollNameElement) {
        this.trollNameElement.style.display = "none";
      }
    }
  }

  public hideTrollName(): void {
    if (this.trollNameElement) {
      this.trollNameElement.style.display = "none";
    }
  }

  public updateDementorNameDisplay(dementor: Dementor | null): void {
    if (dementor && dementor.state !== "dead") {
      // Show dementor name
      if (
        this.dementorNameElement &&
        !document.body.contains(this.dementorNameElement)
      ) {
        document.body.appendChild(this.dementorNameElement);
      }
      if (this.dementorNameElement) {
        this.dementorNameElement.style.display = "block";
      }
    } else {
      // Hide dementor name
      if (this.dementorNameElement) {
        this.dementorNameElement.style.display = "none";
      }
    }
  }

  public hideDementorName(): void {
    if (this.dementorNameElement) {
      this.dementorNameElement.style.display = "none";
    }
  }

  public updateSpiderWebOverlays(spider: Spider | null, player: Player): void {
    const now = Date.now();

    // If spider is dead or null, always hide webs immediately
    if (!spider || spider.state === "dead") {
      if (this.isShowingWebsForImmobilization) {
        this.hideSpiderWebOverlays();
        this.isShowingWebsForImmobilization = false;
        this.isWebFadingOut = false;
      }
      return;
    }

    // Handle fade-out animation
    if (this.isWebFadingOut) {
      const fadeElapsed = now - this.webFadeOutStartTime;
      const fadeProgress = fadeElapsed / this.webFadeOutDuration;

      if (fadeProgress >= 1.0) {
        // Fade-out complete, fully hide webs
        this.hideSpiderWebOverlays();
        this.isShowingWebsForImmobilization = false;
        this.isWebFadingOut = false;
      } else {
        // Apply fade-out opacity
        const opacity = 1.0 - fadeProgress;
        for (const webElement of this.spiderWebElements) {
          webElement.style.opacity = opacity.toString();
        }
      }
      return;
    }

    // Spider is alive, check if it's casting web
    if (spider.state === "casting" && spider.currentSkill === "web") {
      const elapsedTime = now - spider.skillCastStartTime;
      const webIndex = Math.floor(elapsedTime / 500); // Show next web every 500ms

      // Show webs 1 to (webIndex + 1), but max 6
      for (let i = 0; i < this.spiderWebElements.length; i++) {
        const webElement = this.spiderWebElements[i];

        if (i <= webIndex) {
          if (!document.body.contains(webElement)) {
            document.body.appendChild(webElement);
          }
          webElement.style.display = "block";
          webElement.style.opacity = "1"; // Ensure full opacity during casting
        } else {
          webElement.style.display = "none";
        }
      }
      return;
    }

    // Spider is not casting web, check if player is immobilized by spider web
    if (player.isImmobilized && Date.now() < player.immobilizedEndTime) {
      // Player is trapped by spider web - keep all webs visible
      if (!this.isShowingWebsForImmobilization) {
        this.showAllSpiderWebs();
        this.isShowingWebsForImmobilization = true;
      }
    } else {
      // Player is not trapped by spider web - start fade-out
      if (this.isShowingWebsForImmobilization && !this.isWebFadingOut) {
        this.isWebFadingOut = true;
        this.webFadeOutStartTime = now;
        // Keep showing webs but start fading them out
      }
    }
  }

  public onSpiderWebCastComplete(success: boolean): void {
    if (success) {
      // Show all webs and let updateSpiderWebOverlays handle keeping them visible while player is trapped
      this.showAllSpiderWebs();
      this.isShowingWebsForImmobilization = true;
      this.isWebFadingOut = false; // Reset fade-out state
    } else {
      // Hide immediately if cast failed or was canceled
      this.hideSpiderWebOverlays();
      this.isShowingWebsForImmobilization = false;
      this.isWebFadingOut = false; // Reset fade-out state
    }
  }

  private showAllSpiderWebs(): void {
    for (const webElement of this.spiderWebElements) {
      if (!document.body.contains(webElement)) {
        document.body.appendChild(webElement);
      }
      webElement.style.display = "block";
      webElement.style.opacity = "1"; // Reset opacity to full
    }
  }

  public hideSpiderWebOverlays(): void {
    for (const webElement of this.spiderWebElements) {
      webElement.style.display = "none";
      webElement.style.opacity = "1"; // Reset opacity for next time
    }
    this.isShowingWebsForImmobilization = false;
    this.isWebFadingOut = false; // Reset fade-out state
  }

  public updatePoisonedOverlays(player: Player): void {
    if (player.isPoisoned && Date.now() < player.poisonEndTime) {
      // Player is poisoned - show all 4 poisoned effects together
      if (!this.isShowingPoisonedEffects) {
        this.showPoisonedEffects();
        this.isShowingPoisonedEffects = true;
        this.poisonedAnimationStartTime = Date.now();
      }

      // Frame-by-frame animation: each image gets its own animation cycle
      const now = Date.now();
      const animationElapsed = now - this.poisonedAnimationStartTime;
      const frameTime = Math.floor(animationElapsed / 200); // 0.2 seconds per frame

      // Show all 4 images with individual animation offsets
      for (let i = 0; i < this.poisonedElements.length; i++) {
        const poisonedElement = this.poisonedElements[i];

        if (!document.body.contains(poisonedElement)) {
          document.body.appendChild(poisonedElement);
        }

        poisonedElement.style.display = "block";

        // Apply frame-by-frame animation to each image individually
        // Each image has different animation timing to create lively effect
        const individualFrameTime = (frameTime + i) % 4; // Offset each image's animation
        const animationOffset = this.getPoisonedAnimationOffset(
          i,
          individualFrameTime
        );

        poisonedElement.style.transform = `translate(${animationOffset.x}px, ${animationOffset.y}px)`;
      }
    } else {
      // Player is not poisoned - hide effects
      if (this.isShowingPoisonedEffects) {
        this.hidePoisonedEffects();
        this.isShowingPoisonedEffects = false;
      }
    }
  }

  private getPoisonedAnimationOffset(
    imageIndex: number,
    frameTime: number
  ): { x: number; y: number } {
    // Different animation patterns for each image to create dramatic lively effect
    const animationPatterns = [
      // Image 1: Dramatic circular movement
      [
        { x: 0, y: 0 },
        { x: 8, y: -4 },
        { x: 0, y: -8 },
        { x: -8, y: -4 },
      ],
      // Image 2: Strong horizontal sway
      [
        { x: 0, y: 0 },
        { x: 12, y: 2 },
        { x: 0, y: 4 },
        { x: -12, y: 2 },
      ],
      // Image 3: Pronounced vertical bob
      [
        { x: 0, y: 0 },
        { x: 2, y: 10 },
        { x: -2, y: 0 },
        { x: 2, y: -10 },
      ],
      // Image 4: Dramatic diagonal drift with rotation effect
      [
        { x: 0, y: 0 },
        { x: 10, y: 8 },
        { x: -4, y: 2 },
        { x: -10, y: -8 },
      ],
    ];

    return animationPatterns[imageIndex][frameTime];
  }

  private showPoisonedEffects(): void {
    for (const poisonedElement of this.poisonedElements) {
      if (!document.body.contains(poisonedElement)) {
        document.body.appendChild(poisonedElement);
      }
      poisonedElement.style.display = "block";
      poisonedElement.style.transform = "translate(0px, 0px)"; // Reset transform
    }
  }

  public hidePoisonedEffects(): void {
    for (const poisonedElement of this.poisonedElements) {
      poisonedElement.style.display = "none";
      poisonedElement.style.transform = "translate(0px, 0px)"; // Reset transform
    }
    this.isShowingPoisonedEffects = false;
  }

  public updateVenomCastingOverlay(spider: Spider | null): void {
    if (
      !spider ||
      spider.state !== "casting" ||
      spider.currentSkill !== "venom"
    ) {
      if (this.isShowingVenomCasting) {
        this.hideVenomCastingOverlay();
      }
      return;
    }

    const now = Date.now();
    const elapsedTime = now - spider.skillCastStartTime;

    if (!this.isShowingVenomCasting) {
      this.showVenomCastingOverlay();
      this.isShowingVenomCasting = true;
    }

    if (this.venomElement) {
      this.venomElement.style.display = "block";
      const frameTime = Math.floor(elapsedTime / 100); // 0.1 seconds per frame
      const animationOffset = this.getVenomAnimationOffset(frameTime);
      this.venomElement.style.transform = `translate(${animationOffset.x}px, ${animationOffset.y}px)`;
    }
  }

  private getVenomAnimationOffset(frameTime: number): { x: number; y: number } {
    const animationPatterns = [
      // Frame 0: Center
      { x: 0, y: 0 },
      // Frame 1: Up
      { x: 0, y: -10 },
      // Frame 2: Down
      { x: 0, y: 10 },
      // Frame 3: Left
      { x: -10, y: 0 },
      // Frame 4: Right
      { x: 10, y: 0 },
      // Frame 5: Up-Left
      { x: -10, y: -10 },
      // Frame 6: Up-Right
      { x: 10, y: -10 },
      // Frame 7: Down-Left
      { x: -10, y: 10 },
      // Frame 8: Down-Right
      { x: 10, y: 10 },
    ];
    return animationPatterns[frameTime % animationPatterns.length];
  }

  private showVenomCastingOverlay(): void {
    if (this.venomElement) {
      if (!document.body.contains(this.venomElement)) {
        document.body.appendChild(this.venomElement);
      }
      this.venomElement.style.display = "block";
      this.venomElement.style.transform = "translate(0px, 0px)"; // Reset transform
    }
  }

  public hideVenomCastingOverlay(): void {
    if (this.venomElement) {
      this.venomElement.style.display = "none";
      this.venomElement.style.transform = "translate(0px, 0px)"; // Reset transform
    }
    this.isShowingVenomCasting = false;
  }

  public updateStoneThrowingOverlay(troll: Troll | null): void {
    if (
      !troll ||
      troll.state !== "casting" ||
      troll.currentSkill !== "rockthrow"
    ) {
      if (this.isShowingStoneThrowing) {
        this.hideStoneThrowingOverlay();
      }
      return;
    }

    const now = Date.now();
    const elapsedTime = now - troll.skillCastStartTime;

    if (!this.isShowingStoneThrowing) {
      this.showStoneThrowingOverlay();
      this.isShowingStoneThrowing = true;
    }

    // Apply floating animation to each stone with different timing
    for (let i = 0; i < this.stoneElements.length; i++) {
      const stoneElement = this.stoneElements[i];
      if (stoneElement) {
        stoneElement.style.display = "block";
        const animationOffset = this.getStoneFloatingOffset(i, elapsedTime);
        stoneElement.style.transform = `translate(${animationOffset.x}px, ${animationOffset.y}px)`;
      }
    }
  }

  private getStoneFloatingOffset(
    stoneIndex: number,
    elapsedTime: number
  ): { x: number; y: number } {
    // Different floating patterns for each stone to avoid synchronized movement
    const baseSpeed = 0.003; // Slow floating speed
    const time = elapsedTime * baseSpeed;

    // Each stone has different phase offset to prevent synchronized movement
    const phaseOffset = (stoneIndex * Math.PI * 2) / 3; // 120 degrees apart

    // Floating amplitude - different for each stone
    const amplitudes = [
      { x: 15, y: 20 }, // Stone 1: moderate movement
      { x: 12, y: 25 }, // Stone 2: more vertical movement
      { x: 18, y: 15 }, // Stone 3: more horizontal movement
    ];

    const amplitude = amplitudes[stoneIndex] || amplitudes[0];

    // Calculate floating position using sine waves with different frequencies
    const x =
      Math.sin(time + phaseOffset) * amplitude.x +
      Math.sin(time * 0.7 + phaseOffset) * (amplitude.x * 0.3);
    const y =
      Math.cos(time * 0.8 + phaseOffset) * amplitude.y +
      Math.sin(time * 1.3 + phaseOffset) * (amplitude.y * 0.4);

    return { x, y };
  }

  private showStoneThrowingOverlay(): void {
    for (const stoneElement of this.stoneElements) {
      if (!document.body.contains(stoneElement)) {
        document.body.appendChild(stoneElement);
      }
      stoneElement.style.display = "block";
      stoneElement.style.transform = "translate(0px, 0px)"; // Reset transform
    }
  }

  public hideStoneThrowingOverlay(): void {
    for (const stoneElement of this.stoneElements) {
      stoneElement.style.display = "none";
      stoneElement.style.transform = "translate(0px, 0px)"; // Reset transform
    }

    this.isShowingStoneThrowing = false;
  }

  public updateShieldOverlay(troll: Troll | null): void {
    if (!troll || !troll.hasChunkArmor) {
      if (this.isShowingShield) {
        this.hideShieldOverlay();
      }
      return;
    }

    const now = Date.now();
    const elapsedTime = now - (troll.chunkArmorEndTime - 15000); // Start time of shield

    if (!this.isShowingShield) {
      this.showShieldOverlay();
      this.isShowingShield = true;
    }

    // Apply floating animation to shield
    if (this.shieldElement) {
      this.shieldElement.style.display = "block";
      const animationOffset = this.getShieldFloatingOffset(elapsedTime);
      this.shieldElement.style.transform = `translate(${animationOffset.x}px, ${animationOffset.y}px)`;
    }
  }

  private getShieldFloatingOffset(elapsedTime: number): {
    x: number;
    y: number;
  } {
    // Gentle floating animation for shield
    const baseSpeed = 0.002; // Very slow floating
    const time = elapsedTime * baseSpeed;

    // Gentle floating pattern
    const amplitude = { x: 8, y: 12 }; // Small movement range

    // Calculate floating position using sine waves
    const x =
      Math.sin(time) * amplitude.x + Math.sin(time * 0.6) * (amplitude.x * 0.4);
    const y =
      Math.cos(time * 0.8) * amplitude.y +
      Math.sin(time * 1.2) * (amplitude.y * 0.3);

    return { x, y };
  }

  private showShieldOverlay(): void {
    if (this.shieldElement && !document.body.contains(this.shieldElement)) {
      document.body.appendChild(this.shieldElement);
    }
    if (this.shieldElement) {
      this.shieldElement.style.display = "block";
      this.shieldElement.style.transform = "translate(0px, 0px)"; // Reset transform
    }
  }

  public hideShieldOverlay(): void {
    if (this.shieldElement) {
      this.shieldElement.style.display = "none";
      this.shieldElement.style.transform = "translate(0px, 0px)"; // Reset transform
    }
    this.isShowingShield = false;
  }

  public updateCrackOverlay(troll: Troll | null): void {
    if (!troll || troll.state !== "casting" || troll.currentSkill !== "stomp") {
      if (this.isShowingCracks) {
        this.hideCrackOverlay();
      }
      return;
    }

    const now = Date.now();
    const elapsedTime = now - troll.skillCastStartTime;
    const totalDuration = troll.skillCastDuration;
    const progress = Math.min(elapsedTime / totalDuration, 1.0);

    if (!this.isShowingCracks) {
      this.showCrackOverlay();
      this.isShowingCracks = true;
    }

    // First half: reveal crack_1 from right to left
    // Second half: reveal crack_2 from right to left
    const crack1Element = this.crackElements[0];
    const crack2Element = this.crackElements[1];

    if (crack1Element) {
      if (progress <= 0.5) {
        // First half: gradually reveal crack_1
        crack1Element.style.display = "block";
        const crack1Progress = progress * 2; // 0 to 1 for first half
        const revealPercent = crack1Progress * 100;
        // Clip from right: start with 100% clipped from left, gradually reduce
        crack1Element.style.clipPath = `inset(0 0 0 ${100 - revealPercent}%)`;
      } else {
        // Second half: crack_1 fully revealed
        crack1Element.style.display = "block";
        crack1Element.style.clipPath = `inset(0 0 0 0%)`;
      }
    }

    if (crack2Element) {
      if (progress <= 0.5) {
        // First half: crack_2 hidden
        crack2Element.style.display = "none";
      } else {
        // Second half: gradually reveal crack_2
        crack2Element.style.display = "block";
        const crack2Progress = (progress - 0.5) * 2; // 0 to 1 for second half
        const revealPercent = crack2Progress * 100;
        // Clip from right: start with 100% clipped from left, gradually reduce
        crack2Element.style.clipPath = `inset(0 0 0 ${100 - revealPercent}%)`;
      }
    }
  }

  private showCrackOverlay(): void {
    for (const crackElement of this.crackElements) {
      if (!document.body.contains(crackElement)) {
        document.body.appendChild(crackElement);
      }
      // Reset clipping
      crackElement.style.clipPath = "inset(0 0 0 100%)"; // Start fully clipped
    }
  }

  public hideCrackOverlay(): void {
    for (const crackElement of this.crackElements) {
      crackElement.style.display = "none";
      crackElement.style.clipPath = "none"; // Reset clipping
    }
    this.isShowingCracks = false;
  }

  public updateMouthOverlay(dementor: Dementor | null, player: Player): void {
    // Check if dementor is dead or not casting soul drain
    if (
      !dementor ||
      dementor.state === "dead" ||
      (dementor.state !== "casting" && !player.isImmobilized)
    ) {
      if (this.isShowingMouths) {
        this.hideMouthOverlay();
      }
      return;
    }

    const now = Date.now();

    // During casting phase: show mouths one by one
    if (dementor.state === "casting" && dementor.currentSkill === "souldrain") {
      const elapsedTime = now - dementor.skillCastStartTime;
      const mouthIndex = Math.floor(elapsedTime / 1333); // Show each mouth for ~1.33 seconds (4000ms / 3 mouths)

      if (!this.isShowingMouths) {
        this.showMouthOverlay();
        this.isShowingMouths = true;
      }

      // Show mouths progressively during casting
      for (let i = 0; i < this.mouthElements.length; i++) {
        const mouthElement = this.mouthElements[i];
        if (i <= mouthIndex) {
          mouthElement.style.display = "block";
        } else {
          mouthElement.style.display = "none";
        }
      }
    }
    // After successful cast: animate mouths while player is immobilized
    else if (player.isImmobilized && Date.now() < player.immobilizedEndTime) {
      if (!this.isShowingMouths) {
        this.showMouthOverlay();
        this.isShowingMouths = true;
      }

      // Frame-by-frame animation while debuff is active
      const frameTime = Math.floor(Date.now() / 300); // Change frame every 300ms
      const currentFrame = frameTime % 3; // Cycle through 3 frames

      for (let i = 0; i < this.mouthElements.length; i++) {
        const mouthElement = this.mouthElements[i];
        mouthElement.style.display = i === currentFrame ? "block" : "none";
      }
    }
    // Debuff ended or casting interrupted: hide mouths
    else {
      if (this.isShowingMouths) {
        this.hideMouthOverlay();
      }
    }
  }

  private showMouthOverlay(): void {
    for (const mouthElement of this.mouthElements) {
      if (!document.body.contains(mouthElement)) {
        document.body.appendChild(mouthElement);
      }
    }
  }

  public hideMouthOverlay(): void {
    for (const mouthElement of this.mouthElements) {
      mouthElement.style.display = "none";
    }
    this.isShowingMouths = false;
  }

  public updateNotAllowedOverlay(
    dementor: Dementor | null,
    player: Player
  ): void {
    // Check if dementor is dead or not casting silence shriek
    if (
      !dementor ||
      dementor.state === "dead" ||
      (dementor.state !== "casting" &&
        !(
          player.isSilenced &&
          player.silenceEndTime &&
          Date.now() < player.silenceEndTime
        ))
    ) {
      if (this.isShowingNotAllowed) {
        this.hideNotAllowedOverlay();
      }
      return;
    }

    const now = Date.now();

    // During casting phase: gradual reveal from right to left, top to bottom
    if (
      dementor.state === "casting" &&
      dementor.currentSkill === "silenceshriek"
    ) {
      const elapsedTime = now - dementor.skillCastStartTime;
      const totalDuration = dementor.skillCastDuration;
      const progress = Math.min(elapsedTime / totalDuration, 1.0);

      if (!this.isShowingNotAllowed) {
        this.showNotAllowedOverlay();
        this.isShowingNotAllowed = true;
      }

      if (this.notAllowedElement) {
        this.notAllowedElement.style.display = "block";

        // Gradual reveal from right to left, top to bottom
        // Start with fully clipped (100% right, 100% bottom), gradually reveal
        const rightClip = (1 - progress) * 100; // Start at 100%, go to 0%
        const bottomClip = (1 - progress) * 100; // Start at 100%, go to 0%

        this.notAllowedElement.style.clipPath = `inset(0 ${rightClip}% ${bottomClip}% 0)`;
      }
    }
    // After successful cast: blink while player is silenced
    else if (
      player.isSilenced &&
      player.silenceEndTime &&
      Date.now() < player.silenceEndTime
    ) {
      if (!this.isShowingNotAllowed) {
        this.showNotAllowedOverlay();
        this.isShowingNotAllowed = true;
      }

      if (this.notAllowedElement) {
        // Blinking animation - toggle every 500ms
        const blinkSpeed = 500;
        const isBlinkCycle = Math.floor(Date.now() / blinkSpeed) % 2 === 0;

        this.notAllowedElement.style.display = isBlinkCycle ? "block" : "none";
        this.notAllowedElement.style.clipPath = "none"; // Remove clipping during blink
      }
    }
    // Debuff ended or casting interrupted: hide not allowed
    else {
      if (this.isShowingNotAllowed) {
        this.hideNotAllowedOverlay();
      }
    }
  }

  private showNotAllowedOverlay(): void {
    if (
      this.notAllowedElement &&
      !document.body.contains(this.notAllowedElement)
    ) {
      document.body.appendChild(this.notAllowedElement);
    }
  }

  public hideNotAllowedOverlay(): void {
    if (this.notAllowedElement) {
      this.notAllowedElement.style.display = "none";
      this.notAllowedElement.style.clipPath = "none"; // Reset clipping
    }
    this.isShowingNotAllowed = false;
  }

  public updatePlayerShieldOverlay(player: Player): void {
    // Check if player is protected
    if (player.isProtected && Date.now() < player.protectionEndTime) {
      if (!this.isShowingPlayerShield) {
        this.showPlayerShieldOverlay();
        this.isShowingPlayerShield = true;
      }

      // Add floating animation while shield is active
      if (this.playerShieldElement) {
        this.playerShieldElement.style.display = "block";

        const now = Date.now();
        const elapsedTime = now - (player.protectionEndTime - 5000); // Start time of protection
        const animationOffset = this.getPlayerShieldFloatingOffset(elapsedTime);
        this.playerShieldElement.style.transform = `translate(${animationOffset.x}px, ${animationOffset.y}px)`;
      }
    } else {
      // Protection ended: hide shield
      if (this.isShowingPlayerShield) {
        this.hidePlayerShieldOverlay();
      }
    }
  }

  private showPlayerShieldOverlay(): void {
    if (
      this.playerShieldElement &&
      !document.body.contains(this.playerShieldElement)
    ) {
      document.body.appendChild(this.playerShieldElement);
    }
    if (this.playerShieldElement) {
      this.playerShieldElement.style.display = "block";
      this.playerShieldElement.style.transform = "translate(0px, 0px)"; // Reset transform
    }
  }

  public hidePlayerShieldOverlay(): void {
    if (this.playerShieldElement) {
      this.playerShieldElement.style.display = "none";
      this.playerShieldElement.style.transform = "translate(0px, 0px)"; // Reset transform
    }
    this.isShowingPlayerShield = false;
  }

  private getPlayerShieldFloatingOffset(elapsedTime: number): {
    x: number;
    y: number;
  } {
    // Gentle floating animation for player shield
    const baseSpeed = 0.0025; // Slightly faster than troll shield
    const time = elapsedTime * baseSpeed;

    // Gentle floating pattern with protective feel
    const amplitude = { x: 6, y: 10 }; // Smaller movement range for player shield

    // Calculate floating position using sine waves with magical feel
    const x =
      Math.sin(time) * amplitude.x + Math.sin(time * 0.7) * (amplitude.x * 0.3);
    const y =
      Math.cos(time * 0.9) * amplitude.y +
      Math.sin(time * 1.1) * (amplitude.y * 0.4);

    return { x, y };
  }

  public triggerMagicFlow(): void {
    this.isShowingMagicFlow = true;
    this.magicFlowStartTime = Date.now();

    if (
      this.magicFlowElement &&
      !document.body.contains(this.magicFlowElement)
    ) {
      document.body.appendChild(this.magicFlowElement);
    }
  }

  public updateMagicFlowOverlay(): void {
    if (!this.isShowingMagicFlow) return;

    const now = Date.now();
    const elapsedTime = now - this.magicFlowStartTime;
    const progress = Math.min(elapsedTime / this.magicFlowDuration, 1.0);

    if (this.magicFlowElement) {
      this.magicFlowElement.style.display = "block";

      // Left to right reveal animation
      const revealPercent = progress * 100; // 0% to 100%

      // Fade effect that also moves from left to right
      // Early part of animation: start revealing with full opacity
      // Later part: continue revealing but start fading
      let opacity = 1.0;
      if (progress > 0.4) {
        // Start fading after 40% of animation
        const fadeProgress = (progress - 0.4) / 0.6; // 0 to 1 for remaining 60%
        opacity = 1.0 - fadeProgress;
      }

      // Clip from left: start with 100% clipped from right, gradually reveal
      this.magicFlowElement.style.clipPath = `inset(0 ${
        100 - revealPercent
      }% 0 0)`;
      this.magicFlowElement.style.opacity = opacity.toString();
    }

    // Animation complete
    if (progress >= 1.0) {
      this.hideMagicFlowOverlay();
    }
  }

  public hideMagicFlowOverlay(): void {
    if (this.magicFlowElement) {
      this.magicFlowElement.style.display = "none";
      this.magicFlowElement.style.clipPath = "none"; // Reset clipping
      this.magicFlowElement.style.opacity = "1"; // Reset opacity
    }
    this.isShowingMagicFlow = false;
  }

  public triggerIncendio(): void {
    this.isShowingIncendio = true;
    this.incendioStartTime = Date.now();

    if (this.incendioElement) {
      if (!document.body.contains(this.incendioElement)) {
        document.body.appendChild(this.incendioElement);
      }
      this.incendioElement.style.display = "block";
      this.incendioElement.style.transform = "translate(0px, 0px)"; // Reset transform
    }
  }

  public updateIncendioOverlay(): void {
    if (!this.isShowingIncendio) return;

    const now = Date.now();
    const elapsedTime = now - this.incendioStartTime;
    const progress = Math.min(elapsedTime / this.incendioDuration, 1.0);

    if (this.incendioElement) {
      this.incendioElement.style.display = "block";

      // Frame-by-frame animation for 0.5 seconds
      const frameTime = Math.floor(elapsedTime / 50); // 0.05 seconds per frame (faster)
      const animationOffset = this.getIncendioAnimationOffset(frameTime);
      this.incendioElement.style.transform = `translate(${animationOffset.x}px, ${animationOffset.y}px)`;
    }

    // Animation complete
    if (progress >= 1.0) {
      this.hideIncendioOverlay();
    }
  }

  private getIncendioAnimationOffset(frameTime: number): {
    x: number;
    y: number;
  } {
    const animationPatterns = [
      // Frame 0: Center
      { x: 0, y: 0 },
      // Frame 1: Flame flicker up
      { x: 0, y: -8 },
      // Frame 2: Flame flicker down
      { x: 0, y: 8 },
      // Frame 3: Flame flicker left
      { x: -8, y: 0 },
      // Frame 4: Flame flicker right
      { x: 8, y: 0 },
      // Frame 5: Diagonal flicker
      { x: -6, y: -6 },
      // Frame 6: Opposite diagonal
      { x: 6, y: 6 },
      // Frame 7: Intense flicker
      { x: 0, y: -12 },
      // Frame 8: Settle
      { x: 0, y: 0 },
    ];
    return animationPatterns[frameTime % animationPatterns.length];
  }

  public hideIncendioOverlay(): void {
    if (this.incendioElement) {
      this.incendioElement.style.display = "none";
      this.incendioElement.style.transform = "translate(0px, 0px)"; // Reset transform
    }
    this.isShowingIncendio = false;
  }

  public triggerBombarda(): void {
    this.isShowingBombarda = true;
    this.bombardaStartTime = Date.now();

    if (this.bombardaElement) {
      if (!document.body.contains(this.bombardaElement)) {
        document.body.appendChild(this.bombardaElement);
      }
      this.bombardaElement.style.display = "block";
      this.bombardaElement.style.transform = "translate(0px, 0px)"; // Reset transform
    }
  }

  public updateBombardaOverlay(): void {
    if (!this.isShowingBombarda) return;

    const now = Date.now();
    const elapsedTime = now - this.bombardaStartTime;
    const progress = Math.min(elapsedTime / this.bombardaDuration, 1.0);

    if (this.bombardaElement) {
      this.bombardaElement.style.display = "block";

      // Frame-by-frame animation for 1 second
      const frameTime = Math.floor(elapsedTime / 100); // 0.1 seconds per frame
      const animationOffset = this.getBombardaAnimationOffset(frameTime);
      this.bombardaElement.style.transform = `translate(${animationOffset.x}px, ${animationOffset.y}px)`;
    }

    // Animation complete
    if (progress >= 0.5) {
      this.hideBombardaOverlay();
    }
  }

  private getBombardaAnimationOffset(frameTime: number): {
    x: number;
    y: number;
  } {
    const animationPatterns = [
      // Frame 0: Center
      { x: 0, y: 0 },
      // Frame 1: Explosive outward
      { x: 15, y: -15 },
      // Frame 2: More explosive
      { x: -12, y: 18 },
      // Frame 3: Chaotic movement
      { x: 20, y: 8 },
      // Frame 4: Settle down
      { x: -8, y: -12 },
      // Frame 5: Final explosion wave
      { x: 25, y: -20 },
      // Frame 6: Contracting
      { x: -18, y: 15 },
      // Frame 7: Last burst
      { x: 10, y: -25 },
      // Frame 8: Return to center
      { x: 0, y: 0 },
    ];
    return animationPatterns[frameTime % animationPatterns.length];
  }

  public hideBombardaOverlay(): void {
    if (this.bombardaElement) {
      this.bombardaElement.style.display = "none";
      this.bombardaElement.style.transform = "translate(0px, 0px)"; // Reset transform
    }
    this.isShowingBombarda = false;
  }

  public triggerGlacius(): void {
    this.isShowingGlacius = true;
    this.glaciusStartTime = Date.now();

    if (this.glaciusElement) {
      if (!document.body.contains(this.glaciusElement)) {
        document.body.appendChild(this.glaciusElement);
      }
      this.glaciusElement.style.display = "block";
      this.glaciusElement.style.opacity = "0"; // Start invisible for fade in
    }
  }

  public updateGlaciusOverlay(): void {
    if (!this.isShowingGlacius) return;

    const now = Date.now();
    const elapsedTime = now - this.glaciusStartTime;
    const progress = Math.min(elapsedTime / this.glaciusDuration, 1.0);

    if (this.glaciusElement) {
      this.glaciusElement.style.display = "block";

      // Fade in effect - simple opacity animation
      const fadeInDuration = 300; // 0.3 seconds to fade in
      if (elapsedTime <= fadeInDuration) {
        // Fade in phase
        const fadeProgress = elapsedTime / fadeInDuration;
        this.glaciusElement.style.opacity = fadeProgress.toString();
      } else {
        // Fully visible phase
        this.glaciusElement.style.opacity = "1";
      }
    }

    // Animation complete
    if (progress >= 1.0) {
      this.hideGlaciusOverlay();
    }
  }

  public hideGlaciusOverlay(): void {
    if (this.glaciusElement) {
      this.glaciusElement.style.display = "none";
      this.glaciusElement.style.opacity = "1"; // Reset opacity
    }
    this.isShowingGlacius = false;
  }

  public triggerAvada(): void {
    this.isShowingAvada = true;
    this.avadaStartTime = Date.now();

    if (this.avadaElement) {
      if (!document.body.contains(this.avadaElement)) {
        document.body.appendChild(this.avadaElement);
      }
      this.avadaElement.style.display = "block";
      this.avadaElement.style.opacity = "0"; // Start invisible for fade in
    }

    if (this.avadaGlowElement) {
      if (!document.body.contains(this.avadaGlowElement)) {
        document.body.appendChild(this.avadaGlowElement);
      }
      this.avadaGlowElement.style.display = "block";
      this.avadaGlowElement.style.opacity = "0"; // Start invisible for fade in
    }
  }

  public updateAvadaOverlay(): void {
    if (!this.isShowingAvada) return;

    const now = Date.now();
    const elapsedTime = now - this.avadaStartTime;
    const progress = Math.min(elapsedTime / this.avadaDuration, 1.0);

    // Lightning element - left to right reveal animation (0.8 seconds)
    const lightningDuration = 800;
    if (this.avadaElement && elapsedTime <= lightningDuration) {
      this.avadaElement.style.display = "block";

      // Left to right reveal animation (quick)
      const revealDuration = 400; // 0.4 seconds for lightning reveal
      if (elapsedTime <= revealDuration) {
        const revealProgress = elapsedTime / revealDuration;
        const revealPercent = revealProgress * 100; // 0% to 100%

        // Clip from left: start with 100% clipped from right, gradually reveal
        this.avadaElement.style.clipPath = `inset(0 ${
          100 - revealPercent
        }% 0 0)`;
        this.avadaElement.style.opacity = "1";
      } else {
        // Fully revealed, then fade out
        this.avadaElement.style.clipPath = `inset(0 0% 0 0)`;
        const fadeOutProgress =
          (elapsedTime - revealDuration) / (lightningDuration - revealDuration);
        this.avadaElement.style.opacity = (1 - fadeOutProgress).toString();
      }
    } else if (this.avadaElement) {
      // Lightning finished, hide it
      this.avadaElement.style.display = "none";
    }

    // Green glow element - pulse effect for full duration (1.8 seconds)
    if (this.avadaGlowElement) {
      this.avadaGlowElement.style.display = "block";

      // Pulsing glow effect with slower fade out towards the end
      if (elapsedTime <= 1200) {
        // First 1.2 seconds: full intensity pulsing
        const pulseSpeed = 0.01; // Fast pulse
        const pulseIntensity = Math.sin(elapsedTime * pulseSpeed) * 0.2 + 0.4; // 0.2 to 0.6 opacity
        this.avadaGlowElement.style.opacity = pulseIntensity.toString();
      } else {
        // Last 0.6 seconds: gradual fade out while still pulsing
        const fadeOutProgress = (elapsedTime - 1200) / 600; // 0 to 1 over last 0.6s
        const pulseSpeed = 0.01;
        const pulseIntensity = Math.sin(elapsedTime * pulseSpeed) * 0.2 + 0.4;
        const finalIntensity = pulseIntensity * (1 - fadeOutProgress);
        this.avadaGlowElement.style.opacity = Math.max(
          0,
          finalIntensity
        ).toString();
      }
    }

    // Animation complete
    if (progress >= 1.0) {
      this.hideAvadaOverlay();
    }
  }

  public hideAvadaOverlay(): void {
    if (this.avadaElement) {
      this.avadaElement.style.display = "none";
      this.avadaElement.style.opacity = "1"; // Reset opacity
      this.avadaElement.style.clipPath = "none"; // Reset clipping
    }
    if (this.avadaGlowElement) {
      this.avadaGlowElement.style.display = "none";
      this.avadaGlowElement.style.opacity = "1"; // Reset opacity
    }
    this.isShowingAvada = false;
  }

  public updateStunnedOverlay(
    spider: Spider | null,
    troll: Troll | null,
    dementor: Dementor | null
  ): void {
    // Check if any enemy is stunned
    const currentEnemy = spider || troll || dementor;
    const isEnemyStunned =
      currentEnemy &&
      currentEnemy.state === "stunned" &&
      Date.now() < currentEnemy.stunEndTime;

    if (isEnemyStunned) {
      if (!this.isShowingStunned) {
        this.showStunnedOverlay();
        this.isShowingStunned = true;
        this.stunnedAnimationStartTime = Date.now();
      }

      // Apply gentle left-right swaying animation
      if (this.stunnedElement) {
        this.stunnedElement.style.display = "block";

        const now = Date.now();
        const elapsedTime = now - this.stunnedAnimationStartTime;
        const frameTime = Math.floor(elapsedTime / 200); // 0.2 seconds per frame
        const rotationAngle = this.getStunnedSeesawRotation(frameTime);
        this.stunnedElement.style.transform = `rotate(${rotationAngle}deg)`;
        this.stunnedElement.style.transformOrigin = "center center"; // Rotate around center
      }
    } else {
      // No enemy stunned: hide stunned effect
      if (this.isShowingStunned) {
        this.hideStunnedOverlay();
      }
    }
  }

  private getStunnedSeesawRotation(frameTime: number): number {
    const rotationPatterns = [
      // Frame 0: Center
      0,
      // Frame 1: Tilt left
      -3,
      // Frame 2: Back to center
      0,
      // Frame 3: Tilt right
      3,
    ];
    return rotationPatterns[frameTime % rotationPatterns.length];
  }

  private showStunnedOverlay(): void {
    if (this.stunnedElement && !document.body.contains(this.stunnedElement)) {
      document.body.appendChild(this.stunnedElement);
    }
    if (this.stunnedElement) {
      this.stunnedElement.style.display = "block";
      this.stunnedElement.style.transform = "rotate(0deg)"; // Reset transform
      this.stunnedElement.style.transformOrigin = "center center";
    }
  }

  public hideStunnedOverlay(): void {
    if (this.stunnedElement) {
      this.stunnedElement.style.display = "none";
      this.stunnedElement.style.transform = "rotate(0deg)"; // Reset transform
      this.stunnedElement.style.transformOrigin = "center center";
    }
    this.isShowingStunned = false;
  }

  public triggerPlayerShake(): void {
    this.isPlayerShaking = true;
    this.shakeStartTime = Date.now();
  }

  private getPlayerShakeOffset(): { x: number; y: number } {
    if (!this.isPlayerShaking) {
      return { x: 0, y: 0 };
    }

    const now = Date.now();
    const elapsed = now - this.shakeStartTime;

    if (elapsed >= this.shakeDuration) {
      this.isPlayerShaking = false;
      return { x: 0, y: 0 };
    }

    // Calculate shake intensity that decreases over time
    const progress = elapsed / this.shakeDuration;
    const intensityMultiplier = 1 - progress; // Start at 1, fade to 0
    const currentIntensity = this.shakeIntensity * intensityMultiplier;

    // Generate random shake offset in all directions
    const shakeX = (Math.random() - 0.5) * 2 * currentIntensity;
    const shakeY = (Math.random() - 0.5) * 2 * currentIntensity;

    return { x: shakeX, y: shakeY };
  }

  public updateAnimatedBackgrounds(): void {
    const now = Date.now();
    const animationElapsed = now - this.backgroundAnimationStartTime;

    for (let i = 0; i < this.backgroundElements.length; i++) {
      const bgElement = this.backgroundElements[i];
      const bgIndex = i + 1; // bg_1, bg_2, bg_3, bg_4

      // Different frame timings:
      // bg_1 and bg_3: every 0.5 seconds (500ms)
      // bg_2 and bg_4: every 0.4 seconds (400ms)
      let frameInterval;
      if (bgIndex === 1 || bgIndex === 3) {
        frameInterval = 500; // 0.5 seconds
      } else {
        frameInterval = 400; // 0.4 seconds
      }

      const frameTime = Math.floor(animationElapsed / frameInterval);
      const animationOffset = this.getBackgroundAnimationOffset(
        bgIndex,
        frameTime
      );

      bgElement.style.transform = `translate(${animationOffset.x}px, ${animationOffset.y}px)`;
    }
  }

  private getBackgroundAnimationOffset(
    bgIndex: number,
    frameTime: number
  ): { x: number; y: number } {
    // Different animation patterns for each background to create layered depth effect
    const animationPatterns = [
      // bg_1: Slow horizontal drift
      [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 0 },
        { x: -2, y: 0 },
      ],
      // bg_2: Gentle vertical sway
      [
        { x: 0, y: 0 },
        { x: 0, y: 3 },
        { x: 0, y: 0 },
        { x: 0, y: -3 },
      ],
      // bg_3: Diagonal gentle drift
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        { x: -1, y: -1 },
      ],
      // bg_4: Circular subtle movement
      [
        { x: 0, y: 0 },
        { x: 2, y: -1 },
        { x: 0, y: -2 },
        { x: -2, y: -1 },
      ],
    ];

    const patternIndex = (bgIndex - 1) % animationPatterns.length;
    const frameIndex = frameTime % animationPatterns[patternIndex].length;
    return animationPatterns[patternIndex][frameIndex];
  }

  public cleanupAnimatedBackgrounds(): void {
    for (const bgElement of this.backgroundElements) {
      if (document.body.contains(bgElement)) {
        document.body.removeChild(bgElement);
      }
    }
    this.backgroundElements = [];
  }

  public cleanup(): void {
    this.cleanupAnimatedBackgrounds();
    this.hideSpiderWebOverlays();
    this.hidePoisonedEffects();
    this.hideVenomCastingOverlay();
    this.hideStoneThrowingOverlay();
    this.hideShieldOverlay();
    this.hideCrackOverlay();
    this.hideMouthOverlay();
    this.hideNotAllowedOverlay();
    this.hidePlayerShieldOverlay();
    this.hideMagicFlowOverlay();
    this.hideIncendioOverlay();
    this.hideBombardaOverlay();
    this.hideGlaciusOverlay();
    this.hideAvadaOverlay();
    this.hideStunnedOverlay();
    this.hideSpiderName();
    this.hideTrollName();
    this.hideDementorName();
  }

  public clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public drawPlayer(player: Player): void {
    // Add subtle breathing animation (gentle movement)
    const now = Date.now();
    const breathingSpeed = 0.002; // Slow breathing
    const breathingAmplitude = 3; // Small movement range (3 pixels)
    const breathingOffset = Math.sin(now * breathingSpeed) * breathingAmplitude;

    // Get shake offset for damage feedback
    const shakeOffset = this.getPlayerShakeOffset();

    // Apply breathing animation to y position (up and down movement)
    const originalY = player.y;
    player.y = player.originalY + breathingOffset;

    // Create player image if it doesn't exist
    if (!(window as any).playerImage) {
      (window as any).playerImage = new Image();
      (window as any).playerImage.src = "/assets/player.png";
    }

    const playerImage = (window as any).playerImage;

    // Draw the player image with proper aspect ratio and shake offset
    if (playerImage.complete) {
      // Calculate aspect ratio-preserving dimensions using actual image proportions
      const originalAspectRatio = 302 / 465; // Actual player image dimensions (don't stretch)
      const targetWidth = player.width;
      const targetHeight = player.height;

      // Calculate the largest size that fits within the target area while maintaining aspect ratio
      let drawWidth, drawHeight;
      if (targetWidth / targetHeight > originalAspectRatio) {
        // Target is wider than original aspect ratio
        drawHeight = targetHeight;
        drawWidth = targetHeight * originalAspectRatio;
      } else {
        // Target is taller than original aspect ratio
        drawWidth = targetWidth;
        drawHeight = targetWidth / originalAspectRatio;
      }

      // Center the image within the target area and apply shake offset
      const offsetX = player.x + (targetWidth - drawWidth) / 2 + shakeOffset.x;
      const offsetY =
        player.y + (targetHeight - drawHeight) / 2 + shakeOffset.y;

      this.ctx.drawImage(playerImage, offsetX, offsetY, drawWidth, drawHeight);
    } else {
      // Fallback to original drawing if image not loaded, with shake offset
      // Main body
      this.ctx.fillStyle = player.color;
      this.ctx.fillRect(
        player.x + shakeOffset.x,
        player.y + shakeOffset.y,
        player.width,
        player.height
      );

      // Simple head
      this.ctx.fillStyle = "#fdbcb4";
      this.ctx.fillRect(
        player.x + 10 + shakeOffset.x,
        player.y - 20 + shakeOffset.y,
        40,
        30
      );

      // Eyes
      this.ctx.fillStyle = "#000000";
      this.ctx.fillRect(
        player.x + 18 + shakeOffset.x,
        player.y - 12 + shakeOffset.y,
        4,
        4
      );
      this.ctx.fillRect(
        player.x + 38 + shakeOffset.x,
        player.y - 12 + shakeOffset.y,
        4,
        4
      );

      // Mouth
      this.ctx.fillRect(
        player.x + 25 + shakeOffset.x,
        player.y - 5 + shakeOffset.y,
        10,
        2
      );

      // Arms
      this.ctx.fillStyle = player.color;
      this.ctx.fillRect(
        player.x - 20 + shakeOffset.x,
        player.y + 40 + shakeOffset.y,
        20,
        40
      );
      this.ctx.fillRect(
        player.x + player.width + shakeOffset.x,
        player.y + 40 + shakeOffset.y,
        20,
        40
      );

      // Legs
      this.ctx.fillRect(
        player.x + 10 + shakeOffset.x,
        player.y + player.height + shakeOffset.y,
        20,
        40
      );
      this.ctx.fillRect(
        player.x + 30 + shakeOffset.x,
        player.y + player.height + shakeOffset.y,
        20,
        40
      );

      // Wand
      this.ctx.fillStyle = "#8B4513";
      this.ctx.fillRect(
        player.x + player.width + 20 + shakeOffset.x,
        player.y + 50 + shakeOffset.y,
        2,
        20
      );

      // Wand tip
      this.ctx.fillStyle = "#FFD700";
      this.ctx.fillRect(
        player.x + player.width + 19 + shakeOffset.x,
        player.y + 48 + shakeOffset.y,
        4,
        4
      );
    }

    // Restore original Y position (don't permanently modify the player object)
    player.y = originalY;
  }

  public drawCollageHealthBar(
    character: Player | Spider | Troll | Dementor,
    x: number,
    y: number,
    label: string,
    align: "left" | "right" = "left"
  ): void {
    // Determine bar width based on character type
    let barWidth = 750; // Default for player and Troll (increased from 500)
    if ("type" in character) {
      if (character.type === "spider") {
        barWidth = 525; // Spider: 40 HP = 525px bar (increased from 350)
      } else if (character.type === "dementor") {
        barWidth = 900; // Dementor: 150 HP = 900px bar (increased from 600)
      }
    }

    const barHeight = 25; // Increased from 20
    const healthPercentage = character.currentHealth / character.maxHealth;

    // Calculate the new width based on health percentage
    const newBarWidth = barWidth * healthPercentage;

    // Adjust position for right alignment
    if (align === "right") {
      x = this.canvas.width - barWidth - 50; // Align to the right with a 50px gap
    }

    // Background bar with paper texture
    const paperTextureElement = document.getElementById(
      "paperTexture"
    ) as HTMLImageElement;
    if (paperTextureElement) {
      const paperTexture = this.ctx.createPattern(
        paperTextureElement,
        "repeat"
      );
      if (paperTexture) {
        this.ctx.fillStyle = paperTexture;
        this.ctx.fillRect(x, y, barWidth, barHeight);
      }
    }

    // Health bar with red color scheme and irregular edges
    this.ctx.fillStyle = "#e74c3c"; // Red
    this.ctx.beginPath();
    if (align === "left") {
      this.ctx.moveTo(x, y);
      for (let i = 0; i < newBarWidth; i += 10) {
        const offset = Math.random() * 2 - 1; // More pronounced movement
        this.ctx.lineTo(x + i, y + offset);
      }
      this.ctx.lineTo(x + newBarWidth, y + barHeight);
      for (let i = newBarWidth; i > 0; i -= 10) {
        const offset = Math.random() * 2 - 1; // More pronounced movement
        this.ctx.lineTo(x + i, y + barHeight + offset);
      }
      this.ctx.lineTo(x, y + barHeight);
    } else {
      // Mirror for right alignment
      this.ctx.moveTo(x + barWidth, y);
      for (let i = 0; i < newBarWidth; i += 10) {
        const offset = Math.random() * 2 - 1; // More pronounced movement
        this.ctx.lineTo(x + barWidth - i, y + offset);
      }
      this.ctx.lineTo(x + barWidth - newBarWidth, y + barHeight);
      for (let i = newBarWidth; i > 0; i -= 10) {
        const offset = Math.random() * 2 - 1; // More pronounced movement
        this.ctx.lineTo(x + barWidth - i, y + barHeight + offset);
      }
      this.ctx.lineTo(x + barWidth, y + barHeight);
    }
    this.ctx.closePath();
    this.ctx.fill();

    // Irregular white border with animation
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    if (align === "left") {
      // Top edge with animation (irregular)
      this.ctx.moveTo(x, y);
      for (let i = 0; i < barWidth; i += 10) {
        const offset = Math.random() * 2 - 1; // More pronounced movement
        this.ctx.lineTo(x + i, y + offset);
      }
      // Right edge (straight line to bottom)
      this.ctx.lineTo(x + barWidth, y + barHeight);
      // Bottom edge with animation (irregular)
      for (let i = barWidth; i > 0; i -= 10) {
        const offset = Math.random() * 2 - 1; // More pronounced movement
        this.ctx.lineTo(x + i, y + barHeight + offset);
      }
      // Left edge (straight line back to start)
      this.ctx.lineTo(x, y + barHeight);
    } else {
      // Mirror for right alignment
      // Top edge with animation (irregular)
      this.ctx.moveTo(x + barWidth, y);
      for (let i = 0; i < barWidth; i += 10) {
        const offset = Math.random() * 2 - 1; // More pronounced movement
        this.ctx.lineTo(x + barWidth - i, y + offset);
      }
      // Left edge (straight line to bottom)
      this.ctx.lineTo(x, y + barHeight);
      // Bottom edge with animation (irregular)
      for (let i = 0; i < barWidth; i += 10) {
        const offset = Math.random() * 2 - 1; // More pronounced movement
        this.ctx.lineTo(x + i, y + barHeight + offset);
      }
      // Right edge (straight line back to start)
      this.ctx.lineTo(x + barWidth, y + barHeight);
    }
    this.ctx.closePath();
    this.ctx.stroke();

    // Label and health text
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 18px Arial";
    this.ctx.fillText(label, x, y - 10);

    // Show current/max health with color coding - centered inside the bar
    this.ctx.fillStyle = character.currentHealth <= 0 ? "#e74c3c" : "#ffffff";
    this.ctx.font = "bold 16px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `${character.currentHealth}/${character.maxHealth}`,
      x + barWidth / 2,
      y + 18
    );
    this.ctx.textAlign = "left"; // Reset text alignment
  }

  public drawMagicBar(player: Player, x: number, y: number): void {
    const barWidth = 600; // Slightly shorter than health bar (750px)
    const barHeight = 20; // Slightly thinner than health bar (25px)
    const magicPercentage = player.currentMagic / player.maxMagic;

    // Calculate the new width based on magic percentage
    const newBarWidth = barWidth * magicPercentage;

    // Background bar with paper texture
    const paperTextureElement = document.getElementById(
      "paperTexture"
    ) as HTMLImageElement;
    if (paperTextureElement) {
      const paperTexture = this.ctx.createPattern(
        paperTextureElement,
        "repeat"
      );
      if (paperTexture) {
        this.ctx.fillStyle = paperTexture;
        this.ctx.fillRect(x, y, barWidth, barHeight);
      }
    }

    // Magic bar with blue/purple color scheme and irregular edges
    this.ctx.fillStyle = "#8e44ad"; // Purple
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    for (let i = 0; i < newBarWidth; i += 10) {
      const offset = Math.random() * 2 - 1; // More pronounced movement
      this.ctx.lineTo(x + i, y + offset);
    }
    this.ctx.lineTo(x + newBarWidth, y + barHeight);
    for (let i = newBarWidth; i > 0; i -= 10) {
      const offset = Math.random() * 2 - 1; // More pronounced movement
      this.ctx.lineTo(x + i, y + barHeight + offset);
    }
    this.ctx.lineTo(x, y + barHeight);
    this.ctx.closePath();
    this.ctx.fill();

    // Irregular white border with animation
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    // Top edge with animation (irregular)
    this.ctx.moveTo(x, y);
    for (let i = 0; i < barWidth; i += 10) {
      const offset = Math.random() * 2 - 1; // More pronounced movement
      this.ctx.lineTo(x + i, y + offset);
    }
    // Right edge (straight line to bottom)
    this.ctx.lineTo(x + barWidth, y + barHeight);
    // Bottom edge with animation (irregular)
    for (let i = barWidth; i > 0; i -= 10) {
      const offset = Math.random() * 2 - 1; // More pronounced movement
      this.ctx.lineTo(x + i, y + barHeight + offset);
    }
    // Left edge (straight line back to start)
    this.ctx.lineTo(x, y + barHeight);
    this.ctx.closePath();
    this.ctx.stroke();

    // Magic icon and text
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 16px Arial";
    this.ctx.fillText("✨", x - 25, y + 16);

    // Show current/max magic with color coding - centered inside the bar
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 14px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `${player.currentMagic}/${player.maxMagic}`,
      x + barWidth / 2,
      y + 15
    );
    this.ctx.textAlign = "left"; // Reset text alignment
  }

  public drawEnemyCastingBar(
    enemy: Spider | Troll | Dementor,
    _x: number,
    y: number
  ): void {
    if (enemy.state !== "casting" || !enemy.currentSkill) return;

    const now = Date.now();
    const progress = Math.min(
      (now - enemy.skillCastStartTime) / enemy.skillCastDuration,
      1.0
    );

    const pixelsPerSecond = 120;
    const castingDurationSeconds = enemy.skillCastDuration / 1000;
    const barWidth = castingDurationSeconds * pixelsPerSecond;

    const barHeight = 12;

    // Position the bar so its right edge aligns with the HP bar's right edge
    const rightEdge = this.canvas.width - 50; // Same as HP bar right edge
    const barX = rightEdge - barWidth;

    // Progress bar background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(barX, y, barWidth, barHeight);

    // Progress bar fill (from right to left)
    this.ctx.fillStyle = "#c6d64f";
    const progressWidth = barWidth * progress;
    this.ctx.fillRect(
      barX + barWidth - progressWidth,
      y,
      progressWidth,
      barHeight
    );

    // Progress bar border
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(barX, y, barWidth, barHeight);

    // Skill name below the progress bar
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 16px Arial";
    this.ctx.textAlign = "right";

    // Format skill name nicely
    let skillName = enemy.currentSkill;
    if (skillName === "web") skillName = "Entangling Web";
    else if (skillName === "venom") skillName = "Venom Spit";
    else if (skillName === "rockthrow") skillName = "Rock Throw";
    else if (skillName === "chunkarmor") skillName = "Chunk Armor";
    else if (skillName === "stomp") skillName = "Stomp";
    else if (skillName === "souldrain") skillName = "Soul Drain";
    else if (skillName === "silenceshriek") skillName = "Silence Shriek";
    else skillName = skillName.charAt(0).toUpperCase() + skillName.slice(1);

    this.ctx.fillText(skillName, barX + barWidth, y + barHeight + 16);

    this.ctx.textAlign = "left";
  }

  public drawEnhancedStatusEffects(
    _player: Player,
    _spider: Spider | null,
    _troll: Troll | null,
    _dementor: Dementor | null
  ): void {
    // All status text display removed - only visual effects remain
    this.ctx.textAlign = "left";
  }

  public drawGameMessages(
    gameWon: boolean,
    gameOver: boolean,
    _lastSpellCast: string | null
  ): void {
    if (gameWon) {
      // Victory message
      this.ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
      this.ctx.fillRect(
        this.canvas.width / 2 - 200,
        this.canvas.height / 2 - 100,
        400,
        200
      );

      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 48px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "🎉 VICTORY! 🎉",
        this.canvas.width / 2,
        this.canvas.height / 2 - 30
      );

      this.ctx.font = "bold 24px Arial";
      this.ctx.fillText(
        "You've mastered the magical arts!",
        this.canvas.width / 2,
        this.canvas.height / 2 + 20
      );

      this.ctx.font = "18px Arial";
      this.ctx.fillText(
        "All enemies have been defeated!",
        this.canvas.width / 2,
        this.canvas.height / 2 + 60
      );

      this.ctx.textAlign = "left";
    } else if (gameOver) {
      // Game over message
      this.ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
      this.ctx.fillRect(
        this.canvas.width / 2 - 200,
        this.canvas.height / 2 - 100,
        400,
        200
      );

      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 48px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "💀 GAME OVER 💀",
        this.canvas.width / 2,
        this.canvas.height / 2 - 30
      );

      this.ctx.font = "bold 24px Arial";
      this.ctx.fillText(
        "Your magical journey ends here.",
        this.canvas.width / 2,
        this.canvas.height / 2 + 20
      );

      this.ctx.font = "18px Arial";
      this.ctx.fillText(
        "Speak clearly and cast spells to try again!",
        this.canvas.width / 2,
        this.canvas.height / 2 + 60
      );

      this.ctx.textAlign = "left";
    }
  }

  public drawCurrentEnemy(
    spider: Spider | null,
    troll: Troll | null,
    dementor: Dementor | null
  ): void {
    if (spider) {
      drawSpider(spider, this.ctx);
      // Draw casting bar aligned with health bar
      const barWidth = 525;
      const x = this.canvas.width - barWidth - 50;
      this.drawEnemyCastingBar(spider, x, 85);
    } else if (troll) {
      drawTroll(troll, this.ctx);
      // Draw casting bar aligned with health bar
      const barWidth = 750;
      const x = this.canvas.width - barWidth - 50;
      this.drawEnemyCastingBar(troll, x, 85);
    } else if (dementor) {
      drawDementor(dementor, this.ctx);
      // Draw casting bar aligned with health bar
      const barWidth = 900;
      const x = this.canvas.width - barWidth - 50;
      this.drawEnemyCastingBar(dementor, x, 85);
    }
  }

  public drawHealthBars(
    player: Player,
    spider: Spider | null,
    troll: Troll | null,
    dementor: Dementor | null
  ): void {
    // Player health bar - bottom left, below player
    const playerHealthY = this.canvas.height - 120; // Bottom area, above UI elements
    this.drawCollageHealthBar(player, 50, playerHealthY, "", "left");

    // Player magic bar - above health bar
    const playerMagicY = playerHealthY - 35; // 35px above health bar
    this.drawMagicBar(player, 50, playerMagicY);

    // Enemy health bar - top right (aligned with same 50px margin)
    if (spider) {
      this.drawCollageHealthBar(
        spider,
        this.canvas.width - 250,
        50,
        "",
        "right"
      );
    } else if (troll) {
      this.drawCollageHealthBar(
        troll,
        this.canvas.width - 250,
        50,
        "",
        "right"
      );
    } else if (dementor) {
      this.drawCollageHealthBar(
        dementor,
        this.canvas.width - 250,
        50,
        "",
        "right"
      );
    }
  }
}
