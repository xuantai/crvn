const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Cloudflare R2 credentials for chorus.vn (production)
const r2AccountId = process.env.CF_R2_ACCOUNT_ID || 'ed5771d045bec5ae12373a1dc5bb6985';
const r2AccessKeyId = process.env.CF_R2_ACCESS_KEY_ID || 'de9a5a092fded5861a3c66dc384752e9';
const r2SecretAccessKey = process.env.CF_R2_SECRET_ACCESS_KEY || 'd66bfcd930ae87db5ef6add59e18a784080de8b5be887f3f96aa4e84751cb564';
const r2BucketName = process.env.CF_R2_BUCKET_NAME || 'chorus-vn';
const r2PublicDomain = (process.env.CF_R2_PUBLIC_DOMAIN || 'https://cdn.chorus.vn').replace(/\/+$/, '');

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey
  }
});

async function uploadToR2(key, body, contentType) {
  try {
    const cleanKey = key.startsWith('/') ? key.substring(1) : key;
    await r2Client.send(new PutObjectCommand({
      Bucket: r2BucketName,
      Key: cleanKey,
      Body: body,
      ContentType: contentType
    }));
    console.log(`  ✅ R2 Uploaded: ${cleanKey}`);
    return `${r2PublicDomain}/${cleanKey}`;
  } catch (err) {
    console.error(`  ❌ R2 Upload Failed (${key}):`, err.message);
    return null;
  }
}

async function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = await getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
}

async function main() {
  const uploadsRoot = path.join(__dirname, '..', 'public', 'uploads');
  console.log(`🔍 Scanning all image files in ${uploadsRoot}...`);

  if (!fs.existsSync(uploadsRoot)) {
    console.log('Uploads root does not exist.');
    return;
  }

  const allFiles = await getAllFiles(uploadsRoot);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  let missingThumbsCount = 0;
  let uploadedCount = 0;

  for (const filePath of allFiles) {
    const ext = path.extname(filePath).toLowerCase();
    if (!imageExtensions.includes(ext)) continue;

    const fileName = path.basename(filePath);
    if (fileName.includes('-thumb.')) continue; // Skip existing thumb files

    const dirName = path.dirname(filePath);
    const baseNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    
    // Expected thumb filenames
    const thumbJpgName = `${baseNameWithoutExt}-thumb.jpg`;
    const thumbPngName = `${baseNameWithoutExt}-thumb.png`;
    const thumbWebpName = `${baseNameWithoutExt}-thumb.webp`;

    const thumbJpgPath = path.join(dirName, thumbJpgName);
    const thumbPngPath = path.join(dirName, thumbPngName);
    const thumbWebpPath = path.join(dirName, thumbWebpName);

    const hasJpgThumb = fs.existsSync(thumbJpgPath);
    const hasPngThumb = fs.existsSync(thumbPngPath);
    const hasWebpThumb = fs.existsSync(thumbWebpPath);

    const targetThumbPath = ext === '.png' ? thumbPngPath : thumbJpgPath;
    const targetThumbName = ext === '.png' ? thumbPngName : thumbJpgName;
    const isPng = ext === '.png';
    const contentType = isPng ? 'image/png' : 'image/jpeg';

    let thumbCreated = false;

    if (!hasJpgThumb && !hasPngThumb && !hasWebpThumb) {
      console.log(`⚠️ Missing thumb for: ${fileName}`);
      missingThumbsCount++;

      try {
        let sharpThumb = sharp(filePath).resize({ width: 400, withoutEnlargement: true });
        if (isPng) {
          sharpThumb = sharpThumb.png({ palette: true, quality: 80 });
        } else {
          sharpThumb = sharpThumb.jpeg({ quality: 75, progressive: true });
        }
        await sharpThumb.toFile(targetThumbPath);
        console.log(`  🔨 Generated local thumbnail: ${targetThumbName}`);
        thumbCreated = true;
      } catch (err) {
        console.error(`  ❌ Failed to generate thumb for ${fileName}:`, err.message);
      }
    }

    // Relative R2 Key (e.g. uploads/acxuantai/synced_1784985085441_7855.jpg)
    const relPath = path.relative(path.join(__dirname, '..', 'public'), filePath).replace(/\\/g, '/');
    const relThumbPath = path.relative(path.join(__dirname, '..', 'public'), targetThumbPath).replace(/\\/g, '/');

    // Upload main file to R2
    try {
      const fileBuf = fs.readFileSync(filePath);
      await uploadToR2(relPath, fileBuf, contentType);
      uploadedCount++;
    } catch (e) {
      console.error(`Error reading ${relPath}:`, e.message);
    }

    // Upload thumb file to R2 if it exists
    if (fs.existsSync(targetThumbPath)) {
      try {
        const thumbBuf = fs.readFileSync(targetThumbPath);
        await uploadToR2(relThumbPath, thumbBuf, contentType);
        uploadedCount++;
      } catch (e) {
        console.error(`Error reading ${relThumbPath}:`, e.message);
      }
    }
  }

  console.log(`\n🎉 Finished processing!`);
  console.log(`- Missing thumbs generated: ${missingThumbsCount}`);
  console.log(`- Files checked/uploaded to R2: ${uploadedCount}`);
}

main().catch(console.error);
