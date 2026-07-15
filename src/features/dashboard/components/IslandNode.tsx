'use client';

import React from 'react';
import Image from 'next/image';
import { Island } from '../config/islands';
import { useFloatingIslandMotion } from '../hooks/useFloatingIslandMotion';

interface IslandNodeProps {
  island: Island;
  onSelect: () => void;
}

export function IslandNode({ island, onSelect }: IslandNodeProps) {
  const isLocked = island.state === 'LOCKED';
  const motionRef = useFloatingIslandMotion(island.sequence);

  return (
    <div 
      className={`island-node island-pos-${island.sequence} ${!isLocked ? 'is-available' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-label={`${island.title} ${isLocked ? '(مغلقة)' : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div 
        ref={motionRef}
        className={`island-image-wrapper ${isLocked ? 'is-locked' : ''}`}
      >
        <Image 
          src={island.imageSrc} 
          alt={island.imageAlt} 
          fill 
          sizes="(max-width: 768px) 200px, 240px"
          className="island-image" 
        />
      </div>
      <div className={`island-label ${isLocked ? 'is-locked' : ''}`}>
        {isLocked && <div className="lock-badge">🔒</div>}
        {island.title}
      </div>
    </div>
  );
}
