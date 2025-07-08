// Voice Recognition System for Hackwarts
// Handles speech-to-spell conversion with enhanced matching

// TypeScript declarations for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
    | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface VoiceRecognitionConfig {
  confidenceThreshold: number;
  cooldownDuration: number;
  restartDebounceMs: number;
  enableDebugMode: boolean;
}

export class VoiceRecognition {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private lastRestartTime = 0;
  private config: VoiceRecognitionConfig;

  // Supported spells
  private spells: string[] = [
    "expelliarmus",
    "levicorpus",
    "protego",
    "glacius",
    "incendio",
    "bombarda",
    "depulso",
  ];

  private spellCooldowns = new Map<string, number>();
  private speechHistory: string[] = [];
  private maxHistoryLength = 10;

  // Event callbacks
  public onSpellRecognized?: (spell: string, confidence: number) => void;
  public onListeningStart?: () => void;
  public onListeningStop?: () => void;
  public onError?: (error: string) => void;
  public onSpeechDetected?: (transcript: string, confidence: number) => void;

  constructor(config: VoiceRecognitionConfig) {
    this.config = config;
    this.initializeRecognition();
  }

  private initializeRecognition(): void {
    // Check for browser support
    if (
      !("SpeechRecognition" in window) &&
      !("webkitSpeechRecognition" in window)
    ) {
      console.error("Speech recognition not supported in this browser");
      this.onError?.("Speech recognition not supported in this browser");
      return;
    }

    // Create recognition instance with proper typing
    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionConstructor();

    // Optimized configuration for spell recognition
    this.recognition.continuous = true;
    this.recognition.interimResults = false; // Only final results to avoid duplicates
    this.recognition.lang = "en-US";
    this.recognition.maxAlternatives = 10; // More alternatives for better matching

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.config.enableDebugMode) {
        console.log("🎤 Voice recognition started");
      }
      this.onListeningStart?.();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.config.enableDebugMode) {
        console.log("🎤 Voice recognition ended");
      }
      this.onListeningStop?.();

      // Auto-restart with debouncing
      const now = Date.now();
      const timeSinceLastRestart = now - this.lastRestartTime;

      if (timeSinceLastRestart >= this.config.restartDebounceMs) {
        this.lastRestartTime = now;
        setTimeout(() => this.startListening(), 500); // Faster restart
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Voice recognition error:", event.error);
      this.onError?.(event.error);

      // Auto-restart on errors (except permission denied)
      if (event.error !== "not-allowed") {
        const now = Date.now();
        const timeSinceLastRestart = now - this.lastRestartTime;

        if (timeSinceLastRestart >= this.config.restartDebounceMs) {
          this.lastRestartTime = now;
          setTimeout(() => this.startListening(), 1000);
        }
      }
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResultIndex = event.results.length - 1;
      const result = event.results[lastResultIndex];

      if (result.isFinal) {
        // Try all alternatives with different confidence levels
        for (let i = 0; i < result.length; i++) {
          const alternative = result[i];
          const transcript = this.preprocessTranscript(alternative.transcript);
          const confidence = alternative.confidence || 0.7;

          // Add to speech history for context
          this.addToSpeechHistory(transcript);

          if (this.config.enableDebugMode) {
            console.log(
              `🎤 Speech detected (alt ${i}): "${transcript}" (confidence: ${Math.round(
                confidence * 100
              )}%)`
            );
          }

          this.onSpeechDetected?.(transcript, confidence);

          // Enhanced spell matching with much lower threshold
          const recognizedSpell = this.enhancedSpellMatch(
            transcript,
            confidence
          );
          if (recognizedSpell && this.canCastSpell(recognizedSpell)) {
            this.setCooldown(recognizedSpell);
            if (this.config.enableDebugMode) {
              console.log(
                `🪄 Spell recognized: ${recognizedSpell} (confidence: ${Math.round(
                  confidence * 100
                )}%)`
              );
            }
            this.onSpellRecognized?.(recognizedSpell, confidence);
            break; // Found a spell, stop checking alternatives
          }
        }
      }
    };
  }

  private preprocessTranscript(transcript: string): string {
    // Much gentler preprocessing to preserve spell words
    let processed = transcript.toLowerCase().trim();

    // Remove punctuation but keep letters and spaces
    processed = processed.replace(/[^\w\s]/g, " ");

    // Remove extra spaces
    processed = processed.replace(/\s+/g, " ");

    // Normalize common mispronunciations - More comprehensive
    const normalizations: { [key: string]: string } = {
      // Expelliarmus variations
      "expeli armus": "expelliarmus",
      "expell armus": "expelliarmus",
      "expel armus": "expelliarmus",
      "expel arms": "expelliarmus",
      "expelled arms": "expelliarmus",
      "expel armis": "expelliarmus",
      "spell armus": "expelliarmus",
      expeliarmus: "expelliarmus",
      "expeller armus": "expelliarmus",
      expelliarmus: "expelliarmus",

      // Levicorpus variations
      "levi corpus": "levicorpus",
      "levie corpus": "levicorpus",
      "levy corpus": "levicorpus",
      "levi corpse": "levicorpus",
      "levy corpse": "levicorpus",
      levitation: "levicorpus",
      levitate: "levicorpus",

      // Protego variations
      protago: "protego",
      "pro tego": "protego",
      "protect go": "protego",
      protecto: "protego",
      protaco: "protego",
      protector: "protego",
      protagon: "protego",
      protect: "protego",
      shield: "protego",

      // Glacius variations
      glacier: "glacius",
      glacias: "glacius",
      "glass us": "glacius",
      "glace us": "glacius",
      glacies: "glacius",
      ice: "glacius",
      freeze: "glacius",
      cold: "glacius",

      // Incendio variations
      "in send io": "incendio",
      incendio: "incendio",
      "in send": "incendio",
      incense: "incendio",
      fire: "incendio",
      flame: "incendio",
      burn: "incendio",
      ignite: "incendio",

      // Bombarda variations
      "bomb arda": "bombarda",
      bombardo: "bombarda",
      "bomb ada": "bombarda",
      explosion: "bombarda",
      explode: "bombarda",
      boom: "bombarda",
      blast: "bombarda",

      // Depulso variations
      "de pulso": "depulso",
      depulso: "depulso",
      "the pulso": "depulso",
      push: "depulso",
      force: "depulso",
      "knock back": "depulso",
      knockback: "depulso",
    };

    Object.entries(normalizations).forEach(([from, to]) => {
      processed = processed.replace(new RegExp(`\\b${from}\\b`, "g"), to);
    });

    return processed;
  }

  private addToSpeechHistory(transcript: string): void {
    this.speechHistory.push(transcript);
    if (this.speechHistory.length > this.maxHistoryLength) {
      this.speechHistory.shift();
    }
  }

  private enhancedSpellMatch(
    transcript: string,
    _confidence: number
  ): string | null {
    // Strategy 1: Direct spell matching (highest priority)
    for (const spell of this.spells) {
      if (transcript.includes(spell)) {
        return spell;
      }
    }

    // Strategy 2: Word-based matching (check if spell appears as separate word)
    const words = transcript.split(/\s+/);
    for (const spell of this.spells) {
      if (words.includes(spell)) {
        return spell;
      }
    }

    // Strategy 3: Extensive fuzzy matching with phonetic variations
    const fuzzyMatches: { [key: string]: string[] } = {
      expelliarmus: [
        "expelli armus",
        "expell armus",
        "expel armus",
        "expel arms",
        "expelled arms",
        "expel armis",
        "spell armus",
        "expeliarmus",
        "expeller armus",
        "expelliarmus",
        "expeli",
        "expell",
        "expel",
        "armus",
        "arms",
        "armis",
        "spell",
        "disarm",
        "weapon",
      ],
      levicorpus: [
        "levi corpus",
        "levie corpus",
        "levy corpus",
        "levi corpse",
        "levy corpse",
        "levitation",
        "levitate",
        "levi",
        "levy",
        "corpus",
        "corpse",
        "float",
        "lift",
        "rise",
        "hover",
      ],
      protego: [
        "protago",
        "pro tego",
        "protect go",
        "protecto",
        "protaco",
        "protector",
        "protagon",
        "protect",
        "shield",
        "defense",
        "block",
        "guard",
        "safety",
        "barrier",
      ],
      glacius: [
        "glacier",
        "glacias",
        "glass us",
        "glace us",
        "glacies",
        "ice",
        "freeze",
        "cold",
        "frost",
        "chill",
        "frozen",
        "arctic",
        "winter",
        "snow",
      ],
      incendio: [
        "in send io",
        "incendio",
        "in send",
        "incense",
        "fire",
        "flame",
        "burn",
        "ignite",
        "heat",
        "hot",
        "blaze",
        "inferno",
        "torch",
        "spark",
      ],
      bombarda: [
        "bomb arda",
        "bombardo",
        "bomb ada",
        "explosion",
        "explode",
        "boom",
        "blast",
        "bang",
        "detonate",
        "burst",
        "shatter",
        "demolish",
        "destroy",
      ],
      depulso: [
        "de pulso",
        "depulso",
        "the pulso",
        "push",
        "force",
        "knock back",
        "knockback",
        "shove",
        "thrust",
        "repel",
        "banish",
        "send away",
        "blow away",
      ],
    };

    // Check fuzzy matches with partial scoring
    for (const [spell, variations] of Object.entries(fuzzyMatches)) {
      for (const variation of variations) {
        if (transcript.includes(variation)) {
          return spell;
        }
      }
    }

    // Strategy 4: Levenshtein distance matching with adaptive threshold
    let bestMatch: string | null = null;
    let bestScore = Infinity;

    for (const spell of this.spells) {
      const distance = this.levenshteinDistance(transcript, spell);
      const maxDistance = Math.max(2, Math.floor(spell.length * 0.4)); // More lenient threshold

      if (distance <= maxDistance && distance < bestScore) {
        bestMatch = spell;
        bestScore = distance;
      }

      // Also check individual words in the transcript
      for (const word of transcript.split(/\s+/)) {
        if (word.length >= 3) {
          // Only check meaningful words
          const wordDistance = this.levenshteinDistance(word, spell);
          const wordMaxDistance = Math.max(1, Math.floor(spell.length * 0.3));

          if (wordDistance <= wordMaxDistance && wordDistance < bestScore) {
            bestMatch = spell;
            bestScore = wordDistance;
          }
        }
      }
    }

    // Strategy 5: Partial matching for longer spells
    if (!bestMatch) {
      for (const spell of this.spells) {
        if (spell.length >= 6) {
          // Only for longer spells
          const partialLength = Math.floor(spell.length * 0.6);
          const spellPrefix = spell.substring(0, partialLength);
          const spellSuffix = spell.substring(spell.length - partialLength);

          if (
            transcript.includes(spellPrefix) ||
            transcript.includes(spellSuffix)
          ) {
            return spell;
          }
        }
      }
    }

    return bestMatch;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private canCastSpell(spell: string): boolean {
    const cooldownEnd = this.spellCooldowns.get(spell) || 0;
    return Date.now() >= cooldownEnd;
  }

  private setCooldown(spell: string): void {
    this.spellCooldowns.set(spell, Date.now() + this.config.cooldownDuration);
  }

  public async startListening(): Promise<void> {
    if (!this.recognition) {
      throw new Error("Speech recognition not initialized");
    }

    if (this.isListening) {
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error("Failed to start voice recognition:", error);
      this.onError?.("Failed to start voice recognition");
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }

  public getConfidenceThreshold(): number {
    return this.config.confidenceThreshold;
  }

  public setConfidenceThreshold(threshold: number): void {
    this.config.confidenceThreshold = Math.max(0, Math.min(1, threshold));
  }

  public getCooldownDuration(): number {
    return this.config.cooldownDuration;
  }

  public setCooldownDuration(duration: number): void {
    this.config.cooldownDuration = Math.max(0, duration);
  }

  public getAvailableSpells(): string[] {
    return [...this.spells];
  }

  public getSpeechHistory(): string[] {
    return [...this.speechHistory];
  }

  public clearSpeechHistory(): void {
    this.speechHistory = [];
  }

  public async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      return false;
    }
  }
}
