import { test, expect } from '@playwright/test';

test.describe('Intro Experience Tests', () => {
  test('Should navigate the six intro screens sequentially and hand off to profiles', async ({ page }) => {
    await page.goto('/');
    
    // 1. official-azhar
    await expect(page.locator('[data-testid="intro-scene-official-azhar"]')).toBeVisible();
    await page.click('[data-testid="intro-next"]');
    
    // 2. official-researcher-book
    await expect(page.locator('[data-testid="intro-scene-official-researcher-book"]')).toBeVisible();
    await page.click('[data-testid="intro-next"]');
    
    // 3. official-supervision-board
    await expect(page.locator('[data-testid="intro-scene-official-supervision-board"]')).toBeVisible();
    await page.click('[data-testid="intro-next"]');
    
    // 4. welcome-gate
    await expect(page.locator('[data-testid="intro-scene-welcome-gate"]')).toBeVisible();
    await page.click('[data-testid="intro-next"]');
    
    // 5. welcome-skills-island
    await expect(page.locator('[data-testid="intro-scene-welcome-skills-island"]')).toBeVisible();
    await page.click('[data-testid="intro-next"]');
    
    // 6. welcome-adventure-train
    await expect(page.locator('[data-testid="intro-scene-welcome-adventure-train"]')).toBeVisible();
    
    // 7. Final action reaches /profiles
    await page.click('[data-testid="intro-next"]');
    await page.waitForURL('**/profiles');
    await expect(page).toHaveURL(/\/profiles/);
  });

  test('Manual navigation contract is respected', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="intro-scene-official-azhar"]')).toBeVisible();
    
    // Wait at least 6 seconds
    await page.waitForTimeout(6000);
    
    // Verify scene did not change
    await expect(page.locator('[data-testid="intro-scene-official-azhar"]')).toBeVisible();
    
    // Click transcript toggle
    await page.click('[data-testid="intro-transcript-toggle"]');
    
    // Verify transcript appears
    await expect(page.locator('[data-testid="intro-transcript"]')).toBeVisible();
    
    // Wait again
    await page.waitForTimeout(6000);
    
    // Verify scene still did not change
    await expect(page.locator('[data-testid="intro-scene-official-azhar"]')).toBeVisible();
  });

  test('Zero audio requests in SCRIPT_ONLY mode', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', req => {
      requests.push(req.url());
    });

    await page.goto('/');
    await page.click('[data-testid="intro-transcript-toggle"]');
    await expect(page.locator('[data-testid="intro-transcript"]')).toBeVisible();

    const mediaRequests = requests.filter(url => 
      url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.ogg') || url.includes('audio')
    );
    expect(mediaRequests.length).toBe(0);
  });

  test('Navigation controls (Previous, Skip)', async ({ page }) => {
    await page.goto('/');
    
    // First previous should be disabled
    await expect(page.locator('[data-testid="intro-previous"]')).toBeDisabled();
    
    // Move next, then previous works
    await page.click('[data-testid="intro-next"]');
    await expect(page.locator('[data-testid="intro-scene-official-researcher-book"]')).toBeVisible();
    await expect(page.locator('[data-testid="intro-previous"]')).toBeEnabled();
    await page.click('[data-testid="intro-previous"]');
    await expect(page.locator('[data-testid="intro-scene-official-azhar"]')).toBeVisible();
    
    // Skip reaches /profiles
    await page.click('[data-testid="intro-skip"]');
    await page.waitForURL('**/profiles');
    await expect(page).toHaveURL(/\/profiles/);
  });
});
