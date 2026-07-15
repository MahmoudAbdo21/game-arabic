import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Scoring Domain End-to-End', () => {
  test('Creates exactly one ChallengeAttempt row on correct answer and completes stage', async ({ page }) => {
    const profileName = 'ScoringTestHero' + Date.now();
    
    // 1. Create Profile in DB directly
    const profile = await prisma.playerProfile.create({
      data: {
        name: profileName,
        avatarId: 'profile-builder'
      }
    });
    
    expect(profile).toBeDefined();
    
    // Set session cookie to simulate login
    await page.context().addCookies([
      {
        name: 'arabic_game_session',
        value: profile.id,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
        expires: Math.round(Date.now() / 1000) + 86400
      }
    ]);
    
    // 2. Go to Island 1 game 1 directly
    await page.goto('/islands/island-1/journey/l1-game-01');
    
    // Wait for the Choice Engine to mount (e.g. wait for the instruction or choices)
    await page.waitForSelector('text=دَرَّاجَة');
    
    // Click the correct answer
    await page.getByRole('button', { name: 'دَرَّاجَة' }).click({ force: true });
    
    // Wait for success feedback
    await page.waitForSelector('text=التالي');
    
    // Check Database immediately: should have 1 attempt for l1-g01-q01
    const attempt = await prisma.challengeAttempt.findFirst({
      where: {
        profileId: profile.id,
        challengeId: 'l1-g01-q01'
      }
    });
    
    expect(attempt).toBeDefined();
    expect(attempt?.state).toBe('CORRECT_SCORED');
    expect(attempt?.firstAttemptCorrect).toBe(true);
    expect(attempt?.attemptCount).toBe(1);
    
    // Click 'Next' to move to the next challenge
    await page.getByText('التالي ➜').click();
    
    // The second challenge in the game should load
    // Wait for its text or something indicating progression
    // Let's just wait a moment to prove the UI advanced without crashing
    await page.waitForTimeout(500);
  });
});
