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

const BUCKET_NAME = 'bbb-bz';

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.mp3') return 'audio/mpeg';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'application/octet-stream';
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

async function main() {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('No uploads directory found locally.');
    return;
  }

  const allFiles = getAllFiles(uploadsDir);
  console.log(`Found ${allFiles.length} files in local uploads folder. Syncing to Cloudflare R2...`);

  let count = 0;
  for (const filePath of allFiles) {
    const relativePath = path.relative(uploadsDir, filePath).replace(/\\/g, '/');
    const r2Key = `uploads/${relativePath}`;
    const fileContent = fs.readFileSync(filePath);
    const contentType = getContentType(filePath);

    try {
      console.log(`[${++count}/${allFiles.length}] Uploading ${r2Key} (${(fileContent.length / 1024 / 1024).toFixed(2)} MB)...`);
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: r2Key,
        Body: fileContent,
        ContentType: contentType
      }));
      console.log(`  Saved: https://cdn.bbb.bz/${r2Key}`);
    } catch (err) {
      console.error(` ❌ Error uploading ${r2Key}:`, err.message);
    }
  }

  console.log('\n✅ All local upload files successfully synced to Cloudflare R2!');
}

main();
