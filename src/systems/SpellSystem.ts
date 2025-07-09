// Centralized Spell System for Hackwarts
import { Player, consumeAllMagic } from "../entities/Player.js";
import { Spider, castSpellOnSpider } from "../entities/enemies/Spider.js";
import { Troll, castSpellOnTroll } from "../entities/enemies/Troll.js";
import { Dementor, castSpellOnDementor } from "../entities/enemies/Dementor.js";

export class SpellSystem {
  private lastSpellCast: string | null = null;
  private spellCastCount: number = 0;

  public castSpell(
    spellName: string,
    confidence: number,
    player: Player,
    spider: Spider | null,
    troll: Troll | null,
    dementor: Dementor | null,
    activeTimeouts: NodeJS.Timeout[]
  ): void {
    // Check if player is silenced
    if (player.isSilenced && Date.now() < (player.silenceEndTime || 0)) {
      console.log(`🔇 Player is silenced! Cannot cast ${spellName}.`);
      return;
    }

    // Check if avada kedavra requires full magic
    if (spellName === "avada kedavra") {
      if (player.currentMagic < player.maxMagic) {
        console.log(
          `💀 Avada Kedavra requires full magic! Current: ${player.currentMagic}/${player.maxMagic}`
        );
        return;
      }
      // Consume all magic when casting avada kedavra
      consumeAllMagic(player);
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
    } else if (dementor && dementor.state !== "dead") {
      castSpellOnDementor(
        spellName,
        confidence,
        dementor,
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
    // Create and display a magical effect element
    const effectElement = document.createElement("div");
    effectElement.textContent = `✨ ${spellName.toUpperCase()} ✨`;
    effectElement.style.position = "absolute";
    effectElement.style.left = `${player.x + player.width / 2}px`;
    effectElement.style.top = `${player.y - 50}px`;
    effectElement.style.color = "#FFD700";

    // Use confidence to affect font size and effect intensity
    const baseFontSize = 24;
    const fontSize = Math.floor(baseFontSize * (0.5 + confidence * 0.5)); // 12px to 24px based on confidence
    effectElement.style.fontSize = `${fontSize}px`;
    effectElement.style.fontWeight = "bold";
    effectElement.style.textShadow = "2px 2px 4px rgba(0,0,0,0.5)";
    effectElement.style.zIndex = "1000";
    effectElement.style.pointerEvents = "none";
    effectElement.style.opacity = "1";
    effectElement.style.transition = "all 2s ease-out";

    document.body.appendChild(effectElement);

    // Animate the effect
    setTimeout(() => {
      effectElement.style.transform = "translateY(-100px)";
      effectElement.style.opacity = "0";
    }, 100);

    // Use confidence to affect effect duration - higher confidence = longer display
    const baseDuration = 1500;
    const effectDuration = Math.floor(baseDuration * (0.7 + confidence * 0.6)); // 1050ms to 2100ms

    // Remove the element after animation
    const timeout = setTimeout(() => {
      if (document.body.contains(effectElement)) {
        document.body.removeChild(effectElement);
      }
    }, effectDuration);

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
