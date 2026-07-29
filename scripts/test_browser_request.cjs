const https = require('https');

const options = {
  hostname: '36.50.177.253',
  port: 443,
  path: '/uploads/ym3q7whcri/1783178497886-324052359.mp3',
  method: 'GET',
  headers: {
    'Host': 'lynklee.bbb.bz',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Range': 'bytes=0-'
  },
  rejectUnauthorized: false
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
  let totalBytes = 0;
  res.on('data', chunk => {
    totalBytes += chunk.length;
  });
  res.on('end', () => {
    console.log(`Downloaded ${totalBytes} bytes successfully.`);
  });
});

req.on('error', (e) => {
  console.error(`ERROR: ${e.message}`);
});

req.end();
