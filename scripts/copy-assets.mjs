import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ALLOW_LIST = {
  "85AA9363A102D5311D9B174C77C808C79D4A068DD3D46DE42BAB5C7087B7AC79": "alazhar_minarets_faculty.png",
  "04567EDA5278DF928C887415C908FC005903685286A8B2C1C4FE0264A55CF645": "flying_adventure_train.png",
  "BAA95F7996DB2A23E23ED7B433727F7B34B177235AAC854631AD9720E417A2B9": "golden_honor_board.png",
  "0E98722B9A5BBE91E26F4BE00CB767D73EBC263D5C96028CD5BB25897CD24E63": "magical_research_book.png",
  "49A5F4F7040BECAA2DD8DD4D7C91CE885F87668C61BAE7C171C67E5D2BF3D209": "skills_floating_island.png",
  "4B00A8101AD98E0849F6F2CA93708B84B99A60AE5FA5F90761AEBB8EB626138A": "welcome_magic_gate.png"
};

const SRC_DIR = path.join(process.cwd(), 'dev/images/public/images/intro');
const DEST_DIR = path.join(process.cwd(), 'public/images/intro');

if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

let copied = 0;
let errors = 0;

if (fs.existsSync(SRC_DIR)) {
  const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
  for (const file of files) {
    const srcPath = path.join(SRC_DIR, file);
    const content = fs.readFileSync(srcPath);
    const hash = crypto.createHash('sha256').update(content).digest('hex').toUpperCase();

    if (ALLOW_LIST[hash] === file) {
      const destPath = path.join(DEST_DIR, file);
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied verified asset: ${file} (SHA256: ${hash})`);
      copied++;
    } else {
      console.error(`ERROR: Asset ${file} failed SHA-256 validation or is not in allowlist. Hash: ${hash}`);
      errors++;
    }
  }
} else {
  console.log("Source directory dev/images/public/images/intro not found.");
}

console.log(`Copy complete. Copied: ${copied}, Errors: ${errors}`);
if (errors > 0) process.exit(1);
process.exit(0);
