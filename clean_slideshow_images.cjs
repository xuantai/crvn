const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

function cleanSlideshows() {
  console.log('🧹 Cleaning slideshowImages arrays across all data_*.json files...');
  const files = fs.readdirSync(ROOT);

  let cleaned = 0;
  for (const file of files) {
    if (file.startsWith('data_') && file.endsWith('.json')) {
      const filePath = path.join(ROOT, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(content);

        if (Array.isArray(json.slideshowImages)) {
          // Filter out empty or whitespace-only strings
          let validImages = json.slideshowImages.filter(s => typeof s === 'string' && s.trim().length > 0);

          // If no valid slideshow images exist, fallback to homeCoverUrl if available
          if (validImages.length === 0 && json.homeCoverUrl && typeof json.homeCoverUrl === 'string' && json.homeCoverUrl.trim().length > 0) {
            validImages = [json.homeCoverUrl.trim()];
          }

          json.slideshowImages = validImages;
          fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8');
          cleaned++;
          console.log(`  ✅ Cleaned ${file}: ${json.slideshowImages.length} valid slideshow image(s).`);
        }
      } catch (err) {
        console.error(`  ❌ Error processing ${file}:`, err.message);
      }
    }
  }
  console.log(`\n🎉 Slideshow cleanup completed for ${cleaned} files!`);
}

cleanSlideshows();
