const apiKey = "AIzaSyAcml_QfgGTH80OKmRVj2tWIomEQUUiHB0";
const projectId = "taimusic-96289";

const collectionsToSearch = [
  'app_data', 'artists', 'users', 'profiles', 'configs', 'acxuantai', 'artist_acxuantai'
];

const keywords = [
  'Phan Bội Châu', 'Suzuki', 'Bunkyo', 'Hoàng Tử Quỷ', 'Vinhomes', 'Running'
];

async function searchCollection(col) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${col}?key=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`Firestore REST [${col}]: status ${res.status} ${res.statusText}`);
      return;
    }
    const data = await res.json();
    if (data.documents && data.documents.length > 0) {
      console.log(`✅ Firestore REST [${col}] found ${data.documents.length} documents:`);
      for (const doc of data.documents) {
        const docName = doc.name.split('/').pop();
        const jsonStr = JSON.stringify(doc.fields || {});
        console.log(`   - Doc [${docName}] size: ${jsonStr.length} chars`);
        for (const kw of keywords) {
          if (jsonStr.includes(kw)) {
            console.log(`🔥 FOUND KEYWORD "${kw}" IN FIRESTORE DOC [${col}/${docName}]!`);
            console.log(`   Full Doc Content:\n`, JSON.stringify(doc.fields, null, 2));
          }
        }
      }
    } else {
      console.log(`Firestore REST [${col}]: empty collection`);
    }
  } catch (e) {
    console.log(`Firestore REST error [${col}]:`, e.message);
  }
}

async function main() {
  console.log('=== SEARCHING FIREBASE FIRESTORE VIA REST API ===');
  for (const col of collectionsToSearch) {
    await searchCollection(col);
  }
}

main().catch(console.error);
