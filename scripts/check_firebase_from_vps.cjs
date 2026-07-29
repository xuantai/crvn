const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO VPS - Running Firebase check script directly on VPS...');

  const cmd = `
    node -e '
      const { initializeApp } = require("/home/chorus/htdocs/chorus.vn/node_modules/firebase/app");
      const { getFirestore, doc, getDoc } = require("/home/chorus/htdocs/chorus.vn/node_modules/firebase/firestore");

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

      async function main() {
        console.log("=== FIRESTORE CHECK DIRECTLY FROM VPS ===");
        const paths = [
          ["app_data", "artist_acxuantai"],
          ["app_data", "main"],
          ["app_data", "landing"],
          ["app_data", "acxuantai"],
          ["artists", "acxuantai"]
        ];

        for (const [col, id] of paths) {
          try {
            const dRef = doc(db, col, id);
            const snap = await getDoc(dRef);
            if (snap.exists()) {
              console.log("🔥 FIRESTORE DOC FOUND [" + col + "/" + id + "]:");
              const d = snap.data();
              console.log("Keys:", Object.keys(d));
              if (d.aboutMe) console.log("aboutMe:", JSON.stringify(d.aboutMe, null, 2));
              if (d.biography) console.log("biography:", JSON.stringify(d.biography, null, 2));
            } else {
              console.log("Doc not found [" + col + "/" + id + "]");
            }
          } catch(e) {
            console.log("Error [" + col + "/" + id + "]:", e.message);
          }
        }
      }

      main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
    '
  `;

  conn.exec(cmd, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('stderr', d => out += d.toString());
    stream.on('close', () => {
      console.log(out);
      conn.end();
    });
  });
}).connect({
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  readyTimeout: 30000
});
