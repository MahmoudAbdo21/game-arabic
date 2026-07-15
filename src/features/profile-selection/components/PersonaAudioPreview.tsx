'use client';

import React, { useState } from 'react';

export function PersonaAudioPreview({ transcript }: { transcript: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="audio-preview-container">
      <button 
        type="button"
        className="btn-audio-preview"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label="استمع إلى النص"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="audio-preview-popover">
          <div className="popover-header">هذا هو النص الذي سيُنطق بعد مراجعة الصوت واعتماده</div>
          <div className="popover-content">{transcript}</div>
          <button type="button" className="popover-close" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>إغلاق</button>
        </div>
      )}
    </div>
  );
}
