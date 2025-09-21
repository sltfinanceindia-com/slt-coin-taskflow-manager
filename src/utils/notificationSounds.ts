class NotificationSounds {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  // Generate notification tones programmatically
  private generateTone(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const numSamples = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;

      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
        case 'triangle':
          sample = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t));
          break;
      }

      // Apply envelope (fade in/out)
      const envelope = Math.min(1, Math.min(t * 10, (duration - t) * 10));
      data[i] = sample * envelope * 0.3; // Volume control
    }

    return buffer;
  }

  private generateMultiTone(frequencies: number[], duration: number): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const numSamples = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;

      // Mix multiple frequencies
      frequencies.forEach(freq => {
        sample += Math.sin(2 * Math.PI * freq * t) / frequencies.length;
      });

      // Apply envelope
      const envelope = Math.min(1, Math.min(t * 5, (duration - t) * 5));
      data[i] = sample * envelope * 0.3;
    }

    return buffer;
  }

  public initSounds() {
    if (!this.audioContext) return;

    // Message notification (gentle ding)
    const messageSound = this.generateTone(800, 0.2);
    if (messageSound) this.sounds.set('message', messageSound);

    // Call notification (phone ring)
    const callSound = this.generateMultiTone([440, 554], 1.0);
    if (callSound) this.sounds.set('call', callSound);

    // Call end (quick beep)
    const callEndSound = this.generateTone(300, 0.15);
    if (callEndSound) this.sounds.set('callEnd', callEndSound);

    // Success notification
    const successSound = this.generateMultiTone([523, 659, 784], 0.3);
    if (successSound) this.sounds.set('success', successSound);

    // Error notification
    const errorSound = this.generateTone(200, 0.5, 'square');
    if (errorSound) this.sounds.set('error', errorSound);

    // Typing indicator
    const typingSound = this.generateTone(1000, 0.1);
    if (typingSound) this.sounds.set('typing', typingSound);
  }

  public async playSound(soundName: string, volume: number = 0.5) {
    if (!this.audioContext || !this.sounds.has(soundName)) {
      console.warn(`Sound "${soundName}" not available`);
      return;
    }

    try {
      // Resume audio context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const buffer = this.sounds.get(soundName);
      if (!buffer) return;

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      gainNode.gain.value = Math.max(0, Math.min(1, volume));

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  public playMessageSound() {
    this.playSound('message', 0.3);
  }

  public playCallSound() {
    this.playSound('call', 0.5);
  }

  public playCallEndSound() {
    this.playSound('callEnd', 0.4);
  }

  public playSuccessSound() {
    this.playSound('success', 0.3);
  }

  public playErrorSound() {
    this.playSound('error', 0.4);
  }

  public playTypingSound() {
    this.playSound('typing', 0.1);
  }

  // Enable/disable sounds based on user preference
  public setEnabled(enabled: boolean) {
    if (enabled && this.sounds.size === 0) {
      this.initSounds();
    }
  }
}

// Create singleton instance
export const notificationSounds = new NotificationSounds();

// Initialize sounds on first user interaction
let soundsInitialized = false;
export const initNotificationSounds = () => {
  if (!soundsInitialized) {
    notificationSounds.initSounds();
    soundsInitialized = true;
  }
};

// Auto-initialize on user interaction
if (typeof window !== 'undefined') {
  const initOnInteraction = () => {
    initNotificationSounds();
    document.removeEventListener('click', initOnInteraction);
    document.removeEventListener('keydown', initOnInteraction);
  };

  document.addEventListener('click', initOnInteraction, { once: true });
  document.addEventListener('keydown', initOnInteraction, { once: true });
}