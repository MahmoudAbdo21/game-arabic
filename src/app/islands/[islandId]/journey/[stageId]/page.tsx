import React from "react";
import { JourneyShell } from "@/features/learning-core/components/JourneyShell";
import { StageRendererRegistry } from "@/features/learning-core/components/StageRendererRegistry";
import { getLessonData, getPresentationData } from "@/features/learning-core/data/adapter";
import { getActiveProfile } from "@/features/player/actions";
import { redirect } from "next/navigation";

export default async function StagePage({ params }: { params: Promise<{ islandId: string, stageId: string }> }) {
  const { islandId, stageId } = await params;
  console.log(`[StagePage] Rendered with islandId=${islandId}, stageId=${stageId}`);
  
  const lessonData = getLessonData(islandId);
  const presentationData = getPresentationData(islandId);

  
  // Extract exact selected profile from server-authoritative state
  const profile = await getActiveProfile();
  if (!profile) {
    redirect('/profiles');
  }
  const profileId = profile.id;
  const profileName = profile.name;

  // Resolve stage title
  let stageTitle = "المرحلة الحالية";
  if (stageId === 'objectives') stageTitle = "الأهداف";
  else if (stageId === 'warmup') stageTitle = "التمهيد";
  else if (stageId === 'story') stageTitle = "القصة";
  else if (stageId === 'charactersAndWords') stageTitle = "الشخصيات والكلمات";
  else if (stageId.startsWith('explanation')) {
    const idx = parseInt(stageId.replace('explanation-', ''), 10);
    stageTitle = lessonData?.explanationScenes?.[idx]?.title || "الشرح";
  }
  else if (stageId === 'review') stageTitle = "المراجعة";
  else if (stageId === 'conclusion') stageTitle = "الخاتمة";
  else {
    const game = lessonData?.games?.find(g => g.gameId === stageId);
    if (game) stageTitle = game.title;
  }

  const jsx = (
    <JourneyShell 
      islandId={islandId} 
      stageId={stageId}
      lessonTitle={lessonData?.title}
      stageTitle={stageTitle}
      profileId={profileId}
      profileName={profileName}
    >
      <StageRendererRegistry 
        islandId={islandId} 
        stageId={stageId} 
        lessonData={lessonData} 
        presentationData={presentationData}
        profileId={profileId} 
      />
    </JourneyShell>
  );
  console.log('[StagePage] Rendered successfully and returning JSX');
  return jsx;
}
