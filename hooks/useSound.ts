import { useRef, useEffect, useCallback } from 'react';

// High-quality, subtle UI sounds
const POP_SOFT_URL = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'; // Soft Pop
const UI_TINK_URL = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'; // Gentle Swish/Tink
const SUCCESS_SHINE_URL = 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'; // Magical Sparkle
// Updated to a longer, cute background music track
const BGM_URL = 'https://assets.mixkit.co/music/preview/mixkit-sweet-and-happy-mood-1205.mp3'; 

export const useSound = (enabled: boolean = true) => {
  const clickAudio = useRef<HTMLAudioElement | null>(null);
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const transitionAudio = useRef<HTMLAudioElement | null>(null);
  const bgMusicAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize Audio objects
    clickAudio.current = new Audio(POP_SOFT_URL);
    clickAudio.current.volume = 0.15; // Very subtle

    successAudio.current = new Audio(SUCCESS_SHINE_URL);
    successAudio.current.volume = 0.25; // Satisfying but not loud

    transitionAudio.current = new Audio(UI_TINK_URL);
    transitionAudio.current.volume = 0.1; // Almost barely audible airiness

    bgMusicAudio.current = new Audio(BGM_URL);
    bgMusicAudio.current.loop = true;
    bgMusicAudio.current.volume = 0.08; // Pleasant background level
  }, []);

  const playClick = useCallback(() => {
    if (enabled && clickAudio.current) {
      const sound = clickAudio.current.cloneNode() as HTMLAudioElement;
      sound.volume = 0.15;
      sound.play().catch(() => {});
    }
  }, [enabled]);

  const playSuccess = useCallback(() => {
    if (enabled && successAudio.current) {
      successAudio.current.currentTime = 0;
      successAudio.current.play().catch(() => {});
    }
  }, [enabled]);

  const playTransition = useCallback(() => {
    if (enabled && transitionAudio.current) {
      transitionAudio.current.currentTime = 0;
      transitionAudio.current.play().catch(() => {});
    }
  }, [enabled]);

  const startMusic = useCallback(() => {
    if (enabled && bgMusicAudio.current) {
      bgMusicAudio.current.play().catch((e) => {
        // Auto-play might be blocked, this is expected until user interaction
        // console.log("Autoplay prevented");
      });
    }
  }, [enabled]);

  const stopMusic = useCallback(() => {
    if (bgMusicAudio.current) {
      bgMusicAudio.current.pause();
    }
  }, []);

  // Sync music state with enabled prop immediately
  useEffect(() => {
    if (enabled) {
      startMusic();
    } else {
      stopMusic();
    }
  }, [enabled, startMusic, stopMusic]);

  return { playClick, playSuccess, playTransition, startMusic, stopMusic };
};