/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { ChallengeSchema, ChallengePresentation } from "../../data/schema";
import { z } from "zod";
import { submitChallengeAttempt } from "../../actions";
import styles from "./ClassificationEngine.module.css";
import { AnimatedBackground } from "../AnimatedBackground";
import { useAudio } from "@/providers/AudioProvider";

type Challenge = z.infer<typeof ChallengeSchema>;

interface EngineProps {
  islandId: string;
  gameId: string;
  challenge: Challenge;
  challengePresentation?: ChallengePresentation;
  onComplete: (result: { passed: boolean }) => void;
}

export function ClassificationEngine({ islandId, gameId, challenge, challengePresentation, onComplete }: EngineProps) {
  const [state, setState] = useState<'AVAILABLE' | 'INCORRECT_RETRY_AVAILABLE' | 'ATTEMPTED_INCORRECT' | 'CORRECT_SCORED'>('AVAILABLE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isStimulusSelected, setIsStimulusSelected] = useState(false);
  const { play, playSequence } = useAudio();

  const baseAudioId = `${islandId}-game-${gameId}-chal-${challenge.challengeId}`;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState('AVAILABLE');
    setFeedback(null);
    setSelectedChoiceId(null);
    setIsStimulusSelected(false);
    setIsProcessing(false);
  }, [challenge.challengeId]);

  const handleStimulusClick = () => {
    if (state === 'CORRECT_SCORED' || state === 'ATTEMPTED_INCORRECT') return;
    setIsStimulusSelected(!isStimulusSelected);
    play(`${baseAudioId}-stimulus`, { ownerKey: challenge.challengeId });
  };

  const handleChoice = async (choiceId: string) => {
    if (isProcessing || state === 'CORRECT_SCORED') return;
    if (!isStimulusSelected) {
      setFeedback("أولاً: انقر على الكلمة بالأعلى لتحديدها!");
      return;
    }
    
    setSelectedChoiceId(choiceId);
    const correctIds = challenge.correctChoiceIds || [];
    const isCorrect = correctIds.includes(choiceId);
    
    const choiceIndex = challenge.choices?.findIndex(c => c.choiceId === choiceId);
    const seq = [];
    if (choiceIndex !== undefined && choiceIndex !== -1) {
      seq.push(`${baseAudioId}-choice-${choiceIndex}`);
    }
    seq.push(isCorrect ? `${baseAudioId}-feedback-correct` : `${baseAudioId}-feedback-wrong`);
    playSequence(seq, { ownerKey: challenge.challengeId });
    
    setIsProcessing(true);
    try {
      const result = await submitChallengeAttempt({
        islandId,
        stageId: gameId,
        sceneId: gameId,
        challengeId: challenge.challengeId,
        isCorrect
      });
      
      if (!result.success) {
        setFeedback(result.message || 'تعذر حفظ إجابتك. حاول مرة أخرى.');
        setState('AVAILABLE'); // Allow retry
        return;
      }

      if (isCorrect) {
        setState('CORRECT_SCORED');
        setFeedback(challenge.correctFeedback || "تصنيف ممتاز!");
      } else {
        setFeedback(challenge.retryFeedback || "هذا التصنيف غير صحيح، حاول مرة أخرى.");
        setState('INCORRECT_RETRY_AVAILABLE');
        setIsStimulusSelected(false);
      }

      if ((result as any).state === 'ATTEMPTED_INCORRECT') {
        setState('ATTEMPTED_INCORRECT');
        setFeedback("استنفدت المحاولات! سنعود لهذا التحدي لاحقاً.");
      } else if ((result as any).state && !(!isCorrect && (result as any).state === 'CORRECT_SCORED')) {
        setState((result as any).state as any);
      }
    } catch (e) {
      console.error(e);
      setFeedback('تعذر حفظ إجابتك. حاول مرة أخرى.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const result = await submitChallengeAttempt({
        islandId,
        stageId: gameId,
        sceneId: gameId,
        challengeId: challenge.challengeId,
        isCorrect: false,
        isTemporarySkip: true
      });
      
      if (!result.success) {
        setFeedback(result.message || 'تعذر حفظ إجابتك. حاول مرة أخرى.');
        setIsProcessing(false);
        return;
      }
      
      onComplete({ passed: true });
    } catch (e) {
      console.error(e);
      setFeedback('تعذر حفظ إجابتك. حاول مرة أخرى.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.container}>
      <AnimatedBackground />
      {/* Scene Panel */}
      <div 
        className={styles.scenePanel}
        style={{ 
          backgroundImage: challengePresentation?.visual?.imageUrl 
            ? `url('${challengePresentation.visual.imageUrl}')`
            : `url('/images/islands/${islandId}/game_bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className={styles.sceneOverlay} />
        
        <div className={styles.sceneContent}>
          <div className={styles.instruction}>
            {challenge.instruction}
          </div>
          
          {challenge.stimulus && (
            <button 
              className={isStimulusSelected ? styles.stimulusCardSelected : styles.stimulusCard}
              onClick={handleStimulusClick}
              disabled={state === 'CORRECT_SCORED' || state === 'ATTEMPTED_INCORRECT'}
            >
              {challenge.stimulus}
              {isStimulusSelected && <div className={styles.glowEffect} />}
            </button>
          )}
        </div>
      </div>

      {/* Interaction Panel */}
      <div className={styles.interactionPanel}>
        <div className={styles.controlsTop}>
          <button onClick={handleSkip} disabled={isProcessing} className={styles.skipButton}>
            تخطي مؤقتاً
          </button>
        </div>

        {feedback && state !== 'CORRECT_SCORED' && state !== 'ATTEMPTED_INCORRECT' && (
          <div className={styles.hintMessage}>{feedback}</div>
        )}

      <div className={styles.bucketsGrid}>
        {challenge.choices?.map((c) => {
          const isSelected = selectedChoiceId === c.choiceId;
          const correctIds = challenge.correctChoiceIds || [];
          
          let buttonStateClass = styles.bucketDefault;
          let textStateClass = styles.bucketTextDefault;
          
          if (state === 'CORRECT_SCORED') {
            if (correctIds.includes(c.choiceId)) {
              buttonStateClass = styles.bucketCorrect;
              textStateClass = styles.bucketTextCorrect;
            } else {
              return null; // hide wrong choices on success
            }
          } else if (isSelected && state === 'INCORRECT_RETRY_AVAILABLE') {
            buttonStateClass = `${styles.bucketIncorrect} ${styles.shake}`;
          } else if (state === 'ATTEMPTED_INCORRECT') {
            buttonStateClass = styles.bucketDisabled;
          } else if (isStimulusSelected) {
            buttonStateClass = styles.bucketHighlighted; // Show targets as ready
          }

          return (
            <button 
              key={c.choiceId}
              onClick={() => handleChoice(c.choiceId)}
              disabled={isProcessing || state === 'CORRECT_SCORED' || state === 'ATTEMPTED_INCORRECT'}
              className={`${styles.bucketButton} ${buttonStateClass}`}
            >
              <div className={styles.targetZone}>🎯</div>
              <span className={`${styles.bucketText} ${textStateClass}`}>
                {c.text || c.choiceId}
              </span>
            </button>
          );
        })}
      </div>

      {(state === 'CORRECT_SCORED' || state === 'ATTEMPTED_INCORRECT') && (
        <div className={styles.successActionRow}>
          <div className={styles.successMessage}>
            {feedback}
          </div>
          <button onClick={() => onComplete({ passed: true })} className={styles.nextChallengeButton}>
            متابعة
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
