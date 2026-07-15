"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { submitStageProgress } from "@/features/learning-core/actions";
import { TranscriptOverlay } from "../TranscriptOverlay";
import styles from "./WarmupStage.module.css";
import { useAudio } from "@/providers/AudioProvider";

interface WarmupStageProps {
  islandId: string;
  warmup: {
    title: string;
    description: string;
    script: string;
  };
  profileId: string;
  nextRoute: string;
}

const WARMUP_CONFIGS: Record<string, { clues: string[], hotspotPositions: { top: string, left: string }[] }> = {
  'island-1': {
    clues: ["صوت العصافير", "صوت الهواء", "صوت الماء"],
    hotspotPositions: [{ top: '30%', left: '20%' }, { top: '20%', left: '70%' }, { top: '70%', left: '50%' }]
  },
  'island-2': {
    clues: ["أميرة", "أمي", "أبي", "الحديقة"],
    hotspotPositions: [{ top: '40%', left: '30%' }, { top: '40%', left: '70%' }, { top: '60%', left: '50%' }, { top: '80%', left: '20%' }]
  },
  'island-3': {
    clues: ["ظل الأسد", "أثر القدم", "صوت الزئير"],
    hotspotPositions: [{ top: '50%', left: '50%' }, { top: '80%', left: '30%' }, { top: '20%', left: '80%' }]
  },
  'island-4': {
    clues: ["بوابة المدرسة", "معمل الأصوات", "غرفة الرسم"],
    hotspotPositions: [{ top: '50%', left: '20%' }, { top: '30%', left: '70%' }, { top: '70%', left: '80%' }]
  }
};

export function WarmupStage({ islandId, warmup, profileId, nextRoute }: WarmupStageProps) {
  const router = useRouter();
  const [showTranscript, setShowTranscript] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [foundClues, setFoundClues] = useState<number[]>([]);
  const config = WARMUP_CONFIGS[islandId] || WARMUP_CONFIGS['island-1'];
  const { play, enterManualMode } = useAudio();

  const hasPlayedIntroRef = React.useRef(false);
  React.useEffect(() => {
    if (!hasPlayedIntroRef.current) {
      play(`${islandId}-warmup-intro`);
      hasPlayedIntroRef.current = true;
    }
  }, [play, islandId]);
  
  const handlePlayIntro = () => {
    enterManualMode();
    play(`${islandId}-warmup-intro`);
  };

  const handleDiscover = (index: number) => {
    enterManualMode();
    if (!foundClues.includes(index)) {
      setFoundClues([...foundClues, index]);
    }
    // Audio IDs in manifest are 1-based (e.g., island-1-warmup-clue-1)
    play(`${islandId}-warmup-clue-${index + 1}`);
  };

  const handleNext = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await submitStageProgress({
        islandId,
        stageId: 'warmup',
        status: 'COMPLETED'
      });
      router.push(nextRoute);
    } catch (e) {
      console.error(e);
      router.push(nextRoute);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      
      {/* Scene Area: Image and Discoverable Clues ONLY */}
      <div className={styles.sceneContainer}>
        <div 
          className={styles.backgroundLayer}
          style={{ backgroundImage: `url('/images/islands/${islandId}/warmup_bg.png')` }}
        />
        <div className={styles.interactiveArea}>
          {config.clues.map((clue, idx) => {
            const isFound = foundClues.includes(idx);
            const pos = config.hotspotPositions[idx];
            return (
              <button
                key={idx}
                onClick={() => handleDiscover(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDiscover(idx);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={isFound ? `إعادة الاستماع إلى ${clue}` : "اكتشف الكلمة المخفية"}
                style={{
                  position: 'absolute',
                  top: pos.top,
                  left: pos.left,
                  transform: 'translate(-50%, -50%)',
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '50%',
                  backgroundColor: isFound ? '#10b981' : '#f59e0b',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)',
                  cursor: isFound ? 'pointer' : 'pointer',
                  transition: 'all 0.3s ease',
                  border: '3px solid white'
                }}
                title={isFound ? "إعادة الصوت" : "اكتشف!"}
              >
                {isFound ? '✓' : '?'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area: Title, Text, Clues List, Actions */}
      <div className={styles.contentContainer}>
        <div className={styles.contentPanel}>
          <div className={styles.headerRow}>
            <h2 className={styles.title}>
              رسالة الجد المفقودة
            </h2>
            <button 
              onClick={() => {
                handlePlayIntro();
                setShowTranscript(true);
              }}
              className={styles.transcriptButton}
              aria-label="النص الصوتي"
            >
              <span>💬</span> النص الصوتي
            </button>
          </div>

          <div className={styles.textScrollArea}>
            <p className={styles.contentText}>
              {warmup.script}
            </p>
          </div>
          
          <div className={styles.clueTracker}>
            <p style={{ color: '#38bdf8', fontWeight: 'bold' }}>
              الأدلة المكتشفة: {foundClues.length} من {config.clues.length}
            </p>
            {foundClues.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
                {foundClues.map(idx => (
                  <button 
                    key={idx} 
                    onClick={() => handleDiscover(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleDiscover(idx);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`إعادة الاستماع إلى ${config.clues[idx]}`}
                    style={{ 
                      backgroundColor: '#10b981', 
                      color: 'white', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '9999px', 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      border: 'none'
                    }}
                  >
                    {config.clues[idx]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.actionRow}>
            <button 
              onClick={handleNext}
              disabled={isProcessing}
              className={styles.skipButton}
            >
              تخطي الاستكشاف
            </button>
            <button 
              onClick={handleNext}
              disabled={isProcessing || foundClues.length < config.clues.length}
              className={styles.nextButton}
              style={{ opacity: foundClues.length < config.clues.length ? 0.5 : 1 }}
            >
              متابعة المغامرة ➜
            </button>
          </div>
        </div>
      </div>

      {/* Transcript Overlay */}
      {showTranscript && (
        <TranscriptOverlay 
          cues={[{ kind: 'NARRATION', text: warmup.script }]} 
          onClose={() => setShowTranscript(false)} 
        />
      )}
    </div>
  );
}
