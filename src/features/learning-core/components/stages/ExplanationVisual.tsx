"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useAudio } from '@/providers/AudioProvider';
import { ExplanationPresentation } from '../../data/schema';
import styles from './ExplanationVisual.module.css';

interface Props {
  islandId: string;
  sceneId: string;
  presentation: ExplanationPresentation;
  isAutoMode: boolean;
  onComplete: () => void;
  replayToken: number;
  isCancelled: boolean;
}

export function ExplanationVisual({ islandId, sceneId, presentation, isAutoMode, onComplete, replayToken, isCancelled }: Props) {
  const { play, stop } = useAudio();
  const [step, setStep] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);

  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const safeSetTimeout = (cb: () => void, ms: number): any => {
    const id: any = setTimeout(() => {
      if (isCancelled) return;
      cb();
    }, ms);
    timersRef.current.push(id);
    return id;
  };

  useEffect(() => {
    clearAllTimers();
    if (isCancelled) return;
    setStep(0);
    setPhaseIndex(0);
    runSequence();

    return () => {
      clearAllTimers();
    };
  }, [replayToken, presentation, sceneId, isCancelled]);

  const runSequence = () => {
    if (presentation.type === 'SHORT_VOWEL_TWO_PHASE_EXAMPLE') {
      runPhase(0);
    } else {
      runPhaseSingle(presentation);
    }
  };

  const runPhase = (pIndex: number) => {
    const phase = (presentation as any).phases[pIndex];
    if (!phase) return;
    
    setPhaseIndex(pIndex);
    setStep(0);

    const audioIds = phase.audioIds;
    
    play(audioIds[0], {
      ownerKey: sceneId,
      onEnded: () => {
        if (isCancelled) return;
        setStep(1);
        safeSetTimeout(() => {
          if (isCancelled) return;
          setStep(2);
          
          if (audioIds[1]) {
            play(audioIds[1], {
              ownerKey: sceneId,
              onEnded: () => {
                if (isCancelled) return;
                setStep(3);
                
                safeSetTimeout(() => {
                  if (isCancelled) return;
                  if (pIndex + 1 < (presentation as any).phases.length) {
                    runPhase(pIndex + 1);
                  } else {
                    if (isAutoMode) onComplete();
                  }
                }, 1000);
              }
            });
          }
        }, 1000);
      }
    });
  };

  const runPhaseSingle = (pres: any) => {
    const audioIds = pres.audioIds;
    setStep(0);
    
    if (pres.type === 'SHORT_VOWEL_INTRO') {
      play(audioIds[0], {
        ownerKey: sceneId,
        onEnded: () => {
          if (isCancelled) return;
          if (isAutoMode) onComplete();
        }
      });
      safeSetTimeout(() => { setStep(1); }, 1000);
      safeSetTimeout(() => { setStep(2); }, 1300);
      safeSetTimeout(() => { setStep(3); }, 1600);
      return;
    }

    play(audioIds[0], {
      ownerKey: sceneId,
      onEnded: () => {
        if (isCancelled) return;
        setStep(1);
        
        if (pres.type === 'MISSING_LETTER' || pres.type === 'WORD_SEGMENTATION' || pres.type === 'SOUND_MERGE' || pres.type === 'SHADDA_BALANCE') {
          safeSetTimeout(() => {
            if (isCancelled) return;
            setStep(2);
            
            if (audioIds[1]) {
              play(audioIds[1], {
                ownerKey: sceneId,
                onEnded: () => {
                  if (isCancelled) return;
                  setStep(3);
                  
                  if (pres.type === 'SOUND_MERGE' && audioIds[2]) {
                     safeSetTimeout(() => {
                        if (isCancelled) return;
                        setStep(4);
                        play(audioIds[2], {
                           ownerKey: sceneId,
                           onEnded: () => {
                              if (isCancelled) return;
                              setStep(5);
                              safeSetTimeout(() => {
                                 if (isCancelled) return;
                                 if (isAutoMode) onComplete();
                              }, 1000);
                           }
                        });
                     }, 800);
                  } else {
                     safeSetTimeout(() => {
                       if (isCancelled) return;
                       if (isAutoMode) onComplete();
                     }, 1000);
                  }
                }
              });
            } else {
               safeSetTimeout(() => {
                 if (isCancelled) return;
                 if (isAutoMode) onComplete();
               }, 1000);
            }
          }, 800);
        } else if (pres.type === 'SOUND_TO_WRITING') {
          safeSetTimeout(() => {
            if (isCancelled) return;
            setStep(2);
            if (audioIds[1]) {
              play(audioIds[1], {
                ownerKey: sceneId,
                onEnded: () => {
                  if (isCancelled) return;
                  setStep(3);
                  
                  if (audioIds[2]) {
                     safeSetTimeout(() => {
                        if (isCancelled) return;
                        setStep(4);
                        play(audioIds[2], {
                           ownerKey: sceneId,
                           onEnded: () => {
                              if (isCancelled) return;
                              setStep(5);
                              safeSetTimeout(() => {
                                 if (isCancelled) return;
                                 if (isAutoMode) onComplete();
                              }, 1000);
                           }
                        });
                     }, 800);
                  } else {
                     safeSetTimeout(() => {
                       if (isCancelled) return;
                       if (isAutoMode) onComplete();
                     }, 1000);
                  }
                }
              });
            }
          }, 800);
        } else if (pres.type === 'SHORT_VOWEL_EXAMPLE') {
          safeSetTimeout(() => {
            if (isCancelled) return;
            setStep(2);
            if (audioIds[1]) {
              play(audioIds[1], {
                ownerKey: sceneId,
                onEnded: () => {
                  if (isCancelled) return;
                  setStep(3);
                  safeSetTimeout(() => {
                    if (isCancelled) return;
                    if (isAutoMode) onComplete();
                  }, 1000);
                }
              });
            }
          }, 800);
        }
      }
    });
  };

  if (presentation.type === 'SHORT_VOWEL_INTRO') {
    return (
      <div className={styles.visualContainer}>
         <div className={`${styles.card} ${step >= 1 ? styles.visible : ''}`}>الفتحة</div>
         <div className={`${styles.card} ${step >= 2 ? styles.visible : ''}`}>الضمة</div>
         <div className={`${styles.card} ${step >= 3 ? styles.visible : ''}`}>الكسرة</div>
      </div>
    );
  }

  if (presentation.type === 'MISSING_LETTER') {
    return (
      <div className={styles.visualContainer}>
         {step < 3 ? (
           <div className={styles.wordArea} style={{ position: 'relative' }}>
             <span className={styles.beforePart}>{presentation.before}</span>
             <span className={`${styles.missingGap} ${step >= 2 ? styles.filledGap : ''}`}>
                <span className={`${styles.floatingLetter} ${step >= 2 ? styles.dropped : ''}`}>
                  {presentation.missingLetter}
                </span>
             </span>
             <span className={styles.afterPart}>{presentation.after}</span>
           </div>
         ) : (
           <div className={styles.wordArea} style={{ position: 'relative' }}>
             <span className={styles.connectedWordBase} style={{color: '#4caf50', textShadow: '0 0 20px rgba(76, 175, 80, 0.6)'}}>{presentation.completedWord}</span>
           </div>
         )}
      </div>
    );
  }

  if (presentation.type === 'SHORT_VOWEL_EXAMPLE') {
    return (
      <div className={styles.visualContainer}>
         <div className={styles.wordArea} style={{ position: 'relative' }}>
            <span className={styles.connectedWordBase}>{presentation.targetWord}</span>
            {step >= 1 && <div className={styles.highlightMarker} />}
            {step >= 2 && <div className={styles.isolatedSoundFloating}>{presentation.isolatedSound}</div>}
         </div>
      </div>
    );
  }

  if (presentation.type === 'SHORT_VOWEL_TWO_PHASE_EXAMPLE') {
    const phase = presentation.phases[phaseIndex];
    return (
      <div className={styles.visualContainer}>
         <div className={styles.wordArea} style={{ position: 'relative' }}>
            <span className={styles.connectedWordBase}>{phase.targetWord}</span>
            {step >= 1 && <div className={styles.highlightMarker} />}
            {step >= 2 && <div className={styles.isolatedSoundFloating}>{phase.isolatedSound}</div>}
         </div>
      </div>
    );
  }


  if (presentation.type === 'WORD_SEGMENTATION') {
    return (
      <div className={styles.visualContainer}>
         <div className={styles.segmentContainer}>
            {presentation.segments.map((seg: string, i: number) => (
               <div key={i} className={`${styles.segmentCard} ${step >= 2 ? styles.visible : ''}`} style={{ transitionDelay: `${i * 0.3}s` }}>
                 {seg}
               </div>
            ))}
         </div>
      </div>
    );
  }

  if (presentation.type === 'SOUND_MERGE') {
    return (
      <div className={styles.visualContainer}>
         {step < 3 ? (
            <div className={styles.segmentContainer}>
               {presentation.segments.map((seg: string, i: number) => (
                  <div key={i} className={`${styles.segmentCard} ${styles.visible}`}>
                    {seg}
                  </div>
               ))}
            </div>
         ) : (
            <div className={styles.wordArea} style={{ position: 'relative' }}>
               <span className={styles.connectedWordBase} style={{color: '#4caf50', textShadow: '0 0 20px rgba(76, 175, 80, 0.6)'}}>
                 {presentation.completedWord}
               </span>
            </div>
         )}
      </div>
    );
  }

  if (presentation.type === 'SHADDA_BALANCE') {
    return (
      <div className={styles.visualContainer}>
         <div className={styles.shaddaContainer}>
            <div className={styles.scalePan}>
               <span className={styles.connectedWordBase} style={{ fontSize: '4rem' }}>{presentation.completedWord}</span>
            </div>
            {step >= 2 && (
              <div className={styles.scalePan}>
                 {presentation.segments.map((seg: string, i: number) => (
                    <div key={i} className={`${styles.segmentCard} ${styles.visible}`} style={{ width: '80px', height: '100px', fontSize: '2.5rem' }}>
                      {seg}
                    </div>
                 ))}
              </div>
            )}
         </div>
      </div>
    );
  }

  if (presentation.type === 'SOUND_TO_WRITING') {
    return (
      <div className={styles.visualContainer}>
         {step < 3 ? (
            <div className={styles.writingContainer}>
               {presentation.segments.map((seg: string, i: number) => (
                  <span key={i} className={`${styles.connectedWordBase} ${step >= 2 ? styles.visible : ''}`} style={{ fontSize: '5rem', opacity: step >= 2 ? 1 : 0, transition: `opacity 0.5s ${i * 0.5}s`, width: '100px', display: 'inline-block', textAlign: 'center' }}>
                    {seg}
                  </span>
               ))}
            </div>
         ) : (
            <div className={styles.wordArea} style={{ position: 'relative' }}>
               <span className={styles.connectedWordBase}>
                 {presentation.completedWord}
               </span>
               {presentation.hasTanween && step >= 4 && (
                 <div className={styles.tanweenGlow} style={{ position: 'absolute', top: '-60px', left: '40px', fontSize: '3rem' }}>
                   ٌ
                 </div>
               )}
               {step >= 2 && step < 4 && <div className={styles.pencilGlow}>✏️</div>}
            </div>
         )}
      </div>
    );
  }

  return null;
}

