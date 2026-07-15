/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { ChallengeSchema, ChallengePresentation } from "../../data/schema";
import { z } from "zod";
import { submitChallengeAttempt } from "../../actions";
import styles from "./OrderingEngine.module.css";
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

export function validateOrderingAnswer(challenge: Challenge, selectedTokenIds: string[]): boolean {
  if (!challenge || !selectedTokenIds) return false;
  const correctIds = challenge.correctChoiceIds || [];
  const isValid = selectedTokenIds.length === correctIds.length && 
                  selectedTokenIds.every((val, index) => val === correctIds[index]);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Ordering Validation]', {
      expectedTokenIds: correctIds,
      selectedTokenIds: selectedTokenIds,
      // Since it's RTL (right to left), the array [a,b,c] is displayed visually as c b a.
      // E.g. [أَ, مِيـ, رَ, ة] -> ة رَ مِيـ أَ visually (right to left).
      displayedRtlOrder: [...selectedTokenIds].reverse(),
      validationResult: isValid
    });
  }
  
  return isValid;
}

export function OrderingEngine({ islandId, gameId, challenge, challengePresentation, onComplete }: EngineProps) {
  const [state, setState] = useState<'AVAILABLE' | 'CHECKING' | 'INCORRECT_RETRY_AVAILABLE' | 'ATTEMPTED_INCORRECT' | 'CORRECT_SCORED'>('AVAILABLE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Use a key to force re-animation of the error toast
  const [alertKey, setAlertKey] = useState(0);
  const { play, playSequence } = useAudio();

  const baseAudioId = `${islandId}-game-${gameId}-chal-${challenge.challengeId}`;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState('AVAILABLE');
    setFeedback(null);
    setSelectedIds([]);
    setIsProcessing(false);
  }, [challenge.challengeId, islandId]);

  const handleSelect = async (id: string) => {
    if (isProcessing || state === 'CORRECT_SCORED' || state === 'ATTEMPTED_INCORRECT') return;
    
    const index = challenge.choices?.findIndex(c => c.choiceId === id);
    
    let newSelectedIds: string[];
    
    if (selectedIds.includes(id)) {
      newSelectedIds = selectedIds.filter(x => x !== id);
    } else {
      newSelectedIds = [...selectedIds, id];
    }
    
    setSelectedIds(newSelectedIds);
    
    // Task A2: Clear stale warning on any mutation
    if (state === 'INCORRECT_RETRY_AVAILABLE') {
      setState('AVAILABLE');
      setFeedback(null);
    }
    
    const totalRequired = challenge.correctChoiceIds?.length || challenge.choices?.length || 0;
    if (newSelectedIds.length === totalRequired && !selectedIds.includes(id)) {
      // Only auto-validate when a new tile is added completing the required length
      await processSubmission(newSelectedIds, index);
    } else {
      if (index !== undefined && index !== -1) {
        play(`${baseAudioId}-choice-${index}`, { ownerKey: challenge.challengeId });
      }
    }
  };

  const handleClear = () => {
    if (isProcessing || state === 'CORRECT_SCORED' || state === 'ATTEMPTED_INCORRECT') return;
    setSelectedIds([]);
  };

  const processSubmission = async (currentSelectedIds: string[], lastSelectedChoiceIndex?: number) => {
    if (isProcessing || state === 'CORRECT_SCORED' || state === 'ATTEMPTED_INCORRECT' || state === 'CHECKING') return;
    
    const isCorrect = validateOrderingAnswer(challenge, currentSelectedIds);
    
    const seq = [];
    if (lastSelectedChoiceIndex !== undefined && lastSelectedChoiceIndex !== -1) {
      seq.push(`${baseAudioId}-choice-${lastSelectedChoiceIndex}`);
    }
    seq.push(isCorrect ? `${baseAudioId}-feedback-correct` : `${baseAudioId}-feedback-wrong`);
    playSequence(seq, { ownerKey: challenge.challengeId });
    
    setIsProcessing(true);
    setState('CHECKING');
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
        setFeedback(challenge.correctFeedback || "ترتيب رائع! إجابة صحيحة!");
      } else {
        setFeedback(challenge.retryFeedback || "الترتيب غير صحيح، حاول مرة أخرى!");
        setState('INCORRECT_RETRY_AVAILABLE');
        setAlertKey(prev => prev + 1); // Re-trigger animation
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

  const handleSubmit = () => {
    processSubmission(selectedIds);
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
        <div key={alertKey} className={styles.toastFeedback}>
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

      {/* Interaction Panel */}
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

      {/* Target Drop Zone */}
      <div className={`${styles.dropZone} ${
        state === 'CORRECT_SCORED' ? styles.targetSlotCorrect :
        state === 'INCORRECT_RETRY_AVAILABLE' ? `${styles.targetSlotIncorrect} ${styles.shake}` : ''
      }`}>
        <div className={styles.targetSlot}>

          {selectedIds.length === 0 ? (
            <span>اختر البطاقات بالترتيب الصحيح</span>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              {selectedIds.map(id => {
                const choice = challenge.choices?.find(c => c.choiceId === id);
                return (
                  <span 
                    key={id} 
                    onClick={() => handleSelect(id)}
                    style={{ 
                      backgroundColor: state === 'CORRECT_SCORED' ? '#10b981' : state === 'INCORRECT_RETRY_AVAILABLE' ? '#f43f5e' : '#fbbf24',
                      color: state === 'CORRECT_SCORED' || state === 'INCORRECT_RETRY_AVAILABLE' ? 'white' : '#451a03',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {choice?.text || id}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Draggable/Selectable Choices */}
      <div className={styles.choicesBank}>
        {challenge.choices?.map((c) => {
          const isSelected = selectedIds.includes(c.choiceId);
          if (isSelected) return <div key={c.choiceId} style={{ width: '100px' }} />; // Placeholder
          
          return (
            <button 
              key={c.choiceId}
              onClick={() => handleSelect(c.choiceId)}
              disabled={isProcessing || state === 'CORRECT_SCORED' || state === 'ATTEMPTED_INCORRECT'}
              className={styles.draggableChoice}
            >
              {c.text || c.choiceId}
            </button>
          );
        })}
      </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          {selectedIds.length > 0 && state !== 'CORRECT_SCORED' && state !== 'ATTEMPTED_INCORRECT' && (
            <button 
              onClick={handleClear}
              disabled={isProcessing}
              className={styles.resetButton}
            >
              مسح
            </button>
          )}
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

