const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyD-mock",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "taimusic-96289.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "taimusic-96289",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "taimusic-96289.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123",
  appId: process.env.FIREBASE_APP_ID || "1:123:web:123"
};

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

const r2AccountId = process.env.CF_R2_ACCOUNT_ID || 'ed5771d045bec5ae12373a1dc5bb6985';
const r2AccessKeyId = process.env.CF_R2_ACCESS_KEY_ID || '8ae592287e83828ec9c5b5aa468500e6';
const r2SecretAccessKey = process.env.CF_R2_SECRET_ACCESS_KEY || 'd964617b9dd773a720b026987823fa43c6d358dd29d44bf36aeb7ef3c8cb9c59';
const r2BucketName = process.env.CF_R2_BUCKET_NAME || 'bbb-bz';
const r2PublicDomain = (process.env.CF_R2_PUBLIC_DOMAIN || 'https://cdn.bbb.bz').replace(/\/$/, '');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey
  }
});

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`Status ${res.statusCode}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function uploadToR2(buffer, key, contentType) {
  const command = new PutObjectCommand({
    Bucket: r2BucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType
  });
  await s3Client.send(command);
  return `${r2PublicDomain}/${key}`;
}

async function run() {
  console.log("🔥 Fetching cheng from Firestore...");
  const chengRef = doc(firestore, 'artists', 'artist_cheng');
  const docSnap = await getDoc(chengRef);
  if (!docSnap.exists()) {
    console.log("Doc cheng not found");
    return;
  }
  const data = docSnap.data();
  console.log("Current Demos count:", data.demos?.length);

  for (const demo of (data.demos || [])) {
    if (demo.slug === 'dung-dang-dung-de') {
      console.log("FOUND DUNG-DANG-DUNG-DE!");
      console.log("  OLD audioUrl:", demo.audioUrl);
      console.log("  OLD coverUrl:", demo.coverUrl);

      // 1. Sync Audio
      if (demo.audioUrl && (demo.audioUrl.startsWith('/uploads/') || demo.audioUrl.startsWith('uploads/'))) {
        const relPath = demo.audioUrl.startsWith('/') ? demo.audioUrl.substring(1) : demo.audioUrl;
        const localPath = path.join(process.cwd(), 'public', relPath);
        if (fs.existsSync(localPath)) {
          const buf = fs.readFileSync(localPath);
          const r2Url = await uploadToR2(buf, relPath, 'audio/mpeg');
          demo.audioUrl = r2Url;
          demo.backupAudioUrl = r2Url;
          console.log("  NEW audioUrl:", r2Url);
        }
      }

      // 2. Sync Cover
      if (demo.coverUrl && demo.coverUrl.includes('firebasestorage')) {
        console.log("  Downloading cover from Firebase...");
        const buf = await downloadBuffer(demo.coverUrl);
        const filename = `synced_${Date.now()}_cover.png`;
        const key = `uploads/cheng/${filename}`;
        
        // Save local copy on VPS SSD
        const localDir = path.join(process.cwd(), 'public', 'uploads', 'cheng');
        fs.mkdirSync(localDir, { recursive: true });
        fs.writeFileSync(path.join(localDir, filename), buf);

        const r2Url = await uploadToR2(buf, key, 'image/png');
        demo.coverUrl = r2Url;
        console.log("  NEW coverUrl:", r2Url);
      }
    }
  }

  await setDoc(chengRef, data);
  console.log("✅ SUCCESSFULLY SAVED CHENG DATA TO FIRESTORE!");

  // Also update data_cheng.json
  fs.writeFileSync(path.join(process.cwd(), 'data_cheng.json'), JSON.stringify(data, null, 2), 'utf-8');
  console.log("✅ SUCCESSFULLY SAVED DATA_CHENG.JSON TO LOCAL DISK!");
}

run().catch(e => console.error("Error:", e));
