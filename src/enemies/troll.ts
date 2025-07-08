// Troll Enemy System for Hackwarts

import { Player, damagePlayer, protectPlayer } from "./spider.js";

// Troll enemy interface
export interface Troll {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  maxHealth: number;
  currentHealth: number;
  totalDamageReceived: number; // For defeat condition (100 HP total damage)
  originalX: number;
  originalY: number;
  originalColor: string;

  // AI states
  state: "idle" | "casting" | "stunned" | "levitating" | "dead";
  currentSkill: string;
  skillCastStartTime: number;
  skillCastDuration: number;
  nextSkillTime: number;
  stunEndTime: number;
  levitateEndTime: number;

  // Status effects
  hasChunkArmor: boolean;
  chunkArmorEndTime: number;
  isRockThrowReflected: boolean; // For Depulso counter
}

// Troll creation and management
export function createTroll(id: number, x: number, y: number): Troll {
  return {
    id,
    x,
    y,
    width: 60,
    height: 80,
    color: "#654321",
    maxHealth: 100,
    currentHealth: 100,
    totalDamageReceived: 0,
    originalX: x,
    originalY: y,
    originalColor: "#654321",

    state: "idle",
    currentSkill: "",
    skillCastStartTime: 0,
    skillCastDuration: 0,
    nextSkillTime: Date.now() + Math.random() * 3000 + 2000,
    stunEndTime: 0,
    levitateEndTime: 0,

    hasChunkArmor: false,
    chunkArmorEndTime: 0,
    isRockThrowReflected: false,
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
    `🪨 Troll ${troll.id} took ${damage} damage. Health: ${troll.currentHealth}/${troll.maxHealth}, Total damage: ${troll.totalDamageReceived}`
  );

  // Defeat condition: 100 HP total damage OR current health reaches 0
  if (troll.totalDamageReceived >= 100 || troll.currentHealth <= 0) {
    console.log(`💀 Troll ${troll.id} DEFEATED! State: ${troll.state} -> dead`);
    troll.state = "dead";
    onVictory();
  }

  // Visual damage feedback
  const originalColor = troll.color;
  troll.color = "#ff0000";
  const timeout = setTimeout(() => {
    if (troll.state !== "dead") {
      troll.color = originalColor;
    }
  }, 300);
  activeTimeouts.push(timeout);
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

  // Handle status effects
  if (troll.state === "stunned" && now >= troll.stunEndTime) {
    troll.state = "idle";
  }

  if (troll.state === "levitating" && now >= troll.levitateEndTime) {
    troll.state = "idle";
  }

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
    // Draw dead troll
    ctx.fillStyle = "#444444";
    ctx.fillRect(troll.x, troll.y, troll.width, troll.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("💀", troll.x + troll.width / 2, troll.y - 10);
    ctx.textAlign = "left";
    return;
  }

  // Main body
  ctx.fillStyle = troll.color;
  ctx.fillRect(troll.x, troll.y, troll.width, troll.height);

  // Simple face
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(troll.x + 10, troll.y + 15, 8, 8); // left eye
  ctx.fillRect(troll.x + 30, troll.y + 15, 8, 8); // right eye
  ctx.fillRect(troll.x + 15, troll.y + 35, 20, 6); // mouth

  // Arms
  ctx.fillStyle = troll.color;
  ctx.fillRect(troll.x - 15, troll.y + 20, 15, 25); // left arm
  ctx.fillRect(troll.x + troll.width, troll.y + 20, 15, 25); // right arm

  // Legs
  ctx.fillRect(troll.x + 10, troll.y + troll.height, 15, 20); // left leg
  ctx.fillRect(troll.x + 35, troll.y + troll.height, 15, 20); // right leg

  // Status indicators
  if (troll.state === "casting") {
    ctx.fillStyle = "#ffff00";
    ctx.font = "20px Arial";
    ctx.fillText("⚡", troll.x + troll.width / 2 - 10, troll.y - 15);
  }

  if (troll.state === "stunned") {
    ctx.fillStyle = "#ffff00";
    ctx.font = "20px Arial";
    ctx.fillText("💫", troll.x + troll.width / 2 - 10, troll.y - 15);
  }

  if (troll.state === "levitating") {
    ctx.fillStyle = "#00ffff";
    ctx.font = "20px Arial";
    ctx.fillText("🪶", troll.x + troll.width / 2 - 10, troll.y - 15);
  }

  if (troll.hasChunkArmor) {
    ctx.fillStyle = "#8B4513";
    ctx.font = "20px Arial";
    ctx.fillText("🛡️", troll.x + troll.width + 10, troll.y + 10);
  }

  // Skill casting indicator with progress bar
  if (troll.state === "casting") {
    const progress =
      (Date.now() - troll.skillCastStartTime) / troll.skillCastDuration;
    const barWidth = 40;
    const barHeight = 6;
    const barX = troll.x + troll.width / 2 - barWidth / 2;
    const barY = troll.y + troll.height + 5;

    ctx.fillStyle = "#333333";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = "#ffff00";
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);

    // Show skill name being cast
    ctx.fillStyle = "#ffff00";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    const skillDisplayName =
      troll.currentSkill === "rockthrow"
        ? "Rock Throw"
        : troll.currentSkill === "chunkarmor"
        ? "Chunk Armor"
        : troll.currentSkill === "stomp"
        ? "Stomp"
        : troll.currentSkill;
    ctx.fillText(
      skillDisplayName,
      troll.x + troll.width / 2,
      troll.y + troll.height + 25
    );
    ctx.textAlign = "left";
  }
}
