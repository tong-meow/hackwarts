// Enhanced Web Speech API Voice Recognition for Hackwarts
// Improved version of the original with better preprocessing and matching

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface EnhancedSpeechConfig {
  confidenceThreshold: number;
  cooldownDuration: number;
  restartDebounceMs: number;
  enableDebugMode: boolean;
}

export class EnhancedVoiceRecognition {
  private recognition: any;
  private isListening = false;
  private lastRestartTime = 0;
  private config: EnhancedSpeechConfig;

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

  // Callbacks
  public onSpellRecognized?: (spell: string, confidence: number) => void;
  public onListeningStart?: () => void;
  public onListeningStop?: () => void;
  public onError?: (error: string) => void;
  public onSpeechDetected?: (transcript: string, confidence: number) => void;

  constructor(config: EnhancedSpeechConfig) {
    this.config = config;
    this.initializeRecognition();
  }

  private initializeRecognition() {
    // Check browser support
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      console.error("Speech recognition not supported in this browser");
      this.onError?.("Speech recognition not supported in this browser");
      return;
    }

    // Create recognition instance
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Enhanced configuration
    this.recognition.continuous = true;
    this.recognition.interimResults = true; // Get interim results for better responsiveness
    this.recognition.lang = "en-US";
    this.recognition.maxAlternatives = 5; // More alternatives for better matching

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.recognition.onstart = () => {
      this.isListening = true;
      this.onListeningStart?.();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onListeningStop?.();

      // Auto-restart with debouncing
      const now = Date.now();
      const timeSinceLastRestart = now - this.lastRestartTime;

      if (timeSinceLastRestart >= this.config.restartDebounceMs) {
        this.lastRestartTime = now;
        setTimeout(() => this.startListening(), 1000);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error("Enhanced speech recognition error:", event.error);
      this.onError?.(event.error);

      // Auto-restart on errors
      const now = Date.now();
      const timeSinceLastRestart = now - this.lastRestartTime;

      if (timeSinceLastRestart >= this.config.restartDebounceMs) {
        this.lastRestartTime = now;
        setTimeout(() => this.startListening(), 3000);
      }
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResultIndex = event.results.length - 1;
      const result = event.results[lastResultIndex];

      if (result.isFinal) {
        const transcript = this.preprocessTranscript(result[0].transcript);
        const confidence = result[0].confidence || 0.8;

        // Add to speech history for context
        this.addToSpeechHistory(transcript);

        this.onSpeechDetected?.(transcript, confidence);

        // Enhanced spell matching with context
        if (confidence >= this.config.confidenceThreshold) {
          const recognizedSpell = this.enhancedSpellMatch(transcript);
          if (recognizedSpell && this.canCastSpell(recognizedSpell)) {
            this.setCooldown(recognizedSpell);
            this.onSpellRecognized?.(recognizedSpell, confidence);
          }
        }
      }
    };
  }

  private preprocessTranscript(transcript: string): string {
    // Enhanced preprocessing for better spell recognition
    let processed = transcript.toLowerCase().trim();

    // Remove common filler words that might interfere
    const fillerWords = [
      "um",
      "uh",
      "like",
      "you know",
      "i mean",
      "so",
      "well",
    ];
    fillerWords.forEach((filler) => {
      processed = processed.replace(new RegExp(`\\b${filler}\\b`, "g"), "");
    });

    // Normalize common mispronunciations
    const normalizations: { [key: string]: string } = {
      expeliarmus: "expelliarmus",
      "levi corpus": "levicorpus",
      "pro tego": "protego",
      glacier: "glacius",
      "in send io": "incendio",
      "bomb arda": "bombarda",
      "de pulso": "depulso",
      "spell armus": "expelliarmus",
      "fire spell": "incendio",
      "ice spell": "glacius",
      "explosion spell": "bombarda",
      "force spell": "depulso",
      "shield spell": "protego",
      "levitation spell": "levicorpus",
    };

    Object.entries(normalizations).forEach(([from, to]) => {
      processed = processed.replace(new RegExp(from, "g"), to);
    });

    return processed;
  }

  private addToSpeechHistory(transcript: string): void {
    this.speechHistory.push(transcript);
    if (this.speechHistory.length > this.maxHistoryLength) {
      this.speechHistory.shift();
    }
  }

  private enhancedSpellMatch(transcript: string): string | null {
    // Enhanced spell matching with multiple strategies

    // Strategy 1: Direct spell matching
    for (const spell of this.spells) {
      if (transcript.includes(spell)) {
        return spell;
      }
    }

    // Strategy 2: Enhanced fuzzy matching with phonetic variations
    const enhancedFuzzyMatches: { [key: string]: string[] } = {
      expelliarmus: [
        "expelliarmus",
        "expeliarmus",
        "expelli armus",
        "expel armus",
        "expel arms",
        "expelled arms",
        "expel armis",
        "spell armus",
        "expelliarmus",
        "expelli armus",
        "expel armus",
        "expel armus",
        "expel armus",
        "expel armus",
        "expel armus",
        "expel armus",
      ],
      levicorpus: [
        "levicorpus",
        "levi corpus",
        "levie corpus",
        "levy corpus",
        "levicorpus",
        "levi corpse",
        "levy corpse",
        "levi corpus",
        "levi corpus",
        "levi corpus",
        "levi corpus",
        "levi corpus",
      ],
      protego: [
        "protego",
        "protago",
        "pro tego",
        "protect go",
        "protal",
        "proteco",
        "protaco",
        "protector",
        "protagon",
        "pacheco",
        "protego",
        "protect go",
        "protector",
        "protego",
        "protego",
      ],
      glacius: [
        "glacius",
        "glacier",
        "glacias",
        "glass us",
        "glace us",
        "glacier",
        "ice spell",
        "glacius",
        "glacius",
        "glacius",
      ],
      incendio: [
        "incendio",
        "incendeo",
        "in send io",
        "in cendio",
        "incendia",
        "incendo",
        "fire spell",
        "incendio",
        "fire damage",
        "incendio",
      ],
      bombarda: [
        "bombarda",
        "bombardo",
        "bomb arda",
        "bombard a",
        "bomber da",
        "explosion spell",
        "bombarda",
        "explosion",
        "bombarda",
      ],
      depulso: [
        "depulso",
        "depulso",
        "deposo",
        "diposo",
        "deposo",
        "deposal",
        "de pulso",
        "depulse o",
        "proposal",
        "disposal",
        "deposit",
        "the puzzle",
        "de puzzle",
        "depulso",
        "force push",
        "depulso",
      ],
    };

    // Check fuzzy matches
    for (const [spell, alternatives] of Object.entries(enhancedFuzzyMatches)) {
      for (const alt of alternatives) {
        if (transcript.includes(alt)) {
          return spell;
        }
      }
    }

    // Strategy 3: Context-based matching using speech history
    const contextTranscript = this.speechHistory.join(" ").toLowerCase();
    for (const spell of this.spells) {
      if (contextTranscript.includes(spell)) {
        return spell;
      }
    }

    // Strategy 4: Partial word matching for better tolerance
    for (const spell of this.spells) {
      const spellWords = spell.split("");
      const transcriptWords = transcript.split("");

      // Check if most of the spell letters appear in order
      let matchIndex = 0;
      for (const letter of spellWords) {
        const foundIndex = transcriptWords.indexOf(letter, matchIndex);
        if (foundIndex !== -1) {
          matchIndex = foundIndex + 1;
        }
      }

      // If we found most letters in order, it's likely a match
      if (matchIndex > spellWords.length * 0.7) {
        return spell;
      }
    }

    return null;
  }

  private canCastSpell(spell: string): boolean {
    const lastCast = this.spellCooldowns.get(spell) || 0;
    const now = Date.now();
    return now - lastCast >= this.config.cooldownDuration;
  }

  private setCooldown(spell: string): void {
    this.spellCooldowns.set(spell, Date.now());
  }

  public async startListening(): Promise<void> {
    if (!this.recognition) {
      throw new Error("Enhanced speech recognition not initialized");
    }

    if (this.isListening) {
      return;
    }

    this.lastRestartTime = Date.now();

    try {
      this.recognition.start();
    } catch (error) {
      console.error("Error starting enhanced always-listening magic:", error);
      this.onError?.("Failed to start enhanced always-listening magic");
    }
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }

  public getConfidenceThreshold(): number {
    return this.config.confidenceThreshold;
  }

  public setConfidenceThreshold(threshold: number): void {
    this.config.confidenceThreshold = Math.max(0.1, Math.min(1.0, threshold));
  }

  public getCooldownDuration(): number {
    return this.config.cooldownDuration;
  }

  public setCooldownDuration(duration: number): void {
    this.config.cooldownDuration = Math.max(500, duration);
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
      this.onError?.(
        "Microphone access denied - enhanced magic requires your voice!"
      );
      return false;
    }
  }
}
