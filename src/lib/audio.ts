// Web Audio API Sound Generator & Voice Speech Management

class SoundManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Soft wooden move clack
  playMove() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  }

  // Deeper capture strike
  playCapture() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  }

  // Crisp check bell
  playCheck() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, ctx.currentTime);
    osc.frequency.setValueAtTime(740, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  }

  // Victory / correct move chime
  playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    const freqs = [440, 554, 659];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.2);
    });
  }

  // Inaccurate move low buzz
  playError() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.setValueAtTime(110, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.18);
  }
}

export const soundManager = new SoundManager();

// Speech synthesis and audio playback state
class VoiceController {
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeakingState: boolean = false;
  private onStateChangeCb: ((isSpeaking: boolean) => void) | null = null;

  setOnStateChange(cb: (isSpeaking: boolean) => void) {
    this.onStateChangeCb = cb;
  }

  get isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  private setSpeaking(val: boolean) {
    this.isSpeakingState = val;
    if (this.onStateChangeCb) {
      this.onStateChangeCb(val);
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.setSpeaking(false);
  }

  async speak(text: string, rate: number = 1.0, voiceHint: string = 'Zephyr'): Promise<void> {
    this.stop();
    this.setSpeaking(true);

    try {
      // 1. Attempt server-side Gemini 3.8 Flash Lite TTS
      const res = await fetch('/api/coaching/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName: voiceHint }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          audio.playbackRate = rate;
          this.currentAudio = audio;

          return new Promise<void>((resolve) => {
            audio.onended = () => {
              this.setSpeaking(false);
              this.currentAudio = null;
              resolve();
            };
            audio.onerror = () => {
              this.setSpeaking(false);
              this.currentAudio = null;
              resolve();
            };
            audio.play().catch(() => {
              this.fallbackWebSpeech(text, rate).then(resolve);
            });
          });
        }
      }
    } catch (e) {
      console.warn('Server TTS failed, falling back to Web Speech API:', e);
    }

    // 2. Client-side Web Speech API Fallback
    return this.fallbackWebSpeech(text, rate);
  }

  private fallbackWebSpeech(text: string, rate: number): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        this.setSpeaking(false);
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 0.95;

      const voices = window.speechSynthesis.getVoices();
      // Try to find natural English voice
      const preferred = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Daniel'))
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferred) utterance.voice = preferred;

      utterance.onend = () => {
        this.setSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        this.setSpeaking(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }
}

export const voiceController = new VoiceController();
