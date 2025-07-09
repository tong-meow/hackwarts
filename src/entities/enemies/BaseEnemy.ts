export interface BaseEnemyState {
  id: string;
  type: "spider" | "troll" | "dementor";
  position: { x: number; y: number };
  maxHealth: number;
  currentHealth: number;
  state: "idle" | "casting" | "stunned" | "dead" | "shadowphase";
  stunEndTime: number;
  skillCastStartTime: number;
  skillCastDuration: number;
  currentSkill: string;
  damageDealt: number;
}

export function createBaseEnemy(
  id: string,
  type: "spider" | "troll" | "dementor",
  position: { x: number; y: number },
  maxHealth: number
): BaseEnemyState {
  return {
    id,
    type,
    position,
    maxHealth,
    currentHealth: maxHealth,
    state: "idle",
    stunEndTime: 0,
    skillCastStartTime: 0,
    skillCastDuration: 0,
    currentSkill: "",
    damageDealt: 0,
  };
}

export function isEnemyReadyToAct(enemy: BaseEnemyState): boolean {
  return enemy.state === "idle" || enemy.state === "shadowphase";
}

export function shouldStartCasting(enemy: BaseEnemyState): boolean {
  return enemy.state === "idle";
}
