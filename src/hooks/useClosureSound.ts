/**
 * YAPENDIK SCHOOL OS — WEB AUDIO 432Hz HARMONIC SOUND HOOK
 * Stage 6-A Invisible Mastery #6 & Doktrin D-7
 * 
 * Rules:
 * - Pure Web Audio Oscillator (Zero External File Assets)
 * - Sine 432Hz, Attack 0.05s, Release 1.5s, Low Gain (0.1)
 * - User gesture required (compliant with browser autoplay policies)
 * - Local preference toggle stored in localStorage (default: true)
 */

import { useState, useCallback, useRef } from 'react';
import { canPlay432HzSound } from '../services/briefing/StateMachines';
import { SoundTriggerContext } from '../types/briefingTypes';

const SOUND_PREF_KEY = 'yapendik_sound_closure_enabled';

export function useClosureSound() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SOUND_PREF_KEY);
      return stored !== null ? stored === 'true' : true;
    }
    return true;
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_PREF_KEY, String(next));
      } catch {
        // Ignore storage write error
      }
      return next;
    });
  }, []);

  const playClosureChime = useCallback((triggerContext: SoundTriggerContext = 'INTENTIONAL') => {
    if (typeof window === 'undefined') return;

    // Validate with pure state machine rule (D-7)
    const isAllowed = canPlay432HzSound(triggerContext, true, soundEnabled);
    if (!isAllowed) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Create Oscillator & Gain
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(432.0, now); // Kanonikal 432Hz Harmonic Frequency

      // Envelope: Attack 0.05s, Decay/Release 1.5s
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05); // Subtle peak gain
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.5); // Smooth fade out

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.55);
    } catch {
      // Graceful silence on Web Audio restriction
    }
  }, [soundEnabled]);

  return {
    soundEnabled,
    toggleSound,
    playClosureChime
  };
}
