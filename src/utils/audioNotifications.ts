// Audio notification system for communication
export class AudioNotifications {
  private static instance: AudioNotifications;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private isInitialized = false;

  static getInstance(): AudioNotifications {
    if (!AudioNotifications.instance) {
      AudioNotifications.instance = new AudioNotifications();
    }
    return AudioNotifications.instance;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.loadSounds();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Audio notifications not available:', error);
    }
  }

  private async loadSounds() {
    const soundDefinitions = {
      incoming_call: this.generateTone(800, 0.3, [0.8, 0.2, 0.8, 0.2]), // Ring tone
      call_connected: this.generateTone(1000, 0.2, [0.5]), // Connection beep
      call_ended: this.generateTone(400, 0.3, [0.3]), // End call tone
      mute_on: this.generateTone(600, 0.1, [0.2]), // Mute sound
      mute_off: this.generateTone(800, 0.1, [0.2]), // Unmute sound
      message_received: this.generateTone(900, 0.1, [0.3, 0.1, 0.3]), // Message notification
      typing: this.generateTone(500, 0.05, [0.1]), // Typing sound
      call_waiting: this.generateTone(600, 0.2, [0.4, 0.1]), // Call waiting
      missed_call: this.generateTone(300, 0.5, [0.6, 0.2, 0.6]) // Missed call notification
    };

    for (const [name, buffer] of Object.entries(soundDefinitions)) {
      this.sounds.set(name, buffer);
    }
  }

  private generateTone(frequency: number, duration: number, volumes: number[]): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');
    
    const sampleRate = this.audioContext.sampleRate;
    const totalSamples = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, totalSamples, sampleRate);
    const data = buffer.getChannelData(0);

    let currentSample = 0;
    const segmentLength = totalSamples / volumes.length;

    volumes.forEach((volume, segmentIndex) => {
      const startSample = Math.floor(segmentIndex * segmentLength);
      const endSample = Math.floor((segmentIndex + 1) * segmentLength);
      
      for (let i = startSample; i < endSample && i < totalSamples; i++) {
        const time = i / sampleRate;
        const sample = Math.sin(2 * Math.PI * frequency * time) * volume;
        
        // Apply envelope for smooth transitions
        const fadeIn = Math.min(1, (i - startSample) / (sampleRate * 0.01));
        const fadeOut = Math.min(1, (endSample - i) / (sampleRate * 0.01));
        
        data[i] = sample * fadeIn * fadeOut;
      }
    });

    return buffer;
  }

  async playSound(soundName: string, loop = false): Promise<AudioBufferSourceNode | null> {
    if (!this.isInitialized || !this.audioContext || !this.sounds.has(soundName)) {
      return null;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.sounds.get(soundName)!;
      source.loop = loop;
      
      // Connect audio graph
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Set volume based on sound type
      const volume = this.getVolumeForSound(soundName);
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      
      source.start();
      return source;
    } catch (error) {
      console.warn('Failed to play sound:', soundName, error);
      return null;
    }
  }

  private getVolumeForSound(soundName: string): number {
    const volumes: Record<string, number> = {
      incoming_call: 0.7,
      call_connected: 0.5,
      call_ended: 0.6,
      mute_on: 0.3,
      mute_off: 0.3,
      message_received: 0.4,
      typing: 0.2,
      call_waiting: 0.5,
      missed_call: 0.8
    };
    return volumes[soundName] || 0.5;
  }

  stopSound(source: AudioBufferSourceNode | null) {
    if (source) {
      try {
        source.stop();
      } catch (error) {
        // Source might already be stopped
      }
    }
  }

  // Vibration for mobile devices
  vibrate(pattern: number | number[]) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  // Play specific notification patterns
  async playIncomingCall(): Promise<AudioBufferSourceNode | null> {
    this.vibrate([1000, 500, 1000, 500, 1000]);
    return this.playSound('incoming_call', true);
  }

  async playCallConnected() {
    this.vibrate(200);
    return this.playSound('call_connected');
  }

  async playCallEnded() {
    this.vibrate([300, 100, 300]);
    return this.playSound('call_ended');
  }

  async playMuteToggle(isMuted: boolean) {
    this.vibrate(100);
    return this.playSound(isMuted ? 'mute_on' : 'mute_off');
  }

  async playMessageReceived() {
    this.vibrate([200, 100, 200]);
    return this.playSound('message_received');
  }

  async playMissedCall() {
    this.vibrate([1000, 300, 1000, 300, 1000]);
    return this.playSound('missed_call');
  }
}

export const audioNotifications = AudioNotifications.getInstance();