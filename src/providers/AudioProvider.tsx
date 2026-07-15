"use client";
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { AUDIO_MAP } from '@/config/audioMap.generated';

export interface AudioOptions {
  onEnded?: () => void;
  onError?: () => void;
  ownerKey?: string; // to prevent stale callbacks
}

export interface AudioContextType {
  isUnlocked: boolean;
  isPlaying: boolean;
  currentAudioId: string | null;
  isManualMode: boolean;
  unlockAudio: () => void;
  play: (audioId: string, options?: AudioOptions) => void;
  playSequence: (audioIds: string[], options?: AudioOptions) => void;
  pause: () => void;
  resume: () => void;
  replay: () => void;
  stop: () => void;
  stopSequence: () => void;
  enterManualMode: () => void;
  resetManualMode: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentOptionsRef = useRef<AudioOptions | null>(null);
  const sequenceRef = useRef<{ ids: string[], currentIndex: number, options?: AudioOptions } | null>(null);
  const tokenRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
      }
    };
  }, []);

  const clearState = useCallback(() => {
    setIsPlaying(false);
    setCurrentAudioId(null);
    currentOptionsRef.current = null;
    tokenRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.removeAttribute("src");
    }
  }, []);

  // Stop on route exit
  useEffect(() => {
    setIsManualMode(false);
    return () => {
      clearState();
      sequenceRef.current = null;
    };
  }, [pathname, clearState]);

  const unlockAudio = useCallback(() => {
    if (isUnlocked) return;
    setIsUnlocked(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
      audioRef.current.pause();
    }
  }, [isUnlocked]);

  const internalPlay = useCallback((audioId: string, options?: AudioOptions) => {
    if (!audioRef.current) return;
    
    clearState();
    const token = tokenRef.current;
    
    const url = AUDIO_MAP[audioId];
    if (!url) {
      console.warn(`Audio ID not found in map: ${audioId}`);
      if (options?.onError) options.onError();
      return;
    }

    currentOptionsRef.current = options || null;
    setCurrentAudioId(audioId);
    
    audioRef.current.src = url;
    audioRef.current.onended = () => {
      if (tokenRef.current !== token) return;
      setIsPlaying(false);
      if (options?.onEnded) options.onEnded();
      
      // Handle sequence
      if (sequenceRef.current && !isManualMode) {
        const seq = sequenceRef.current;
        if (seq.currentIndex < seq.ids.length - 1) {
          seq.currentIndex++;
          const nextId = seq.ids[seq.currentIndex];
          internalPlay(nextId, seq.options);
        } else {
          if (seq.options?.onEnded) seq.options.onEnded();
          sequenceRef.current = null;
        }
      }
    };
    audioRef.current.onerror = () => {
      if (tokenRef.current !== token) return;
      setIsPlaying(false);
      console.error(`Error playing audio: ${audioId}`);
      if (options?.onError) options.onError();
    };

    audioRef.current.play().then(() => {
      if (tokenRef.current === token) {
        setIsPlaying(true);
        if (!isUnlocked) setIsUnlocked(true);
      }
    }).catch((e) => {
      if (tokenRef.current === token) {
        setIsPlaying(false);
        console.warn(`Autoplay blocked or error: ${e.message}`);
        if (options?.onError) options.onError();
      }
    });
  }, [clearState, isUnlocked, isManualMode]);

  const play = useCallback((audioId: string, options?: AudioOptions) => {
    sequenceRef.current = null; // playing a single audio stops sequence
    internalPlay(audioId, options);
  }, [internalPlay]);

  const playSequence = useCallback((audioIds: string[], options?: AudioOptions) => {
    if (!audioIds || audioIds.length === 0) return;
    sequenceRef.current = { ids: audioIds, currentIndex: 0, options };
    internalPlay(audioIds[0]);
  }, [internalPlay]);

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (audioRef.current && !isPlaying && currentAudioId) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  }, [isPlaying, currentAudioId]);

  const replay = useCallback(() => {
    if (sequenceRef.current) {
      // Replay full active sequence
      sequenceRef.current.currentIndex = 0;
      internalPlay(sequenceRef.current.ids[0]);
    } else if (currentAudioId) {
      // Replay current single audio
      internalPlay(currentAudioId, currentOptionsRef.current || undefined);
    }
  }, [currentAudioId, internalPlay]);

  const stop = useCallback(() => {
    clearState();
    sequenceRef.current = null;
  }, [clearState]);

  const stopSequence = useCallback(() => {
    sequenceRef.current = null;
  }, []);

  const enterManualMode = useCallback(() => {
    setIsManualMode(true);
  }, []);

  const resetManualMode = useCallback(() => {
    setIsManualMode(false);
  }, []);

  return (
    <AudioContext.Provider value={{
      isUnlocked,
      isPlaying,
      currentAudioId,
      isManualMode,
      unlockAudio,
      play,
      playSequence,
      pause,
      resume,
      replay,
      stop,
      stopSequence,
      enterManualMode,
      resetManualMode
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
