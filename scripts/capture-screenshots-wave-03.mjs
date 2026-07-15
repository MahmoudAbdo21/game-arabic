import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('dev/evidence/WAVE-03/screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const viewports = [
  { name: 'desktop-xl', width: 1920, height: 1080 },
  { name: 'desktop', width: 1366, height: 768 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const takeScreenshot = async (name, width, height) => {
    await page.setViewportSize({ width, height });
    // Wait a bit for animations
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}_${width}x${height}.png`), fullPage: true });
  };

  // Profile Page
  await page.goto('http://localhost:6500/profiles');
  await page.waitForLoadState('networkidle');
  await takeScreenshot('01_profile_page', 1366, 768);
  await takeScreenshot('01_profile_page', 768, 1024);
  await takeScreenshot('01_profile_page', 390, 844);

  // Profile Modal
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.locator('.persona-card').first().click();
  await page.waitForSelector('.profile-dialog[open]');
  await takeScreenshot('02_profile_modal', 1366, 768);
  await takeScreenshot('02_profile_modal', 390, 844);

  // Navigate to Dashboard
  await page.locator('#childNameInput').fill('عمر');
  await page.locator('text=استعد لبدء الرحلة').click();
  await page.waitForURL('**/dashboard');
  await page.waitForLoadState('networkidle');

  // Dashboard Map
  await takeScreenshot('03_dashboard_map', 1920, 1080);
  await takeScreenshot('03_dashboard_map', 1366, 768);
  await takeScreenshot('03_dashboard_map', 1024, 768);
  await takeScreenshot('03_dashboard_map', 768, 1024);
  await takeScreenshot('03_dashboard_map', 390, 844);

  // Island Preview Modal
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.locator('.island-node').first().click();
  await page.waitForSelector('.preview-dialog[open]');
  await takeScreenshot('04_island_preview', 1366, 768);
  await takeScreenshot('04_island_preview', 390, 844);

  await browser.close();
  console.log('Wave 03 Screenshots captured successfully.');
})();
