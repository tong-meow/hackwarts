# 🧙‍♂️ Hackwarts: Always Listening Magic Game

**Revolutionary Voice-Controlled Battle Game**
**Platform:** Web (TypeScript, Vite, Canvas API)

---

## ✨ The Magic Experience

**Hackwarts** features groundbreaking "Always Listening Magic" - speak any spell name and watch it activate instantly! No buttons, no modes, just pure magical voice control. Perfect for viral moments when friends accidentally cast spells while explaining the game.

**🎤 Always Listening**: Magic spells activate whenever spoken with confidence
**🎯 High Confidence Casting**: Only clear, confident speech triggers spells (75%+ threshold)
**🔄 Smart Cooldowns**: Prevents spell spam while allowing natural conversation
**📱 Social Magic**: Demos become gameplay - explaining IS playing
**⚔️ Progressive Combat**: 3 unique enemies teaching escalating magical strategies

---

## 🎮 Revolutionary Game Features

### 🎤 Always Listening Magic System

- **Continuous Voice Recognition**: Game listens for spells at all times
- **Confidence-Based Activation**: Only triggers on clear, confident speech (75%+ confidence)
- **Accidental Magic**: Spells activate even in casual conversation
- **Smart Cooldowns**: 2-second cooldown prevents spam, allows natural flow
- **Enhanced Pronunciation**: Improved fuzzy matching for fantasy words

### 🪄 Advanced Spell Power System

- **Confidence = Power**: Higher confidence speech = more powerful spells
- **Dynamic Scaling**: Incendio and Depulso damage scales 15-30 based on pronunciation
- **Visual Feedback**: Player glows when casting, effects show spell power
- **Magic Tracking**: Debug system shows all speech and spell matching

### ⚔️ Strategic 3-Enemy Campaign

- **🕷️ Spider (40 HP)**: Learn fundamentals with web traps and poison
- **🧌 Troll (100 HP)**: Master armor removal and attack reflection
- **👻 Soul Sucker (150 HP)**: Perfect stun-damage cycles and silence management
- **Progressive Difficulty**: Each enemy teaches new magical combat concepts

### 🎯 Social Gaming Revolution

- **Viral Moments**: Friends accidentally cast spells while talking
- **Demo = Gameplay**: Explaining spells to others triggers them
- **Natural Magic**: No UI friction, just speak and magic happens
- **Shareable Clips**: Perfect for social media viral content

---

## 🧠 Core Mechanics

### Always Listening Magic

- **Continuous Recognition**: Uses Web Speech API for constant listening
- **High Confidence Threshold**: Only 75%+ confidence speech triggers spells
- **Smart Spell Matching**: Enhanced fuzzy matching for pronunciation variations
- **Cooldown System**: 2-second cooldown prevents accidental spam
- **Auto-Recovery**: Automatically restarts listening if interrupted

### Complete Spell Arsenal (7 Spells)

| Spell Name       | Icon | Effect             | Power Scaling      | Strategic Use                                |
| ---------------- | ---- | ------------------ | ------------------ | -------------------------------------------- |
| **Expelliarmus** | ✨   | Stun + Knockback   | Fixed              | Interrupt casting, enable Soul Sucker damage |
| **Levicorpus**   | 🪶   | Levitate enemy     | Fixed              | Safe crowd control, interrupt spells         |
| **Protego**      | 🛡️   | Block attacks (5s) | Fixed              | Defense, block status effects                |
| **Glacius**      | ❄️   | Ice damage         | Fixed (10-30)      | Consistent damage across enemies             |
| **Incendio**     | 🔥   | Fire damage        | Confidence (15-30) | Anti-armor, spider burn effect               |
| **Bombarda**     | 💥   | Explosive damage   | Fixed (15-20)      | Armor removal, area damage                   |
| **Depulso**      | 🪨   | Force damage       | Confidence (15-30) | Rock reflection, scaling damage              |

### Progressive Enemy System

#### 🕷️ Spider - The Web Weaver (Easy)

- **Health**: 40 HP
- **Skills**: Entangling Web (immobilize 3s) + Venom Spit (poison 4s)
- **Mechanics**: Smart combo system, fire vulnerability
- **Strategy**: Interrupt webs, burn with Incendio for instant kill

#### 🧌 Troll - The Armored Destroyer (Medium)

- **Health**: 100 HP (total damage tracking)
- **Skills**: Rock Throw (30 dmg), Chunk Armor (blocks all), Stomp (40 dmg)
- **Mechanics**: Armor blocking, rock reflection, penetrating damage
- **Strategy**: Strip armor with fire/explosives, reflect rocks with Depulso

#### 👻 Soul Sucker - The Ethereal Nemesis (Hard)

- **Health**: 150 HP (only when stunned)
- **Skills**: Soul Drain (60 total dmg + healing), Silence Shriek (disable voice 3s)
- **Mechanics**: Shadow Phase dodging, stun-gated damage, voice silencing
- **Strategy**: Stun first with Expelliarmus, maximize damage in 4s windows

---

## 🎭 Gameplay Scenarios

### Scenario 1: The Accidental Demo

```
Player: "Watch this! You just say 'incendio' and—"
Game: *INCENDIO ACTIVATES* 🔥 *Spider burns and dies*
Friends: "HOLY SHIT IT'S LISTENING!"
```

### Scenario 2: The Teaching Moment

```
Player: "The spells are expelliarmus, levicorpus, protego..."
Game: *EXPELLIARMUS* ✨ *LEVICORPUS* 🪶 *PROTEGO* 🛡️
Everyone: "IT'S CASTING EVERYTHING WE SAY!"
```

### Scenario 3: The Strategic Conversation

```
Friend: "How do you beat the troll?"
Player: "First you cast bombarda to remove armor—"
Game: *BOMBARDA ACTIVATES* 💥 *Troll armor destroyed*
Player: "Then depulso when it throws rocks—"
Game: *Rock reflects back, troll takes 30 damage*
```

---

## 🔊 Voice Recognition Technology

### Web Speech API Enhancement

- **Continuous Listening**: Always active, no manual activation needed
- **Confidence Filtering**: Only high-confidence speech triggers spells
- **Enhanced Pronunciation**: Improved fuzzy matching for fantasy words
- **Auto-Recovery**: Automatically restarts if connection drops
- **Browser Optimized**: Works best in Chrome, good support in Firefox

### Smart Speech Processing

- **Contextual Matching**: Finds spells in any conversation
- **Pronunciation Variants**: Handles different accents and pronunciations
- **Noise Filtering**: Focuses on clear speech over background noise
- **Cooldown Management**: Prevents spam while allowing natural flow

### Confidence-Based Power System

```typescript
// Spell power scales with pronunciation confidence
const powerMultiplier = Math.min(confidence * 1.5, 1.5);
const damage = Math.floor(baseDamage * powerMultiplier);

// Examples:
// 95% confidence → 30 damage (max power)
// 80% confidence → 24 damage (good power)
// 75% confidence → 22 damage (threshold power)
```

---

## 🖼 Visual & Audio Design

### Collage Cutout Aesthetic

- **Paper-like Characters**: Layered 2D collage style with distinct enemy designs
- **Magical Effects**: Glowing, floating, color-changing animations
- **Confidence Feedback**: Visual intensity matches speech confidence
- **Real-time Debug**: Shows all speech recognition in real-time

### Enhanced Visual Effects

- **Spell Power Visualization**: Effects scale with confidence
- **Player Glow**: Different colors for each spell type
- **Status Indicators**: Clear visual feedback for all status effects
- **Enemy States**: Distinct visuals for stunned, levitating, armor, shadow phase

### Status Effect System

#### Player Status Effects

- **🕸️ Immobilized**: Cannot cast (except Protego) for 3s
- **🐍 Poisoned**: 5 damage/sec for 4s with visual countdown
- **🛡️ Protected**: Blocks all attacks for 5s
- **🔇 Silenced**: Cannot cast any spells for 3s

#### Enemy Status Effects

- **💫 Stunned**: Vulnerable to all damage
- **🪶 Levitating**: Interrupts casting, bonus damage
- **🔥 On Fire**: Burns webs, delayed spider death
- **🌑 Shadow Phase**: Semi-transparent, dodges all damage

---

## 📋 User Stories

### Revolutionary Magic Experience

- As a **player**, I want **spells to activate when I speak them**, so magic feels real and immediate
- As a **player**, I want **my pronunciation to affect spell power**, so clear speech matters
- As a **player**, I want **different enemies to require different strategies**, so I learn magical combat
- As a **player**, I want **my friends to accidentally cast spells**, so we have hilarious viral moments

### Progressive Combat Mastery

- As a **beginner**, I want **to learn with the spider**, so I understand basic interruption and protection
- As a **intermediate player**, I want **to master troll mechanics**, so I learn armor and reflection strategies
- As a **advanced player**, I want **to perfect soul sucker timing**, so I can execute complex stun-damage cycles

### Social & Viral Features

- As a **content creator**, I want **unexpected magical moments**, so I can create viral clips
- As a **friend**, I want **to accidentally participate**, so explaining becomes playing
- As a **viewer**, I want **to see real magic**, so the demo is more engaging than traditional games

---

## 🚀 Technical Implementation

### Always Listening Architecture

```typescript
// High confidence threshold for spell activation
confidenceThreshold = 0.75;

// Smart cooldown system prevents spam
spellCooldowns = new Map<string, number>();
cooldownDuration = 2000; // 2 seconds

// Enhanced spell matching with pronunciation variants
fuzzyMatches = {
  expelliarmus: ["expeliarmus", "expelli armus", "spell armus"],
  levicorpus: ["levi corpus", "levie corpus", "levy corpus"],
  protego: ["protego", "protago", "pro tego", "protect go"],
  glacius: ["glacius", "glacier", "glass us", "ice spell"],
  incendio: ["incendio", "incendeo", "in send io", "fire spell"],
  bombarda: ["bombarda", "bombardo", "bomb arda", "explosion spell"],
  depulso: ["depulso", "de pulso", "push spell", "force spell"],
};
```

### Enemy AI Systems

```typescript
// Progressive enemy complexity
class Spider {
  // Smart combo system: successful web → immediate venom
  // Failed web → normal cooldown
  comboLogic() {
    /* web-venom synergy */
  }
}

class Troll {
  // Armor priority: 30% chance when armor down
  // Mixed offense: rock throw vs stomp rotation
  armorManagement() {
    /* defensive priority */
  }
}

class SoulSucker {
  // Automatic shadow phase on damage spells
  // Only vulnerable when stunned
  dodgeSystem() {
    /* stun-gated damage */
  }
}
```

### Performance Optimizations

- **Efficient Speech Processing**: Only processes final results
- **Smart Cooldowns**: Prevents spam without blocking natural conversation
- **Auto-Recovery**: Restarts listening automatically
- **Confidence Scaling**: Higher confidence = better performance

---

## 🎯 The Revolutionary Difference

### Traditional Voice Games

- ❌ Push-to-talk required
- ❌ Perfect pronunciation needed
- ❌ Manual activation modes
- ❌ Stop talking to play
- ❌ Simple on/off spell effects

### Hackwarts Always Listening Magic

- ✅ **Always listening** - magic happens naturally
- ✅ **Accidental casting** - demos become gameplay
- ✅ **Confidence-based power** - clear speech = strong magic
- ✅ **Social integration** - explaining IS playing
- ✅ **Progressive strategy** - 3 enemies teach escalating complexity
- ✅ **Viral moments** - unexpected magic creates shareable content

---

## 🎮 Getting Started

### Installation

```bash
git clone https://github.com/yourusername/hackwarts
cd hackwarts
npm install
npm run dev
```

### Quick Start Guide

1. **Grant microphone permission** when prompted
2. **Practice spell names**: Start with "protego" and "expelliarmus"
3. **Fight the spider**: Learn to interrupt webs and block venom
4. **Master the troll**: Remove armor and reflect rock throws
5. **Challenge soul sucker**: Perfect stun-damage timing cycles

### Pro Tips

- **Speak clearly and confidently** for maximum spell power
- **Learn enemy patterns** to predict optimal spell timing
- **Use Protego defensively** to block status effects
- **Chain spells after stuns** for maximum damage windows

---

## 🌟 The Magic Awaits

**Hackwarts** isn't just a game - it's a glimpse into the future where natural conversation becomes magical interaction. Every word has power. Every explanation becomes enchantment. Every demo transforms into an unforgettable magical experience.

**Speak the magic. Live the magic. Share the magic.** ✨🪄

---

_Ready to cast your first spell? Clone the repository and let the magic begin!_
