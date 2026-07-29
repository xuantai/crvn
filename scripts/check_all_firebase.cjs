const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAcml_QfgGTH80OKmRVj2tWIomEQUUiHB0",
  authDomain: "taimusic-96289.firebaseapp.com",
  projectId: "taimusic-96289",
  storageBucket: "taimusic-96289.firebasestorage.app",
  messagingSenderId: "848155741386",
  appId: "1:848155741386:web:4f5b5d826ce5fbbba8f833"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const testDocPaths = [
  ['app_data', 'main'],
  ['app_data', 'landing'],
  ['app_data', 'artist_acxuantai'],
  ['app_data', 'acxuantai'],
  ['artists', 'acxuantai'],
  ['profiles', 'acxuantai'],
  ['users', 'acxuantai']
];

async function main() {
  console.log('=== Checking individual Firebase Firestore docs ===');
  for (const [col, id] of testDocPaths) {
    try {
      const docRef = doc(db, col, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        console.log(`✅ FOUND [${col}/${id}]:`, JSON.stringify(snap.data()).substring(0, 300));
        const data = snap.data();
        if (data.aboutMe) console.log(`   aboutMe in [${col}/${id}]:`, data.aboutMe);
        if (data.biography) console.log(`   biography in [${col}/${id}]:`, data.biography);
      } else {
        console.log(`❌ Not found [${col}/${id}]`);
      }
    } catch (e) {
      console.log(`⚠️ Error [${col}/${id}]:`, e.message);
    }
  }
}

main().catch(console.error);
