/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { ChallengeSchema, ChallengePresentation } from "../../data/schema";
import { z } from "zod";
import { submitChallengeAttempt } from "../../actions";
import styles from "./ChoiceEngine.module.css";
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

export function ChoiceEngine({ islandId, gameId, challenge, challengePresentation, onComplete }: EngineProps) {
  const [state, setState] = useState<'AVAILABLE' | 'INCORRECT_RETRY_AVAILABLE' | 'ATTEMPTED_INCORRECT' | 'CORRECT_SCORED'>('AVAILABLE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const { playSequence } = useAudio();

  const baseAudioId = `${islandId}-game-${gameId}-chal-${challenge.challengeId}`;

  useEffect(() => {
    // Reset state when challenge changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState('AVAILABLE');
    setFeedback(null);
    setSelectedChoiceId(null);
    setIsProcessing(false);
  }, [challenge.challengeId, islandId]);

  const handleChoice = async (choiceId: string, index: number) => {
    if (isProcessing || state === 'CORRECT_SCORED') return;
    
    setSelectedChoiceId(choiceId);
    
    const correctIds = challenge.correctChoiceIds || [];
    const isCorrect = correctIds.includes(choiceId);
    
    const seq = [];
    seq.push(`${baseAudioId}-choice-${index}`);
    seq.push(isCorrect ? `${baseAudioId}-feedback-correct` : `${baseAudioId}-feedback-wrong`);
    playSequence(seq, { ownerKey: challenge.challengeId });
    
    setIsProcessing(true);
    try {
      const result = await submitChallengeAttempt({
        islandId,
        stageId: gameId,
        sceneId: gameId, // using gameId as sceneId mapping
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
        setFeedback(challenge.correctFeedback || "رائع! إجابة صحيحة!");
      } else {
        setFeedback(challenge.retryFeedback || "حاول مرة أخرى يا بطل!");
        setState('INCORRECT_RETRY_AVAILABLE');
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
    <div className={styles.engineWrapper}>
      <AnimatedBackground />
      
      {/* Toast Feedback for Incorrect/Retry */}
      {state === 'INCORRECT_RETRY_AVAILABLE' && feedback && (
        <div className={styles.toastFeedback}>
          {feedback}
        </div>
      )}

      {/* Scene Panel */}
      <div 
        className={styles.scenePanel}
        style={{ 
          backgroundImage: challengePresentation?.visual?.imageUrl 
            ? `url('${challengePresentation.visual.imageUrl}')` 
            : `url('/images/islands/${islandId}/game_bg.png')`,
          backgroundSize: challengePresentation?.visual?.objectFit || 'cover',
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
            <div className={styles.stimulus}>
              {challenge.stimulus}
            </div>
          )}
        </div>
      </div>

      {/* Interaction Panel (Answers & Controls) */}
      <div className={styles.interactionPanel}>
        <div className={styles.controlsTop}>
          <button 
            onClick={handleSkip}
            disabled={isProcessing}
            className={styles.skipButton}
          >
            تخطي مؤقتاً
          </button>
        </div>

        {/* Choices Grid */}
        <div className={styles.choicesGrid}>
          {challenge.choices?.map((c, idx) => {
            const isSelected = selectedChoiceId === c.choiceId;
            const correctIds = challenge.correctChoiceIds || [];
            let buttonStateClass = styles.choiceDefault;
            
            // On correct scored state, hide wrong options completely unless this is the correct one
            if (state === 'CORRECT_SCORED') {
              if (correctIds.includes(c.choiceId)) {
                buttonStateClass = styles.choiceCorrect;
              } else {
                return null; // hide wrong choices
              }
            } else if (isSelected && state === 'INCORRECT_RETRY_AVAILABLE') {
              buttonStateClass = `${styles.choiceIncorrect} ${styles.shake}`;
            } else if (state === 'ATTEMPTED_INCORRECT') {
              buttonStateClass = styles.choiceDisabled;
            }


            return (
              <button 
                key={c.choiceId}
                onClick={() => handleChoice(c.choiceId, idx)}
                disabled={isProcessing || state === 'CORRECT_SCORED' || state === 'ATTEMPTED_INCORRECT'}
                className={`${styles.choiceButton} ${buttonStateClass}`}
              >
                {c.text || c.choiceId}
              </button>
            );
          })}
        </div>

        {/* Success Action Row (Shown only when correct) */}
        {(state === 'CORRECT_SCORED' || state === 'ATTEMPTED_INCORRECT') && (
          <div className={styles.successActionRow}>
            <div className={styles.successMessage}>
              {feedback}
            </div>
            <button 
              onClick={() => onComplete({ passed: true })}
              className={styles.nextChallengeButton}
            >
              متابعة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

