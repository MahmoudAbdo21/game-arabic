import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Ordering Validation End-to-End', () => {
  let createdProfileId: string | null = null;

  test.afterAll(async () => {
    if (createdProfileId) {
      await prisma.playerProfile.deleteMany({ where: { id: createdProfileId } }); // Cascade handles the rest
    }
  });

  test('Correct logical sequence passes, reversed sequence fails for l2-game-03', async ({ page }) => {
    const profileName = 'OrderingTestHero' + Date.now();
    
    const profile = await prisma.playerProfile.create({
      data: {
        name: profileName,
        avatarId: 'profile-builder'
      }
    });
    createdProfileId = profile.id;

    
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

    // Unlock Island 2
    await prisma.islandProgress.create({
      data: {
        profileId: profile.id,
        islandId: 'island-2',
        status: 'AVAILABLE'
      }
    });

    // 1. Go to Island 2 game 3
    await page.goto('/islands/island-2/journey/l2-game-03');
    
    // Wait for the game to mount
    await page.waitForSelector('[class*="targetSlot"]');
    
    // The correct logical sequence is أَ -> مِيـ -> رَ -> ة
    // Let's first test the reversed sequence (fail): ة -> رَ -> مِيـ -> أَ
    await page.getByRole('button', { name: 'ة' }).click({ force: true });
    await page.getByRole('button', { name: 'رَ' }).click({ force: true });
    await page.getByRole('button', { name: 'مِيـ' }).click({ force: true });
    await page.getByRole('button', { name: 'أَ' }).click({ force: true });
    
    // Validate wrong alert
    await page.waitForSelector('text=رتب المقاطع كما تسمعها في الكلمة.');
    
    // Check DB for attempt Count
    let attempt = await prisma.challengeAttempt.findFirst({
      where: { profileId: profile.id, challengeId: 'l2-g03-q01' }
    });
    expect(attempt?.state).toBe('INCORRECT_RETRY_AVAILABLE');
    
    // Click clear button to reset
    await page.getByRole('button', { name: 'مسح' }).click({ force: true });
    
    // Now enter the correct sequence: أَ -> مِيـ -> رَ -> ة
    await page.getByRole('button', { name: 'أَ', exact: true }).click({ force: true });
    await page.getByRole('button', { name: 'مِيـ', exact: true }).click({ force: true });
    await page.getByRole('button', { name: 'رَ', exact: true }).click({ force: true });
    await page.getByRole('button', { name: 'ة', exact: true }).click({ force: true });
    
    // Wait for success feedback
    await page.waitForSelector('text=التالي');
    
    // Check DB: should have state CORRECT_SCORED and exact 1 point earned
    attempt = await prisma.challengeAttempt.findFirst({
      where: { profileId: profile.id, challengeId: 'l2-g03-q01' }
    });
    
    expect(attempt?.state).toBe('CORRECT_SCORED');
    expect(attempt?.earnedPoint).toBe(true);
    expect(attempt?.attemptCount).toBe(2);
  });
});
