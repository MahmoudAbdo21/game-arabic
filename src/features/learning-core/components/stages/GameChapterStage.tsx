"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChallengeSchema, GamePresentation } from "../../data/schema";
import { z } from "zod";
import { ChoiceEngine } from "../engines/ChoiceEngine";
import { ClassificationEngine } from "../engines/ClassificationEngine";
import { OrderingEngine } from "../engines/OrderingEngine";
import { submitStageProgress } from "@/features/learning-core/actions";
import styles from "./GameChapterStage.module.css";
import { useAudio } from "@/providers/AudioProvider";

type Challenge = z.infer<typeof ChallengeSchema>;

interface GameChapterStageProps {
  islandId: string;
  game: {
    gameId: string;
    title: string;
    mechanic: string;
    challenges: Challenge[];
  };
  gamePresentation?: GamePresentation;
  nextRoute: string;
}

export function GameChapterStage({ islandId, game, gamePresentation, nextRoute }: GameChapterStageProps) {

  const router = useRouter();
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stageCompleted, setStageCompleted] = useState(false);
  const { playSequence, stop } = useAudio();
  const activeTokenRef = useRef(0);

  const currentChallenge = game.challenges[currentChallengeIndex];
  const currentChallengePresentation = gamePresentation?.challenges?.find(
    c => c.challengeId === currentChallenge?.challengeId
  );

  const baseAudioId = currentChallenge ? `${islandId}-game-${game.gameId}-chal-${currentChallenge.challengeId}` : "";

  const getEntrySequence = () => {
    if (!currentChallenge) return [];
    const seq: string[] = [];
    if (currentChallenge.instruction) seq.push(`${baseAudioId}-instruction`);
    if (currentChallenge.stimulus) seq.push(`${baseAudioId}-stimulus`);
    return seq;
  };

  useEffect(() => {
    if (stageCompleted || !currentChallenge) return;
    
    activeTokenRef.current += 1;
    const currentToken = activeTokenRef.current;
    
    const seq = getEntrySequence();
    if (seq.length > 0) {
      playSequence(seq, { ownerKey: currentChallenge.challengeId });
    }

    return () => {
      if (currentToken === activeTokenRef.current) {
         // Stop if we unmount while still active
         stop();
      }
    };
  }, [currentChallenge?.challengeId, stageCompleted]);

  const handleReplay = () => {
    if (!currentChallenge) return;
    stop();
    activeTokenRef.current += 1;
    const seq = getEntrySequence();
    if (seq.length > 0) {
      playSequence(seq, { ownerKey: currentChallenge.challengeId });
    }
  };

  const handleChallengeComplete = (result: { passed: boolean }) => {
    if (result.passed) {
      stop();
      if (currentChallengeIndex < game.challenges.length - 1) {
        setCurrentChallengeIndex(prev => prev + 1);
      } else {
        setStageCompleted(true);
      }
    }
  };

  const handleStageComplete = async () => {
    setIsProcessing(true);
    try {
      const result = await submitStageProgress({
        islandId,
        stageId: game.gameId,
        status: 'COMPLETED'
      });
      
      if (!result.success) {
        alert('تعذر حفظ تقدمك. يرجى المحاولة مرة أخرى.');
        setIsProcessing(false);
        return;
      }
      
      router.push(nextRoute);
    } catch (e) {
      console.error(e);
      alert('تعذر حفظ تقدمك. يرجى المحاولة مرة أخرى.');
      setIsProcessing(false);
    }
  };

  const renderEngine = () => {
    if (!currentChallenge) return null;
    
    const props = {
      islandId,
      gameId: game.gameId,
      challenge: currentChallenge,
      challengePresentation: currentChallengePresentation,
      onComplete: handleChallengeComplete
    };


    if (game.mechanic === 'CLASSIFY_WORD_BY_LETTER_POSITION' || game.mechanic === 'CLASSIFY_INITIAL_SHORT_VOWEL') {
      return <ClassificationEngine {...props} />;
    }
    if (game.mechanic === 'ORDER_WORD_SEGMENTS' || game.mechanic === 'ORDER_SEGMENTS_TO_BUILD_WORD') {
      return <OrderingEngine {...props} />;
    }
    
    return <ChoiceEngine {...props} />;
  };

  if (stageCompleted) {
    return (
      <div className={styles.completedContainer}>
        <div className={styles.completedContent}>
          <div className={styles.completedIcon}>🌟</div>
          <h2 className={styles.completedTitle}>
            أحسنت! أكملت كل تحديات اللعبة!
          </h2>
          <button 
            onClick={handleStageComplete}
            disabled={isProcessing}
            className={styles.continueButton}
          >
            متابعة الرحلة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {game.title}
        </h2>
        <button 
          type="button"
          onClick={handleReplay}
          className={styles.transcriptButton}
          title="إعادة سماع السؤال"
          aria-label="إعادة سماع السؤال"
        >
          <span>▶️</span> إعادة سماع السؤال
        </button>
        <div className={styles.progressBadge}>
          <span className={styles.progressText}>
            تحدي {currentChallengeIndex + 1} من {game.challenges.length}
          </span>
        </div>
      </div>

      <div className={styles.progressBarContainer}>
        <div className={styles.progressBarTrack}>
          <div 
            className={styles.progressBarFill} 
            style={{ width: `${(currentChallengeIndex / game.challenges.length) * 100}%` }}
          />
        </div>
      </div>

      <div className={styles.engineContainer}>
        {renderEngine()}
      </div>
    </div>
  );
}
