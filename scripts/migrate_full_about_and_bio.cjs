const fs = require('fs');

const originalConfig = JSON.parse(fs.readFileSync('original_admin_config.json', 'utf-8'));
const acxuantaiData = JSON.parse(fs.readFileSync('data_acxuantai.json', 'utf-8'));

// Restore biography text without fake image URLs
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

// Migrate full aboutMe data from acxuantai.com admin_config.json
acxuantaiData.aboutMe = {
  ...acxuantaiData.aboutMe,
  artistName: originalConfig.artistName || "A.C Xuân Tài",
  bio1: originalConfig.bio1 || "Singer-songwriter, Music Producer",
  bio2: originalConfig.bio2 || "Founder & CEO of XT Production",
  roles: originalConfig.roles || [
    "Ca nhạc sĩ",
    "Music Producer",
    "MV/ Film/ TVC Producer",
    "Content Creator",
    "KOL"
  ],
  services: originalConfig.services || [],
  portfolio: originalConfig.portfolio || [],
  contacts: originalConfig.contacts || {
    email: "hi@acxuantai.com",
    phone: "085.6600666"
  },
  socials: originalConfig.socials || {
    facebook: "nxuantai",
    tiktok: "@acxuantai",
    youtube: "@acxuantai"
  },
  coverImageUrl: originalConfig.coverImageUrl || "https://acxuantai.com/img/about-img4.png"
};

fs.writeFileSync('data_acxuantai.json', JSON.stringify(acxuantaiData, null, 2));
console.log('✅ Successfully migrated full aboutMe & biography from acxuantai.com into data_acxuantai.json!');
