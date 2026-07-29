const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const VPS_CHORUS = {
  name: 'chorus.vn VPS (160.187.147.125)',
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  remoteDir: '/home/chorus/htdocs/chorus.vn',
  pm2Name: 'chorusvn'
};

async function main() {
  console.log(`\n========================================`);
  console.log(`🚀 CẬP NHẬT BẬT HIỂN THỊ "VỀ TÔI" (about) VÀ "TIỂU SỬ" (bio) CHO acxuantai.chorus.vn`);
  console.log(`========================================`);

  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect({
      host: VPS_CHORUS.host,
      port: VPS_CHORUS.port,
      username: VPS_CHORUS.username,
      password: VPS_CHORUS.password,
      readyTimeout: 30000
    });
  });
  console.log(`✅ Kết nối SSH thành công tới ${VPS_CHORUS.host}`);

  const execCmd = (cmd) => new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '', errOut = '';
      stream.on('close', (code) => {
        if (code === 0) resolve(out);
        else reject(new Error(`Command "${cmd}" exited with code ${code}.\nSTDERR: ${errOut}\nSTDOUT: ${out}`));
      }).on('data', d => { out += d.toString(); }).stderr.on('data', d => { errOut += d.toString(); });
    });
  });

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => err ? reject(err) : resolve(sftp));
  });

  const inlineScript = `
const fs = require('fs');

async function updateFirestoreAndLocal() {
  const localDataPath = '/home/chorus/htdocs/chorus.vn/data_acxuantai.json';
  let localData = {};
  if (fs.existsSync(localDataPath)) {
    localData = JSON.parse(fs.readFileSync(localDataPath, 'utf8'));
  }

  const { initializeApp } = require('firebase/app');
  const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

  const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyD-placeholder",
    authDomain: "taimusic-96289.firebaseapp.com",
    projectId: "taimusic-96289",
    storageBucket: "taimusic-96289.firebasestorage.app",
    messagingSenderId: "364506307137",
    appId: "1:364506307137:web:fb84cfb776269151e60057"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const docRef = doc(db, 'artists', 'artist_acxuantai');
  const snap = await getDoc(docRef);
  let data = snap.exists() ? snap.data() : {};

  // Nạp dữ liệu aboutMe và biography từ localData
  if (localData.aboutMe) data.aboutMe = localData.aboutMe;
  if (localData.biography) data.biography = localData.biography;

  // Đảm bảo menuItems có "about" và "bio"
  data.menuItems = [
    { id: 'm1', type: 'home', title: 'Trang Chủ', isVisible: true },
    { id: 'm2', type: 'about', title: 'Về Tôi', isVisible: true },
    { id: 'm3', type: 'bio', title: 'Tiểu Sử', isVisible: true },
    { id: 'm4', type: 'demos', title: 'Danh Sách Bài Hát', isVisible: true }
  ];

  // Đảm bảo layoutSections chứa "about" và "bio"
  const currentSections = data.layoutSections || ['title', 'random_song', 'vault', 'mv', 'spotify'];
  const newSections = [];
  ['title', 'random_song', 'about', 'bio', 'vault', 'mv', 'spotify'].forEach(sec => {
    if (!newSections.includes(sec)) newSections.push(sec);
  });
  data.layoutSections = newSections;

  await setDoc(docRef, data, { merge: true });

  // Cập nhật lại file JSON cục bộ trên VPS
  fs.writeFileSync(localDataPath, JSON.stringify(data, null, 2), 'utf8');

  console.log("SUCCESS_LAYOUT_AND_FIRESTORE_UPDATED");
}

updateFirestoreAndLocal().then(() => process.exit(0)).catch(err => {
  console.error("UPDATE_ERROR:", err);
  process.exit(1);
});
`;

  const remoteScriptPath = `${VPS_CHORUS.remoteDir}/temp_update_acxuantai.cjs`;
  await new Promise((resolve, reject) => {
    const stream = sftp.createWriteStream(remoteScriptPath);
    stream.on('close', resolve);
    stream.on('error', reject);
    stream.write(inlineScript);
    stream.end();
  });

  console.log(`\n🔄 Đang chạy cập nhật layout & Firestore trên VPS...`);
  try {
    const res = await execCmd(`/root/.nvm/versions/node/v20.20.2/bin/node ${remoteScriptPath}`);
    console.log(`  Output VPS:`, res);
  } catch (err) {
    console.error(`  Lỗi chạy script:`, err.message);
  }

  await execCmd(`rm -f ${remoteScriptPath}`);

  console.log(`\n🔄 Restart PM2 [${VPS_CHORUS.pm2Name}]...`);
  await execCmd(`pm2 restart ${VPS_CHORUS.pm2Name}`);

  conn.end();
  console.log(`\n========================================`);
  console.log(`🎉 HOÀN THÀNH CẬP NHẬT "VỀ TÔI" VÀ "TIỂU SỬ" CHO acxuantai.chorus.vn!`);
  console.log(`========================================`);
}

main().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
