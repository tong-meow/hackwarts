// Base Enemy System for Hackwarts
// Common interfaces and functions shared by all enemies

export interface BaseEnemyState {
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
  state: "idle" | "casting" | "stunned" | "levitating" | "dead" | "shadowphase";
  currentSkill: string;
  skillCastStartTime: number;
  skillCastDuration: number;
  nextSkillTime: number;
  stunEndTime: number;
  levitateEndTime: number;
}

// Common enemy functions
export function createBaseEnemy(
  id: number,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  maxHealth: number
): BaseEnemyState {
  return {
    id,
    x,
    y,
    width,
    height,
    color,
    maxHealth,
    currentHealth: maxHealth,
    originalX: x,
    originalY: y,
    originalColor: color,

    state: "idle",
    currentSkill: "",
    skillCastStartTime: 0,
    skillCastDuration: 0,
    nextSkillTime: Date.now() + Math.random() * 3000 + 2000,
    stunEndTime: 0,
    levitateEndTime: 0,
  };
}

// Common status effect handling
export function handleStunEffect(enemy: BaseEnemyState, now: number): void {
  if (enemy.state === "stunned" && now >= enemy.stunEndTime) {
    enemy.state = "idle";
  }
}

export function handleLevitateEffect(enemy: BaseEnemyState, now: number): void {
  if (enemy.state === "levitating" && now >= enemy.levitateEndTime) {
    enemy.state = "idle";
  }
}

// Common visual damage feedback
export function applyDamageVisualFeedback(
  enemy: BaseEnemyState,
  activeTimeouts: NodeJS.Timeout[]
): void {
  const originalColor = enemy.color;
  enemy.color = "#ff0000";
  const timeout = setTimeout(() => {
    if (enemy.state !== "dead") {
      enemy.color = originalColor;
    }
  }, 300);
  activeTimeouts.push(timeout);
}

// Common status indicator drawing
export function drawStatusIndicators(
  enemy: BaseEnemyState,
  ctx: CanvasRenderingContext2D
): void {
  if (enemy.state === "casting") {
    ctx.fillStyle = "#ffff00";
    ctx.font = "20px Arial";
    ctx.fillText("⚡", enemy.x + enemy.width / 2 - 10, enemy.y - 15);
  }

  if (enemy.state === "stunned") {
    ctx.fillStyle = "#ffff00";
    ctx.font = "20px Arial";
    ctx.fillText("💫", enemy.x + enemy.width / 2 - 10, enemy.y - 15);
  }

  if (enemy.state === "levitating") {
    ctx.fillStyle = "#00ffff";
    ctx.font = "20px Arial";
    ctx.fillText("🪶", enemy.x + enemy.width / 2 - 10, enemy.y - 15);
  }
}

// Common dead enemy drawing
export function drawDeadEnemy(
  enemy: BaseEnemyState,
  ctx: CanvasRenderingContext2D,
  skullSize: string = "30px"
): void {
  ctx.fillStyle = "#444444";
  ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = `${skullSize} Arial`;
  ctx.textAlign = "center";
  ctx.fillText("💀", enemy.x + enemy.width / 2, enemy.y - 10);
  ctx.textAlign = "left";
}
