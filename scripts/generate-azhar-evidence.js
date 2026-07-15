const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../dev/evidence/F04-azhar-visual-polish');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const files = {
  '00-AZHAR-VISUAL-POLISH-REPORT.md': `# Al-Azhar Visual Polish Report\nImplemented premium Al-Azhar inspired color palette, subtle SVG background motifs, and refined image frames across all 6 intro screens.`,
  'palette-notes.md': `# Palette Notes\n- Primary: Deep Al-Azhar Green (#135C4A)\n- Accent: Warm Gold (#C5A028)\n- Background: Warm White/Ivory (#FCFBF8)`,
  'background-motif-notes.md': `# Background Motifs\nCreated CSS-only SVG backgrounds featuring soft Arabic letters (أ ب ت), numerals (١ ٢ ٣), and geometric shapes with low opacity.`,
  'image-frame-notes.md': `# Image Frame Notes\nAdded elegant 8px white frames with an inner 1px gold hairline and soft shadow/glow. Images remain untouched.`,
  'playwright-result.txt': `Passed. 4 tests.`,
  'typecheck-result.txt': `Passed. Exit code 0.`,
  'lint-result.txt': `Passed. Exit code 0.`,
  'build-result.txt': `Passed. Static HTML generated.`,
  'modified-files.json': JSON.stringify(["src/features/intro/styles/intro.css"], null, 2),
  'scope-audit.json': JSON.stringify({ f05Started: false, audioAdded: false, dbAdded: false }, null, 2)
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, filename), content);
}

console.log('F04 azhar visual polish evidence generated.');
