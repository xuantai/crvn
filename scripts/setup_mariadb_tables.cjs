const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH Client Ready');

  const cmd = `
    sqlite3 /home/clp/htdocs/app/data/db.sq3 "SELECT * FROM site WHERE domain_name='bbb.bz';" 2>&1
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.on('close', (code) => {
      console.log('OUTPUT:\n', out);
      console.log('Code:', code);
      conn.end();
    });
  });
}).connect({
  host: '36.50.177.253',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123',
  readyTimeout: 30000
});
