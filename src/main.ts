// Get canvas and context
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (!ctx) {
  throw new Error("Could not get canvas context");
}

// Import voice recognition and UI systems
import { VoiceRecognition } from "./voiceRecognition.js";
import { GameUI } from "./gameUI.js";

// Get control buttons
const startBtn = document.getElementById("startListening") as HTMLButtonElement;
const stopBtn = document.getElementById("stopListening") as HTMLButtonElement;
const resetBtn = document.getElementById("resetGame") as HTMLButtonElement;

// Game character interface
interface Character {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  maxHealth: number;
  currentHealth: number;
  originalX: number;
  originalY: number;
  originalColor: string;
}

// Store original character data
const ORIGINAL_PLAYER = {
  x: 100,
  y: canvas.height / 2 - 75,
  width: 60,
  height: 150,
  color: "#4a90e2",
  maxHealth: 100,
  currentHealth: 100,
};

const ORIGINAL_ENEMY = {
  x: canvas.width - 160,
  y: canvas.height / 2 - 75,
  width: 60,
  height: 150,
  color: "#e74c3c",
  maxHealth: 80,
  currentHealth: 80,
};

// Create player character (left side)
const player: Character = {
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
};

// Create enemy character (right side)
const enemy: Character = {
  x: ORIGINAL_ENEMY.x,
  y: ORIGINAL_ENEMY.y,
  width: ORIGINAL_ENEMY.width,
  height: ORIGINAL_ENEMY.height,
  color: ORIGINAL_ENEMY.color,
  maxHealth: ORIGINAL_ENEMY.maxHealth,
  currentHealth: ORIGINAL_ENEMY.currentHealth,
  originalX: ORIGINAL_ENEMY.x,
  originalY: ORIGINAL_ENEMY.y,
  originalColor: ORIGINAL_ENEMY.color,
};

// Initialize voice recognition and UI systems
const voiceRecognition = new VoiceRecognition();
const gameUI = new GameUI(canvas, ctx);

// Magic activation tracking
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

// Update button states
function updateButtonStates() {
  const isListening = voiceRecognition.isCurrentlyListening();

  startBtn.disabled = isListening;
  stopBtn.disabled = !isListening;

  if (isListening) {
    startBtn.textContent = "🎤 Listening...";
    stopBtn.textContent = "🔇 Stop Listening";
  } else {
    startBtn.textContent = "🎤 Start Listening";
    stopBtn.textContent = "🔇 Not Listening";
  }
}

// Enhanced reset game state
function resetGame() {
  console.log("🔄 Resetting game...");

  // Clear all active spell effects first
  activeTimeouts.forEach((timeout) => clearTimeout(timeout));
  activeTimeouts = [];

  // Reset player to original state
  player.x = ORIGINAL_PLAYER.x;
  player.y = ORIGINAL_PLAYER.y;
  player.width = ORIGINAL_PLAYER.width;
  player.height = ORIGINAL_PLAYER.height;
  player.color = ORIGINAL_PLAYER.color;
  player.currentHealth = ORIGINAL_PLAYER.maxHealth;

  // Reset enemy to original state
  enemy.x = ORIGINAL_ENEMY.x;
  enemy.y = ORIGINAL_ENEMY.y;
  enemy.width = ORIGINAL_ENEMY.width;
  enemy.height = ORIGINAL_ENEMY.height;
  enemy.color = ORIGINAL_ENEMY.color;
  enemy.currentHealth = ORIGINAL_ENEMY.maxHealth;

  // Reset tracking variables
  lastSpellCast = "";
  spellCastCount = 0;

  // Clear UI speech history
  gameUI.setLastSpoken("");
  gameUI.setLastRecognizedSpell("");

  console.log("✅ Game reset complete!");
  console.log(
    `Player reset to: x=${player.x}, y=${player.y}, color=${player.color}, health=${player.currentHealth}`
  );
  console.log(
    `Enemy reset to: x=${enemy.x}, y=${enemy.y}, color=${enemy.color}, health=${enemy.currentHealth}`
  );
}

// Control button event listeners
startBtn.addEventListener("click", async () => {
  console.log("🎤 Start button clicked");

  const hasPermission = await voiceRecognition.requestMicrophonePermission();
  gameUI.setMicrophonePermission(hasPermission);

  if (hasPermission) {
    try {
      await voiceRecognition.startListening();
      console.log("🎤 Magic listening started manually");
    } catch (error) {
      console.error("Failed to start listening:", error);
    }
  }

  updateButtonStates();
});

stopBtn.addEventListener("click", () => {
  console.log("🔇 Stop button clicked");
  voiceRecognition.stopListening();
  updateButtonStates();
});

resetBtn.addEventListener("click", () => {
  console.log("🔄 Reset button clicked");
  resetGame();
});

// Draw character function
function drawCharacter(character: Character) {
  ctx!.fillStyle = character.color;
  ctx!.fillRect(character.x, character.y, character.width, character.height);

  // Add simple face
  ctx!.fillStyle = "#ffffff";
  ctx!.fillRect(character.x + 15, character.y + 20, 10, 10); // left eye
  ctx!.fillRect(character.x + 35, character.y + 20, 10, 10); // right eye
  ctx!.fillRect(character.x + 20, character.y + 40, 20, 5); // mouth
}

// Draw health bar function
function drawHealthBar(
  character: Character,
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

  // Health bar
  ctx!.fillStyle =
    character.currentHealth > character.maxHealth * 0.3 ? "#2ecc71" : "#e74c3c";
  ctx!.fillRect(x, y, barWidth * healthPercentage, barHeight);

  // Border
  ctx!.strokeStyle = "#ffffff";
  ctx!.lineWidth = 2;
  ctx!.strokeRect(x, y, barWidth, barHeight);

  // Label and health text
  ctx!.fillStyle = "#ffffff";
  ctx!.font = "16px Arial";
  ctx!.fillText(label, x, y - 10);
  ctx!.fillText(
    `${character.currentHealth}/${character.maxHealth}`,
    x + barWidth + 10,
    y + 15
  );
}

// Enhanced spell casting with confidence feedback
function castSpell(spellName: string, confidence: number) {
  spellCastCount++;
  lastSpellCast = spellName;

  console.log(
    `✨ Magic activated: ${spellName} (confidence: ${confidence.toFixed(
      2
    )}, cast #${spellCastCount})`
  );

  // Enhanced spell effects with confidence-based power
  const powerMultiplier = Math.min(confidence * 1.5, 1.5); // More confident = more powerful

  switch (spellName) {
    case "wingardium leviosa":
      // Levitate enemy (power affects duration)
      const levitateHeight = Math.floor(20 * powerMultiplier);
      const levitateDuration = Math.floor(1000 * powerMultiplier);
      enemy.y -= levitateHeight;
      createClearableTimeout(() => {
        enemy.y += levitateHeight;
      }, levitateDuration);
      break;
    case "expelliarmus":
      // Knockback enemy (power affects distance)
      const knockbackDistance = Math.floor(30 * powerMultiplier);
      const knockbackDuration = Math.floor(800 * powerMultiplier);
      enemy.x += knockbackDistance;
      createClearableTimeout(() => {
        enemy.x -= knockbackDistance;
      }, knockbackDuration);
      break;
    case "protego":
      // Shield effect (power affects visual intensity)
      console.log(
        `🛡️ Shield activated! (${(confidence * 100).toFixed(0)}% power)`
      );
      // TODO: Add shield visual effect
      break;
    case "lumos":
      // Stun enemy (power affects duration and intensity)
      const originalColor = enemy.color;
      const stunDuration = Math.floor(1500 * powerMultiplier);
      const stunIntensity = Math.floor(255 * confidence);
      enemy.color = `rgb(${stunIntensity}, ${stunIntensity}, 0)`;
      createClearableTimeout(() => {
        enemy.color = originalColor;
      }, stunDuration);
      break;
  }

  // Add magical particle effect (visual feedback)
  createMagicalEffect(spellName, confidence);
}

// Create magical visual effects
function createMagicalEffect(spellName: string, confidence: number) {
  // Simple visual feedback for now
  const effectDuration = Math.floor(500 * confidence);
  const originalPlayerColor = player.color;

  // Player glows when casting
  player.color = "#00ff00";
  createClearableTimeout(() => {
    player.color = originalPlayerColor;
  }, effectDuration);
}

// Voice recognition event handlers with confidence tracking
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
  gameUI.setListening(true);
  console.log("🎤 Magic is now listening for spells...");
  updateButtonStates();
};

voiceRecognition.onListeningStop = () => {
  gameUI.setListening(false);
  console.log("🔇 Magic listening paused");
  updateButtonStates();
};

voiceRecognition.onError = (error: string) => {
  console.error("Voice recognition error:", error);
  if (error.includes("denied")) {
    // Show permission error in UI
    gameUI.setMicrophonePermission(false);
  }
  updateButtonStates();
};

// Auto-start magic listening when microphone is available
async function initializeMagic() {
  console.log("🪄 Initializing Hackwarts magic system...");

  const hasPermission = await voiceRecognition.requestMicrophonePermission();
  gameUI.setMicrophonePermission(hasPermission);

  if (hasPermission) {
    console.log(
      "🎤 Microphone permission granted - starting magic listening..."
    );
    try {
      await voiceRecognition.startListening();
      console.log("✨ Magic is now active! Speak any spell to cast it.");
    } catch (error) {
      console.error("Failed to start magic listening:", error);
    }
  } else {
    console.log(
      "❌ Microphone permission denied - use buttons to enable magic"
    );
  }

  updateButtonStates();
}

// Canvas click handler for manual activation
canvas.addEventListener("click", async (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // If not listening, try to start
  if (!voiceRecognition.isCurrentlyListening()) {
    const hasPermission = await voiceRecognition.requestMicrophonePermission();
    gameUI.setMicrophonePermission(hasPermission);

    if (hasPermission) {
      try {
        await voiceRecognition.startListening();
        console.log("🎤 Magic listening activated by click!");
      } catch (error) {
        console.error("Failed to start magic listening:", error);
      }
    }
  }

  updateButtonStates();
});

// Game loop
function gameLoop() {
  // Clear canvas
  ctx!.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  drawCharacter(player);

  // Draw enemy
  drawCharacter(enemy);

  // Draw health bars
  drawHealthBar(player, 50, 50, "Player");
  drawHealthBar(enemy, canvas.width - 300, 50, "Enemy");

  // Draw UI elements
  gameUI.drawSpellbook();
  gameUI.drawVoiceStatus();
  gameUI.drawInstructions();

  // Draw debug speech display (for testing)
  gameUI.drawDebugSpeechDisplay();

  // Continue the game loop
  requestAnimationFrame(gameLoop);
}

// Start the game
console.log("🪄 Starting Hackwarts: Always Listening Magic Game...");
console.log("✨ Spells will activate whenever you speak them with confidence!");
console.log(
  "🎤 Try saying: 'lumos', 'wingardium leviosa', 'expelliarmus', or 'protego'"
);
console.log("🎛️ Use the control buttons to start/stop listening manually");

// Initialize magic system
initializeMagic();

// Start game loop
gameLoop();
