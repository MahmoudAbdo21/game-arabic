"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { submitStageProgress } from "@/features/learning-core/actions";
import { ExplanationSceneSchema } from "../../data/schema";
import { z } from "zod";
import { TranscriptOverlay } from "../TranscriptOverlay";
import styles from "./ExplanationStage.module.css";
import { useAudio } from "@/providers/AudioProvider";
import { ExplanationFlow } from "./explanation-flow";

interface ExplanationStageProps {
  islandId: string;
  scene: {
    sceneId: string;
    title: string;
    content: string;
  };
  profileId: string;
  nextRoute: string;
  prevRoute?: string;
}

export function ExplanationStage({ islandId, scene, profileId, nextRoute, prevRoute }: ExplanationStageProps) {
  const router = useRouter();
  const [showTranscript, setShowTranscript] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { play, stop, enterManualMode } = useAudio();
  const isAutoModeRef = useRef<boolean>(true);
  const activeTokenRef = useRef<number>(0);

  useEffect(() => {
    if (ExplanationFlow.isFreshVisit()) {
      ExplanationFlow.setAuto();
    }
    isAutoModeRef.current = ExplanationFlow.getMode() === 'AUTO';
    ExplanationFlow.setLastTimestamp();

    activeTokenRef.current += 1;
    const currentToken = activeTokenRef.current;

    play(`${islandId}-${scene.sceneId}-audio`, {
      ownerKey: scene.sceneId,
      onEnded: () => {
        if (currentToken === activeTokenRef.current && isAutoModeRef.current) {
          handleNextAuto();
        }
      }
    });

    return () => {
      activeTokenRef.current += 1; // invalidate callbacks
      ExplanationFlow.setLastTimestamp();
    };
  }, [islandId, scene.sceneId, play]);

  const handleNextAuto = React.useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    activeTokenRef.current += 1; // invalidate old callbacks just in case
    try {
      await submitStageProgress({
        islandId,
        stageId: scene.sceneId,
        status: 'COMPLETED'
      });
      router.push(nextRoute);
    } catch (e) {
      console.error(e);
      router.push(nextRoute);
    }
  }, [isProcessing, islandId, scene.sceneId, router, nextRoute]);

  const handleNext = async () => {
    stop();
    await handleNextAuto();
  };

  const handlePrevious = () => {
    if (!prevRoute) return;
    stop();
    ExplanationFlow.setManual();
    isAutoModeRef.current = false;
    activeTokenRef.current += 1;
    router.push(prevRoute);
  };

  const handleReplayCurrent = () => {
    stop();
    ExplanationFlow.setManual();
    isAutoModeRef.current = false;
    activeTokenRef.current += 1;
    play(`${islandId}-${scene.sceneId}-audio`, {
      ownerKey: scene.sceneId
    });
  };

  return (
    <div className={styles.container}>
      
      {/* Cinematic Background Layer */}
      <div 
        className={styles.backgroundLayer}
        style={{ backgroundImage: `url('/images/islands/${islandId}/explanation_bg.png')` }}
      />
      <div className={styles.gradientOverlay} />

      {/* Top Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          {scene.title}
        </h2>
        <button 
          onClick={handleReplayCurrent}
          className={styles.transcriptButton}
          title="إعادة الصوت"
        >
          <span>▶️</span> إعادة الصوت
        </button>
      </div>

      {/* Explanation Content Container */}
      <div className={styles.contentContainer}>
        <div className={styles.contentPanel}>
          <p className={styles.contentText}>
            {scene.content}
          </p>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className={styles.footer} style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {prevRoute && (
          <button 
            onClick={handlePrevious}
            disabled={isProcessing}
            className={styles.nextButton}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
          >
            السابق
          </button>
        )}
        <button 
          onClick={handleNext}
          disabled={isProcessing}
          className={styles.nextButton}
        >
          متابعة التعلم
        </button>
      </div>

      {/* Transcript Overlay */}
      {showTranscript && (
        <TranscriptOverlay 
          cues={[{ kind: 'NARRATION', text: scene.content }]} 
          onClose={() => setShowTranscript(false)} 
        />
      )}
    </div>
  );
}
