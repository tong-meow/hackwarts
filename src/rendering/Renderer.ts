// Centralized Rendering System for Hackwarts
import { Player } from "../entities/Player.js";
import { Spider, drawSpider } from "../entities/enemies/Spider.js";
import { Troll, drawTroll } from "../entities/enemies/Troll.js";
import { SoulSucker, drawSoulSucker } from "../entities/enemies/SoulSucker.js";

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private spiderDecorationElement: HTMLImageElement | null = null;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.initializeSpiderDecoration();
  }

  private initializeSpiderDecoration(): void {
    this.spiderDecorationElement = new Image();
    this.spiderDecorationElement.src = "/assets/background/spider_decor.svg";
    this.spiderDecorationElement.style.position = "absolute";
    this.spiderDecorationElement.style.top = "0";
    this.spiderDecorationElement.style.left = "0";
    this.spiderDecorationElement.style.width = "100%";
    this.spiderDecorationElement.style.height = "100%";
    this.spiderDecorationElement.style.pointerEvents = "none";
    this.spiderDecorationElement.style.zIndex = "-1";
  }

  public showSpiderDecoration(): void {
    if (
      this.spiderDecorationElement &&
      !document.body.contains(this.spiderDecorationElement)
    ) {
      document.body.appendChild(this.spiderDecorationElement);
    }
    if (this.spiderDecorationElement) {
      this.spiderDecorationElement.style.display = "block";
    }
  }

  public hideSpiderDecoration(): void {
    if (this.spiderDecorationElement) {
      this.spiderDecorationElement.style.display = "none";
    }
  }

  public clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public drawPlayer(player: Player): void {
    // Main body
    this.ctx.fillStyle = player.color;
    this.ctx.fillRect(player.x, player.y, player.width, player.height);

    // Simple head
    this.ctx.fillStyle = "#fdbcb4";
    this.ctx.fillRect(player.x + 10, player.y - 20, 40, 30);

    // Eyes
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(player.x + 18, player.y - 12, 4, 4);
    this.ctx.fillRect(player.x + 38, player.y - 12, 4, 4);

    // Mouth
    this.ctx.fillRect(player.x + 25, player.y - 5, 10, 2);

    // Arms
    this.ctx.fillStyle = player.color;
    this.ctx.fillRect(player.x - 20, player.y + 40, 20, 40);
    this.ctx.fillRect(player.x + player.width, player.y + 40, 20, 40);

    // Legs
    this.ctx.fillRect(player.x + 10, player.y + player.height, 20, 40);
    this.ctx.fillRect(player.x + 30, player.y + player.height, 20, 40);

    // Wand
    this.ctx.fillStyle = "#8B4513";
    this.ctx.fillRect(player.x + player.width + 20, player.y + 50, 2, 20);

    // Wand tip
    this.ctx.fillStyle = "#FFD700";
    this.ctx.fillRect(player.x + player.width + 19, player.y + 48, 4, 4);
  }

  public drawCollageHealthBar(
    character: Player | Spider | Troll | SoulSucker,
    x: number,
    y: number,
    label: string,
    align: "left" | "right" = "left"
  ): void {
    // Determine bar width based on character type
    let barWidth = 500; // Default for player and Troll (increased from 400)
    if ("type" in character) {
      if (character.type === "spider") {
        barWidth = 350; // Spider: 40 HP = 350px bar (increased from 280)
      } else if (character.type === "soulsucker") {
        barWidth = 600; // Soul Sucker: 150 HP = 600px bar (increased from 500)
      }
    }

    const barHeight = 25; // Increased from 20
    const healthPercentage = character.currentHealth / character.maxHealth;

    // Calculate the new width based on health percentage
    const newBarWidth = barWidth * healthPercentage;

    // Adjust position for right alignment
    if (align === "right") {
      x = this.canvas.width - barWidth - 50; // Align to the right with a 50px gap
    }

    // Background bar with paper texture
    const paperTextureElement = document.getElementById(
      "paperTexture"
    ) as HTMLImageElement;
    if (paperTextureElement) {
      const paperTexture = this.ctx.createPattern(
        paperTextureElement,
        "repeat"
      );
      if (paperTexture) {
        this.ctx.fillStyle = paperTexture;
        this.ctx.fillRect(x, y, barWidth, barHeight);
      }
    }

    // Health bar with red color scheme and irregular edges
    this.ctx.fillStyle = "#e74c3c"; // Red
    this.ctx.beginPath();
    if (align === "left") {
      this.ctx.moveTo(x, y);
      for (let i = 0; i < newBarWidth; i += 10) {
        const offset = Math.random() * 2 - 1; // More pronounced movement
        this.ctx.lineTo(x + i, y + offset);
      }
      this.ctx.lineTo(x + newBarWidth, y + barHeight);
      for (let i = newBarWidth; i > 0; i -= 10) {
        const offset = Math.random() * 2 - 1; // More pronounced movement
        this.ctx.lineTo(x + i, y + barHeight + offset);
      }
      this.ctx.lineTo(x, y + barHeight);
    } else {
      // Mirror for right alignment
      this.ctx.moveTo(x + barWidth, y);
      for (let i = 0; i < newBarWidth; i += 10) {
        const offset = Math.random() * 2 - 1; // More pronounced movement
        this.ctx.lineTo(x + barWidth - i, y + offset);
      }
      this.ctx.lineTo(x + barWidth - newBarWidth, y + barHeight);
      for (let i = newBarWidth; i > 0; i -= 10) {
        const offset = Math.random() * 2 - 1; // More pronounced movement
        this.ctx.lineTo(x + barWidth - i, y + barHeight + offset);
      }
      this.ctx.lineTo(x + barWidth, y + barHeight);
    }
    this.ctx.closePath();
    this.ctx.fill();

    // Irregular white border with animation
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    if (align === "left") {
      // Top edge with animation (irregular)
      this.ctx.moveTo(x, y);
      for (let i = 0; i < barWidth; i += 10) {
        const offset = Math.random() * 2 - 1; // More pronounced movement
        this.ctx.lineTo(x + i, y + offset);
      }
      // Right edge (straight line to bottom)
      this.ctx.lineTo(x + barWidth, y + barHeight);
      // Bottom edge with animation (irregular)
      for (let i = barWidth; i > 0; i -= 10) {
        const offset = Math.random() * 2 - 1; // More pronounced movement
        this.ctx.lineTo(x + i, y + barHeight + offset);
      }
      // Left edge (straight line back to start)
      this.ctx.lineTo(x, y + barHeight);
    } else {
      // Mirror for right alignment
      // Top edge with animation (irregular)
      this.ctx.moveTo(x + barWidth, y);
      for (let i = 0; i < barWidth; i += 10) {
        const offset = Math.random() * 2 - 1; // More pronounced movement
        this.ctx.lineTo(x + barWidth - i, y + offset);
      }
      // Left edge (straight line to bottom)
      this.ctx.lineTo(x, y + barHeight);
      // Bottom edge with animation (irregular)
      for (let i = 0; i < barWidth; i += 10) {
        const offset = Math.random() * 2 - 1; // More pronounced movement
        this.ctx.lineTo(x + i, y + barHeight + offset);
      }
      // Right edge (straight line back to start)
      this.ctx.lineTo(x + barWidth, y + barHeight);
    }
    this.ctx.closePath();
    this.ctx.stroke();

    // Label and health text
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 18px Arial";
    this.ctx.fillText(label, x, y - 10);

    // Show current/max health with color coding - centered inside the bar
    this.ctx.fillStyle = character.currentHealth <= 0 ? "#e74c3c" : "#ffffff";
    this.ctx.font = "bold 16px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `${character.currentHealth}/${character.maxHealth}`,
      x + barWidth / 2,
      y + 18
    );
    this.ctx.textAlign = "left"; // Reset text alignment
  }

  public drawEnemyCastingBar(
    enemy: Spider | Troll | SoulSucker,
    x: number,
    y: number
  ): void {
    if (enemy.state !== "casting" || !enemy.currentSkill) return;

    const now = Date.now();
    const progress = Math.min(
      (now - enemy.skillCastStartTime) / enemy.skillCastDuration,
      1.0
    );

    const barWidth = 140;
    const barHeight = 8;

    // Progress bar background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(x, y, barWidth, barHeight);

    // Progress bar fill
    this.ctx.fillStyle = "#ff6600";
    this.ctx.fillRect(x, y, barWidth * progress, barHeight);

    // Progress bar border
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, barWidth, barHeight);

    // Skill name
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 12px Arial";
    this.ctx.textAlign = "center";

    // Format skill name nicely
    let skillName = enemy.currentSkill;
    if (skillName === "web") skillName = "Entangling Web";
    else if (skillName === "venom") skillName = "Venom Spit";
    else if (skillName === "rockthrow") skillName = "Rock Throw";
    else if (skillName === "chunkarmor") skillName = "Chunk Armor";
    else if (skillName === "stomp") skillName = "Stomp";
    else if (skillName === "souldrain") skillName = "Soul Drain";
    else if (skillName === "silenceshriek") skillName = "Silence Shriek";
    else skillName = skillName.charAt(0).toUpperCase() + skillName.slice(1);

    this.ctx.fillText(skillName, x + barWidth / 2, y - 5);
    this.ctx.textAlign = "left";

    // Casting time remaining
    const remaining = Math.max(
      0,
      enemy.skillCastDuration - (now - enemy.skillCastStartTime)
    );
    const remainingSeconds = Math.ceil(remaining / 1000);
    this.ctx.fillStyle = "#ffff00";
    this.ctx.font = "10px Arial";
    this.ctx.fillText(`${remainingSeconds}s`, x + barWidth + 5, y + 6);
  }

  public drawEnhancedStatusEffects(
    player: Player,
    spider: Spider | null,
    troll: Troll | null,
    soulSucker: SoulSucker | null
  ): void {
    // Player status effects (below player health bar)
    const playerStatusX = 50;
    const playerStatusY = 50 + 25 + 10; // health bar y + new height + spacing
    let currentY = playerStatusY;

    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 14px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText("Player Status:", playerStatusX, currentY);
    currentY += 20;

    let hasPlayerStatus = false;

    if (player.isImmobilized && Date.now() < player.immobilizedEndTime) {
      const remaining = Math.ceil(
        (player.immobilizedEndTime - Date.now()) / 1000
      );
      this.ctx.fillStyle = "#ff6600";
      this.ctx.font = "12px Arial";
      this.ctx.fillText(
        `🕸️ Immobilized (${remaining}s)`,
        playerStatusX,
        currentY
      );
      currentY += 16;
      hasPlayerStatus = true;
    }

    if (player.isPoisoned && Date.now() < player.poisonEndTime) {
      const remaining = Math.ceil((player.poisonEndTime - Date.now()) / 1000);
      this.ctx.fillStyle = "#00ff00";
      this.ctx.font = "12px Arial";
      this.ctx.fillText(`🐍 Poisoned (${remaining}s)`, playerStatusX, currentY);
      currentY += 16;
      hasPlayerStatus = true;
    }

    if (player.isProtected && Date.now() < player.protectionEndTime) {
      const remaining = Math.ceil(
        (player.protectionEndTime - Date.now()) / 1000
      );
      this.ctx.fillStyle = "#4a90e2";
      this.ctx.font = "12px Arial";
      this.ctx.fillText(
        `🛡️ Protected (${remaining}s)`,
        playerStatusX,
        currentY
      );
      currentY += 16;
      hasPlayerStatus = true;
    }

    if (player.isSilenced && Date.now() < (player.silenceEndTime || 0)) {
      const remaining = Math.ceil(
        ((player.silenceEndTime || 0) - Date.now()) / 1000
      );
      this.ctx.fillStyle = "#8A2BE2";
      this.ctx.font = "12px Arial";
      this.ctx.fillText(`🔇 Silenced (${remaining}s)`, playerStatusX, currentY);
      currentY += 16;
      hasPlayerStatus = true;
    }

    if (!hasPlayerStatus) {
      this.ctx.fillStyle = "#cccccc";
      this.ctx.font = "12px Arial";
      this.ctx.fillText("Normal", playerStatusX, currentY);
    }

    // Enemy status effects (below enemy health bar)
    const enemy = spider || troll || soulSucker;
    if (enemy) {
      const enemyStatusX = this.canvas.width - 250;
      const enemyStatusY = 50 + 25 + 10; // health bar y + new height + spacing
      let enemyY = enemyStatusY;

      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 14px Arial";
      this.ctx.textAlign = "left";
      this.ctx.fillText("Enemy Status:", enemyStatusX, enemyY);
      enemyY += 20;

      let hasEnemyStatus = false;

      if (enemy.state === "stunned" && Date.now() < enemy.stunEndTime) {
        const remaining = Math.ceil((enemy.stunEndTime - Date.now()) / 1000);
        this.ctx.fillStyle = "#ffff00";
        this.ctx.font = "12px Arial";
        this.ctx.fillText(`💫 Stunned (${remaining}s)`, enemyStatusX, enemyY);
        enemyY += 16;
        hasEnemyStatus = true;
      }

      if (enemy.state === "levitating" && Date.now() < enemy.levitateEndTime) {
        const remaining = Math.ceil(
          (enemy.levitateEndTime - Date.now()) / 1000
        );
        this.ctx.fillStyle = "#00ffff";
        this.ctx.font = "12px Arial";
        this.ctx.fillText(
          `🪶 Levitating (${remaining}s)`,
          enemyStatusX,
          enemyY
        );
        enemyY += 16;
        hasEnemyStatus = true;
      }

      // Spider-specific status
      if (spider && spider.isOnFire && Date.now() < spider.fireEndTime) {
        const remaining = Math.ceil((spider.fireEndTime - Date.now()) / 1000);
        this.ctx.fillStyle = "#ff6600";
        this.ctx.font = "12px Arial";
        this.ctx.fillText(`🔥 On Fire (${remaining}s)`, enemyStatusX, enemyY);
        enemyY += 16;
        hasEnemyStatus = true;
      }

      // Troll-specific status
      if (
        troll &&
        troll.hasChunkArmor &&
        Date.now() < troll.chunkArmorEndTime
      ) {
        const remaining = Math.ceil(
          (troll.chunkArmorEndTime - Date.now()) / 1000
        );
        this.ctx.fillStyle = "#8B4513";
        this.ctx.font = "12px Arial";
        this.ctx.fillText(
          `🛡️ Chunk Armor (${remaining}s)`,
          enemyStatusX,
          enemyY
        );
        enemyY += 16;
        hasEnemyStatus = true;
      }

      // Soul Sucker-specific status
      if (soulSucker && soulSucker.state === "shadowphase") {
        this.ctx.fillStyle = "#8A2BE2";
        this.ctx.font = "12px Arial";
        this.ctx.fillText(`🌑 Shadow Phase`, enemyStatusX, enemyY);
        enemyY += 16;
        hasEnemyStatus = true;
      }

      if (!hasEnemyStatus) {
        this.ctx.fillStyle = "#cccccc";
        this.ctx.font = "12px Arial";
        this.ctx.fillText("Normal", enemyStatusX, enemyY);
      }
    }

    this.ctx.textAlign = "left";
  }

  public drawSkipButton(skipButton: {
    x: number;
    y: number;
    width: number;
    height: number;
    isHovered: boolean;
  }): void {
    // Skip button background
    this.ctx.fillStyle = skipButton.isHovered ? "#ff6b6b" : "#ff8c8c";
    this.ctx.fillRect(
      skipButton.x,
      skipButton.y,
      skipButton.width,
      skipButton.height
    );

    // Skip button border
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      skipButton.x,
      skipButton.y,
      skipButton.width,
      skipButton.height
    );

    // Skip button text
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 14px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "Skip",
      skipButton.x + skipButton.width / 2,
      skipButton.y + skipButton.height / 2 + 5
    );
    this.ctx.textAlign = "left";
  }

  public drawGameMessages(
    gameWon: boolean,
    gameOver: boolean,
    currentEnemyType: string,
    spellCastCount: number,
    lastSpellCast: string | null
  ): void {
    if (gameWon) {
      // Victory message
      this.ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
      this.ctx.fillRect(
        this.canvas.width / 2 - 200,
        this.canvas.height / 2 - 100,
        400,
        200
      );

      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 48px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "🎉 VICTORY! 🎉",
        this.canvas.width / 2,
        this.canvas.height / 2 - 30
      );

      this.ctx.font = "bold 24px Arial";
      this.ctx.fillText(
        "You've mastered the magical arts!",
        this.canvas.width / 2,
        this.canvas.height / 2 + 20
      );

      this.ctx.font = "18px Arial";
      this.ctx.fillText(
        "All enemies have been defeated!",
        this.canvas.width / 2,
        this.canvas.height / 2 + 60
      );

      this.ctx.textAlign = "left";
    } else if (gameOver) {
      // Game over message
      this.ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
      this.ctx.fillRect(
        this.canvas.width / 2 - 200,
        this.canvas.height / 2 - 100,
        400,
        200
      );

      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 48px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "💀 GAME OVER 💀",
        this.canvas.width / 2,
        this.canvas.height / 2 - 30
      );

      this.ctx.font = "bold 24px Arial";
      this.ctx.fillText(
        "Your magical journey ends here.",
        this.canvas.width / 2,
        this.canvas.height / 2 + 20
      );

      this.ctx.font = "18px Arial";
      this.ctx.fillText(
        "Speak clearly and cast spells to try again!",
        this.canvas.width / 2,
        this.canvas.height / 2 + 60
      );

      this.ctx.textAlign = "left";
    } else {
      // Last spell cast display
      if (lastSpellCast) {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "16px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText(
          `Last Spell: ${lastSpellCast.toUpperCase()}`,
          this.canvas.width / 2,
          this.canvas.height - 40
        );
        this.ctx.textAlign = "left";
      }
    }
  }

  public drawSpiderDecoration(): void {
    // This method is now handled by the DOM overlay
    // The actual spider decoration is managed by showSpiderDecoration/hideSpiderDecoration
  }

  public drawCurrentEnemy(
    spider: Spider | null,
    troll: Troll | null,
    soulSucker: SoulSucker | null
  ): void {
    if (spider) {
      drawSpider(spider, this.ctx);
      // Draw casting bar for spider
      this.drawEnemyCastingBar(spider, spider.x - 10, spider.y - 40);
    } else if (troll) {
      drawTroll(troll, this.ctx);
      // Draw casting bar for troll
      this.drawEnemyCastingBar(troll, troll.x - 10, troll.y - 40);
    } else if (soulSucker) {
      drawSoulSucker(soulSucker, this.ctx);
      // Draw casting bar for soul sucker
      this.drawEnemyCastingBar(
        soulSucker,
        soulSucker.x - 10,
        soulSucker.y - 40
      );
    }
  }

  public drawHealthBars(
    player: Player,
    spider: Spider | null,
    troll: Troll | null,
    soulSucker: SoulSucker | null
  ): void {
    // Player health bar - top left
    this.drawCollageHealthBar(player, 50, 50, "Player", "left");

    // Enemy health bar - top right (aligned with same 50px margin)
    if (spider) {
      this.drawCollageHealthBar(
        spider,
        this.canvas.width - 250,
        50,
        "Spider",
        "right"
      );
    } else if (troll) {
      this.drawCollageHealthBar(
        troll,
        this.canvas.width - 250,
        50,
        "Troll",
        "right"
      );
    } else if (soulSucker) {
      this.drawCollageHealthBar(
        soulSucker,
        this.canvas.width - 250,
        50,
        "Soul Sucker",
        "right"
      );
    }
  }
}
