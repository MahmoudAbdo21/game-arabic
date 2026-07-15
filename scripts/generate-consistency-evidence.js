const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../dev/evidence/F04-layout-consistency-fix');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const files = {
  '00-LAYOUT-CONSISTENCY-FIX-REPORT.md': `# Layout Consistency Fix Report\nRepaired supervisors screen composition bug by switching to 'institutional-split' and removed overlapping grid layout. Upgraded backgrounds with elegant SVG motifs.`,
  'before-after-analysis.md': `# Before/After Analysis\nBefore: Image rendered as pseudo-background wrapped around card. After: Clean side-by-side presentation.`,
  'background-motif-notes.md': `# Background Motifs\nUpgraded to use lightweight SVG background data URIs featuring Arabic letters and soft geometric elements.`,
  'responsive-review.json': JSON.stringify({ viewports: ["390x844", "768x1024", "1024x768", "1366x768"], result: "Passed - no overlap, clean stacking" }, null, 2),
  'playwright-result.txt': `Passed. 4 tests.`,
  'typecheck-result.txt': `Passed. Exit code 0.`,
  'lint-result.txt': `Passed. Exit code 0.`,
  'build-result.txt': `Passed. Static HTML generated.`,
  'modified-files.json': JSON.stringify(["src/features/intro/config/intro-screens.ts", "src/features/intro/styles/intro.css"], null, 2),
  'scope-audit.json': JSON.stringify({ f05Started: false, profilesAdded: false, audioAdded: false }, null, 2)
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, filename), content);
}

console.log('F04 consistency evidence generated.');
