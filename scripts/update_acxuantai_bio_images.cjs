const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const dataPath = path.join(__dirname, 'data_acxuantai.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const firebaseUrlPrefix = 'https://firebasestorage.googleapis.com/v0/b/taimusic-96289.firebasestorage.app/o/uploads%2Fsw69l6795go%2F';
const firebaseUrlSuffix = '?alt=media';

const sw69Images = [
  '1783955141159-967503934-1783955141253.jpg',
  '1783955500260-672304252-1783955500301.jpg',
  '1783955564671-178036924-1783955564712.jpg',
  '1783955796031-83490701-1783955796033.jpg',
  '1783955948264-378652428-1783955948304.jpg',
  '1783956086007-863141582-1783956086048.jpg',
  '1783956371125-515679952-1783956371126.jpg',
  '1783956417069-234533079-1783956417070.jpg',
  '1783956444688-853972035-1783956444689.jpg',
  '1783956477270-813730882-1783956477312.jpg',
  '1783956536822-385937522-1783956536823.jpg',
  '1783956569715-985359410-1783956569756.jpg',
  '1783957240322-912199669-1783957240325.jpg',
  '1783957248822-219420486-1783957248823.jpg',
  '1783957254277-568212641-1783957254278.jpg',
  '1783957350628-819959144-1783957350629.jpg',
  '1783957367515-301552357-1783957367555.jpg',
  '1783957449263-817984458-1783957449265.jpg',
  '1783957452966-368448085-1783957452968.jpg',
  '1783957468996-27399708-1783957469036.jpg',
  '1783957529521-744223587-1783957529524.jpg',
  '1783957530934-344691863-1783957530976.jpg',
  '1783957531821-353457713-1783957531824.jpg'
].map(name => `${firebaseUrlPrefix}${name}${firebaseUrlSuffix}`);

if (!data.biography) data.biography = { education: [], experience: [] };
if (!data.biography.experience) data.biography.experience = [];

// Assign images to experience timeline entries
if (data.biography.experience.length > 0) {
  // Distribute the 23 images evenly across experience items
  let imgIdx = 0;
  data.biography.experience.forEach((exp, idx) => {
    const chunkCount = idx === 0 ? 3 : (idx === 5 || idx === 6 ? 3 : 2);
    const itemImages = sw69Images.slice(imgIdx, imgIdx + chunkCount);
    if (itemImages.length > 0) {
      exp.imageUrls = itemImages;
      exp.imageUrl = itemImages[0];
    }
    imgIdx += chunkCount;
  });
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log('✅ Updated local data_acxuantai.json with Firebase biography images!');

// Upload to Chorus VPS
const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125] - Syncing updated biography images...');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastPut(
      dataPath,
      '/home/chorus/htdocs/chorus.vn/data_acxuantai.json',
      (err) => {
        if (err) console.error('SFTP upload error:', err);
        else console.log('✅ Uploaded data_acxuantai.json to Chorus VPS!');

        conn.exec('pm2 restart chorusvn', (err, stream) => {
          let out = '';
          stream.on('data', d => out += d.toString());
          stream.on('stderr', d => out += d.toString());
          stream.on('close', () => {
            console.log(out);
            conn.end();
          });
        });
      }
    );
  });
}).connect({
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  readyTimeout: 30000
});
