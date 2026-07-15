const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const brainDir = path.join('C:', 'Users', 'محمودعبدالرحمنعبدالل', '.gemini', 'antigravity', 'brain', 'da5fccef-99ea-45c5-9557-6217b265df97');
const devAssetsDir = path.join(__dirname, '..', 'dev', 'generated-assets', 'wave-03');
const publicDir = path.join(__dirname, '..', 'public', 'images');

const dirsToCreate = [
  path.join(devAssetsDir, 'profiles', 'candidates'),
  path.join(devAssetsDir, 'islands', 'candidates'),
  path.join(publicDir, 'profiles'),
  path.join(publicDir, 'islands')
];

dirsToCreate.forEach(d => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

const getSha256 = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
};

const profiles = ['profile_explorer', 'profile_storyteller', 'profile_listener', 'profile_builder'];
const islands = ['island_grandpa', 'island_family', 'island_nature', 'island_school'];

const manifest = { profiles: [], islands: [] };

function processCategory(items, categoryName) {
  items.forEach(item => {
    for (let i = 1; i <= 2; i++) {
      const prefix = `${item}_${i}_`;
      const files = fs.readdirSync(brainDir).filter(f => f.startsWith(prefix) && f.endsWith('.png'));
      if (files.length > 0) {
        const file = files[0];
        const srcPath = path.join(brainDir, file);
        const destCandidateName = `${item}_candidate_${i}.png`;
        const destCandidatePath = path.join(devAssetsDir, categoryName, 'candidates', destCandidateName);
        fs.copyFileSync(srcPath, destCandidatePath);

        const isSelected = i === 1;
        let publicPath = null;
        if (isSelected) {
          const publicName = `${item}.png`;
          const finalPublicPath = path.join(publicDir, categoryName, publicName);
          fs.copyFileSync(srcPath, finalPublicPath);
          publicPath = `/images/${categoryName}/${publicName}`;
        }

        manifest[categoryName].push({
          id: `${item}_${i}`,
          candidatePath: `dev/generated-assets/wave-03/${categoryName}/candidates/${destCandidateName}`,
          selected: isSelected,
          publicPath: publicPath,
          sha256: getSha256(srcPath)
        });
      }
    }
  });
}

processCategory(profiles, 'profiles');
processCategory(islands, 'islands');

const manifestPath = path.join(devAssetsDir, 'generated-asset-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log('Assets organized successfully.');
