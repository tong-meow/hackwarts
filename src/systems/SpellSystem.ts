// Centralized Spell System for Hackwarts
import { Player } from "../entities/Player.js";
import { Spider, castSpellOnSpider } from "../entities/enemies/Spider.js";
import { Troll, castSpellOnTroll } from "../entities/enemies/Troll.js";
import {
  SoulSucker,
  castSpellOnSoulSucker,
} from "../entities/enemies/SoulSucker.js";

export class SpellSystem {
  private lastSpellCast: string | null = null;
  private spellCastCount: number = 0;

  public castSpell(
    spellName: string,
    confidence: number,
    player: Player,
    spider: Spider | null,
    troll: Troll | null,
    soulSucker: SoulSucker | null,
    activeTimeouts: NodeJS.Timeout[]
  ): void {
    // Check if player is silenced
    if (player.isSilenced && Date.now() < (player.silenceEndTime || 0)) {
      console.log(`🔇 Player is silenced! Cannot cast ${spellName}.`);
      return;
    }

    // Check if player is immobilized (can only cast protego)
    if (player.isImmobilized && spellName !== "protego") {
      if (Date.now() < player.immobilizedEndTime) {
        console.log(`🕸️ Player is immobilized! Can only cast Protego.`);
        return;
      }
    }

    this.lastSpellCast = spellName;
    this.spellCastCount++;

    console.log(
      `🪄 Casting ${spellName} with ${Math.round(
        confidence * 100
      )}% confidence!`
    );

    // Cast spell on current enemy
    if (spider && spider.state !== "dead") {
      castSpellOnSpider(spellName, confidence, spider, player, activeTimeouts);
    } else if (troll && troll.state !== "dead") {
      castSpellOnTroll(spellName, confidence, troll, player, activeTimeouts);
    } else if (soulSucker && soulSucker.state !== "dead") {
      castSpellOnSoulSucker(
        spellName,
        confidence,
        soulSucker,
        player,
        activeTimeouts
      );
    }
  }

  public createMagicalEffect(
    spellName: string,
    confidence: number,
    player: Player,
    activeTimeouts: NodeJS.Timeout[]
  ): void {
    // Player glows when casting spells
    const originalColor = player.color;
    const glowColors: { [key: string]: string } = {
      expelliarmus: "#ff6b6b",
      levicorpus: "#4ecdc4",
      protego: "#45b7d1",
      glacius: "#74b9ff",
      incendio: "#fd79a8",
      bombarda: "#fdcb6e",
      depulso: "#6c5ce7",
    };

    player.color = glowColors[spellName] || "#ffffff";
    const glowDuration = Math.floor(confidence * 1000); // Duration based on confidence

    const timeout = setTimeout(() => {
      player.color = originalColor;
    }, glowDuration);
    activeTimeouts.push(timeout);
  }

  public getLastSpellCast(): string | null {
    return this.lastSpellCast;
  }

  public getSpellCastCount(): number {
    return this.spellCastCount;
  }

  public resetStats(): void {
    this.lastSpellCast = null;
    this.spellCastCount = 0;
  }
}
