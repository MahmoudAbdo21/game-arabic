import React from "react";
import Link from "next/link";
import styles from "./JourneyShell.module.css";

interface JourneyShellProps {
  islandId: string;
  stageId: string;
  lessonTitle?: string;
  stageTitle?: string;
  profileId?: string;
  profileName?: string;
  children: React.ReactNode;
}

export function JourneyShell({ 
  islandId, 
  stageId, 
  lessonTitle = "المغامرة",
  stageTitle = "المرحلة الحالية",
  profileId = "اللاعب",
  profileName = "اللاعب",
  children 
}: JourneyShellProps) {
  return (
    <div className={styles.shellContainer}>
      <div 
        className={styles.shellBackground} 
        style={{ backgroundImage: `url('/images/islands/${islandId}/story_bg.png')` }}
      />
      <div className={styles.outerDecoLayer} />
      
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {/* Desktop only nav */}
          <div className={styles.desktopNav}>
            <Link href={`/islands/${islandId}`} className={`${styles.navButton} ${styles.navButtonBack}`}>
              <span>🚪</span> خروج
            </Link>
            <Link href={`/islands/${islandId}`} className={styles.navButton}>
              <span>🗺️</span> الخريطة
            </Link>
          </div>
        </div>

        <div className={styles.headerCenter}>
          <div className={styles.islandTitle}>{lessonTitle}</div>
          <div className={styles.stageTitle}>{stageTitle}</div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.profileBadge}>
            <span>👤</span> {profileName}
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.stageFrame}>
          <div className={styles.innerDecoLayer} />
          {children}
        </div>
      </main>

      {/* Mobile Sticky Action Bar */}
      <div className={styles.mobileNav}>
        <Link href={`/islands/${islandId}`} className={`${styles.navButton} ${styles.navButtonBack}`}>
          <span>🚪</span> خروج
        </Link>
        <Link href={`/islands/${islandId}`} className={styles.navButton}>
          <span>🗺️</span> الخريطة
        </Link>
      </div>
    </div>
  );
}
