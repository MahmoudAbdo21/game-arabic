import { getActiveProfile } from '@/features/player/actions';
import { PrismaClient } from '@prisma/client';

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

  const completedStages = await prisma.stageProgress.count({
    where: { 
      islandProgress: { profileId: profile.id },
      status: 'COMPLETED' 
    }
  });

  const islandCups = await prisma.rewardLedger.count({
    where: { profileId: profile.id, rewardType: 'ISLAND_CUP' }
  });

  const gameCups = await prisma.rewardLedger.count({
    where: { profileId: profile.id, rewardType: 'CHAPTER_CUP' }
  });

  return {
    islandsCompleted: completedIslands,
    islandsTotal: 4,
    levelsCompleted: completedStages,
    levelsTotal: 18,
    challengesCompleted: correctChallenges,
    challengesTotal: 65,
    pendingReviewCount: pendingReviews,
    totalStars: stars,
    islandCups,
    gameCups,
    totalBadges: islandCups
  };
}
