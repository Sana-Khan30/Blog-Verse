import { useRef, useEffect, useCallback, createContext, useContext, useState } from 'react';

// ─────────────────────────────────────────────
// Sound Manager Context
// ─────────────────────────────────────────────
const SoundContext = createContext(null);

// Generate a futuristic click sound using Web Audio API
const generateClickSound = (ctx) => {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(800, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

  gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.08);
};

// Generate a soft hover tick
const generateHoverTick = (ctx) => {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(2000, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.02);

  gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.03);
};

// Generate a premium notification ping
const generatePing = (ctx) => {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(523, ctx.currentTime); // C5
  oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
  oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5

  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.35);
};

// Generate a like/heart burst sound
const generateHeartBurst = (ctx) => {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc1.type = 'sine';
  osc2.type = 'triangle';
  osc1.frequency.setValueAtTime(400, ctx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
  osc2.frequency.setValueAtTime(600, ctx.currentTime);

  gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc1.start(ctx.currentTime);
  osc2.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.15);
  osc2.stop(ctx.currentTime + 0.15);
};

// Generate page transition swoosh
const generateSwoosh = (ctx) => {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(200, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);

  gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.25);
};

// Generate bookmark snap sound
const generateBookmarkSnap = (ctx) => {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(300, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
  oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.12);
};

// Sound Manager Provider
export const SoundManager = ({ children }) => {
  const audioCtxRef = useRef(null);
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);

  // Initialize audio context lazily (requires user interaction)
  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      // Resume if suspended
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };

    // Try to init on first user interaction
    const handleInteraction = () => {
      initAudio();
    };

    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Play sound function
  const playSound = useCallback((soundType) => {
    if (!enabled || volume === 0) return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      switch (soundType) {
        case 'click':
          generateClickSound(ctx);
          break;
        case 'hover':
          generateHoverTick(ctx);
          break;
        case 'ping':
          generatePing(ctx);
          break;
        case 'like':
          generateHeartBurst(ctx);
          break;
        case 'swoosh':
          generateSwoosh(ctx);
          break;
        case 'bookmark':
          generateBookmarkSnap(ctx);
          break;
        default:
          generateClickSound(ctx);
      }
    } catch (err) {
      // Silently fail if audio not supported
    }
  }, [enabled, volume]);

  // Toggle sound
  const toggleSound = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  // Change volume
  const changeVolume = useCallback((vol) => {
    setVolume(Math.max(0, Math.min(1, vol)));
  }, []);

  const value = {
    playSound,
    enabled,
    toggleSound,
    volume,
    changeVolume,
    soundTypes: ['click', 'hover', 'ping', 'like', 'swoosh', 'bookmark'],
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
};

// Custom hook to use sound
export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    // Return dummy functions if used outside provider
    return {
      playSound: () => {},
      enabled: true,
      toggleSound: () => {},
      volume: 0.5,
      changeVolume: () => {},
    };
  }
  return context;
};

export default SoundManager;