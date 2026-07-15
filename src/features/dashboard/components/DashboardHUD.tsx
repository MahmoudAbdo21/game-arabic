'use client';

import React from 'react';
import { useAudio } from '@/providers/AudioProvider';

const toArabic = (num: number) => num.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);

export function DashboardHUD({ profile, metrics }: { profile?: { id: string; name: string; avatarUrl?: string; }; metrics?: { islandsCompleted?: number; totalStars?: number; nextUnlockId?: string | null; islandsTotal?: number; levelsTotal?: number; levelsCompleted?: number; challengesTotal?: number; challengesCompleted?: number; totalBadges?: number; } }) {
  const { replay } = useAudio();
  
  const islandsTotal = metrics?.islandsTotal || 4;
  const islandsCompleted = metrics?.islandsCompleted || 0;
  
  const levelsTotal = metrics?.levelsTotal || 18;
  const levelsCompleted = metrics?.levelsCompleted || 0;
  
  const challengesTotal = metrics?.challengesTotal || 65;
  const challengesCompleted = metrics?.challengesCompleted || 0;
  
  const totalStars = metrics?.totalStars || 0;
  const totalBadges = metrics?.totalBadges || 0;

  return (
    <div className="dashboard-hud-ribbon">
      <div className="hud-module" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.2)' }} onClick={replay} title="إعادة الصوت">
        <div className="hud-icon">▶️</div>
        <div className="hud-label">إعادة الصوت</div>
      </div>
      
      <div className="hud-module">
        <div className="hud-icon">🏝️</div>
        <div className="hud-label">كؤوس الجزر</div>
        <div className="hud-value"><bdi>{toArabic(islandsCompleted)}</bdi> / <bdi>{toArabic(islandsTotal)}</bdi></div>
      </div>
      
      <div className="hud-module">
        <div className="hud-icon">🎮</div>
        <div className="hud-label">كؤوس الألعاب</div>
        <div className="hud-value"><bdi>{toArabic(levelsCompleted)}</bdi> / <bdi>{toArabic(levelsTotal)}</bdi></div>
      </div>
      
      <div className="hud-module">
        <div className="hud-icon">🏆</div>
        <div className="hud-label">كؤوس التحديات</div>
        <div className="hud-value"><bdi>{toArabic(challengesCompleted)}</bdi> / <bdi>{toArabic(challengesTotal)}</bdi></div>
      </div>

      <div className="hud-module">
        <div className="hud-icon">⭐</div>
        <div className="hud-label">النجوم</div>
        <div className="hud-value">{toArabic(totalStars)}</div>
      </div>

      <div className="hud-module">
        <div className="hud-icon">🎖️</div>
        <div className="hud-label">الشارات</div>
        <div className="hud-value">{toArabic(totalBadges)}</div>
      </div>
    </div>
  );
}
