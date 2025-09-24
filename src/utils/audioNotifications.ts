// Enhanced Audio Notifications System for SLT Communication
class AudioNotifications {
  private static instance: AudioNotifications;
  private audioContext: AudioContext | null = null;
  private soundBuffers: Map<string, AudioBuffer> = new Map();
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private isInitialized: boolean = false;

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
    if (!this.audioContext) return;

    const sounds = {
      incomingCall: { frequency: 800, duration: 0.8, volumes: [0.6, 0.3, 0.1] },
      outgoingCall: { frequency: 440, duration: 0.3, volumes: [0.4, 0.2] },
      callConnected: { frequency: 600, duration: 0.2, volumes: [0.5] },
      callEnded: { frequency: 300, duration: 0.4, volumes: [0.4, 0.2] },
      messageReceived: { frequency: 700, duration: 0.15, volumes: [0.3] },
      messageSent: { frequency: 650, duration: 0.1, volumes: [0.2] },
      muteOn: { frequency: 400, duration: 0.1, volumes: [0.3] },
      muteOff: { frequency: 600, duration: 0.1, volumes: [0.3] },
      missedCall: { frequency: 350, duration: 0.6, volumes: [0.5, 0.3] },
      typing: { frequency: 900, duration: 0.05, volumes: [0.1] },
      error: { frequency: 250, duration: 0.5, volumes: [0.4, 0.2] },
      success: { frequency: 800, duration: 0.3, volumes: [0.3, 0.2] }
    };

    for (const [name, config] of Object.entries(sounds)) {
      const buffer = this.generateTone(config.frequency, config.duration, config.volumes);
      this.soundBuffers.set(name, buffer);
    }
  }

  private generateTone(frequency: number, duration: number, volumes: number[]): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const sampleRate = this.audioContext.sampleRate;
    const numChannels = 2;
    const numSamples = sampleRate * duration;
    
    const buffer = this.audioContext.createBuffer(numChannels, numSamples, sampleRate);
    
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const segmentLength = duration / volumes.length;
        const segmentIndex = Math.floor(t / segmentLength);
        const volume = volumes[Math.min(segmentIndex, volumes.length - 1)];
        
        // Create a more pleasant tone with some harmonics
        const fundamental = Math.sin(2 * Math.PI * frequency * t);
        const harmonic = Math.sin(2 * Math.PI * frequency * 2 * t) * 0.1;
        const envelope = Math.exp(-t * 2); // Exponential decay
        
        channelData[i] = (fundamental + harmonic) * volume * envelope;
      }
    }
    
    return buffer;
  }

  async playSound(soundName: string, loop: boolean = false): Promise<AudioBufferSourceNode | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.audioContext || !this.soundBuffers.has(soundName)) {
      return null;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.soundBuffers.get(soundName)!;
      source.loop = loop;
      
      // Set volume based on sound type
      gainNode.gain.value = this.getVolumeForSound(soundName);
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      this.activeSources.add(source);
      
      source.onended = () => {
        this.activeSources.delete(source);
      };
      
      source.start();
      return source;
    } catch (error) {
      console.warn('Failed to play sound:', error);
      return null;
    }
  }

  private getVolumeForSound(soundName: string): number {
    const volumes: Record<string, number> = {
      incomingCall: 0.7,
      outgoingCall: 0.5,
      callConnected: 0.6,
      callEnded: 0.5,
      messageReceived: 0.4,
      messageSent: 0.3,
      muteOn: 0.3,
      muteOff: 0.3,
      missedCall: 0.6,
      typing: 0.2,
      error: 0.5,
      success: 0.4
    };
    return volumes[soundName] || 0.3;
  }

  stopSound(source: AudioBufferSourceNode | null) {
    if (source && this.activeSources.has(source)) {
      try {
        source.stop();
        this.activeSources.delete(source);
      } catch (error) {
        console.warn('Failed to stop sound:', error);
      }
    }
  }

  stopAllSounds() {
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch (error) {
        console.warn('Failed to stop sound source:', error);
      }
    });
    this.activeSources.clear();
  }

  // Vibration for mobile devices
  vibrate(pattern: number | number[]) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  // Enhanced notification patterns
  async playIncomingCall(): Promise<AudioBufferSourceNode | null> {
    this.vibrate([500, 300, 500, 300, 500]);
    return this.playSound('incomingCall', true);
  }

  async playOutgoingCall(): Promise<AudioBufferSourceNode | null> {
    this.vibrate(200);
    return this.playSound('outgoingCall');
  }

  async playCallConnected(): Promise<AudioBufferSourceNode | null> {
    this.vibrate([200, 100, 200]);
    return this.playSound('callConnected');
  }

  async playCallEnded(): Promise<AudioBufferSourceNode | null> {
    this.vibrate([300, 200, 100]);
    return this.playSound('callEnded');
  }

  async playMuteToggle(isMuted: boolean): Promise<AudioBufferSourceNode | null> {
    this.vibrate(100);
    return this.playSound(isMuted ? 'muteOn' : 'muteOff');
  }

  async playMessageReceived(): Promise<AudioBufferSourceNode | null> {
    this.vibrate([100, 50, 100]);
    return this.playSound('messageReceived');
  }

  async playMessageSent(): Promise<AudioBufferSourceNode | null> {
    this.vibrate(50);
    return this.playSound('messageSent');
  }

  async playMissedCall(): Promise<AudioBufferSourceNode | null> {
    this.vibrate([300, 200, 300, 200, 300]);
    return this.playSound('missedCall');
  }

  async playTyping(): Promise<AudioBufferSourceNode | null> {
    return this.playSound('typing');
  }

  async playError(): Promise<AudioBufferSourceNode | null> {
    this.vibrate([200, 100, 200, 100, 200]);
    return this.playSound('error');
  }

  async playSuccess(): Promise<AudioBufferSourceNode | null> {
    this.vibrate([100, 50, 100]);
    return this.playSound('success');
  }

  // Video call specific sounds
  async playVideoCallStart(): Promise<AudioBufferSourceNode | null> {
    this.vibrate([150, 100, 150]);
    return this.playSound('callConnected');
  }

  async playScreenShareStart(): Promise<AudioBufferSourceNode | null> {
    this.vibrate(100);
    return this.playSound('success');
  }

  async playScreenShareStop(): Promise<AudioBufferSourceNode | null> {
    this.vibrate(100);
    return this.playSound('callEnded');
  }

  // Settings
  setMasterVolume(volume: number) {
    if (this.audioContext) {
      // Note: This would require a master gain node in a full implementation
      console.log('Master volume set to:', volume);
    }
  }

  // Clean up resources
  destroy() {
    this.stopAllSounds();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.soundBuffers.clear();
    this.isInitialized = false;
  }
}

export const audioNotifications = AudioNotifications.getInstance();