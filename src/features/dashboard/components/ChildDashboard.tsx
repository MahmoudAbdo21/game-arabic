'use client';

import React, { useEffect } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { ArchipelagoMap } from './ArchipelagoMap';

import { DashboardHUD } from './DashboardHUD';
import { useAudio } from '@/providers/AudioProvider';

export function ChildDashboard({ initialProfile, metrics }: { initialProfile?: { id: string; name: string; avatarId?: string; avatarUrl?: string; }, metrics?: { islandsCompleted?: number; islandsTotal?: number; levelsCompleted?: number; levelsTotal?: number; challengesCompleted?: number; challengesTotal?: number; totalStars?: number; totalBadges?: number; } | null }) {
  const { play } = useAudio();

  useEffect(() => {
    play('global-dashboard-welcome');
  }, [play]);

  return (
    <div className="dashboard-shell">
      <DashboardHeader profile={initialProfile} metrics={metrics || undefined} />
      <DashboardHUD profile={initialProfile} metrics={metrics || undefined} />
      <ArchipelagoMap profile={initialProfile} islandsCompleted={metrics?.islandsCompleted || 0} />
    </div>
  );
}


