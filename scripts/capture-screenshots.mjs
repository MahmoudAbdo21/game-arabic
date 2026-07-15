import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const OUT_DIR = path.join(process.cwd(), 'dev/evidence/F04-background-motif-visibility-fix/screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const ROUTES = [
  { id: '1-index', path: '/' },
  { id: '2-researcher', path: '/intro/researcher' },
  { id: '3-supervisors', path: '/intro/supervisors' },
  { id: '4-welcome', path: '/intro/welcome' },
  { id: '5-skills', path: '/intro/skills' },
  { id: '6-train', path: '/intro/train' },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1366, height: 768, screens: [1,2,3,4,5,6] },
  { name: 'mobile', width: 390, height: 844, screens: [1,4,6] },
  { name: 'tablet-port', width: 768, height: 1024, screens: [4] },
  { name: 'tablet-land', width: 1024, height: 768, screens: [4] },
  { name: 'desktop-lg', width: 1920, height: 1080, screens: [4] }
];

async function capture() {
  const browser = await chromium.launch();
  
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    
    for (let i = 0; i < ROUTES.length; i++) {
      const screenNum = i + 1;
      if (vp.screens.includes(screenNum)) {
        console.log(`Capturing ${vp.name} - ${ROUTES[i].id}...`);
        await page.goto(`http://localhost:6500${ROUTES[i].path}`);
        await page.waitForTimeout(500); // Allow fonts/images to render
        await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}-${ROUTES[i].id}.png`) });
      }
    }
    await context.close();
  }
  
  await browser.close();
  console.log("Screenshots completed.");
}

capture().catch(console.error);
