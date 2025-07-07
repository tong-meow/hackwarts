# 🎮 Core Gameplay Mechanics

**Hackwarts** revolutionizes voice-controlled gaming with its "Always Listening Magic" system, confidence-based spell power, and progressive 3-enemy battle sequence that teaches players increasingly complex magical combat strategies.

---

## 🎤 Always Listening Magic System

### Revolutionary Voice Control

**Hackwarts** features continuous voice recognition that activates spells the moment you speak them clearly. No buttons, no modes - just speak and magic happens instantly.

#### Key Features

- **🎤 Continuous Listening**: Game listens for spells at all times
- **🎯 Confidence Threshold**: Only clear speech (75%+ confidence) triggers spells
- **⏰ Smart Cooldowns**: 2-second cooldown prevents spam while allowing natural conversation
- **🔄 Auto-Recovery**: Automatically restarts listening if interrupted
- **🎪 Social Magic**: Spells activate even during casual conversation

#### Technical Implementation

```typescript
// High confidence requirement
confidenceThreshold = 0.75;

// Spell cooldown system
cooldownDuration = 2000; // 2 seconds between same spell

// Enhanced pronunciation matching
fuzzyMatches = {
  expelliarmus: ["expeliarmus", "expelli armus", "spell armus"],
  levicorpus: ["levi corpus", "levie corpus", "levy corpus"],
  // ... extensive pronunciation variants
};
```

---

## ✨ Spell Power & Confidence System

### Confidence-Based Magic

Your pronunciation confidence directly affects spell power, creating a natural skill progression where clear speech equals stronger magic.

#### Power Scaling

- **95%+ Confidence**: Maximum power (1.5x multiplier)
- **85% Confidence**: Strong power (1.3x multiplier)
- **75% Confidence**: Base power (1.1x multiplier)
- **Below 75%**: No spell activation

#### Confidence Applications

- **Spell Damage**: Incendio and Depulso scale with confidence
- **Effect Duration**: Player glow duration scales with confidence
- **Visual Feedback**: More confident casting = more intense effects

---

## 🪄 Complete Spell Arsenal

**Hackwarts** features 7 powerful spells, each with unique mechanics and strategic applications across different enemies.

### 🌟 Utility Spells

#### ✨ Expelliarmus - The Universal Disruptor

- **Effect**: Knockback + stun enemies
- **Duration**: 2-4 seconds (varies by enemy)
- **Special**: Only spell that can stun Soul Sucker
- **Strategy**: Interrupt casting, create damage windows

#### 🪶 Levicorpus - The Levitator

- **Effect**: Lifts enemies into the air
- **Duration**: 2 seconds
- **Special**: Interrupts all enemy casting
- **Strategy**: Safe crowd control, spell interruption

#### 🛡️ Protego - The Shield

- **Effect**: Blocks all enemy attacks
- **Duration**: 5 seconds
- **Special**: Reduces Troll stomp damage, blocks Soul Sucker abilities
- **Strategy**: Defensive positioning, ability negation

### ⚔️ Damage Spells

#### ❄️ Glacius - Ice Blast

- **Base Damage**: 10 (Spider/Troll), 30 (Soul Sucker when stunned)
- **Effect**: Instant ice damage
- **Strategy**: Consistent damage option

#### 🔥 Incendio - Fire Spell (Confidence Scaled)

- **Damage Range**: 15-30 (confidence based)
- **Special Effects**:
  - **Spider**: Burns webs + delayed death
  - **Troll**: Destroys Chunk Armor
  - **Soul Sucker**: High damage when stunned
- **Strategy**: Anti-armor, high damage

#### 💥 Bombarda - Explosive Force

- **Base Damage**: 15-20 (varies by enemy)
- **Special Effects**:
  - **Troll**: Destroys Chunk Armor
  - **Soul Sucker**: Moderate damage when stunned
- **Strategy**: Armor removal, crowd control

#### 🪨 Depulso - Force Push (Confidence Scaled)

- **Damage Range**: 15-30 (confidence based)
- **Special Effects**:
  - **Troll**: Reflects Rock Throw during casting
  - **Soul Sucker**: Force damage when stunned
- **Strategy**: Counter-attacks, scaling damage

---

## 🎯 3-Enemy Progressive Campaign

### Campaign Structure

The game features a carefully designed 3-enemy sequence that teaches players different magical combat concepts, building from basic mechanics to advanced strategy.

#### 🕷️ Phase 1: Spider - Learning Fundamentals

**Goal**: Master basic spell mechanics and timing

- **Health**: 40 HP
- **Teaches**: Spell interruption, protection timing, basic damage
- **Key Mechanics**: Web trap combos, poison management
- **Strategy Focus**: Interrupt casting, use Protego defensively

#### 🧌 Phase 2: Troll - Tactical Combat

**Goal**: Learn armor management and spell reflection

- **Health**: 100 HP (total damage)
- **Teaches**: Armor removal, counter-attacks, damage optimization
- **Key Mechanics**: Chunk Armor, Rock Throw reflection, penetrating attacks
- **Strategy Focus**: Strip armor, reflect attacks, optimize spell choice

#### 👻 Phase 3: Soul Sucker - Mastery Challenge

**Goal**: Perfect stun-damage cycles and defensive management

- **Health**: 150 HP (total damage when stunned)
- **Teaches**: Precise timing, resource management, defensive strategy
- **Key Mechanics**: Shadow Phase dodging, voice silencing, healing prevention
- **Strategy Focus**: Stun windows, damage maximization, silence prevention

---

## 🎮 Core Gameplay Loop

### 1. Enemy Engagement

- **Voice Recognition Activates**: Speak any spell clearly
- **Confidence Check**: System validates pronunciation quality
- **Spell Resolution**: Effect applies based on enemy state and spell type

### 2. Strategic Decision Making

- **Enemy Analysis**: Identify current enemy state and active abilities
- **Spell Selection**: Choose optimal spell for current situation
- **Timing Execution**: Cast spells at optimal moments (interrupts, damage windows)

### 3. Reactive Combat

- **Enemy Counters**: Respond to enemy skill casts with appropriate spells
- **Status Management**: Handle immobilization, poison, silence effects
- **Resource Planning**: Manage spell cooldowns and protection timing

### 4. Progressive Mastery

- **Mechanical Learning**: Each enemy teaches new interaction patterns
- **Strategic Depth**: Combine multiple spells for optimal efficiency
- **Skill Expression**: Better pronunciation and timing = better results

---

## 🔧 Status Effect Systems

### Player Status Effects

#### 🕸️ Immobilized (Spider Web)

- **Duration**: 3 seconds
- **Effect**: Cannot cast spells (except Protego)
- **Source**: Spider's Entangling Web
- **Counter**: Protego blocks, Levicorpus interrupts casting

#### 🐍 Poisoned (Spider Venom)

- **Duration**: 4 seconds
- **Effect**: 5 damage per second
- **Source**: Spider's Venom Spit
- **Counter**: Protego blocks

#### 🛡️ Protected (Protego)

- **Duration**: 5 seconds
- **Effect**: Blocks all enemy attacks
- **Source**: Player casting Protego
- **Special**: Reduces Troll stomp to 20 damage instead of blocking

#### 🔇 Silenced (Soul Sucker)

- **Duration**: 3 seconds
- **Effect**: Cannot cast any spells
- **Source**: Soul Sucker's Silence Shriek
- **Counter**: Protego blocks

### Enemy Status Effects

#### 💫 Stunned

- **Duration**: 2-4 seconds (varies by enemy)
- **Effect**: Cannot move or cast, vulnerable to damage
- **Source**: Expelliarmus
- **Special**: Only way to damage Soul Sucker

#### 🪶 Levitating

- **Duration**: 2 seconds
- **Effect**: Interrupts casting, some spells do bonus damage
- **Source**: Levicorpus
- **Special**: Makes enemies vulnerable to knockback effects

#### 🔥 On Fire (Spider only)

- **Duration**: 2 seconds
- **Effect**: Burns webs, guaranteed death after fire expires
- **Source**: Incendio
- **Special**: Unique delayed kill effect

#### 🌑 Shadow Phase (Soul Sucker only)

- **Duration**: 1 second
- **Effect**: Becomes semi-transparent, dodges all damage
- **Source**: Automatic when taking damage while not stunned
- **Counter**: Stun with Expelliarmus first

---

## 🎯 Strategic Depth & Mastery

### Beginner Strategy (Spider)

1. **Learn Spell Names**: Practice pronouncing all 7 spells clearly
2. **Basic Protection**: Use Protego to block web and venom
3. **Simple Damage**: Use any damage spell when spider is not casting
4. **Interrupt Practice**: Try to Expelliarmus during long web casts

### Intermediate Strategy (Troll)

1. **Armor Management**: Prioritize Incendio/Bombarda when armor is up
2. **Counter-Attacks**: Use Depulso during Rock Throw casting
3. **Damage Optimization**: Plan spell sequences for maximum damage
4. **Protection Timing**: Use Protego strategically, not reactively

### Advanced Strategy (Soul Sucker)

1. **Stun Cycles**: Perfect Expelliarmus → damage spell → repeat timing
2. **Damage Maximization**: Use highest damage spells (Glacius/Incendio) during stuns
3. **Silence Prevention**: Pre-cast Protego before Silence Shriek
4. **Healing Denial**: Prevent Soul Drain with perfect Protego timing

---

## 📊 Skill Progression Metrics

### Voice Recognition Mastery

- **Pronunciation Accuracy**: Achieve consistent 85%+ confidence
- **Spell Variety**: Use all 7 spells effectively in combat
- **Cooldown Management**: Avoid "spell on cooldown" messages

### Combat Proficiency

- **Spider Completion**: Under 60 seconds (advanced: under 30 seconds)
- **Troll Completion**: Under 90 seconds (advanced: under 60 seconds)
- **Soul Sucker Completion**: Under 120 seconds (advanced: under 90 seconds)

### Strategic Mastery

- **Damage Prevention**: Complete fights taking less than 40 damage total
- **Perfect Counters**: Successfully reflect 3+ Troll rock throws
- **Stun Efficiency**: Hit Soul Sucker with 4+ damage spells per stun cycle

---

## 🚀 Advanced Techniques

### Voice Optimization

- **Clear Pronunciation**: Speak spell names distinctly and confidently
- **Microphone Positioning**: Optimal placement for consistent recognition
- **Background Noise**: Minimize competing audio for better accuracy

### Combat Efficiency

- **Spell Chaining**: Cast spells immediately after stun effects
- **Predictive Casting**: Start Protego before enemy finishes casting
- **Confidence Scaling**: Practice clear speech for maximum damage on scaling spells

### Social Gaming

- **Demo Magic**: Use casual conversation to accidentally trigger spells
- **Teaching Others**: Explain spells while they activate in-game
- **Viral Moments**: Create shareable "accidental magic" clips

---

## 🎪 The Revolutionary Gaming Experience

**Hackwarts** transforms traditional gaming by making conversation part of gameplay. Whether you're playing solo, teaching friends, or creating content, the always-listening magic system creates unprecedented moments of surprise, delight, and viral potential.

**Every conversation becomes gameplay. Every explanation becomes magic. Every demo becomes a performance.**
