const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SRC_DIR = path.join(__dirname, '../public/images/islands');
const DEST_DIR = path.join(__dirname, '../dev/generated-assets/wave-03/islands/transparent-background-repair/candidates');

if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

// Typical checkerboard colors might be around white (255) and grey (204 or 192 or 220)
// We will sample the corners to find the exact colors used for the checkerboard.
async function processImage(filename) {
  const srcPath = path.join(SRC_DIR, filename);
  const destPath = path.join(DEST_DIR, filename);
  
  const image = await Jimp.read(srcPath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  
  // Sample corners to find background colors
  const corners = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
    [10, 10], [width - 11, 10], [10, height - 11]
  ];
  
  const bgColors = [];
  for (let [cx, cy] of corners) {
    const idx = (width * cy + cx) << 2;
    const r = image.bitmap.data[idx + 0];
    const g = image.bitmap.data[idx + 1];
    const b = image.bitmap.data[idx + 2];
    
    // We expect grey/white
    if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && r > 180) {
      bgColors.push({ r, g, b });
    }
  }
  
  // Check if a pixel is background
  function isBackground(x, y) {
    const idx = (width * y + x) << 2;
    const r = image.bitmap.data[idx + 0];
    const g = image.bitmap.data[idx + 1];
    const b = image.bitmap.data[idx + 2];
    const a = image.bitmap.data[idx + 3];
    
    if (a < 10) return true; // Already transparent
    
    for (let c of bgColors) {
      if (colorDistance(r, g, b, c.r, c.g, c.b) < 18) {
        return true;
      }
    }
    return false;
  }
  
  // BFS flood fill from edges
  const queue = [];
  const visited = new Uint8Array(width * height);
  
  function push(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const i = y * width + x;
    if (!visited[i]) {
      visited[i] = 1;
      if (isBackground(x, y)) {
        queue.push({ x, y });
        // Set transparent
        const idx = i << 2;
        image.bitmap.data[idx + 0] = 0;
        image.bitmap.data[idx + 1] = 0;
        image.bitmap.data[idx + 2] = 0;
        image.bitmap.data[idx + 3] = 0;
      }
    }
  }
  
  // Add all edges
  for (let x = 0; x < width; x++) { push(x, 0); push(x, height - 1); }
  for (let y = 0; y < height; y++) { push(0, y); push(width - 1, y); }
  
  let head = 0;
  while (head < queue.length) {
    const { x, y } = queue[head++];
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
  
  // Clean up remaining checkerboard artifacts using an erosion/dilation approach or a simpler neighbor check
  // But since checkerboards can be completely disconnected due to antialiasing, 
  // Let's do a second pass: any pixel that matches bgColors and is adjacent to transparent gets removed
  let changed = true;
  let passes = 0;
  while (changed && passes < 10) {
    changed = false;
    passes++;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = y * width + x;
        if (!visited[i] && isBackground(x, y)) {
          // check if adjacent to visited (transparent)
          if (visited[i - 1] || visited[i + 1] || visited[i - width] || visited[i + width]) {
            visited[i] = 1;
            const idx = i << 2;
            image.bitmap.data[idx + 3] = 0;
            changed = true;
          }
        }
      }
    }
  }
  
  await image.writeAsync(destPath);
  console.log('Processed', filename);
  
  // Calc SHA-256
  const fileBuffer = fs.readFileSync(destPath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return {
    filename,
    dimensions: `${width}x${height}`,
    sizeBytes: fileBuffer.length,
    sha256: hashSum.digest('hex')
  };
}

async function run() {
  const islands = ['island_grandpa.png', 'island_family.png', 'island_nature.png', 'island_school.png'];
  const results = [];
  for (let f of islands) {
    const result = await processImage(f);
    results.push(result);
  }
  fs.writeFileSync(path.join(__dirname, '../dev/evidence/WAVE-03-dashboard-quality/island-transparent-asset-manifest.json'), JSON.stringify({ assets: results }, null, 2));
}

run().catch(console.error);
