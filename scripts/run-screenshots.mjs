import { spawn } from 'child_process';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('dev/evidence/WAVE-03/screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// Start the server
const server = spawn('npm', ['run', 'start', '--', '-p', '6501'], {
  stdio: 'inherit',
  shell: true
});

setTimeout(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const takeScreenshot = async (name, width, height) => {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}_${width}x${height}.png`), fullPage: true });
    };

    console.log('Capturing Profile Page...');
    await page.goto('http://localhost:6501/profiles');
    await page.waitForLoadState('networkidle');
    await takeScreenshot('01_profile_page', 1366, 768);
    await takeScreenshot('01_profile_page', 768, 1024);
    await takeScreenshot('01_profile_page', 390, 844);

    console.log('Capturing Profile Modal...');
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.locator('.persona-card').first().click();
    await page.waitForSelector('.profile-dialog[open]');
    await takeScreenshot('02_profile_modal', 1366, 768);
    await takeScreenshot('02_profile_modal', 390, 844);

    console.log('Capturing Dashboard Map...');
    await page.locator('#childNameInput').fill('عمر');
    await page.locator('text=استعد لبدء الرحلة').click();
    await page.waitForURL('**/dashboard');
    await page.waitForLoadState('networkidle');

    await takeScreenshot('01_dashboard_map', 1920, 1080);
    await takeScreenshot('01_dashboard_map', 1366, 768);
    await takeScreenshot('01_dashboard_map', 1024, 768);
    await takeScreenshot('01_dashboard_map', 768, 1024);
    await takeScreenshot('01_dashboard_map', 390, 844);

    console.log('Capturing Progress Detail...');
    await page.setViewportSize({ width: 1366, height: 768 });
    const progressEl = await page.$('.journey-progress-panel');
    if (progressEl) await progressEl.screenshot({ path: path.join(SCREENSHOT_DIR, `02_progress_desktop.png`) });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    const progressElMob = await page.$('.journey-progress-panel');
    if (progressElMob) await progressElMob.screenshot({ path: path.join(SCREENSHOT_DIR, `02_progress_mobile.png`) });

    console.log('Capturing Transparency Proof...');
    const proofPath = path.resolve('dev/evidence/WAVE-03-dashboard-quality/transparency-proof.html');
    await page.goto(`file://${proofPath}`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot('03_transparency_proof', 1366, 1000);

    await browser.close();
    console.log('Screenshots captured successfully.');
    server.kill();
    process.exit(0);
  } catch (err) {
    console.error(err);
    server.kill();
    process.exit(1);
  }
}, 5000); // wait 5 seconds for server to start
