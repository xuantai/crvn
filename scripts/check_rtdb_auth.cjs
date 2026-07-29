const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signInAnonymously } = require('firebase/auth');
const { getDatabase, ref, get } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyAcml_QfgGTH80OKmRVj2tWIomEQUUiHB0",
  authDomain: "taimusic-96289.firebaseapp.com",
  databaseURL: "https://taimusic-96289-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "taimusic-96289",
  storageBucket: "taimusic-96289.firebasestorage.app",
  messagingSenderId: "848155741386",
  appId: "1:848155741386:web:4f5b5d826ce5fbbba8f833",
  measurementId: "G-D4ZSK50GZ2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const rtdb = getDatabase(app);

async function main() {
  console.log('=== Checking Firebase Auth & RTDB asia-southeast1 ===');
  
  // Try anonymous login
  try {
    const cred = await signInAnonymously(auth);
    console.log('Logged in anonymously, UID:', cred.user.uid);
    const snap = await get(ref(rtdb, '/'));
    if (snap.exists()) {
      console.log('🔥 ANONYMOUS RTDB DATA:', JSON.stringify(snap.val()).substring(0, 1000));
      return;
    }
  } catch (e) {
    console.log('Anon auth error:', e.message);
  }

  // Try email login
  const testEmails = [
    'xuantai@chorus.vn',
    'acxuantai@gmail.com',
    'xuantai@gmail.com',
    'admin@chorus.vn'
  ];
  const testPass = 'MatKhauDay123';

  for (const email of testEmails) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, testPass);
      console.log(`✅ Logged in with [${email}], UID:`, cred.user.uid);
      const snap = await get(ref(rtdb, '/'));
      if (snap.exists()) {
        console.log('🔥 AUTHENTICATED RTDB DATA:', JSON.stringify(snap.val()).substring(0, 2000));
        const val = snap.val();
        if (JSON.stringify(val).includes('aboutMe') || JSON.stringify(val).includes('biography')) {
          console.log('🎯 FOUND PROFILE DATA IN RTDB!');
        }
      } else {
        console.log('RTDB is empty');
      }
      return;
    } catch (e) {
      console.log(`Auth failed for [${email}]:`, e.message);
    }
  }
}

main().catch(console.error);
