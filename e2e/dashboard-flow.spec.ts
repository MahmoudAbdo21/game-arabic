import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  test('direct navigation to dashboard redirects to profiles', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/profiles/);
  });

  test('dashboard displays truthful zeros and islands', async ({ page }) => {
    // Setup state by navigating through profile
    await page.goto('/profiles');
    await page.locator('.create-card').click();
    await page.waitForSelector('.avatar-card', { state: 'visible' });
    await page.locator('.avatar-card').last().click();
    await page.locator('#childNameInput').fill('عمر');
    await page.locator('text=استعد لبدء الرحلة').click();
    
    await expect(page).toHaveURL(/\/dashboard/);

    // Zeros check (Journey Progress)
    const progressPanel = page.locator('.journey-progress-hero');
    await expect(progressPanel).toBeVisible();
    await expect(progressPanel).toContainText('تقدم الرحلة');
    await expect(progressPanel).toContainText('٠٪');
    await expect(progressPanel).toContainText('٠ من ٤ جزر');
    
    // Islands check
    const islands = page.locator('.island-node');
    await expect(islands).toHaveCount(4);

    // Island 1 Preview
    const island1 = islands.first();
    await island1.click();
    await page.waitForURL('**/islands/island-1');
    await expect(page).toHaveURL(/\/islands\/island-1/);

    // Go back to dashboard
    await page.goto('/dashboard');
    await page.waitForSelector('.island-node', { state: 'visible' });

    // All other islands should be locked
    const allIslands = page.locator('.island-node');
    const lockedIslands = page.locator('.island-image-wrapper.is-locked');
    await expect(lockedIslands).toHaveCount(3);
    
    // Clicking a locked island shows a message
    const lockedIsland = allIslands.nth(1);
    await lockedIsland.click();
    await expect(page.locator('text=الجزيرة مغلقة. تُفتح بعد إكمال ما قبلها.')).toBeVisible();
  });
});
