'use client';

import React from 'react';

// Helper to convert English numbers to Arabic-Indic
const toArabic = (num: number) => num.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);

export function JourneyProgressPanel() {
  const totalIslands = 4;
  const completedIslands = 0; // Fixed to 0 per requirements
  const progressPercent = 0;

  return (
    <div className="journey-progress-panel">
      <div className="progress-header">
        <span className="progress-label">تقدم الرحلة</span>
        <span className="progress-value">{toArabic(progressPercent)}٪</span>
      </div>
      
      <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={totalIslands} aria-valuenow={completedIslands} aria-label={`أكملت ${toArabic(completedIslands)} من ${toArabic(totalIslands)} جزر، بنسبة تقدم ${toArabic(progressPercent)} بالمائة`}>
        {Array.from({ length: totalIslands }).map((_, index) => {
          const isCompleted = index < completedIslands;
          const isCurrent = index === completedIslands;
          const isLocked = index > completedIslands;
          
          let statusClass = 'status-locked';
          if (isCompleted) statusClass = 'status-completed';
          if (isCurrent) statusClass = 'status-current';

          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <div className={`track-segment ${isCompleted ? 'segment-completed' : ''}`} />
              )}
              <div className={`track-node ${statusClass}`}>
                {isCompleted && <span className="node-check">✓</span>}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      
      <div className="progress-footer">
        <bdi>{toArabic(completedIslands)}</bdi> من <bdi>{toArabic(totalIslands)}</bdi> جزر
      </div>
    </div>
  );
}
