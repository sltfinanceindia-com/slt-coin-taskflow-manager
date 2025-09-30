// Enhanced Audio Notifications System for SLT Communication
interface SoundConfig {
  frequency: number;
  duration: number;
  volumes: number[];
  waveType?: OscillatorType;
  harmonics?: Array<{ frequency: number; gain: number }>;
}

interface NotificationSettings {
  masterVolume: number;
  enabled: boolean;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
}

class AudioNotifications {
  private static instance: AudioNotifications;
  private audioContext: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private soundBuffers: Map<string, AudioBuffer> = new Map();
  private activeSources: Map<string, AudioBufferSourceNode> = new Map();
  private isInitialized: boolean = false;
  private settings: NotificationSettings = {
    masterVolume: 0.7,
    enabled: true,
    vibrationEnabled: true,
    soundEnabled: true
  };

  static getInstance(): AudioNotifications {
    if (!AudioNotifications.instance) {
      AudioNotifications.instance = new AudioNotifications();
    }
    return AudioNotifications.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Handle user activation requirement for modern browsers
      await this.createAudioContext();
      await this.loadSounds();
      this.setupEventListeners();
      this.isInitialized = true;
      console.log('Audio notifications initialized successfully');
    } catch (error) {
      console.warn('Audio notifications initialization failed:', error);
      // Graceful fallback - disable audio but keep vibration
      this.settings.soundEnabled = false;
    }
  }

  private async createAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create master gain node for volume control
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.gain.value = this.settings.masterVolume;
      this.masterGainNode.connect(this.audioContext.destination);

      // Handle browser autoplay policy
      if (this.audioContext.state === 'suspended') {
        await this.resumeAudioContext();
      }
    } catch (error) {
      throw new Error(`Failed to create AudioContext: ${error}`);
    }
  }

  private async resumeAudioContext(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('AudioContext resumed');
      } catch (error) {
        console.warn('Failed to resume AudioContext:', error);
      }
    }
  }

  private setupEventListeners(): void {
    // Auto-resume audio context on user interaction
    const resumeAudio = async () => {
      await this.resumeAudioContext();
      // Remove listeners after first interaction
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('keydown', resumeAudio);
      document.removeEventListener('touchstart', resumeAudio);
    };

    document.addEventListener('click', resumeAudio, { once: true });
    document.addEventListener('keydown', resumeAudio, { once: true });
    document.addEventListener('touchstart', resumeAudio, { once: true });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAllSounds();
      }
    });
  }

  private async loadSounds(): Promise<void> {
    if (!this.audioContext) return;

    const soundConfigs: Record<string, SoundConfig> = {
      incomingCall: {
        frequency: 800,
        duration: 1.2,
        volumes: [0.6, 0.4, 0.2, 0.1],
        waveType: 'sine',
        harmonics: [
          { frequency: 1600, gain: 0.2 },
          { frequency: 2400, gain: 0.1 }
        ]
      },
      outgoingCall: {
        frequency: 440,
        duration: 0.5,
        volumes: [0.4, 0.3, 0.2],
        waveType: 'triangle'
      },
      callConnected: {
        frequency: 600,
        duration: 0.3,
        volumes: [0.5, 0.3],
        waveType: 'sine'
      },
      callEnded: {
        frequency: 300,
        duration: 0.6,
        volumes: [0.4, 0.2, 0.1],
        waveType: 'square'
      },
      messageReceived: {
        frequency: 700,
        duration: 0.2,
        volumes: [0.3, 0.15],
        waveType: 'sine'
      },
      messageSent: {
        frequency: 650,
        duration: 0.15,
        volumes: [0.25],
        waveType: 'triangle'
      },
      muteOn: {
        frequency: 400,
        duration: 0.12,
        volumes: [0.3],
        waveType: 'square'
      },
      muteOff: {
        frequency: 600,
        duration: 0.12,
        volumes: [0.3],
        waveType: 'sine'
      },
      missedCall: {
        frequency: 350,
        duration: 0.8,
        volumes: [0.5, 0.3, 0.1],
        waveType: 'sawtooth'
      },
      typing: {
        frequency: 900,
        duration: 0.08,
        volumes: [0.15],
        waveType: 'sine'
      },
      error: {
        frequency: 250,
        duration: 0.7,
        volumes: [0.4, 0.2, 0.1],
        waveType: 'sawtooth'
      },
      success: {
        frequency: 800,
        duration: 0.4,
        volumes: [0.3, 0.2, 0.1],
        waveType: 'sine',
        harmonics: [
          { frequency: 1200, gain: 0.15 }
        ]
      },
      notification: {
        frequency: 750,
        duration: 0.25,
        volumes: [0.35, 0.2],
        waveType: 'sine'
      }
    };

    const loadPromises = Object.entries(soundConfigs).map(async ([name, config]) => {
      try {
        const buffer = await this.generateAdvancedTone(config);
        this.soundBuffers.set(name, buffer);
      } catch (error) {
        console.warn(`Failed to generate sound '${name}':`, error);
      }
    });

    await Promise.all(loadPromises);
    console.log(`Loaded ${this.soundBuffers.size} sound buffers`);
  }

  private async generateAdvancedTone(config: SoundConfig): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const { frequency, duration, volumes, waveType = 'sine', harmonics = [] } = config;
    const sampleRate = this.audioContext.sampleRate;
    const numChannels = 2;
    const numSamples = Math.floor(sampleRate * duration);
    
    const buffer = this.audioContext.createBuffer(numChannels, numSamples, sampleRate);
    
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const progress = t / duration;
        
        // Calculate volume envelope
        const segmentLength = 1 / volumes.length;
        const segmentIndex = Math.floor(progress / segmentLength);
        const currentVolume = volumes[Math.min(segmentIndex, volumes.length - 1)];
        
        // Generate base waveform
        let sample = this.generateWaveform(waveType, frequency, t);
        
        // Add harmonics for richer sound
        harmonics.forEach(harmonic => {
          sample += this.generateWaveform(waveType, harmonic.frequency, t) * harmonic.gain;
        });
        
        // Apply envelope (ADSR-like)
        const envelope = this.calculateEnvelope(progress, duration);
        
        // Apply stereo panning for better spatial audio
        const panningFactor = channel === 0 ? 0.9 : 1.1;
        
        channelData[i] = sample * currentVolume * envelope * panningFactor;
      }
    }
    
    return buffer;
  }

  private generateWaveform(type: OscillatorType, frequency: number, time: number): number {
    const phase = 2 * Math.PI * frequency * time;
    
    switch (type) {
      case 'sine':
        return Math.sin(phase);
      case 'square':
        return Math.sign(Math.sin(phase));
      case 'sawtooth':
        return 2 * (time * frequency - Math.floor(time * frequency + 0.5));
      case 'triangle':
        return 2 * Math.abs(2 * (time * frequency - Math.floor(time * frequency + 0.5))) - 1;
      default:
        return Math.sin(phase);
    }
  }

  private calculateEnvelope(progress: number, duration: number): number {
    const attackTime = 0.1;
    const decayTime = 0.2;
    const sustainLevel = 0.7;
    const releaseTime = 0.3;

    if (progress < attackTime) {
      // Attack phase
      return progress / attackTime;
    } else if (progress < attackTime + decayTime) {
      // Decay phase
      const decayProgress = (progress - attackTime) / decayTime;
      return 1 - (1 - sustainLevel) * decayProgress;
    } else if (progress < 1 - releaseTime) {
      // Sustain phase
      return sustainLevel;
    } else {
      // Release phase
      const releaseProgress = (progress - (1 - releaseTime)) / releaseTime;
      return sustainLevel * (1 - releaseProgress);
    }
  }

  async playSound(
    soundName: string, 
    options: {
      loop?: boolean;
      volume?: number;
      stopPrevious?: boolean;
    } = {}
  ): Promise<AudioBufferSourceNode | null> {
    if (!this.settings.enabled || !this.settings.soundEnabled) {
      return null;
    }

    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.audioContext || !this.masterGainNode || !this.soundBuffers.has(soundName)) {
      return null;
    }

    const { loop = false, volume = 1, stopPrevious = false } = options;

    try {
      // Stop previous instance if requested
      if (stopPrevious && this.activeSources.has(soundName)) {
        this.stopSound(soundName);
      }

      // Resume context if suspended
      await this.resumeAudioContext();

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.soundBuffers.get(soundName)!;
      source.loop = loop;
      
      // Set individual sound volume
      gainNode.gain.value = volume * this.getVolumeForSound(soundName);
      
      // Connect the audio graph
      source.connect(gainNode);
      gainNode.connect(this.masterGainNode);
      
      // Track active sources
      this.activeSources.set(soundName, source);
      
      source.onended = () => {
        this.activeSources.delete(soundName);
      };
      
      source.start();
      return source;
    } catch (error) {
      console.warn(`Failed to play sound '${soundName}':`, error);
      return null;
    }
  }

  private getVolumeForSound(soundName: string): number {
    const volumes: Record<string, number> = {
      incomingCall: 0.8,
      outgoingCall: 0.6,
      callConnected: 0.7,
      callEnded: 0.6,
      messageReceived: 0.5,
      messageSent: 0.4,
      muteOn: 0.4,
      muteOff: 0.4,
      missedCall: 0.7,
      typing: 0.3,
      error: 0.6,
      success: 0.5,
      notification: 0.5
    };
    return volumes[soundName] || 0.4;
  }

  stopSound(soundName: string): void {
    const source = this.activeSources.get(soundName);
    if (source) {
      try {
        source.stop();
        this.activeSources.delete(soundName);
      } catch (error) {
        console.warn(`Failed to stop sound '${soundName}':`, error);
      }
    }
  }

  stopAllSounds(): void {
    this.activeSources.forEach((source, soundName) => {
      try {
        source.stop();
      } catch (error) {
        console.warn(`Failed to stop sound '${soundName}':`, error);
      }
    });
    this.activeSources.clear();
  }

  pauseAllSounds(): void {
    // Web Audio API doesn't have pause, so we stop and can restart later
    this.stopAllSounds();
  }

  // Enhanced vibration with patterns
  vibrate(pattern: number | number[]): void {
    if (!this.settings.enabled || !this.settings.vibrationEnabled) {
      return;
    }

    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn('Vibration failed:', error);
      }
    }
  }

  // Enhanced notification methods with better error handling
  async playIncomingCall(): Promise<AudioBufferSourceNode | null> {
    this.vibrate([500, 300, 500, 300, 500]);
    return this.playSound('incomingCall', { loop: true, stopPrevious: true });
  }

  async playOutgoingCall(): Promise<AudioBufferSourceNode | null> {
    this.vibrate([200, 100, 200]);
    return this.playSound('outgoingCall', { stopPrevious: true });
  }

  async playCallConnected(): Promise<AudioBufferSourceNode | null> {
    this.vibrate([200, 100, 200]);
    // Stop any ringing sounds
    this.stopSound('incomingCall');
    this.stopSound('outgoingCall');
    return this.playSound('callConnected');
  }

  async playCallEnded(): Promise<AudioBufferSourceNode | null> {
    this.vibrate([300, 200, 100]);
    this.stopAllSounds(); // Stop all call-related sounds
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
    return this.playSound('typing', { volume: 0.5 });
  }

  async playError(): Promise<AudioBufferSourceNode | null> {
    this.vibrate([200, 100, 200, 100, 200]);
    return this.playSound('error');
  }

  async playSuccess(): Promise<AudioBufferSourceNode | null> {
    this.vibrate([100, 50, 100]);
    return this.playSound('success');
  }

  async playNotification(): Promise<AudioBufferSourceNode | null> {
    this.vibrate([150, 100, 150]);
    return this.playSound('notification');
  }

  // Video call specific sounds
  async playVideoCallStart(): Promise<AudioBufferSourceNode | null> {
    this.vibrate([150, 100, 150]);
    return this.playSound('callConnected', { volume: 0.8 });
  }

  async playScreenShareStart(): Promise<AudioBufferSourceNode | null> {
    this.vibrate(100);
    return this.playSound('success', { volume: 0.6 });
  }

  async playScreenShareStop(): Promise<AudioBufferSourceNode | null> {
    this.vibrate(100);
    return this.playSound('callEnded', { volume: 0.5 });
  }

  // Settings management
  setMasterVolume(volume: number): void {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.settings.masterVolume;
    }
  }

  setEnabled(enabled: boolean): void {
    this.settings.enabled = enabled;
    if (!enabled) {
      this.stopAllSounds();
    }
  }

  setSoundEnabled(enabled: boolean): void {
    this.settings.soundEnabled = enabled;
    if (!enabled) {
      this.stopAllSounds();
    }
  }

  setVibrationEnabled(enabled: boolean): void {
    this.settings.vibrationEnabled = enabled;
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Performance monitoring
  getPerformanceInfo(): {
    isInitialized: boolean;
    audioContextState: string;
    activeSourcesCount: number;
    loadedSoundsCount: number;
  } {
    return {
      isInitialized: this.isInitialized,
      audioContextState: this.audioContext?.state || 'not-created',
      activeSourcesCount: this.activeSources.size,
      loadedSoundsCount: this.soundBuffers.size
    };
  }

  // Clean up resources
  async destroy(): Promise<void> {
    this.stopAllSounds();
    
    if (this.audioContext) {
      try {
        await this.audioContext.close();
      } catch (error) {
        console.warn('Error closing AudioContext:', error);
      }
      this.audioContext = null;
    }
    
    this.masterGainNode = null;
    this.soundBuffers.clear();
    this.activeSources.clear();
    this.isInitialized = false;
    
    console.log('Audio notifications destroyed');
  }
}

// Export singleton instance
export const audioNotifications = AudioNotifications.getInstance();

// Initialize on first import (lazy initialization)
audioNotifications.initialize().catch(console.warn);
