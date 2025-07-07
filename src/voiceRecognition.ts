// Voice Recognition System for Hackwarts - Always Listening Magic

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

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
  private shouldAutoRestart = true; // Control auto-restart behavior
  private spells: string[] = [
    "wingardium leviosa",
    "expelliarmus",
    "protego",
    "lumos",
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
      console.log("🎤 Magic is listening for spells...");
      this.onListeningStart?.();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log("🔇 Magic listening stopped");
      this.onListeningStop?.();

      // Auto-restart for continuous magic (unless manually stopped)
      if (this.shouldAutoRestart && this.shouldKeepListening()) {
        setTimeout(() => this.startListening(), 100);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      this.onError?.(event.error);

      // Auto-restart on certain errors (but respect manual control)
      if (
        this.shouldAutoRestart &&
        (event.error === "no-speech" || event.error === "audio-capture")
      ) {
        setTimeout(() => this.startListening(), 1000);
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
      "wingardium leviosa": [
        "wingardium",
        "leviosa",
        "wingardium leviosa",
        "wing guardium",
        "levee osa",
        "wingard leviosa",
      ],
      expelliarmus: [
        "expelliarmus",
        "expeliarmus",
        "expelliarmus",
        "spell armus",
        "expelli armus",
        "expel armus",
      ],
      protego: ["protego", "protago", "pro tego", "protect go"],
      lumos: ["lumos", "lumas", "lummos", "loom oss"],
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

  private shouldKeepListening(): boolean {
    // Add logic to determine if we should keep listening
    // For now, always keep listening for magic (unless manually controlled)
    return true;
  }

  public async startListening(): Promise<void> {
    if (!this.recognition) {
      throw new Error("Speech recognition not initialized");
    }

    if (this.isListening) {
      return;
    }

    // Enable auto-restart when manually started
    this.shouldAutoRestart = true;

    try {
      this.recognition.start();
    } catch (error) {
      console.error("Error starting magic listening:", error);
      this.onError?.("Failed to start magic listening");
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      // Disable auto-restart when manually stopped
      this.shouldAutoRestart = false;
      this.recognition.stop();
    }
  }

  public enableAutoRestart(): void {
    this.shouldAutoRestart = true;
  }

  public disableAutoRestart(): void {
    this.shouldAutoRestart = false;
  }

  public getAvailableSpells(): string[] {
    return [...this.spells];
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

  // Request microphone permission
  public async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      this.onError?.("Microphone access denied - magic requires your voice!");
      return false;
    }
  }
}
