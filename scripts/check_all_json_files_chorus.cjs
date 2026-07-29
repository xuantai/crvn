const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ SSH CONNECTED TO CHORUS VPS [160.187.147.125]');

  const cmd = `
    echo "=== ALL JSON FILES IN CHORUS.VN ==="
    ls -la /home/chorus/htdocs/chorus.vn/*.json /home/chorus/htdocs/chorus.vn/*_backup* 2>/dev/null || true

    echo "=== CHECKING DATA_ACXUANTAI.JSON CONTENT ==="
    node -e "
      const fs = require('fs');
      const data = JSON.parse(fs.readFileSync('/home/chorus/htdocs/chorus.vn/data_acxuantai.json', 'utf-8'));
      console.log('aboutMe present:', !!data.aboutMe);
      if (data.aboutMe) {
        console.log('aboutMe name:', data.aboutMe.realName || data.aboutMe.artistName);
        console.log('aboutMe services count:', data.aboutMe.services ? data.aboutMe.services.length : 0);
        console.log('aboutMe portfolio count:', data.aboutMe.portfolio ? data.aboutMe.portfolio.length : 0);
      }
      console.log('biography present:', !!data.biography);
      if (data.biography) {
        console.log('biography education count:', data.biography.education ? data.biography.education.length : 0);
        console.log('biography experience count:', data.biography.experience ? data.biography.experience.length : 0);
      }
    "
  `;

  conn.exec(cmd, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('stderr', d => out += d.toString());
    stream.on('close', () => {
      console.log(out);
      conn.end();
    });
  });
}).connect({
  host: '160.187.147.125',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123@',
  readyTimeout: 30000
});
