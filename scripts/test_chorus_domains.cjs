const https = require('https');
const http = require('http');

async function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { rejectUnauthorized: false }, (res) => {
      console.log(`[${res.statusCode}] ${url}`);
      resolve(res.statusCode);
    });
    req.on('error', (err) => {
      console.log(`[ERR: ${err.message}] ${url}`);
      resolve(null);
    });
    req.setTimeout(5000, () => {
      req.abort();
      console.log(`[TIMEOUT] ${url}`);
      resolve(null);
    });
  });
}

async function run() {
  await checkUrl('https://chorus.vn');
  await checkUrl('https://xn--ti-jia.vn');
  await checkUrl('https://acxuantai.chorus.vn');
}

run();
