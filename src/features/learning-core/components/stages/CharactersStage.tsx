"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { submitStageProgress } from "@/features/learning-core/actions";
import styles from "./CharactersStage.module.css";
import { useAudio } from "@/providers/AudioProvider";

interface CharactersStageProps {
  islandId: string;
  characters: string[];
  profileId: string;
  nextRoute: string;
}

export function CharactersStage({ islandId, characters, profileId, nextRoute }: CharactersStageProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [discoveredItems, setDiscoveredItems] = useState<number[]>([]);

  const { play, enterManualMode } = useAudio();
  const hasPlayedIntroRef = React.useRef(false);

  React.useEffect(() => {
    if (!hasPlayedIntroRef.current) {
      hasPlayedIntroRef.current = true;
      play(`${islandId}-chars-intro`);
    }
  }, [islandId, play]);

  const handlePlayIntro = () => {
    enterManualMode();
    play(`${islandId}-chars-intro`);
  };

  const handleDiscover = (index: number) => {
    enterManualMode();
    play(`${islandId}-card-${index + 1}`);
    if (!discoveredItems.includes(index)) {
      setDiscoveredItems([...discoveredItems, index]);
    }
  };

  const handleNext = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await submitStageProgress({
        islandId,
        stageId: 'charactersAndWords',
        status: 'COMPLETED'
      });
      router.push(nextRoute);
    } catch (e) {
      console.error(e);
      router.push(nextRoute);
    }
  };

  return (
    <div className={styles.container}>
      
      {/* Cinematic Background Layer */}
      <div 
        className={styles.backgroundLayer}
        style={{ backgroundImage: `url('/images/islands/${islandId}/characters_bg.png')` }}
      />
      <div className={styles.gradientOverlay} />

      {/* Top Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          اكتشاف الشخصيات والكلمات
        </h2>
        <button 
          type="button"
          aria-label="إعادة تشغيل النص الصوتي"
          onClick={handlePlayIntro}
          className={styles.transcriptButton}
        >
          <span aria-hidden="true">💬</span> النص الصوتي
        </button>
      </div>

      {/* Interactive Discovery Grid */}
      <div className={styles.discoveryGrid}>
        <div className={styles.gridContainer}>
          {characters.map((char, index) => {
            const isDiscovered = discoveredItems.includes(index);
            
            return (
              <button
                key={index}
                onClick={() => handleDiscover(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDiscover(index);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={isDiscovered ? `أعد الاستماع إلى كلمة ${char}` : `اكشف واستمع إلى كلمة ${char}`}
                disabled={isProcessing}
                className={`${styles.card} ${isDiscovered ? styles.cardUnlocked : styles.cardLocked}`}
              >
                {!isDiscovered ? (
                  <div className={styles.lockedContent}>
                    <span className={styles.lockedIcon}>❓</span>
                    <span className={styles.lockedText}>اكتشف</span>
                  </div>
                ) : (
                  <div className={styles.unlockedContent}>
                    <div className={styles.unlockedGlow} />
                    <span className={styles.unlockedWord}>
                      {char}
                    </span>
                    <div className={styles.unlockedDivider} />
                    <span className={styles.unlockedLabel}>
                      شخصية / كلمة جديدة
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className={styles.footer}>
        <button 
          onClick={handleNext}
          disabled={isProcessing}
          className={styles.nextButton}
        >
          {discoveredItems.length === characters.length ? "متابعة المغامرة" : "اكتشف المزيد أو تخطى"}
        </button>
      </div>

    </div>
  );
}
