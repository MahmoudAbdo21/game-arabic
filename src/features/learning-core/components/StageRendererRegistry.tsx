import React from "react";
import { GoalsStage } from "./stages/GoalsStage";
import { WarmupStage } from "./stages/WarmupStage";
import { StoryStage } from "./stages/StoryStage";
import { CharactersStage } from "./stages/CharactersStage";
import { ExplanationStage } from "./stages/ExplanationStage";
import { GameChapterStage } from "./stages/GameChapterStage";
import { ReviewStage } from "./stages/ReviewStage";
import { ConclusionStage } from "./stages/ConclusionStage";
import { LessonData, LessonPresentation } from "../data/schema";
import { getNextStageId } from "../utils/journey-sequence";


interface StageRendererRegistryProps {
  islandId: string;
  stageId: string;
  lessonData: LessonData;
  presentationData: LessonPresentation | null;
  profileId: string;
}

export function StageRendererRegistry({ islandId, stageId, lessonData, presentationData, profileId }: StageRendererRegistryProps) {

  const nextStageId = getNextStageId(lessonData, stageId);
  const nextRoute = nextStageId 
    ? `/islands/${islandId}/journey/${nextStageId}`
    : `/islands/${islandId}`;

  // Goals
  if (stageId === 'objectives') {
    return <GoalsStage islandId={islandId} objectives={lessonData.objectives} nextRoute={nextRoute} />;
  }
  // Warmup
  if (stageId === 'warmup') {
    return <WarmupStage islandId={islandId} warmup={lessonData.warmup} profileId={profileId} nextRoute={nextRoute} />;
  }
  // Story
  if (stageId === 'story') {
    return <StoryStage islandId={islandId} story={lessonData.story} presentationData={presentationData} profileId={profileId} nextRoute={nextRoute} />;
  }

  // Characters
  if (stageId === 'charactersAndWords') {
    return <CharactersStage islandId={islandId} characters={lessonData.charactersAndWords || []} profileId={profileId} nextRoute={nextRoute} />;
  }
  // Review
  if (stageId === 'review') {
    return <ReviewStage islandId={islandId} content={lessonData.review as string} profileId={profileId} nextRoute={nextRoute} />;
  }
  // Conclusion
  if (stageId === 'conclusion') {
    return <ConclusionStage islandId={islandId} conclusion={lessonData.conclusion || ""} profileId={profileId} nextRoute={nextRoute} />;
  }

  // Explanations
  const expSceneIndex = lessonData.explanationScenes?.findIndex((s) => s.sceneId === stageId) ?? -1;
  const expScene = expSceneIndex !== -1 ? lessonData.explanationScenes![expSceneIndex] : undefined;
  if (expScene) {
    const prevExpId = expSceneIndex > 0 ? lessonData.explanationScenes![expSceneIndex - 1].sceneId : null;
    const prevRoute = prevExpId ? `/islands/${islandId}/journey/${prevExpId}` : undefined;
    return <ExplanationStage islandId={islandId} scene={expScene} profileId={profileId} nextRoute={nextRoute} prevRoute={prevRoute} />;
  }

  // Games
  const game = lessonData.games?.find((g) => g.gameId === stageId);
  const gamePresentation = presentationData?.games?.find((g) => g.gameId === stageId);
  
  if (game) {
    return <GameChapterStage islandId={islandId} game={game} gamePresentation={gamePresentation} nextRoute={nextRoute} />;
  }


  return (
    <div className="text-2xl font-bold text-rose-500 bg-white p-8 rounded-2xl shadow">
      لم يتم العثور على المكون الخاص بالمرحلة {stageId}
    </div>
  );
}
