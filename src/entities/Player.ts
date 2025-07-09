// Player System for Hackwarts
// Centralized player interface and common functions

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  maxHealth: number;
  currentHealth: number;
  maxMagic: number;
  currentMagic: number;
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
  isSilenced?: boolean;
  silenceEndTime?: number;
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

export function increaseMagic(player: Player, amount: number) {
  player.currentMagic = Math.min(player.maxMagic, player.currentMagic + amount);
  console.log(
    `✨ Player magic increased by ${amount}! Current: ${player.currentMagic}/${player.maxMagic}`
  );
}

export function consumeAllMagic(player: Player) {
  player.currentMagic = 0;
  console.log(
    `💀 Player used ultimate spell! Magic consumed: 0/${player.maxMagic}`
  );
}

export function damagePlayer(
  player: Player,
  damage: number,
  activeTimeouts: NodeJS.Timeout[],
  onGameOver: () => void,
  onShakeTrigger?: () => void
) {
  if (player.isProtected) {
    return;
  }

  player.currentHealth = Math.max(0, player.currentHealth - damage);

  // Trigger shake effect when damage is dealt
  if (onShakeTrigger) {
    onShakeTrigger();
  }

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
