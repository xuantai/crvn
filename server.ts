import express from 'express';
import fsSync from 'fs';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import multer from 'multer';
import sharp from 'sharp';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

let multiConfig: any = {};
try {
  const fileData = fsSync.readFileSync(path.join(process.cwd(), 'firebase-multi-configs.json'), 'utf-8');
  multiConfig = JSON.parse(fileData);
} catch (e) {
  let appletConfig: any = null;
  try {
    const appletData = fsSync.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8');
    appletConfig = JSON.parse(appletData);
  } catch (err) {}

  if (appletConfig) {
    multiConfig = {
      activeId: 'default',
      configs: [{
        id: 'default',
        name: `Được cấp phát (${appletConfig.projectId})`,
        config: appletConfig
      }]
    };
  } else {
    multiConfig = {
      activeId: 'default',
      configs: [{
        id: 'default',
        name: 'Mặc định (taimusic-96289)',
        config: {
          apiKey: "AIzaSyAcml_QfgGTH80OKmRVj2tWIomEQUUiHB0",
          authDomain: "taimusic-96289.firebaseapp.com",
          projectId: "taimusic-96289",
          storageBucket: "taimusic-96289.firebasestorage.app",
          messagingSenderId: "848155741386",
          appId: "1:848155741386:web:4f5b5d826ce5fbbba8f833",
          measurementId: "G-D4ZSK50GZ2",
          firestoreDatabaseId: "default"
        }
      }]
    };
  }
}

let activeConfig = multiConfig.configs.find((c: any) => c.id === multiConfig.activeId) || multiConfig.configs[0];
let firebaseConfig = activeConfig.config;

let firebaseApp = initializeApp(firebaseConfig);
let db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || '(default)');
let firebaseStorage = getStorage(firebaseApp);
let DOC_REF = doc(db, 'app_data', 'main');
let isFirestoreDisabled = firebaseConfig.projectId === 'remixed-project-id';

function handleFirebaseError(error: any) {
  if (!error) return;
  const errMsg = String(error.message || error).toLowerCase();
  if (
    errMsg.includes('permission') || 
    errMsg.includes('insufficient') || 
    errMsg.includes('disabled') || 
    errMsg.includes('code: 7') || 
    errMsg.includes('denied') || 
    errMsg.includes('auth') ||
    errMsg.includes('cancelled')
  ) {
    if (!isFirestoreDisabled) {
      isFirestoreDisabled = true;
      console.warn("⚠️ Cloud Firestore has insufficient permissions or is unconfigured. Falling back entirely to Local JSON file storage (artists.json & data_<artist>.json).");
    }
  }
}

import { AsyncLocalStorage } from 'async_hooks';
const artistStorage = new AsyncLocalStorage<string>();

const ARTISTS_FILE = path.join(process.cwd(), 'artists.json');
let artists: any[] = [];

async function loadArtists() {
  if (!isFirestoreDisabled && landingConfig.cloudSyncEnabled !== false) {
    try {
      const masterDoc = doc(db, 'app_data', 'master');
      const snap = await getDoc(masterDoc);
      if (snap.exists() && snap.data().artists) {
        artists = snap.data().artists;
        let changed = false;
        artists.forEach(artist => {
          if (!artist.id) {
            artist.id = Math.random().toString(36).substring(2, 15);
            changed = true;
          }
        });
        await fs.writeFile(ARTISTS_FILE, JSON.stringify(artists, null, 2), 'utf-8');
        if (changed) await setDoc(masterDoc, { artists });
        return artists;
      }
    } catch (e) {
      console.error("Firebase error loading artists:", e);
    }
  }

  // Fallback to local
  try {
    if (fsSync.existsSync(ARTISTS_FILE)) {
      const content = await fs.readFile(ARTISTS_FILE, 'utf-8');
      artists = JSON.parse(content);
      let changed = false;
      artists.forEach(artist => {
        if (!artist.id) {
          artist.id = Math.random().toString(36).substring(2, 15);
          changed = true;
        }
      });
      if (changed) {
        await fs.writeFile(ARTISTS_FILE, JSON.stringify(artists, null, 2), 'utf-8');
      }
    } else {
      artists = [
        {
          id: Math.random().toString(36).substring(2, 15),
          artistName: "A.C Xuân Tài",
          username: "acxuantai",
          extension: "acxuantai",
          password: "XuanTaiDepTrai",
          verified: true,
          dbConfig: ""
        }
      ];
      await fs.writeFile(ARTISTS_FILE, JSON.stringify(artists, null, 2), 'utf-8');
    }
  } catch (e) {
    console.error("Error loading artists local:", e);
    artists = [
      {
        id: Math.random().toString(36).substring(2, 15),
        artistName: "A.C Xuân Tài",
        username: "acxuantai",
        extension: "acxuantai",
        password: "XuanTaiDepTrai",
        verified: true,
        dbConfig: ""
      }
    ];
  }
  
  if (!isFirestoreDisabled && landingConfig.cloudSyncEnabled !== false) {
    try {
      const masterDoc = doc(db, 'app_data', 'master');
      await setDoc(masterDoc, { artists }, { merge: true });
    } catch (e) {}
  }
  return artists;
}

async function saveArtists(list: any[]) {
  artists = list;
  try {
    const cleanedArtists = JSON.parse(JSON.stringify(artists));
    await fs.writeFile(ARTISTS_FILE, JSON.stringify(cleanedArtists, null, 2), 'utf-8');
    if (!isFirestoreDisabled && landingConfig.cloudSyncEnabled !== false) {
      const masterDoc = doc(db, 'app_data', 'master');
      await setDoc(masterDoc, { artists: cleanedArtists });
    }
  } catch (e) {
    console.error("Error saving artists:", e);
    handleFirebaseError(e);
  }
}

const LANDING_FILE = path.join(process.cwd(), 'landing_config.json');
let landingConfig = {
  tagline: "✧ SẮP RA MẮT",
  heroSubtitle: "Nơi những ca khúc khởi đầu.",
  heroDescription: "Chúng tôi đang xây dựng một không gian trực tuyến, nơi các nhạc sĩ, ca sĩ, nhà sản xuất âm nhạc, quản lý nghệ sĩ, thương hiệu... có thể chia sẻ các ca khúc đã phát hành và demo chưa ra mắt của mình.",
  footerText: "CHORUS.VN © 2026 - Nơi những ca khúc bắt đầu.",
  feature1Title: "Bảo mật demo & tuyển tập",
  feature1Desc: "Thiết lập mật mã cho từng tác phẩm chưa công bố, ngăn chặn nghe trộm hoặc chia sẻ trái phép. Gửi link demo bảo mật cho ca sĩ, nhạc sĩ phối khí và các đối tác đáng tin cậy.",
  feature2Title: "Dịch thuật thông minh (AI Translation)",
  feature2Desc: "Nhận diện vị trí địa lý của khán giả quốc tế để hiển thị tiêu đề và nội dung mô tả sản phẩm bằng ngôn ngữ bản địa phù hợp nhất (Anh, Nhật, Trung, Hàn...).",
  feature3Title: "Đồng bộ Cloud & Cache cục bộ",
  feature3Desc: "Lưu trữ dữ liệu kép trên Cloud Firestore chất lượng cao kết hợp cơ chế dự phòng cục bộ. Cam kết phát nhạc ổn định, tốc độ load nhanh ngay cả khi internet quốc tế gặp sự cố.",
  feature4Title: "Bố cục mang đậm dấu ấn cá nhân",
  feature4Desc: "Tùy chỉnh ảnh bìa đại diện, màu sắc chủ đạo, ảnh đại diện, viết bio, cập nhật danh sách mạng xã hội. Trang cá nhân hoạt động độc lập như một website thu nhỏ của riêng bạn.",
  cloudSyncEnabled: true,
  systemIp: "103.1.2.3"
};

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'subscribers.json');

async function addSubscriber(email: string) {
  let list: string[] = [];
  try {
    if (fsSync.existsSync(SUBSCRIBERS_FILE)) {
      const content = await fs.readFile(SUBSCRIBERS_FILE, 'utf-8');
      list = JSON.parse(content);
    }
  } catch (e) {}

  if (!list.includes(email)) {
    list.push(email);
    try {
      await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (e) {}
  }

  if (!isFirestoreDisabled && landingConfig.cloudSyncEnabled !== false) {
    try {
      const key = Buffer.from(email).toString('base64url');
      const subDoc = doc(db, 'subscribers', key);
      await setDoc(subDoc, { email, subscribedAt: new Date().toISOString() });
    } catch (e) {
      handleFirebaseError(e);
    }
  }
}

async function loadLandingConfig() {
  try {
    if (fsSync.existsSync(LANDING_FILE)) {
      const content = await fs.readFile(LANDING_FILE, 'utf-8');
      landingConfig = { ...landingConfig, ...JSON.parse(content) };
    } else {
      await fs.writeFile(LANDING_FILE, JSON.stringify(landingConfig, null, 2), 'utf-8');
    }
  } catch (e) {
    console.error("Error loading landing config local:", e);
  }
  
  if (!isFirestoreDisabled && landingConfig.cloudSyncEnabled !== false) {
    try {
      const landingDoc = doc(db, 'app_data', 'landing');
      const snap = await getDoc(landingDoc);
      if (snap.exists()) {
        landingConfig = { ...landingConfig, ...snap.data() };
      } else {
        await setDoc(landingDoc, landingConfig);
      }
    } catch (e) {
      handleFirebaseError(e);
    }
  }
  return landingConfig;
}

async function saveLandingConfig(cfg: any) {
  landingConfig = { ...landingConfig, ...cfg };
  try {
    await fs.writeFile(LANDING_FILE, JSON.stringify(landingConfig, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error saving landing config local:", e);
  }
  
  if (!isFirestoreDisabled && landingConfig.cloudSyncEnabled !== false) {
    try {
      const landingDoc = doc(db, 'app_data', 'landing');
      await setDoc(landingDoc, landingConfig);
    } catch (e) {
      handleFirebaseError(e);
    }
  }
}

const firebaseAppCache = new Map<string, any>();

function getFirestoreRefForArtist(artist: any) {
  if (isFirestoreDisabled || landingConfig.cloudSyncEnabled === false) {
    return null;
  }

  if (artist && artist.dbConfig) {
    try {
      const config = typeof artist.dbConfig === 'string' ? JSON.parse(artist.dbConfig) : artist.dbConfig;
      if (config && config.projectId && config.apiKey) {
        if (!firebaseAppCache.has(artist.username)) {
          const appName = `app-${artist.username}-${Date.now()}`;
          const app = initializeApp(config, appName);
          const customDb = getFirestore(app, config.firestoreDatabaseId || '(default)');
          const docRef = doc(customDb, 'app_data', 'main');
          firebaseAppCache.set(artist.username, { app, db: customDb, docRef });
        }
        return firebaseAppCache.get(artist.username).docRef;
      }
    } catch (e) {
      console.error(`Error initializing custom DB for artist ${artist.username}:`, e);
    }
  }

  // Default system firestore path
  const username = artist?.username || 'acxuantai';
  return doc(db, 'app_data', `artist_${username}`);
}

const DATA_FILE = path.join(process.cwd(), 'data.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

async function ensureUploadsDir() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

async function uploadLocalToCloud(localPath: string, filename: string, mimetype: string, artistId: string = 'common'): Promise<string> {
  // If it's a music file, do NOT upload to Firebase Storage, return the local server URL
  if (mimetype.startsWith('audio/') || filename.endsWith('.mp3') || filename.endsWith('.wav')) {
    return `/uploads/${artistId}/${filename}`;
  }

  // If it's an image file, compress to JPG and upload to Firebase Storage
  if (mimetype.startsWith('image/')) {
    try {
      const baseName = filename.includes('.') ? filename.substring(0, filename.lastIndexOf('.')) : filename;
      const optimizedFilename = `${baseName}-${Date.now()}.jpg`;
      const optimizedDir = path.join(UPLOADS_DIR, artistId);
      await fs.mkdir(optimizedDir, { recursive: true }).catch(() => {});
      const optimizedPath = path.join(optimizedDir, optimizedFilename);

      await sharp(localPath)
        .jpeg({ quality: 80, progressive: true })
        .resize({ width: 1600, withoutEnlargement: true })
        .toFile(optimizedPath);

      // Now we have the optimized image locally. Try to upload it to Firebase.
      if (isFirestoreDisabled) {
        await fs.unlink(localPath).catch(() => {});
        return `/uploads/${artistId}/${optimizedFilename}`;
      }
      try {
        const fileBuffer = await fs.readFile(optimizedPath);
        const storageRef = ref(firebaseStorage, `uploads/${artistId}/${optimizedFilename}`);
        await uploadBytes(storageRef, fileBuffer, { contentType: 'image/jpeg' });
        const cloudUrl = await getDownloadURL(storageRef);

        // Success! Clean up both local files.
        await fs.unlink(localPath).catch(() => {});
        await fs.unlink(optimizedPath).catch(() => {});
        return cloudUrl;
      } catch (uploadErr: any) {
        console.log("[Firebase Storage] Upload skipped or failed. Keeping optimized image locally.");
        // Clean up raw original, keep the optimized local file
        await fs.unlink(localPath).catch(() => {});
        return `/uploads/${artistId}/${optimizedFilename}`;
      }
    } catch (error) {
      console.error("Lỗi nén/upload image in uploadLocalToCloud:", error);
      // Fallback: if sharp failed completely, keep original raw image and return its local URL
      return `/uploads/${artistId}/${filename}`;
    }
  }

  // Non-image, non-audio files (fallback)
  try {
    const fileBuffer = await fs.readFile(localPath);
    const storageRef = ref(firebaseStorage, `uploads/${artistId}/${filename}`);
    await uploadBytes(storageRef, fileBuffer, { contentType: mimetype });
    const cloudUrl = await getDownloadURL(storageRef);
    await fs.unlink(localPath).catch(() => {});
    return cloudUrl;
  } catch (error) {
    return `/uploads/${artistId}/${filename}`;
  }
}

async function deleteFileByUrl(url: string) {
  if (!url) return;
  // If local file path: /uploads/xxx or uploads/xxx
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const relativePath = url.startsWith('/') ? url.substring(1) : url;
    const localFullPath = path.join(process.cwd(), 'public', relativePath);
    try {
      await fs.unlink(localFullPath);
      console.log(`[Revert/Cleanup] Đã xóa file cục bộ thành công: ${localFullPath}`);
    } catch (err: any) {
      console.error(`[Revert/Cleanup] Không thể xóa file cục bộ ${localFullPath}:`, err.message);
    }
  } else if (url.includes(firebaseConfig.storageBucket)) {
    // If Firebase Storage URL, delete from Firebase Storage
    if (isFirestoreDisabled) return;
    try {
      const decodedUrl = decodeURIComponent(url);
      const match = decodedUrl.match(/\/o\/(uploads\/[^?]+)/);
      if (match && match[1]) {
        const fileRef = ref(firebaseStorage, match[1]);
        await deleteObject(fileRef);
        console.log(`[Revert/Cleanup] Đã xóa file trên Firebase Storage thành công: ${match[1]}`);
      }
    } catch (err: any) {
      console.log(`[Revert/Cleanup] Firebase Storage delete skipped or failed:`, err.message);
    }
  }
}

async function uploadUrlOrFileToCloud(urlOrPath: string, globalBaseUrl?: string): Promise<string> {
  if (!urlOrPath) return '';
  
  const isImg = urlOrPath.endsWith('.jpg') || urlOrPath.endsWith('.jpeg') || urlOrPath.endsWith('.png') || urlOrPath.endsWith('.webp');
  const isAud = urlOrPath.endsWith('.mp3') || urlOrPath.endsWith('.wav');
  
  if (isImg && urlOrPath.includes(firebaseConfig.storageBucket)) return urlOrPath;
  if (urlOrPath.startsWith('data:')) return urlOrPath;

  if (isAud && (urlOrPath.startsWith('/uploads/') || urlOrPath.startsWith('uploads/'))) {
    return urlOrPath.startsWith('/') ? urlOrPath : '/' + urlOrPath;
  }

  let fileBuffer: Buffer | null = null;
  let mimetype = 'image/jpeg';
  let filename = '';
  let localSourceFullPath = '';

  // 1. Thử đọc từ tệp tin cục bộ trên server trước
  if (urlOrPath.startsWith('/uploads/') || urlOrPath.startsWith('uploads/')) {
    const relativePath = urlOrPath.startsWith('/') ? urlOrPath.substring(1) : urlOrPath;
    localSourceFullPath = path.join(process.cwd(), 'public', relativePath);
    try {
      fileBuffer = await fs.readFile(localSourceFullPath);
      filename = path.basename(localSourceFullPath);
      
      const ext = path.extname(filename).toLowerCase();
      if (ext === '.mp3') {
        mimetype = 'audio/mpeg';
      } else if (ext === '.wav') {
        mimetype = 'audio/wav';
      } else if (ext === '.webp') {
        mimetype = 'image/webp';
      } else if (ext === '.png') {
        mimetype = 'image/png';
      } else if (ext === '.gif') {
        mimetype = 'image/gif';
      } else {
        mimetype = 'image/jpeg';
      }
    } catch (err) {}
  }

  // 2. Tải về từ HTTP nếu đọc tệp cục bộ thất bại hoặc là liên kết bên ngoài
  if (!fileBuffer) {
    let fullUrl = urlOrPath;
    if (urlOrPath.startsWith('/')) {
      const baseUrl = globalBaseUrl || 'https://xn--ti-jia.com';
      fullUrl = `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${urlOrPath}`;
    } else if (!urlOrPath.startsWith('http')) {
      const baseUrl = globalBaseUrl || 'https://xn--ti-jia.com';
      fullUrl = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}${urlOrPath}`;
    }

    const urlWithoutQuery = fullUrl.split('?')[0];
    const originalFilename = path.basename(urlWithoutQuery);
    const ext = path.extname(urlWithoutQuery).toLowerCase();
    
    if (ext === '.mp3') {
      mimetype = 'audio/mpeg';
      filename = originalFilename.includes('.') ? originalFilename : `sync-${Date.now()}.mp3`;
    } else if (ext === '.wav') {
      mimetype = 'audio/wav';
      filename = originalFilename.includes('.') ? originalFilename : `sync-${Date.now()}.wav`;
    } else if (ext === '.webp') {
      mimetype = 'image/webp';
      filename = originalFilename.includes('.') ? originalFilename : `sync-${Date.now()}.webp`;
    } else if (ext === '.png') {
      mimetype = 'image/png';
      filename = originalFilename.includes('.') ? originalFilename : `sync-${Date.now()}.png`;
    } else if (ext === '.gif') {
      mimetype = 'image/gif';
      filename = originalFilename.includes('.') ? originalFilename : `sync-${Date.now()}.gif`;
    } else {
      mimetype = 'image/jpeg';
      filename = originalFilename.includes('.') ? originalFilename : `sync-${Date.now()}.jpg`;
    }

    try {
      const res = await fetch(fullUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
      });

      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        const contentType = res.headers.get('content-type');
        if (contentType) mimetype = contentType;
      }
    } catch (downloadErr) {}
  }

  if (fileBuffer && filename) {
    const ext = path.extname(filename).toLowerCase();
    const isImage = mimetype.startsWith('image/') && ext !== '.svg' && ext !== '.gif';
    const isAudio = mimetype.startsWith('audio/') || ext === '.mp3' || ext === '.wav';

    if (isAudio) {
      const destLocalPath = path.join(UPLOADS_DIR, filename);
      try {
        await fs.writeFile(destLocalPath, fileBuffer);
      } catch (err) {}
      return `/uploads/${filename}`;
    }

    if (isImage) {
      try {
        const baseFilename = filename.includes('.') ? filename.substring(0, filename.lastIndexOf('.')) : filename;
        const optimizedFilename = `${baseFilename}-${Date.now()}.jpg`;
        const optimizedPath = path.join(UPLOADS_DIR, optimizedFilename);

        const optimizedBuffer = await sharp(fileBuffer)
          .jpeg({ quality: 80, progressive: true })
          .resize({ width: 1600, withoutEnlargement: true })
          .toBuffer();

        if (isFirestoreDisabled) {
          await fs.writeFile(optimizedPath, optimizedBuffer);
          if (localSourceFullPath && localSourceFullPath !== optimizedPath) {
            await fs.unlink(localSourceFullPath).catch(() => {});
          }
          return `/uploads/${optimizedFilename}`;
        }
        try {
          const storageRef = ref(firebaseStorage, `uploads/${optimizedFilename}`);
          await uploadBytes(storageRef, optimizedBuffer, { contentType: 'image/jpeg' });
          const cloudUrl = await getDownloadURL(storageRef);

          if (localSourceFullPath) {
            await fs.unlink(localSourceFullPath).catch(() => {});
          }
          return cloudUrl;
        } catch (storageErr: any) {
          console.log("[Firebase Storage] Upload skipped or failed. Storing image locally instead.");
          await fs.writeFile(optimizedPath, optimizedBuffer);
          if (localSourceFullPath && localSourceFullPath !== optimizedPath) {
            await fs.unlink(localSourceFullPath).catch(() => {});
          }
          return `/uploads/${optimizedFilename}`;
        }
      } catch (sharpErr) {
        console.error(`[Đồng bộ hóa] sharp compression error:`, sharpErr);
      }
    }
  }

  return urlOrPath;
}

// Multer setup
const storage = multer.diskStorage({
  destination: function (req: any, file, cb) {
    const artistId = req.artist?.id || 'common';
    const dest = path.join(UPLOADS_DIR, artistId);
    fsSync.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } 
});

let currentAdminPassword = 'MatKhauDay123';
let currentMemberPassword = 'XuanTaiDepTrai';

async function loadData(explicitUsername?: string) {
  const storeUsername = artistStorage.getStore();
  const currentUsername = explicitUsername || storeUsername || 'acxuantai';
  const artist = artists.find(a => a.username === currentUsername) || artists[0] || { username: 'acxuantai', artistName: 'A.C Xuân Tài' };

  const artistDataFile = path.join(process.cwd(), `data_${currentUsername}.json`);
  const artistDocRef = getFirestoreRefForArtist(artist);

  let currentAdminPasswordLocal = artist.password || 'MatKhauDay123';
  let currentMemberPasswordLocal = artist.memberPassword || '';

  if (artistDocRef && !isFirestoreDisabled) {
    try {
      const docSnap = await getDoc(artistDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        
        if (!data.demos) data.demos = [];
        if (!data.playlists) data.playlists = [];
        
        if (data.adminPassword) {
          currentAdminPasswordLocal = data.adminPassword;
        } else {
          data.adminPassword = currentAdminPasswordLocal;
        }
        if (data.memberPassword !== undefined) {
          currentMemberPasswordLocal = data.memberPassword;
        } else {
          data.memberPassword = currentMemberPasswordLocal;
        }

        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        let changed = false;

        if (data.demos) {
           const lenBefore = data.demos.length;
           let draftChanged = false;
           data.demos = data.demos.filter((d: any) => {
              if (d.deleted && d.deletedAt && (now - d.deletedAt > thirtyDaysMs)) {
                 return false;
              }
              if (d.isDraft === 'false' || d.isDraft === '0') {
                 d.isDraft = false;
                 draftChanged = true;
              } else if (d.isDraft === 'true' || d.isDraft === '1') {
                 d.isDraft = true;
                 draftChanged = true;
              }
              if (!d.secretKey) {
                 d.secretKey = crypto.randomBytes(8).toString('hex');
                 draftChanged = true;
              }
              return true;
           });
           if (data.demos.length !== lenBefore || draftChanged) changed = true;
        }
        if (data.playlists) {
           const lenBefore = data.playlists.length;
           data.playlists = data.playlists.filter((p: any) => {
              if (p.deleted && p.deletedAt && (now - p.deletedAt > thirtyDaysMs)) {
                 return false;
              }
              return true;
           });
           if (data.playlists.length !== lenBefore) changed = true;
        }

        if (changed) {
           await setDoc(artistDocRef, JSON.parse(JSON.stringify(data)));
        }
        try {
           await fs.writeFile(artistDataFile, JSON.stringify(data, null, 2), 'utf-8');
        } catch (e) {}

        return data;
      }
    } catch (error: any) {
      console.error("Firebase load error for artist " + currentUsername + ":", error.message || error);
      handleFirebaseError(error);
    }
  }
  
  // Try local file
  try {
    if (fsSync.existsSync(artistDataFile)) {
      const data = await fs.readFile(artistDataFile, 'utf-8');
      const parsedData = JSON.parse(data);
      
      if (!parsedData.demos) parsedData.demos = [];
      if (!parsedData.playlists) parsedData.playlists = [];
      
      if (parsedData.adminPassword) {
        currentAdminPasswordLocal = parsedData.adminPassword;
      } else {
        parsedData.adminPassword = currentAdminPasswordLocal;
      }
      if (parsedData.memberPassword !== undefined) {
        currentMemberPasswordLocal = parsedData.memberPassword;
      } else {
        parsedData.memberPassword = currentMemberPasswordLocal;
      }

      if (parsedData.demos) {
        parsedData.demos = parsedData.demos.map((d: any) => {
          if (d.isDraft === 'false' || d.isDraft === '0') {
            d.isDraft = false;
          } else if (d.isDraft === 'true' || d.isDraft === '1') {
            d.isDraft = true;
          }
          if (!d.secretKey) {
            d.secretKey = crypto.randomBytes(8).toString('hex');
          }
          return d;
        });
      }

      if (artistDocRef && !isFirestoreDisabled) {
        try {
          await setDoc(artistDocRef, parsedData);
        } catch (e: any) {
          console.error("Firebase migration error for artist " + currentUsername + ":", e.message || e);
          handleFirebaseError(e);
        }
      }
      return parsedData;
    } else if (currentUsername === 'acxuantai' && fsSync.existsSync(DATA_FILE)) {
      // Copy existing data.json for master artist acxuantai
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      await fs.writeFile(artistDataFile, data, 'utf-8');
      const parsedData = JSON.parse(data);
      return parsedData;
    }
  } catch (error: any) {
    console.error("Local data fallback error for artist " + currentUsername + ":", error);
  }

  // Return default structured template for new artist
  const defaultData = {
    pageTitle: `Kho nhạc của ${artist.artistName || 'Nghệ sĩ'}`,
    artistName: artist.artistName || 'Nghệ sĩ',
    artistBio: `Thiên đường nhạc của ${artist.artistName || 'Nghệ sĩ'}`,
    homeCoverUrl: '',
    faviconUrl: '',
    ogImageUrl: '',
    youtubePlaylistUrl: '',
    spotifyUrl: '',
    releasedSongs: [],
    demos: [],
    playlists: [],
    adminPassword: currentAdminPasswordLocal,
    memberPassword: currentMemberPasswordLocal
  };

  try {
    await fs.writeFile(artistDataFile, JSON.stringify(defaultData, null, 2), 'utf-8');
  } catch (e) {}

  return defaultData;
}

async function saveData(usernameOrData: any, data?: any) {
  let currentUsername = 'acxuantai';
  let realData = usernameOrData;

  if (typeof usernameOrData === 'string' && data !== undefined) {
    currentUsername = usernameOrData;
    realData = data;
  } else {
    // Attempt to detect artist from the data object itself
    if (realData && realData.username) {
      currentUsername = realData.username;
    } else {
      const foundArtist = artists.find(a => 
        (realData.artistName && a.artistName === realData.artistName) ||
        (realData.adminPassword && a.password === realData.adminPassword)
      );
      if (foundArtist) {
        currentUsername = foundArtist.username;
      } else {
        currentUsername = artistStorage.getStore() || 'acxuantai';
      }
    }
    realData = usernameOrData;
  }

  // Ensure username is always explicitly stored in the data file for future reliability
  realData.username = currentUsername;

  const artist = artists.find(a => a.username === currentUsername) || artists[0] || { username: 'acxuantai' };
  const artistDataFile = path.join(process.cwd(), `data_${currentUsername}.json`);
  const artistDocRef = getFirestoreRefForArtist(artist);

  if (artistDocRef && !isFirestoreDisabled) {
    try {
      const cleanedData = JSON.parse(JSON.stringify(realData));
      await setDoc(artistDocRef, cleanedData);
    } catch (error: any) {
      console.error("Firebase save error for artist " + currentUsername + ":", error.message || error);
      handleFirebaseError(error);
    }
  }
  
  try {
    await fs.writeFile(artistDataFile, JSON.stringify(realData, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error writing local file for artist " + currentUsername + ":", e);
  }
}

async function startServer() {
  await loadArtists();
  await loadLandingConfig();
  await ensureUploadsDir();
  const app = express();
  app.set('trust proxy', 1);
  app.use(cors());
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  const getArtistFromRequest = (req: express.Request): any => {
    let ext = (req.query.artist || req.query.extension || req.query.artistExtension) as string;
    
    if (!ext) {
      ext = (req.headers['x-artist-extension'] || req.headers['x-artist']) as string;
    }
    
    // Check subdomain (e.g. abc.chorus.vn) or custom domain
    if (!ext && req.headers.host) {
      const host = req.headers.host.replace(/^www\./, '').toLowerCase().trim();
      const matchedArtist = artists.find(a => {
        const cd = (a.customDomain || '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase().trim();
        const ew = (a.externalWebsiteUrl || '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase().trim();
        return (cd && cd === host) || (ew && ew === host);
      });
      if (matchedArtist) {
        ext = matchedArtist.extension;
      } else if (host.endsWith('.chorus.vn') && host !== 'chorus.vn') {
        const sub = host.replace('.chorus.vn', '');
        if (sub) ext = sub;
      }
    }

    if (!ext) {
      const referer = req.headers['referer'];
      if (referer) {
        try {
          const parsedUrl = new URL(referer);
          // Also check referer hostname
          const refHost = parsedUrl.hostname.replace(/^www\./, '').toLowerCase().trim();
          const matchedArtistByRef = artists.find(a => {
            const cd = (a.customDomain || '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase().trim();
            const ew = (a.externalWebsiteUrl || '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase().trim();
            return (cd && cd === refHost) || (ew && ew === refHost);
          });
          if (matchedArtistByRef) {
            ext = matchedArtistByRef.extension;
          } else if (refHost.endsWith('.chorus.vn') && refHost !== 'chorus.vn') {
            const sub = refHost.replace('.chorus.vn', '');
            if (sub) {
              ext = sub;
            }
          }
          
          if (!ext) {
            const segments = parsedUrl.pathname.split('/').filter(Boolean);
            if (segments.length > 0) {
              const possibleExt = segments[0];
              const reserved = ['admin', 'acp', 'mem', 'demo', 'song', 'playlist', 'api'];
              if (!reserved.includes(possibleExt)) {
                ext = possibleExt;
              }
            }
          }
        } catch (e) {}
      }
    }

            if (ext) {
      const artist = artists.find(a => a.extension === ext || a.username === ext);
      if (artist) return artist;
    }
    return artists.find(a => a.username === 'acxuantai') || artists[0] || { username: 'acxuantai', artistName: 'A.C Xuân Tài', password: 'XuanTaiDepTrai' };
  };

  const isRequestMasterAdmin = (req: express.Request): boolean => {
    const authHeader = req.headers.authorization || req.headers['x-admin-token'];
    let token = '';
    if (authHeader) {
      token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : String(authHeader);
    } else {
      const cookieHeader = req.headers.cookie;
      if (cookieHeader) {
        const cookies: Record<string, string> = {};
        cookieHeader.split(';').forEach(c => {
          const parts = c.split('=');
          if (parts.length >= 2) {
            cookies[parts[0].trim()] = decodeURIComponent(parts[1].trim());
          }
        });
        token = cookies['masterToken'] || '';
      }
    }
    return token === 'master_token_MatKhauDay123' || token === 'MatKhauDay123';
  };

  const isRequestAdmin = (req: express.Request): boolean => {
    const authHeader = req.headers.authorization || req.headers['x-admin-token'];
    let token = '';
    if (authHeader) {
      token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : String(authHeader);
    } else {
      const cookieHeader = req.headers.cookie;
      if (cookieHeader) {
        const cookies: Record<string, string> = {};
        cookieHeader.split(';').forEach(c => {
          const parts = c.split('=');
          if (parts.length >= 2) {
            cookies[parts[0].trim()] = decodeURIComponent(parts[1].trim());
          }
        });
        const artist = (req as any).artist;
        if (artist) {
          token = cookies[`adminToken_${artist.username}`] || '';
        } else {
          token = cookies['adminToken'] || '';
        }
      }
    }

    if (!token) return false;

    const artist = (req as any).artist;
    if (artist && token === artist.password) return true;

    if (token === 'master_token_MatKhauDay123' || token === 'MatKhauDay123') return true;

    return false;
  };

  const isRequestMember = (req: express.Request): boolean => {
    if (isRequestAdmin(req)) return true;

    const authHeader = req.headers.authorization || req.headers['x-admin-token'];
    let token = '';
    if (authHeader) {
      token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : String(authHeader);
    } else {
      const cookieHeader = req.headers.cookie;
      if (cookieHeader) {
        const cookies: Record<string, string> = {};
        cookieHeader.split(';').forEach(c => {
          const parts = c.split('=');
          if (parts.length >= 2) {
            cookies[parts[0].trim()] = decodeURIComponent(parts[1].trim());
          }
        });
        token = cookies['memberToken'] || '';
      }
    }

    if (!token) return false;

    const artist = (req as any).artist;
    const mPass = artist?.memberPassword || '';
    if (mPass && token === mPass) return true;

    return false;
  };

  // Run everything in AsyncLocalStorage context and inject context variables
  app.use(async (req: any, res, next) => {
    if (artists.length === 0) {
      await loadArtists();
    }
    const artist = getArtistFromRequest(req);
    req.artist = artist;
    req.artists = artists;
    artistStorage.run(artist.username, () => {
      next();
    });
  });

  app.get('/api/proxy-audio', async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).send('Missing url parameter');
    }

    try {
      let fetchUrl = targetUrl;
      const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]{25,})/;
      const match = targetUrl.match(driveRegex);
      if (match && match[1]) {
        fetchUrl = `https://docs.google.com/uc?export=download&id=${match[1]}`;
      }

      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      };

      if (req.headers.range) {
        headers['Range'] = req.headers.range;
      }

      let response = await fetch(fetchUrl, { headers });

      if (!response.ok && match && match[1]) {
        // Try fallback format
        const altUrl = `https://drive.google.com/uc?id=${match[1]}`;
        const altHeaders = { ...headers };
        response = await fetch(altUrl, { headers: altHeaders });
      }

      if (!response.ok) {
        return res.status(response.status).send(`Failed to fetch from remote: ${response.statusText}`);
      }

      // Forward response headers
      const contentType = response.headers.get('content-type') || 'audio/mpeg';
      if (contentType.includes('text/html')) {
        return res.status(415).send('Unsupported Media Type: The request returned an HTML page instead of an audio stream. This might be due to access restrictions or security warnings from Google Drive.');
      }
      res.setHeader('Content-Type', contentType);
      
      if (response.headers.get('content-range')) {
        res.setHeader('Content-Range', response.headers.get('content-range')!);
      }
      if (response.headers.get('content-length')) {
        res.setHeader('Content-Length', response.headers.get('content-length')!);
      }
      res.setHeader('Accept-Ranges', 'bytes');
      res.status(response.status);

      if (response.body) {
        if (typeof (response.body as any).pipe === 'function') {
          (response.body as any).pipe(res);
        } else {
          const reader = (response.body as any).getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(Buffer.from(value));
          }
          res.end();
        }
      } else {
        res.end();
      }
    } catch (error: any) {
      console.error('Audio proxy error:', error);
      res.status(500).send(`Error proxying audio: ${error.message}`);
    }
  });

  // AI Studio bắt buộc dùng port 3000 để preview hoạt động.
  // Khi chạy trên VPS CloudPanel của bạn, mặc định sẽ dùng port 3333
  // hoặc thiết lập App Port: 3333 trực tiếp trên giao diện CloudPanel.
  const PORT = process.env.NODE_ENV === 'production' 
    ? (process.env.PORT ? parseInt(process.env.PORT) : 3333) 
    : 3000;

  app.use(express.json());

  // API Routes
  const injectCoverUrl = (demos: any[], slideshowImages?: string[]) => {
      const imagesToUse = (slideshowImages && slideshowImages.length > 0) 
          ? slideshowImages 
          : ["https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80"];
      return demos.map(d => {
         if (!d.coverUrl) {
            const idStr = String(d.id || '');
            const hash = Array.from(idStr).reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
            return { ...d, coverUrl: imagesToUse[hash % imagesToUse.length] };
         }
         return d;
      });
  };

  const formatUrl = (url: string | undefined, baseUrl: string | undefined) => {
    if (!url) return url;
    
    // Normalize baseUrl if provided
    let finalBaseUrl = baseUrl;
    if (finalBaseUrl) {
      finalBaseUrl = finalBaseUrl.trim();
      if (!/^https?:\/\//i.test(finalBaseUrl)) {
        finalBaseUrl = 'https://' + finalBaseUrl;
      }
      finalBaseUrl = finalBaseUrl.replace(/\/$/, '');
    }

    // Always prefer relative URLs for uploads so that they work relative to the SPA dev environment
    const uploadMatch = url.match(/\/uploads\/[^/]+$/);
    if (uploadMatch) {
      if (url.startsWith('http')) return url;
      return uploadMatch[0];
    }
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      let normalized = url.startsWith('/') ? url : '/' + url;
      return normalized;
    }

    // Replace any absolute ais-dev or ais-pre URLs with the global base URL if set
    if (finalBaseUrl && url.includes('run.app')) {
       url = url.replace(/https?:\/\/[a-zA-Z0-9-]+\.run\.app/g, finalBaseUrl);
    }
    
    // Also replace absolute xtpro domains just in case
    if (finalBaseUrl && url.includes('xtpro.vn')) {
        url = url.replace(/https?:\/\/[a-zA-Z0-9-]+\.xtpro\.vn/g, finalBaseUrl);
    }
    
    return url;
  };

  const getPlaylistCover = (p: any, data: any, baseUrl: string) => {
    let pCover = p.coverUrl || '';
    if (!pCover) {
       const songsInPlaylist = (data.demos || []).filter((d: any) => d.playlistIds && d.playlistIds.includes(p.id));
       if (p.songIds && p.songIds.length > 0) {
          songsInPlaylist.sort((a: any, b: any) => {
             const indexA = p.songIds.indexOf(a.id);
             const indexB = p.songIds.indexOf(b.id);
             if (indexA === -1 && indexB === -1) return 0;
             if (indexA === -1) return 1;
             if (indexB === -1) return -1;
             return indexA - indexB;
          });
       }
       const firstSong = songsInPlaylist[0];
       if (firstSong && firstSong.coverUrl) {
          pCover = firstSong.coverUrl;
       }
    }
    return formatUrl(pCover, baseUrl || '');
  };

  const applyBaseUrl = (data: any) => {

    const cloned = { ...data };
    
    cloned.homeCoverUrl = formatUrl(cloned.homeCoverUrl, cloned.globalBaseUrl);
    cloned.faviconUrl = formatUrl(cloned.faviconUrl, cloned.globalBaseUrl);
    cloned.ogImageUrl = formatUrl(cloned.ogImageUrl, cloned.globalBaseUrl);
    
    if (cloned.slideshowImages) {
       cloned.slideshowImages = cloned.slideshowImages.map((s: string) => formatUrl(s, cloned.globalBaseUrl));
    }
    
    if (cloned.playlists) {
       cloned.playlists = cloned.playlists.map((p: any) => ({
         ...p,
         coverUrl: getPlaylistCover(p, cloned, cloned.globalBaseUrl || '')
       }));
    }
    
    if (cloned.demos) {
      cloned.demos = cloned.demos.map((d: any) => ({
        ...d,
        audioUrl: formatUrl(d.audioUrl, cloned.globalBaseUrl),
        coverUrl: formatUrl(d.coverUrl, cloned.globalBaseUrl),
        backgroundUrl: formatUrl(d.backgroundUrl, cloned.globalBaseUrl)
      }));
    }
    return cloned;
  };

  app.get('/api/data', async (req, res) => {
    let data = await loadData((req as any).artist?.username);
    data = applyBaseUrl(data);
    
    if (data.demos) {
       data.demos = data.demos.filter((d: any) => !d.deleted);
    }
    if (data.playlists) {
       data.playlists = data.playlists.filter((p: any) => !p.deleted);
    }

    // Do not leak passwords
    let publicDemos = data.demos.map((d: any) => ({ ...d, password: !!(d.password || data.globalPassword) })); 
    let publicPlaylists = data.playlists
        ?.filter((p: any) => !p.isDraft)
        .map((p: any) => ({ ...p, password: !!p.password, hasSecretLink: !!p.secretLink, secretLink: undefined })) || [];
    publicDemos = injectCoverUrl(publicDemos, data.slideshowImages);
    // We send back both for simplicity, but let's just make it simple
    res.json({ ...data, demos: publicDemos, playlists: publicPlaylists });
  });

  app.get('/api/public/landing-config', async (req, res) => {
    res.json(landingConfig);
  });

  app.post('/api/public/subscribe', async (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email không hợp lệ' });
    }
    try {
      await addSubscriber(email.trim());
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Lỗi máy chủ khi đăng ký' });
    }
  });

  app.get('/api/public/artists', async (req, res) => {
    const list = [];
    const publicArtists = artists.filter(a => a.isPublic !== false && a.isPublic !== 'false');
    for (const artist of publicArtists) {
      try {
        let pageTitle = `Kho nhạc của ${artist.artistName}`;
        let artistBio = `Thiên đường nhạc của ${artist.artistName}`;
        let homeCoverUrl = '';
        let trackCount = 0;
        let demoCount = 0;
        let playlistCount = 0;
        let slideshowImages: string[] = [];

        if (artist.hasExternalWebsite && artist.externalWebsiteUrl) {
          const urlStr = artist.externalWebsiteUrl.trim();
          const cleanUrl = urlStr.replace(/^https?:\/\//i, '');
          
          let extData: any = null;
          let usedProto = 'https';
          
          try {
            const apiRes = await fetch(`https://${cleanUrl}/api/data`, { timeout: 4000 } as any);
            if (apiRes.ok) {
              extData = await apiRes.json();
              usedProto = 'https';
            }
          } catch (e1) {
            try {
              const apiRes = await fetch(`http://${cleanUrl}/api/data`, { timeout: 4000 } as any);
              if (apiRes.ok) {
                extData = await apiRes.json();
                usedProto = 'http';
              }
            } catch (e2) {
              console.error(`Failed to fetch external website data for ${artist.artistName}:`, e2);
            }
          }

          if (extData) {
            pageTitle = extData.pageTitle || pageTitle;
            artistBio = extData.artistBio || artistBio;
            
            let extHomeCoverUrl = extData.homeCoverUrl || '';
            if (extHomeCoverUrl && !extHomeCoverUrl.startsWith('http')) {
              extHomeCoverUrl = `${usedProto}://${cleanUrl}${extHomeCoverUrl.startsWith('/') ? '' : '/'}${extHomeCoverUrl}`;
            }
            homeCoverUrl = extHomeCoverUrl;

            const allDemos = extData.demos || [];
            const nonDeletedDemos = allDemos.filter((d: any) => !d.deleted);
            trackCount = nonDeletedDemos.filter((d: any) => d.isReleased === true || d.isReleased === 'true').length;
            demoCount = nonDeletedDemos.filter((d: any) => d.isReleased !== true && d.isReleased !== 'true').length;
            playlistCount = (extData.playlists || []).filter((p: any) => !p.deleted && !p.isDraft).length;
            
            let extSlideshowImages = extData.slideshowImages || [];
            extSlideshowImages = extSlideshowImages.map((s: string) => {
              if (s && !s.startsWith('http')) {
                return `${usedProto}://${cleanUrl}${s.startsWith('/') ? '' : '/'}${s}`;
              }
              return s;
            });
            slideshowImages = extSlideshowImages;
          } else {
            // Fallback if external fetch fails
            const data = await loadData(artist.username);
            const allDemos = data.demos || [];
            const nonDeletedDemos = allDemos.filter((d: any) => !d.deleted);
            trackCount = nonDeletedDemos.filter((d: any) => d.isReleased === true || d.isReleased === 'true').length;
            demoCount = nonDeletedDemos.filter((d: any) => d.isReleased !== true && d.isReleased !== 'true').length;
            playlistCount = (data.playlists || []).filter((p: any) => !p.deleted && !p.isDraft).length;
            pageTitle = data.pageTitle || pageTitle;
            artistBio = data.artistBio || artistBio;
            
            let extHomeCoverUrl = data.homeCoverUrl || '';
            const extBaseUrl = data.globalBaseUrl || '';
            if (extHomeCoverUrl && !extHomeCoverUrl.startsWith('http') && extBaseUrl) {
              extHomeCoverUrl = `${extBaseUrl.endsWith('/') && extHomeCoverUrl.startsWith('/') ? extBaseUrl.slice(0, -1) : extBaseUrl}${extHomeCoverUrl.startsWith('/') ? '' : '/'}${extHomeCoverUrl}`;
            }
            homeCoverUrl = extHomeCoverUrl;

            let extSlideshowImages = data.slideshowImages || [];
            extSlideshowImages = extSlideshowImages.map((s: string) => {
              if (s && !s.startsWith('http')) {
                return extBaseUrl ? `${extBaseUrl.endsWith('/') && s.startsWith('/') ? extBaseUrl.slice(0, -1) : extBaseUrl}${s.startsWith('/') ? '' : '/'}${s}` : s;
              }
              return s;
            });
            slideshowImages = extSlideshowImages;
          }
        } else {
          // Standard local load
          const data = await loadData(artist.username);
          const allDemos = data.demos || [];
          const nonDeletedDemos = allDemos.filter((d: any) => !d.deleted);
          trackCount = nonDeletedDemos.filter((d: any) => d.isReleased === true || d.isReleased === 'true').length;
          demoCount = nonDeletedDemos.filter((d: any) => d.isReleased !== true && d.isReleased !== 'true').length;
          playlistCount = (data.playlists || []).filter((p: any) => !p.deleted && !p.isDraft).length;
          pageTitle = data.pageTitle || pageTitle;
          artistBio = data.artistBio || artistBio;
          
          let localHomeCoverUrl = data.homeCoverUrl || '';
          const localBaseUrl = data.globalBaseUrl || '';
          if (localHomeCoverUrl && !localHomeCoverUrl.startsWith('http') && localBaseUrl) {
            localHomeCoverUrl = `${localBaseUrl.endsWith('/') && localHomeCoverUrl.startsWith('/') ? localBaseUrl.slice(0, -1) : localBaseUrl}${localHomeCoverUrl.startsWith('/') ? '' : '/'}${localHomeCoverUrl}`;
          }
          homeCoverUrl = localHomeCoverUrl;

          let localSlideshowImages = data.slideshowImages || [];
          localSlideshowImages = localSlideshowImages.map((s: string) => {
            if (s && !s.startsWith('http')) {
              return localBaseUrl ? `${localBaseUrl.endsWith('/') && s.startsWith('/') ? localBaseUrl.slice(0, -1) : localBaseUrl}${s.startsWith('/') ? '' : '/'}${s}` : s;
            }
            return s;
          });
          slideshowImages = localSlideshowImages;
        }

        list.push({
          artistName: artist.artistName,
          extension: artist.extension,
          verified: !!artist.verified,
          isPublic: true,
          pageTitle: pageTitle,
          artistBio: artistBio,
          homeCoverUrl: homeCoverUrl,
          demoCount: demoCount,
          trackCount: trackCount,
          playlistCount: playlistCount,
          customDomain: artist.customDomain || '',
          hasExternalWebsite: !!artist.hasExternalWebsite,
          externalWebsiteUrl: artist.externalWebsiteUrl || '',
          slideshowImages: slideshowImages
        });
      } catch (e) {
        list.push({
          artistName: artist.artistName,
          extension: artist.extension,
          verified: !!artist.verified,
          isPublic: true,
          pageTitle: `Kho nhạc của ${artist.artistName}`,
          artistBio: `Thiên đường nhạc của ${artist.artistName}`,
          homeCoverUrl: '',
          demoCount: 0,
          trackCount: 0,
          playlistCount: 0,
          customDomain: artist.customDomain || '',
          hasExternalWebsite: !!artist.hasExternalWebsite,
          externalWebsiteUrl: artist.externalWebsiteUrl || '',
          slideshowImages: []
        });
      }
    }
    res.json(list);
  });

  // ACP (Admin Control Panel) Master Endpoints
  app.get('/api/acp/landing-config', (req, res) => {
    if (!isRequestMasterAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json(landingConfig);
  });

  app.get('/api/acp/subscribers', async (req, res) => {
    if (!isRequestMasterAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    let list = [];
    try {
      if (fsSync.existsSync(SUBSCRIBERS_FILE)) {
        const content = await fs.readFile(SUBSCRIBERS_FILE, 'utf-8');
        list = JSON.parse(content);
      }
    } catch (e) {}
    res.json(list);
  });

  app.post('/api/acp/landing-config', async (req, res) => {
    if (!isRequestMasterAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { 
      tagline, heroTitle, heroSubtitle, heroDescription, footerText,
      feature1Title, feature1Desc, feature2Title, feature2Desc,
      feature3Title, feature3Desc, feature4Title, feature4Desc,
      cloudSyncEnabled, systemIp
    } = req.body;
    await saveLandingConfig({ 
      tagline, heroTitle, heroSubtitle, heroDescription, footerText,
      feature1Title, feature1Desc, feature2Title, feature2Desc,
      feature3Title, feature3Desc, feature4Title, feature4Desc,
      cloudSyncEnabled: cloudSyncEnabled !== false,
      systemIp: systemIp || ''
    });
    res.json({ success: true, landingConfig });
  });

  app.post('/api/acp/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'acxuantai' && password === 'MatKhauDay123') {
      res.setHeader('Set-Cookie', `masterToken=master_token_MatKhauDay123; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=2592000`);
      res.json({ success: true, token: 'master_token_MatKhauDay123' });
    } else {
      res.status(401).json({ error: 'ID hoặc mật khẩu ACP không chính xác!' });
    }
  });

  app.post('/api/acp/logout', (req, res) => {
    res.setHeader('Set-Cookie', 'masterToken=; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0');
    res.json({ success: true });
  });

  app.get('/api/acp/check', (req, res) => {
    res.json({ isMaster: isRequestMasterAdmin(req) });
  });

  app.get('/api/acp/artists', async (req, res) => {
    if (!isRequestMasterAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json(artists);
  });

  app.post('/api/acp/artists/create', async (req, res) => {
    if (!isRequestMasterAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { artistName, username, extension, password, verified, dbConfig, isPublic, hasExternalWebsite, externalWebsiteUrl } = req.body;
    if (!artistName || !username || !extension || !password) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' });
    }
    
    if (artists.some(a => a.username.toLowerCase() === username.toLowerCase().trim() || a.extension.toLowerCase() === extension.toLowerCase().trim())) {
      return res.status(400).json({ error: 'Username hoặc Phần mở rộng đã tồn tại!' });
    }
    
    const newArtist = {
      id: Math.random().toString(36).substring(2, 15),
      artistName,
      username: username.toLowerCase().trim(),
      extension: extension.toLowerCase().trim(),
      password,
      verified: !!verified,
      isPublic: isPublic !== false,
      dbConfig: dbConfig || "",
      memberPassword: "",
      hasExternalWebsite: !!hasExternalWebsite,
      externalWebsiteUrl: externalWebsiteUrl || ""
    };
    
    artists.push(newArtist);
    await saveArtists(artists);
    await loadData(newArtist.username);
    
    res.json({ success: true, artist: newArtist });
  });

  app.post('/api/acp/artists/update', async (req, res) => {
    if (!isRequestMasterAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { originalUsername, artistName, extension, password, verified, dbConfig, isPublic, approveNameChange, rejectNameChange, approveUsernameChange, rejectUsernameChange, hasExternalWebsite, externalWebsiteUrl } = req.body;
    const artistIdx = artists.findIndex(a => a.username === originalUsername);
    if (artistIdx === -1) {
      return res.status(404).json({ error: 'Không tìm thấy nghệ sĩ!' });
    }
    
    const artist = artists[artistIdx];
    
    if (approveNameChange && artist.pendingNameChange) {
      artist.artistName = artist.pendingNameChange;
      delete artist.pendingNameChange;
      const data = await loadData(artist.username);
      data.artistName = artist.artistName;
      delete data.pendingNameChange;
      await saveData(artist.username, data);
    } else if (rejectNameChange) {
      delete artist.pendingNameChange;
      const data = await loadData(artist.username);
      delete data.pendingNameChange;
      await saveData(artist.username, data);
    } else if (approveUsernameChange && artist.pendingUsernameChange) {
      // Need to rename the data file and username
      const oldUsername = artist.username;
      const newUsername = artist.pendingUsernameChange;
      
      // Update artist object
      artist.username = newUsername;
      delete artist.pendingUsernameChange;
      
      // Load old data, change, save as new, delete old
      const data = await loadData(oldUsername);
      data.username = newUsername;
      delete data.pendingUsernameChange;
      await saveData(newUsername, data);
      
      const fs = require('fs');
      const path = require('path');
      try {
        fs.unlinkSync(path.join(process.cwd(), `data_${oldUsername}.json`));
      } catch(e) {}
    } else if (rejectUsernameChange) {
      delete artist.pendingUsernameChange;
      const data = await loadData(artist.username);
      delete data.pendingUsernameChange;
      await saveData(artist.username, data);
    } else if (!approveNameChange && !rejectNameChange && !approveUsernameChange && !rejectUsernameChange) {
      artist.artistName = artistName || artist.artistName;
      artist.extension = extension ? extension.toLowerCase().trim() : artist.extension;
      artist.password = password || artist.password;
      artist.verified = verified !== undefined ? !!verified : artist.verified;
      artist.isPublic = isPublic !== undefined ? !!isPublic : (artist.isPublic !== false);
      artist.dbConfig = dbConfig !== undefined ? dbConfig : artist.dbConfig;
      artist.hasExternalWebsite = hasExternalWebsite !== undefined ? !!hasExternalWebsite : artist.hasExternalWebsite;
      artist.externalWebsiteUrl = externalWebsiteUrl !== undefined ? externalWebsiteUrl : artist.externalWebsiteUrl;
      
      const data = await loadData(artist.username);
      data.artistName = artist.artistName;
      data.adminPassword = artist.password;
      await saveData(artist.username, data);
    }
    
    await saveArtists(artists);
    res.json({ success: true, artist });
  });

  app.post('/api/acp/artists/delete', async (req, res) => {
    if (!isRequestMasterAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { username } = req.body;
    if (username === 'acxuantai') {
      return res.status(400).json({ error: 'Không thể xóa tài khoản Admin mặc định!' });
    }
    
    const updated = artists.filter(a => a.username !== username);
    if (updated.length === artists.length) {
      return res.status(404).json({ error: 'Không tìm thấy nghệ sĩ!' });
    }
    
    await saveArtists(updated);
    
    const artistDataFile = path.join(process.cwd(), `data_${username}.json`);
    await fs.unlink(artistDataFile).catch(() => {});
    
    res.json({ success: true });
  });

  // Dynamic Multi-Artist Admin/Member authentication endpoints
  app.post('/api/admin/login', (req: any, res) => {
    const { username, password } = req.body;
    let artist = req.artist;
    
    if (username) {
      artist = artists.find(a => a.username.toLowerCase() === username.toLowerCase().trim());
    }
    
    if (artist && artist.password === password) {
      res.setHeader('Set-Cookie', [
        `adminToken_${artist.username}=${artist.password}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=2592000`,
        `adminToken=${artist.password}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=2592000` // Keep legacy for backward compat
      ]);
      res.json({ success: true, token: artist.password, extension: artist.extension, username: artist.username, artist });
    } else {
      res.status(401).json({ error: 'Username hoặc mật khẩu không chính xác!' });
    }
  });

  app.post('/api/admin/logout', (req: any, res) => {
    const artist = req.artist;
    const cookieHeaders = [
      'adminToken=; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0',
      'adminToken=; Path=/; HttpOnly; Max-Age=0'
    ];
    if (artist) {
      cookieHeaders.push(`adminToken_${artist.username}=; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0`);
      cookieHeaders.push(`adminToken_${artist.username}=; Path=/; HttpOnly; Max-Age=0`);
    }
    res.setHeader('Set-Cookie', cookieHeaders);
    res.json({ success: true });
  });

  app.get('/api/admin/check', (req: any, res) => {
    if (isRequestAdmin(req)) {
      res.json({ isAdmin: true, memberPassword: req.artist?.memberPassword || '', artist: req.artist });
    } else {
      res.json({ isAdmin: false });
    }
  });

  app.post('/api/admin/change-password', async (req: any, res) => {
    if (!isRequestAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const artist = req.artist;
    if (!artist) {
      return res.status(404).json({ error: 'Không tìm thấy nghệ sĩ!' });
    }

    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin!' });
    }
    if (oldPassword !== artist.password) {
      return res.status(400).json({ error: 'Mật khẩu cũ không chính xác!' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Xác nhận mật khẩu mới không khớp!' });
    }
    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'Mật khẩu mới phải từ 4 ký tự trở lên!' });
    }

    const data = await loadData((req as any).artist?.username);
    data.adminPassword = newPassword;
    await saveData(data);
    
    artist.password = newPassword;
    await saveArtists(artists);
    
    res.setHeader('Set-Cookie', [
      `adminToken_${artist.username}=${newPassword}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=2592000`,
      `adminToken=${newPassword}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=2592000`
    ]);
    res.json({ success: true, token: newPassword });
  });

  app.post('/api/admin/set-member-password', async (req: any, res) => {
    if (!isRequestAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const artist = req.artist;
    if (!artist) {
      return res.status(404).json({ error: 'Không tìm thấy nghệ sĩ!' });
    }

    const { memberPassword } = req.body;
    
    const data = await loadData((req as any).artist?.username);
    data.memberPassword = memberPassword || "";
    await saveData(data);
    
    artist.memberPassword = memberPassword || "";
    await saveArtists(artists);
    
    res.json({ success: true });
  });

  app.post('/api/member/login', (req: any, res) => {
    const { password } = req.body;
    const artist = req.artist;
    const mPass = artist?.memberPassword || '';
    
    // Default member password is blank if not set, instead of XuanTaiDepTrai
    if (password === mPass) {
      res.setHeader('Set-Cookie', `memberToken=${mPass}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=2592000`);
      res.json({ success: true, token: mPass });
    } else {
      res.status(401).json({ error: 'Mật khẩu thành viên không chính xác!' });
    }
  });

  app.post('/api/member/logout', (req, res) => {
    res.setHeader('Set-Cookie', [
      'memberToken=; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0',
      'memberToken=; Path=/; HttpOnly; Max-Age=0'
    ]);
    res.json({ success: true });
  });

  app.get('/api/member/check', (req, res) => {
    if (isRequestMember(req)) {
      res.json({ isMember: true });
    } else {
      res.json({ isMember: false });
    }
  });

  // Admin access to real data (including passwords for editing)
  app.get('/api/admin/data', async (req: any, res) => {
    if (!isRequestAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const data = await loadData((req as any).artist?.username);
    res.json({ 
      ...data, 
      memberPassword: req.artist?.memberPassword || '', 
      isMasterAdmin: req.artist?.username === 'acxuantai',
      username: req.artist?.username,
      pendingNameChange: req.artist?.pendingNameChange,
      pendingUsernameChange: req.artist?.pendingUsernameChange,
      systemIp: landingConfig.systemIp || ''
    });
  });

  app.get('/api/admin/firebase-configs', (req, res) => {
    if (!isRequestAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const data = fsSync.readFileSync(path.join(process.cwd(), 'firebase-multi-configs.json'), 'utf-8');
      res.json(JSON.parse(data));
    } catch (e) {
      res.json(multiConfig);
    }
  });

  app.post('/api/admin/firebase-configs', async (req, res) => {
    if (!isRequestAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const newConfig = req.body;
      if (!newConfig.activeId || !newConfig.configs) {
        return res.status(400).json({ error: 'Invalid config structure' });
      }
      
      multiConfig = newConfig;
      await fs.writeFile(path.join(process.cwd(), 'firebase-multi-configs.json'), JSON.stringify(multiConfig, null, 2));
      
      // Re-initialize Firebase
      activeConfig = multiConfig.configs.find((c: any) => c.id === multiConfig.activeId) || multiConfig.configs[0];
      firebaseConfig = activeConfig.config;
      
      // Attempt to re-initialize safely by giving app a random name so it doesn't conflict
      const appName = 'app-' + Date.now();
      firebaseApp = initializeApp(firebaseConfig, appName);
      db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || '(default)');
      firebaseStorage = getStorage(firebaseApp);
      DOC_REF = doc(db, 'app_data', 'main');
      
      res.json({ success: true, message: 'Đã chuyển đổi cấu hình Firebase thành công!' });
    } catch (error: any) {
      console.error('Lỗi khi đổi DB Firebase:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/firebase-wipe', async (req, res) => {
    if (!isRequestAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const defaultData = {
        pageTitle: '',
        artistName: 'Tên nghệ sĩ',
        artistBio: 'Mô tả ngắn...',
        homeCoverUrl: '',
        faviconUrl: '',
        ogImageUrl: '',
        youtubePlaylistUrl: '',
        spotifyUrl: '',
        releasedSongs: [],
        demos: [],
        playlists: [],
        adminPassword: currentAdminPassword,
        memberPassword: currentMemberPassword
      };
      await setDoc(DOC_REF, defaultData);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Lỗi khi xóa DB Firebase:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/profile/cancel-request', async (req: any, res) => {
    if (!isRequestAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const data = await loadData((req as any).artist?.username);
    const artist = req.artist;
    if (artist) {
      if (req.body.type === 'name') {
        delete artist.pendingNameChange;
        delete data.pendingNameChange;
        const idx = artists.findIndex(a => a.username === artist.username);
        if (idx !== -1) {
          delete artists[idx].pendingNameChange;
        }
      } else if (req.body.type === 'username') {
        delete artist.pendingUsernameChange;
        delete data.pendingUsernameChange;
        const idx = artists.findIndex(a => a.username === artist.username);
        if (idx !== -1) {
          delete artists[idx].pendingUsernameChange;
        }
      }
      await saveArtists(artists);
      await saveData(artist.username, data);
    }
    res.json({ success: true });
  });

  app.post('/api/profile', async (req: any, res) => {
    if (!isRequestAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const data = await loadData((req as any).artist?.username);
    data.pageTitle = req.body.pageTitle ?? data.pageTitle;
    
    let nameChangeNotice = false;
    if (req.body.artistName !== undefined && req.body.artistName !== data.artistName) {
      const artist = req.artist;
      if (artist) {
        artist.pendingNameChange = req.body.artistName;
        data.pendingNameChange = req.body.artistName;
        await saveArtists(artists);
        nameChangeNotice = true;
      }
    }
    if (req.body.username !== undefined && req.body.username !== req.artist.username) {
      const artist = req.artist;
      if (artist) {
        artist.pendingUsernameChange = req.body.username;
        data.pendingUsernameChange = req.body.username;
        await saveArtists(artists);
        nameChangeNotice = true;
      }
    }

    data.artistBio = req.body.artistBio ?? data.artistBio;
    
    if (req.body.homeCoverUrl !== undefined && req.body.homeCoverUrl !== data.homeCoverUrl) {
      const oldUrl = data.homeCoverUrl;
      data.homeCoverUrl = req.body.homeCoverUrl;
      if (oldUrl) await deleteFileByUrl(oldUrl);
    }
    
    if (req.body.faviconUrl !== undefined && req.body.faviconUrl !== data.faviconUrl) {
      const oldUrl = data.faviconUrl;
      data.faviconUrl = req.body.faviconUrl;
      if (oldUrl) await deleteFileByUrl(oldUrl);
    }
    
    if (req.body.ogImageUrl !== undefined && req.body.ogImageUrl !== data.ogImageUrl) {
      const oldUrl = data.ogImageUrl;
      data.ogImageUrl = req.body.ogImageUrl;
      if (oldUrl) await deleteFileByUrl(oldUrl);
    }

    data.youtubePlaylistUrl = req.body.youtubePlaylistUrl ?? data.youtubePlaylistUrl;
    data.spotifyUrl = req.body.spotifyUrl ?? data.spotifyUrl;
    data.socialFacebook = req.body.socialFacebook ?? data.socialFacebook;
    data.socialInstagram = req.body.socialInstagram ?? data.socialInstagram;
    data.socialYoutube = req.body.socialYoutube ?? data.socialYoutube;
    data.socialTiktok = req.body.socialTiktok ?? data.socialTiktok;
    data.globalPassword = req.body.globalPassword ?? data.globalPassword;
    data.globalBaseUrl = req.body.globalBaseUrl !== undefined ? req.body.globalBaseUrl : data.globalBaseUrl;
    data.customDomain = req.body.customDomain !== undefined ? req.body.customDomain : data.customDomain;
    data.autoSwitchTabs = req.body.autoSwitchTabs !== undefined ? req.body.autoSwitchTabs : data.autoSwitchTabs;
    data.tab1Name = req.body.tab1Name !== undefined ? req.body.tab1Name : data.tab1Name;
    data.tab2Name = req.body.tab2Name !== undefined ? req.body.tab2Name : data.tab2Name;
    data.tab3Name = req.body.tab3Name !== undefined ? req.body.tab3Name : data.tab3Name;
    if (req.body.slideshowImages) data.slideshowImages = req.body.slideshowImages;
    await saveData(data);
    res.json({ ...data, pendingNameChangeNotice: nameChangeNotice });
  });

  app.post('/api/admin/sync-covers-to-cloud', async (req, res) => {
    if (!isRequestAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const data = await loadData((req as any).artist?.username);
      const logs: string[] = [];
      let updatedCount = 0;

      logs.push("Bắt đầu đồng bộ hóa toàn bộ ảnh bìa cũ lên Firebase Storage...");

      // 1. Sync homeCoverUrl
      if (data.homeCoverUrl && !data.homeCoverUrl.includes(firebaseConfig.storageBucket)) {
        logs.push(`Đang xử lý Ảnh trang chủ (Home Cover): ${data.homeCoverUrl}`);
        const newUrl = await uploadUrlOrFileToCloud(data.homeCoverUrl, data.globalBaseUrl);
        if (newUrl !== data.homeCoverUrl) {
          data.homeCoverUrl = newUrl;
          updatedCount++;
          logs.push(`-> Đồng bộ thành công Home Cover: ${newUrl}`);
        }
      }

      // 2. Sync ogImageUrl
      if (data.ogImageUrl && !data.ogImageUrl.includes(firebaseConfig.storageBucket)) {
        logs.push(`Đang xử lý Ảnh giới thiệu Facebook (OG Image): ${data.ogImageUrl}`);
        const newUrl = await uploadUrlOrFileToCloud(data.ogImageUrl, data.globalBaseUrl);
        if (newUrl !== data.ogImageUrl) {
          data.ogImageUrl = newUrl;
          updatedCount++;
          logs.push(`-> Đồng bộ thành công OG Image: ${newUrl}`);
        }
      }

      // 3. Sync Demos (Song Cover & Song Audio)
      if (data.demos && data.demos.length > 0) {
        for (let i = 0; i < data.demos.length; i++) {
          const demo = data.demos[i];
          
          // Đồng bộ ảnh bìa bài hát
          if (demo.coverUrl && !demo.coverUrl.includes(firebaseConfig.storageBucket)) {
            logs.push(`Đang xử lý Ảnh Bìa bài hát [${demo.title}]: ${demo.coverUrl}`);
            const newUrl = await uploadUrlOrFileToCloud(demo.coverUrl, data.globalBaseUrl);
            if (newUrl !== demo.coverUrl) {
              demo.coverUrl = newUrl;
              updatedCount++;
              logs.push(`-> Đồng bộ xong Ảnh Bìa bài [${demo.title}] thành: ${newUrl}`);
            } else if (!newUrl.includes(firebaseConfig.storageBucket)) {
              logs.push(`❌ Lỗi đồng bộ Ảnh Bìa bài [${demo.title}]. Vui lòng kiểm tra lại Firebase Storage!`);
            }
          }

          // Đồng bộ file nhạc audio bài hát
          if (demo.audioUrl && !demo.audioUrl.includes(firebaseConfig.storageBucket)) {
            logs.push(`Đang xử lý file nhạc [${demo.title}]: ${demo.audioUrl}`);
            const newUrl = await uploadUrlOrFileToCloud(demo.audioUrl, data.globalBaseUrl);
            if (newUrl !== demo.audioUrl) {
              demo.audioUrl = newUrl;
              updatedCount++;
              logs.push(`-> Đồng bộ xong Nhạc (Audio) bài [${demo.title}] thành: ${newUrl}`);
            } else if (!newUrl.includes(firebaseConfig.storageBucket)) {
              logs.push(`❌ Lỗi đồng bộ Nhạc (Audio) bài [${demo.title}]. Vui lòng kiểm tra lại Firebase Storage!`);
            }
          }
        }
      }

      // 4. Sync Playlists
      if (data.playlists && data.playlists.length > 0) {
        for (let i = 0; i < data.playlists.length; i++) {
          const playlist = data.playlists[i];
          if (playlist.coverUrl && !playlist.coverUrl.includes(firebaseConfig.storageBucket)) {
            logs.push(`Đang xử lý Danh sách phát [${playlist.title}]: ${playlist.coverUrl}`);
            const newUrl = await uploadUrlOrFileToCloud(playlist.coverUrl, data.globalBaseUrl);
            if (newUrl !== playlist.coverUrl) {
              playlist.coverUrl = newUrl;
              updatedCount++;
              logs.push(`-> Đồng bộ xong Playlist [${playlist.title}] thành: ${newUrl}`);
            }
          }
        }
      }

      if (updatedCount > 0) {
        await saveData(data);
        logs.push(`Đã lưu dữ liệu mới cập nhật vào Firestore! Đã đồng bộ thành công ${updatedCount} tệp tin.`);
      } else {
        logs.push("Không có tệp tin nào được đồng bộ. Có thể tất cả tệp đã ở trên Cloud, hoặc Cloud Storage chưa được bật trên Firebase project này.");
      }

      res.json({ success: true, updatedCount, logs });
    } catch (err: any) {
      console.error("Lỗi đồng bộ ảnh bìa:", err);
      res.status(500).json({ error: err.message || "Lỗi đồng bộ trong quá trình xử lý" });
    }
  });

  app.get('/api/youtube-playlist', async (req, res) => {
    try {
      const plId = req.query.plId as string;
      const chId = req.query.chId as string;
      
      let fetchUrl = '';
      if (plId) {
        fetchUrl = `https://www.youtube.com/playlist?list=${plId}`;
      } else if (chId) {
        fetchUrl = `https://www.youtube.com/channel/${chId}/videos`;
      }
      
      if (!fetchUrl) return res.json([]);
      
      const response = await fetch(fetchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      if (!response.ok) return res.json([]);
      const text = await response.text();
      const match = text.match(/var ytInitialData = (\{.*?\});<\/script>/);

      let videos: any[] = [];
      if (match) {
        const data = JSON.parse(match[1]);
        JSON.stringify(data, (key, value) => {
          if (key === 'playlistVideoRenderer' && value.videoId) {
            videos.push({
              title: value.title?.runs?.[0]?.text || 'Unknown',
              videoId: value.videoId,
              youtubeUrl: `https://www.youtube.com/watch?v=${value.videoId}`
            });
          }
          if (key === 'gridVideoRenderer' && value.videoId) {
            videos.push({
              title: value.title?.runs?.[0]?.text || 'Unknown',
              videoId: value.videoId,
              youtubeUrl: `https://www.youtube.com/watch?v=${value.videoId}`
            });
          }
          if (key === 'richItemRenderer' && value.content?.videoRenderer?.videoId) {
             videos.push({
               title: value.content.videoRenderer.title?.runs?.[0]?.text || 'Unknown',
               videoId: value.content.videoRenderer.videoId,
               youtubeUrl: `https://www.youtube.com/watch?v=${value.content.videoRenderer.videoId}`
             })
          }
          return value;
        });
      }

      // Deduplicate
      const unique = [];
      const ids = new Set();
      for (const v of videos) {
        if (!ids.has(v.videoId)) {
          ids.add(v.videoId);
          unique.push(v);
        }
      }
      
      // Fallback to RSS if scraping failed
      if (unique.length === 0 && plId) {
        const rssRes = await fetch(`https://www.youtube.com/feeds/videos.xml?playlist_id=${plId}`);
        const rssText = await rssRes.text();
        const entries = rssText.split('<entry>').slice(1);
        unique.push(...entries.map(entry => {
          const titleMatch = entry.match(/<title>(.*?)<\/title>/);
          const idMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
          return {
            title: titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>') : 'Unknown',
            videoId: idMatch ? idMatch[1] : '',
            youtubeUrl: idMatch ? `https://www.youtube.com/watch?v=${idMatch[1]}` : ''
          };
        }).filter(v => v.videoId));
      }

      res.json(unique);
    } catch (err) {
      res.json([]);
    }
  });

  app.get('/api/spotify-profile', async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url) return res.json(null);
      const parts = url.split('/');
      const idStr = parts[parts.length - 1].split('?')[0]; // artist id
      const fetchUrl = `https://open.spotify.com/artist/${idStr}`;
      const response = await fetch(fetchUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
      });
      const html = await response.text();
      
      const imageMatch = html.match(/<meta property="?og:image"? content="([^"]+)"/i);
      const titleMatch = html.match(/<meta property="?og:title"? content="([^"]+)"/i);
      const descMatch = html.match(/<meta property="?og:description"? content="([^"]+)"/i);
      
      if (!titleMatch && !descMatch) return res.json(null);
      
      res.json({
        name: titleMatch ? titleMatch[1] : '',
        image: imageMatch ? imageMatch[1] : '',
        description: descMatch ? descMatch[1] : '' // Usually contains monthly listeners
      });
    } catch(err) {
      res.json(null);
    }
  });

  app.post('/api/released', async (req, res) => {
    if (!isRequestAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const data = await loadData((req as any).artist?.username);
    data.releasedSongs = req.body.releasedSongs || [];
    await saveData(data);
    res.json(data);
  });

  const processDriveLink = (url: string) => {
    if (!url) return url;
    const matchFileD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const matchIdParam = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const id = matchFileD ? matchFileD[1] : (matchIdParam ? matchIdParam[1] : null);
    if (id) {
      return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
    }
    return url;
  };

  const parseLyricsBeforeSave = (rawLyrics: string) => {
  if (!rawLyrics) return '';
  const lines = rawLyrics.split(/\r?\n/);
  const cleanedLines: string[] = [];
  let skipBlank = false;

  for (let i = 0; i < lines.length; i++) {
    let textLine = lines[i];
    let trimmed = textLine.trim();
    let lower = trimmed.toLowerCase();

    // Standardize headers
    if (/^\[?ver\s*(\d+)\]?[:]*\s*$/i.test(lower)) {
      textLine = trimmed.replace(/^\[?ver\s*(\d+)\]?[:]*\s*/i, "Verse $1:");
      trimmed = textLine.trim();
      lower = trimmed.toLowerCase();
    } else if (/^\[?rap\]?[:]*\s*$/i.test(lower)) {
      textLine = "Rap:";
      trimmed = textLine.trim();
      lower = trimmed.toLowerCase();
    } else if (/^\[?(pre-chorus|chorus|verse|bridge|drop|ending|coda)\]?[:]*\s*$/i.test(lower) || 
               /^\[?verse\s+(\d+)\]?[:]*\s*$/i.test(lower)) {
      if (!trimmed.startsWith('[')) {
         if (!trimmed.endsWith(':')) {
           textLine = trimmed + ':';
         }
      }
      trimmed = textLine.trim();
      lower = trimmed.toLowerCase();
    }

    const isHeader = lower.includes("pre-chorus") || 
                     lower.includes("chorus") || 
                     lower.includes("verse") || 
                     lower.includes("bridge") || 
                     lower.includes("drop") ||
                     lower.includes("ending") ||
                     lower.includes("coda") ||
                     lower.includes("rap");

    const isActuallyHeader = isHeader && (trimmed.endsWith(':') || (trimmed.startsWith('[') && trimmed.endsWith(']')));

    if (isActuallyHeader) {
      cleanedLines.push(textLine);
      skipBlank = true;
    } else {
      if (trimmed === "") {
        if (skipBlank) continue;
        cleanedLines.push(textLine);
      } else {
        cleanedLines.push(textLine);
        skipBlank = false;
      }
    }
  }
  return cleanedLines.join('\n');
};

app.post('/api/demos', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req: any, res) => {
    if (!isRequestAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const data = await loadData((req as any).artist?.username);
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const audioFile = files['audio']?.[0];
    const coverFile = files['cover']?.[0];
    
    // Ensure unique slug
    let slug = req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let existingSlug = data.demos.find((d: any) => d.slug === slug);
    if (existingSlug) slug = slug + '-' + Date.now().toString().slice(-4);

    let coverUrl = '';
    const artistId = req.artist?.id || 'common';
    if (coverFile) {
      coverUrl = await uploadLocalToCloud(coverFile.path, coverFile.filename, coverFile.mimetype, artistId);
    } else {
      const inputCover = req.body.coverUrl ? processDriveLink(req.body.coverUrl) : '';
      if (inputCover) {
        coverUrl = inputCover;
      } else if (data.slideshowImages && data.slideshowImages.length > 0) {
        const hashSource = req.body.title || Date.now().toString();
        let hash = 0;
        for (let i = 0; i < hashSource.length; i++) {
          hash += hashSource.charCodeAt(i);
        }
        coverUrl = data.slideshowImages[hash % data.slideshowImages.length];
      } else {
        coverUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80";
      }
    }

    let audioUrl = '';
    if (audioFile) {
      audioUrl = await uploadLocalToCloud(audioFile.path, audioFile.filename, audioFile.mimetype, artistId);
    } else {
      audioUrl = req.body.audioUrl || '';
    }

    const newDemo = {
      id: Date.now().toString(),
      slug: slug,
      title: req.body.title,
      author: req.body.author || '',
      audioUrl: audioUrl,
      backupAudioUrl: audioFile ? audioUrl : (req.body.backupAudioUrl || ''),
      coverUrl: coverUrl,
      secretKey: crypto.randomBytes(8).toString('hex'),
      backgroundUrl: processDriveLink(req.body.backgroundUrl || ''),
      lyrics: parseLyricsBeforeSave(req.body.lyrics || ''),
      template: req.body.template || '1',
      status: req.body.status || 'public',
      password: req.body.password || '',
      createdAt: Date.now(),
      composer: req.body.composer || data.artistName || 'Nghệ sĩ',
      singer: req.body.singer || data.artistName || 'Nghệ sĩ',
      isReleased: req.body.isReleased === 'true',
      isDraft: req.body.isDraft === 'true',
      releaseYear: req.body.releaseYear || '',
      playlistIds: req.body.playlistIds ? JSON.parse(req.body.playlistIds) : [],
      achievements: req.body.achievements ? JSON.parse(req.body.achievements) : [],
      linkType: req.body.linkType || 'direct',
      linkZing: req.body.linkZing || '',
      linkSpotify: req.body.linkSpotify || '',
      linkApple: req.body.linkApple || '',
      linkYoutubeMusic: req.body.linkYoutubeMusic || '',
      linkYoutube: req.body.linkYoutube || '',
      linkDrive: req.body.linkDrive || ''
    };
    data.demos.push(newDemo);
    await saveData(data);
    res.json(newDemo);
  });
  
  app.post('/api/demos/:id/update', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req: any, res) => {
     if (!isRequestAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
     }
     const data = await loadData((req as any).artist?.username);
     const idx = data.demos.findIndex((d: any) => d.id === req.params.id || d.slug === req.params.id);
     if (idx >= 0) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const audioFile = files?.['audio']?.[0];
        const coverFile = files?.['cover']?.[0];

        let updatedData = { ...req.body };
        if (updatedData.lyrics) {
           updatedData.lyrics = parseLyricsBeforeSave(updatedData.lyrics);
        }
        let newAudioUrl = '';
        const artistId = req.artist?.id || 'common';
        if (audioFile) {
           newAudioUrl = await uploadLocalToCloud(audioFile.path, audioFile.filename, audioFile.mimetype, artistId);
        } else if (req.body.audioUrl !== undefined && req.body.audioUrl !== data.demos[idx].audioUrl) {
           newAudioUrl = req.body.audioUrl;
        }

        if (newAudioUrl) {
           const oldAudioUrl = data.demos[idx].audioUrl;
           const oldBackupUrl = data.demos[idx].backupAudioUrl;
           
           if (oldBackupUrl && oldBackupUrl !== oldAudioUrl && oldBackupUrl !== newAudioUrl) {
              console.log(`[Revert/Cleanup] Đang dọn dẹp file nhạc cũ nhất khi up bản thứ 3+: ${oldBackupUrl}`);
              await deleteFileByUrl(oldBackupUrl);
           }
           
           updatedData.audioUrl = newAudioUrl;
           updatedData.backupAudioUrl = oldAudioUrl || newAudioUrl;
        } else {
           if (req.body.backupAudioUrl !== undefined) {
              updatedData.backupAudioUrl = req.body.backupAudioUrl;
           }
        }
        if (coverFile) {
           const oldCoverUrl = data.demos[idx].coverUrl;
            updatedData.coverUrl = await uploadLocalToCloud(coverFile.path, coverFile.filename, coverFile.mimetype, artistId);
            if (oldCoverUrl && oldCoverUrl !== updatedData.coverUrl) {
               await deleteFileByUrl(oldCoverUrl);
            }
        } else if (req.body.coverUrl !== undefined) {
            const inputCover = processDriveLink(req.body.coverUrl);
            if (!inputCover) {
                if (data.slideshowImages && data.slideshowImages.length > 0) {
                     const hashSource = (req.body.title || data.demos[idx].title || Date.now().toString());
                     let hash = 0;
                     for (let i = 0; i < hashSource.length; i++) {
                       hash += hashSource.charCodeAt(i);
                     }
                     if (data.demos[idx].coverUrl && data.demos[idx].coverUrl !== data.slideshowImages[hash % data.slideshowImages.length]) {
                        await deleteFileByUrl(data.demos[idx].coverUrl);
                     }
                     updatedData.coverUrl = data.slideshowImages[hash % data.slideshowImages.length];
                } else {
                     if (data.demos[idx].coverUrl && data.demos[idx].coverUrl !== "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80") {
                        await deleteFileByUrl(data.demos[idx].coverUrl);
                     }
                     updatedData.coverUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80";
                }
            } else {
                if (data.demos[idx].coverUrl && data.demos[idx].coverUrl !== inputCover) {
                     await deleteFileByUrl(data.demos[idx].coverUrl);
                 }
                 updatedData.coverUrl = inputCover;
            }
        }
        if (req.body.backgroundUrl !== undefined) {
            updatedData.backgroundUrl = processDriveLink(req.body.backgroundUrl);
        }
        
        if (updatedData.composer === '') updatedData.composer = data.artistName || 'Nghệ sĩ';
        if (updatedData.singer === '') updatedData.singer = data.artistName || 'Nghệ sĩ';
        if (!updatedData.composer && !data.demos[idx].composer) updatedData.composer = data.artistName || 'Nghệ sĩ';
        if (!updatedData.singer && !data.demos[idx].singer) updatedData.singer = data.artistName || 'Nghệ sĩ';
        if (req.body.isReleased !== undefined) {
             updatedData.isReleased = req.body.isReleased === 'true';
        }
        if (req.body.isDraft !== undefined) {
             updatedData.isDraft = req.body.isDraft === 'true';
        }
        if (req.body.playlistIds !== undefined) {
            updatedData.playlistIds = JSON.parse(req.body.playlistIds);
        }
        if (req.body.achievements !== undefined) {
            updatedData.achievements = JSON.parse(req.body.achievements);
        }

        data.demos[idx] = { ...data.demos[idx], ...updatedData };
        await saveData(data);
        res.json(data.demos[idx]);
     } else {
        res.status(404).json({ error: 'Not found' });
     }
  });

  app.post('/api/demos/:id/revert', async (req, res) => {
     if (!isRequestAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
     }
     const data = await loadData((req as any).artist?.username);
     const idx = data.demos.findIndex((d: any) => d.id === req.params.id || d.slug === req.params.id);
     if (idx >= 0) {
        const demo = data.demos[idx];
        const audioUrl = demo.audioUrl;
        const backupAudioUrl = demo.backupAudioUrl;
        
        if (!backupAudioUrl || backupAudioUrl === audioUrl) {
           return res.status(400).json({ error: 'Không có phiên bản nhạc trước đó để khôi phục!' });
        }
        
        // Swap!
        demo.audioUrl = backupAudioUrl;
        demo.backupAudioUrl = audioUrl;
        
        await saveData(data);
        res.json(demo);
     } else {
        res.status(404).json({ error: 'Not found' });
     }
  });
  
  app.post('/api/admin/reset-secret-links', express.json(), async (req, res) => {
     if (!isRequestAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
     }
     const data = await loadData((req as any).artist?.username);
     data.demos = data.demos.map((d: any) => ({
        ...d,
        secretKey: crypto.randomBytes(8).toString('hex')
     }));
     await saveData(data);
     res.json({ success: true });
  });

  app.post('/api/demos/:id/reset-secret', express.json(), async (req, res) => {
     if (!isRequestAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
     }
     const data = await loadData((req as any).artist?.username);
     let found = false;
     data.demos = data.demos.map((d: any) => {
        if (d.id === req.params.id || d.slug === req.params.id) {
           d.secretKey = crypto.randomBytes(8).toString('hex');
           found = true;
        }
        return d;
     });
     if (found) {
        await saveData(data);
        res.json({ success: true });
     } else {
        res.status(404).json({ error: 'Not found' });
     }
  });

  app.post('/api/demos/:id/delete', async (req, res) => {
     if (!isRequestAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
     }
     const data = await loadData((req as any).artist?.username);
     const idx = data.demos.findIndex((d: any) => d.id === req.params.id || d.slug === req.params.id);
     if (idx >= 0) {
        data.demos[idx].deleted = true;
        data.demos[idx].deletedAt = Date.now();
        await saveData(data);
        res.json({ success: true });
     } else {
        res.status(404).json({ error: 'Not found' });
     }
  });

  app.post('/api/demos/:id/restore', async (req, res) => {
     if (!isRequestAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
     }
     const data = await loadData((req as any).artist?.username);
     const idx = data.demos.findIndex((d: any) => d.id === req.params.id || d.slug === req.params.id);
     if (idx >= 0) {
        data.demos[idx].deleted = false;
        delete data.demos[idx].deletedAt;
        await saveData(data);
        res.json({ success: true });
     } else {
        res.status(404).json({ error: 'Not found' });
     }
  });

  app.post('/api/demos/:id/duplicate', async (req, res) => {
     if (!isRequestAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
     }
     const data = await loadData((req as any).artist?.username);
     const originalDemo = data.demos.find((d: any) => d.id === req.params.id || d.slug === req.params.id);
     if (originalDemo) {
        const newId = Math.random().toString(36).substring(2, 9);
        const originalSlug = originalDemo.slug || originalDemo.id;
        let newSlug = originalSlug + '-copy-' + Math.random().toString(36).substring(2, 6);
        
        const newDemo = {
           ...originalDemo,
           id: newId,
           slug: newSlug,
           title: originalDemo.title + ' (Copy)',
           createdAt: new Date().toISOString(),
           isReleased: false,
           isDraft: true,
           deleted: false,
           deletedAt: undefined
        };
        data.demos.push(newDemo);
        await saveData(data);
        res.json(newDemo);
     } else {
        res.status(404).json({ error: 'Not found' });
     }
  });

  app.post('/api/admin/reorder-demos', express.json(), async (req, res) => {
     if (!isRequestAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
     }
     const { demoIds } = req.body;
     if (!Array.isArray(demoIds)) {
        return res.status(400).json({ error: 'Invalid payload' });
     }
     const data = await loadData((req as any).artist?.username);
     const demosMap = new Map(data.demos.map((d: any) => [d.id, d]));
     const orderedDemos: any[] = [];
     
     demoIds.forEach((id: string) => {
        const demo = demosMap.get(id);
        if (demo) {
           orderedDemos.push(demo);
           demosMap.delete(id);
        }
     });
     
     demosMap.forEach((demo) => {
        orderedDemos.push(demo);
     });
     
     data.demos = orderedDemos;
     await saveData(data);
     res.json({ success: true, demos: data.demos });
  });

  app.post('/api/playlists', express.json(), async (req, res) => {
    if (!isRequestAdmin(req)) {
       return res.status(401).json({ error: 'Unauthorized' });
    }
    const data = await loadData((req as any).artist?.username);
    const newPlaylist = {
       id: Date.now().toString(),
       title: req.body.title || 'Untitled Playlist',
       isDraft: req.body.isDraft || false,
       password: req.body.password || '',
       secretLink: req.body.secretLink || ''
    };
    if (!data.playlists) data.playlists = [];
    data.playlists.push(newPlaylist);
    await saveData(data);
    res.json(newPlaylist);
  });

  app.post('/api/playlists/:id/update', express.json(), async (req, res) => {
    if (!isRequestAdmin(req)) {
       return res.status(401).json({ error: 'Unauthorized' });
    }
    const data = await loadData((req as any).artist?.username);
    if (!data.playlists) data.playlists = [];
    const idx = data.playlists.findIndex((p: any) => p.id === req.params.id);
    if (idx >= 0) {
       if (req.body.title !== undefined) data.playlists[idx].title = req.body.title;
       if (req.body.coverUrl !== undefined && req.body.coverUrl !== data.playlists[idx].coverUrl) {
           const oldUrl = data.playlists[idx].coverUrl;
           data.playlists[idx].coverUrl = req.body.coverUrl;
           if (oldUrl) await deleteFileByUrl(oldUrl);
        }
       if (req.body.songIds !== undefined) data.playlists[idx].songIds = req.body.songIds;
       if (req.body.isDraft !== undefined) data.playlists[idx].isDraft = req.body.isDraft;
       if (req.body.password !== undefined) data.playlists[idx].password = req.body.password;
       if (req.body.secretLink !== undefined) data.playlists[idx].secretLink = req.body.secretLink;
       await saveData(data);
       res.json(data.playlists[idx]);
    } else {
       res.status(404).json({ error: 'Not found' });
    }
  });

  app.post('/api/playlists/:id/delete', async (req, res) => {
    if (!isRequestAdmin(req)) {
       return res.status(401).json({ error: 'Unauthorized' });
    }
    const data = await loadData((req as any).artist?.username);
    if (!data.playlists) data.playlists = [];
    const idx = data.playlists.findIndex((p: any) => p.id === req.params.id);
    if (idx >= 0) {
       data.playlists[idx].deleted = true;
       data.playlists[idx].deletedAt = Date.now();
       await saveData(data);
       res.json({ success: true });
    } else {
       res.status(404).json({ error: 'Not found' });
    }
  });

  app.post('/api/playlists/:id/restore', async (req, res) => {
    if (!isRequestAdmin(req)) {
       return res.status(401).json({ error: 'Unauthorized' });
    }
    const data = await loadData((req as any).artist?.username);
    if (!data.playlists) data.playlists = [];
    const idx = data.playlists.findIndex((p: any) => p.id === req.params.id);
    if (idx >= 0) {
       data.playlists[idx].deleted = false;
       delete data.playlists[idx].deletedAt;
       await saveData(data);
       res.json({ success: true });
    } else {
       res.status(404).json({ error: 'Not found' });
    }
  });

  app.post('/api/admin/reorder-playlists', express.json(), async (req, res) => {
    if (!isRequestAdmin(req)) {
       return res.status(401).json({ error: 'Unauthorized' });
    }
    const { playlistIds } = req.body;
    if (!Array.isArray(playlistIds)) {
       return res.status(400).json({ error: 'Invalid payload' });
    }
    const data = await loadData((req as any).artist?.username);
    const playlistsMap = new Map((data.playlists || []).map((p: any) => [p.id, p]));
    const orderedPlaylists: any[] = [];
    
    playlistIds.forEach((id: string) => {
       const pl = playlistsMap.get(id);
       if (pl) {
          orderedPlaylists.push(pl);
          playlistsMap.delete(id);
       }
    });
    
    playlistsMap.forEach((pl) => {
       orderedPlaylists.push(pl);
    });
    
    data.playlists = orderedPlaylists;
    await saveData(data);
    res.json({ success: true, playlists: data.playlists });
  });

  app.post('/api/admin/save-templates', express.json(), async (req, res) => {
    if (!isRequestAdmin(req)) {
       return res.status(401).json({ error: 'Unauthorized' });
    }
    const { configs } = req.body;
    if (!Array.isArray(configs)) {
       return res.status(400).json({ error: 'Invalid payload' });
    }
    
    const data = await loadData((req as any).artist?.username);
    data.templateConfigs = configs;
    await saveData(data);
    res.json({ success: true });
  });

  app.post('/api/demos/:id/verify', async (req, res) => {
    const data = await loadData((req as any).artist?.username);
    let demo = data.demos.find((d: any) => d.id === req.params.id || d.slug === req.params.id);
    if (!demo) return res.status(404).json({ error: 'Not found' });

    let isAuthorized = false;
    
    // Check demo password
    const expectedPassword = demo.linkType === 'indirect' ? demo.password : (demo.isReleased ? null : (demo.password || data.globalPassword));
    if (expectedPassword && expectedPassword === req.body.password) {
       isAuthorized = true;
    }
    
    // Check if bypassed by playlist token
    if (!isAuthorized && req.body.playlistId && req.body.playlistToken) {
       const playlist = data.playlists?.find((p: any) => p.id === req.body.playlistId);
       if (playlist) {
          if ((playlist.password && playlist.password === req.body.playlistToken) || 
              (playlist.secretLink && playlist.secretLink === req.body.playlistToken)) {
             isAuthorized = true;
          }
       }
    }

    if (!expectedPassword || isAuthorized) {
      if (!demo.coverUrl) {
          const imagesToUse = (data.slideshowImages && data.slideshowImages.length > 0)
              ? data.slideshowImages
              : ["https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80"];
          const idStr = String(demo.id || '');
          const hash = Array.from(idStr).reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
          demo = { ...demo, coverUrl: imagesToUse[hash % imagesToUse.length] };
      }
      
      const formattedDemo = {
        ...demo,
        audioUrl: formatUrl(demo.audioUrl, data.globalBaseUrl),
        coverUrl: formatUrl(demo.coverUrl, data.globalBaseUrl),
        backgroundUrl: formatUrl(demo.backgroundUrl, data.globalBaseUrl),
        globalCoverUrl: formatUrl(data.homeCoverUrl, data.globalBaseUrl)
      };
      res.json({ success: true, demo: formattedDemo });
    } else {
      res.status(401).json({ error: 'Sai mật khẩu' });
    }
  });

  app.post('/api/playlists/:id/verify', async (req, res) => {
    const data = await loadData((req as any).artist?.username);
    let playlist = data.playlists?.find((p: any) => p.id === req.params.id);
    if (!playlist) return res.status(404).json({ error: 'Not found' });
    
    if (req.body.password && playlist.password && playlist.password === req.body.password) {
       res.json({ success: true, token: playlist.password });
    } else if (req.body.secretLink && playlist.secretLink && playlist.secretLink === req.body.secretLink) {
       res.json({ success: true, token: playlist.secretLink });
    } else {
       res.status(401).json({ error: 'Wrong password or secret link' });
    }
  });

  app.get('/api/playlists/:id', async (req, res) => {
      const data = await loadData((req as any).artist?.username);
      const playlist = data.playlists?.find((p: any) => p.id === req.params.id && !p.deleted);
      if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
      
      const isUserAdmin = isRequestAdmin(req);
      const isUserMember = isRequestMember(req);

      let authorized = isUserAdmin;
      if (!authorized) {
         const token = req.headers['x-playlist-token'] || req.query.token;
         if ((playlist.password && playlist.password === token) || 
             (playlist.secretLink && playlist.secretLink === token)) {
             authorized = true;
         } else if (!playlist.password && !playlist.secretLink) {
             authorized = true;
         }
      }

      if (!authorized) {
          return res.status(401).json({ error: 'Mật khẩu không đúng', isProtected: true, coverUrl: playlist.coverUrl ? formatUrl(playlist.coverUrl, data.globalBaseUrl) : undefined, title: playlist.title, artistExtension: (req as any).artist?.username });
      }

      let songs = data.demos.filter((d: any) => {
         if (d.deleted) return false;
         if (d.status !== 'public' && !isUserAdmin) return false;
         return d.playlistIds && d.playlistIds.includes(playlist.id);
      });

      if (playlist.songIds && playlist.songIds.length > 0) {
         songs.sort((a: any, b: any) => {
            const indexA = playlist.songIds.indexOf(a.id);
            const indexB = playlist.songIds.indexOf(b.id);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
         });
      }

      songs = songs.map((d: any) => {
         let coverToUse = d.coverUrl || '';
         if (!coverToUse && data.slideshowImages && data.slideshowImages.length > 0) {
            const idStr = String(d.id || '');
            let hash = 0;
            for (let i = 0; i < idStr.length; i++) {
               hash += idStr.charCodeAt(i);
            }
            coverToUse = data.slideshowImages[hash % data.slideshowImages.length];
         }
         if (!coverToUse) {
            coverToUse = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80";
         }
         return {
            id: d.id,
            slug: d.slug,
            title: d.title,
            singer: d.singer,
            author: d.author,
            composer: d.composer,
            coverUrl: formatUrl(coverToUse, data.globalBaseUrl),
            requiresPassword: isUserMember ? false : !!(!d.isReleased && (d.password || data.globalPassword))
         };
      });

      const formattedPlaylist = {
         ...playlist,
         coverUrl: playlist.coverUrl ? formatUrl(playlist.coverUrl, data.globalBaseUrl) : (songs[0]?.coverUrl || ''),
         password: !!playlist.password,
         hasSecretLink: !!playlist.secretLink,
         secretLink: undefined,
         artistExtension: (req as any).artist?.username
      };

      res.json({ playlist: formattedPlaylist, songs, artistExtension: (req as any).artist?.username });
  });

  app.get('/api/demos/:id', async (req, res) => {
      const data = await loadData((req as any).artist?.username);
      let demo = data.demos.find((d: any) => (d.id === req.params.id || d.slug === req.params.id) && !d.deleted);
      if (!demo) return res.status(404).json({ error: 'Not found' });
      
      // Inject random cover if missing
      if (!demo.coverUrl) {
          const imagesToUse = (data.slideshowImages && data.slideshowImages.length > 0)
              ? data.slideshowImages
              : ["https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80"];
          const idStr = String(demo.id || '');
          let hash = 0;
          for (let i = 0; i < idStr.length; i++) {
             hash += idStr.charCodeAt(i);
          }
          demo = { ...demo, coverUrl: imagesToUse[hash % imagesToUse.length] };
      }
      
      demo = {
        ...demo,
        audioUrl: formatUrl(demo.audioUrl, data.globalBaseUrl),
        coverUrl: formatUrl(demo.coverUrl, data.globalBaseUrl),
        backgroundUrl: formatUrl(demo.backgroundUrl, data.globalBaseUrl),
        templateConfigs: data.templateConfigs || []
      };

      const expectedPassword = demo.linkType === 'indirect' ? demo.password : (demo.isReleased ? null : (demo.password || data.globalPassword));
      const isUserAdmin = isRequestAdmin(req);
      const isUserMember = isRequestMember(req);
      const fromPlaylist = req.query.fromPlaylist === 'true';
      const providedSecret = req.query.secret as string | undefined;
      let isValidSecret = !!(demo.secretKey && providedSecret && demo.secretKey === providedSecret);
      
      if (!isValidSecret && req.query.playlistId && req.query.playlistToken) {
         const playlist = data.playlists?.find((p: any) => p.id === req.query.playlistId);
         if (playlist) {
            if ((playlist.password && playlist.password === req.query.playlistToken) || 
                (playlist.secretLink && playlist.secretLink === req.query.playlistToken)) {
               isValidSecret = true;
            }
         }
      }

      // If it requires password, only return basic metadata without audio/lyrics
      if (expectedPassword && expectedPassword !== req.query.pwd && !isValidSecret && !isUserAdmin && !isUserMember) {
          return res.json({ 
              id: demo.id, 
              title: demo.title,
              singer: demo.singer,
              author: demo.author,
              composer: demo.composer,
              template: demo.template,
              coverUrl: demo.coverUrl,
              backgroundUrl: demo.backgroundUrl,
              globalCoverUrl: formatUrl(data.homeCoverUrl, data.globalBaseUrl),
              slideshowImages: data.slideshowImages || [],
              requiresPassword: true,
              hasPassword: true,
              artistExtension: (req as any).artist?.username
          });
      }
      res.json({ ...demo, artistExtension: (req as any).artist?.username, slideshowImages: data.slideshowImages || [], globalCoverUrl: formatUrl(data.homeCoverUrl, data.globalBaseUrl), requiresPassword: !!expectedPassword && !isValidSecret && !isUserMember, hasPassword: !!expectedPassword });
  });

  // Serve static files from public/uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  app.post('/api/upload', upload.single('file'), async (req: any, res) => {
    if (!isRequestAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const artistId = req.artist?.id || 'common';
    if (req.file) {
      if (req.file.mimetype.startsWith('image/')) {
        try {
           const optimizedFilename = `${req.file.filename.split('.')[0]}-${Date.now()}.jpg`;
           const optimizedPath = path.join(process.cwd(), 'public', 'uploads', artistId, optimizedFilename);
           
           await sharp(req.file.path)
            .jpeg({ quality: 80, progressive: true })
            .resize({ width: 1600, withoutEnlargement: true })
            .toFile(optimizedPath);
           
           // Xóa file raw gốc chưa qua tối ưu hóa
           await fs.unlink(req.file.path).catch(() => {});
           
           // Upload to Firebase Storage
           if (isFirestoreDisabled) {
              res.json({ url: `/uploads/${artistId}/${optimizedFilename}` });
           } else {
              try {
                 const fileBuffer = await fs.readFile(optimizedPath);
                 const storageRef = ref(firebaseStorage, `uploads/${artistId}/${optimizedFilename}`);
                 await uploadBytes(storageRef, fileBuffer, { contentType: 'image/jpeg' });
                 const cloudUrl = await getDownloadURL(storageRef);
                 
                 // Xóa file optimized cục bộ để gọn dung lượng server, chỉ lưu trên Firebase
                 await fs.unlink(optimizedPath).catch(() => {});
                 res.json({ url: cloudUrl });
              } catch (firebaseErr: any) {
                 console.log("[Firebase Storage] Upload skipped or failed. Storing image locally instead.");
                 res.json({ url: `/uploads/${artistId}/${optimizedFilename}` });
              }
           }
        } catch (error) {
           console.error("Lỗi nén ảnh:", error);
           if (isFirestoreDisabled) {
              res.json({ url: `/uploads/${artistId}/${req.file.filename}` });
           } else {
              try {
                 const fileBuffer = await fs.readFile(req.file.path);
                 const storageRef = ref(firebaseStorage, `uploads/${artistId}/${req.file.filename}`);
                 await uploadBytes(storageRef, fileBuffer, { contentType: req.file.mimetype });
                 const cloudUrl = await getDownloadURL(storageRef);
                 
                 // Xóa file gốc cục bộ
                 await fs.unlink(req.file.path).catch(() => {});
                 res.json({ url: cloudUrl });
              } catch (firebaseErr: any) {
                 console.log("[Firebase Storage] Original upload skipped or failed. Storing image locally instead.");
                 res.json({ url: `/uploads/${artistId}/${req.file.filename}` });
              }
           }
        }
      } else {
        // Tệp không phải là ảnh (Nhạc hoặc tài liệu khác)
        const isWav = req.file.originalname.toLowerCase().endsWith('.wav') || 
                      req.file.mimetype.includes('wav') || 
                      req.file.mimetype.includes('wave') ||
                      req.file.mimetype.includes('x-wav');

        if (isWav) {
          try {
            console.log(`Đang chạy cơ chế tự chuyển đổi: File WAV được phát hiện (${req.file.originalname}). Khởi động FFmpeg để convert thành MP3.`);
            const wavPath = req.file.path;
            const mp3Filename = `${req.file.filename.split('.')[0]}-${Date.now()}.mp3`;
            const mp3Path = path.join(process.cwd(), 'public', 'uploads', artistId, mp3Filename);

            // Chuyển đổi WAV sang MP3 bằng ffmpeg
            await new Promise<void>((resolve, reject) => {
              ffmpeg(wavPath)
                .toFormat('mp3')
                .audioBitrate(192) // 192kbps chất lượng rất tốt & dung lượng siêu nhẹ
                .on('end', () => {
                  console.log(`Đã chuyển đổi thành công WAV sang MP3 cục bộ: ${mp3Path}`);
                  resolve();
                })
                .on('error', (err) => {
                  console.error("Lỗi FFmpeg chuyển đổi:", err);
                  reject(err);
                })
                .save(mp3Path);
            });

            // Xóa file WAV gốc cục bộ để tránh rác server
            try {
              await fs.unlink(wavPath);
            } catch (unlinkErr) {
              console.error("Không thể xóa file WAV tạm:", unlinkErr);
            }

            // Theo thông số mới: file nhạc chỉ lưu lên server, không lưu lên firebase
            res.json({ url: `/uploads/${artistId}/${mp3Filename}` });
          } catch (convertErr: any) {
            console.error("Lỗi chuyển đổi (.wav -> .mp3): Khôi phục cơ chế mặc định.", convertErr);
            res.json({ url: `/uploads/${artistId}/${req.file.filename}` });
          }
        } else {
          // File nhạc MP3 hoặc các định dạng khác: chỉ lưu lên server, không lưu lên firebase
          res.json({ url: `/uploads/${artistId}/${req.file.filename}` });
        }
      }
    } else {
      res.status(400).json({ error: 'Upload failed' });
    }
  });

  app.post('/api/upload-base64', express.json({limit: '50mb'}), async (req: any, res) => {
    if (!isRequestAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const artistId = req.artist?.id || 'common';
    try {
      const { image } = req.body;
      if (!image) return res.status(400).json({ error: 'No image provided' });
      
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const rawBuffer = Buffer.from(base64Data, 'base64');
      
      const filename = `thumb-${Date.now()}.jpg`;
      const filepath = path.join(process.cwd(), 'public', 'uploads', artistId, filename);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(filepath), { recursive: true }).catch(() => {});
      
      // Nén ảnh base64 thành JPEG chất lượng 80 và resize về max-width 1600
      const optimizedBuffer = await sharp(rawBuffer)
        .jpeg({ quality: 80, progressive: true })
        .resize({ width: 1600, withoutEnlargement: true })
        .toBuffer();
      
      // Lưu file cục bộ tạm thời
      await fs.writeFile(filepath, optimizedBuffer);
      
      // Upload to Firebase Storage
      if (isFirestoreDisabled) {
         res.json({ url: `/uploads/${artistId}/${filename}` });
      } else {
         try {
            const storageRef = ref(firebaseStorage, `uploads/${artistId}/${filename}`);
            await uploadBytes(storageRef, optimizedBuffer, { contentType: 'image/jpeg' });
            const cloudUrl = await getDownloadURL(storageRef);
            
            // Xóa file cục bộ sau khi đã upload lên cloud thành công để tiết kiệm dung lượng
            await fs.unlink(filepath).catch(() => {});
            res.json({ url: cloudUrl });
         } catch (firebaseErr) {
            console.log("[Firebase Storage] Base64 upload skipped or failed. Storing locally instead.");
            res.json({ url: `/uploads/${artistId}/${filename}` });
         }
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  });

  app.post('/api/demos/:id/thumbnail', express.json(), async (req, res) => {
    if (!isRequestAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const data = await loadData((req as any).artist?.username);
    const idx = data.demos.findIndex((d: any) => d.id === req.params.id || d.slug === req.params.id);
    if (idx >= 0) {
       data.demos[idx].ogImageUrl = req.body.ogImageUrl;
       await saveData(data);
       return res.json({ success: true });
    }
    res.status(404).json({ error: 'Not found' });
  });

  app.post('/api/translate', express.json(), async (req, res) => {
    const { text, targetLang } = req.body;
    if (!text) return res.json({ translated: '' });
    
    try {
       const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
       const targetLanguageName = targetLang === 'en' ? 'English' : 
                                  targetLang === 'ko' ? 'Korean' : 
                                  targetLang === 'ja' ? 'Japanese' : 
                                  targetLang === 'th' ? 'Thai' : 
                                  targetLang === 'zh' ? 'Chinese' : 'Vietnamese';
       
       if (targetLanguageName === 'Vietnamese') return res.json({ translated: text });
  
       const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: [
           {
             role: 'user', 
             parts: [{ text: `Translate the following short text (like a song title or bio) into ${targetLanguageName}. Only output the translation, do not include any quotes, extra words, or markdown. Text to translate:\n\n${text}` }]
           }
         ]
       });
       
       const translated = response.text?.trim() || text;
       res.json({ translated });
    } catch (error) {
       console.log('Translation fallback (quota or network error):', (error as any)?.message);
       res.json({ translated: text });
    }
  });

  // Serve runtime uploads folder
  const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
  app.use('/uploads', express.static(uploadsPath));
  
  // Fallback for missing uploads: redirect to the production domain
  app.use('/uploads', async (req, res, next) => {
     try {
        const data = await loadData((req as any).artist?.username);
        if (data.globalBaseUrl) {
           const base = data.globalBaseUrl.startsWith('http') ? data.globalBaseUrl : `https://${data.globalBaseUrl}`;
           const cleanBase = base.replace(/\/$/, "");
           return res.redirect(`${cleanBase}/uploads${req.path}`);
        }
     } catch (e) {}
     next();
  });

  let vite: any;
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files but DON'T serve index.html by default
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
  }

  app.get('/demo/:id', (req, res) => {
    const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    res.redirect(301, `/song/${req.params.id}${query}`);
  });

  app.get('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;
      const data = await loadData((req as any).artist?.username);
      
      let html = '';
      if (process.env.NODE_ENV !== 'production') {
        html = await fs.readFile(path.join(process.cwd(), 'index.html'), 'utf-8');
        html = await vite.transformIndexHtml(url, html);
      } else {
        html = await fs.readFile(path.join(process.cwd(), 'dist', 'index.html'), 'utf-8');
      }

      const defaultDesc = data.pageTitle || `Kho nhạc của ${data.artistName || 'Nghệ sĩ'}`;
      let ogTitle = data.pageTitle || `Thiên đường âm nhạc của ${data.artistName || 'Nghệ sĩ'}`;
      
      const initialOgImage = data.ogImageUrl || data.homeCoverUrl || (data.slideshowImages && data.slideshowImages.length > 0 ? data.slideshowImages[0] : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80");
      let ogImage = formatUrl(initialOgImage, data.globalBaseUrl) || '';
      
      const cleanPath = url.split('?')[0];
      const isHomepage = cleanPath === '/' || cleanPath === '/index.html' || cleanPath === '';
      let ogDesc = isHomepage 
        ? `Nơi cập nhật sản phẩm và demo của ${data.artistName || 'Nghệ sĩ'}`
        : defaultDesc;

      // Extract active song slug / query robustly (case-insensitive)
      let querySongSlug = (req.query.song as string) || (req.query.demo as string) || '';
      let activeSong: any = null;
      
      if (querySongSlug) {
        const decodedSlug = decodeURIComponent(querySongSlug).trim().toLowerCase();
        activeSong = data.demos.find((d: any) => {
          const fid = String(d.id || '').toLowerCase();
          const fslug = String(d.slug || '').toLowerCase();
          return (fid === decodedSlug || fslug === decodedSlug) && !d.deleted;
        });
      }

      if (!activeSong) {
        const songPathMatch = cleanPath.match(/^\/(?:demo|song)\/([^\/?]+)/i);
        if (songPathMatch) {
          const slug = decodeURIComponent(songPathMatch[1]).trim().toLowerCase();
          activeSong = data.demos.find((d: any) => {
            const fid = String(d.id || '').toLowerCase();
            const fslug = String(d.slug || '').toLowerCase();
            return (fid === slug || fslug === slug) && !d.deleted;
          });
        }
      }

      if (activeSong) {
        const titleSuffix = activeSong.singer || activeSong.author || activeSong.composer || data.artistName || 'Nghệ sĩ';
        ogTitle = activeSong.isReleased 
          ? `${activeSong.title} - ${titleSuffix}`
          : `${activeSong.title} - ${titleSuffix} ( demo )`;
        
        let coverToUse = activeSong.coverUrl || activeSong.ogImageUrl;
        if (!coverToUse && data.slideshowImages && data.slideshowImages.length > 0) {
            const idStr = String(activeSong.id || '');
            let hash = 0;
            for (let i = 0; i < idStr.length; i++) {
               hash += idStr.charCodeAt(i);
            }
            coverToUse = data.slideshowImages[hash % data.slideshowImages.length];
        }
        
        if (!coverToUse) {
            coverToUse = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80";
        }
        
        ogImage = formatUrl(coverToUse, data.globalBaseUrl) || '';
        ogDesc = defaultDesc;
      }

      const playlistMatch = cleanPath.match(/^\/playlist\/([^\/?]+)/i);
      if (playlistMatch && !activeSong) {
        const playlistId = decodeURIComponent(playlistMatch[1]).trim().toLowerCase();
        if (data.playlists) {
          const playlist = data.playlists.find((p: any) => String(p.id || '').toLowerCase() === playlistId && !p.deleted);
          if (playlist) {
            ogTitle = `${playlist.title} - ${data.artistName || 'Nghệ sĩ'}`;
            
            let pCover = playlist.coverUrl;
            if (!pCover) {
              const pSongs = data.demos.filter((d: any) => !d.deleted && d.status === 'public' && d.playlistIds && d.playlistIds.includes(playlist.id));
              if (playlist.songIds && playlist.songIds.length > 0) {
                 pSongs.sort((a: any, b: any) => {
                    const indexA = playlist.songIds.indexOf(a.id);
                    const indexB = playlist.songIds.indexOf(b.id);
                    if (indexA === -1 && indexB === -1) return 0;
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;
                    return indexA - indexB;
                 });
              }
              if (pSongs.length > 0) {
                 let firstSong = pSongs[0];
                 let firstSongCover = firstSong.coverUrl;
                 if (!firstSongCover && data.slideshowImages && data.slideshowImages.length > 0) {
                     const idStr = String(firstSong.id || '');
                     const hash = Array.from(idStr).reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
                     firstSongCover = data.slideshowImages[hash % data.slideshowImages.length];
                 }
                 pCover = firstSongCover;
              }
            }
            
            if (!pCover) {
              pCover = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80";
            }
            ogImage = formatUrl(pCover, data.globalBaseUrl) || '';
            ogDesc = defaultDesc;
          }
        }
      }

      const host = req.get('x-forwarded-host') || req.get('host') || '';
      if (ogImage && ogImage.startsWith('/')) {
         ogImage = `https://${host}${ogImage}`;
      } else if (ogImage && !ogImage.startsWith('http')) {
         // ensure it's a full URL if it doesn't have http
         ogImage = `https://${host}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
      }

      if (ogImage) {
         // Enforce punycode hostname in ogImage
         ogImage = ogImage.replace(/tài\.com/gi, 'xn--ti-jia.com');
         ogImage = ogImage.replace(/ta\u0300i\.com/gi, 'xn--ti-jia.com');
         ogImage = ogImage.replace(/t%C3%A0i\.com/gi, 'xn--ti-jia.com');
         ogImage = ogImage.replace(/t%c3%a0i\.com/gi, 'xn--ti-jia.com');
         ogImage = ogImage.replace(/t\u0300?a\u0300?i\.com/gi, 'xn--ti-jia.com');
      }

      let ogUrl = `https://${host}${url}`;
      // Enforce ASCII punycode hostname in ogUrl for reliable DNS crawls
      if (ogUrl) {
         ogUrl = ogUrl.replace(/tài\.com/gi, 'xn--ti-jia.com');
         ogUrl = ogUrl.replace(/ta\u0300i\.com/gi, 'xn--ti-jia.com');
         ogUrl = ogUrl.replace(/t%C3%A0i\.com/gi, 'xn--ti-jia.com');
         ogUrl = ogUrl.replace(/t%c3%a0i\.com/gi, 'xn--ti-jia.com');
         ogUrl = ogUrl.replace(/t\u0300?a\u0300?i\.com/gi, 'xn--ti-jia.com');
      }

      // Escape tag attributes carefully to prevent broken HTML on double/single quotes or ampersands
      const escapeHtmlAttr = (str: string | undefined | null) => {
        if (!str) return '';
        return str
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      };

      const escapedTitle = escapeHtmlAttr(ogTitle);
      const escapedDesc = escapeHtmlAttr(ogDesc);
      const escapedImage = escapeHtmlAttr(ogImage);
      const escapedUrl = escapeHtmlAttr(ogUrl);

      // Inject tags
      html = html.replace(/<title>.*?<\/title>/i, `<title>${escapedTitle}</title>`);
      
      const metaTags = `
        <meta property="og:title" content="${escapedTitle}" />
        <meta property="og:description" content="${escapedDesc}" />
        <meta property="og:image" content="${escapedImage}" />
        <meta property="og:image:secure_url" content="${escapedImage}" />
        <meta property="og:url" content="${escapedUrl}" />
        <meta property="og:site_name" content="tài.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${escapedTitle}" />
        <meta name="twitter:description" content="${escapedDesc}" />
        <meta name="twitter:image" content="${escapedImage}" />
      `;
      html = html.replace(/<\/head>/i, `${metaTags}</head>`);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e: any) {
      if (process.env.NODE_ENV !== 'production' && vite) {
          vite.ssrFixStacktrace(e);
      }
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
