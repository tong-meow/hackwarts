// Soul Sucker Enemy System for Hackwarts - Refactored
import {
  BaseEnemyState,
  createBaseEnemy,
  handleStunEffect,
  applyDamageVisualFeedback,
  drawStatusIndicators,
  drawDeadEnemy,
} from "../BaseEnemy.js";
import { Player, damagePlayer, protectPlayer } from "../Player.js";

// Soul Sucker-specific interface extending base enemy
export interface SoulSucker extends BaseEnemyState {
  type: "soulsucker";
  totalDamageReceived: number; // For defeat condition (150 HP total damage)
  shadowPhaseEndTime: number;
}

// Soul Sucker creation and management
export function createSoulSucker(id: number, x: number, y: number): SoulSucker {
  const baseEnemy = createBaseEnemy(id, x, y, 50, 70, "#2c1810", 150);
  return {
    ...baseEnemy,
    type: "soulsucker",
    totalDamageReceived: 0,
    shadowPhaseEndTime: 0,
  };
}

// Soul Sucker damage function
export function damageSoulSucker(
  soulSucker: SoulSucker,
  damage: number,
  activeTimeouts: NodeJS.Timeout[],
  onVictory: () => void
) {
  // Only take damage when stunned
  if (soulSucker.state === "stunned") {
    soulSucker.totalDamageReceived += damage;
    soulSucker.currentHealth = Math.max(0, soulSucker.currentHealth - damage);

    console.log(
      `💀 Soul Sucker ${soulSucker.id} took ${damage} damage. Health: ${soulSucker.currentHealth}/${soulSucker.maxHealth}, Total damage: ${soulSucker.totalDamageReceived}`
    );

    // Defeat condition: 150 HP total damage when stunned OR current health reaches 0
    if (
      soulSucker.totalDamageReceived >= 150 ||
      soulSucker.currentHealth <= 0
    ) {
      console.log(
        `💀 Soul Sucker ${soulSucker.id} DEFEATED! State: ${soulSucker.state} -> dead`
      );
      soulSucker.state = "dead";
      onVictory();
    }

    // Visual damage feedback using base function
    applyDamageVisualFeedback(soulSucker, activeTimeouts);
  } else {
    console.log(`💀 Soul Sucker ${soulSucker.id} dodged damage (not stunned)!`);
  }
}

// Soul Sucker heal function
export function healSoulSucker(soulSucker: SoulSucker, amount: number) {
  soulSucker.currentHealth = Math.min(
    soulSucker.maxHealth,
    soulSucker.currentHealth + amount
  );
  console.log(`💚 Soul Sucker ${soulSucker.id} healed for ${amount} HP!`);
}

// Shadow Phase function
export function triggerShadowPhase(soulSucker: SoulSucker) {
  if (soulSucker.state === "stunned") return; // Cannot dodge when stunned

  soulSucker.state = "shadowphase";
  soulSucker.shadowPhaseEndTime = Date.now() + 1000; // 1 second in shadow phase
  console.log(`🌑 Soul Sucker ${soulSucker.id} entered shadow phase!`);
}

// Player silencing function
export function silencePlayer(player: any, duration: number) {
  player.isSilenced = true;
  player.silenceEndTime = Date.now() + duration;
  console.log(`🔇 Player silenced for ${duration / 1000}s!`);
}

// Soul Sucker AI functions
export function updateSoulSuckerAI(
  soulSucker: SoulSucker,
  player: Player,
  activeTimeouts: NodeJS.Timeout[],
  gameOver: boolean,
  gameWon: boolean,
  onGameOver: () => void
) {
  if (soulSucker.state === "dead" || gameOver || gameWon) return;

  const now = Date.now();

  // Handle status effects using base function
  handleStunEffect(soulSucker, now);

  // Handle shadow phase
  if (
    soulSucker.state === "shadowphase" &&
    now >= soulSucker.shadowPhaseEndTime
  ) {
    soulSucker.state = "idle";
  }

  // Handle skill casting
  if (soulSucker.state === "casting") {
    if (now >= soulSucker.skillCastStartTime + soulSucker.skillCastDuration) {
      // Execute the skill
      executeSoulSuckerSkill(
        soulSucker,
        player,
        activeTimeouts,
        onGameOver,
        gameOver,
        gameWon
      );
      soulSucker.state = "idle";
      soulSucker.nextSkillTime = now + Math.random() * 4000 + 3000; // 3-7 seconds
    }
    return;
  }

  // Try to cast skills
  if (soulSucker.state === "idle" && now >= soulSucker.nextSkillTime) {
    // Choose skill randomly
    const skills = ["souldrain", "silenceshriek"];
    const randomSkill = skills[Math.floor(Math.random() * skills.length)];
    castSoulSuckerSkill(soulSucker, randomSkill);
  }
}

function castSoulSuckerSkill(soulSucker: SoulSucker, skill: string) {
  soulSucker.state = "casting";
  soulSucker.currentSkill = skill;
  soulSucker.skillCastStartTime = Date.now();

  if (skill === "souldrain") {
    soulSucker.skillCastDuration = 4000; // 4 seconds
  } else if (skill === "silenceshriek") {
    soulSucker.skillCastDuration = 4000; // 4 seconds
  }

  console.log(`💀 Soul Sucker ${soulSucker.id} casting ${skill}!`);
}

function executeSoulSuckerSkill(
  soulSucker: SoulSucker,
  player: Player,
  activeTimeouts: NodeJS.Timeout[],
  onGameOver: () => void,
  gameOver: boolean,
  gameWon: boolean
) {
  if (soulSucker.currentSkill === "souldrain") {
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
            healSoulSucker(soulSucker, 15); // Heal self
          }
        }, (i + 1) * 1000);
        activeTimeouts.push(timeout);
      }
    } else {
      console.log(`🛡️ Soul Drain blocked by Protego!`);
    }
  } else if (soulSucker.currentSkill === "silenceshriek") {
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

// Hardcoded spell interactions with Soul Sucker
export function castSpellOnSoulSucker(
  spellName: string,
  confidence: number,
  soulSucker: SoulSucker,
  player: Player,
  activeTimeouts: NodeJS.Timeout[]
) {
  if (soulSucker.state === "dead") return;

  const powerMultiplier = Math.min(confidence * 1.5, 1.5);

  switch (spellName) {
    case "expelliarmus":
      if (soulSucker.state === "casting") {
        // Cancel spell, knockback, stun
        soulSucker.state = "stunned";
        soulSucker.stunEndTime = Date.now() + 4000; // 4 seconds
        soulSucker.currentSkill = "";
        console.log(
          `✨ Soul Sucker ${soulSucker.id} spell interrupted and stunned for 4s!`
        );
      } else if (soulSucker.state === "idle") {
        // Knockback, stun
        soulSucker.state = "stunned";
        soulSucker.stunEndTime = Date.now() + 4000; // 4 seconds
        console.log(`✨ Soul Sucker ${soulSucker.id} stunned for 4s!`);
      }
      break;

    case "levicorpus":
      console.log(
        `🪶 Levicorpus has no effect on Soul Sucker ${soulSucker.id}!`
      );
      break;

    case "protego":
      protectPlayer(player, 5000); // 5 seconds protection
      break;

    case "glacius":
      if (soulSucker.state === "stunned") {
        damageSoulSucker(soulSucker, 30, activeTimeouts, () => {
          console.log("🎉 VICTORY! Soul Sucker defeated!");
        });
        console.log(`❄️ Soul Sucker ${soulSucker.id} frozen for 30 damage!`);
      } else {
        triggerShadowPhase(soulSucker);
        console.log(
          `❄️ Soul Sucker ${soulSucker.id} dodged Glacius with Shadow Phase!`
        );
      }
      break;

    case "incendio":
      const incendioDamage = Math.floor(25 * powerMultiplier);
      if (soulSucker.state === "stunned") {
        damageSoulSucker(soulSucker, incendioDamage, activeTimeouts, () => {
          console.log("🎉 VICTORY! Soul Sucker defeated!");
        });
        console.log(
          `🔥 Soul Sucker ${soulSucker.id} burned for ${incendioDamage} damage!`
        );
      } else {
        triggerShadowPhase(soulSucker);
        console.log(
          `🔥 Soul Sucker ${soulSucker.id} dodged Incendio with Shadow Phase!`
        );
      }
      break;

    case "bombarda":
      if (soulSucker.state === "stunned") {
        damageSoulSucker(soulSucker, 15, activeTimeouts, () => {
          console.log("🎉 VICTORY! Soul Sucker defeated!");
        });
        console.log(`💥 Soul Sucker ${soulSucker.id} exploded for 15 damage!`);
      } else {
        triggerShadowPhase(soulSucker);
        console.log(
          `💥 Soul Sucker ${soulSucker.id} dodged Bombarda with Shadow Phase!`
        );
      }
      break;

    case "depulso":
      const depulsoDamage = Math.floor(20 * powerMultiplier);
      if (soulSucker.state === "stunned") {
        damageSoulSucker(soulSucker, depulsoDamage, activeTimeouts, () => {
          console.log("🎉 VICTORY! Soul Sucker defeated!");
        });
        console.log(
          `🪨 Soul Sucker ${soulSucker.id} hit by force for ${depulsoDamage} damage!`
        );
      } else {
        triggerShadowPhase(soulSucker);
        console.log(
          `🪨 Soul Sucker ${soulSucker.id} dodged Depulso with Shadow Phase!`
        );
      }
      break;
  }
}

// Draw soul sucker function
export function drawSoulSucker(
  soulSucker: SoulSucker,
  ctx: CanvasRenderingContext2D
) {
  if (soulSucker.state === "dead") {
    drawDeadEnemy(soulSucker, ctx);
    return;
  }

  // Apply shadow phase transparency
  const alpha = soulSucker.state === "shadowphase" ? 0.5 : 1.0;
  ctx.globalAlpha = alpha;

  // Main body (ghostly appearance)
  ctx.fillStyle = soulSucker.color;
  ctx.fillRect(soulSucker.x, soulSucker.y, soulSucker.width, soulSucker.height);

  // Ghostly face
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(soulSucker.x + 8, soulSucker.y + 15, 6, 6); // left eye
  ctx.fillRect(soulSucker.x + 26, soulSucker.y + 15, 6, 6); // right eye

  // Mouth (hollow)
  ctx.fillStyle = "#000000";
  ctx.fillRect(soulSucker.x + 15, soulSucker.y + 30, 15, 8); // mouth

  // Ghostly arms (wispy)
  ctx.fillStyle = soulSucker.color;
  ctx.fillRect(soulSucker.x - 10, soulSucker.y + 25, 10, 20); // left arm
  ctx.fillRect(soulSucker.x + soulSucker.width, soulSucker.y + 25, 10, 20); // right arm

  // Reset alpha
  ctx.globalAlpha = 1.0;

  // Status indicators using base function
  drawStatusIndicators(soulSucker, ctx);

  // Shadow phase indicator
  if (soulSucker.state === "shadowphase") {
    ctx.fillStyle = "#8A2BE2";
    ctx.font = "16px Arial";
    ctx.fillText("🌑", soulSucker.x + soulSucker.width + 5, soulSucker.y + 10);
  }
}

// Re-export for backward compatibility
export type { Player };
export { damagePlayer, protectPlayer };
