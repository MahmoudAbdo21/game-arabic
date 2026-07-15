'use server';

import { PrismaClient } from '@prisma/client';
import { getLessonData } from './data/adapter';

const prisma = new PrismaClient();

export async function submitChallengeAttempt({
  islandId,
  stageId,
  gameId,
  challengeId,
  sceneId,
  isCorrect,
  isTemporarySkip
}: {
  islandId: string;
  stageId: string;
  gameId?: string;
  challengeId: string;
  sceneId: string;
  isCorrect: boolean;
  isTemporarySkip?: boolean;
}) {
  const { getActiveProfile } = await import('@/features/player/actions');
  const profile = await getActiveProfile();
  if (!profile) {
    return { success: false, code: 'NO_PROFILE', message: 'تعذر العثور على البطل، الرجاء تسجيل الدخول أولاً' };
  }
  const profileId = profile.id;

  try {
  return await prisma.$transaction(async (tx) => {
    let attempt = await tx.challengeAttempt.findUnique({
      where: { profileId_islandId_challengeId: { profileId, islandId, challengeId } }
    });

    if (!attempt) {
      attempt = await tx.challengeAttempt.create({
        data: {
          profileId,
          islandId,
          stageId,
          gameId,
          challengeId,
          sceneId,
          state: 'IN_PROGRESS',
          attemptCount: 0,
          earnedPoint: false
        }
      });
    }

    if (attempt.state === 'CORRECT_SCORED') {
      return { success: true, state: 'CORRECT_SCORED', message: "REPLAY" };
    }

    if (isTemporarySkip) {
      attempt = await tx.challengeAttempt.update({
        where: { id: attempt.id },
        data: { state: 'SKIPPED_PENDING', skippedAt: new Date() }
      });
    } else {
      const newAttemptCount = attempt.attemptCount + 1;
      let newState = attempt.state;
      let firstAttemptCorrect = attempt.firstAttemptCorrect;
      let earnedPoint = attempt.earnedPoint;
      let resolvedAt = attempt.resolvedAt;
      let earnedPointAt = attempt.earnedPointAt;

      if (isCorrect) {
        newState = 'CORRECT_SCORED';
        resolvedAt = new Date();
        if (newAttemptCount === 1) {
          firstAttemptCorrect = true;
        }
        if (!earnedPoint) {
          earnedPoint = true;
          earnedPointAt = new Date();
        }
      } else {
        if (newAttemptCount === 1) {
          firstAttemptCorrect = false;
        }
        newState = 'INCORRECT_RETRY_AVAILABLE';
      }

      attempt = await tx.challengeAttempt.update({
        where: { id: attempt.id },
        data: {
          state: newState,
          attemptCount: newAttemptCount,
          hasSubmittedGradedAttempt: true,
          firstAttemptCorrect,
          earnedPoint,
          earnedPointAt,
          resolvedAt
        }
      });
    }

    return { success: true, state: attempt.state };
  });
  } catch (error) {
    console.error('Failed to submit challenge attempt:', error);
    return { success: false, code: 'DB_ERROR', message: 'تعذر حفظ إجابتك. حاول مرة أخرى.' };
  }
}

export async function submitStageProgress({
  islandId,
  stageId,
  status
}: {
  islandId: string;
  stageId: string;
  status: string;
}) {
  const { getActiveProfile } = await import('@/features/player/actions');
  const profile = await getActiveProfile();
  if (!profile) return { success: false };
  const profileId = profile.id;

  try {
    await prisma.$transaction(async (tx) => {
      let islandProgress = await tx.islandProgress.findUnique({
        where: { profileId_islandId: { profileId, islandId } }
      });
      if (!islandProgress) {
        islandProgress = await tx.islandProgress.create({
          data: { profileId, islandId, status: 'IN_PROGRESS' }
        });
      }

      await tx.stageProgress.upsert({
        where: { islandProgressId_stageId: { islandProgressId: islandProgress.id, stageId } },
        update: { status, completedAt: status === 'COMPLETED' ? new Date() : undefined },
        create: { islandProgressId: islandProgress.id, stageId, status, completedAt: status === 'COMPLETED' ? new Date() : undefined }
      });

      await _recalculateIslandProgress(tx, profileId, islandId);
    });
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}

export async function submitSceneProgress({
  islandId,
  stageId,
  sceneId,
  status
}: {
  islandId: string;
  stageId: string;
  sceneId: string;
  status: string;
}) {
  const { getActiveProfile } = await import('@/features/player/actions');
  const profile = await getActiveProfile();
  if (!profile) return { success: false };
  const profileId = profile.id;

  try {
    let islandProgress = await prisma.islandProgress.findUnique({
      where: { profileId_islandId: { profileId, islandId } }
    });
    if (!islandProgress) {
      islandProgress = await prisma.islandProgress.create({
        data: { profileId, islandId, status: 'IN_PROGRESS' }
      });
    }
    const stageProgress = await prisma.stageProgress.upsert({
      where: { islandProgressId_stageId: { islandProgressId: islandProgress.id, stageId } },
      update: { status: 'IN_PROGRESS', currentSceneId: sceneId },
      create: { islandProgressId: islandProgress.id, stageId, status: 'IN_PROGRESS', currentSceneId: sceneId }
    });
    await prisma.sceneProgress.upsert({
      where: { stageProgressId_sceneId: { stageProgressId: stageProgress.id, sceneId } },
      update: { status },
      create: { stageProgressId: stageProgress.id, sceneId, status }
    });
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function _recalculateIslandProgress(tx: any, profileId: string, islandId: string) {
  const lessonData = getLessonData(islandId);
  if (!lessonData) return;

  let totalChallenges = 0;
  lessonData.games?.forEach(g => {
    totalChallenges += g.challenges?.length || 0;
  });
  // Derive totalStages safely
  // E.g., objectives + warmup + story + charactersAndWords + (explanation scenes) + (games) + review + conclusion
  const explanationScenesCount = lessonData.explanationScenes?.length || 0;
  const gamesCount = lessonData.games?.length || 0;
  const derivedTotalStages = 4 + explanationScenesCount + gamesCount + 2; // Roughly: 4 fixed start stages, plus scenes/games, plus 2 end stages. Wait, actual number of unique stages?
  // We don't strictly need totalStages on the IslandProgress row if we rely on completedStageCount against the Lobby logic, but let's record it if needed.

  
  const attempts = await tx.challengeAttempt.findMany({
    where: { profileId, islandId }
  });

  let earnedPoints = 0;
  let firstPassCorrect = 0;
  let pendingCount = 0;
  let correctCount = 0;

  for (const a of attempts) {
    if (a.earnedPoint) {
      earnedPoints++;
      correctCount++;
    }
    if (a.firstAttemptCorrect) firstPassCorrect++;
    if (['SKIPPED_PENDING', 'INCORRECT_RETRY_AVAILABLE'].includes(a.state)) {
      pendingCount++;
    }
  }

  const finalScorePercent = totalChallenges > 0 ? (earnedPoints / totalChallenges) * 100 : 0;
  const firstPassAccuracy = totalChallenges > 0 ? (firstPassCorrect / totalChallenges) * 100 : 0;

  let islandProgress = await tx.islandProgress.findUnique({
    where: { profileId_islandId: { profileId, islandId } }
  });

  if (!islandProgress) {
    islandProgress = await tx.islandProgress.create({
      data: { profileId, islandId, status: 'IN_PROGRESS' }
    });
  }
  
  const stages = await tx.stageProgress.findMany({
    where: { islandProgressId: islandProgress.id, status: 'COMPLETED' }
  });

  await tx.islandProgress.update({
    where: { id: islandProgress.id },
    data: {
      correctChallengeCount: correctCount,
      totalMandatoryChallenges: totalChallenges,
      finalScorePercent,
      firstPassAccuracy,
      pendingReviewCount: pendingCount,
      completedStageCount: stages.length
    }
  });
}

export async function getPendingReviewItems(islandId: string) {
  const { getActiveProfile } = await import('@/features/player/actions');
  const profile = await getActiveProfile();
  if (!profile) return { success: false, items: [] };

  try {
    const items = await prisma.challengeAttempt.findMany({
      where: {
        profileId: profile.id,
        islandId,
        state: { in: ['SKIPPED_PENDING', 'INCORRECT_RETRY_AVAILABLE'] }
      },
      orderBy: { updatedAt: 'desc' }
    });
    return { success: true, items };
  } catch (e) {
    console.error(e);
    return { success: false, items: [] };
  }
}

export async function evaluateIslandCompletionAndUnlockNextIslandAction(islandId: string) {
  const { getActiveProfile } = await import('@/features/player/actions');
  const profile = await getActiveProfile();
  if (!profile) return { success: false };

  try {
    return await prisma.$transaction(async (tx) => {
      await _recalculateIslandProgress(tx, profile.id, islandId);
      const progress = await tx.islandProgress.findUnique({
        where: { profileId_islandId: { profileId: profile.id, islandId } }
      });
      if (!progress) return { success: false };

      const isEligible = progress.pendingReviewCount === 0 && progress.correctChallengeCount === progress.totalMandatoryChallenges && progress.finalScorePercent >= 80;

      if (!isEligible) {
        return { success: false, reason: 'IN_REVIEW', progress };
      }

      await tx.islandProgress.update({
        where: { id: progress.id },
        data: { status: 'COMPLETED', completedAt: new Date(), islandCupAwarded: true, islandCupAwardedAt: new Date() }
      });

      await tx.rewardLedger.upsert({
        where: { profileId_rewardType_referenceId: { profileId: profile.id, rewardType: 'ISLAND_CUP', referenceId: islandId } },
        update: {},
        create: { profileId: profile.id, rewardType: 'ISLAND_CUP', referenceId: islandId }
      });

      const nextNum = parseInt(islandId.replace('island-', '')) + 1;
      if (nextNum <= 4) {
        const nextId = "island-" + nextNum;
        await tx.islandProgress.upsert({
          where: { profileId_islandId: { profileId: profile.id, islandId: nextId } },
          update: {},
          create: { profileId: profile.id, islandId: nextId, status: 'AVAILABLE' }
        });
      }

      return { success: true, progress };
    });
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}

export async function getIslandProgressDetails(islandId: string) {
  const { getActiveProfile } = await import('@/features/player/actions');
  const profile = await getActiveProfile();
  if (!profile) return { success: false };

  try {
    const progress = await prisma.islandProgress.findUnique({
      where: { profileId_islandId: { profileId: profile.id, islandId } }
    });
    
    const attemptsCount = await prisma.challengeAttempt.count({
      where: { profileId: profile.id, islandId }
    });
    
    const completedStagesCount = await prisma.stageProgress.count({
      where: { islandProgressId: progress?.id || 'none', status: 'COMPLETED' }
    });
    
    // Inconsistency check: Has completed stages but zero challenge attempts.
    // E.g., if you finished stages (games) but attempts are 0.
    if (completedStagesCount > 0 && attemptsCount === 0 && progress) {
      return { success: false, code: 'INCONSISTENCY', message: 'بيانات التقدم غير متطابقة (0 تحديات).' };
    }

    // Determine mastery state
    let masteryState = 'IN_REVIEW';
    if (progress && progress.pendingReviewCount === 0) {
      if (progress.firstPassAccuracy >= 80) {
        masteryState = 'MASTERED_FIRST_PASS';
      } else if (progress.correctChallengeCount === progress.totalMandatoryChallenges) {
        masteryState = 'MASTERED_AFTER_REVIEW';
      }
    }

    return {
      success: true,
      progress: progress || {
        id: '',
        status: 'AVAILABLE',
        completedStageCount: 0,
        correctChallengeCount: 0,
        totalMandatoryChallenges: 0,
        finalScorePercent: 0,
        firstPassAccuracy: 0,
        pendingReviewCount: 0,
        islandCupAwarded: false
      },
      masteryState
    };
  } catch (e) {
    console.error(e);
    return { success: false, code: 'DB_ERROR', message: 'فشل في استرجاع بيانات التقدم' };
  }
}
