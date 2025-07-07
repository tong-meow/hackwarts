// Get canvas and context
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (!ctx) {
  throw new Error("Could not get canvas context");
}

// Simple game object
interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  velocityX: number;
  velocityY: number;
}

// Create a simple bouncing rectangle
const player: GameObject = {
  x: canvas.width / 2 - 25,
  y: canvas.height / 2 - 25,
  width: 50,
  height: 50,
  color: "#4a90e2",
  velocityX: 2,
  velocityY: 1.5,
};

// Game loop
function gameLoop() {
  // Clear canvas
  ctx!.clearRect(0, 0, canvas.width, canvas.height);

  // Update player position
  player.x += player.velocityX;
  player.y += player.velocityY;

  // Bounce off walls
  if (player.x <= 0 || player.x + player.width >= canvas.width) {
    player.velocityX = -player.velocityX;
  }
  if (player.y <= 0 || player.y + player.height >= canvas.height) {
    player.velocityY = -player.velocityY;
  }

  // Keep player in bounds
  player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
  player.y = Math.max(0, Math.min(player.y, canvas.height - player.height));

  // Draw player
  ctx!.fillStyle = player.color;
  ctx!.fillRect(player.x, player.y, player.width, player.height);

  // Continue the game loop
  requestAnimationFrame(gameLoop);
}

// Start the game
console.log("Starting Hackwarts game...");
gameLoop();
