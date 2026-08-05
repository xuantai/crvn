const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Load .env manually
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, 'utf-8');
  envText.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value.trim();
    }
  });
}

const r2AccountId = process.env.CF_R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.CF_R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.CF_R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.CF_R2_BUCKET_NAME || 'bbb-bz';

if (!r2AccountId || !r2AccessKeyId || !r2SecretAccessKey) {
  console.error('❌ R2 Credentials missing in .env');
  process.exit(1);
}

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey
  }
});

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function uploadFileToR2(localFilePath) {
  const relativePath = path.relative(path.join(__dirname, 'public'), localFilePath).replace(/\\/g, '/');
  const key = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;

  const ext = path.extname(localFilePath).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.webp') contentType = 'image/webp';
  else if (ext === '.mp3') contentType = 'audio/mpeg';

  const body = fs.readFileSync(localFilePath);

  try {
    await r2Client.send(new PutObjectCommand({
      Bucket: r2BucketName,
      Key: key,
      Body: body,
      ContentType: contentType
    }));
    console.log(`✅ Uploaded to R2: ${key}`);
  } catch (err) {
    console.error(`❌ Failed to upload ${key}:`, err.message);
  }
}

async function main() {
  const uploadsDir = path.join(__dirname, 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('No public/uploads directory found.');
    return;
  }

  const allFiles = getAllFiles(uploadsDir);
  console.log(`🚀 Found ${allFiles.length} files in public/uploads. Syncing to Cloudflare R2...`);

  for (const file of allFiles) {
    await uploadFileToR2(file);
  }

  console.log('🎉 R2 Sync completed successfully!');
}

main().catch(console.error);
