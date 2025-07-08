// Troll Enemy System for Hackwarts - Refactored
import {
  BaseEnemyState,
  createBaseEnemy,
  handleStunEffect,
  handleLevitateEffect,
  applyDamageVisualFeedback,
  drawDeadEnemy,
} from "../BaseEnemy.js";
import { Player, damagePlayer, protectPlayer } from "../Player.js";

// Troll-specific interface extending base enemy
export interface Troll extends BaseEnemyState {
  type: "troll";
  totalDamageReceived: number; // For defeat condition (100 HP total damage)
  hasChunkArmor: boolean;
  chunkArmorEndTime: number;
  isRockThrowReflected: boolean; // For Depulso counter

  // Attack animation
  isAttacking: boolean;
  attackStartTime: number;
  attackDuration: number;
  attackOffset: number;
}

// Troll creation and management
export function createTroll(id: number, x: number, y: number): Troll {
  const baseEnemy = createBaseEnemy(id, x, y, 600, 800, "#654321", 100);
  return {
    ...baseEnemy,
    type: "troll",
    totalDamageReceived: 0,
    hasChunkArmor: false,
    chunkArmorEndTime: 0,
    isRockThrowReflected: false,
    isAttacking: false,
    attackStartTime: 0,
    attackDuration: 200, // 200ms attack animation
    attackOffset: 0,
  };
}

// Troll damage function
export function damageTroll(
  troll: Troll,
  damage: number,
  activeTimeouts: NodeJS.Timeout[],
  onVictory: () => void
) {
  // Track total damage for defeat condition
  troll.totalDamageReceived += damage;
  troll.currentHealth = Math.max(0, troll.currentHealth - damage);

  console.log(
    `🪨 Troll ${troll.id} took ${damage} damage. Health: ${troll.currentHealth}/${troll.maxHealth}, Total damage: ${troll.totalDamageReceived}, State: ${troll.state}`
  );

  // Defeat condition: 100 HP total damage OR current health reaches 0
  const shouldBeDefeated =
    troll.totalDamageReceived >= 100 || troll.currentHealth <= 0;

  if (shouldBeDefeated) {
    console.log(
      `💀 Troll ${troll.id} DEFEATED! Condition met: totalDamage(${troll.totalDamageReceived}) >= 100 OR currentHealth(${troll.currentHealth}) <= 0`
    );
    console.log(`💀 Setting state from "${troll.state}" to "dead"`);
    troll.state = "dead";
    console.log(`💀 Calling onVictory callback for Troll ${troll.id}`);
    onVictory();
    console.log(`💀 onVictory callback completed for Troll ${troll.id}`);
  } else {
    console.log(
      `🪨 Troll ${troll.id} still alive. Need ${
        100 - troll.totalDamageReceived
      } more total damage or ${troll.currentHealth} more current damage.`
    );
  }

  // Visual damage feedback using base function
  applyDamageVisualFeedback(troll, activeTimeouts);
}

// Troll AI functions
export function updateTrollAI(
  troll: Troll,
  player: Player,
  activeTimeouts: NodeJS.Timeout[],
  gameOver: boolean,
  gameWon: boolean,
  onGameOver: () => void
) {
  if (troll.state === "dead" || gameOver || gameWon) return;

  const now = Date.now();

  // Add subtle breathing animation (gentle movement)
  const breathingSpeed = 0.002; // Slow breathing
  const breathingAmplitude = 3; // Small movement range (3 pixels)
  const breathingOffset = Math.sin(now * breathingSpeed) * breathingAmplitude;

  // Apply breathing animation to y position (up and down movement)
  troll.y = troll.originalY + breathingOffset;

  // Handle attack animation
  if (troll.isAttacking) {
    const attackElapsed = now - troll.attackStartTime;
    const attackProgress = Math.min(attackElapsed / troll.attackDuration, 1.0);

    if (attackProgress < 0.5) {
      // First half: move left
      troll.attackOffset = -100 * (attackProgress * 2); // Move up to 100px left
    } else {
      // Second half: move back
      troll.attackOffset = -100 * (2 - attackProgress * 2); // Move back to original position
    }

    if (attackProgress >= 1.0) {
      troll.isAttacking = false;
      troll.attackOffset = 0;
    }
  }

  // Handle status effects using base functions
  handleStunEffect(troll, now);
  handleLevitateEffect(troll, now);

  // Handle chunk armor duration
  if (troll.hasChunkArmor && now >= troll.chunkArmorEndTime) {
    troll.hasChunkArmor = false;
  }

  // Handle skill casting
  if (troll.state === "casting") {
    if (now >= troll.skillCastStartTime + troll.skillCastDuration) {
      // Execute the skill
      executeTrollSkill(troll, player, activeTimeouts, onGameOver);
      troll.state = "idle";
      troll.nextSkillTime = now + Math.random() * 4000 + 3000; // 3-7 seconds
    }
    return;
  }

  // Try to cast skills
  if (troll.state === "idle" && now >= troll.nextSkillTime) {
    // Choose skill (prioritize chunk armor if not active)
    if (!troll.hasChunkArmor && Math.random() < 0.3) {
      castTrollSkill(troll, "chunkarmor");
    } else if (Math.random() < 0.4) {
      castTrollSkill(troll, "rockthrow");
    } else {
      castTrollSkill(troll, "stomp");
    }
  }
}

function castTrollSkill(troll: Troll, skill: string) {
  troll.state = "casting";
  troll.currentSkill = skill;
  troll.skillCastStartTime = Date.now();
  troll.isRockThrowReflected = false; // Reset reflection flag

  if (skill === "rockthrow") {
    troll.skillCastDuration = 4000; // 4 seconds
  } else if (skill === "chunkarmor") {
    troll.skillCastDuration = 1000; // 1 second
  } else if (skill === "stomp") {
    troll.skillCastDuration = 5000; // 5 seconds
  }
}

function executeTrollSkill(
  troll: Troll,
  player: Player,
  activeTimeouts: NodeJS.Timeout[],
  onGameOver: () => void
) {
  if (troll.currentSkill === "rockthrow") {
    // Trigger attack animation for rock throw
    troll.isAttacking = true;
    troll.attackStartTime = Date.now();

    if (!troll.isRockThrowReflected) {
      // Normal rock throw damage
      if (player.isProtected) {
        console.log(`🛡️ Rock blocked by Protego!`);
      } else {
        damagePlayer(player, 30, activeTimeouts, onGameOver);
        console.log(`🪨 Rock hit player for 30 damage!`);
      }
    } else {
      // Rock was reflected back to troll
      damageTroll(troll, 30, activeTimeouts, () => {
        console.log("🎉 VICTORY! Troll defeated!");
      });
      console.log(`🪨 Reflected rock hit troll for 30 damage!`);
    }
  } else if (troll.currentSkill === "chunkarmor") {
    troll.hasChunkArmor = true;
    troll.chunkArmorEndTime = Date.now() + 15000; // 15 seconds duration
    console.log(`🛡️ Troll ${troll.id} activated chunk armor!`);
  } else if (troll.currentSkill === "stomp") {
    let damage = 40;
    if (player.isProtected) {
      damage = 20; // Reduced but not fully blocked
    }
    damagePlayer(player, damage, activeTimeouts, onGameOver);
    console.log(`🦶 Stomp shockwave hits player for ${damage} damage!`);
  }
}

// Hardcoded spell interactions with trolls
export function castSpellOnTroll(
  spellName: string,
  confidence: number,
  troll: Troll,
  player: Player,
  activeTimeouts: NodeJS.Timeout[]
) {
  if (troll.state === "dead") return;

  const powerMultiplier = Math.min(confidence * 1.5, 1.5);

  switch (spellName) {
    case "expelliarmus":
      if (troll.hasChunkArmor) {
        console.log(`🛡️ Chunk armor blocks Expelliarmus!`);
      } else if (troll.state === "casting") {
        // Cancel spell, knockback
        troll.state = "stunned";
        troll.stunEndTime = Date.now() + 2000;
        troll.currentSkill = "";
        console.log(`✨ Troll ${troll.id} spell interrupted and stunned!`);
      } else if (troll.state === "levitating") {
        // Knockback, stun
        troll.state = "stunned";
        troll.stunEndTime = Date.now() + 2000;
        console.log(`✨ Troll ${troll.id} knocked back from air and stunned!`);
      } else {
        // Just knockback
        console.log(`✨ Troll ${troll.id} knocked back!`);
      }
      break;

    case "levicorpus":
      if (troll.hasChunkArmor) {
        console.log(`🛡️ Chunk armor blocks Levicorpus!`);
      } else if (troll.state === "levitating") {
        console.log(`🪶 Troll ${troll.id} already levitating!`);
      } else {
        if (troll.state === "casting") {
          troll.currentSkill = "";
          console.log(`🪶 Troll ${troll.id} spell interrupted!`);
        }
        troll.state = "levitating";
        troll.levitateEndTime = Date.now() + 2000;
        console.log(`🪶 Troll ${troll.id} levitated!`);
      }
      break;

    case "protego":
      protectPlayer(player, 5000);
      break;

    case "glacius":
      if (troll.hasChunkArmor) {
        console.log(`🛡️ Chunk armor blocks Glacius!`);
      } else {
        damageTroll(troll, 10, activeTimeouts, () => {
          console.log("🎉 VICTORY! Troll defeated!");
        });
        console.log(`❄️ Troll ${troll.id} frozen for 10 damage!`);
      }
      break;

    case "incendio":
      if (troll.hasChunkArmor) {
        // Cancel chunk armor, no damage
        troll.hasChunkArmor = false;
        console.log(`🔥 Incendio burns away chunk armor!`);
      } else {
        damageTroll(troll, 10, activeTimeouts, () => {
          console.log("🎉 VICTORY! Troll defeated!");
        });
        console.log(`🔥 Troll ${troll.id} burned for 10 damage!`);
      }
      break;

    case "bombarda":
      if (troll.hasChunkArmor) {
        // Cancel chunk armor, no damage
        troll.hasChunkArmor = false;
        console.log(`💥 Bombarda explodes chunk armor!`);
      } else {
        damageTroll(troll, 20, activeTimeouts, () => {
          console.log("🎉 VICTORY! Troll defeated!");
        });
        console.log(`💥 Troll ${troll.id} exploded for 20 damage!`);
      }
      break;

    case "depulso":
      if (troll.hasChunkArmor) {
        console.log(`🛡️ Chunk armor blocks Depulso!`);
      } else if (
        troll.state === "casting" &&
        troll.currentSkill === "rockthrow"
      ) {
        // Reflect the rock throw
        troll.isRockThrowReflected = true;
        console.log(`🪨 Depulso will reflect the rock back to troll!`);
      } else {
        const damage = Math.floor(20 * powerMultiplier);
        damageTroll(troll, damage, activeTimeouts, () => {
          console.log("🎉 VICTORY! Troll defeated!");
        });
        console.log(`🪨 Troll ${troll.id} hit by force for ${damage} damage!`);
      }
      break;
  }
}

// Draw troll function
export function drawTroll(troll: Troll, ctx: CanvasRenderingContext2D) {
  if (troll.state === "dead") {
    drawDeadEnemy(troll, ctx);
    return;
  }

  // Create troll image if it doesn't exist
  if (!(window as any).trollImage) {
    (window as any).trollImage = new Image();
    (window as any).trollImage.src = "/assets/enemies/troll_normal.png";
  }

  const trollImage = (window as any).trollImage;

  // Draw the troll image with proper aspect ratio
  if (trollImage.complete) {
    // Calculate aspect ratio-preserving dimensions
    const originalAspectRatio = 600 / 800; // Updated troll dimensions
    const targetWidth = troll.width;
    const targetHeight = troll.height;

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
    const offsetX = troll.x + (targetWidth - drawWidth) / 2;
    const offsetY = troll.y + (targetHeight - drawHeight) / 2;

    ctx.drawImage(
      trollImage,
      offsetX + troll.attackOffset,
      offsetY,
      drawWidth,
      drawHeight
    );
  }

  // Chunk armor indicator
  if (troll.hasChunkArmor) {
    ctx.fillStyle = "#8B4513";
    ctx.font = "70px Arial"; // Adjusted font size for slightly smaller troll
    ctx.fillText(
      "🛡️",
      troll.x + troll.width + 35 + troll.attackOffset,
      troll.y + 35
    );
  }
}

// Re-export for backward compatibility
export type { Player };
export { damagePlayer, protectPlayer };
