"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { submitStageProgress } from "@/features/learning-core/actions";
import styles from "./GoalsStage.module.css";
import { useAudio } from "@/providers/AudioProvider";

interface GoalsStageProps {
  islandId: string;
  objectives: string[];
  nextRoute: string;
}

export function GoalsStage({ islandId, objectives, nextRoute }: GoalsStageProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const { play, playSequence, stopSequence, enterManualMode } = useAudio();

  const hasStartedRef = React.useRef(false);

  React.useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const sequenceIds = [
      `${islandId}-objectives-intro`,
      ...objectives.map((_, i) => `${islandId}-objectives-obj-${i + 1}`)
    ];
    playSequence(sequenceIds, { ownerKey: `${islandId}-objectives` });
    return () => stopSequence();
  }, [playSequence, stopSequence, islandId, objectives]);

  const handleManualReplay = (index: number) => {
    enterManualMode();
    play(`${islandId}-objectives-obj-${index + 1}`, { ownerKey: `${islandId}-objectives` });
  };

  const handleStart = async () => {
    try {
      await submitStageProgress({
        islandId,
        stageId: 'objectives',
        status: 'COMPLETED'
      });
      router.push(nextRoute);
    } catch (e) {
      console.error(e);
      router.push(nextRoute);
    }
  };

  // Safe fallback coordinates for up to 7 objectives
  const mapCoordinates = [
    { top: "15%", left: "50%" },
    { top: "35%", left: "70%" },
    { top: "55%", left: "40%" },
    { top: "75%", left: "60%" },
    { top: "85%", left: "20%" },
    { top: "25%", left: "20%" },
    { top: "65%", left: "80%" }
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* Scene Area: Image and map markers ONLY */}
      <div className={styles.sceneContainer}>
        <div 
          className={styles.backgroundLayer}
          style={{ backgroundImage: `url('/images/islands/${islandId}/goals_bg.png')` }}
        />
        <div className={styles.interactiveMap}>
          {objectives.map((obj, i) => (
            <div 
              key={i} 
              className={styles.mapStation}
              style={{ 
                top: mapCoordinates[i % mapCoordinates.length].top, 
                left: mapCoordinates[i % mapCoordinates.length].left,
                cursor: 'pointer'
              }}
              onClick={() => handleManualReplay(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleManualReplay(i);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`استمع إلى الهدف ${i + 1}`}
              title="إعادة الصوت"
            >
              <div className={styles.markerContainer}>
                <div className={styles.markerGlow} />
                <div className={styles.markerCircle}>
                  <span className={styles.markerText}>{i + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Area: Title, Text, Objectives List, CTA */}
      <div className={styles.contentContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            أهداف الرحلة
          </h2>
          <p className={styles.subtitle}>
            استكشف خريطة الأبطال لتعرف مهامنا!
          </p>
        </div>

        <div className={styles.objectivesList}>
          {objectives.map((obj, i) => (
            <div 
              key={i} 
              className={styles.objectiveRow}
              onClick={() => handleManualReplay(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleManualReplay(i);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`استمع إلى الهدف ${i + 1}`}
              style={{ cursor: 'pointer' }}
              title="إعادة الصوت"
            >
              <div className={styles.objectiveNumber}>{i + 1}</div>
              <div className={styles.objectiveText}>{obj}</div>
            </div>
          ))}
        </div>

        <div className={styles.actionArea}>
          <button 
            onClick={handleStart}
            className={styles.startButton}
          >
            هيا نبدأ المغامرة!
          </button>
        </div>
      </div>
    </div>
  );
}
