'use client';

import React from 'react';
import Image from 'next/image';
import { ISLANDS } from '../config/islands';

// Helper to convert English numbers to Arabic-Indic
const toArabic = (num: number) => num.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);

export function JourneyProgressHero() {
  const totalIslands = ISLANDS.length;
  // Progress is firmly Truthful Zero per requirements
  const completedIslands = 0; 
  const progressPercent = 0;

  return (
    <div className="journey-progress-hero">
      <div className="hero-progress-info">
        <div className="hero-progress-text">
          <span className="hero-label">تقدم الرحلة</span>
          <span className="hero-value">{toArabic(progressPercent)}٪</span>
        </div>
        <div className="hero-progress-fraction">
          <bdi>{toArabic(completedIslands)}</bdi> من <bdi>{toArabic(totalIslands)}</bdi> جزر
        </div>
      </div>
      
      <div 
        className="hero-progress-track" 
        role="progressbar" 
        aria-valuemin={0} 
        aria-valuemax={totalIslands} 
        aria-valuenow={completedIslands} 
        aria-label={`أكملت ${toArabic(completedIslands)} من ${toArabic(totalIslands)} جزر، بنسبة تقدم ${toArabic(progressPercent)} بالمائة`}
      >
        {ISLANDS.map((island, index) => {
          const isCompleted = index < completedIslands;
          const isCurrent = index === completedIslands;
          const isLocked = index > completedIslands;
          
          let statusClass = 'status-locked';
          if (isCompleted) statusClass = 'status-completed';
          if (isCurrent) statusClass = 'status-current';

          return (
            <React.Fragment key={island.id}>
              {index > 0 && (
                <div className={`hero-track-segment ${isCompleted ? 'segment-completed' : ''}`} />
              )}
              <div className={`hero-track-node ${statusClass}`} title={island.title}>
                {isCompleted ? (
                  <span className="node-check">✓</span>
                ) : isCurrent ? (
                  <div className="node-current-indicator" />
                ) : null}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
