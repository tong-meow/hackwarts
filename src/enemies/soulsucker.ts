// Soul Sucker Enemy System for Hackwarts

import { Player, damagePlayer, protectPlayer } from "./spider.js";

// Soul Sucker enemy interface
export interface SoulSucker {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  maxHealth: number;
  currentHealth: number;
  totalDamageReceived: number; // For defeat condition (150 HP total damage)
  originalX: number;
  originalY: number;
  originalColor: string;

  // AI states
  state: "idle" | "casting" | "stunned" | "shadowphase" | "dead";
  currentSkill: string;
  skillCastStartTime: number;
  skillCastDuration: number;
  nextSkillTime: number;
  stunEndTime: number;
  shadowPhaseEndTime: number;
}

// Soul Sucker creation and management
export function createSoulSucker(id: number, x: number, y: number): SoulSucker {
  return {
    id,
    x,
    y,
    width: 50,
    height: 70,
    color: "#2c1810",
    maxHealth: 150,
    currentHealth: 150,
    totalDamageReceived: 0,
    originalX: x,
    originalY: y,
    originalColor: "#2c1810",

    state: "idle",
    currentSkill: "",
    skillCastStartTime: 0,
    skillCastDuration: 0,
    nextSkillTime: Date.now() + Math.random() * 3000 + 2000,
    stunEndTime: 0,
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
  // Can only take damage when stunned
  if (soulSucker.state !== "stunned") {
    console.log(
      `👻 Soul Sucker ${soulSucker.id} cannot be damaged unless stunned!`
    );
    return;
  }

  // Track total damage for defeat condition
  soulSucker.totalDamageReceived += damage;
  soulSucker.currentHealth = Math.max(0, soulSucker.currentHealth - damage);

  console.log(
    `💥 Soul Sucker ${soulSucker.id} takes ${damage} damage! Health: ${soulSucker.currentHealth}/${soulSucker.maxHealth} (Total damage: ${soulSucker.totalDamageReceived}/150)`
  );

  // Defeat condition: 150 HP total damage
  if (soulSucker.totalDamageReceived >= 150) {
    soulSucker.state = "dead";
    console.log(`💀 Soul Sucker ${soulSucker.id} defeated by total damage!`);
    onVictory();
  }

  // Visual damage feedback
  const originalColor = soulSucker.color;
  soulSucker.color = "#ff0000";
  const timeout = setTimeout(() => {
    if (soulSucker.state !== "dead") {
      soulSucker.color = originalColor;
    }
  }, 300);
  activeTimeouts.push(timeout);
}

// Soul Sucker heal function
export function healSoulSucker(soulSucker: SoulSucker, amount: number) {
  soulSucker.currentHealth = Math.min(
    soulSucker.maxHealth,
    soulSucker.currentHealth + amount
  );
  console.log(
    `💚 Soul Sucker ${soulSucker.id} healed for ${amount} HP! Health: ${soulSucker.currentHealth}/${soulSucker.maxHealth}`
  );
}

// Shadow Phase function
export function triggerShadowPhase(soulSucker: SoulSucker) {
  if (soulSucker.state === "stunned") return; // Cannot dodge when stunned

  soulSucker.state = "shadowphase";
  soulSucker.shadowPhaseEndTime = Date.now() + 1000; // 1 second in shadow phase
  console.log(
    `🌑 Soul Sucker ${soulSucker.id} enters Shadow Phase to dodge attack!`
  );
}

// Player silencing function
export function silencePlayer(player: any, duration: number) {
  player.isSilenced = true;
  player.silenceEndTime = Date.now() + duration;
  console.log(`🔇 Player silenced for ${duration / 1000} seconds!`);
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

  // Handle status effects
  if (soulSucker.state === "stunned" && now >= soulSucker.stunEndTime) {
    soulSucker.state = "idle";
    console.log(`Soul Sucker ${soulSucker.id} recovered from stun`);
  }

  if (
    soulSucker.state === "shadowphase" &&
    now >= soulSucker.shadowPhaseEndTime
  ) {
    soulSucker.state = "idle";
    console.log(`🌑 Soul Sucker ${soulSucker.id} exits Shadow Phase`);
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
    console.log(`👻 Soul Sucker ${soulSucker.id} casting Soul Drain...`);
  } else if (skill === "silenceshriek") {
    soulSucker.skillCastDuration = 4000; // 4 seconds
    console.log(`🔇 Soul Sucker ${soulSucker.id} casting Silence Shriek...`);
  }
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
    console.log(`👻 Soul Sucker ${soulSucker.id} drains player's soul!`);
    if (!player.isProtected) {
      // Stun player for 4 seconds
      player.isImmobilized = true;
      player.immobilizedEndTime = Date.now() + 4000;

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

      console.log(
        `👻 Soul Drain active! Player stunned for 4 seconds, taking 15 damage/sec!`
      );
    } else {
      console.log(`🛡️ Soul Drain blocked by Protego!`);
    }
  } else if (soulSucker.currentSkill === "silenceshriek") {
    console.log(`🔇 Soul Sucker ${soulSucker.id} shrieks to silence player!`);
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
      if (soulSucker.state === "stunned") {
        damageSoulSucker(soulSucker, 30, activeTimeouts, () => {
          console.log("🎉 VICTORY! Soul Sucker defeated!");
        });
        console.log(`🔥 Soul Sucker ${soulSucker.id} burned for 30 damage!`);
      } else {
        triggerShadowPhase(soulSucker);
        console.log(
          `🔥 Soul Sucker ${soulSucker.id} dodged Incendio with Shadow Phase!`
        );
      }
      break;

    case "bombarda":
      if (soulSucker.state === "stunned") {
        damageSoulSucker(soulSucker, 10, activeTimeouts, () => {
          console.log("🎉 VICTORY! Soul Sucker defeated!");
        });
        console.log(`💥 Soul Sucker ${soulSucker.id} exploded for 10 damage!`);
      } else {
        triggerShadowPhase(soulSucker);
        console.log(
          `💥 Soul Sucker ${soulSucker.id} dodged Bombarda with Shadow Phase!`
        );
      }
      break;

    case "depulso":
      if (soulSucker.state === "stunned") {
        damageSoulSucker(soulSucker, 10, activeTimeouts, () => {
          console.log("🎉 VICTORY! Soul Sucker defeated!");
        });
        console.log(
          `🪨 Soul Sucker ${soulSucker.id} hit by force for 10 damage!`
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

// Draw Soul Sucker function
export function drawSoulSucker(
  soulSucker: SoulSucker,
  ctx: CanvasRenderingContext2D
) {
  if (soulSucker.state === "dead") {
    // Draw dead Soul Sucker
    ctx.fillStyle = "#444444";
    ctx.fillRect(
      soulSucker.x,
      soulSucker.y,
      soulSucker.width,
      soulSucker.height
    );

    ctx.fillStyle = "#ffffff";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("💀", soulSucker.x + soulSucker.width / 2, soulSucker.y - 10);
    ctx.textAlign = "left";
    return;
  }

  // Main body - shadowy appearance
  if (soulSucker.state === "shadowphase") {
    ctx.fillStyle = "rgba(44, 24, 16, 0.5)"; // Semi-transparent in shadow phase
  } else {
    ctx.fillStyle = soulSucker.color;
  }
  ctx.fillRect(soulSucker.x, soulSucker.y, soulSucker.width, soulSucker.height);

  // Ghostly face
  ctx.fillStyle = "#ff4444";
  ctx.fillRect(soulSucker.x + 8, soulSucker.y + 10, 6, 6); // left eye
  ctx.fillRect(soulSucker.x + 28, soulSucker.y + 10, 6, 6); // right eye

  // Mouth
  ctx.fillStyle = "#000000";
  ctx.fillRect(soulSucker.x + 20, soulSucker.y + 25, 10, 8);

  // Flowing robes/shadow tendrils
  ctx.fillStyle = soulSucker.color;
  ctx.fillRect(soulSucker.x - 5, soulSucker.y + 50, 10, 30); // left tendril
  ctx.fillRect(soulSucker.x + soulSucker.width - 5, soulSucker.y + 50, 10, 30); // right tendril

  // Status indicators
  if (soulSucker.state === "casting") {
    ctx.fillStyle = "#8b00ff";
    ctx.font = "20px Arial";
    ctx.fillText(
      "⚡",
      soulSucker.x + soulSucker.width / 2 - 10,
      soulSucker.y - 15
    );
  }

  if (soulSucker.state === "stunned") {
    ctx.fillStyle = "#ffff00";
    ctx.font = "20px Arial";
    ctx.fillText(
      "💫",
      soulSucker.x + soulSucker.width / 2 - 10,
      soulSucker.y - 15
    );
  }

  if (soulSucker.state === "shadowphase") {
    ctx.fillStyle = "#8b00ff";
    ctx.font = "20px Arial";
    ctx.fillText(
      "🌑",
      soulSucker.x + soulSucker.width / 2 - 10,
      soulSucker.y - 15
    );
  }

  // Skill casting indicator with progress bar
  if (soulSucker.state === "casting") {
    const progress =
      (Date.now() - soulSucker.skillCastStartTime) /
      soulSucker.skillCastDuration;
    const barWidth = 40;
    const barHeight = 6;
    const barX = soulSucker.x + soulSucker.width / 2 - barWidth / 2;
    const barY = soulSucker.y + soulSucker.height + 5;

    ctx.fillStyle = "#333333";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = "#8b00ff";
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);

    // Show skill name being cast
    ctx.fillStyle = "#8b00ff";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    const skillDisplayName =
      soulSucker.currentSkill === "souldrain"
        ? "Soul Drain"
        : soulSucker.currentSkill === "silenceshriek"
        ? "Silence Shriek"
        : soulSucker.currentSkill;
    ctx.fillText(
      skillDisplayName,
      soulSucker.x + soulSucker.width / 2,
      soulSucker.y + soulSucker.height + 25
    );
    ctx.textAlign = "left";
  }
}
