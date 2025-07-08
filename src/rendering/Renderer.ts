// Centralized Rendering System for Hackwarts
import { Player } from "../entities/Player.js";
import { Spider, drawSpider } from "../entities/enemies/Spider.js";
import { Troll, drawTroll } from "../entities/enemies/Troll.js";
import { Dementor, drawDementor } from "../entities/enemies/Dementor.js";

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // Spider web overlay system
  private spiderWebElements: HTMLImageElement[] = [];
  private isShowingWebsForImmobilization: boolean = false;

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
    this.initializeAnimatedBackgrounds();
    this.initializeSpiderName();
    this.initializeTrollName();
    this.initializeDementorName();
  }

  private initializeSpiderWebOverlays(): void {
    for (let i = 1; i <= 6; i++) {
      const webElement = new Image();
      webElement.src = `/assets/visual_effect/spider_${i}.svg`;
      webElement.style.position = "absolute";
      webElement.style.top = "0";
      webElement.style.left = "0";
      webElement.style.width = "100%";
      webElement.style.height = "100%";
      webElement.style.pointerEvents = "none";
      webElement.style.display = "none";

      // Set z-index: 1-3 below canvas (-1), 4-6 above canvas (1)
      webElement.style.zIndex = i <= 3 ? "-1" : "1";

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
    // If spider is dead or null, always hide webs immediately
    if (!spider || spider.state === "dead") {
      if (this.isShowingWebsForImmobilization) {
        this.hideSpiderWebOverlays();
        this.isShowingWebsForImmobilization = false;
      }
      return;
    }

    // Spider is alive, check if it's casting web
    if (spider.state === "casting" && spider.currentSkill === "web") {
      const now = Date.now();
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
      // Player is not trapped by spider web - hide webs
      if (this.isShowingWebsForImmobilization) {
        this.hideSpiderWebOverlays();
        this.isShowingWebsForImmobilization = false;
      }
    }
  }

  public onSpiderWebCastComplete(success: boolean): void {
    if (success) {
      // Show all webs and let updateSpiderWebOverlays handle keeping them visible while player is trapped
      this.showAllSpiderWebs();
      this.isShowingWebsForImmobilization = true;
    } else {
      // Hide immediately if cast failed or was canceled
      this.hideSpiderWebOverlays();
      this.isShowingWebsForImmobilization = false;
    }
  }

  private showAllSpiderWebs(): void {
    for (const webElement of this.spiderWebElements) {
      if (!document.body.contains(webElement)) {
        document.body.appendChild(webElement);
      }
      webElement.style.display = "block";
    }
  }

  public hideSpiderWebOverlays(): void {
    for (const webElement of this.spiderWebElements) {
      webElement.style.display = "none";
    }
    this.isShowingWebsForImmobilization = false;
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

    // Apply blinking animation to the eye
    if (this.eyeElement) {
      const blinkSpeed = 500; // Blink every 500ms
      const isBlinkCycle = Math.floor(elapsedTime / blinkSpeed) % 2 === 0;
      this.eyeElement.style.display = isBlinkCycle ? "block" : "none";
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

    // Add eye element to DOM
    if (this.eyeElement && !document.body.contains(this.eyeElement)) {
      document.body.appendChild(this.eyeElement);
    }
  }

  public hideStoneThrowingOverlay(): void {
    for (const stoneElement of this.stoneElements) {
      stoneElement.style.display = "none";
      stoneElement.style.transform = "translate(0px, 0px)"; // Reset transform
    }

    // Hide eye element
    if (this.eyeElement) {
      this.eyeElement.style.display = "none";
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

    // Apply breathing animation to y position (up and down movement)
    const originalY = player.y;
    player.y = player.originalY + breathingOffset;

    // Create player image if it doesn't exist
    if (!(window as any).playerImage) {
      (window as any).playerImage = new Image();
      (window as any).playerImage.src = "/assets/player.png";
    }

    const playerImage = (window as any).playerImage;

    // Draw the player image with proper aspect ratio
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

      // Center the image within the target area
      const offsetX = player.x + (targetWidth - drawWidth) / 2;
      const offsetY = player.y + (targetHeight - drawHeight) / 2;

      this.ctx.drawImage(playerImage, offsetX, offsetY, drawWidth, drawHeight);
    } else {
      // Fallback to original drawing if image not loaded
      // Main body
      this.ctx.fillStyle = player.color;
      this.ctx.fillRect(player.x, player.y, player.width, player.height);

      // Simple head
      this.ctx.fillStyle = "#fdbcb4";
      this.ctx.fillRect(player.x + 10, player.y - 20, 40, 30);

      // Eyes
      this.ctx.fillStyle = "#000000";
      this.ctx.fillRect(player.x + 18, player.y - 12, 4, 4);
      this.ctx.fillRect(player.x + 38, player.y - 12, 4, 4);

      // Mouth
      this.ctx.fillRect(player.x + 25, player.y - 5, 10, 2);

      // Arms
      this.ctx.fillStyle = player.color;
      this.ctx.fillRect(player.x - 20, player.y + 40, 20, 40);
      this.ctx.fillRect(player.x + player.width, player.y + 40, 20, 40);

      // Legs
      this.ctx.fillRect(player.x + 10, player.y + player.height, 20, 40);
      this.ctx.fillRect(player.x + 30, player.y + player.height, 20, 40);

      // Wand
      this.ctx.fillStyle = "#8B4513";
      this.ctx.fillRect(player.x + player.width + 20, player.y + 50, 2, 20);

      // Wand tip
      this.ctx.fillStyle = "#FFD700";
      this.ctx.fillRect(player.x + player.width + 19, player.y + 48, 4, 4);
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
    player: Player,
    spider: Spider | null,
    troll: Troll | null,
    dementor: Dementor | null
  ): void {
    // Player status effects (below player health bar at bottom)
    const playerStatusX = 50;
    const playerHealthY = this.canvas.height - 120;
    const playerStatusY = playerHealthY + 25 + 10; // health bar y + height + spacing
    let currentY = playerStatusY;

    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 14px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText("Player Status:", playerStatusX, currentY);
    currentY += 20;

    let hasPlayerStatus = false;

    if (player.isImmobilized && Date.now() < player.immobilizedEndTime) {
      const remaining = Math.ceil(
        (player.immobilizedEndTime - Date.now()) / 1000
      );
      this.ctx.fillStyle = "#ff6600";
      this.ctx.font = "12px Arial";
      this.ctx.fillText(
        `🕸️ Immobilized (${remaining}s)`,
        playerStatusX,
        currentY
      );
      currentY += 16;
      hasPlayerStatus = true;
    }

    if (player.isPoisoned && Date.now() < player.poisonEndTime) {
      const remaining = Math.ceil((player.poisonEndTime - Date.now()) / 1000);
      this.ctx.fillStyle = "#00ff00";
      this.ctx.font = "12px Arial";
      this.ctx.fillText(`🐍 Poisoned (${remaining}s)`, playerStatusX, currentY);
      currentY += 16;
      hasPlayerStatus = true;
    }

    if (player.isProtected && Date.now() < player.protectionEndTime) {
      const remaining = Math.ceil(
        (player.protectionEndTime - Date.now()) / 1000
      );
      this.ctx.fillStyle = "#4a90e2";
      this.ctx.font = "12px Arial";
      this.ctx.fillText(
        `🛡️ Protected (${remaining}s)`,
        playerStatusX,
        currentY
      );
      currentY += 16;
      hasPlayerStatus = true;
    }

    if (player.isSilenced && Date.now() < (player.silenceEndTime || 0)) {
      const remaining = Math.ceil(
        ((player.silenceEndTime || 0) - Date.now()) / 1000
      );
      this.ctx.fillStyle = "#8A2BE2";
      this.ctx.font = "12px Arial";
      this.ctx.fillText(`🔇 Silenced (${remaining}s)`, playerStatusX, currentY);
      currentY += 16;
      hasPlayerStatus = true;
    }

    if (!hasPlayerStatus) {
      this.ctx.fillStyle = "#cccccc";
      this.ctx.font = "12px Arial";
      this.ctx.fillText("Normal", playerStatusX, currentY);
    }

    // Enemy status effects (below enemy health bar)
    const enemy = spider || troll || dementor;
    if (enemy) {
      const enemyStatusX = this.canvas.width - 250;
      const enemyStatusY = 50 + 25 + 10; // health bar y + new height + spacing
      let enemyY = enemyStatusY;

      let hasEnemyStatus = false;

      if (enemy.state === "stunned" && Date.now() < enemy.stunEndTime) {
        const remaining = Math.ceil((enemy.stunEndTime - Date.now()) / 1000);
        this.ctx.fillStyle = "#ffff00";
        this.ctx.font = "12px Arial";
        this.ctx.fillText(`💫 Stunned (${remaining}s)`, enemyStatusX, enemyY);
        enemyY += 16;
        hasEnemyStatus = true;
      }

      if (enemy.state === "levitating" && Date.now() < enemy.levitateEndTime) {
        const remaining = Math.ceil(
          (enemy.levitateEndTime - Date.now()) / 1000
        );
        this.ctx.fillStyle = "#00ffff";
        this.ctx.font = "12px Arial";
        this.ctx.fillText(
          `🪶 Levitating (${remaining}s)`,
          enemyStatusX,
          enemyY
        );
        enemyY += 16;
        hasEnemyStatus = true;
      }

      // Spider-specific status
      if (spider && spider.isOnFire && Date.now() < spider.fireEndTime) {
        const remaining = Math.ceil((spider.fireEndTime - Date.now()) / 1000);
        this.ctx.fillStyle = "#ff6600";
        this.ctx.font = "12px Arial";
        this.ctx.fillText(`🔥 On Fire (${remaining}s)`, enemyStatusX, enemyY);
        enemyY += 16;
        hasEnemyStatus = true;
      }

      // Troll-specific status
      if (
        troll &&
        troll.hasChunkArmor &&
        Date.now() < troll.chunkArmorEndTime
      ) {
        const remaining = Math.ceil(
          (troll.chunkArmorEndTime - Date.now()) / 1000
        );
        this.ctx.fillStyle = "#8B4513";
        this.ctx.font = "12px Arial";
        this.ctx.fillText(
          `🛡️ Chunk Armor (${remaining}s)`,
          enemyStatusX,
          enemyY
        );
        enemyY += 16;
        hasEnemyStatus = true;
      }

      // Dementor-specific status
      if (dementor && dementor.state === "shadowphase") {
        this.ctx.fillStyle = "#8A2BE2";
        this.ctx.font = "12px Arial";
        this.ctx.fillText(`🌑 Shadow Phase`, enemyStatusX, enemyY);
        enemyY += 16;
        hasEnemyStatus = true;
      }

      if (!hasEnemyStatus) {
        this.ctx.fillStyle = "#cccccc";
        this.ctx.font = "12px Arial";
        this.ctx.fillText("Normal", enemyStatusX, enemyY);
      }
    }

    this.ctx.textAlign = "left";
  }

  public drawSkipButton(skipButton: {
    x: number;
    y: number;
    width: number;
    height: number;
    isHovered: boolean;
  }): void {
    // Skip button background
    this.ctx.fillStyle = skipButton.isHovered ? "#ff6b6b" : "#ff8c8c";
    this.ctx.fillRect(
      skipButton.x,
      skipButton.y,
      skipButton.width,
      skipButton.height
    );

    // Skip button border
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      skipButton.x,
      skipButton.y,
      skipButton.width,
      skipButton.height
    );

    // Skip button text
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 14px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "Skip",
      skipButton.x + skipButton.width / 2,
      skipButton.y + skipButton.height / 2 + 5
    );
    this.ctx.textAlign = "left";
  }

  public drawGameMessages(
    gameWon: boolean,
    gameOver: boolean,
    lastSpellCast: string | null
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
    } else {
      // Last spell cast display
      if (lastSpellCast) {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "16px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText(
          `Last Spell: ${lastSpellCast.toUpperCase()}`,
          this.canvas.width / 2,
          this.canvas.height - 40
        );
        this.ctx.textAlign = "left";
      }
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
