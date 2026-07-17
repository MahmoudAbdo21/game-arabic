import { getActiveProfile } from '@/features/player/actions';
import { PrismaClient } from '@prisma/client';
import { getLessonData } from '@/features/learning-core/data/adapter';

const prisma = new PrismaClient();

export async function getDashboardMetrics() {
  const profile = await getActiveProfile();
  if (!profile) return null;

  const completedIslands = await prisma.islandProgress.count({
    where: { profileId: profile.id, status: 'COMPLETED' }
  });

  const correctChallenges = await prisma.challengeAttempt.count({
    where: { profileId: profile.id, state: 'CORRECT_SCORED' }
  });

  const pendingReviews = await prisma.challengeAttempt.count({
    where: {
      profileId: profile.id,
      state: { in: ['SKIPPED_PENDING', 'ATTEMPTED_INCORRECT', 'INCORRECT_RETRY_AVAILABLE'] }
    }
  });

  const earnedPointsAggr = await prisma.challengeAttempt.count({
    where: { profileId: profile.id, earnedPoint: true }
  });
  const stars = earnedPointsAggr || 0;

  const gameCupsEarned = await prisma.stageProgress.count({
    where: { 
      islandProgress: { profileId: profile.id },
      status: 'COMPLETED',
      stageId: { contains: '-game-' }
    }
  });

  let gameCupsTotal = 0;
  const islandsList = ['island-1', 'island-2', 'island-3', 'island-4'];
  for (const iId of islandsList) {
    const lessonData = getLessonData(iId);
    gameCupsTotal += lessonData?.games?.length || 0;
  }

  const journeyCompletedUnits = await prisma.stageProgress.count({
    where: { 
      islandProgress: { profileId: profile.id },
      status: 'COMPLETED' 
    }
  });
  
  const journeyTotalUnits = 63;
  const journeyProgressPercent = Math.min(100, Math.round((journeyCompletedUnits / journeyTotalUnits) * 100));

  const islandCups = await prisma.rewardLedger.count({
    where: { profileId: profile.id, rewardType: 'ISLAND_CUP' }
  });

  return {
    islandsCompleted: completedIslands,
    islandsTotal: 4,
    levelsCompleted: gameCupsEarned, // Kept this field name for backward compatibility if needed, but semantically it's now gameCupsEarned
    levelsTotal: gameCupsTotal,
    gameCupsEarned,
    gameCupsTotal,
    journeyCompletedUnits,
    journeyTotalUnits,
    journeyProgressPercent,
    challengesCompleted: correctChallenges,
    challengesTotal: 65,
    pendingReviewCount: pendingReviews,
    totalStars: stars,
    islandCups,
    totalBadges: islandCups
  };
}
