/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitStageProgress, getIslandProgressDetails, evaluateIslandCompletionAndUnlockNextIslandAction } from "@/features/learning-core/actions";
import { TranscriptOverlay } from "../TranscriptOverlay";
import styles from "./ConclusionStage.module.css";
import { useAudio } from "@/providers/AudioProvider";

interface ConclusionStageProps {
  islandId: string;
  conclusion: string;
  profileId: string;
  nextRoute: string;
}

export function ConclusionStage({ islandId, conclusion, profileId, nextRoute }: ConclusionStageProps) {
  const router = useRouter();
  const [showTranscript, setShowTranscript] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCup, setShowCup] = useState(false);
  
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const activeTokenRef = React.useRef(0);
  const { playSequence, stop } = useAudio();

  const getAudioSequence = (eligible: boolean) => {
    const seq = [`${islandId}-conclusion-message`];
    const statusId = eligible ? `${islandId}-conclusion-success` : `${islandId}-conclusion-incomplete`;
    seq.push(statusId);
    return seq;
  };

  useEffect(() => {
    if (isLoading) return;
    
    activeTokenRef.current += 1;
    const token = activeTokenRef.current;
    
    const progress = details?.progress || {};
    const scorePercent = progress.finalScorePercent || 0;
    const isEligible = progress.pendingReviewCount === 0 && progress.correctChallengeCount === progress.totalMandatoryChallenges && scorePercent >= 80;
    
    const seq = getAudioSequence(isEligible);
    playSequence(seq, { ownerKey: 'conclusion-stage' });
    
    return () => {
      if (activeTokenRef.current === token) {
        stop();
      }
    };
  }, [islandId, isLoading, details]);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      const res = await getIslandProgressDetails(islandId);
      if (res.success) {
        setDetails(res);
        if (res.progress?.islandCupAwarded) {
          setShowCup(true);
        }
      }
      setIsLoading(false);
    };
    fetchDetails();
  }, [islandId]);

  const progress = details?.progress || {};
  const scorePercent = progress.finalScorePercent || 0;
  const isEligible = progress.pendingReviewCount === 0 && progress.correctChallengeCount === progress.totalMandatoryChallenges && scorePercent >= 80;

  const handleClaimCup = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await evaluateIslandCompletionAndUnlockNextIslandAction(islandId);
      if (res.success) {
        setShowCup(true);
      } else {
        const errorReason = (res as any).reason || 'UNKNOWN_ERROR';
        if (errorReason === 'PENDING_REVIEWS' || errorReason === 'IN_REVIEW') {
          alert('لا تزال هناك تحديات قيد المراجعة!');
        } else {
          alert('لا يمكن استلام الكأس الآن.');
        }
      }
    } catch (e) {
      console.error(e);
    }
    setIsProcessing(false);
  };

  const handleReturnToDashboard = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await submitStageProgress({
        islandId,
        stageId: 'conclusion',
        status: 'COMPLETED'
      });
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
      router.push('/dashboard');
    }
  };

  const handleNextAdventure = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await submitStageProgress({
        islandId,
        stageId: 'conclusion',
        status: 'COMPLETED'
      });
      const nextNum = parseInt(islandId.replace('island-', '')) + 1;
      if (nextNum <= 4) {
        router.push(`/islands/island-${nextNum}`);
      } else {
        router.push('/dashboard');
      }
    } catch (e) {
      console.error(e);
      router.push('/dashboard');
    }
  };

  if (isLoading) {
    return <div className={styles.container}><div style={{color:'white', padding: '2rem'}}>جاري التحميل...</div></div>;
  }

  return (
    <div className={styles.container}>
      <div 
        className={styles.backgroundLayer}
        style={{ backgroundImage: "url('/images/islands/" + islandId + "/conclusion_bg.png')" }}
      />
      <div className={styles.gradientOverlay} />

      <div className={styles.header}>
        <h2 className={styles.title}>نهاية المغامرة</h2>
        <button 
          onClick={() => {
            stop();
            activeTokenRef.current += 1;
            playSequence(getAudioSequence(isEligible), { ownerKey: 'conclusion-stage' });
          }} 
          className={styles.transcriptButton} 
          title="إعادة الصوت"
        >
          <span>▶️</span> إعادة الصوت
        </button>
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.contentPanel}>
          <p className={styles.contentText}>{conclusion}</p>

          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{Math.round(scorePercent)}%</div>
              <div className={styles.statLabel}>النتيجة النهائية</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{Math.round(progress.firstPassAccuracy || 0)}%</div>
              <div className={styles.statLabel}>الدقة من المحاولة الأولى</div>
            </div>
            <div className={styles.statBox} style={{ borderColor: (progress.pendingReviewCount || 0) > 0 ? '#f43f5e' : '#10b981' }}>
              <div className={styles.statValue}>{progress.pendingReviewCount || 0}</div>
              <div className={styles.statLabel}>تحديات قيد المراجعة</div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {!isEligible ? (
              <div style={{ padding: '1rem', backgroundColor: 'rgba(244, 63, 94, 0.2)', border: '2px solid #f43f5e', borderRadius: '1rem', color: 'white', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>لم تكتمل شروط الجزيرة بعد!</h3>
                <p style={{ marginTop: '0.5rem' }}>يجب الحصول على نتيجة 80% وإكمال جميع المراجعات.</p>
              </div>
            ) : !showCup ? (
              <button onClick={handleClaimCup} disabled={isProcessing} className={styles.claimButton}>
                استلم كأس الجزيرة! 🏆
              </button>
            ) : (
              <div className={styles.cupReveal}>
                <div className={styles.cupIcon}>🏆</div>
                <h3 className={styles.cupText}>مبروك! لقد أتممت الجزيرة بنجاح!</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button onClick={handleReturnToDashboard} disabled={isProcessing} className={styles.nextButton}>
          العودة إلى خريطة الرحلة
        </button>
        {showCup && islandId !== 'island-4' && (
          <button onClick={handleNextAdventure} disabled={isProcessing} className={styles.nextButton} style={{ backgroundColor: '#f59e0b', color: '#451a03' }}>
            ابدأ مغامرتك التالية
          </button>
        )}
      </div>

      {showTranscript && (
        <TranscriptOverlay cues={[{ kind: 'NARRATION', text: conclusion || "" }]} onClose={() => setShowTranscript(false)} />
      )}
    </div>
  );
}
