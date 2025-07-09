# 🐲 Enemy Design System

**Hackwarts** features a progressive 3-enemy battle system where each enemy introduces unique mechanics and challenges, requiring players to master different spell combinations and strategies.

---

## 🎮 Enemy Progression Overview

| Order | Enemy              | Difficulty | HP  | Role          | Key Mechanic                 |
| ----- | ------------------ | ---------- | --- | ------------- | ---------------------------- |
| 1st   | 🕷️ **Spider**      | Easy       | 40  | Fast Harasser | Web Trap + Venom Combo       |
| 2nd   | 🧌 **Troll**        | Medium     | 100 | Tank Dealer   | Armor + Reflectable Attacks  |
| 3rd   | 👻 **Soul Sucker** | Hard       | 150 | Dodge Tank    | Shadow Phase + Voice Silence |

---

## 🕷️ Spider - The Web Weaver

### Core Stats

- **HP**: 40
- **Difficulty**: Easy
- **Role**: Fast harasser with disabling attacks
- **Defeat Condition**: Take 40 total damage

### AI Behavior

- **Skill Rotation**: Web Trap → Venom Spit combo
- **Smart Combo System**:
  - Successful web → Immediate venom cast (1s delay)
  - Failed web → Normal cooldown (3-7s)
- **Interrupt Recovery**: Spell interruption resets combo state

### Unique Mechanics

- **Incendio Special**: Burns web, then kills spider after 2 seconds
- **Web Immobilization**: Player can't cast spells (except Protego) for 3 seconds
- **Poison DoT**: 5 damage per second for 4 seconds
- **Fire Vulnerability**: Extra death effect from fire spells

### Skills

#### 🕸️ Entangling Web

- **Cast Time**: 5 seconds
- **Effect**: Immobilizes player for 3 seconds
- **Blockable**: Yes (Protego)
- **Strategy**: Sets up venom combo

#### 🐍 Venom Spit

- **Cast Time**: 2 seconds
- **Effect**: 5 damage/sec poison for 4 seconds
- **Blockable**: Yes (Protego)
- **Special**: Frees player from web immobilization

### Spell Interactions

| Spell            | Idle State          | Casting State       | Stunned State       |
| ---------------- | ------------------- | ------------------- | ------------------- |
| **Expelliarmus** | Knockback + stun 2s | Interrupt + Stun 2s | Stun 2s + 5 damage  |
| **Protego**      | Player protected 5s | Player protected 5s | Player protected 5s |

---

## 🧌 Troll - The Armored Destroyer

### Core Stats

- **HP**: 100 (defeat at 100 total damage)
- **Difficulty**: Medium
- **Role**: High-damage tank with armor mechanics
- **Defeat Condition**: Take 100 total damage received

### AI Behavior

- **Defensive Priority**: 30% chance to cast Chunk Armor when not active
- **Mixed Assault**: Alternates between Rock Throw (40%) and Stomp (60%)
- **Armor Management**: Cannot recast armor while active (15s duration)

### Unique Mechanics

- **Chunk Armor**: Blocks all spell damage, removed by Incendio/Bombarda
- **Rock Throw Reflection**: Depulso during cast reflects damage back to troll
- **Stomp Penetration**: Protego reduces damage to 20 but doesn't fully block
- **Total Damage Tracking**: Defeat based on cumulative damage, not current HP

### Skills

#### 🪨 Rock Throw

- **Cast Time**: 4 seconds
- **Effect**: 30 damage to player
- **Counterable**: Yes (Depulso reflects back for 30 troll damage)
- **Blockable**: Yes (Protego)

#### 🛡️ Chunk Armor

- **Cast Time**: 1 second
- **Effect**: Blocks all attacks for 15 seconds
- **Removal**: Only Incendio or Bombarda can destroy
- **Strategy**: Forces players to use specific spells

#### 🦶 Stomp

- **Cast Time**: 5 seconds
- **Effect**: 40 damage (reduced to 20 by Protego)
- **Special**: Partially penetrates Protego shield
- **Area Effect**: Unavoidable ground slam

### Spell Interactions

| Spell            | No Armor                                         | With Chunk Armor          |
| ---------------- | ------------------------------------------------ | ------------------------- |
| **Expelliarmus** | Interrupt/Stun if casting, otherwise knockback   | Blocked completely        |
| **Protego**      | Player protected 5s                              | Player protected 5s       |
| **Glacius**      | 10 ice damage                                    | Blocked completely        |
| **Incendio**     | 10 fire damage                                   | Destroys armor, no damage |
| **Bombarda**     | 20 explosive damage                              | Destroys armor, no damage |
| **Depulso**      | 15-30 damage (confidence scaled) OR reflect rock | Blocked completely        |

---

## 👻 Soul Sucker - The Ethereal Nemesis

### Core Stats

- **HP**: 150
- **Difficulty**: Hard
- **Role**: Dodge tank requiring strategic stunning
- **Defeat Condition**: Take 150 total damage while stunned

### AI Behavior

- **Skill Rotation**: Alternates between Soul Drain and Silence Shriek
- **Defensive Priority**: Shadow Phase triggers on any damage spell
- **Vulnerability Window**: Only takes damage when stunned (4s from Expelliarmus)

### Unique Mechanics

- **Shadow Phase**: Automatically dodges all damage spells unless stunned
- **Damage Gate**: Can only be hurt while stunned - core strategic element
- **Soul Drain Healing**: Heals self while damaging player (60 HP total)
- **Voice Silencing**: Disables player's spell casting for 3 seconds
- **Stun Immunity**: Shadow Phase cannot activate while stunned

### Skills

#### 👻 Soul Drain

- **Cast Time**: 4 seconds
- **Effect**: Stuns player 4s + 15 damage/sec + heals self 15/sec
- **Total**: 60 damage to player, 60 healing to Soul Sucker
- **Blockable**: Yes (Protego)

#### 🔇 Silence Shriek

- **Cast Time**: 4 seconds
- **Effect**: Disables voice casting for 3 seconds
- **Blockable**: Yes (Protego)
- **Impact**: Player cannot cast any spells

### Spell Interactions

| Spell            | Idle/Shadow Phase        | Stunned State         | Casting State       |
| ---------------- | ------------------------ | --------------------- | ------------------- |
| **Expelliarmus** | Stun 4s (enables damage) | N/A (already stunned) | Cancel + Stun 4s    |
| **Protego**      | Player protected 5s      | Player protected 5s   | Player protected 5s |
| **Glacius**      | Shadow Phase dodge       | 30 ice damage         | Shadow Phase dodge  |
| **Incendio**     | Shadow Phase dodge       | 30 fire damage        | Shadow Phase dodge  |
| **Bombarda**     | Shadow Phase dodge       | 10 explosive damage   | Shadow Phase dodge  |
| **Depulso**      | Shadow Phase dodge       | 10 force damage       | Shadow Phase dodge  |

---

## 🎯 Strategic Combat Flow

### Spider Strategy

1. **Interrupt Webs**: Use Expelliarmus during 5s web cast
2. **Avoid Venom**: Use Protego or interrupt before venom lands
3. **Burn Everything**: Incendio destroys webs and kills spider
4. **Safe Control**: Stay defensive with Protection timing

### Troll Strategy

1. **Strip Armor**: Use Incendio/Bombarda to remove Chunk Armor
2. **Reflect Rocks**: Cast Depulso during Rock Throw cast
3. **Survive Stomp**: Protego reduces but doesn't prevent damage
4. **Stun Windows**: Expelliarmus for guaranteed damage opportunities

### Soul Sucker Strategy

1. **Stun First**: Expelliarmus is mandatory for damage windows
2. **Maximum Damage**: Use high-damage spells (Glacius/Incendio: 30 damage)
3. **Block Everything**: Protego prevents Soul Drain healing and voice silencing
4. **Timing Critical**: 4-second stun windows require quick casting

---

## 🔧 Technical Implementation

### Enemy State Management

```typescript
// Common enemy states
state: "idle" | "casting" | "stunned" | "dead";

// Spider-specific
state: "idle" | "casting" | "stunned" | "dead";
isOnFire: boolean;
canCastWeb: boolean;
canCastVenom: boolean;

// Troll-specific
hasChunkArmor: boolean;
isRockThrowReflected: boolean;
totalDamageReceived: number;

// Soul Sucker-specific
state: "idle" | "casting" | "stunned" | "shadowphase" | "dead";
totalDamageReceived: number;
```

### AI Decision Trees

- **Spider**: Web-first combo system with interrupt recovery
- **Troll**: Defensive armor priority with mixed offense
- **Soul Sucker**: Alternating offense with automatic defense

### Damage Systems

- **Spider**: Standard HP with fire vulnerability
- **Troll**: Total damage tracking with armor blocking
- **Soul Sucker**: Stun-gated damage with healing mechanics

---

## 🎨 Visual Design

### Spider

- **Color**: Dark brown (#8B4513)
- **Size**: Small (30x30)
- **Effects**: Fire 🔥, Web 🕸️, Stun 💫
- **Animation**: Attack lunge forward during skill execution
- **Breathing**: Subtle up-down movement for liveliness

### Troll

- **Size**: Large (600x800px) imposing presence
- **Color**: Brown/earth tones (#654321)
- **Effects**: Armor 🛡️, Stun 💫, Casting ⚡
- **Animation**: Forward-back attack movement during skills
- **Breathing**: Subtle movement pattern

### Soul Sucker

- **Color**: Dark brown (#2c1810)
- **Size**: Medium (50x70)
- **Effects**: Shadow Phase (semi-transparent), Stun 💫, Casting ⚡
- **Features**: Red glowing eyes, shadow tendrils, ethereal appearance

---

## 📊 Balance Considerations

### Difficulty Curve

- **Spider**: Teaches basic mechanics (stun, protect, damage)
- **Troll**: Introduces armor and reflection mechanics
- **Soul Sucker**: Requires mastery of stun-damage cycles

### Player Engagement

- **Progressive Complexity**: Each enemy adds new mechanics
- **Strategic Depth**: Different optimal spell rotations
- **Skill Expression**: Timing and spell choice matter

### Confidence Scaling

- **Incendio** (Spider): 15-30 damage based on pronunciation confidence
- **Depulso** (Troll): 15-30 damage based on pronunciation confidence
- **All Others**: Fixed damage for consistent strategy
