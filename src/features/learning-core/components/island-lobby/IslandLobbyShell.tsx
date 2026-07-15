"use client";
import React, { CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './IslandLobbyShell.module.css';
import { type IslandTheme } from '../../config/island-themes';
import { useAudio } from '@/providers/AudioProvider';

export type StationDef = {
  id: string;
  title: string;
  state: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED_PENDING' | 'NEEDS_REVIEW';
};

export type LobbyProgress = {
  score: number;
  correctCount: number;
  totalChallenges: number;
  completedStages: number;
  totalStages: number;
  skippedPending: number;
  needsReview: number;
  isCompleted: boolean;
  hasIslandCup: boolean;
};

type Props = {
  islandId: string;
  theme: IslandTheme;
  stations: StationDef[];
  progress: LobbyProgress;
  primaryActionLabel: string;
  firstStageId: string;
  profileName: string | null;
  profileInitial: string | null;
};

export function IslandLobbyShell({
  islandId,
  theme,
  stations,
  progress,
  primaryActionLabel,
  firstStageId,
  profileName,
  profileInitial
}: Props) {
  const dynamicStyles = {
    '--theme-primary': theme.primaryColor,
    '--theme-bg': theme.backgroundColor,
    '--theme-panel': theme.panelColor,
    '--hero-object-position': theme.heroObjectPosition,
  } as CSSProperties;

  const { play, replay } = useAudio();

  React.useEffect(() => {
    play(`${islandId}-entry-welcome`);
  }, [play, islandId]);

  return (
    <div className={styles.container} style={dynamicStyles}>
      {/* HUD (Sticky) */}
      <header className={styles.hud}>
        <Link href="/dashboard" aria-label="العودة إلى الجزر">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
            <span>←</span> العودة
          </div>
        </Link>
        
        <div className={styles.hudStats}>
          <button 
            onClick={replay} 
            style={{ padding: '4px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
            ▶ إعادة الصوت
          </button>
          <span>النقاط: {progress.score}</span>
          <span>🏆</span>
        </div>

        <div className={styles.hudProfile}>
          <span style={{ fontWeight: 'bold' }}>{profileName || 'ضيف'}</span>
          <div className={styles.avatarCircle}>{profileInitial || '?'}</div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <Image
          src={theme.heroImage}
          alt=""
          fill
          className={styles.heroImage}
          priority
          role="presentation"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className={styles.heroGradient} />
        
        <div className={styles.heroContent}>
          <p className={styles.subtitle}>{theme.subtitle}</p>
          <h1 className={styles.title}>{theme.title}</h1>
          <p className={styles.invitation}>{theme.invitation}</p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Overlapping Summary Panel */}
        <div className={styles.summaryPanel}>
          <div className={styles.summaryHeader}>
            <h2 className={styles.summaryTitle}>رحلتك في هذه الجزيرة</h2>
            <Link href={`/islands/${islandId}/journey/${firstStageId}`} className={styles.primaryAction}>
              {primaryActionLabel}
            </Link>
          </div>

          <div className={styles.progressStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {Math.round((progress.completedStages / Math.max(1, progress.totalStages)) * 100)}%
              </span>
              <span className={styles.statLabel}>نسبة الإنجاز</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{progress.completedStages} / {progress.totalStages}</span>
              <span className={styles.statLabel}>المحطات المكتملة</span>
            </div>
            {progress.totalChallenges > 0 && (
              <div className={styles.statItem}>
                <span className={styles.statValue}>{progress.correctCount} / {progress.totalChallenges}</span>
                <span className={styles.statLabel}>التحديات الصحيحة</span>
              </div>
            )}
            {progress.hasIslandCup && (
              <div className={styles.statItem}>
                <span className={styles.statValue} style={{ fontSize: '1.5rem' }}>🏆</span>
                <span className={styles.statLabel}>كأس الجزيرة</span>
              </div>
            )}
            {progress.needsReview > 0 && (
              <div className={styles.statItem}>
                <span className={styles.statValue} style={{ color: '#ef4444' }}>{progress.needsReview}</span>
                <span className={styles.statLabel}>تحتاج مراجعة</span>
              </div>
            )}
          </div>
        </div>

        {/* Journey Map */}
        <nav className={styles.journeyMapContainer} aria-label="خريطة الرحلة">
          <h2 className={styles.journeyMapTitle}>خريطة الرحلة</h2>
          <div className={styles.journeyList}>
            {stations.map((station, index) => {
              const isLocked = station.state === 'LOCKED';
              const isAvailable = station.state === 'AVAILABLE';
              const isCompleted = station.state === 'COMPLETED';

              let nodeClass = styles.journeyNode;
              if (isAvailable) nodeClass += ` ${styles.nodeAvailable}`;
              if (isCompleted) nodeClass += ` ${styles.nodeCompleted}`;
              if (isLocked) nodeClass += ` ${styles.nodeLocked}`;

              let stateLabel = 'قفل';
              if (isAvailable) stateLabel = 'متاح الآن';
              if (isCompleted) stateLabel = 'مكتمل';

              const content = (
                <>
                  <div className={styles.nodeInfo}>
                    <span className={styles.nodeIndex}>{index + 1}</span>
                    <span className={styles.nodeTitle}>{station.title}</span>
                  </div>
                  <span className={styles.nodeBadge}>
                    {stateLabel}
                  </span>
                </>
              );

              if (isLocked) {
                return (
                  <div key={station.id} className={nodeClass} aria-disabled="true">
                    {content}
                  </div>
                );
              }

              return (
                <Link key={station.id} href={`/islands/${islandId}/journey/${station.id}`} className={nodeClass}>
                  {content}
                </Link>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
}
