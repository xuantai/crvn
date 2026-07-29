const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Client Ready');
  const cmd = `
    echo "=== STEP 1: Generating SSL Cert for bbb.bz & *.bbb.bz ==="
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
      -keyout /etc/nginx/ssl-certificates/bbb.bz.key \
      -out /etc/nginx/ssl-certificates/bbb.bz.crt \
      -subj "/C=VN/ST=HCM/L=HCM/O=CRVN/OU=IT/CN=bbb.bz" \
      -addext "subjectAltName = DNS:bbb.bz, DNS:*.bbb.bz, DNS:www.bbb.bz"

    chmod 600 /etc/nginx/ssl-certificates/bbb.bz.key
    chmod 644 /etc/nginx/ssl-certificates/bbb.bz.crt

    echo "=== STEP 2: Updating Nginx Config for HTTPS ==="
    cat << 'EOF' > /etc/nginx/sites-enabled/bbb.bz.conf
server {
  listen 80;
  listen [::]:80;
  listen 443 ssl;
  listen [::]:443 ssl;
  http2 on;
  ssl_certificate /etc/nginx/ssl-certificates/bbb.bz.crt;
  ssl_certificate_key /etc/nginx/ssl-certificates/bbb.bz.key;
  server_name www.bbb.bz;
  return 301 https://bbb.bz$request_uri;
}

server {
  listen 80;
  listen [::]:80;
  listen 443 ssl;
  listen [::]:443 ssl;
  http2 on;
  ssl_certificate /etc/nginx/ssl-certificates/bbb.bz.crt;
  ssl_certificate_key /etc/nginx/ssl-certificates/bbb.bz.key;
  server_name bbb.bz *.bbb.bz;
  root /home/tai/htdocs/tai;

  access_log /home/tai/logs/nginx/access.log main;
  error_log /home/tai/logs/nginx/error.log;

  location ~ /.well-known {
    auth_basic off;
    allow all;
  }

  include /etc/nginx/global_settings;

  index index.html;

  location / {
    proxy_pass http://127.0.0.1:3333;
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Host $host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_pass_request_headers on;
    proxy_max_temp_file_size 0;
    proxy_connect_timeout 900;
    proxy_send_timeout 900;
    proxy_read_timeout 900;
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;
    proxy_temp_file_write_size 256k;
  }
}
EOF

    echo "=== STEP 3: Testing and Reloading Nginx ==="
    nginx -t && systemctl reload nginx
    echo "=== STEP 4: Verification Curl HTTPS ==="
    curl -k -I https://127.0.0.1 -H "Host: bbb.bz"
    curl -k -I https://127.0.0.1 -H "Host: mxt.bbb.bz"
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
      .on('data', (d) => console.log(d.toString()))
      .on('stderr', (d) => console.log('STDERR: ' + d.toString()));
  });
}).connect({
  host: '36.50.177.253',
  port: 22,
  username: 'root',
  password: 'MatKhauDay123',
  readyTimeout: 30000
});
