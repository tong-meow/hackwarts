// Game UI System for Hackwarts

export interface SpellInfo {
  name: string;
  icon: string;
  description: string;
}

export class GameUI {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lastSpoken = "";
  private lastRecognizedSpell = "";
  private microphonePermission = false;
  private allSpeechHistory: string[] = []; // Store all speech for debugging

  private spells: SpellInfo[] = [
    { name: "expelliarmus", icon: "✨", description: "Disarm & knockback" },
    { name: "protego", icon: "🛡️", description: "Shield protection" },
    { name: "glacius", icon: "❄️", description: "Ice damage & freeze" },
    { name: "incendio", icon: "🔥", description: "Fire damage & burn" },
    { name: "bombarda", icon: "💥", description: "Explosive damage" },
    { name: "depulso", icon: "🪨", description: "Force push" },
    {
      icon: "💀",
      name: "avada kedavra",
      description: "Ultimate death curse (160 MP)",
    },
  ];

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  public drawDebugSpeechDisplay() {
    const debugX = this.canvas.width / 2 - 300;
    const debugY = 250;
    const debugWidth = 600;
    const debugHeight = 200;

    // Debug background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    this.ctx.fillRect(debugX, debugY, debugWidth, debugHeight);

    // Debug border
    this.ctx.strokeStyle = "#ff6b6b";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(debugX, debugY, debugWidth, debugHeight);

    // Title
    this.ctx.fillStyle = "#ff6b6b";
    this.ctx.font = "bold 18px Arial";
    this.ctx.fillText("🎙️ ALWAYS-LISTENING MAGIC", debugX + 10, debugY + 25);

    // Current listening status
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "16px Arial";
    this.ctx.fillText("Status: 🎤 ALWAYS LISTENING", debugX + 10, debugY + 50);

    // Last spoken (most recent)
    if (this.lastSpoken) {
      this.ctx.fillStyle = "#4ecdc4";
      this.ctx.font = "bold 14px Arial";
      this.ctx.fillText("LAST DETECTED:", debugX + 10, debugY + 80);

      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "16px Arial";
      // Wrap text if too long
      const maxWidth = debugWidth - 20;
      const words = this.lastSpoken.split(" ");
      let line = "";
      let y = debugY + 100;

      for (const word of words) {
        const testLine = line + word + " ";
        const metrics = this.ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== "") {
          this.ctx.fillText(line, debugX + 10, y);
          line = word + " ";
          y += 20;
        } else {
          line = testLine;
        }
      }
      this.ctx.fillText(line, debugX + 10, y);
    }

    // Speech history (last 3 items)
    this.ctx.fillStyle = "#95a5a6";
    this.ctx.font = "12px Arial";
    this.ctx.fillText("RECENT SPEECH HISTORY:", debugX + 10, debugY + 140);

    const recentHistory = this.allSpeechHistory.slice(-3);
    recentHistory.forEach((speech, index) => {
      const truncated =
        speech.length > 60 ? speech.substring(0, 60) + "..." : speech;
      this.ctx.fillText(
        `${index + 1}. ${truncated}`,
        debugX + 10,
        debugY + 160 + index * 15
      );
    });

    // Spell match indicator
    if (this.lastRecognizedSpell) {
      this.ctx.fillStyle = "#2ecc71";
      this.ctx.font = "bold 14px Arial";
      this.ctx.fillText(
        `✅ SPELL MATCHED: ${this.lastRecognizedSpell.toUpperCase()}`,
        debugX + 300,
        debugY + 80
      );
    } else if (this.lastSpoken) {
      this.ctx.fillStyle = "#e74c3c";
      this.ctx.font = "bold 14px Arial";
      this.ctx.fillText("❌ NO SPELL MATCH", debugX + 300, debugY + 80);
    }
  }

  public drawSpellbook() {
    // Position at bottom left, smaller size
    const spellbookX = 20;
    const spellbookY = this.canvas.height - 180; // Near bottom
    const spellWidth = 140; // Smaller width
    const spellHeight = 20; // Smaller height per spell

    // Spellbook background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(
      spellbookX - 8,
      spellbookY - 8,
      spellWidth + 16,
      (spellHeight + 3) * this.spells.length + 20
    );

    // Spellbook border
    this.ctx.strokeStyle = "#4a90e2";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      spellbookX - 8,
      spellbookY - 8,
      spellWidth + 16,
      (spellHeight + 3) * this.spells.length + 20
    );

    // Title - smaller
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 12px Arial";
    this.ctx.fillText("Spellbook", spellbookX, spellbookY - 12);

    // Draw each spell - more compact
    this.spells.forEach((spell, index) => {
      const y = spellbookY + index * (spellHeight + 3);

      // Highlight if it's the last recognized spell
      if (spell.name === this.lastRecognizedSpell) {
        this.ctx.fillStyle = "rgba(74, 144, 226, 0.3)";
        this.ctx.fillRect(spellbookX - 4, y - 3, spellWidth + 8, spellHeight);
      }

      // Spell icon - smaller
      this.ctx.font = "14px Arial";
      this.ctx.fillText(spell.icon, spellbookX, y + 12);

      // Spell name - smaller
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 9px Arial";
      this.ctx.fillText(spell.name.toUpperCase(), spellbookX + 20, y + 8);

      // Spell description - smaller
      this.ctx.fillStyle = "#cccccc";
      this.ctx.font = "8px Arial";
      this.ctx.fillText(spell.description, spellbookX + 20, y + 16);
    });
  }

  public drawInstructions() {
    // Only show microphone permission error if needed
    if (!this.microphonePermission) {
      const promptX = this.canvas.width / 2 - 250;
      const promptY = this.canvas.height - 60;

      this.ctx.fillStyle = "rgba(231, 76, 60, 0.8)";
      this.ctx.fillRect(promptX, promptY, 500, 40);

      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 14px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "⚠️ Microphone permission required for always-listening magic",
        this.canvas.width / 2,
        promptY + 25
      );
      this.ctx.textAlign = "left";
    }
  }

  // Update methods - remove setListening since we're always listening
  public setLastSpoken(text: string) {
    this.lastSpoken = text;
    // Add to history
    this.allSpeechHistory.push(text);
    // Keep only last 10 items
    if (this.allSpeechHistory.length > 10) {
      this.allSpeechHistory.shift();
    }
  }

  public setLastRecognizedSpell(spell: string) {
    this.lastRecognizedSpell = spell;
    // Clear after 3 seconds
    setTimeout(() => {
      if (this.lastRecognizedSpell === spell) {
        this.lastRecognizedSpell = "";
      }
    }, 3000);
  }

  public setMicrophonePermission(hasPermission: boolean) {
    this.microphonePermission = hasPermission;
  }

  public getSpells(): SpellInfo[] {
    return this.spells;
  }
}
