const fs = require('fs');

const originalConfig = JSON.parse(fs.readFileSync('original_admin_config.json', 'utf-8'));
const acxuantaiData = JSON.parse(fs.readFileSync('data_acxuantai.json', 'utf-8'));

acxuantaiData.biography = {
  education: originalConfig.education.map(e => ({
    time: e.year || e.time || "",
    title: e.title || "",
    description: e.desc || e.description || ""
  })),
  experience: originalConfig.experience.map(e => ({
    time: e.year || e.time || "",
    title: e.title || "",
    description: e.desc || e.description || ""
  }))
};

if (originalConfig.aboutMe) {
  acxuantaiData.aboutMe = {
    ...acxuantaiData.aboutMe,
    ...originalConfig.aboutMe
  };
}

fs.writeFileSync('data_acxuantai.json', JSON.stringify(acxuantaiData, null, 2));
console.log('✅ Successfully merged exact original biography data into data_acxuantai.json!');
