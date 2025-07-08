// Spider Enemy System for Hackwarts - Refactored
import {
  BaseEnemyState,
  createBaseEnemy,
  handleStunEffect,
  handleLevitateEffect,
  applyDamageVisualFeedback,
  drawDeadEnemy,
} from "../BaseEnemy.js";
import {
  Player,
  damagePlayer,
  applyPoisonToPlayer,
  immobilizePlayer,
  protectPlayer,
} from "../Player.js";

// Spider-specific interface extending base enemy
export interface Spider extends BaseEnemyState {
  type: "spider";
  // Status effects
  isOnFire: boolean;
  fireEndTime: number;
  fireDamageTime: number;

  // Skills
  canCastWeb: boolean;
  canCastVenom: boolean;
  lastWebHit: boolean;

  // Attack animation
  isAttacking: boolean;
  attackStartTime: number;
  attackDuration: number;
  attackOffset: number;
}

// Spider creation and management
export function createSpider(id: number, x: number, y: number): Spider {
  const baseEnemy = createBaseEnemy(id, x, y, 960, 480, "#8B4513", 40);
  return {
    ...baseEnemy,
    type: "spider",
    isOnFire: false,
    fireEndTime: 0,
    fireDamageTime: 0,
    canCastWeb: true,
    canCastVenom: false,
    lastWebHit: false,
    isAttacking: false,
    attackStartTime: 0,
    attackDuration: 200, // 150ms attack animation (faster)
    attackOffset: 0,
  };
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

  // Visual damage feedback using base function
  applyDamageVisualFeedback(spider, activeTimeouts);
}

// Spider AI functions
export function updateSpiderAI(
  spider: Spider,
  player: Player,
  activeTimeouts: NodeJS.Timeout[],
  gameOver: boolean,
  gameWon: boolean,
  onWebCastComplete?: (success: boolean) => void
) {
  if (spider.state === "dead" || gameOver || gameWon) return;

  const now = Date.now();

  // Add subtle breathing animation (gentle movement)
  const breathingSpeed = 0.002; // Slow breathing
  const breathingAmplitude = 3; // Small movement range (3 pixels)
  const breathingOffset = Math.sin(now * breathingSpeed) * breathingAmplitude;

  // Apply breathing animation to y position (up and down movement)
  spider.y = spider.originalY + breathingOffset;

  // Handle attack animation
  if (spider.isAttacking) {
    const attackElapsed = now - spider.attackStartTime;
    if (attackElapsed < spider.attackDuration) {
      // Apply attack offset (move left and back)
      const progress = attackElapsed / spider.attackDuration;
      if (progress < 0.5) {
        // Moving left
        spider.attackOffset = -350 * (progress * 2);
      } else {
        // Moving back
        spider.attackOffset = -350 * (2 - progress * 2);
      }
    } else {
      // Attack animation complete
      spider.isAttacking = false;
      spider.attackOffset = 0;
    }
  }

  // Handle status effects using base functions
  handleStunEffect(spider, now);
  handleLevitateEffect(spider, now);

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
      executeSpiderSkill(spider, player, onWebCastComplete);
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
    if (spider.canCastVenom) {
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
    spider.skillCastDuration = 3000; // 3 seconds
  } else if (skill === "venom") {
    spider.skillCastDuration = 2000; // 2 seconds
  }
}

function executeSpiderSkill(
  spider: Spider,
  player: Player,
  onWebCastComplete?: (success: boolean) => void
) {
  // Trigger attack animation
  spider.isAttacking = true;
  spider.attackStartTime = Date.now();

  if (spider.currentSkill === "web") {
    if (!player.isProtected) {
      // Web hit successfully
      immobilizePlayer(player, 3000);
      spider.lastWebHit = true;
      spider.canCastVenom = true;
      onWebCastComplete?.(true);
    } else {
      // Web was blocked
      spider.lastWebHit = false;
      spider.canCastVenom = false;
      onWebCastComplete?.(false);
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
  activeTimeouts: NodeJS.Timeout[],
  onWebCastComplete?: (success: boolean) => void,
  onVenomCastInterrupted?: () => void
) {
  if (spider.state === "dead") return;

  const powerMultiplier = Math.min(confidence * 1.5, 1.5);

  switch (spellName) {
    case "expelliarmus":
      if (spider.state === "casting") {
        // Check if web casting was interrupted
        if (spider.currentSkill === "web") {
          onWebCastComplete?.(false);
        }
        // Check if venom casting was interrupted
        if (spider.currentSkill === "venom") {
          onVenomCastInterrupted?.();
        }

        // Cancel spell, knockback, stun
        spider.state = "stunned";
        spider.stunEndTime = Date.now() + 2000;
        spider.currentSkill = "";
        // Reset combo if interrupted
        spider.lastWebHit = false;
        spider.canCastVenom = false;
        console.log(`✨ Spider ${spider.id} spell interrupted and stunned!`);
      } else if (spider.state === "levitating") {
        // Knockback, stun, damage
        spider.state = "stunned";
        spider.stunEndTime = Date.now() + 2000;
        damageSpider(spider, 5, activeTimeouts, () => {
          console.log("🎉 VICTORY! Spider defeated!");
        });
        console.log(
          `✨ Spider ${spider.id} knocked back from air and stunned!`
        );
      } else {
        // Knockback, stun
        spider.state = "stunned";
        spider.stunEndTime = Date.now() + 2000;
        console.log(`✨ Spider ${spider.id} knocked back and stunned!`);
      }
      break;

    case "levicorpus":
      if (spider.state === "levitating") {
        console.log(`🪶 Spider ${spider.id} already levitating!`);
      } else {
        if (spider.state === "casting") {
          // Check if web casting was interrupted
          if (spider.currentSkill === "web") {
            onWebCastComplete?.(false);
          }
          // Check if venom casting was interrupted
          if (spider.currentSkill === "venom") {
            onVenomCastInterrupted?.();
          }

          spider.currentSkill = "";
          // Reset combo if interrupted
          spider.lastWebHit = false;
          spider.canCastVenom = false;
          console.log(`🪶 Spider ${spider.id} spell interrupted!`);
        }
        spider.state = "levitating";
        spider.levitateEndTime = Date.now() + 2000;
        console.log(`🪶 Spider ${spider.id} levitated!`);
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
        console.log(`❄️ Spider ${spider.id} frozen for 10 damage!`);
      }
      break;

    case "incendio":
      const incendioDamage = Math.floor(15 * powerMultiplier);
      if (spider.currentHealth > 0) {
        damageSpider(spider, incendioDamage, activeTimeouts, () => {
          console.log("🎉 VICTORY! Spider defeated!");
        });
        setSpiderOnFire(spider, 5000);
        console.log(
          `🔥 Spider ${spider.id} burned for ${incendioDamage} damage and set on fire!`
        );
      }
      break;

    case "bombarda":
      if (spider.currentHealth > 0) {
        damageSpider(spider, 20, activeTimeouts, () => {
          console.log("🎉 VICTORY! Spider defeated!");
        });
        console.log(`💥 Spider ${spider.id} exploded for 20 damage!`);
      }
      break;

    case "depulso":
      const depulsoDamage = Math.floor(15 * powerMultiplier);
      if (spider.currentHealth > 0) {
        damageSpider(spider, depulsoDamage, activeTimeouts, () => {
          console.log("🎉 VICTORY! Spider defeated!");
        });
        console.log(
          `🪨 Spider ${spider.id} hit by force for ${depulsoDamage} damage!`
        );
      }
      break;
  }
}

// Draw spider function
export function drawSpider(spider: Spider, ctx: CanvasRenderingContext2D) {
  if (spider.state === "dead") {
    drawDeadEnemy(spider, ctx, "20px");
    return;
  }

  // Create spider image if it doesn't exist
  if (!(window as any).spiderImage) {
    (window as any).spiderImage = new Image();
    (window as any).spiderImage.src = "/assets/enemies/spider_normal.png";
  }

  const spiderImage = (window as any).spiderImage;

  // Draw the spider image with proper aspect ratio
  if (spiderImage.complete) {
    // Calculate aspect ratio-preserving dimensions
    const originalAspectRatio = 40 / 30; // Original spider dimensions
    const targetWidth = spider.width;
    const targetHeight = spider.height;

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
    const offsetX = spider.x + (targetWidth - drawWidth) / 2;
    const offsetY = spider.y + (targetHeight - drawHeight) / 2;

    ctx.drawImage(
      spiderImage,
      offsetX + spider.attackOffset,
      offsetY,
      drawWidth,
      drawHeight
    );
  }

  // Fire indicator
  if (spider.isOnFire) {
    ctx.fillStyle = "#ff6600";
    ctx.font = "16px Arial";
    ctx.fillText("🔥", spider.x + spider.width + 10, spider.y + 10);
  }
}

// Re-export Player interface and functions for backward compatibility
export type { Player };
export { damagePlayer, applyPoisonToPlayer, immobilizePlayer, protectPlayer };
