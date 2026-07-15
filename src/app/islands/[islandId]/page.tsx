import React from "react";
import { getLessonData } from "@/features/learning-core/data/adapter";
import { getActiveProfile } from "@/features/player/actions";
import { getIslandTheme } from "@/features/learning-core/config/island-themes";
import { IslandLobbyShell, type StationDef, type LobbyProgress } from "@/features/learning-core/components/island-lobby/IslandLobbyShell";
import { getIslandProgressDetails } from "@/features/learning-core/actions";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export default async function IslandLobbyPage({ params }: { params: Promise<{ islandId: string }> }) {
  const { islandId } = await params;

  // ─── Load lesson data ───
  let lessonData;
  try {
    lessonData = getLessonData(islandId);
  } catch {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500 font-bold text-2xl" dir="rtl">
        جاري العمل على هذه الجزيرة...
      </div>
    );
  }

  // ─── Load theme ───
  const theme = getIslandTheme(islandId);

  // ─── Load profile and progress from DB ───
  const profile = await getActiveProfile();
  if (!profile) {
    redirect('/profiles');
  }

  const { progress: pData, masteryState } = await getIslandProgressDetails(islandId);
  const isCompleted = pData?.status === 'COMPLETED' || masteryState === 'MASTERED_FIRST_PASS' || masteryState === 'MASTERED_AFTER_REVIEW';
  const hasIslandCup = pData?.islandCupAwarded || false;
  
  let stageProgresses: { stageId: string, status: string }[] = [];
  try {
    if (pData?.id) {
      stageProgresses = await prisma.stageProgress.findMany({
        where: { islandProgressId: pData.id },
        select: { stageId: true, status: true }
      });
    }
  } catch (e) {
    // Ignore
  }

  const totalChallenges = (lessonData.games || []).reduce(
    (sum: number, g: { challenges: unknown[] }) => sum + g.challenges.length,
    0,
  );

  // ─── Build stations list from canonical data ───
  const rawStations: { id: string; title: string }[] = [
    { id: 'objectives', title: 'الأهداف' },
    { id: 'warmup', title: 'رسالة الجد المفقودة' },
    { id: 'story', title: lessonData.story?.title || 'القصة' },
    { id: 'charactersAndWords', title: 'الشخصيات والكلمات' },
    ...(lessonData.explanationScenes || []).map((s: { sceneId: string; title: string }) => ({
      id: s.sceneId,
      title: s.title,
    })),
    ...(lessonData.games || []).map((g: { gameId: string; title: string }) => ({
      id: g.gameId,
      title: g.title,
    })),
    { id: 'review', title: 'بوابة الإتقان' },
    { id: 'conclusion', title: 'نهاية الرحلة' },
  ];

  // Assign states: progressive unlock, first is always available
  let firstLockedEncountered = false;
  const stations: StationDef[] = rawStations.map((s, i) => {
    let state: StationDef['state'] = 'LOCKED';
    
    const isCompleted = stageProgresses.some(sp => sp.stageId === s.id && sp.status === 'COMPLETED');
    
    if (isCompleted) {
      state = 'COMPLETED';
    } else if (!firstLockedEncountered) {
      state = 'AVAILABLE';
      firstLockedEncountered = true; // First uncompleted stage is the available frontier
    }

    // Edge case: if we want previous stages to always remain accessible
    if (state === 'COMPLETED') {
      state = 'COMPLETED'; // Still clickable via IslandLobbyShell handling
    }

    return { ...s, state };
  });

  // ─── Primary action label ───
  const isFirstVisit = !pData || (pData.correctChallengeCount === 0 && pData.pendingReviewCount === 0);
  let primaryActionLabel = 'ابدأ المغامرة';
  if (isCompleted) primaryActionLabel = 'استعرض الجزيرة من جديد';
  else if (!isFirstVisit) primaryActionLabel = 'متابعة الرحلة';

  const firstAvailableStageId = stations.find(s => s.state === 'AVAILABLE')?.id || stations[0].id;

  const progress: LobbyProgress = {
    score: pData?.finalScorePercent || 0,
    correctCount: pData?.correctChallengeCount || 0,
    totalChallenges: pData?.totalMandatoryChallenges || totalChallenges,
    completedStages: stations.filter(s => s.state === 'COMPLETED').length,
    totalStages: stations.length,
    skippedPending: 0, // combined into pendingReviewCount below
    needsReview: pData?.pendingReviewCount || 0,
    isCompleted,
    hasIslandCup,
  };

  return (
    <IslandLobbyShell
      islandId={islandId}
      theme={theme}
      stations={stations}
      progress={progress}
      primaryActionLabel={primaryActionLabel}
      firstStageId={firstAvailableStageId}
      profileName={profile?.name || null}
      profileInitial={profile?.name?.[0] || null}
    />
  );
}
