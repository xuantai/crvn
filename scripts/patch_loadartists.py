import re

with open('server.ts', 'r') as f:
    code = f.read()

new_load_artists = """async function loadArtists() {
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
}"""

# regex replace the old loadArtists
code = re.sub(r'async function loadArtists\(\) \{.*?\n\}\n', new_load_artists + '\n', code, flags=re.DOTALL)

with open('server.ts', 'w') as f:
    f.write(code)

