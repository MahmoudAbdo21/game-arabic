/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitStageProgress, getPendingReviewItems } from "@/features/learning-core/actions";
import { TranscriptOverlay } from "../TranscriptOverlay";
import styles from "./ReviewStage.module.css";
import { evaluateIslandCompletionAndUnlockNextIslandAction } from "@/features/learning-core/actions";
import { useAudio } from "@/providers/AudioProvider";

interface ReviewStageProps {
  islandId: string;
  content: string;
  profileId: string;
  nextRoute: string;
}

export function ReviewStage({ islandId, content, profileId, nextRoute }: ReviewStageProps) {
  const router = useRouter();
  const [showTranscript, setShowTranscript] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewItems, setReviewItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const activeTokenRef = React.useRef(0);
  const { playSequence, stop } = useAudio();

  const getAudioSequence = (isComplete: boolean) => {
    const seq = [`${islandId}-review-intro`];
    const statusId = isComplete ? `${islandId}-review-complete` : `${islandId}-review-pending`;
    // We import AUDIO_MAP or we just push it and rely on playSequence to gracefully skip missing audio
    seq.push(statusId);
    return seq;
  };

  const allReviewed = reviewItems.length === 0;

  useEffect(() => {
    // Only play if we are not loading? No, we need `allReviewed` state which depends on fetch.
    // Wait, the prompt says "Review entry plays the introduction first. Complete Review plays complete status second. Pending Review plays pending status second... Do not play the status before the introduction finishes... Route exit stops and invalidates current playback."
    // We should wait until `isLoading` is false before playing!
    if (isLoading) return;
    
    activeTokenRef.current += 1;
    const token = activeTokenRef.current;
    
    const seq = getAudioSequence(allReviewed);
    playSequence(seq, { ownerKey: 'review-stage' });
    
    return () => {
      if (activeTokenRef.current === token) {
        stop();
      }
    };
  }, [islandId, isLoading, allReviewed]);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      const res = await getPendingReviewItems(islandId);
      if (res.success && res.items) {
        setReviewItems(res.items);
      }
      setIsLoading(false);
    };
    fetchItems();
  }, [islandId]);



  const handleNext = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (allReviewed) {
        await submitStageProgress({
          islandId,
          stageId: 'review',
          status: 'COMPLETED'
        });
        await evaluateIslandCompletionAndUnlockNextIslandAction(islandId);
        router.push(nextRoute);
      } else {
        // Just go to next route (map) but don't mark completed
        router.push('/islands/' + islandId);
      }
    } catch (e) {
      console.error(e);
      router.push(nextRoute);
    } finally {
      setIsProcessing(false);
    }
  };

  const navigateToChallenge = (stageId: string) => {
    router.push(/islands/ + islandId + /journey/ + stageId);
  };

  return (
    <div className={styles.container}>
      <div 
        className={styles.backgroundLayer}
        style={{ backgroundImage: "url('/images/islands/" + islandId + "/review_bg.png')" }}
      />
      <div className={styles.gradientOverlay} />

      <div className={styles.header}>
        <h2 className={styles.title}>
          المراجعة والإتقان
        </h2>
        <button 
          onClick={() => {
            stop();
            activeTokenRef.current += 1;
            playSequence(getAudioSequence(allReviewed), { ownerKey: 'review-stage' });
          }}
          className={styles.transcriptButton}
          title="إعادة الصوت"
        >
          <span>▶️</span> إعادة الصوت
        </button>
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.contentPanel}>
          <p className={styles.contentText}>
            {content}
          </p>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#c4b5fd', fontWeight: 'bold' }}>قائمة المراجعة:</h3>
            
            {isLoading ? (
              <div style={{ color: 'white' }}>جاري التحميل...</div>
            ) : reviewItems.length === 0 ? (
              <div style={{ padding: '2rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', borderRadius: '1rem', border: '2px solid #10b981', textAlign: 'center' }}>
                <span style={{ fontSize: '3rem' }}>🎉</span>
                <h3 style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem' }}>عمل رائع! لقد أتممت جميع المراجعات.</h3>
              </div>
            ) : (
              reviewItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(244, 63, 94, 0.6)',
                    borderRadius: '1rem',
                    color: 'white',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                      تحدي: {item.stageId}
                    </span>
                    <span style={{ fontSize: '1rem', color: '#cbd5e1' }}>
                      السبب: {item.state === 'SKIPPED_PENDING' ? 'تم تخطيه' : 'يحتاج تصحيحًا'}
                    </span>
                  </div>
                  <button
                    onClick={() => navigateToChallenge(item.stageId)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#f43f5e',
                      color: 'white',
                      fontWeight: 'bold',
                      borderRadius: '0.75rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    حل الآن ➜
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button 
          onClick={handleNext}
          disabled={isProcessing}
          className={styles.nextButton}
        >
          {allReviewed ? "متابعة نحو النهاية" : "الخروج وحفظ التقدم"}
        </button>
      </div>

      {showTranscript && (
        <TranscriptOverlay 
          cues={[{ kind: 'NARRATION', text: content || "" }]} 
          onClose={() => setShowTranscript(false)} 
        />
      )}
    </div>
  );
}
