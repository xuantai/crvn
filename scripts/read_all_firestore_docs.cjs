const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "taimusic-96289",
  apiKey: "AIzaSyAcml_QfgGTH80OKmRVj2tWIomEQUUiHB0",
  authDomain: "taimusic-96289.firebaseapp.com",
  storageBucket: "taimusic-96289.firebasestorage.app",
  messagingSenderId: "848155741386",
  appId: "1:848155741386:web:4f5b5d826ce5fbbba8f833"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log('=== FETCHING FIRESTORE DOCUMENTS FOR ACXUANTAI ===');

  const docRefs = [
    doc(db, 'app_data', 'artist_acxuantai'),
    doc(db, 'app_data', 'acxuantai'),
    doc(db, 'artists', 'acxuantai'),
    doc(db, 'artists', 'sw69l6795go'),
    doc(db, 'users', 'acxuantai')
  ];

  for (const ref of docRefs) {
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        console.log(`\n✅ FOUND DOC [${ref.path}]:`);
        const d = snap.data();
        console.log('Keys:', Object.keys(d));
        if (d.biography) {
          console.log('FOUND BIOGRAPHY IN FIRESTORE:', JSON.stringify(d.biography, null, 2));
        } else {
          console.log('biography field:', d.biography);
        }
      } else {
        console.log(`❌ Doc [${ref.path}] does not exist.`);
      }
    } catch (e) {
      console.error(`Error reading ${ref.path}:`, e.message);
    }
  }

  // Try listing all docs in app_data collection
  try {
    console.log('\n=== LISTING ALL DOCUMENTS IN APP_DATA COLLECTION ===');
    const colRef = collection(db, 'app_data');
    const colSnap = await getDocs(colRef);
    console.log(`Total docs in app_data: ${colSnap.size}`);
    colSnap.forEach(docSnap => {
      console.log('Doc ID:', docSnap.id, 'Keys:', Object.keys(docSnap.data()));
      const d = docSnap.data();
      if (d.biography) {
        console.log(`---> Doc [${docSnap.id}] has BIOGRAPHY:`, JSON.stringify(d.biography, null, 2));
      }
    });
  } catch (e) {
    console.error('Error listing app_data:', e.message);
  }
}

run();
