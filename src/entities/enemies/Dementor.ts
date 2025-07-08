// Dementor Enemy System for Hackwarts - Refactored
import {
  BaseEnemyState,
  createBaseEnemy,
  handleStunEffect,
  applyDamageVisualFeedback,
  drawDeadEnemy,
} from "../BaseEnemy.js";
import { Player, damagePlayer, protectPlayer } from "../Player.js";

// Dementor-specific interface extending base enemy
export interface Dementor extends BaseEnemyState {
  type: "dementor";
  totalDamageReceived: number; // For defeat condition (150 HP total damage)
  shadowPhaseEndTime: number;
}

// Dementor creation and management
export function createDementor(id: number, x: number, y: number): Dementor {
  const baseEnemy = createBaseEnemy(id, x, y, 600, 840, "#2c1810", 150);
  return {
    ...baseEnemy,
    type: "dementor",
    totalDamageReceived: 0,
    shadowPhaseEndTime: 0,
  };
}

// Dementor damage function
export function damageDementor(
  dementor: Dementor,
  damage: number,
  activeTimeouts: NodeJS.Timeout[],
  onVictory: () => void
) {
  // Only take damage when stunned
  if (dementor.state === "stunned") {
    dementor.totalDamageReceived += damage;
    dementor.currentHealth = Math.max(0, dementor.currentHealth - damage);

    console.log(
      `💀 Dementor ${dementor.id} took ${damage} damage. Health: ${dementor.currentHealth}/${dementor.maxHealth}, Total damage: ${dementor.totalDamageReceived}`
    );

    // Defeat condition: 150 HP total damage when stunned OR current health reaches 0
    if (dementor.totalDamageReceived >= 150 || dementor.currentHealth <= 0) {
      console.log(
        `💀 Dementor ${dementor.id} DEFEATED! State: ${dementor.state} -> dead`
      );
      dementor.state = "dead";
      onVictory();
    }

    // Visual damage feedback using base function
    applyDamageVisualFeedback(dementor, activeTimeouts);
  } else {
    console.log(`💀 Dementor ${dementor.id} dodged damage (not stunned)!`);
  }
}

// Dementor heal function
export function healDementor(dementor: Dementor, amount: number) {
  dementor.currentHealth = Math.min(
    dementor.maxHealth,
    dementor.currentHealth + amount
  );
  console.log(`💚 Dementor ${dementor.id} healed for ${amount} HP!`);
}

// Shadow Phase function
export function triggerShadowPhase(dementor: Dementor) {
  if (dementor.state === "stunned") return; // Cannot dodge when stunned

  dementor.state = "shadowphase";
  dementor.shadowPhaseEndTime = Date.now() + 1000; // 1 second in shadow phase
  console.log(`🌑 Dementor ${dementor.id} entered shadow phase!`);
}

// Player silencing function
export function silencePlayer(player: any, duration: number) {
  player.isSilenced = true;
  player.silenceEndTime = Date.now() + duration;
  console.log(`🔇 Player silenced for ${duration / 1000}s!`);
}

// Dementor AI functions
export function updateDementorAI(
  dementor: Dementor,
  player: Player,
  activeTimeouts: NodeJS.Timeout[],
  gameOver: boolean,
  gameWon: boolean,
  onGameOver: () => void
) {
  if (dementor.state === "dead" || gameOver || gameWon) return;

  const now = Date.now();

  // Add subtle breathing animation (gentle movement)
  const breathingSpeed = 0.002; // Slow breathing
  const breathingAmplitude = 3; // Small movement range (3 pixels)
  const breathingOffset = Math.sin(now * breathingSpeed) * breathingAmplitude;

  // Apply breathing animation to y position (up and down movement)
  dementor.y = dementor.originalY + breathingOffset;

  // Handle status effects using base function
  handleStunEffect(dementor, now);

  // Handle shadow phase
  if (dementor.state === "shadowphase" && now >= dementor.shadowPhaseEndTime) {
    dementor.state = "idle";
  }

  // Handle skill casting
  if (dementor.state === "casting") {
    if (now >= dementor.skillCastStartTime + dementor.skillCastDuration) {
      // Execute the skill
      executeDementorSkill(
        dementor,
        player,
        activeTimeouts,
        onGameOver,
        gameOver,
        gameWon
      );
      dementor.state = "idle";
      dementor.nextSkillTime = now + Math.random() * 4000 + 3000; // 3-7 seconds
    }
    return;
  }

  // Try to cast skills
  if (dementor.state === "idle" && now >= dementor.nextSkillTime) {
    // Choose skill randomly
    const skills = ["souldrain", "silenceshriek"];
    const randomSkill = skills[Math.floor(Math.random() * skills.length)];
    castDementorSkill(dementor, randomSkill);
  }
}

function castDementorSkill(dementor: Dementor, skill: string) {
  dementor.state = "casting";
  dementor.currentSkill = skill;
  dementor.skillCastStartTime = Date.now();

  if (skill === "souldrain") {
    dementor.skillCastDuration = 4000; // 4 seconds
  } else if (skill === "silenceshriek") {
    dementor.skillCastDuration = 4000; // 4 seconds
  }

  console.log(`💀 Dementor ${dementor.id} casting ${skill}!`);
}

function executeDementorSkill(
  dementor: Dementor,
  player: Player,
  activeTimeouts: NodeJS.Timeout[],
  onGameOver: () => void,
  gameOver: boolean,
  gameWon: boolean
) {
  if (dementor.currentSkill === "souldrain") {
    if (!player.isProtected) {
      // Stun player for 4 seconds
      player.isImmobilized = true;
      player.immobilizedEndTime = Date.now() + 4000;
      console.log(`💀 Soul Drain immobilizes player for 4 seconds!`);

      // Deal 15 damage per second for 4 seconds
      for (let i = 0; i < 4; i++) {
        const timeout = setTimeout(() => {
          if (!gameOver && !gameWon) {
            damagePlayer(player, 15, activeTimeouts, onGameOver);
            healDementor(dementor, 15); // Heal self
          }
        }, (i + 1) * 1000);
        activeTimeouts.push(timeout);
      }
    } else {
      console.log(`🛡️ Soul Drain blocked by Protego!`);
    }
  } else if (dementor.currentSkill === "silenceshriek") {
    if (!player.isProtected) {
      // Silence player for 3 seconds (this will be handled in main.ts)
      console.log(
        `🔇 Silence Shriek hits! Player voice disabled for 3 seconds!`
      );
      // Set a flag that main.ts can check
      (player as any).isSilenced = true;
      (player as any).silenceEndTime = Date.now() + 3000;
    } else {
      console.log(`🛡️ Silence Shriek blocked by Protego!`);
    }
  }
}

// Hardcoded spell interactions with Dementor
export function castSpellOnDementor(
  spellName: string,
  confidence: number,
  dementor: Dementor,
  player: Player,
  activeTimeouts: NodeJS.Timeout[]
) {
  if (dementor.state === "dead") return;

  const powerMultiplier = Math.min(confidence * 1.5, 1.5);

  switch (spellName) {
    case "expelliarmus":
      if (dementor.state === "casting") {
        // Cancel spell, knockback, stun
        dementor.state = "stunned";
        dementor.stunEndTime = Date.now() + 4000; // 4 seconds
        dementor.currentSkill = "";
        console.log(
          `✨ Dementor ${dementor.id} spell interrupted and stunned for 4s!`
        );
      } else if (dementor.state === "idle") {
        // Knockback, stun
        dementor.state = "stunned";
        dementor.stunEndTime = Date.now() + 4000; // 4 seconds
        console.log(`✨ Dementor ${dementor.id} stunned for 4s!`);
      }
      break;

    case "levicorpus":
      console.log(`🪶 Levicorpus has no effect on Dementor ${dementor.id}!`);
      break;

    case "protego":
      protectPlayer(player, 5000); // 5 seconds protection
      break;

    case "glacius":
      if (dementor.state === "stunned") {
        damageDementor(dementor, 30, activeTimeouts, () => {
          console.log("🎉 VICTORY! Dementor defeated!");
        });
        console.log(`❄️ Dementor ${dementor.id} frozen for 30 damage!`);
      } else {
        triggerShadowPhase(dementor);
        console.log(
          `❄️ Dementor ${dementor.id} dodged Glacius with Shadow Phase!`
        );
      }
      break;

    case "incendio":
      const incendioDamage = Math.floor(25 * powerMultiplier);
      if (dementor.state === "stunned") {
        damageDementor(dementor, incendioDamage, activeTimeouts, () => {
          console.log("🎉 VICTORY! Dementor defeated!");
        });
        console.log(
          `🔥 Dementor ${dementor.id} burned for ${incendioDamage} damage!`
        );
      } else {
        triggerShadowPhase(dementor);
        console.log(
          `🔥 Dementor ${dementor.id} dodged Incendio with Shadow Phase!`
        );
      }
      break;

    case "bombarda":
      if (dementor.state === "stunned") {
        damageDementor(dementor, 15, activeTimeouts, () => {
          console.log("🎉 VICTORY! Dementor defeated!");
        });
        console.log(`💥 Dementor ${dementor.id} exploded for 15 damage!`);
      } else {
        triggerShadowPhase(dementor);
        console.log(
          `💥 Dementor ${dementor.id} dodged Bombarda with Shadow Phase!`
        );
      }
      break;

    case "depulso":
      const depulsoDamage = Math.floor(20 * powerMultiplier);
      if (dementor.state === "stunned") {
        damageDementor(dementor, depulsoDamage, activeTimeouts, () => {
          console.log("🎉 VICTORY! Dementor defeated!");
        });
        console.log(
          `🪨 Dementor ${dementor.id} hit by force for ${depulsoDamage} damage!`
        );
      } else {
        triggerShadowPhase(dementor);
        console.log(
          `🪨 Dementor ${dementor.id} dodged Depulso with Shadow Phase!`
        );
      }
      break;
  }
}

// Draw dementor function
export function drawDementor(
  dementor: Dementor,
  ctx: CanvasRenderingContext2D
) {
  if (dementor.state === "dead") {
    drawDeadEnemy(dementor, ctx);
    return;
  }

  // Create dementor image if it doesn't exist
  if (!(window as any).dementorImage) {
    (window as any).dementorImage = new Image();
    (window as any).dementorImage.src = "/assets/enemies/dementor_normal.png";
  }

  const dementorImage = (window as any).dementorImage;

  // Apply shadow phase transparency
  const alpha = dementor.state === "shadowphase" ? 0.3 : 1.0;
  ctx.globalAlpha = alpha;

  // Draw the dementor image with proper aspect ratio
  if (dementorImage.complete) {
    // Calculate aspect ratio-preserving dimensions using original image proportions
    const originalAspectRatio = 431 / 461; // Original dementor image proportions (don't stretch)
    const targetWidth = dementor.width;
    const targetHeight = dementor.height;

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
    const offsetX = dementor.x + (targetWidth - drawWidth) / 2;
    const offsetY = dementor.y + (targetHeight - drawHeight) / 2;

    ctx.drawImage(dementorImage, offsetX, offsetY, drawWidth, drawHeight);
  } else {
    // Fallback to original drawing if image not loaded (scaled 12x)
    ctx.fillStyle = dementor.color;
    ctx.fillRect(dementor.x, dementor.y, dementor.width, dementor.height);

    // Ghostly face (scaled 12x)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(dementor.x + 96, dementor.y + 180, 72, 72); // left eye (scaled 12x)
    ctx.fillRect(dementor.x + 312, dementor.y + 180, 72, 72); // right eye (scaled 12x)

    // Mouth (hollow) (scaled 12x)
    ctx.fillStyle = "#000000";
    ctx.fillRect(dementor.x + 180, dementor.y + 360, 180, 96); // mouth (scaled 12x)

    // Ghostly arms (wispy) (scaled 12x)
    ctx.fillStyle = dementor.color;
    ctx.fillRect(dementor.x - 120, dementor.y + 300, 120, 240); // left arm (scaled 12x)
    ctx.fillRect(dementor.x + dementor.width, dementor.y + 300, 120, 240); // right arm (scaled 12x)
  }

  // Reset alpha
  ctx.globalAlpha = 1.0;

  // Shadow phase indicator
  if (dementor.state === "shadowphase") {
    ctx.fillStyle = "#8A2BE2";
    ctx.font = "96px Arial"; // Increased font size for the larger dementor
    ctx.fillText("🌑", dementor.x + dementor.width + 35, dementor.y + 70);
  }
}

// Re-export for backward compatibility
export type { Player };
export { damagePlayer, protectPlayer };
