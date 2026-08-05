const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data_acxuantai.json');
const content = fs.readFileSync(filePath, 'utf-8');
const json = JSON.parse(content);

console.log('Restoring youtubePlaylistUrl in data_acxuantai.json...');
json.youtubePlaylistUrl = "https://www.youtube.com/watch?v=wuWB3Q2gTVs&list=PLYhxSEggsw6pQynJA2XvQQ4tUG2z7zBNS";

// Also fix any demo videoUrl that was replaced with /uploads/.../watch
if (Array.isArray(json.demos)) {
  json.demos.forEach(demo => {
    if (demo.videoUrl === '/uploads/sw69l6795go/watch') {
      demo.videoUrl = 'https://www.youtube.com/watch?v=Dr8JBA6Nb-4';
    }
  });
}

fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8');
console.log('✅ Successfully restored youtubePlaylistUrl to: https://www.youtube.com/watch?v=wuWB3Q2gTVs&list=PLYhxSEggsw6pQynJA2XvQQ4tUG2z7zBNS');
