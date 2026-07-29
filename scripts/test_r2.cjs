const { S3Client, ListBucketsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: 'https://ed5771d045bec5ae12373a1dc5bb6985.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: '8ae592287e83828ec9c5b5aa468500e6',
    secretAccessKey: 'd964617b9dd773a720b026987823fa43c6d358dd29d44bf36aeb7ef3c8cb9c59'
  }
});

async function main() {
  console.log('=== Step 1: Listing Buckets in Cloudflare R2 ===');
  try {
    const bucketsRes = await s3Client.send(new ListBucketsCommand({}));
    console.log('Available Buckets:', bucketsRes.Buckets?.map(b => b.Name));

    if (bucketsRes.Buckets && bucketsRes.Buckets.length > 0) {
      const targetBucket = bucketsRes.Buckets[0].Name;
      console.log(`\n=== Step 2: Testing Test Upload to Bucket: ${targetBucket} ===`);
      await s3Client.send(new PutObjectCommand({
        Bucket: targetBucket,
        Key: 'test_r2_connection.txt',
        Body: 'Cloudflare R2 Connection Verified!',
        ContentType: 'text/plain'
      }));
      console.log(`✅ Upload test successful! Access via: https://cdn.bbb.bz/test_r2_connection.txt`);
    }
  } catch (err) {
    console.error('❌ R2 Test Error:', err);
  }
}

main();
