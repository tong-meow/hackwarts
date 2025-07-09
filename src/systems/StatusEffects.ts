// Player Status Effects System for Hackwarts
import { Player, damagePlayer } from "../entities/Player.js";

export class StatusEffectsSystem {
  public updatePlayerStatusEffects(
    player: Player,
    activeTimeouts: NodeJS.Timeout[],
    onGameOver: () => void,
    onShakeTrigger?: () => void
  ): void {
    // Update poison effects
    if (player.isPoisoned) {
      const now = Date.now();

      // Check if poison should end
      if (now >= player.poisonEndTime) {
        player.isPoisoned = false;
        player.poisonDamage = 0;
        console.log("🐍 Poison effect ended");
      } else {
        // Apply poison damage every second
        if (now >= player.lastPoisonTick + 1000) {
          damagePlayer(
            player,
            player.poisonDamage,
            activeTimeouts,
            onGameOver,
            onShakeTrigger
          );
          player.lastPoisonTick = now;
          console.log(`🐍 Poison damage: ${player.poisonDamage}`);
        }
      }
    }

    // Update immobilization effects
    if (player.isImmobilized) {
      const now = Date.now();
      if (now >= player.immobilizedEndTime) {
        player.isImmobilized = false;
        console.log("🕸️ Immobilization ended");
      }
    }

    // Update protection effects
    if (player.isProtected) {
      const now = Date.now();
      if (now >= player.protectionEndTime) {
        player.isProtected = false;
        console.log("🛡️ Protection ended");
      }
    }

    // Update silence effects
    if (player.isSilenced && player.silenceEndTime) {
      const now = Date.now();
      if (now >= player.silenceEndTime) {
        player.isSilenced = false;
        player.silenceEndTime = 0;
        console.log("🔇 Silence ended");
      }
    }
  }
}
