const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Client Ready');
  const cmd = `
    echo "=== NGINX CONFIGS FOR CHORUS & BBB ==="
    cat /etc/nginx/sites-enabled/* /etc/nginx/conf.d/* 2>/dev/null | grep -E "server_name|root|proxy_pass"
    
    echo "=== DIRECTORIES IN /home/tai and /var/www ==="
    ls -la /home/tai/ /home/tai/htdocs/ /var/www/ 2>/dev/null

    echo "=== CHECKING SQLITE TABLES IN bbb_global.db ==="
    sqlite3 /home/tai/htdocs/tai/bbb_global.db ".tables" 2>/dev/null
    sqlite3 /home/tai/htdocs/tai/bbb_global.db "SELECT username, extension, data_json FROM artists WHERE username='acxuantai';" 2>/dev/null

    echo "=== SEARCHING FOR PREVIOUS JSON BACKUPS ON VPS ==="
    find / -name "*acxuantai*.json" -o -name "*data.json*" 2>/dev/null
  `;

  conn.exec(cmd, (err, stream) => {
    stream.on('data', d => console.log(d.toString()));
    stream.on('stderr', d => console.log('STDERR:', d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({
  host: '36.50.177.253',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123',
  readyTimeout: 30000
});
