import { test, expect } from '@playwright/test';

test.describe('Profile Selection Flow', () => {
  test('profile back button returns to root intro', async ({ page }) => {
    await page.goto('/profiles');
    const backButton = page.locator('button', { hasText: 'العودة' });
    await backButton.click();
    await expect(page).toHaveURL('/');
  });

  test('profile page displays four persona cards and allows selection', async ({ page }) => {
    await page.goto('/profiles');
    
    // Click create card to open modal
    await page.locator('.create-card').click();
    
    // Check for at least 4 avatar cards
    const cards = page.locator('.avatar-card');
    await expect(async () => {
      expect(await cards.count()).toBeGreaterThanOrEqual(4);
    }).toPass();

    // Selecting persona
    const firstCard = cards.last();
    await firstCard.click();
    
    // Dialog should open
    const dialog = page.locator('dialog');
    await expect(dialog).toBeVisible();

    const input = page.locator('#childNameInput');
    const confirmBtn = page.locator('text=استعد لبدء الرحلة');
    
    // Test invalid name
    await input.fill('a');
    await expect(confirmBtn).toBeDisabled();

    // Test valid name
    await input.fill('أحمد');
    await expect(confirmBtn).toBeEnabled();

    // Test navigation to dashboard
    await confirmBtn.click({ force: true });
    await page.waitForURL('**/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
