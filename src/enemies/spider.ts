// Spider Enemy System for Hackwarts

// Spider enemy interface
export interface Spider {
  id: number;
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

  // AI states
  state: "idle" | "casting" | "stunned" | "levitating" | "dead";
  currentSkill: string;
  skillCastStartTime: number;
  skillCastDuration: number;
  nextSkillTime: number;
  stunEndTime: number;
  levitateEndTime: number;

  // Status effects
  isOnFire: boolean;
  fireEndTime: number;
  fireDamageTime: number;

  // Skills
  canCastWeb: boolean;
  canCastVenom: boolean;
  lastWebHit: boolean;
}

// Player interface for spider interactions
export interface Player {
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
  isImmobilized: boolean;
  isPoisoned: boolean;
  isProtected: boolean;
  protectionEndTime: number;
  poisonDamage: number;
  poisonEndTime: number;
  immobilizedEndTime: number;
  lastPoisonTick: number;
}

// Spider creation and management
export function createSpider(id: number, x: number, y: number): Spider {
  return {
    id,
    x,
    y,
    width: 40,
    height: 30,
    color: "#8B4513",
    maxHealth: 40,
    currentHealth: 40,
    originalX: x,
    originalY: y,
    originalColor: "#8B4513",

    state: "idle",
    currentSkill: "",
    skillCastStartTime: 0,
    skillCastDuration: 0,
    nextSkillTime: Date.now() + Math.random() * 3000 + 2000,
    stunEndTime: 0,
    levitateEndTime: 0,

    isOnFire: false,
    fireEndTime: 0,
    fireDamageTime: 0,

    canCastWeb: true,
    canCastVenom: false,
    lastWebHit: false,
  };
}

// Status effect functions
export function applyPoisonToPlayer(
  player: Player,
  damage: number,
  duration: number
) {
  player.isPoisoned = true;
  player.poisonDamage = damage;
  player.poisonEndTime = Date.now() + duration;
  player.lastPoisonTick = Date.now(); // Initialize poison tick timer
  console.log(
    `🐍 Player poisoned! ${damage} damage/sec for ${duration / 1000}s`
  );
}

export function immobilizePlayer(player: Player, duration: number) {
  player.isImmobilized = true;
  player.immobilizedEndTime = Date.now() + duration;
  console.log(`🕸️ Player immobilized for ${duration / 1000}s!`);
}

export function protectPlayer(player: Player, duration: number) {
  player.isProtected = true;
  player.protectionEndTime = Date.now() + duration;
  console.log(`🛡️ Player protected for ${duration / 1000}s!`);
}

export function setSpiderOnFire(spider: Spider, duration: number) {
  spider.isOnFire = true;
  spider.fireEndTime = Date.now() + duration;
  spider.fireDamageTime = Date.now() + 1000; // Next fire damage tick
  console.log(`🔥 Spider ${spider.id} is on fire!`);
}

export function damageSpider(
  spider: Spider,
  damage: number,
  activeTimeouts: NodeJS.Timeout[],
  onVictory: () => void
) {
  spider.currentHealth = Math.max(0, spider.currentHealth - damage);

  if (spider.currentHealth <= 0) {
    spider.state = "dead";
    onVictory();
  }

  // Visual damage feedback
  const originalColor = spider.color;
  spider.color = "#ff0000";
  const timeout = setTimeout(() => {
    if (spider.currentHealth > 0) {
      spider.color = originalColor;
    }
  }, 300);
  activeTimeouts.push(timeout);
}

export function damagePlayer(
  player: Player,
  damage: number,
  activeTimeouts: NodeJS.Timeout[],
  onGameOver: () => void
) {
  if (player.isProtected) {
    return;
  }

  player.currentHealth = Math.max(0, player.currentHealth - damage);

  if (player.currentHealth <= 0) {
    onGameOver();
  }

  // Visual damage feedback
  const originalColor = player.color;
  player.color = "#ff0000";
  const timeout = setTimeout(() => {
    if (player.currentHealth > 0) {
      player.color = originalColor;
    }
  }, 300);
  activeTimeouts.push(timeout);
}

// Spider AI functions
export function updateSpiderAI(
  spider: Spider,
  player: Player,
  activeTimeouts: NodeJS.Timeout[],
  gameOver: boolean,
  gameWon: boolean
) {
  if (spider.state === "dead" || gameOver || gameWon) return;

  const now = Date.now();

  // Handle status effects
  if (spider.state === "stunned" && now >= spider.stunEndTime) {
    spider.state = "idle";
  }

  if (spider.state === "levitating" && now >= spider.levitateEndTime) {
    spider.state = "idle";
  }

  // Handle fire damage
  if (spider.isOnFire) {
    if (now >= spider.fireEndTime) {
      spider.isOnFire = false;

      // Death after fire (special incendio effect)
      if (spider.currentHealth > 0) {
        const timeout = setTimeout(() => {
          spider.state = "dead";
          spider.currentHealth = 0;
        }, 2000);
        activeTimeouts.push(timeout);
      }
    } else if (now >= spider.fireDamageTime) {
      damageSpider(spider, 10, activeTimeouts, () => {
        console.log("🎉 VICTORY! Spider defeated!");
      });
      spider.fireDamageTime = now + 1000; // Next tick
    }
  }

  // Handle skill casting
  if (spider.state === "casting") {
    if (now >= spider.skillCastStartTime + spider.skillCastDuration) {
      // Execute the skill
      executeSpiderSkill(spider, player);
      spider.state = "idle";

      // Set next skill time based on what just happened
      if (spider.currentSkill === "web") {
        if (spider.lastWebHit) {
          // Web hit - cast venom after 1 second delay (less intense timing)
          spider.nextSkillTime = now + 1000;
        } else {
          // Web blocked - wait normal cooldown
          spider.nextSkillTime = now + Math.random() * 4000 + 3000; // 3-7 seconds
        }
      } else if (spider.currentSkill === "venom") {
        // After venom, wait normal cooldown
        spider.nextSkillTime = now + Math.random() * 4000 + 3000; // 3-7 seconds
      }
    }
    return;
  }

  // Try to cast skills
  if (spider.state === "idle" && now >= spider.nextSkillTime) {
    // Choose skill based on conditions
    if (spider.canCastVenom && spider.lastWebHit) {
      castSpiderSkill(spider, "venom");
    } else if (spider.canCastWeb) {
      castSpiderSkill(spider, "web");
    }
  }
}

function castSpiderSkill(spider: Spider, skill: string) {
  spider.state = "casting";
  spider.currentSkill = skill;
  spider.skillCastStartTime = Date.now();

  if (skill === "web") {
    spider.skillCastDuration = 5000; // 5 seconds
  } else if (skill === "venom") {
    spider.skillCastDuration = 2000; // 2 seconds
  }
}

function executeSpiderSkill(spider: Spider, player: Player) {
  if (spider.currentSkill === "web") {
    if (!player.isProtected) {
      // Web hit successfully
      immobilizePlayer(player, 3000);
      spider.lastWebHit = true;
      spider.canCastVenom = true;
    } else {
      // Web was blocked
      spider.lastWebHit = false;
      spider.canCastVenom = false;
    }
  } else if (spider.currentSkill === "venom") {
    if (!player.isProtected) {
      applyPoisonToPlayer(player, 5, 4000); // 5 damage/sec for 4 seconds
      player.isImmobilized = false; // Cancel immobilization
      player.immobilizedEndTime = 0;
    }
    // Reset combo state after venom attempt
    spider.canCastVenom = false;
    spider.lastWebHit = false;
  }
}

// Hardcoded spell interactions with spiders
export function castSpellOnSpider(
  spellName: string,
  confidence: number,
  spider: Spider,
  player: Player,
  activeTimeouts: NodeJS.Timeout[]
) {
  if (spider.state === "dead") return;

  const powerMultiplier = Math.min(confidence * 1.5, 1.5);

  switch (spellName) {
    case "expelliarmus":
      if (spider.state === "casting") {
        // Cancel spell, knockback, stun
        spider.state = "stunned";
        spider.stunEndTime = Date.now() + 2000;
        spider.currentSkill = "";
        // Reset combo if interrupted
        spider.lastWebHit = false;
        spider.canCastVenom = false;
      } else if (spider.state === "levitating") {
        // Knockback, stun, damage
        spider.state = "stunned";
        spider.stunEndTime = Date.now() + 2000;
        damageSpider(spider, 5, activeTimeouts, () => {
          console.log("🎉 VICTORY! Spider defeated!");
        });
      } else {
        // Knockback, stun
        spider.state = "stunned";
        spider.stunEndTime = Date.now() + 2000;
      }
      break;

    case "levicorpus":
      if (spider.state === "levitating") {
        console.log(`🪶 Spider ${spider.id} already levitating!`);
      } else {
        if (spider.state === "casting") {
          spider.currentSkill = "";
          // Reset combo if interrupted
          spider.lastWebHit = false;
          spider.canCastVenom = false;
        }
        spider.state = "levitating";
        spider.levitateEndTime = Date.now() + 2000;
      }
      break;

    case "protego":
      protectPlayer(player, 5000);
      break;

    case "glacius":
      if (spider.currentHealth > 0) {
        damageSpider(spider, 10, activeTimeouts, () => {
          console.log("🎉 VICTORY! Spider defeated!");
        });
      }
      break;

    case "incendio":
      if (spider.currentHealth > 0) {
        // Special fire effect for spider
        spider.isOnFire = true;
        spider.fireEndTime = Date.now() + 5000; // 5 seconds
        spider.fireDamageTime = Date.now() + 1000; // Next fire damage tick
        damageSpider(spider, 15, activeTimeouts, () => {
          console.log("🎉 VICTORY! Spider defeated!");
        });
      }
      break;

    case "bombarda":
      if (spider.currentHealth > 0) {
        damageSpider(spider, 20, activeTimeouts, () => {
          console.log("🎉 VICTORY! Spider defeated!");
        });
      }
      break;

    case "depulso":
      if (spider.currentHealth > 0) {
        damageSpider(spider, 15, activeTimeouts, () => {
          console.log("🎉 VICTORY! Spider defeated!");
        });
      }
      break;
  }
}

// Draw spider function
export function drawSpider(spider: Spider, ctx: CanvasRenderingContext2D) {
  if (spider.state === "dead") {
    // Draw dead spider
    ctx.fillStyle = "#444444";
    ctx.fillRect(spider.x, spider.y, spider.width, spider.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("💀", spider.x + spider.width / 2, spider.y - 5);
    ctx.textAlign = "left";
    return;
  }

  // Main body (oval shape approximation)
  ctx.fillStyle = spider.color;
  ctx.fillRect(spider.x, spider.y, spider.width, spider.height);

  // Spider legs (simple lines)
  ctx.strokeStyle = spider.color;
  ctx.lineWidth = 2;

  // Left legs
  ctx.beginPath();
  ctx.moveTo(spider.x, spider.y + 5);
  ctx.lineTo(spider.x - 15, spider.y - 5);
  ctx.moveTo(spider.x, spider.y + 15);
  ctx.lineTo(spider.x - 15, spider.y + 10);
  ctx.moveTo(spider.x, spider.y + 25);
  ctx.lineTo(spider.x - 15, spider.y + 25);

  // Right legs
  ctx.moveTo(spider.x + spider.width, spider.y + 5);
  ctx.lineTo(spider.x + spider.width + 15, spider.y - 5);
  ctx.moveTo(spider.x + spider.width, spider.y + 15);
  ctx.lineTo(spider.x + spider.width + 15, spider.y + 10);
  ctx.moveTo(spider.x + spider.width, spider.y + 25);
  ctx.lineTo(spider.x + spider.width + 15, spider.y + 25);
  ctx.stroke();

  // Eyes
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(spider.x + 5, spider.y + 5, 4, 4);
  ctx.fillRect(spider.x + 12, spider.y + 5, 4, 4);

  // Status indicators
  if (spider.state === "casting") {
    ctx.fillStyle = "#ffff00";
    ctx.font = "16px Arial";
    ctx.fillText("⚡", spider.x + spider.width / 2 - 5, spider.y - 10);
  }

  if (spider.state === "stunned") {
    ctx.fillStyle = "#ffff00";
    ctx.font = "16px Arial";
    ctx.fillText("💫", spider.x + spider.width / 2 - 5, spider.y - 10);
  }

  if (spider.state === "levitating") {
    ctx.fillStyle = "#00ffff";
    ctx.font = "16px Arial";
    ctx.fillText("🪶", spider.x + spider.width / 2 - 5, spider.y - 10);
  }

  if (spider.isOnFire) {
    ctx.fillStyle = "#ff6600";
    ctx.font = "16px Arial";
    ctx.fillText("🔥", spider.x + spider.width + 5, spider.y + 5);
  }

  // Skill casting indicator with progress bar
  if (spider.state === "casting") {
    const progress =
      (Date.now() - spider.skillCastStartTime) / spider.skillCastDuration;
    const barWidth = 30;
    const barHeight = 4;
    const barX = spider.x + spider.width / 2 - barWidth / 2;
    const barY = spider.y + spider.height + 5;

    ctx.fillStyle = "#333333";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = "#ffff00";
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);

    // Show skill name being cast
    ctx.fillStyle = "#ffff00";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    const skillDisplayName =
      spider.currentSkill === "web"
        ? "Entangling Web"
        : spider.currentSkill === "venom"
        ? "Venom Spit"
        : spider.currentSkill;
    ctx.fillText(
      skillDisplayName,
      spider.x + spider.width / 2,
      spider.y + spider.height + 20
    );
    ctx.textAlign = "left";
  }
}
