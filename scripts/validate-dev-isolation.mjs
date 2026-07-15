import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DEV_DIR = path.join(ROOT_DIR, 'dev');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

let errors = [];

function checkFileForDevImport(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('from \'../dev') || content.includes('from "../dev') || content.includes('from \'dev') || content.includes('from "dev')) {
    // Exclude false positives or test them carefully
    if (content.includes('dev/audio-workspace')) {
       errors.push(`File ${filePath} contains illegal reference to dev/audio-workspace.`);
    }
    if (content.includes('/dev/')) {
       errors.push(`File ${filePath} contains illegal reference to dev folder.`);
    }
  }
}

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

// 1. Check src imports from dev
walkDir(SRC_DIR, (filePath) => {
  if (filePath.endsWith('.js') || filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    checkFileForDevImport(filePath);
  }
});

// 2. Check next.config.mjs
const nextConfigPath = path.join(ROOT_DIR, 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
  if (nextConfigContent.includes('dev/')) {
    errors.push('next.config.mjs includes reference to dev folder.');
  }
}

// 3. Check tsconfig.json
const tsconfigPath = path.join(ROOT_DIR, 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
  if (tsconfigContent.includes('"dev/') || tsconfigContent.includes('"dev"')) {
    errors.push('tsconfig.json includes reference to dev folder.');
  }
}

// 4. Check public folder for dev files
walkDir(PUBLIC_DIR, (filePath) => {
  if (filePath.endsWith('.md') || filePath.includes('PROJECT-PLAN') || filePath.includes('archive')) {
    errors.push(`Public directory contains planning/archive file: ${filePath}`);
  }
});

if (errors.length > 0) {
  console.error("DEV ISOLATION VALIDATION FAILED:");
  errors.forEach(e => console.error(e));
  process.exit(1);
} else {
  console.log("Dev isolation validation passed.");
  process.exit(0);
}
