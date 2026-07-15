import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Full Island Architecture Proof', () => {
  test('Complete Island 1 through 4 programmatic flow', async ({ page, request }) => {
    test.setTimeout(120000); // Allow up to 2 minutes for DB operations and navigation

    const profileName = 'IslandProof' + Date.now();
    const profile = await prisma.playerProfile.create({
      data: { name: profileName, avatarId: 'profile-builder' }
    });

    await page.context().addCookies([{
      name: 'arabic_game_session',
      value: profile.id,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      expires: Math.round(Date.now() / 1000) + 86400
    }]);

    // Prove it through the architecture
    for (let i = 1; i <= 4; i++) {
      const islandId = `island-${i}`;
      
      const res = await page.request.post('/api/debug/solve-island', {
        data: { islandId }
      });
      
      if (!res.ok()) {
        console.error(`API failed: ${res.status()} ${res.statusText()} - ${await res.text()}`);
      }
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data.success).toBe(true);
      if (!data.evalResult.success) {
        console.error(`Eval failed for ${islandId}:`, data.evalResult);
      }
      expect(data.evalResult.success).toBe(true);
    }

    // Go to dashboard (just to ensure it doesn't crash)
    await page.goto('/dashboard');
    const progressPanel = page.locator('.journey-progress-hero');
    await expect(progressPanel).toBeVisible();

    // Verify DB directly
    const cups = await prisma.rewardLedger.count({
      where: { profileId: profile.id, rewardType: 'ISLAND_CUP' }
    });
    expect(cups).toBe(4); // 4 islands completed
  });
});
