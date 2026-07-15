'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ISLANDS, Island } from '../config/islands';
import { IslandNode } from './IslandNode';
import { useAudio } from '@/providers/AudioProvider';

export function ArchipelagoMap({ profile, islandsCompleted = 0 }: { profile?: { id: string; name: string; avatarUrl?: string; }, islandsCompleted?: number }) {
  const router = useRouter();
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);
  const { play, stop } = useAudio();

  const getIslandState = (sequence: number): 'UNLOCKED' | 'LOCKED' => {
    return sequence <= islandsCompleted + 1 ? 'UNLOCKED' : 'LOCKED';
  };

  const handleIslandSelect = (island: Island) => {
    if (getIslandState(island.sequence) === 'UNLOCKED') {
      stop();
      router.push(`/islands/${island.id}`);
    } else {
      stop();
      play('global-dashboard-locked-island');
      setLockedMessage(`الجزيرة مغلقة. تُفتح بعد إكمال ما قبلها.`);
      setTimeout(() => setLockedMessage(null), 3000);
    }
  };

  return (
    <main className="archipelago-stage relative">
      <div className="map-container">
        <svg className="journey-path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path 
            className="path-line" 
            d="M 15 30 Q 30 60 40 60 T 65 30 T 85 70" 
          />
        </svg>

        {ISLANDS.map(island => (
          <IslandNode 
            key={island.id} 
            island={{ ...island, state: getIslandState(island.sequence) }} 
            onSelect={() => handleIslandSelect(island)} 
          />
        ))}
      </div>

      {lockedMessage && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full font-bold shadow-xl animate-bounce">
          {lockedMessage}
        </div>
      )}
    </main>
  );
}
