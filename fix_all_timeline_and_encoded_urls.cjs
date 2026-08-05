const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

function cleanUrlString(str) {
  if (typeof str !== 'string') return str;
  if (!str.includes('uploads')) return str;

  let cleaned = str;

  // Replace URL-encoded %2f with /
  cleaned = cleaned.replace(/uploads%2f/gi, 'uploads/');
  cleaned = cleaned.replace(/%2f/gi, '/');

  // Fix double nested uploads/username/uploads/username/filename
  // e.g. https://cdn.chorus.vn/uploads/sw69l6795go/uploads/sw69l6795go/file.jpg -> /uploads/sw69l6795go/file.jpg
  cleaned = cleaned.replace(/https?:\/\/[^\/]+\/uploads\//gi, '/uploads/');
  
  // Remove duplicate consecutive uploads/ paths
  while (cleaned.match(/\/uploads\/[^\/]+\/uploads\//)) {
    cleaned = cleaned.replace(/\/uploads\/[^\/]+\/uploads\//g, '/uploads/');
  }

  // Ensure relative path starting with /uploads/
  const uploadsIdx = cleaned.indexOf('uploads/');
  if (uploadsIdx !== -1) {
    cleaned = '/' + cleaned.substring(uploadsIdx);
  }

  return cleaned;
}

function deepCleanObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => typeof item === 'string' ? cleanUrlString(item) : deepCleanObject(item));
  }

  const cleanedObj = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') {
      cleanedObj[key] = cleanUrlString(val);
    } else if (typeof val === 'object' && val !== null) {
      cleanedObj[key] = deepCleanObject(val);
    } else {
      cleanedObj[key] = val;
    }
  }
  return cleanedObj;
}

function main() {
  console.log('🧹 Cleaning double-encoded and corrupted image URLs in all data_*.json files...');
  const files = fs.readdirSync(ROOT);

  let cleanedCount = 0;
  for (const file of files) {
    if (file.startsWith('data_') && file.endsWith('.json')) {
      const filePath = path.join(ROOT, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(content);
        const cleanedJson = deepCleanObject(json);

        fs.writeFileSync(filePath, JSON.stringify(cleanedJson, null, 2), 'utf-8');
        cleanedCount++;
        console.log(`  ✅ Cleaned: ${file}`);
      } catch (err) {
        console.error(`  ❌ Error processing ${file}:`, err.message);
      }
    }
  }
  console.log(`\n🎉 Successfully cleaned ${cleanedCount} JSON data files!`);
}

main();
