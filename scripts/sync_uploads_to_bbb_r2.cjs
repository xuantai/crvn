const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// R2 credentials for bbb-bz bucket
const r2AccountId = 'ed5771d045bec5ae12373a1dc5bb6985';
const r2AccessKeyId = '8ae592287e83828ec9c5b5aa468500e6';
const r2SecretAccessKey = 'd964617b9dd773a720b026987823fa43c6d358dd29d44bf36aeb7ef3c8cb9c59';
const r2BucketName = 'bbb-bz';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey
  }
});

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.mp3') return 'audio/mpeg';
  if (ext === '.wav') return 'audio/wav';
  if (ext === '.m4a') return 'audio/m4a';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

function getAllFilesRecursively(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFilesRecursively(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function main() {
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
  console.log(`==================================================`);
  console.log(`🚀 SYNCING ALL LOCAL UPLOADS TO R2 BUCKET: [${r2BucketName}]`);
  console.log(`==================================================\n`);

  const allFiles = getAllFilesRecursively(uploadsDir);
  console.log(`Found ${allFiles.length} files in public/uploads/\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < allFiles.length; i++) {
    const filePath = allFiles[i];
    const relPath = path.relative(path.join(__dirname, '..', 'public'), filePath).replace(/\\/g, '/');
    const mime = getMimeType(filePath);

    console.log(`[${i + 1}/${allFiles.length}] Uploading ${relPath} to bucket [${r2BucketName}]...`);

    try {
      const buffer = fs.readFileSync(filePath);
      await s3Client.send(new PutObjectCommand({
        Bucket: r2BucketName,
        Key: relPath,
        Body: buffer,
        ContentType: mime
      }));
      console.log(`  🎉 Success: ${relPath}`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ Failed to upload ${relPath}:`, err.message);
      failCount++;
    }
  }

  console.log(`\n==================================================`);
  console.log(`📊 Sync Summary for [${r2BucketName}]: ${successCount} succeeded, ${failCount} failed.`);
  console.log(`==================================================`);
}

main().catch(err => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
