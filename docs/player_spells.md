# 🧙 Hackwarts Spell Interaction

## Requirements

- Are iconic and memorable (fans likely know how to pronounce them)
- Have distinctive effects that map clearly to game actions
- Are voice-friendly (e.g., phonetic clarity, not too long or obscure)

## Player Spells Table

| **Spell**        | **Enemy Status**                  | **Effect**                                                 |
| ---------------- | --------------------------------- | ---------------------------------------------------------- |
| **Expelliarmus** | **Casting spell**                 | Interrupts cast, stuns briefly                             |
|                  | **Idle / Not casting**            | Weak knockback, minor damage                               |
|                  | **Stunned / Controlled**          | Bounces enemy away → breaks your control effect            |
| **Levicorpus**   | **Casting spell**                 | Lifts enemy → cancels their cast + disables for 2s         |
|                  | **Idle / Not casting**            | Suspends enemy in air, allowing safe follow-up attacks     |
|                  | **Midair / Already lifted**       | Has no effect                                              |
| **Protego**      | **Enemy attacking**               | Blocks incoming basic spell damage                         |
|                  | **Enemy idle**                    | No effect                                                  |
|                  | **Enemy charging special attack** | Blocks partially; some damage taken                        |
| **Glacius**      | **Enemy casting fire attack**     | Freezes and cancels fire attack → reflect or cancel damage |
|                  | **Idle or casting other spells**  | Slows enemy movement + minor damage                        |
|                  | **Already frozen**                | Deals shatter damage                                       |
| **Incendio**     | **Idle / Open to attack**         | Applies burn (DoT effect over 3s)                          |
|                  | **Frozen enemy**                  | Instantly melts freeze + causes “steam stun”               |
|                  | **Enemy shielded (Protego)**      | Reduced effect; minor splash damage                        |
| **Bombarda**     | **Group of enemies**              | AoE damage + knockback; strong when clustered              |
|                  | **Single enemy**                  | Moderate direct damage + small AoE                         |
|                  | **Enemy airborne**                | Explodes mid-air → double damage                           |
| **Depulso**      | **Idle or exposed**               | Throws stone → quick, low damage (basic attack)            |
|                  | **Casting**                       | Can interrupt weak enemies (e.g., goblins)                 |
|                  | **Stunned / Frozen**              | Slight bonus damage                                        |
|                  | **Shielded (Protego)**            | Reflects or deflects harmlessly                            |

---

### 💡 Usage Notes:

- This table encourages **tactical spell choice** based on what the enemy is doing.
- **Simple rules, deep combos**: Players are rewarded for reading behavior, not memorizing counters.
- **Great for onboarding**: All spells are **canon**, easy to pronounce, and recognizable for fans.
