"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { submitStageProgress } from "@/features/learning-core/actions";
import { ExplanationSceneSchema, ExplanationPresentation } from "../../data/schema";
import { ExplanationVisual } from "./ExplanationVisual";
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
    presentation?: ExplanationPresentation;
  };
  profileId: string;
  nextRoute: string;
  prevRoute?: string;
}

export function ExplanationStage({ islandId, scene, profileId, nextRoute, prevRoute }: ExplanationStageProps) {
  const router = useRouter();
  const [showTranscript, setShowTranscript] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [replayToken, setReplayToken] = useState(0);
  const { play, stop, enterManualMode } = useAudio();
  const isAutoModeRef = useRef<boolean>(true);

  // Single mount effect per route
  useEffect(() => {
    if (ExplanationFlow.isFreshVisit()) {
      ExplanationFlow.setAuto();
    }
    isAutoModeRef.current = ExplanationFlow.getMode() === 'AUTO';
    ExplanationFlow.setLastTimestamp();

    if (!scene.presentation) {
      play(`${islandId}-${scene.sceneId}-audio`, {
        ownerKey: scene.sceneId,
        onEnded: () => {
          if (isAutoModeRef.current) {
            handleNextAuto();
          }
        }
      });
    }

    return () => {
      ExplanationFlow.setLastTimestamp();
      stop();
    };
  }, [islandId, scene.sceneId]);

  const handleNextAuto = React.useCallback(async () => {
    setIsProcessing(p => {
      if (p) return true;
      // Start navigation
      submitStageProgress({
        islandId,
        stageId: scene.sceneId,
        status: 'COMPLETED'
      }).finally(() => {
        router.push(nextRoute);
      });
      return true;
    });
  }, [islandId, scene.sceneId, router, nextRoute]);

  const handleNext = () => {
    stop();
    handleNextAuto();
  };

  const handlePrevious = () => {
    if (!prevRoute) return;
    setIsProcessing(p => {
      if (p) return true;
      stop();
      ExplanationFlow.setManual();
      isAutoModeRef.current = false;
      router.push(prevRoute);
      return true;
    });
  };

  const handleReplayCurrent = () => {
    if (isProcessing) return;
    stop();
    ExplanationFlow.setManual();
    isAutoModeRef.current = false;
    setReplayToken(prev => prev + 1);
    if (!scene.presentation) {
      play(`${islandId}-${scene.sceneId}-audio`, {
        ownerKey: scene.sceneId
      });
    }
  };

  return (
    <div className={styles.container}>
      
      {/* Cinematic Background Layer */}
      <div 
        className={styles.backgroundLayer}
        style={{ backgroundImage: `url('${scene.presentation?.visualUrl || `/images/islands/${islandId}/explanation_bg.png`}')` }}
      />
      {scene.presentation && (
        <ExplanationVisual 
          islandId={islandId}
          sceneId={scene.sceneId}
          presentation={scene.presentation} 
          isAutoMode={isAutoModeRef.current}
          onComplete={handleNextAuto}
          replayToken={replayToken}
          isCancelled={isProcessing}
        />
      )}
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
