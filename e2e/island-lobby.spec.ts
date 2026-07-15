import { test, expect } from '@playwright/test';

const ISLANDS = [
  { id: 'island-1', title: 'هَيَّا نَتَعَلَّمْ يَا جَدِّي', emoji: '🏡' },
  { id: 'island-2', title: 'أَمِيرَة وَأُسْرَتُهَا السَّعِيدَة', emoji: '👨‍👩‍👧‍👦' },
  { id: 'island-3', title: 'عَالَمُ الحَيَوَان', emoji: '🦁' },
  { id: 'island-4', title: 'يَوْمٌ فِي المَدْرَسَة', emoji: '🏫' },
];

for (const island of ISLANDS) {
  test.describe(`Island Lobby: ${island.id}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/profiles');
      await page.locator('.create-card').click();
      await page.waitForSelector('.avatar-card', { state: 'visible' });
      await page.locator('.avatar-card').last().click();
      await page.locator('#childNameInput').fill(`Test${Date.now()}`);
      await page.locator('text=استعد لبدء الرحلة').click();
      await page.waitForURL('**/dashboard');
    });

    test('renders premium lobby, not a blank image', async ({ page }) => {
      await page.goto(`/islands/${island.id}`);
      await page.waitForLoadState('networkidle');

      // 1. Page title is visible
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toContainText(island.title);

      // 2. Hero does NOT cover entire document — check for journey map below hero
      const journeyMap = page.getByText('خريطة الرحلة');
      await expect(journeyMap).toBeVisible();

      // 3. Primary action is visible
      const primaryAction = page.locator('a').filter({ hasText: /ابدأ المغامرة|متابعة الرحلة|استعرض الجزيرة/ });
      await expect(primaryAction.first()).toBeVisible();

      // 4. No "قيد التطوير"
      await expect(page.locator('text=قيد التطوير')).not.toBeVisible();

      // 5. Progress summary visible
      await expect(page.getByText('نسبة الإنجاز')).toBeVisible();
      await expect(page.getByText('التحديات الصحيحة')).toBeVisible();
    });

    test('no console errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      await page.goto(`/islands/${island.id}`);
      await page.waitForLoadState('networkidle');
      // Filter out known harmless warnings
      const real = errors.filter(e => !e.includes('favicon') && !e.includes('DevTools'));
      expect(real).toHaveLength(0);
    });

    test('responsive: desktop screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(`/islands/${island.id}`);
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: `dev/evidence/ALL-ISLANDS-BACKGROUND-LAYOUT-FIX/${island.id}-desktop-1920.png`,
        fullPage: true
      });
    });

    test('responsive: mobile screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/islands/${island.id}`);
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: `dev/evidence/ALL-ISLANDS-BACKGROUND-LAYOUT-FIX/${island.id}-mobile.png`,
        fullPage: true
      });
    });
  });
}
