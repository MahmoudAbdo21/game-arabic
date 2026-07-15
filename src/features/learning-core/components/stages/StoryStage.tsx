"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { submitStageProgress, submitSceneProgress } from "@/features/learning-core/actions";
import { TranscriptOverlay } from "../TranscriptOverlay";
import type { LessonPresentation, StoryScene } from "@/features/learning-core/data/schema";
import styles from "./StoryStage.module.css";
import { AnimatedBackground } from "../AnimatedBackground";
import { useAudio } from "@/providers/AudioProvider";

interface StoryStageProps {
  islandId: string;
  story: {
    title: string;
    narration: string;
    presentation: string;
  };
  presentationData: LessonPresentation | null;
  profileId: string;
  nextRoute: string;
}

export function StoryStage({ islandId, story, presentationData, profileId, nextRoute }: StoryStageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showTranscript, setShowTranscript] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const scenes = presentationData?.storyScenes || [];
  const sceneParam = searchParams.get('scene');
  
  // Find current scene index based on URL param, default to 0
  let initialIndex = 0;
  if (sceneParam && scenes.length > 0) {
    const idx = scenes.findIndex(s => s.sceneId === sceneParam);
    if (idx !== -1) initialIndex = idx;
  }
  
  const [currentSceneIndex, setCurrentSceneIndex] = useState(initialIndex);

  // Sync state if URL changes
  useEffect(() => {
    if (sceneParam && scenes.length > 0) {
      const idx = scenes.findIndex(s => s.sceneId === sceneParam);
      if (idx !== -1 && idx !== currentSceneIndex) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentSceneIndex(idx);
      }
    }
  }, [sceneParam, scenes, currentSceneIndex]);

  const currentScene: StoryScene | null = scenes.length > 0 ? scenes[currentSceneIndex] : null;

  // Persist scene entry
  useEffect(() => {
    if (currentScene) {
      submitSceneProgress({
        islandId,
        stageId: 'story',
        sceneId: currentScene.sceneId,
        status: 'IN_PROGRESS'
      }).catch(console.error);
    }
  }, [currentScene, islandId]);

  const { play, enterManualMode, isManualMode } = useAudio();
  const playedSceneRef = useRef<string | null>(null);

  const getAudioId = useCallback((index: number) => {
    const islandNum = islandId.split('-')[1];
    return `${islandId}-story-l${islandNum}-scene-${index + 1}-narration`;
  }, [islandId]);

  const handleNextAuto = useCallback(async () => {
    if (isProcessing || !currentScene) return;
    setIsProcessing(true);
    try {
      await submitSceneProgress({
        islandId,
        stageId: 'story',
        sceneId: currentScene.sceneId,
        status: 'COMPLETED'
      });
      if (currentSceneIndex < scenes.length - 1) {
        const nextScene = scenes[currentSceneIndex + 1];
        router.push(`/islands/${islandId}/journey/story?scene=${nextScene.sceneId}`);
        setIsProcessing(false);
      } else {
        await submitStageProgress({
          islandId,
          stageId: 'story',
          status: 'COMPLETED'
        });
        router.push(nextRoute);
      }
    } catch (e) {
      console.error(e);
      router.push(nextRoute);
    }
  }, [currentScene, isProcessing, islandId, currentSceneIndex, scenes, router, nextRoute]);

  const stateRef = useRef({
    isManualMode,
    sceneId: currentScene?.sceneId,
    handleNextAuto
  });
  
  useEffect(() => {
    stateRef.current = {
      isManualMode,
      sceneId: currentScene?.sceneId,
      handleNextAuto
    };
  });

  useEffect(() => {
    if (currentScene && playedSceneRef.current !== currentScene.sceneId) {
      playedSceneRef.current = currentScene.sceneId;
      const sceneIdToPlay = currentScene.sceneId;
      
      play(getAudioId(currentSceneIndex), {
        ownerKey: sceneIdToPlay,
        onEnded: () => {
          if (stateRef.current.isManualMode) return;
          if (stateRef.current.sceneId !== sceneIdToPlay) return;
          
          stateRef.current.handleNextAuto();
        }
      });
    }
  }, [currentScene, currentSceneIndex, play, getAudioId]);

  const handleNext = async () => {
    await handleNextAuto();
  };

  const handleReplayCurrent = () => {
    if (currentScene) {
      play(getAudioId(currentSceneIndex), {
        ownerKey: currentScene.sceneId
      });
    }
  };

  const handlePrevious = () => {
    enterManualMode();
    if (currentScene && currentSceneIndex > 0) {
      const prevScene = scenes[currentSceneIndex - 1];
      router.push(`/islands/${islandId}/journey/story?scene=${prevScene.sceneId}`);
    }
  };

  // If no scenes, fallback to original legacy rendering
  if (!currentScene) {
    return (
      <div className={styles.container}>
      <AnimatedBackground />
        <div 
          className={styles.imageSection}
          style={{ backgroundImage: `url('/images/islands/${islandId}/story_bg.png')` }}
        >
          <div className={styles.imageOverlay} />
        </div>
        <div className={styles.contentSection}>
          <div className={styles.header}>
            <h2 className={styles.title}>{story.title}</h2>
            <button 
              className={styles.transcriptButton}
              onClick={handleReplayCurrent}
              title="إعادة الصوت"
            >
              <span>▶️</span>
              <span className="hidden sm:inline">إعادة الصوت</span>
            </button>
          </div>
          <div className={styles.textScrollArea}>
            <p className={styles.contentText}>{story.narration}</p>
          </div>
          <div className={styles.footer}>
            <button 
              onClick={handleNext}
              disabled={isProcessing}
              className={styles.nextButton}
            >
              التالي
            </button>
          </div>
        </div>
        {showTranscript && (
          <TranscriptOverlay cues={[{ kind: 'NARRATION', text: story.narration }]} onClose={() => setShowTranscript(false)} />
        )}
      </div>
    );
  }

  // Multi-scene rendering
  return (
    <div className={styles.container}>
      <AnimatedBackground />
      {/* Image Section - Now uses context-accurate scene image */}
      <div 
        className={styles.imageSection}
        style={{ 
          backgroundImage: `url('${currentScene.visual.imageUrl}')`,
          backgroundSize: currentScene.visual.objectFit,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className={styles.imageOverlay} />
      </div>

      {/* Content Section */}
      <div className={styles.contentSection}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{currentScene.title}</h2>
            <div className="text-sm text-slate-500 mt-1 font-medium">
              مشهد {currentSceneIndex + 1} من {scenes.length}
            </div>
          </div>
          
          <button 
            className={styles.transcriptButton}
            onClick={handleReplayCurrent}
            title="إعادة الصوت"
          >
            <span>▶️</span>
            <span className="hidden sm:inline">إعادة الصوت</span>
          </button>
        </div>

        <div className={styles.textScrollArea}>
          <p className={styles.contentText}>
            {currentScene.narration}
          </p>
        </div>

        <div className={styles.controlsRow} style={{ justifyContent: 'space-between', width: '100%' }}>
          {currentSceneIndex > 0 ? (
            <button 
              onClick={handlePrevious}
              disabled={isProcessing}
              className={styles.secondaryButton}
            >
              السابق
            </button>
          ) : <div />}
          <button 
            onClick={handleNext}
            disabled={isProcessing}
            className={styles.nextButton}
          >
            {currentSceneIndex < scenes.length - 1 ? 'التالي' : 'التعرف على الكلمات'}
          </button>
        </div>
      </div>

      {/* Transcript Overlay */}
      {showTranscript && (
        <TranscriptOverlay 
          cues={[{ kind: 'NARRATION', text: currentScene.narration }]} 
          onClose={() => setShowTranscript(false)} 
        />
      )}
    </div>
  );
}

