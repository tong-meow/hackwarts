// Hackwarts: Always Listening Magic Game
// Refactored main entry point using the new modular architecture

import { GameEngine } from "./core/GameEngine.js";

// Get canvas and context
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (!ctx) {
  throw new Error("Could not get canvas context");
}

// Initialize and start the game engine
const gameEngine = new GameEngine(canvas, ctx);
gameEngine.start();

console.log("🧙‍♂️ Hackwarts game initialized with modular architecture!");
