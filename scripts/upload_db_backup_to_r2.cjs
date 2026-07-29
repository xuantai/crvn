const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: 'https://ed5771d045bec5ae12373a1dc5bb6985.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: '8ae592287e83828ec9c5b5aa468500e6',
    secretAccessKey: 'd964617b9dd773a720b026987823fa43c6d358dd29d44bf36aeb7ef3c8cb9c59'
  }
});

async function main() {
  const dbFile = path.join(__dirname, 'bbb_global.db');
  if (!fs.existsSync(dbFile)) {
    console.error('bbb_global.db not found!');
    return;
  }

  console.log(`Uploading database backup bbb_global.db (${(fs.statSync(dbFile).size / 1024).toFixed(2)} KB) to Cloudflare R2...`);
  const content = fs.readFileSync(dbFile);

  await s3Client.send(new PutObjectCommand({
    Bucket: 'bbb-bz',
    Key: 'backups/db/bbb_global.db',
    Body: content,
    ContentType: 'application/x-sqlite3'
  }));

  console.log('✅ Database successfully backed up to Cloudflare R2: backups/db/bbb_global.db');
}

main().catch(err => {
  console.error('Error backing up DB to R2:', err);
});
