const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, listCollections } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAcml_QfgGTH80OKmRVj2tWIomEQUUiHB0",
  authDomain: "taimusic-96289.firebaseapp.com",
  projectId: "taimusic-96289",
  storageBucket: "taimusic-96289.firebasestorage.app",
  messagingSenderId: "848155741386",
  appId: "1:848155741386:web:4f5b5d826ce5fbbba8f833",
  measurementId: "G-D4ZSK50GZ2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const knownCollections = [
  'app_data', 'artists', 'users', 'configs', 'profiles', 'demos', 'artist', 'data',
  'acxuantai', 'biography', 'about', 'aboutMe', 'artist_acxuantai', 'bio'
];

const knownDocIds = [
  'main', 'landing', 'acxuantai', 'artist_acxuantai', 'profile', 'bio', 'about',
  'data_acxuantai', 'default'
];

async function checkFirestore() {
  console.log('=== Deep checking Firebase Firestore ===');
  for (const colName of knownCollections) {
    try {
      const colRef = collection(db, colName);
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        console.log(`✅ Collection [${colName}] found ${snap.size} documents:`);
        snap.forEach(d => {
          console.log(`  - Doc ID: ${d.id}`);
          const data = d.data();
          console.log(`    Keys: ${Object.keys(data).join(', ')}`);
          if (data.aboutMe) console.log(`    aboutMe:`, JSON.stringify(data.aboutMe));
          if (data.biography) console.log(`    biography:`, JSON.stringify(data.biography));
        });
      } else {
        // console.log(`Collection [${colName}] is empty`);
      }
    } catch (e) {
      console.log(`Error checking collection [${colName}]:`, e.message);
    }
  }

  for (const colName of knownCollections) {
    for (const docId of knownDocIds) {
      try {
        const dRef = doc(db, colName, docId);
        const s = await getDoc(dRef);
        if (s.exists()) {
          console.log(`✅ Doc [${colName}/${docId}] exists!`);
          const data = s.data();
          if (data.aboutMe) console.log(`    aboutMe:`, JSON.stringify(data.aboutMe));
          if (data.biography) console.log(`    biography:`, JSON.stringify(data.biography));
        }
      } catch (e) {}
    }
  }
}

async function checkRealtimeDb() {
  console.log('\n=== Checking Realtime Database REST API ===');
  const urls = [
    'https://taimusic-96289-default-rtdb.firebaseio.com/.json',
    'https://taimusic-96289-default-rtdb.asia-southeast1.firebasedatabase.app/.json',
    'https://taimusic-96289.firebaseio.com/.json'
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        console.log(`✅ RTDB [${url}] returned data:`, JSON.stringify(data).substring(0, 500));
        if (data && typeof data === 'object') {
          const str = JSON.stringify(data);
          if (str.includes('aboutMe') || str.includes('biography') || str.includes('Phan Bội Châu')) {
            console.log('🔥 FOUND MATCHING PROFILE DATA IN RTDB!');
          }
        }
      } else {
        console.log(`RTDB [${url}] status: ${res.status}`);
      }
    } catch (e) {
      console.log(`RTDB error [${url}]:`, e.message);
    }
  }
}

async function main() {
  await checkRealtimeDb();
  await checkFirestore();
}

main().catch(console.error);
