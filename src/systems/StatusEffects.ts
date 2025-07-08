// Player Status Effects System for Hackwarts
import { Player, damagePlayer } from "../entities/Player.js";

export class StatusEffectsSystem {
  public updatePlayerStatusEffects(
    player: Player,
    activeTimeouts: NodeJS.Timeout[],
    onGameOver: () => void
  ): void {
    const now = Date.now();

    // Handle poison damage
    if (player.isPoisoned) {
      if (now >= player.poisonEndTime) {
        player.isPoisoned = false;
        player.poisonDamage = 0;
        console.log("🐍 Player poison effect ended");
      } else if (now >= player.lastPoisonTick + 1000) {
        // Deal poison damage every second
        damagePlayer(player, player.poisonDamage, activeTimeouts, onGameOver);
        player.lastPoisonTick = now;
        console.log(`🐍 Player takes ${player.poisonDamage} poison damage`);
      }
    }

    // Handle immobilization
    if (player.isImmobilized && now >= player.immobilizedEndTime) {
      player.isImmobilized = false;
      console.log("🕸️ Player immobilization ended");
    }

    // Handle protection
    if (player.isProtected && now >= player.protectionEndTime) {
      player.isProtected = false;
      console.log("🛡️ Player protection ended");
    }

    // Handle silence
    if (player.isSilenced && now >= (player.silenceEndTime || 0)) {
      player.isSilenced = false;
      player.silenceEndTime = 0;
      console.log("🔇 Player silence ended");
    }
  }
}
