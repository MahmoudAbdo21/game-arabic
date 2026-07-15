'use client';

import React from 'react';
import Image from 'next/image';
import { Persona } from '../config/personas';
import { PersonaAudioPreview } from './PersonaAudioPreview';

interface PersonaCardProps {
  persona: Persona;
  isSelected: boolean;
  onSelect: () => void;
  audioTranscript: string;
}

export function PersonaCard({ persona, isSelected, onSelect, audioTranscript }: PersonaCardProps) {
  return (
    <div 
      className={`persona-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="persona-image-wrapper">
        <Image 
          src={persona.imageSrc} 
          alt={persona.imageAlt} 
          fill 
          sizes="(max-width: 768px) 50vw, 25vw"
          className="persona-image" 
        />
        <div className="audio-preview-overlay">
          <PersonaAudioPreview transcript={audioTranscript} />
        </div>
      </div>
      <div className="persona-info">
        <h3 className="persona-title">{persona.title}</h3>
        <p className="persona-trait">{persona.trait}</p>
      </div>
    </div>
  );
}
