// Get canvas and context
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (!ctx) {
  throw new Error("Could not get canvas context");
}

// Import voice recognition and UI systems
import { EnhancedVoiceRecognition } from "./voiceRecognition/enhancedVoiceRecognition.js";
import { GameUI } from "./gameUI.js";

// Import spider enemy system
import {
  Spider,
  Player,
  createSpider,
  updateSpiderAI,
  castSpellOnSpider,
  drawSpider,
  damagePlayer,
} from "./enemies/spider.js";

// Import troll enemy system
import {
  Troll,
  createTroll,
  updateTrollAI,
  castSpellOnTroll,
  drawTroll,
} from "./enemies/troll.js";

// Import soul sucker enemy system
import {
  SoulSucker,
  createSoulSucker,
  updateSoulSuckerAI,
  castSpellOnSoulSucker,
  drawSoulSucker,
} from "./enemies/soulsucker.js";

// Store original player data
const ORIGINAL_PLAYER = {
  x: 100,
  y: canvas.height / 2 - 75,
  width: 60,
  height: 150,
  color: "#4a90e2",
  maxHealth: 100,
  currentHealth: 100,
};

// Create player character with silence support
const player: Player & { isSilenced?: boolean; silenceEndTime?: number } = {
  x: ORIGINAL_PLAYER.x,
  y: ORIGINAL_PLAYER.y,
  width: ORIGINAL_PLAYER.width,
  height: ORIGINAL_PLAYER.height,
  color: ORIGINAL_PLAYER.color,
  maxHealth: ORIGINAL_PLAYER.maxHealth,
  currentHealth: ORIGINAL_PLAYER.currentHealth,
  originalX: ORIGINAL_PLAYER.x,
  originalY: ORIGINAL_PLAYER.y,
  originalColor: ORIGINAL_PLAYER.color,
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

// Enemy management - sequential battles
let spider: Spider | null = null;
let troll: Troll | null = null;
let soulSucker: SoulSucker | null = null;
let currentEnemyType: "spider" | "troll" | "soulsucker" | "none" = "spider";

// Initialize current enemy
function initializeCurrentEnemy() {
  if (currentEnemyType === "spider") {
    spider = createSpider(0, canvas.width - 200, canvas.height / 2 - 50);
    troll = null;
    soulSucker = null;
  } else if (currentEnemyType === "troll") {
    spider = null;
    troll = createTroll(1, canvas.width - 200, canvas.height / 2 - 50);
    soulSucker = null;
  } else if (currentEnemyType === "soulsucker") {
    spider = null;
    troll = null;
    soulSucker = createSoulSucker(
      2,
      canvas.width - 200,
      canvas.height / 2 - 50
    );
  } else {
    spider = null;
    troll = null;
    soulSucker = null;
  }
}

// Initialize first enemy
initializeCurrentEnemy();

// Initialize voice recognition and UI systems
const voiceRecognition = new EnhancedVoiceRecognition({
  confidenceThreshold: 0.5, // Even lower threshold for better recognition
  cooldownDuration: 1500, // Shorter cooldown (1.5 seconds)
  restartDebounceMs: 2000, // Restart debouncing
  enableDebugMode: true, // Show debug info
});
const gameUI = new GameUI(canvas, ctx);

// Game state
let gameWon = false;
let gameOver = false;
let spellCastCount = 0;
let lastSpellCast: string | null = null;

// Frame rate control for slower gameplay
const TARGET_FPS = 30; // Reduced from 60fps to 30fps for slower gameplay
const FRAME_TIME = 1000 / TARGET_FPS;
let lastFrameTime = 0;

// Track active spell effects to clear them on reset
let activeTimeouts: NodeJS.Timeout[] = [];

// Skip button for debugging
const skipButton = {
  get x() {
    return canvas.width / 2 - 50;
  }, // Center horizontally
  get y() {
    return canvas.height - 60;
  }, // Bottom with some margin
  width: 100,
  height: 40,
  isHovered: false,
};

// Helper function to create clearable timeouts
function createClearableTimeout(
  callback: () => void,
  delay: number
): NodeJS.Timeout {
  const timeout = setTimeout(callback, delay);
  activeTimeouts.push(timeout);
  return timeout;
}

// Handle enemy defeat and progression
function onEnemyDefeated() {
  if (currentEnemyType === "spider") {
    currentEnemyType = "troll";
    initializeCurrentEnemy();
  } else if (currentEnemyType === "troll") {
    currentEnemyType = "soulsucker";
    initializeCurrentEnemy();
  } else if (currentEnemyType === "soulsucker") {
    currentEnemyType = "none";
    gameWon = true;
  }
}

// Skip current enemy (debug function)
function skipCurrentEnemy() {
  if (isEnemyAlive(spider)) {
    spider!.state = "dead";
    spider!.currentHealth = 0;
    onEnemyDefeated();
  } else if (isEnemyAlive(troll)) {
    troll!.state = "dead";
    troll!.currentHealth = 0;
    troll!.totalDamageReceived = 100;
    onEnemyDefeated();
  } else if (isEnemyAlive(soulSucker)) {
    soulSucker!.state = "dead";
    soulSucker!.currentHealth = 0;
    soulSucker!.totalDamageReceived = 150;
    onEnemyDefeated();
  }
}

// Helper function to check if enemy is alive
function isEnemyAlive(enemy: Spider | Troll | SoulSucker | null): boolean {
  const alive = enemy !== null && enemy.state !== "dead";
  if (enemy && enemy.state === "dead") {
    console.log(`💀 Enemy ${enemy.id} is dead (state: ${enemy.state})`);
  }
  return alive;
}

// Update player status effects
function updatePlayerStatusEffects() {
  const now = Date.now();

  // Handle poison
  if (player.isPoisoned) {
    if (now >= player.poisonEndTime) {
      player.isPoisoned = false;
    } else {
      // Apply poison damage once per second
      if (now >= player.lastPoisonTick + 1000) {
        damagePlayer(player, player.poisonDamage, activeTimeouts, () => {
          gameOver = true;
        });
        player.lastPoisonTick = now;
      }
    }
  }

  // Handle immobilization
  if (player.isImmobilized && now >= player.immobilizedEndTime) {
    player.isImmobilized = false;
  }

  // Handle protection
  if (player.isProtected && now >= player.protectionEndTime) {
    player.isProtected = false;
  }

  // Handle silence
  if (player.isSilenced && now >= player.silenceEndTime!) {
    player.isSilenced = false;
  }
}

// Enhanced spell casting with current enemy
function castSpell(spellName: string, confidence: number) {
  spellCastCount++;
  lastSpellCast = spellName;

  // Check if player is silenced
  if (player.isSilenced) {
    return;
  }

  // Allow expelliarmus to reset the game when finished
  if ((gameWon || gameOver) && spellName === "expelliarmus") {
    resetGame();
    return;
  }

  // Don't cast spells if player is immobilized (except protego)
  if (player.isImmobilized && spellName !== "protego") {
    return;
  }

  // Don't cast spells if game is over
  if (gameWon || gameOver) {
    return;
  }

  // Apply spell to current enemy only
  if (isEnemyAlive(spider)) {
    castSpellOnSpider(spellName, confidence, spider!, player, activeTimeouts);

    // Check if spider was defeated
    if (spider!.state === "dead") {
      onEnemyDefeated();
    }
  } else if (isEnemyAlive(troll)) {
    castSpellOnTroll(spellName, confidence, troll!, player, activeTimeouts);

    // Check if troll was defeated
    if (troll!.state === "dead") {
      onEnemyDefeated();
    }
  } else if (isEnemyAlive(soulSucker)) {
    castSpellOnSoulSucker(
      spellName,
      confidence,
      soulSucker!,
      player,
      activeTimeouts
    );

    // Check if soul sucker was defeated
    if (soulSucker!.state === "dead") {
      onEnemyDefeated();
    }
  }

  // Add magical visual effect
  createMagicalEffect(spellName, confidence);
}

// Create magical visual effects
function createMagicalEffect(spellName: string, confidence: number) {
  const effectDuration = Math.floor(500 * confidence);
  const originalPlayerColor = player.color;

  // Player glows when casting (different colors for different spells)
  let glowColor = "#00ff00"; // Default green
  switch (spellName) {
    case "incendio":
      glowColor = "#ff4400"; // Fire orange
      break;
    case "protego":
      glowColor = "#0088ff"; // Shield blue
      break;
    case "expelliarmus":
      glowColor = "#ffff00"; // Disarm yellow
      break;
    case "glacius":
      glowColor = "#00ffff"; // Ice cyan
      break;
    case "bombarda":
      glowColor = "#ff8800"; // Explosion orange
      break;
    case "depulso":
      glowColor = "#8800ff"; // Force purple
      break;
  }

  player.color = glowColor;
  createClearableTimeout(() => {
    player.color = originalPlayerColor;
  }, effectDuration);
}

// Enhanced reset game state
function resetGame() {
  // Clear all active spell effects first
  activeTimeouts.forEach((timeout) => clearTimeout(timeout));
  activeTimeouts = [];

  // Reset player
  player.x = ORIGINAL_PLAYER.x;
  player.y = ORIGINAL_PLAYER.y;
  player.width = ORIGINAL_PLAYER.width;
  player.height = ORIGINAL_PLAYER.height;
  player.color = ORIGINAL_PLAYER.color;
  player.currentHealth = ORIGINAL_PLAYER.maxHealth;
  player.isImmobilized = false;
  player.isPoisoned = false;
  player.isProtected = false;
  player.protectionEndTime = 0;
  player.poisonDamage = 0;
  player.poisonEndTime = 0;
  player.immobilizedEndTime = 0;
  player.lastPoisonTick = 0;
  player.isSilenced = false;
  player.silenceEndTime = 0;

  // Reset to first enemy (Spider)
  currentEnemyType = "spider";
  initializeCurrentEnemy();

  // Reset game state
  gameWon = false;
  gameOver = false;
  spellCastCount = 0;
  lastSpellCast = null;

  // Clear UI speech history
  gameUI.setLastSpoken("");
  gameUI.setLastRecognizedSpell("");
}

// Draw player function
function drawPlayer() {
  // Main body
  ctx!.fillStyle = player.color;
  ctx!.fillRect(player.x, player.y, player.width, player.height);

  // Simple face
  ctx!.fillStyle = "#ffffff";
  ctx!.fillRect(player.x + 15, player.y + 20, 10, 10); // left eye
  ctx!.fillRect(player.x + 35, player.y + 20, 10, 10); // right eye
  ctx!.fillRect(player.x + 20, player.y + 40, 20, 5); // mouth

  // Status effect indicators above player
  if (player.isImmobilized) {
    ctx!.fillStyle = "#654321";
    ctx!.font = "20px Arial";
    ctx!.fillText("🕸️", player.x + player.width / 2 - 10, player.y - 5);
  }

  if (player.isPoisoned) {
    ctx!.fillStyle = "#800080";
    ctx!.font = "20px Arial";
    ctx!.fillText("🐍", player.x + player.width + 5, player.y + 20);
  }

  if (player.isProtected) {
    ctx!.fillStyle = "#0088ff";
    ctx!.font = "20px Arial";
    ctx!.fillText("🛡️", player.x - 25, player.y + 20);
  }

  // Status text below player
  const now = Date.now();
  let statusTextY = player.y + player.height + 20;

  ctx!.textAlign = "center";

  // Show web trap status
  if (player.isImmobilized) {
    const timeLeft = Math.max(
      0,
      Math.ceil((player.immobilizedEndTime - now) / 1000)
    );
    ctx!.fillStyle = "#8B4513";
    ctx!.font = "12px Arial";
    ctx!.fillText(
      `Entangled (${timeLeft}s)`,
      player.x + player.width / 2,
      statusTextY
    );
    statusTextY += 15;
  }

  // Show poison countdown
  if (player.isPoisoned) {
    const timeLeft = Math.max(
      0,
      Math.ceil((player.poisonEndTime - now) / 1000)
    );
    const nextTick = Math.max(
      0,
      Math.ceil((player.lastPoisonTick + 1000 - now) / 1000)
    );
    ctx!.fillStyle = "#8B008B";
    ctx!.font = "12px Arial";
    ctx!.fillText(
      `Poisoned (${timeLeft}s) - Next: ${nextTick}s`,
      player.x + player.width / 2,
      statusTextY
    );

    // Small progress bar for poison countdown
    const barWidth = 60;
    const barHeight = 3;
    const barX = player.x + player.width / 2 - barWidth / 2;
    const barY = statusTextY + 3;
    const progress = Math.max(0, (player.lastPoisonTick + 1000 - now) / 1000);

    ctx!.fillStyle = "#333333";
    ctx!.fillRect(barX, barY, barWidth, barHeight);
    ctx!.fillStyle = "#FF6600";
    ctx!.fillRect(barX, barY, barWidth * progress, barHeight);

    statusTextY += 20;
  }

  // Show protection status
  if (player.isProtected) {
    const timeLeft = Math.max(
      0,
      Math.ceil((player.protectionEndTime - now) / 1000)
    );
    ctx!.fillStyle = "#4169E1";
    ctx!.font = "12px Arial";
    ctx!.fillText(
      `Protected (${timeLeft}s)`,
      player.x + player.width / 2,
      statusTextY
    );
    statusTextY += 15;
  }

  // Show silence status
  if (player.isSilenced) {
    const timeLeft = Math.max(
      0,
      Math.ceil((player.silenceEndTime! - now) / 1000)
    );
    ctx!.fillStyle = "#000000"; // Black for silence
    ctx!.font = "12px Arial";
    ctx!.fillText(
      `Silenced (${timeLeft}s)`,
      player.x + player.width / 2,
      statusTextY
    );
    statusTextY += 15;
  }

  ctx!.textAlign = "left";
}

// Draw a collage-style, jagged HP bar above the character
function drawCollageHealthBar(
  character: Player | Spider | Troll | SoulSucker,
  x: number,
  y: number,
  label: string,
  align: "left" | "right" = "left",
  customWidth?: number
) {
  const barWidth = customWidth || 280; // Use custom width or default to 280
  const barHeight = 32;
  const healthPercentage = character.currentHealth / character.maxHealth;

  // Jagged torn-paper effect: create a path with random vertical offsets
  const jaggedness = 6;
  const points = 8;
  const step = barWidth / (points - 1);
  const topOffsets = Array.from(
    { length: points },
    () => Math.random() * jaggedness - jaggedness / 2
  );
  const bottomOffsets = Array.from(
    { length: points },
    () => Math.random() * jaggedness - jaggedness / 2
  );

  ctx!.save();
  ctx!.beginPath();
  // Top edge
  for (let i = 0; i < points; i++) {
    const px = x + i * step;
    const py = y + topOffsets[i];
    if (i === 0) ctx!.moveTo(px, py);
    else ctx!.lineTo(px, py);
  }
  // Right edge
  ctx!.lineTo(x + barWidth, y + barHeight + bottomOffsets[points - 1]);
  // Bottom edge (jagged)
  for (let i = points - 1; i >= 0; i--) {
    const px = x + i * step;
    const py = y + barHeight + bottomOffsets[i];
    ctx!.lineTo(px, py);
  }
  // Left edge
  ctx!.closePath();

  // Paper shadow
  ctx!.shadowColor = "rgba(0,0,0,0.15)";
  ctx!.shadowBlur = 8;
  ctx!.fillStyle = "#fdf6e3"; // Paper color
  ctx!.fill();
  ctx!.shadowBlur = 0;

  // HP fill (clip to jagged path)
  ctx!.save();
  ctx!.clip();
  ctx!.fillStyle = healthPercentage > 0.3 ? "#e74c3c" : "#b71c1c";
  ctx!.fillRect(x, y, barWidth * healthPercentage, barHeight + jaggedness);
  ctx!.restore();

  // White torn-paper border
  ctx!.lineWidth = 3;
  ctx!.strokeStyle = "#fff";
  ctx!.stroke();

  // Label and health text
  ctx!.fillStyle = "#333";
  ctx!.font = "bold 18px Arial";
  ctx!.textAlign = align === "left" ? "left" : "right";
  ctx!.fillText(label, align === "left" ? x : x + barWidth, y - 10);

  ctx!.font = "16px Arial";
  ctx!.fillStyle = "#444";
  ctx!.textAlign = "center";
  ctx!.fillText(
    `${character.currentHealth}/${character.maxHealth}`,
    x + barWidth / 2,
    y + barHeight / 2 + 7
  );
  ctx!.restore();
}

// Draw skip button
function drawSkipButton() {
  // Button background
  ctx!.fillStyle = skipButton.isHovered ? "#ff6666" : "#ff4444";
  ctx!.fillRect(
    skipButton.x,
    skipButton.y,
    skipButton.width,
    skipButton.height
  );

  // Button border
  ctx!.strokeStyle = "#ffffff";
  ctx!.lineWidth = 2;
  ctx!.strokeRect(
    skipButton.x,
    skipButton.y,
    skipButton.width,
    skipButton.height
  );

  // Button text
  ctx!.fillStyle = "#ffffff";
  ctx!.font = "14px Arial";
  ctx!.textAlign = "center";
  ctx!.fillText(
    "⏭️ Skip",
    skipButton.x + skipButton.width / 2,
    skipButton.y + 25
  );
  ctx!.textAlign = "left";
}

// Check if point is inside skip button
function isPointInSkipButton(x: number, y: number): boolean {
  return (
    x >= skipButton.x &&
    x <= skipButton.x + skipButton.width &&
    y >= skipButton.y &&
    y <= skipButton.y + skipButton.height
  );
}

// Draw game over/victory messages
function drawGameMessages() {
  const messageX = canvas.width / 2;
  const messageY = canvas.height / 2;

  if (gameWon) {
    // Victory background
    ctx!.fillStyle = "rgba(46, 204, 113, 0.9)";
    ctx!.fillRect(messageX - 250, messageY - 50, 500, 100);

    // Victory border
    ctx!.strokeStyle = "#27ae60";
    ctx!.lineWidth = 3;
    ctx!.strokeRect(messageX - 250, messageY - 50, 500, 100);

    // Victory text
    ctx!.fillStyle = "#ffffff";
    ctx!.font = "bold 32px Arial";
    ctx!.textAlign = "center";
    ctx!.fillText("🎉 VICTORY! 🎉", messageX, messageY - 10);

    ctx!.font = "18px Arial";
    ctx!.fillText(
      "All enemies defeated! Say 'expelliarmus' to start again.",
      messageX,
      messageY + 20
    );
    ctx!.textAlign = "left";
  } else if (gameOver) {
    // Game over background
    ctx!.fillStyle = "rgba(231, 76, 60, 0.9)";
    ctx!.fillRect(messageX - 250, messageY - 50, 500, 100);

    // Game over border
    ctx!.strokeStyle = "#c0392b";
    ctx!.lineWidth = 3;
    ctx!.strokeRect(messageX - 250, messageY - 50, 500, 100);

    // Game over text
    ctx!.fillStyle = "#ffffff";
    ctx!.font = "bold 32px Arial";
    ctx!.textAlign = "center";
    ctx!.fillText("💀 GAME OVER 💀", messageX, messageY - 10);

    ctx!.font = "18px Arial";
    ctx!.fillText(
      "You were defeated! Say 'expelliarmus' to try again.",
      messageX,
      messageY + 20
    );
    ctx!.textAlign = "left";
  }
}

// Draw spider decoration when spider is active
function drawSpiderDecoration() {
  if (!spiderOverlay) return;

  // Only show spider decoration when spider enemy is active
  if (currentEnemyType === "spider" && isEnemyAlive(spider)) {
    // Show spider decoration overlay and start animation
    spiderOverlay.style.display = "block";
    if (!spiderOverlayAnimation) {
      // Start animation loop - move every 1.5 seconds
      spiderOverlayAnimation = setInterval(animateSpiderOverlay, 1500);
      // Initial animation
      animateSpiderOverlay();
    }
  } else {
    // Hide spider decoration overlay and stop animation
    spiderOverlay.style.display = "none";
    if (spiderOverlayAnimation) {
      clearInterval(spiderOverlayAnimation);
      spiderOverlayAnimation = null;
    }
  }
}

// Voice recognition event handlers
voiceRecognition.onSpellRecognized = (spell: string, confidence: number) => {
  gameUI.setLastRecognizedSpell(spell);
  castSpell(spell, confidence);
};

voiceRecognition.onSpeechDetected = (
  transcript: string,
  confidence: number
) => {
  gameUI.setLastSpoken(transcript);
};

voiceRecognition.onListeningStart = () => {};

voiceRecognition.onListeningStop = () => {};

voiceRecognition.onError = (error: string) => {
  console.error("Voice recognition error:", error);
  if (error.includes("denied")) {
    gameUI.setMicrophonePermission(false);
  }
};

// Auto-start always-listening magic when page loads
async function initializeAlwaysListeningMagic() {
  const hasPermission = await voiceRecognition.requestMicrophonePermission();
  gameUI.setMicrophonePermission(hasPermission);

  if (hasPermission) {
    try {
      await voiceRecognition.startListening();
    } catch (error) {
      console.error("Failed to start always-listening magic:", error);
    }
  }
}

// Initialize always-listening magic system
initializeAlwaysListeningMagic();

// Load spider decoration
let spiderDecorationImage: HTMLImageElement | null = null;
let spiderDecorationLoaded = false;
let spiderOverlay: HTMLDivElement | null = null;
let spiderOverlayAnimation: NodeJS.Timeout | null = null;

function loadSpiderDecoration() {
  if (spiderDecorationImage) return; // Already loaded

  spiderDecorationImage = new Image();
  spiderDecorationImage.onload = () => {
    spiderDecorationLoaded = true;
    console.log("🕷️ Spider decoration loaded!");
  };
  spiderDecorationImage.onerror = () => {
    console.error("❌ Failed to load spider decoration");
  };
  spiderDecorationImage.src = "assets/background/spider_decor.svg";

  // Create overlay element
  spiderOverlay = document.createElement("div");
  spiderOverlay.style.position = "fixed";
  spiderOverlay.style.top = "0";
  spiderOverlay.style.left = "0";
  spiderOverlay.style.width = "100%";
  spiderOverlay.style.height = "100%";
  spiderOverlay.style.backgroundImage =
    "url('assets/background/spider_decor.svg')";
  spiderOverlay.style.backgroundSize = "cover";
  spiderOverlay.style.backgroundPosition = "center";
  spiderOverlay.style.pointerEvents = "none"; // Don't interfere with clicks
  spiderOverlay.style.zIndex = "-1"; // Behind background, below canvas
  spiderOverlay.style.display = "none"; // Hidden by default
  spiderOverlay.style.transition = "transform 0.5s ease-in-out"; // Smooth movement
  document.body.appendChild(spiderOverlay);
}

// Animate spider overlay with subtle movement
function animateSpiderOverlay() {
  if (!spiderOverlay || spiderOverlay.style.display === "none") return;

  // Generate random offsets for subtle movement
  const offsetX = (Math.random() - 0.5) * 20; // -10 to +10 pixels
  const offsetY = (Math.random() - 0.5) * 15; // -7.5 to +7.5 pixels
  const rotation = (Math.random() - 0.5) * 2; // -1 to +1 degrees

  spiderOverlay.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`;
}

loadSpiderDecoration();

// Canvas click handler for skip button and manual activation (fallback)
canvas.addEventListener("click", async (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  // Check if skip button was clicked
  if (isPointInSkipButton(x, y)) {
    skipCurrentEnemy();
    return;
  } else {
    // Original click handler for voice activation
    if (!voiceRecognition.isCurrentlyListening()) {
      const hasPermission =
        await voiceRecognition.requestMicrophonePermission();
      gameUI.setMicrophonePermission(hasPermission);

      if (hasPermission) {
        try {
          await voiceRecognition.startListening();
        } catch (error) {
          console.error("Failed to start always-listening magic:", error);
        }
      }
    }
  }
});

// Canvas mouse move handler for skip button hover
canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  skipButton.isHovered = isPointInSkipButton(x, y);
  canvas.style.cursor = skipButton.isHovered ? "pointer" : "default";
});

// Game loop
function gameLoop(currentTime: number) {
  // Frame rate limiting for slower gameplay
  if (currentTime - lastFrameTime < FRAME_TIME) {
    requestAnimationFrame(gameLoop);
    return;
  }
  lastFrameTime = currentTime;

  // Clear canvas with transparency
  ctx!.clearRect(0, 0, canvas.width, canvas.height);

  // Update game state
  updatePlayerStatusEffects();

  // Update current enemy AI
  if (isEnemyAlive(spider)) {
    updateSpiderAI(spider!, player, activeTimeouts, gameOver, gameWon);
  } else if (isEnemyAlive(troll)) {
    updateTrollAI(troll!, player, activeTimeouts, gameOver, gameWon, () => {
      gameOver = true;
    });
  } else if (isEnemyAlive(soulSucker)) {
    updateSoulSuckerAI(
      soulSucker!,
      player,
      activeTimeouts,
      gameOver,
      gameWon,
      () => {
        gameOver = true;
      }
    );
  }

  // Check for automatic enemy progression
  if (currentEnemyType === "spider" && !isEnemyAlive(spider)) {
    console.log("🕷️ Spider defeated, progressing to troll");
    onEnemyDefeated();
  } else if (currentEnemyType === "troll" && !isEnemyAlive(troll)) {
    console.log("🪨 Troll defeated, progressing to soul sucker");
    onEnemyDefeated();
  } else if (currentEnemyType === "soulsucker" && !isEnemyAlive(soulSucker)) {
    console.log("👻 Soul Sucker defeated, game won!");
    onEnemyDefeated();
  }

  // Draw game objects
  drawPlayer();

  // Draw current enemy
  if (isEnemyAlive(spider)) {
    drawSpider(spider!, ctx!);
  } else if (isEnemyAlive(troll)) {
    drawTroll(troll!, ctx!);
  } else if (isEnemyAlive(soulSucker)) {
    drawSoulSucker(soulSucker!, ctx!);
  }

  // Update spider decoration based on current enemy
  drawSpiderDecoration();

  // Draw health bars
  // Player HP bar (top left) - 280px width
  drawCollageHealthBar(player, 40, 30, "Player", "left", 280);
  // Enemy HP bar (top right) - proportional to max health
  if (isEnemyAlive(spider)) {
    // Spider: 40 HP = 280px bar (same as player)
    drawCollageHealthBar(
      spider!,
      canvas.width - 320,
      30,
      "Spider",
      "right",
      280
    );
  } else if (isEnemyAlive(troll)) {
    // Troll: 100 HP = 400px bar (longer for more HP)
    drawCollageHealthBar(troll!, canvas.width - 440, 30, "Troll", "right", 400);
  } else if (isEnemyAlive(soulSucker)) {
    // Soul Sucker: 150 HP = 500px bar (longest for most HP)
    drawCollageHealthBar(
      soulSucker!,
      canvas.width - 560,
      30,
      "Soul Sucker",
      "right",
      500
    );
  }

  // Draw UI elements
  gameUI.drawSpellbook();
  gameUI.drawInstructions();
  gameUI.drawDebugSpeechDisplay();

  // Draw game messages
  drawGameMessages();

  // Draw skip button
  drawSkipButton();

  // Continue the game loop
  requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop(0); // Pass a dummy value for currentTime
