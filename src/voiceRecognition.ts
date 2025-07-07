// Voice Recognition System for Hackwarts - Always Listening Magic

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

// Extend Window interface for browser compatibility
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class VoiceRecognition {
  private recognition: any;
  private isListening = false;
  private lastRestartTime = 0; // Track last restart to prevent rapid cycling
  private restartDebounceMs = 2000; // Wait 2 seconds between restarts
  private spells: string[] = [
    "expelliarmus",
    "levicorpus",
    "protego",
    "glacius",
    "incendio",
    "bombarda",
    "depulso",
  ];

  // Magic system configuration
  private confidenceThreshold = 0.75; // High confidence required
  private spellCooldowns = new Map<string, number>(); // Prevent spam
  private cooldownDuration = 2000; // 2 seconds between same spell

  // Callbacks
  public onSpellRecognized?: (spell: string, confidence: number) => void;
  public onListeningStart?: () => void;
  public onListeningStop?: () => void;
  public onError?: (error: string) => void;
  public onSpeechDetected?: (transcript: string, confidence: number) => void;

  constructor() {
    this.initializeRecognition();
  }

  private initializeRecognition() {
    // Check if browser supports speech recognition
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

    // Configure for always-listening magic
    this.recognition.continuous = true;
    this.recognition.interimResults = false; // Only process final results for accuracy
    this.recognition.lang = "en-US";
    this.recognition.maxAlternatives = 3; // Get more alternatives for better confidence

    // Event listeners
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log("🎤 Always-listening magic activated!");
      this.onListeningStart?.();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log("🔄 Magic listening restarting...");
      this.onListeningStop?.();

      // Always auto-restart for continuous magic
      const now = Date.now();
      const timeSinceLastRestart = now - this.lastRestartTime;

      if (timeSinceLastRestart >= this.restartDebounceMs) {
        console.log("🔄 Auto-restarting always-listening magic...");
        this.lastRestartTime = now;
        setTimeout(() => this.startListening(), 1000);
      } else {
        console.log(
          `⏳ Debouncing restart (${Math.ceil(
            (this.restartDebounceMs - timeSinceLastRestart) / 1000
          )}s remaining)`
        );
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      this.onError?.(event.error);

      // Always auto-restart on errors for continuous magic
      const now = Date.now();
      const timeSinceLastRestart = now - this.lastRestartTime;

      if (timeSinceLastRestart >= this.restartDebounceMs) {
        if (event.error === "no-speech") {
          console.log("🔄 No speech detected, restarting magic...");
          this.lastRestartTime = now;
          setTimeout(() => this.startListening(), 2000);
        } else if (event.error === "audio-capture") {
          console.log("🔄 Audio capture error, restarting magic...");
          this.lastRestartTime = now;
          setTimeout(() => this.startListening(), 3000);
        } else if (event.error === "network") {
          console.log("🔄 Network error, restarting magic...");
          this.lastRestartTime = now;
          setTimeout(() => this.startListening(), 5000);
        } else {
          // Handle any other errors by restarting
          console.log(`🔄 Error "${event.error}", restarting magic...`);
          this.lastRestartTime = now;
          setTimeout(() => this.startListening(), 3000);
        }
      } else {
        console.log(
          `⏳ Error restart debounced (${Math.ceil(
            (this.restartDebounceMs - timeSinceLastRestart) / 1000
          )}s remaining)`
        );
      }
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResultIndex = event.results.length - 1;
      const result = event.results[lastResultIndex];

      if (result.isFinal) {
        const transcript = result[0].transcript.toLowerCase().trim();
        const confidence = result[0].confidence || 0.8; // Fallback confidence

        console.log(
          `🎙️ Speech detected: "${transcript}" (confidence: ${confidence.toFixed(
            2
          )})`
        );
        this.onSpeechDetected?.(transcript, confidence);

        // Check for high-confidence spell matches
        if (confidence >= this.confidenceThreshold) {
          const recognizedSpell = this.matchSpell(transcript);
          if (recognizedSpell && this.canCastSpell(recognizedSpell)) {
            console.log(
              `✨ Magic activated: ${recognizedSpell} (confidence: ${confidence.toFixed(
                2
              )})`
            );
            this.setCooldown(recognizedSpell);
            this.onSpellRecognized?.(recognizedSpell, confidence);
          }
        }
      }
    };
  }

  private matchSpell(transcript: string): string | null {
    // Direct spell matching with enhanced detection
    for (const spell of this.spells) {
      // Check if spell name appears in transcript
      if (transcript.includes(spell)) {
        return spell;
      }

      // Check individual words for partial matches
      const spellWords = spell.split(" ");
      const transcriptWords = transcript.split(" ");

      // For multi-word spells, check if both words appear (order doesn't matter)
      if (spellWords.length > 1) {
        const foundWords = spellWords.filter((word) =>
          transcriptWords.some(
            (tWord) => tWord.includes(word) || word.includes(tWord)
          )
        );
        if (foundWords.length === spellWords.length) {
          return spell;
        }
      }
    }

    // Enhanced fuzzy matching for pronunciation variations
    const fuzzyMatches: { [key: string]: string[] } = {
      expelliarmus: [
        "expelliarmus",
        "expeliarmus",
        "expelliarmus",
        "spell armus",
        "expelli armus",
        "expel armus",
      ],
      levicorpus: [
        "levicorpus",
        "levi corpus",
        "levie corpus",
        "levy corpus",
        "levicorpus",
        "levi corpse",
      ],
      protego: ["protego", "protago", "pro tego", "protect go"],
      glacius: [
        "glacius",
        "glacier",
        "glacius",
        "glass us",
        "glace us",
        "ice spell",
      ],
      incendio: [
        "incendio",
        "incendeo",
        "in send io",
        "in cendio",
        "incendia",
        "incendo",
        "fire spell",
      ],
      bombarda: [
        "bombarda",
        "bombardo",
        "bomb arda",
        "bombard a",
        "bomber da",
        "explosion spell",
      ],
      depulso: [
        "depulso",
        "depulso",
        "de pulso",
        "depulse o",
        "push spell",
        "force spell",
      ],
    };

    for (const [spell, alternatives] of Object.entries(fuzzyMatches)) {
      for (const alt of alternatives) {
        if (transcript.includes(alt)) {
          return spell;
        }
      }
    }

    return null;
  }

  private canCastSpell(spell: string): boolean {
    const lastCast = this.spellCooldowns.get(spell) || 0;
    const now = Date.now();
    return now - lastCast >= this.cooldownDuration;
  }

  private setCooldown(spell: string): void {
    this.spellCooldowns.set(spell, Date.now());
  }

  public async startListening(): Promise<void> {
    if (!this.recognition) {
      throw new Error("Speech recognition not initialized");
    }

    if (this.isListening) {
      return;
    }

    this.lastRestartTime = Date.now(); // Reset restart tracking

    try {
      this.recognition.start();
    } catch (error) {
      console.error("Error starting always-listening magic:", error);
      this.onError?.("Failed to start always-listening magic");
    }
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }

  public getConfidenceThreshold(): number {
    return this.confidenceThreshold;
  }

  public setConfidenceThreshold(threshold: number): void {
    this.confidenceThreshold = Math.max(0.1, Math.min(1.0, threshold));
  }

  public getCooldownDuration(): number {
    return this.cooldownDuration;
  }

  public setCooldownDuration(duration: number): void {
    this.cooldownDuration = Math.max(500, duration);
  }

  public getAvailableSpells(): string[] {
    return [...this.spells];
  }

  // Request microphone permission and start listening
  public async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      this.onError?.(
        "Microphone access denied - always-listening magic requires your voice!"
      );
      return false;
    }
  }
}
