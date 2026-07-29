const { execSync } = require('child_process');

function checkGitLogForFile(filename) {
  console.log(`=== GIT REVISION HISTORY FOR ${filename} ===`);
  try {
    const commits = execSync(`git log --oneline -- ${filename}`).toString().trim().split('\n');
    console.log(`Found ${commits.length} commits for ${filename}`);
    for (const commitLine of commits.slice(0, 15)) {
      const commitHash = commitLine.split(' ')[0];
      try {
        const content = execSync(`git show ${commitHash}:${filename}`).toString();
        const parsed = JSON.parse(content);
        const item = Array.isArray(parsed) ? parsed.find(x => x.username === 'acxuantai') : parsed;
        if (item) {
          console.log(`\n📌 Commit [${commitHash}] - ${commitLine}:`);
          console.log('   aboutMe:', JSON.stringify(item.aboutMe, null, 2));
          console.log('   biography:', JSON.stringify(item.biography, null, 2));
        }
      } catch (e) {}
    }
  } catch (e) {
    console.log(`Error checking git log for ${filename}:`, e.message);
  }
}

checkGitLogForFile('data_acxuantai.json');
checkGitLogForFile('data.json');
checkGitLogForFile('artists.json');
