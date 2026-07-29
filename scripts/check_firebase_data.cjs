const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs } = require('firebase/firestore');

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

async function main() {
  console.log('=== Checking Firebase Firestore app_data collection ===');
  try {
    const colRef = collection(db, 'app_data');
    const snapshot = await getDocs(colRef);
    console.log(`Found ${snapshot.docs.length} documents in app_data:`);
    snapshot.docs.forEach(docSnap => {
      console.log(`\n--- Document ID: ${docSnap.id} ---`);
      const data = docSnap.data();
      console.log('Keys:', Object.keys(data));
      if (data.aboutMe) console.log('aboutMe:', data.aboutMe);
      if (data.biography) console.log('biography:', data.biography);
      if (data.artistName) console.log('artistName:', data.artistName);
      if (data.username) console.log('username:', data.username);
    });
  } catch (e) {
    console.error('Error fetching Firestore:', e);
  }
}

main().catch(console.error);
