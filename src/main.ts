// Get canvas and context
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (!ctx) {
  throw new Error("Could not get canvas context");
}

// Import voice recognition and UI systems
import { VoiceRecognition } from "./voiceRecognition.js";
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
} from "./spider.js";

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

// Create player character
const player: Player = {
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
};

// Create single spider enemy (easier difficulty)
let spider: Spider = createSpider(
  0,
  canvas.width - 200,
  canvas.height / 2 - 50
);

// Initialize voice recognition and UI systems
const voiceRecognition = new VoiceRecognition();
const gameUI = new GameUI(canvas, ctx);

// Game state
let gameWon = false;
let gameOver = false;
let lastSpellCast = "";
let spellCastCount = 0;

// Track active spell effects to clear them on reset
let activeTimeouts: NodeJS.Timeout[] = [];

// Helper function to create clearable timeouts
function createClearableTimeout(
  callback: () => void,
  delay: number
): NodeJS.Timeout {
  const timeout = setTimeout(callback, delay);
  activeTimeouts.push(timeout);
  return timeout;
}

// Update player status effects
function updatePlayerStatusEffects() {
  const now = Date.now();

  // Handle poison
  if (player.isPoisoned) {
    if (now >= player.poisonEndTime) {
      player.isPoisoned = false;
      console.log(`🐍 Poison cured!`);
    } else {
      // Apply poison damage once per second
      if (now >= player.lastPoisonTick + 1000) {
        damagePlayer(player, player.poisonDamage, activeTimeouts, () => {
          gameOver = true;
        });
        player.lastPoisonTick = now;
        console.log(`🐍 Poison tick: ${player.poisonDamage} damage dealt`);
      }
    }
  }

  // Handle immobilization
  if (player.isImmobilized && now >= player.immobilizedEndTime) {
    player.isImmobilized = false;
    console.log(`🕸️ Player freed from web!`);
  }

  // Handle protection
  if (player.isProtected && now >= player.protectionEndTime) {
    player.isProtected = false;
    console.log(`🛡️ Protection expired!`);
  }
}

// Enhanced spell casting with spider interactions
function castSpell(spellName: string, confidence: number) {
  spellCastCount++;
  lastSpellCast = spellName;

  console.log(
    `✨ Magic activated: ${spellName} (confidence: ${confidence.toFixed(
      2
    )}, cast #${spellCastCount})`
  );

  // Allow expelliarmus to reset the game when finished
  if ((gameWon || gameOver) && spellName === "expelliarmus") {
    console.log("🔄 Expelliarmus cast - resetting game!");
    resetGame();
    return;
  }

  // Don't cast spells if player is immobilized (except protego)
  if (player.isImmobilized && spellName !== "protego") {
    console.log("🕸️ Cannot cast spell while immobilized!");
    return;
  }

  // Don't cast spells if game is over
  if (gameWon || gameOver) {
    console.log("🎉 Game finished! Say 'expelliarmus' to reset.");
    return;
  }

  // Apply spell to spider
  if (spider.state !== "dead") {
    castSpellOnSpider(spellName, confidence, spider, player, activeTimeouts);
  }

  // Check for victory after spell (spider state might have changed)
  if (spider.state === "dead") {
    gameWon = true;
    console.log("🎉 VICTORY! Spider defeated!");
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
  console.log("🔄 Resetting game...");

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

  // Reset spider
  spider = createSpider(0, canvas.width - 200, canvas.height / 2 - 50);

  // Reset game state
  gameWon = false;
  gameOver = false;
  lastSpellCast = "";
  spellCastCount = 0;

  // Clear UI speech history
  gameUI.setLastSpoken("");
  gameUI.setLastRecognizedSpell("");

  console.log("✅ Game reset complete!");
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

  ctx!.textAlign = "left";
}

// Draw health bar function
function drawHealthBar(
  character: Player | Spider,
  x: number,
  y: number,
  label: string
) {
  const barWidth = 200;
  const barHeight = 20;
  const healthPercentage = character.currentHealth / character.maxHealth;

  // Background bar
  ctx!.fillStyle = "#333333";
  ctx!.fillRect(x, y, barWidth, barHeight);

  // Health bar with color based on health percentage
  let healthColor = "#2ecc71"; // Green
  if (healthPercentage <= 0.3) {
    healthColor = "#e74c3c"; // Red
  } else if (healthPercentage <= 0.6) {
    healthColor = "#f39c12"; // Orange
  }

  ctx!.fillStyle = healthColor;
  ctx!.fillRect(x, y, barWidth * healthPercentage, barHeight);

  // Border
  ctx!.strokeStyle = "#ffffff";
  ctx!.lineWidth = 2;
  ctx!.strokeRect(x, y, barWidth, barHeight);

  // Label and health text
  ctx!.fillStyle = "#ffffff";
  ctx!.font = "16px Arial";
  ctx!.fillText(label, x, y - 10);

  // Show current/max health with color coding
  ctx!.fillStyle = character.currentHealth <= 0 ? "#e74c3c" : "#ffffff";
  ctx!.fillText(
    `${character.currentHealth}/${character.maxHealth}`,
    x + barWidth + 10,
    y + 15
  );
}

// Draw game over/victory messages
function drawGameMessages() {
  const messageX = canvas.width / 2;
  const messageY = canvas.height / 2;

  if (gameWon) {
    // Victory background
    ctx!.fillStyle = "rgba(46, 204, 113, 0.9)";
    ctx!.fillRect(messageX - 200, messageY - 50, 400, 100);

    // Victory border
    ctx!.strokeStyle = "#27ae60";
    ctx!.lineWidth = 3;
    ctx!.strokeRect(messageX - 200, messageY - 50, 400, 100);

    // Victory text
    ctx!.fillStyle = "#ffffff";
    ctx!.font = "bold 32px Arial";
    ctx!.textAlign = "center";
    ctx!.fillText("🎉 VICTORY! 🎉", messageX, messageY - 10);

    ctx!.font = "18px Arial";
    ctx!.fillText(
      "Spider defeated! Say 'expelliarmus' to start again.",
      messageX,
      messageY + 20
    );
    ctx!.textAlign = "left";
  } else if (gameOver) {
    // Game over background
    ctx!.fillStyle = "rgba(231, 76, 60, 0.9)";
    ctx!.fillRect(messageX - 200, messageY - 50, 400, 100);

    // Game over border
    ctx!.strokeStyle = "#c0392b";
    ctx!.lineWidth = 3;
    ctx!.strokeRect(messageX - 200, messageY - 50, 400, 100);

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
  console.log(
    `🎙️ All speech detected: "${transcript}" (confidence: ${confidence.toFixed(
      2
    )})`
  );
};

voiceRecognition.onListeningStart = () => {
  console.log("🎤 Always-listening magic activated!");
};

voiceRecognition.onListeningStop = () => {
  console.log("🔄 Always-listening magic restarting...");
};

voiceRecognition.onError = (error: string) => {
  console.error("Voice recognition error:", error);
  if (error.includes("denied")) {
    gameUI.setMicrophonePermission(false);
  }
};

// Auto-start always-listening magic when page loads
async function initializeAlwaysListeningMagic() {
  console.log("🪄 Initializing always-listening magic system...");

  const hasPermission = await voiceRecognition.requestMicrophonePermission();
  gameUI.setMicrophonePermission(hasPermission);

  if (hasPermission) {
    console.log(
      "🎤 Microphone permission granted - starting always-listening magic..."
    );
    try {
      await voiceRecognition.startListening();
      console.log(
        "✨ Always-listening magic is now active! Speak any spell to cast it."
      );
    } catch (error) {
      console.error("Failed to start always-listening magic:", error);
    }
  } else {
    console.log(
      "❌ Microphone permission denied - always-listening magic disabled"
    );
  }
}

// Canvas click handler for manual activation (fallback)
canvas.addEventListener("click", async (event) => {
  if (!voiceRecognition.isCurrentlyListening()) {
    const hasPermission = await voiceRecognition.requestMicrophonePermission();
    gameUI.setMicrophonePermission(hasPermission);

    if (hasPermission) {
      try {
        await voiceRecognition.startListening();
        console.log("🎤 Always-listening magic activated by click!");
      } catch (error) {
        console.error("Failed to start always-listening magic:", error);
      }
    }
  }
});

// Game loop
function gameLoop() {
  // Clear canvas
  ctx!.clearRect(0, 0, canvas.width, canvas.height);

  // Update game state
  updatePlayerStatusEffects();
  updateSpiderAI(spider, player, activeTimeouts, gameOver, gameWon);

  // Draw game objects
  drawPlayer();
  drawSpider(spider, ctx!);

  // Draw health bars
  drawHealthBar(player, 50, 50, "Player");

  // Draw spider health bar only if alive
  if (spider.state !== "dead") {
    drawHealthBar(spider, canvas.width - 300, 100, "Spider");
  }

  // Draw UI elements
  gameUI.drawSpellbook();
  gameUI.drawInstructions();
  gameUI.drawDebugSpeechDisplay();

  // Draw game messages
  drawGameMessages();

  // Continue the game loop
  requestAnimationFrame(gameLoop);
}

// Start the game
console.log("🪄 Starting Hackwarts: Always-Listening Spider Battle!");
console.log("✨ Speak spells to cast them - no buttons needed!");
console.log(
  "🎤 Available spells: expelliarmus, levicorpus, protego, glacius, incendio, bombarda, depulso"
);
console.log("🕷️ Watch out for spider webs and venom!");
console.log("🔥 Incendio has special effect on spiders!");

// Initialize always-listening magic system
initializeAlwaysListeningMagic();

// Start game loop
gameLoop();
