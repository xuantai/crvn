const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.includes('node_modules') || file.includes('.git')) continue;
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        searchDir(fullPath);
      } else if (file.endsWith('.json') || file.endsWith('.txt') || file.endsWith('.cjs') || file.endsWith('.js') || file.endsWith('.bak')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (content.includes('aboutMe') || content.includes('biography') || content.includes('Giới thiệu')) {
            console.log(`Found match in: ${fullPath}`);
            const matches = content.match(/"(aboutMe|biography|intro|realName|dob|address|company|role|phone|education|experience)":\s*({[^}]+}|\[[^\]]+\]|"[^"]+")/g);
            if (matches) {
              console.log('Matches:', matches.slice(0, 10));
            }
          }
        } catch (e) {}
      }
    }
  } catch (e) {}
}

console.log('=== Searching workspace for profile/aboutMe/biography data ===');
searchDir(process.cwd());
