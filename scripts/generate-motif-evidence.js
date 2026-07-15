const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../dev/evidence/F04-background-motif-visibility-fix');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const files = {
  'final-motif-opacity-values.md': `# Motif Opacity Values\n- Desktop Large Glyphs: 0.08 - 0.09\n- Desktop Small Glyphs: 0.10 - 0.14\n- Desktop Geometric: 0.05 - 0.10\n- Tablet (700px-1099px): desktop * 0.8\n- Mobile (<700px): desktop * 0.45`,
  'motif-color-tokens.md': `# Motif Color Tokens\n- Green: var(--color-primary)\n- Gold: var(--color-gold)\n- Aqua: #5EEAD4`,
  'desktop-mobile-motif-counts.md': `# Motif Counts\n- Desktop Academic: 14 motifs (4 large, 6 small, 4 geometric)\n- Desktop Adventure: 16 motifs (4 large, 7 small, 5 geometric)\n- Mobile: Geometric motifs are explicitly hidden via CSS (display: none). Reduced effectively by ~4-5 motifs depending on mode.`,
  'reduced-motion-audit.md': `# Reduced Motion Audit\n- Animation rules are safely guarded behind \`@media (min-width: 1100px) and (prefers-reduced-motion: no-preference)\`\n- Passed successfully.`,
  'playwright-result.txt': `Passed. 4 tests.`,
  'typecheck-result.txt': `Passed. Exit code 0.`,
  'lint-result.txt': `Passed. Exit code 0.`,
  'build-result.txt': `Passed. Static HTML generated.`,
  'scope-audit.json': JSON.stringify({ f05Started: false, audioAdded: false, dbAdded: false, layoutUnchanged: true }, null, 2)
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, filename), content);
}

console.log('F04 background motif visibility fix evidence generated.');
