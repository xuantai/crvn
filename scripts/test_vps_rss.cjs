const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready');
  conn.exec(`node -e "const https = require('https'); https.get('https://www.youtube.com/feeds/videos.xml?playlist_id=PLYhxSEggsw6pQynJA2XvQQ4tUG2z7zBNS', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => { let data = ''; res.on('data', chunk => data += chunk); res.on('end', () => console.log('HTTPS Module Success! Length:', data.length, 'Entries:', data.split('<entry>').length - 1)); });"`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end()).on('data', data => console.log('STDOUT:', data.toString())).stderr.on('data', data => console.log('STDERR:', data.toString()));
  });
}).connect({
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@'
});
